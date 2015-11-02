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
