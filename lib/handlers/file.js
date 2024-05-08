/**
 * Copyright 2015 Urban Airship Inc. and Contributors. Subject to the LICENSE
 * file at the top-level directory of this distribution and at
 * https://github.com/urbanairship/frock-static/blob/master/LICENSE
 */
const fs = require('fs')

const mime = require('mime-types')

module.exports = createFileHandler

function createFileHandler (
  logger,
  {
    file,
    contentType = 'application/json',
    responseHeaders = {}
  }
) {
  return fileHandler

  function fileHandler (req, res) {
    const handle = fs.createReadStream(file)

    let contentTypeHeader = contentType

    Object.keys(responseHeaders).forEach(h => {
      res.setHeader(h, responseHeaders[h])
    })

    if (!contentTypeHeader) {
      contentTypeHeader = mime.contentType(file)

      if (!contentTypeHeader) {
        onError(new Error('Could not infer content type'))

        return
      }
    }

    res.setHeader('Content-Type', contentTypeHeader)

    res.on('close', () => handle.close())

    handle.on('error', onError)
    handle.pipe(res)

    logger.debug(`serving local ${file}`)

    function onError (err) {
      logger.error(`error while serving local ${file}: ${err}`, err)

      res.statusCode = 500
      res.end(err.toString())
    }
  }
}
