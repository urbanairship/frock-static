import fs from 'fs'
import path from 'path'

import mime from 'mime-types'

export default createDirHandler

function createDirHandler (logger, {dir}) {
  return dirHandler

  function dirHandler (req, res) {
    let localPath = path.join(dir, req.splats[0])

    logger('info', `serving local dir ${localPath}`)

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
      logger('error', `error while serving from dir ${localPath}: ${err}`, err)

      res.statusCode = 404
      res.end(err.toString())
    }
  }
}
