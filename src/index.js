import fs from 'fs'

import commuter from 'commuter'

export default createStaticServer

function createStaticServer (frock, logger, options = {}) {
  const {contentType, file, dir, defaultHeaders = {}} = options

  let router

  if (dir) {
    // TODO use directory handler
  } else {
    router = commuter(fileHandler, options.baseUrl)
  }

  router.end = () => {}

  return router

  function fileHandler (req, res) {
    const handle = fs.createReadStream(file)

    Object.keys(defaultHeaders).forEach(h => {
      res.setHeader(h, defaultHeaders[h])
    })

    if (contentType) {
      res.setHeader('Content-Type', contentType)
    } else {
      // TODO infer content type
    }

    res.on('close', () => {
      handle.end()
    })

    handle.pipe(res)

    logger('info', `serving ${file}`)
  }
}
