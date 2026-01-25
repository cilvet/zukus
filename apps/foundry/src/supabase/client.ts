import { createClient } from '@supabase/supabase-js'

// Public keys - security is handled by RLS (Row Level Security)
const SUPABASE_URL = 'https://utimatychnwjuxogjfwc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0aW1hdHljaG53anV4b2dqZndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNTQ5MDUsImV4cCI6MjA0ODczMDkwNX0.sX1qPfTgXAtOvsCNpk40nOjc6Bo6GonnGAPyaD3KCp4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
