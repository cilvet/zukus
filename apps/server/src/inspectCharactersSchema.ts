import { supabase } from './supabaseClient'

async function inspectCharactersSchema(): Promise<void> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .limit(1)

  if (error) {
    throw error
  }

  if (!data || data.length === 0) {
    console.log('No rows found in public.characters to infer columns')
    return
  }

  const row = data[0] as Record<string, unknown>
  const columnNames = Object.keys(row).sort()

  console.log('Columns inferred from a sample row in public.characters:')
  for (const name of columnNames) {
    console.log(`- ${name}`)
  }
}

inspectCharactersSchema().catch((error) => {
  console.error('Schema inspection failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
