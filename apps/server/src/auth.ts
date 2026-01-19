import { supabase } from './supabaseClient'

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

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return null

  return data.user.id
}
