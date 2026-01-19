import { loadEnv } from './env'
import { listCharactersByUser } from './characters'
import { getUserIdFromRequest } from './auth'
import { initializeTelemetry, withSpan } from './telemetry'
import { handleChatRequest } from './chat'

function addCorsHeaders(response: Response): Response {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

function resolvePort(env: Record<string, string>): number {
  const directPort = env.SERVER_PORT || env.PORT
  if (directPort) {
    const parsed = Number(directPort)
    if (!Number.isNaN(parsed) && parsed > 0) return parsed
  }

  const publicServer = env.NEXT_PUBLIC_SERVER
  if (publicServer) {
    try {
      const url = new URL(publicServer)
      if (url.port) {
        const parsed = Number(url.port)
        if (!Number.isNaN(parsed) && parsed > 0) return parsed
      }
    } catch {
      // ignore invalid URL
    }
  }

  return 4848
}

await initializeTelemetry()
const env = loadEnv()
const port = resolvePort(env)

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return addCorsHeaders(new Response(null, { status: 204 }))
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return addCorsHeaders(new Response('ok'))
    }

    if (request.method === 'GET' && url.pathname === '/characters') {
      return withSpan('http.GET /characters', async (span) => {
        span.setAttribute('http.route', '/characters')
        try {
          const userId = await getUserIdFromRequest(request)
          if (!userId) {
            return addCorsHeaders(Response.json({ error: 'Unauthorized' }, { status: 401 }))
          }

          const characters = await listCharactersByUser(userId)
          return addCorsHeaders(Response.json({ data: characters }))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          return addCorsHeaders(Response.json({ error: message }, { status: 500 }))
        }
      })
    }

    if (url.pathname === '/chat') {
      return handleChatRequest(request)
    }

    return addCorsHeaders(new Response('Not found', { status: 404 }))
  },
})

console.log(`Server running on http://localhost:${server.port}`)
