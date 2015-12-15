const test = require('tape')
const proxyquire = require('proxyquire')
const through = require('through')

const fs = {}
const log = {
  debug: () => {},
  error: () => {}
}

const lib = proxyquire(
  '../../lib/handlers/file',
  {
    'fs': fs,
    '@noCallThru': true
  }
)

test(`setup ${__filename}`, t => {
  t.plan(1)
  t.pass('set it up')
})

test('can serve static file', t => {
  t.plan(4)

  const expectedFileContents = 'contents'
  const expectedFileName = 'some/file/here.txt'
  const response = through(write)
  const handler = lib(log, {file: expectedFileName})

  response.setHeader = setHeader

  fs.createReadStream = createReadStream

  handler(void 0, response)

  function write (data) {
    t.equal(data, expectedFileContents)
  }

  function setHeader (header, content) {
    t.equal(header.toLowerCase(), 'content-type')
    t.equal(content, 'application/json')
  }

  function createReadStream (fileName) {
    const stream = through()

    t.equal(fileName, expectedFileName)

    process.nextTick(() => stream.queue(expectedFileContents))

    return stream
  }
})

test('can set content type', t => {
  t.plan(3)

  const contentType = 'text/json'
  const response = through(write)
  const handler = lib(log, {file: 'whatever', contentType})

  response.setHeader = setHeader

  fs.createReadStream = createReadStream

  handler(void 0, response)

  function write () {
    t.pass('got content')
  }

  function setHeader (header, content) {
    t.equal(header.toLowerCase(), 'content-type')
    t.equal(content, contentType)
  }

  function createReadStream () {
    const stream = through()

    process.nextTick(() => stream.queue('anything'))

    return stream
  }
})

test('will infer content type if explicitly unset', t => {
  t.plan(3)

  const contentType = 'text/plain; charset=utf-8'
  const response = through(write)
  const handler = lib(log, {file: 'whatever.txt', contentType: null})

  response.setHeader = setHeader

  fs.createReadStream = createReadStream

  handler(void 0, response)

  function write () {
    t.pass('got content')
  }

  function setHeader (header, content) {
    t.equal(header.toLowerCase(), 'content-type')
    t.equal(content, contentType)
  }

  function createReadStream () {
    const stream = through()

    process.nextTick(() => stream.queue('anything'))

    return stream
  }
})

test('can set additional headers', t => {
  t.plan(1)

  const responseHeaders = {'X-Whatever': 'whatever'}
  const expectedHeaders = {
    'Content-Type': 'application/json',
    'X-Whatever': 'whatever'
  }
  const seenHeaders = {}
  const response = through(write)
  const handler = lib(log, {file: 'whatever', responseHeaders})

  response.setHeader = setHeader

  fs.createReadStream = createReadStream

  handler(void 0, response)

  function write () {
    t.deepEqual(seenHeaders, expectedHeaders)
  }

  function setHeader (header, content) {
    seenHeaders[header] = content
  }

  function createReadStream () {
    const stream = through()

    process.nextTick(() => stream.queue('anything'))

    return stream
  }
})

test(`teardown ${__filename}`, t => {
  t.plan(1)
  t.pass('tore it down')
})
