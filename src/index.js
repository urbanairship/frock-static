try {
  require('babel-polyfill')
} catch (e) {
  // babel polyfill throws if it's ever included in any other module
}

const extend = require('xtend')

const fileHandler = require('./handlers/file')
const dirHandler = require('./handlers/dir')
const urlHandler = require('./handlers/url')
const textHandler = require('./handlers/text')
const jsonHandler = require('./handlers/json')

module.exports = createStaticServer

function createStaticServer (frock, logger, options = {}) {
  const handlers = new Map([
    ['file', fileHandler],
    ['dir', dirHandler],
    ['url', urlHandler],
    ['text', textHandler],
    ['json', jsonHandler]
  ])

  const routes = options.routes || []
  const router = frock.router(e404)

  if (routes.length) {
    routes.forEach(route => {
      const opts = extend(options, route)

      router.any(route.path, statusHandler(opts, getHandler(opts)))
    })
  } else {
    router.any('*', statusHandler(options, getHandler(options)))
  }

  // exports for testing
  router._getHandler = getHandler
  router._statusHandler = statusHandler

  router.end = (ready = noop) => {
    logger.debug('ending')
    ready()
  }

  return router

  function getHandler (opts) {
    for (let key of handlers.keys()) {
      if (opts[key]) {
        return handlers.get(key)(logger, opts)
      }
    }

    throw new Error(
      'static: No recognized handlers were present in the configuration object'
    )
  }

  function statusHandler (opts, route) {
    let status = 200

    if (opts && opts.status) {
      status = Math.abs(Number(opts.status))

      if (Number.isNaN(status)) {
        throw new Error(`static: status "${opts.status}" is not a number`)
      }
    }

    return _route

    function _route (req, res) {
      res.statusCode = status

      route(req, res)
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
