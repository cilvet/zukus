import { useState, useRef, useCallback, useEffect } from 'react'
import type { UseAudioRecordingResult } from './useAudioRecording.types'

const METERING_HISTORY_SIZE = 20
const FAKE_METERING_INTERVAL = 100

export function useAudioRecording(): UseAudioRecordingResult {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [meteringData, setMeteringData] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fakeMeteringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (fakeMeteringIntervalRef.current) {
        clearInterval(fakeMeteringIntervalRef.current)
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
      }
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setHasPermission(true)
      return true
    } catch {
      setHasPermission(false)
      return false
    }
  }, [])

  const startFakeMetering = useCallback(() => {
    // En web no tenemos metering real, generamos datos aleatorios para la animacion
    fakeMeteringIntervalRef.current = setInterval(() => {
      setMeteringData((prev) => {
        const next = [...prev, 0.3 + Math.random() * 0.5]
        if (next.length > METERING_HISTORY_SIZE) {
          return next.slice(-METERING_HISTORY_SIZE)
        }
        return next
      })
    }, FAKE_METERING_INTERVAL)
  }, [])

  const stopFakeMetering = useCallback(() => {
    if (fakeMeteringIntervalRef.current) {
      clearInterval(fakeMeteringIntervalRef.current)
      fakeMeteringIntervalRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (hasPermission === null) {
      const granted = await requestPermission()
      if (!granted) return
    } else if (!hasPermission) {
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100)
      setMeteringData([])
      startFakeMetering()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }, [hasPermission, requestPermission, startFakeMetering])

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!isRecording || !mediaRecorderRef.current) return null

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current
      if (!mediaRecorder) {
        resolve(null)
        return
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current)
        }
        audioUrlRef.current = URL.createObjectURL(blob)

        mediaRecorder.stream.getTracks().forEach((track) => track.stop())
        stopFakeMetering()
        setIsRecording(false)

        resolve(audioUrlRef.current)
      }

      mediaRecorder.stop()
    })
  }, [isRecording, stopFakeMetering])

  const cancelRecording = useCallback(() => {
    if (!isRecording) return

    const mediaRecorder = mediaRecorderRef.current
    if (mediaRecorder) {
      mediaRecorder.onstop = null
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach((track) => track.stop())
    }

    stopFakeMetering()
    setIsRecording(false)
    setMeteringData([])
    chunksRef.current = []
  }, [isRecording, stopFakeMetering])

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
