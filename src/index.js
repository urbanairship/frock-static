import fs from 'fs'
import {parse} from 'url'
import http from 'http'
import path from 'path'

import commuter from 'commuter'
import mime from 'mime-types'

export default createStaticServer

function createStaticServer (frock, logger, options = {}) {
  const {
    contentType = 'application/json',
    file,
    url,
    dir,
    responseHeaders = {}
  } = options

  let router

  if (url) {
    router = commuter(urlHandler, options.baseUrl)
  } else if (dir) {
    router = commuter(dirHandler, options.baseUrl)
  } else if (file) {
    router = commuter(fileHandler, options.baseUrl)
  } else {
    throw new Error(
      'static: No recognized handlers were present in the configuration ' +
      'object (looked for one of `url`, `file`, `dir`)'
    )
  }

  router._fileHandler = fileHandler
  router._urlHandler = urlHandler
  router._dirHandler = dirHandler
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

  function dirHandler (req, res) {
    const pathname = parse(req.url).pathname

    let localPath = path.join(dir, pathname.slice(options.baseUrl.length))

    logger('info', `serving local dir ${localPath}`)

    if (!localPath) {
      onError(new Error('path was empty'))

      return
    }

    const handler = fs.createReadStream(localPath)

    res.setHeader('Content-Type', mime.contentType(path.extname(localPath)))

    handler.on('error', onError)
    handler.pipe(res)

    function onError (err) {
      logger('error', `error while serving from dir ${localPath}: ${err}`, err)

      res.statusCode = 404
      res.end(err.toString())
    }
  }
}

createStaticServer.validate = validate

function validate ({file, url}) {
  if (!file && !url) {
    const msg = 'One of either `file` or `url` are required'
    return {
      file: msg,
      url: msg
    }
  }
}
