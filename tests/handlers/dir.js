/**
 * Copyright 2015 Urban Airship Inc. and Contributors. Subject to the LICENSE
 * file at the top-level directory of this distribution and at
 * https://github.com/urbanairship/frock-static/blob/master/LICENSE
 */
const test = require('tape')
const proxyquire = require('proxyquire')
const through = require('through')

const fs = {}
const log = {
  debug: () => {},
  error: () => {}
}

const lib = proxyquire(
  '../../lib/handlers/dir',
  {
    'fs': fs,
    '@noCallThru': true
  }
)

test(`setup ${__filename}`, t => {
  t.plan(1)
  t.pass('set it up')
})

test('can serve static file from dir', t => {
  t.plan(4)

  const expectedFileContents = 'contents'
  const dir = 'some/dir'
  const file = 'file.txt'
  const expectedFileName = 'some/dir/file.txt'
  const request = {
    splats: [file]
  }
  const response = through(write)
  const handler = lib(log, {dir})

  response.setHeader = setHeader

  fs.createReadStream = createReadStream

  handler(request, response)

  function write (data) {
    t.equal(data, expectedFileContents)
  }

  function setHeader (header, content) {
    t.equal(header.toLowerCase(), 'content-type')
    t.equal(content, 'text/plain; charset=utf-8')
  }

  function createReadStream (fileName) {
    const stream = through()

    t.equal(fileName, expectedFileName)

    process.nextTick(() => stream.queue(expectedFileContents))

    return stream
  }
})

test('404s on filestream error', t => {
  t.plan(1)

  const request = {
    splats: ['dontcare.txt']
  }
  const response = through(null, end)
  const handler = lib(log, {dir: 'wherever'})

  response.setHeader = () => {}

  fs.createReadStream = createReadStream

  handler(request, response)

  function end () {
    t.equal(response.statusCode, 404)
  }

  function createReadStream () {
    const stream = through()

    process.nextTick(() => stream.emit('error', 'wups'))

    return stream
  }
})

test(`teardown ${__filename}`, t => {
  t.plan(1)
  t.pass('tore it down')
})

