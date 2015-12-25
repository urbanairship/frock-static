/**
 * Copyright 2015 Urban Airship Inc. and Contributors. Subject to the LICENSE
 * file at the top-level directory of this distribution and at
 * https://github.com/urbanairship/frock-static/blob/master/LICENSE
 */
const test = require('tape')
const httpMocks = require('node-mocks-http')

const lib = require('../../lib/handlers/text')

const logger = {
  debug: () => {}
}

test(`setup ${__filename}`, t => {
  t.plan(1)
  t.pass('set it up')
})

test('responds with provided text', t => {
  t.plan(3)

  const response = httpMocks.createResponse()
  const expected = 'ok, sure'
  const handler = lib(logger, {text: expected})

  response.end = (data) => {
    t.deepEqual(data, expected)
    t.equal(response.statusCode, 200)
    t.equal(response.getHeader('content-type', 'text/plain'))
  }

  handler(void 0, response)
})

test('can override content type', t => {
  t.plan(1)

  const response = httpMocks.createResponse()
  const contentType = 'text/fancy'
  const handler = lib(logger, {text: 'dontcare', contentType})

  response.end = () => {
    t.equal(response.getHeader('content-type', contentType))
  }

  handler(void 0, response)
})

test('can set other headers', t => {
  t.plan(1)

  const response = httpMocks.createResponse()
  const responseHeaders = {'X-Whatever': 'whatever'}
  const handler = lib(logger, {text: 'dontcare', responseHeaders})

  response.end = () => {
    t.equal(response.getHeader('x-whatever', 'whatever'))
  }

  handler(void 0, response)
})

test(`teardown ${__filename}`, t => {
  t.plan(1)
  t.pass('tore it down')
})
