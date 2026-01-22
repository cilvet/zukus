export type UseAudioRecordingResult = {
  isRecording: boolean
  hasPermission: boolean | null
  meteringData: number[]
  startRecording: () => Promise<void>
  stopRecording: () => Promise<string | null>
  cancelRecording: () => void
  requestPermission: () => Promise<boolean>
}
