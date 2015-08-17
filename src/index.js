import fs from 'fs'
import {parse} from 'url'
import http from 'http'

import commuter from 'commuter'
import mime from 'mime-types'

export default createStaticServer

function createStaticServer (frock, logger, options = {}) {
  const {
    contentType = 'application/json',
    file,
    url,
    responseHeaders = {}
  } = options

  let router

  if (url) {
    router = commuter(urlHandler, options.baseUrl)
  } else {
    router = commuter(fileHandler, options.baseUrl)
  }

  router._fileHandler = fileHandler
  router._urlHandler = urlHandler
  router.validate = validate
  router.end = () => {}

  return router

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

    res.on('close', () => {
      handle.end()
    })

    handle.pipe(res)

    logger('info', `serving local ${file}`)

    function onError (err) {
      logger('error', `error while serving local ${file}: ${err}`, err)

      res.statusCode = 500
      res.end(err.toString())
    }
  }

  function urlHandler (req, res) {
    let requestUri = url

    if (typeof url === 'object') {
      requestUri = parse(url)
    }

    const handle = http.request(requestUri, remoteRes => {
      if (contentType) {
        res.setHeader('Content-Type', contentType)
      }

      Object.keys(responseHeaders).forEach(h => {
        res.setHeader(h, responseHeaders[h])
      })

      remoteRes.on('error', onError)
      res.on('close', () => remoteRes.end())

      remoteRes.pipe(res)

      logger('info', `serving remote ${url}`)
    })

    handle.end()

    function onError (err) {
      logger('error', `error while serving remote ${file}: ${err}`, err)
      res.end(err.toString())
    }
  }
}

function validate ({file, url}) {
  if (!file && !url) {
    const msg = 'One of either `file` or `url` are required'
    return {
      file: msg,
      url: msg
    }
  }
}
