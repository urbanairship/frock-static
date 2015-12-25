/**
 * Copyright 2015 Urban Airship Inc. and Contributors. Subject to the LICENSE
 * file at the top-level directory of this distribution and at
 * https://github.com/urbanairship/frock-static/blob/master/LICENSE
 */
module.exports = createJsonHandler

function createJsonHandler (
  logger,
  {
    json,
    contentType = 'application/json',
    responseHeaders = {}
  }
) {
  return jsonHandler

  function jsonHandler (req, res) {
    Object.keys(responseHeaders).forEach(h => {
      res.setHeader(h, responseHeaders[h])
    })

    logger.debug(`serving json content`)

    res.json(json, 200, {contentType})
  }
}
