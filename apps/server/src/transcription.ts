import OpenAI, { toFile } from 'openai'
import { getUserFromRequest } from './auth'
import { withSpan } from './telemetry'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function addCorsHeaders(response: Response): Response {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

export async function handleTranscriptionRequest(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return addCorsHeaders(new Response(null, { status: 204 }))
  }

  if (request.method !== 'POST') {
    return addCorsHeaders(Response.json({ error: 'Method not allowed' }, { status: 405 }))
  }

  return withSpan('http.POST /transcribe', async (span) => {
    span.setAttribute('http.route', '/transcribe')

    const user = await getUserFromRequest(request)
    if (!user) {
      span.setAttribute('auth.success', false)
      return addCorsHeaders(Response.json({ error: 'Unauthorized' }, { status: 401 }))
    }
    span.setAttribute('auth.success', true)
    span.setAttribute('user.id', user.id)

    try {
      const formData = await request.formData()
      const audioFile = formData.get('audio') as File | null

      if (!audioFile) {
        return addCorsHeaders(Response.json({ error: 'No audio file provided' }, { status: 400 }))
      }

      span.setAttribute('audio.size', audioFile.size)
      span.setAttribute('audio.type', audioFile.type)

      const arrayBuffer = await audioFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const transcription = await withSpan('openai.whisper.transcribe', async (whisperSpan) => {
        whisperSpan.setAttribute('model', 'whisper-1')
        whisperSpan.setAttribute('audio.size', buffer.length)

        const result = await openai.audio.transcriptions.create({
          file: await toFile(buffer, audioFile.name || 'audio.m4a', {
            type: audioFile.type || 'audio/m4a',
          }),
          model: 'whisper-1',
          language: 'es',
        })

        whisperSpan.setAttribute('transcription.length', result.text.length)
        return result
      })

      return addCorsHeaders(Response.json({ text: transcription.text }))
    } catch (error) {
      span.setAttribute('error', true)
      const message = error instanceof Error ? error.message : 'Unknown error'
      span.setAttribute('error.message', message)
      console.error('Transcription error:', error)
      return addCorsHeaders(Response.json({ error: message }, { status: 500 }))
    }
  })
}
