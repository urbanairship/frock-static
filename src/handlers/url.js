import http from 'http'
import https from 'https'
import {parse} from 'url'

export default createUrlHandler

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

    if (requestUri.protocol === 'https') {
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

      logger.info(`serving remote ${url}`)
    })

    handle.end()

    function onError (err) {
      logger.error(`error while serving remote ${url}: ${err}`, err)
      res.end(err.toString())
    }
  }
}
