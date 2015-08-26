export default createTextHandler

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

    res.setHeader('Content-Type', contentType)
    res.statusCode = 200
    res.end(text)
  }
}
