import commuter from 'commuter'
import extend from 'xtend'

import fileHandler from './handlers/file'
import dirHandler from './handlers/dir'
import urlHandler from './handlers/url'
import textHandler from './handlers/text'
import jsonHandler from './handlers/json'

export default createStaticServer

function createStaticServer (frock, logger, options = {}) {
  const routes = options.routes || []
  const router = commuter(e404, options.baseUrl)

  if (routes.length) {
    routes.forEach(route => {
      router.any(route.path, getHandler(extend(options, route)))
    })
  } else {
    router.any('*', getHandler(options))
  }

  router._fileHandler = fileHandler
  router._urlHandler = urlHandler
  router._dirHandler = dirHandler
  router._textHandler = textHandler
  router._jsonHandler = jsonHandler
  router.end = (ready = noop) => {
    logger.debug('ending')
    ready()
  }

  return router

  function getHandler (opts) {
    if (opts.url) {
      return urlHandler(logger, opts)
    } else if (opts.dir) {
      return dirHandler(logger, opts)
    } else if (opts.file) {
      return fileHandler(logger, opts)
    } else if (opts.text) {
      return textHandler(logger, opts)
    } else if (opts.json) {
      return jsonHandler(logger, opts)
    } else {
      throw new Error(
        'static: No recognized handlers were present in the configuration ' +
        'object (looked for one of `url`, `file`, `dir`, `text`, `json`)'
      )
    }
  }
}

createStaticServer.validate = validate

function validate ({file, url, dir, text, json, routes = []}) {
  if (routes.length && routes.some(validate)) {
    return {routes: 'There was an error in your sub-routes'}
  } else if (!file && !url && !dir && !json && !text) {
    const msg = 'One of either `file`, `url`, `dir`, `text`, or `json` are required'
    return {
      file: msg,
      url: msg,
      dir: msg,
      json: msg,
      text: msg
    }
  }
}

function e404 (req, res) {
  res.statusCode = 404
  res.end('no routes matched')
}

function noop () {
  // nope
}
