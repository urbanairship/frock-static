/**
 * Copyright 2015 Urban Airship Inc. and Contributors. Subject to the LICENSE
 * file at the top-level directory of this distribution and at
 * https://github.com/urbanairship/frock-static/blob/master/LICENSE
 */
const http = require('http')
const https = require('https')
const {parse} = require('url')

module.exports = createUrlHandler

function createUrlHandler (
  logger,
  {
    url,
    contentType = 'application/json',
    responseHeaders = {},
    strictSsl = true
  }
) {
  return urlHandler

  function urlHandler (req, res) {
    let requestUri = url
    let request = http.request

    if (typeof url !== 'object') {
      requestUri = parse(url)
    }

    if (requestUri.protocol && requestUri.protocol.includes('https')) {
      request = https.request
      requestUri.rejectUnauthorized = strictSsl
    }

    const handle = request(requestUri, remoteRes => {
      if (contentType) {
        res.setHeader('Content-Type', contentType)
      }

      Object.keys(responseHeaders).forEach(h => {
        res.setHeader(h, responseHeaders[h])
      })

      remoteRes.on('error', onError)
      res.on('close', () => remoteRes.end())

      remoteRes.pipe(res)

      logger.debug(`serving remote ${url}`)
    })

    handle.end()

    function onError (err) {
      logger.error(`error while serving remote ${url}: ${err}`, err)
      res.end(err.toString())
    }
  }
}
