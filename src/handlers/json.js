export default createJsonHandler

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

    res.json(json, 200, {contentType})
  }
}
