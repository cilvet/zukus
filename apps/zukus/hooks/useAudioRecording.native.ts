import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioModule,
} from 'expo-audio'
import type { UseAudioRecordingResult } from './useAudioRecording.types'

const METERING_HISTORY_SIZE = 20
const METERING_POLL_INTERVAL = 100

export function useAudioRecording(): UseAudioRecordingResult {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [meteringData, setMeteringData] = useState<number[]>([])

  // Workaround para metering: pasar opciones CON isMeteringEnabled al hook,
  // y llamar prepareToRecordAsync() SIN argumentos
  // Ver: https://github.com/expo/expo/issues/37241
  const recorderOptions = useMemo(
    () => ({
      ...RecordingPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    }),
    []
  )

  const recorder = useAudioRecorder(recorderOptions)
  const recorderState = useAudioRecorderState(recorder, METERING_POLL_INTERVAL)

  // Actualizar metering cuando cambia el estado del recorder
  useEffect(() => {
    if (recorderState.isRecording && recorderState.metering !== undefined) {
      // Metering viene en dB, normalizamos a 0-1
      // Los valores tipicos van de -160 (silencio) a 0 (maximo)
      const normalized = Math.max(0, Math.min(1, (recorderState.metering + 60) / 60))
      setMeteringData((prev) => {
        const next = [...prev, normalized]
        if (next.length > METERING_HISTORY_SIZE) {
          return next.slice(-METERING_HISTORY_SIZE)
        }
        return next
      })
    }
  }, [recorderState.isRecording, recorderState.metering])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const status = await AudioModule.requestRecordingPermissionsAsync()
    const granted = status.granted
    setHasPermission(granted)
    return granted
  }, [])

  const startRecording = useCallback(async () => {
    if (hasPermission === null) {
      const granted = await requestPermission()
      if (!granted) return
    } else if (!hasPermission) {
      return
    }

    try {
      setMeteringData([])
      // NO pasar opciones aqui - deben ir en useAudioRecorder()
      await recorder.prepareToRecordAsync()
      recorder.record()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }, [hasPermission, requestPermission, recorder])

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!isRecording) return null

    try {
      await recorder.stop()
      setIsRecording(false)
      return recorder.uri ?? null
    } catch (error) {
      console.error('Failed to stop recording:', error)
      setIsRecording(false)
      return null
    }
  }, [isRecording, recorder])

  const cancelRecording = useCallback(() => {
    if (!isRecording) return

    try {
      recorder.stop()
    } catch {
      // Ignorar errores al cancelar
    }
    setIsRecording(false)
    setMeteringData([])
  }, [isRecording, recorder])

  return {
    isRecording,
    hasPermission,
    meteringData,
    startRecording,
    stopRecording,
    cancelRecording,
    requestPermission,
  }
}
