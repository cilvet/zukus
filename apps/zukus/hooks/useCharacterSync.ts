import { useEffect, useRef, useState } from 'react'
import { InteractionManager } from 'react-native'
import { calculateCharacterSheet, type CharacterBaseData } from '@zukus/core'
import { useAuth } from '../contexts'
import { useCharacterStore, setSyncHandler, clearSyncHandlerIfMatch } from '../ui/stores/characterStore'
import { characterRepository } from '../services/characterRepository'
import { initializeSystemLevels } from '../ui/components/character/editor/levelEditorHelpers'

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

      const saveStart = performance.now()
      console.log('[SYNC] Guardando con deviceId:', DEVICE_ID)
      try {
        await characterRepository.save(characterId, data, DEVICE_ID)
        console.log(`[SYNC] Guardado OK (${(performance.now() - saveStart).toFixed(1)}ms)`)
      } catch (err) {
        console.warn('[SYNC] Error guardando:', err)
      }

      saveInProgressRef.current = false

      if (pendingDataRef.current) {
        processQueue()
      }
    }

    const handler = (data: CharacterBaseData) => {
      const handlerStart = performance.now()
      pendingDataRef.current = data
      // Diferir el guardado para no interrumpir animaciones
      InteractionManager.runAfterInteractions(() => {
        processQueue()
      })
      console.log(`[SYNC] Handler sync work: ${(performance.now() - handlerStart).toFixed(1)}ms`)
    }

    // Establecer el handler (función global, no en el store state)
    setSyncHandler(handler)

    return () => {
      // Solo limpiar si el handler actual sigue siendo el nuestro
      // (evita que el cleanup de A borre el handler de B al navegar rápido)
      clearSyncHandlerIfMatch(handler)
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
        const enrichedData = initializeSystemLevels(record.characterData)
        const sheet = calculateCharacterSheet(enrichedData)
        setCharacter(sheet, enrichedData)
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
      // Usamos InteractionManager para no bloquear animaciones en curso
      console.log('[SYNC] Aplicando cambio de otro dispositivo (esperando interacciones)')
      InteractionManager.runAfterInteractions(() => {
        if (!isMounted) return
        const enrichedData = initializeSystemLevels(data)
        const sheet = calculateCharacterSheet(enrichedData)
        setCharacter(sheet, enrichedData)
      })
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
