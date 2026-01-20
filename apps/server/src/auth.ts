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

export type AuthUser = {
  id: string
  email: string | null
  name: string | null
}

export async function getUserFromRequest(request: Request): Promise<AuthUser | null> {
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
    const user = data.user
    const metadata = user.user_metadata as Record<string, unknown> | undefined
    const name = (metadata?.full_name ?? metadata?.name ?? null) as string | null

    return {
      id: user.id,
      email: user.email ?? null,
      name,
    }
  })
}

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const user = await getUserFromRequest(request)
  return user?.id ?? null
}
