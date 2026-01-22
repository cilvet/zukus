import { getServerBaseUrl } from './serverBaseUrl'

type TranscribeAudioParams = {
  audioUri: string
  accessToken: string
}

type TranscribeAudioResult = {
  text: string
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const errorValue = (payload as { error?: unknown }).error
    if (typeof errorValue === 'string') {
      return errorValue
    }
  }
  return fallback
}

export async function transcribeAudio(
  params: TranscribeAudioParams
): Promise<TranscribeAudioResult> {
  const formData = new FormData()

  // En nativo, el URI es un file:// path
  // En web, es un blob URL
  const isWebBlob = params.audioUri.startsWith('blob:')

  if (isWebBlob) {
    // En web, fetch el blob y añadirlo al FormData
    const response = await fetch(params.audioUri)
    const blob = await response.blob()
    formData.append('audio', blob, 'recording.webm')
  } else {
    // En nativo, usamos el formato de react-native para archivos
    formData.append('audio', {
      uri: params.audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as unknown as Blob)
  }

  const result = await fetch(`${getServerBaseUrl()}/transcribe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: formData,
  })

  if (!result.ok) {
    const payload = await result.json().catch(() => null)
    const message = extractErrorMessage(payload, `Error de transcripcion (${result.status})`)
    throw new Error(message)
  }

  const data = await result.json()
  return { text: data.text }
}
