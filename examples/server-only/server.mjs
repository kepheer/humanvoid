import { createServer } from 'node:http'
import { detect } from '../../dist/server/index.js'

const server = createServer(async (request, response) => {
  const result = await detect(
    {
      headers: request.headers,
      ip: request.socket.remoteAddress ?? null,
      requestRate: null,
    },
    { verifyCrawler: false },
  )

  response.writeHead(200, { 'content-type': 'application/json' })
  response.end(JSON.stringify(result, null, 2))
})

server.listen(3000, '127.0.0.1', () => console.log('Open http://127.0.0.1:3000'))
