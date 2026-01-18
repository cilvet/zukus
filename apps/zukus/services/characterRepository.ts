import type { CharacterBaseData } from '@zukus/core'
import { supabase } from './supabaseClient'

export type CharacterListItem = {
  id: string
  name: string
  modified: string | null
}

export type CharacterDetailRecord = {
  id: string
  characterData: CharacterBaseData
  modified: string | null
}

export class SupabaseCharacterRepository {
  async listByUser(): Promise<CharacterListItem[]> {
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
          name: characterData.name ?? 'Sin nombre',
          modified: (row.modified as string | null) ?? null,
        }
      })
      .filter((item): item is CharacterListItem => Boolean(item))
  }

  async getById(id: string): Promise<CharacterDetailRecord | null> {
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

  async save(id: string, data: CharacterBaseData, deviceId?: string): Promise<void> {
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

  subscribe(
    id: string, 
    onChange: (data: CharacterBaseData, deviceId: string | null) => void
  ): () => void {
    // Nombre único para evitar conflictos con suscripciones que aún no se han limpiado
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
  }
}
