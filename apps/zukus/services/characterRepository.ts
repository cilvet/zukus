import type { CharacterBaseData } from '@zukus/core'
import { supabase } from './supabaseClient'

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

export type CharacterDetailRecord = {
  id: string
  characterData: CharacterBaseData
  modified: string | null
}

export const characterRepository = {
  listByUser: async (): Promise<CharacterListItem[]> => {
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
        const characterData = row.character_data as (CharacterBaseData & { imageUrl?: string }) | null
        if (!characterData) return null
        return {
          id: row.id as string,
          name: characterData.name ?? 'Sin nombre',
          imageUrl: characterData.imageUrl ?? null,
          build: getBuildString(characterData),
          modified: (row.modified as string | null) ?? null,
        }
      })
      .filter((item): item is CharacterListItem => Boolean(item))
      .sort((a, b) => a.name.localeCompare(b.name))
  },

  getById: async (id: string): Promise<CharacterDetailRecord | null> => {
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
  },

  save: async (id: string, data: CharacterBaseData, deviceId?: string): Promise<void> => {
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
  },

  subscribe: (
    id: string, 
    onChange: (data: CharacterBaseData, deviceId: string | null) => void
  ): (() => void) => {
    /**
     * AVISO: NO CAMBIAR - Ver .cursor/rules/code/supabase-sync.mdc
     * 
     * Nombre único para evitar conflictos con suscripciones que aún no se han limpiado.
     * 
     * Razón: React StrictMode monta/desmonta componentes en desarrollo.
     * Las suscripciones antiguas pueden seguir recibiendo eventos brevemente después
     * de unsubscribe(). El channel único evita conflictos entre suscripciones.
     */
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
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  },
}
