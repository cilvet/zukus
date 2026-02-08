import type { CharacterBaseData } from '@zukus/core'
import { getBuildString } from '@zukus/core'
import { supabase } from './supabaseClient'
import { withSpan } from './telemetry'

type CharacterRow = {
  id: string
  character_data: CharacterBaseData | null
  modified: string | null
}

export type CharacterListItem = {
  id: string
  name: string
  imageUrl: string | null
  build: string | null
  modified: string | null
}

export async function listCharactersByUser(userId: string): Promise<CharacterListItem[]> {
  return withSpan('supabase.characters.list', async (span) => {
    span.setAttribute('characters.userId', userId)
    const { data, error } = await supabase
      .from('characters')
      .select('id, character_data, modified')
      .eq('user_id', userId)
      .neq('_deleted', true)

    if (error) {
      throw error
    }

    if (!data) return []

    const items = (data as CharacterRow[])
      .map((row) => {
        const characterData = row.character_data
        if (!characterData) return null
        return {
          id: row.id,
          name: characterData.name ?? 'Sin nombre',
          imageUrl: characterData.imageUrl ?? null,
          build: getBuildString(characterData),
          modified: row.modified ?? null,
        }
      })
      .filter((item): item is CharacterListItem => Boolean(item))

    span.setAttribute('characters.count', items.length)
    return items
  })
}
