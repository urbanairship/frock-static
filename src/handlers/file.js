import fs from 'fs'

import mime from 'mime-types'

export default createFileHandler

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

    res.on('close', () => handle.end())

    handle.on('error', onError)
    handle.pipe(res)

    logger.info(`serving local ${file}`)

    function onError (err) {
      logger.info(`error while serving local ${file}: ${err}`, err)

      res.statusCode = 500
      res.end(err.toString())
    }
  }
}
