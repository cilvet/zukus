import { supabase } from './supabaseClient'
import { withSpan } from './telemetry'

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization')
  if (!header) return null

  const [scheme, token] = header.split(' ')
  if (!scheme || !token) return null
  if (scheme.toLowerCase() !== 'bearer') return null

  return token.trim()
}

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const token = extractBearerToken(request)
  if (!token) return null

  return withSpan('supabase.auth.getUser', async (span) => {
    span.setAttribute('auth.hasToken', true)
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) {
      span.setAttribute('auth.success', false)
      return null
    }

    span.setAttribute('auth.success', true)
    return data.user.id
  })
}
