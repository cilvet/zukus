import { google } from '@ai-sdk/google'
import { streamText, tool, stepCountIs } from 'ai'
import { z } from 'zod'
import { getUserFromRequest, type AuthUser } from './auth'
import { listCharactersByUser } from './characters'
import { withSpan } from './telemetry'

const MODEL_ID = 'gemini-3-flash-preview'

function buildServerTools(userId: string) {
  return {
    listCharacters: tool({
      description: 'Lista los personajes del usuario. Usa esta herramienta cuando el usuario pregunte por sus personajes o quiera saber que personajes tiene.',
      inputSchema: z.object({}),
      execute: async () => {
        const characters = await listCharactersByUser(userId)
        return {
          characters: characters.map((c) => ({
            id: c.id,
            name: c.name,
            build: c.build,
          })),
        }
      },
    }),
  }
}

function buildSystemPrompt(user: AuthUser): string {
  const userName = user.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? null
  const userContext = userName
    ? `\nEl usuario se llama ${userName}. Puedes saludarle por su nombre al inicio de la conversacion, pero no lo repitas constantemente.`
    : ''

  return `Eres un asistente util para Zukus.${userContext}

Formatea tus respuestas usando Markdown de forma natural:
- Usa **negrita** para enfatizar conceptos importantes
- Usa \`codigo\` para terminos tecnicos o nombres de variables
- Usa listas cuando enumeres elementos
- Usa bloques de codigo con triple backtick para codigo largo
- Usa encabezados (##, ###) para organizar respuestas largas

Escribe el markdown directamente en tu respuesta, no lo envuelvas en bloques de codigo. El cliente renderiza markdown de forma nativa.`
}

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

    const user = await getUserFromRequest(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    span.setAttribute('user.id', user.id)

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

      const result = streamText({
        model: google(MODEL_ID),
        system: buildSystemPrompt(user),
        messages: parsed.messages,
        tools: buildServerTools(user.id),
        stopWhen: stepCountIs(3),
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingBudget: 150,
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
