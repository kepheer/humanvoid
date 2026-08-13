import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, extname, join, normalize, resolve, sep } from 'node:path'
import { detect, issueChallenge } from '../../dist/server/index.js'

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = resolve(CURRENT_DIR, '../..')
const DEFAULT_PORT = 4173
const DEFAULT_HOST = '127.0.0.1'
const MAX_PAYLOAD_BYTES = 64 * 1024
const HARNESS_SECRET = 'humanvoid-e2e-harness-secret'
const ALLOWED_DIRS = [join(ROOT_DIR, 'dist'), join(ROOT_DIR, 'harness', 'page')]

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
}

const resolveContentType = (path) => CONTENT_TYPES[extname(path)] ?? 'application/octet-stream'
const isInsideAllowedDir = (path, dir) => path === dir || path.startsWith(dir + sep)
const isPathAllowed = (path) => ALLOWED_DIRS.some((dir) => isInsideAllowedDir(path, dir))

const readBody = (request) =>
  new Promise((resolvePromise, rejectPromise) => {
    const chunks = []
    let byteLength = 0

    request.on('data', (chunk) => {
      byteLength += chunk.length

      if (byteLength > MAX_PAYLOAD_BYTES) {
        rejectPromise(new Error('payload too large'))
        request.destroy()
        return
      }

      chunks.push(chunk)
    })
    request.on('end', () => resolvePromise(Buffer.concat(chunks).toString('utf8')))
    request.on('error', rejectPromise)
  })

const sendJson = (response, status, value) => {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  response.end(JSON.stringify(value))
}

const createNonceStore = () => {
  const nonces = new Map()

  return (nonce, exp) => {
    const now = Date.now()

    for (const [knownNonce, knownExp] of nonces) {
      if (knownExp <= now) {
        nonces.delete(knownNonce)
      }
    }

    if (nonces.has(nonce)) {
      return false
    }

    nonces.set(nonce, exp)
    return true
  }
}

const handleStaticRequest = async (request, response) => {
  const requestedPath = request.url === '/' ? '/harness/page/index.html' : request.url.split('?')[0]
  const targetPath = resolve(normalize(join(ROOT_DIR, requestedPath)))

  if (isPathAllowed(targetPath) === false) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  try {
    const fileContents = await readFile(targetPath)
    response.writeHead(200, { 'content-type': resolveContentType(targetPath) })
    response.end(fileContents)
  } catch {
    response.writeHead(404)
    response.end('Not found')
  }
}

export const startServer = (port = DEFAULT_PORT, host = DEFAULT_HOST) => {
  const consumeNonce = createNonceStore()
  const server = createServer(async (request, response) => {
    try {
      if (request.method === 'GET' && request.url === '/challenge') {
        sendJson(response, 200, { challenge: issueChallenge(HARNESS_SECRET) })
        return
      }

      if (request.method === 'POST' && request.url === '/verify') {
        const body = await readBody(request)
        let payload = null

        try {
          payload = JSON.parse(body)
        } catch {
          // Let the server classify malformed JSON as an invalid payload.
        }

        const result = await detect(
          {
            payload,
            headers: request.headers,
            ip: request.socket.remoteAddress ?? null,
            requestRate: null,
          },
          {
            secret: HARNESS_SECRET,
            payloadPolicy: 'required',
            consumeNonce,
            verifyCrawler: false,
          },
        )

        sendJson(response, 200, result)
        return
      }

      await handleStaticRequest(request, response)
    } catch (error) {
      const status = error instanceof Error && error.message === 'payload too large' ? 413 : 500
      sendJson(response, status, { error: status === 413 ? 'Payload too large' : 'Internal error' })
    }
  })

  return new Promise((resolvePromise) => {
    server.listen(port, host, () => resolvePromise(server))
  })
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url)

if (isMainModule === true) {
  const port = Number(process.env.PORT ?? DEFAULT_PORT)
  const host = process.env.HOST ?? DEFAULT_HOST

  startServer(port, host).then(() => {
    console.log(`harness server listening on http://${host}:${port}`)
  })
}
