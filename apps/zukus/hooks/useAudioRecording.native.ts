import { useState, useRef, useCallback, useEffect } from 'react'
import {
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
  type RecordingStatus,
} from 'expo-audio'
import type { UseAudioRecordingResult } from './useAudioRecording.types'

const METERING_HISTORY_SIZE = 20
const METERING_UPDATE_INTERVAL = 100

export function useAudioRecording(): UseAudioRecordingResult {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [meteringData, setMeteringData] = useState<number[]>([])

  const meteringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const recordingOptions = {
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  }

  const recordingStatusUpdate = useCallback((status: RecordingStatus) => {
    if (status.isRecording && status.metering !== undefined) {
      // Metering viene en dB, normalizamos a 0-1
      // Los valores tipicos van de -160 (silencio) a 0 (maximo)
      const normalized = Math.max(0, Math.min(1, (status.metering + 60) / 60))
      setMeteringData((prev) => {
        const next = [...prev, normalized]
        if (next.length > METERING_HISTORY_SIZE) {
          return next.slice(-METERING_HISTORY_SIZE)
        }
        return next
      })
    }
  }, [])

  const recorder = useAudioRecorder(recordingOptions, recordingStatusUpdate)

  useEffect(() => {
    return () => {
      if (meteringIntervalRef.current) {
        clearInterval(meteringIntervalRef.current)
      }
    }
  }, [])

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
