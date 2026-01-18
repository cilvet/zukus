import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { calculateCharacterSheet, type CharacterBaseData } from '@zukus/core'
import { useAuth } from '../contexts'
import { useCharacterStore } from '../ui/stores/characterStore'
import { SupabaseCharacterRepository } from '../services/characterRepository'

type CharacterSyncState = {
  isLoading: boolean
  error: string | null
}

/**
 * Identificador único de este dispositivo/sesión.
 * Se usa para ignorar echos de nuestros propios cambios que llegan desde Supabase Realtime.
 */
const DEVICE_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

export function useCharacterSync(characterId: string): CharacterSyncState {
  const { session } = useAuth()
  const setCharacter = useCharacterStore((state) => state.setCharacter)
  const clearCharacter = useCharacterStore((state) => state.clearCharacter)
  const setSyncHandler = useCharacterStore((state) => state.setSyncHandler)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const repository = useMemo(() => new SupabaseCharacterRepository(), [])
  
  // Sistema de queue para serializar saves y evitar race conditions
  const saveInProgressRef = useRef(false)
  const pendingDataRef = useRef<CharacterBaseData | null>(null)

  const doSave = useCallback(
    async (data: CharacterBaseData) => {
      console.log('[SYNC] Guardando con deviceId:', DEVICE_ID)
      try {
        await repository.save(characterId, data, DEVICE_ID)
        console.log('[SYNC] Guardado OK')
      } catch (err) {
        console.warn('[SYNC] Error guardando:', err)
      }
    },
    [characterId, repository],
  )

  const processQueue = useCallback(async () => {
    if (saveInProgressRef.current) return
    
    const data = pendingDataRef.current
    if (!data) return
    
    pendingDataRef.current = null
    saveInProgressRef.current = true
    
    await doSave(data)
    
    saveInProgressRef.current = false
    
    // Si hay más cambios pendientes, procesarlos
    if (pendingDataRef.current) {
      processQueue()
    }
  }, [doSave])

  const persistBaseData = useCallback(
    (data: CharacterBaseData) => {
      // Siempre guardamos el estado más reciente como pendiente
      pendingDataRef.current = data
      // Intentamos procesar la queue
      processQueue()
    },
    [processQueue],
  )

  useEffect(() => {
    if (!characterId) {
      setSyncHandler(null)
      setIsLoading(false)
      setError('Personaje invalido')
      return
    }

    setSyncHandler(persistBaseData)
    return () => {
      setSyncHandler(null)
    }
  }, [persistBaseData, setSyncHandler])

  useEffect(() => {
    if (!session || !characterId) return

    let isMounted = true
    setIsLoading(true)
    setError(null)

    repository
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
    const unsubscribe = repository.subscribe(characterId, (data, deviceId) => {
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
  }, [characterId, clearCharacter, repository, session, setCharacter])

  return { isLoading, error }
}
