/**
 * Copyright 2015 Urban Airship Inc. and Contributors. Subject to the LICENSE
 * file at the top-level directory of this distribution and at
 * https://github.com/urbanairship/frock-static/blob/master/LICENSE
 */
try {
  require('babel-polyfill')
} catch (e) {
  // babel polyfill throws if it's ever included in any other module
}

// queue individual handler tests
require('./handlers/json')
require('./handlers/text')
require('./handlers/url')
require('./handlers/file')
require('./handlers/dir')

const test = require('tape')
const proxyquire = require('proxyquire')
const commuter = require('commuter')
const httpMock = require('node-mocks-http')

const lib = proxyquire(
  '../lib',
  {
    './handlers/file': handlerMock('file'),
    './handlers/dir': handlerMock('dir'),
    './handlers/url': handlerMock('url'),
    './handlers/text': handlerMock('text'),
    './handlers/json': handlerMock('json'),
    '@noCallThru': true
  }
)

const frock = {
  router: commuter
}

const log = {
  debug: () => {},
  error: () => {}
}

test(`setup ${__filename}`, t => {
  t.plan(1)
  t.pass('set it up')
})

test('creates handler from config', t => {
  t.plan(2)

  const config = {
    file: 'fixtures/static/people.json',
    contentType: 'application/json'
  }
  const expected = {
    file: 'fixtures/static/people.json',
    contentType: 'application/json',
    returnVal: 'file'
  }

  const request = httpMock.createRequest({
    method: 'GET',
    url: '/doesntmatterlol'
  })
  const response = httpMock.createResponse()
  const handler = lib(frock, log, config)

  handler(request, response)

  t.equal(response.statusCode, 200)
  t.deepEqual(JSON.parse(response._getData()), expected)
})

test('creates multiple handlers from routed config', t => {
  t.plan(6)

  const config = {
    routes: [
      {
        path: 'people',
        file: 'fixtures/static/people.json'
      },
      {
        path: 'places',
        file: 'fixtures/static/places.json'
      },
      {
        path: 'things',
        url: 'https://raw.github.com/someone/something/file.json'
      }
    ]
  }

  const handler = lib(frock, log, config)

  let request
  let response
  let data

  // people route
  request = httpMock.createRequest({
    method: 'GET',
    url: 'people'
  })
  response = httpMock.createResponse()

  handler(request, response)
  data = JSON.parse(response._getData())
  delete data.routes  // delete parts we don't care about to make assertion smaller

  t.equal(response.statusCode, 200)
  t.deepEqual(
    data,
    {
      path: 'people',
      file: 'fixtures/static/people.json',
      returnVal: 'file'
    }
  )

  // places route
  request = httpMock.createRequest({
    method: 'GET',
    url: 'places'
  })
  response = httpMock.createResponse()

  handler(request, response)
  data = JSON.parse(response._getData())
  delete data.routes  // delete parts we don't care about to make assertion smaller

  t.equal(response.statusCode, 200)
  t.deepEqual(
    data,
    {
      path: 'places',
      file: 'fixtures/static/places.json',
      returnVal: 'file'
    }
  )

  // things route
  request = httpMock.createRequest({
    method: 'GET',
    url: 'things'
  })
  response = httpMock.createResponse()

  handler(request, response)
  data = JSON.parse(response._getData())
  delete data.routes  // delete parts we don't care about to make assertion smaller

  t.equal(response.statusCode, 200)
  t.deepEqual(
    data,
    {
      path: 'things',
      url: 'https://raw.github.com/someone/something/file.json',
      returnVal: 'url'
    }
  )
})

test('can override status code', t => {
  t.plan(1)

  const config = {
    file: 'fixtures/static/people.json',
    contentType: 'application/json',
    status: 201
  }

  const request = httpMock.createRequest({
    method: 'GET',
    url: '/doesntmatterlol'
  })
  const response = httpMock.createResponse()
  const handler = lib(frock, log, config)

  handler(request, response)

  t.equal(response.statusCode, 201)
})

test(`teardown ${__filename}`, t => {
  t.plan(1)
  t.pass('tore it down')
})

function handlerMock (returnVal) {
  return function createHandler (frock, options) {
    return function handler (req, res) {
      res.setHeader('content-type', 'application/json')
      res.write(JSON.stringify(Object.assign({}, options, {returnVal})))
      res.end()
    }
  }
}
