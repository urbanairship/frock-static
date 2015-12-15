const test = require('tape')
const proxyquire = require('proxyquire')
const through = require('through')

const http = {}
const https = {}
const log = {
  debug: () => {},
  error: () => {}
}

const lib = proxyquire(
  '../../lib/handlers/url',
  {
    'http': http,
    'https': https,
    '@noCallThru': true
  }
)

test(`setup ${__filename}`, t => {
  t.plan(1)
  t.pass('set it up')
})

test(`can request from http endpoint`, t => {
  t.plan(5)

  http.request = mockRequest

  const expectedUrl = 'http://whatever.com/'
  const expectedContent = 'sure, fine'
  const handler = lib(log, {url: expectedUrl})
  const response = through(write)

  response.setHeader = setHeader

  handler(void 0, response)

  function write (data) {
    t.equal(data, expectedContent)
  }

  function setHeader (header, content) {
    t.equal(header.toLowerCase(), 'content-type')
    t.equal(content, 'application/json')
  }

  function mockRequest (url, ready) {
    const input = through(null, end)
    const output = through()

    t.equal(url.href, expectedUrl, 'requests expected url')

    process.nextTick(() => {
      ready(output)
      output.queue(expectedContent)
    })

    return input

    function end () {
      t.pass('end called')
    }
  }
})

test(`can set headers`, t => {
  t.plan(1)

  http.request = mockRequest

  const responseHeaders = {'X-Whatever': 'whatever'}
  const expectedHeaders = {
    'X-Whatever': 'whatever',
    'Content-Type': 'application/json'
  }
  const seenHeaders = {}

  const handler = lib(log, {url: 'bluh', responseHeaders})
  const response = through(write)

  response.setHeader = setHeader

  handler(void 0, response)

  function write () {
    t.deepEqual(seenHeaders, expectedHeaders)
  }

  function setHeader (header, content) {
    seenHeaders[header] = content
  }

  function mockRequest (url, ready) {
    const input = through()
    const output = through()

    process.nextTick(() => {
      ready(output)
      output.queue('doesntmatterlol')
    })

    return input
  }
})

test(`can request https`, t => {
  t.plan(2)

  http.request = () => t.fail('should not call http')
  https.request = mockRequest

  const handler = lib(log, {url: 'https://something.com'})
  const response = through(write)

  response.setHeader = () => {}

  handler(void 0, response)

  function write () {
    t.ok('request completed')
  }

  function mockRequest (url, ready) {
    const input = through()
    const output = through()

    t.pass('called request')

    process.nextTick(() => {
      ready(output)
      output.queue('doesntmatterlol')
    })

    return input
  }
})

test(`teardown ${__filename}`, t => {
  t.plan(1)
  t.pass('tore it down')
})
