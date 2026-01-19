import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { getUserIdFromRequest } from './auth'
import { withSpan } from './telemetry'

const MODEL_ID = 'gemini-2.5-flash'
const SYSTEM_PROMPT = `Eres un asistente util para Zukus.

Formatea tus respuestas usando Markdown de forma natural:
- Usa **negrita** para enfatizar conceptos importantes
- Usa \`codigo\` para terminos tecnicos o nombres de variables
- Usa listas cuando enumeres elementos
- Usa bloques de codigo con triple backtick para codigo largo
- Usa encabezados (##, ###) para organizar respuestas largas

Escribe el markdown directamente en tu respuesta, no lo envuelvas en bloques de codigo. El cliente renderiza markdown de forma nativa.`

type ChatRole = 'user' | 'assistant' | 'system'

type ChatMessage = {
  role: ChatRole
  content: string
}

type ChatRequestBody = {
  messages: ChatMessage[]
}

type ParsedBody = {
  messages: ChatMessage[]
} | {
  error: string
}

function parseChatBody(body: unknown): ParsedBody {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Body invalido' }
  }

  if (!('messages' in body)) {
    return { error: 'Falta el parametro "messages"' }
  }

  const { messages } = body as ChatRequestBody

  if (!Array.isArray(messages)) {
    return { error: 'El parametro "messages" debe ser un array' }
  }

  const parsed: ChatMessage[] = []

  for (const message of messages) {
    if (typeof message !== 'object' || message === null) {
      return { error: 'Cada mensaje debe ser un objeto' }
    }

    const { role, content } = message as ChatMessage

    if (role !== 'user' && role !== 'assistant' && role !== 'system') {
      return { error: 'Role invalido en mensajes' }
    }

    if (typeof content !== 'string' || !content.trim()) {
      return { error: 'Contenido invalido en mensajes' }
    }

    parsed.push({ role, content })
  }

  if (parsed.length === 0) {
    return { error: 'Se requiere al menos un mensaje' }
  }

  return { messages: parsed }
}

export async function handleChatRequest(request: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  return withSpan('http.POST /chat', async (span) => {
    span.setAttribute('http.route', '/chat')

    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    span.setAttribute('user.id', userId)

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Body invalido' }, { status: 400, headers: corsHeaders })
    }

    const parsed = parseChatBody(body)
    if ('error' in parsed) {
      return Response.json({ error: parsed.error }, { status: 400, headers: corsHeaders })
    }

    return withSpan('ai.request', async (aiSpan) => {
      aiSpan.setAttribute('ai.provider', 'google')
      aiSpan.setAttribute('ai.model', MODEL_ID)
      aiSpan.setAttribute('ai.messages.count', parsed.messages.length)

      const result = await streamText({
        model: google(MODEL_ID),
        system: SYSTEM_PROMPT,
        messages: parsed.messages,
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        },
      })

      return result.toTextStreamResponse({
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          ...corsHeaders,
        },
      })
    })
  })
}
