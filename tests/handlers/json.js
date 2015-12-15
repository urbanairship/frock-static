const test = require('tape')
const httpMocks = require('node-mocks-http')

const lib = require('../../lib/handlers/json')

const logger = {
  debug: () => {}
}

test(`setup ${__filename}`, t => {
  t.plan(1)
  t.pass('set it up')
})

test('responds with provided json', t => {
  t.plan(3)

  const response = httpMocks.createResponse()
  const expected = {beep: 'boop'}
  const handler = lib(logger, {json: dup(expected)})

  response.json = (data, status, opts) => {
    t.deepEqual(data, expected)
    t.equal(status, 200)
    t.deepEqual(opts, {contentType: 'application/json'})
  }

  handler(void 0, response)
})

test('can override content type', t => {
  t.plan(1)

  const response = httpMocks.createResponse()
  const contentType = 'text/json'
  const handler = lib(logger, {json: {}, contentType})

  response.json = (json, status, opts) => {
    t.deepEqual(opts, {contentType})
  }

  handler(void 0, response)
})

test('can set other headers', t => {
  t.plan(1)

  const response = httpMocks.createResponse()
  const responseHeaders = {'X-Whatever': 'whatever'}
  const handler = lib(logger, {json: {}, responseHeaders})

  response.json = () => {
    t.equal(response.getHeader('x-whatever', 'whatever'))
  }

  handler(void 0, response)
})

test(`teardown ${__filename}`, t => {
  t.plan(1)
  t.pass('tore it down')
})

function dup (obj) {
  return JSON.parse(JSON.stringify(obj))
}
