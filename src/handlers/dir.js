/**
 * Copyright 2015 Urban Airship Inc. and Contributors. Subject to the LICENSE
 * file at the top-level directory of this distribution and at
 * https://github.com/urbanairship/frock-static/blob/master/LICENSE
 */
const fs = require('fs')
const path = require('path')

const mime = require('mime-types')

module.exports = createDirHandler

function createDirHandler (logger, {dir}) {
  return dirHandler

  function dirHandler (req, res) {
    let localPath = path.join(dir, req.splats[0])

    logger.debug(`serving local dir ${localPath}`)

    if (!localPath) {
      onError(new Error('path was empty'))

      return
    }

    const handler = fs.createReadStream(localPath)

    res.setHeader('Content-Type', mime.contentType(path.extname(localPath)))

    res.on('close', () => handler.end())

    handler.on('error', onError)
    handler.pipe(res)

    function onError (err) {
      logger.error(`error while serving from dir ${localPath}: ${err}`, err)

      res.statusCode = 404
      res.end(err.toString())
    }
  }
}
