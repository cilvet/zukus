import { supabase } from './supabaseClient'

type CharacterBaseData = {
  name?: string
  imageUrl?: string
  level?: {
    levelsData?: { classUniqueId: string }[]
  }
  classes?: { uniqueId: string; name: string }[]
}

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

function getBuildString(characterData: CharacterBaseData): string | null {
  const levelsData = characterData.level?.levelsData
  if (!levelsData || levelsData.length === 0) return null

  const classLevels = new Map<string, number>()
  for (const levelData of levelsData) {
    const current = classLevels.get(levelData.classUniqueId) || 0
    classLevels.set(levelData.classUniqueId, current + 1)
  }

  const parts = Array.from(classLevels.entries()).map(([classId, levels]) => {
    const className = characterData.classes?.find((c) => c.uniqueId === classId)?.name || classId
    return `${className} ${levels}`
  })

  return parts.join(' / ')
}

export async function listCharactersByUser(userId: string): Promise<CharacterListItem[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('id, character_data, modified')
    .eq('user_id', userId)
    .neq('_deleted', true)

  if (error) {
    throw error
  }

  if (!data) return []

  return (data as CharacterRow[])
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
}
