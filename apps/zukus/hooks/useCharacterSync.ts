import { useEffect, useRef, useState } from 'react'
import { calculateCharacterSheet, type CharacterBaseData } from '@zukus/core'
import { useAuth } from '../contexts'
import { useCharacterStore, setSyncHandler } from '../ui/stores/characterStore'
import { characterRepository } from '../services/characterRepository'

type CharacterSyncState = {
  isLoading: boolean
  error: string | null
}

/**
 * AVISO: NO CAMBIAR - Ver .cursor/rules/code/supabase-sync.mdc
 * 
 * Identificador único de este dispositivo/sesión.
 * Se usa para ignorar echos de nuestros propios cambios que llegan desde Supabase Realtime.
 * 
 * Razón: Supabase Realtime notifica TODOS los cambios, incluyendo los que nosotros hicimos.
 * Sin esto, aplicaríamos nuestros propios cambios dos veces.
 */
const DEVICE_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

export function useCharacterSync(characterId: string): CharacterSyncState {
  const { session } = useAuth()
  const setCharacter = useCharacterStore((state) => state.setCharacter)
  const clearCharacter = useCharacterStore((state) => state.clearCharacter)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * AVISO: NO CAMBIAR - Ver .cursor/rules/code/supabase-sync.mdc
   * 
   * Sistema de queue para serializar saves y evitar race conditions.
   * Solo UN save en progreso a la vez. Los cambios que llegan mientras hay un save
   * activo se acumulan, y solo se envía el estado más reciente.
   * 
   * Razón: Sin esto, saves concurrentes pueden llegar a Supabase en orden incorrecto,
   * causando que un estado viejo sobrescriba uno nuevo.
   */
  const saveInProgressRef = useRef(false)
  const pendingDataRef = useRef<CharacterBaseData | null>(null)
  
  // Establecer el handler de sincronización
  useEffect(() => {
    if (!characterId) return
    
    const processQueue = async () => {
      if (saveInProgressRef.current) return
      
      const data = pendingDataRef.current
      if (!data) return
      
      pendingDataRef.current = null
      saveInProgressRef.current = true
      
      console.log('[SYNC] Guardando con deviceId:', DEVICE_ID)
      try {
        await characterRepository.save(characterId, data, DEVICE_ID)
        console.log('[SYNC] Guardado OK')
      } catch (err) {
        console.warn('[SYNC] Error guardando:', err)
      }
      
      saveInProgressRef.current = false
      
      if (pendingDataRef.current) {
        processQueue()
      }
    }
    
    const handler = (data: CharacterBaseData) => {
      pendingDataRef.current = data
      processQueue()
    }
    
    // Establecer el handler (función global, no en el store state)
    setSyncHandler(handler)
    
    return () => {
      setSyncHandler(null)
    }
  }, [characterId])

  useEffect(() => {
    if (!session || !characterId) return

    /**
     * AVISO: NO CAMBIAR - Ver .cursor/rules/code/supabase-sync.mdc
     * 
     * Flag para ignorar eventos después de desmontar.
     * 
     * Razón: Las suscripciones antiguas pueden seguir recibiendo eventos
     * brevemente después de unsubscribe(). Este flag evita procesar eventos obsoletos.
     */
    let isMounted = true
    setIsLoading(true)
    setError(null)

    characterRepository
      .getById(characterId)
      .then((record) => {
        if (!isMounted) return
        if (!record) {
          setError('Personaje no encontrado')
          setIsLoading(false)
          return
        }
        const sheet = calculateCharacterSheet(record.characterData)
        setCharacter(sheet, record.characterData)
        setIsLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        const message = err instanceof Error ? err.message : 'Error al cargar personaje'
        setError(message)
        setIsLoading(false)
      })

    console.log('[SYNC] Creando suscripción para:', characterId)
    const unsubscribe = characterRepository.subscribe(characterId, (data, deviceId) => {
      console.log('[SYNC] Evento recibido:', { deviceId, myDeviceId: DEVICE_ID, isMounted })
      
      // Ignorar eventos si el componente ya se desmontó
      if (!isMounted) {
        console.log('[SYNC] Ignorando - componente desmontado')
        return
      }
      
      // Si el cambio viene de este mismo dispositivo, es un echo y lo ignoramos
      if (deviceId === DEVICE_ID) {
        console.log('[SYNC] Ignorando echo propio')
        return
      }

      // Es un cambio de otro dispositivo, lo aplicamos
      console.log('[SYNC] Aplicando cambio de otro dispositivo')
      const sheet = calculateCharacterSheet(data)
      setCharacter(sheet, data)
    })

    return () => {
      console.log('[SYNC] Eliminando suscripción para:', characterId)
      isMounted = false
      unsubscribe()
      clearCharacter()
    }
  }, [characterId, clearCharacter, session, setCharacter])

  return { isLoading, error }
}
