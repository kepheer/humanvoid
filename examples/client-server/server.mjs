import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { detect, issueChallenge } from '../../dist/server/index.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const secret = 'replace-this-example-secret'

const readBody = (request) =>
  new Promise((resolve, reject) => {
    const chunks = []
    request.on('data', (chunk) => chunks.push(chunk))
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    request.on('error', reject)
  })

const server = createServer(async (request, response) => {
  if (request.url === '/' && request.method === 'GET') {
    const html = await readFile(join(currentDir, 'index.html'))
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(html)
    return
  }

  if (request.url === '/challenge' && request.method === 'GET') {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ challenge: issueChallenge(secret) }))
    return
  }

  if (request.url === '/verify' && request.method === 'POST') {
    const rawBody = await readBody(request)
    let payload = null
    try {
      payload = JSON.parse(rawBody)
    } catch {
      // Let the server classify malformed JSON as an invalid payload.
    }

    const result = await detect(
      { payload, headers: request.headers, ip: request.socket.remoteAddress ?? null, requestRate: null },
      { secret, payloadPolicy: 'required', verifyCrawler: false },
    )
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify(result, null, 2))
    return
  }

  response.writeHead(404)
  response.end()
})

server.listen(3000, '127.0.0.1', () => console.log('Open http://127.0.0.1:3000'))
