import { createClient } from '@supabase/supabase-js'
import { loadEnv } from './env'

function resolveSupabaseUrl(env: Record<string, string>): string | null {
  const candidates = [env.EXPO_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_URL]
  for (const value of candidates) {
    if (value && value.startsWith('http')) {
      return value
    }
  }

  return null
}

const env = loadEnv()
const supabaseUrl = resolveSupabaseUrl(env)
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase env vars: EXPO_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
