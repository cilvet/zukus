import type { CharacterBaseData } from '@zukus/core'
import { supabase } from './client'

export type ZukusCharacterListItem = {
  id: string
  name: string
  build: string | null
  modified: string | null
}

function getBuildString(characterData: CharacterBaseData): string | null {
  // Try new level system first
  if (characterData.levelSlots && characterData.levelSlots.length > 0) {
    const classLevels = new Map<string, number>()
    for (const slot of characterData.levelSlots) {
      if (slot.classId) {
        const current = classLevels.get(slot.classId) || 0
        classLevels.set(slot.classId, current + 1)
      }
    }

    const parts = Array.from(classLevels.entries()).map(([classId, levels]) => {
      const className = characterData.classEntities?.[classId]?.name || classId
      return `${className} ${levels}`
    })

    return parts.length > 0 ? parts.join(' / ') : null
  }

  // Fall back to legacy level system
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

export type ZukusCharacterDetail = {
  id: string
  characterData: CharacterBaseData
  modified: string | null
}

/**
 * List all characters for the current user.
 */
export async function listCharacters(): Promise<ZukusCharacterListItem[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('id, character_data, modified')
    .neq('_deleted', true)

  if (error) {
    throw error
  }

  if (!data) return []

  return data
    .map((row) => {
      const characterData = row.character_data as CharacterBaseData | null
      if (!characterData) return null
      return {
        id: row.id as string,
        name: characterData.name ?? 'Unnamed',
        build: getBuildString(characterData),
        modified: (row.modified as string | null) ?? null,
      }
    })
    .filter((item): item is ZukusCharacterListItem => Boolean(item))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get a character by ID.
 */
export async function getCharacter(id: string): Promise<ZukusCharacterDetail | null> {
  const { data, error } = await supabase
    .from('characters')
    .select('id, character_data, modified')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  if (!data?.character_data) return null

  return {
    id: data.id as string,
    characterData: data.character_data as CharacterBaseData,
    modified: (data.modified as string | null) ?? null,
  }
}

/**
 * Save character data to Supabase.
 * @param id - Character ID in Supabase
 * @param data - CharacterBaseData to save
 * @param deviceId - Optional device ID for echo suppression
 */
export async function saveCharacter(
  id: string,
  data: CharacterBaseData,
  deviceId?: string
): Promise<void> {
  const dataWithDevice = deviceId
    ? { ...data, _deviceId: deviceId }
    : data

  const { error } = await supabase
    .from('characters')
    .update({
      character_data: dataWithDevice,
      modified: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw error
  }
}

/**
 * Subscribe to real-time changes for a character.
 * @param id - Character ID in Supabase
 * @param onChange - Callback when character data changes
 * @returns Unsubscribe function
 */
export function subscribeToCharacter(
  id: string,
  onChange: (data: CharacterBaseData, deviceId: string | null) => void
): () => void {
  // Unique channel name to avoid conflicts
  const channelName = `character-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'characters',
        filter: `id=eq.${id}`,
      },
      (payload) => {
        const row = payload.new as {
          character_data?: (CharacterBaseData & { _deviceId?: string }) | null
        } | null

        if (row?.character_data) {
          const { _deviceId, ...characterData } = row.character_data
          onChange(characterData as CharacterBaseData, _deviceId ?? null)
        }
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}
