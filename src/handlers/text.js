/**
 * Copyright 2015 Urban Airship Inc. and Contributors. Subject to the LICENSE
 * file at the top-level directory of this distribution and at
 * https://github.com/urbanairship/frock-static/blob/master/LICENSE
 */
module.exports = createTextHandler

function createTextHandler (
  logger,
  {
    text,
    contentType = 'text/plain',
    responseHeaders = {}
  }
) {
  return jsonHandler

  function jsonHandler (req, res) {
    Object.keys(responseHeaders).forEach(h => {
      res.setHeader(h, responseHeaders[h])
    })

    logger.debug(`serving text content`)

    res.setHeader('Content-Type', contentType)
    res.statusCode = 200
    res.end(text)
  }
}
