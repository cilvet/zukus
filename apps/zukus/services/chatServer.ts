import { fetch } from 'expo/fetch'
import { getServerBaseUrl } from './serverBaseUrl'

export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  role: ChatRole
  content: string
}

type StreamChatParams = {
  accessToken: string
  messages: ChatMessage[]
  onToken: (token: string) => void
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

export async function streamChatFromServer(params: StreamChatParams): Promise<void> {
  const response = await fetch(`${getServerBaseUrl()}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify({ messages: params.messages }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message = extractErrorMessage(payload, `Error del chat (${response.status})`)
    throw new Error(message)
  }

  if (!response.body) {
    const text = await response.text()
    if (text) {
      params.onToken(text)
    }
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    if (value) {
      const chunk = decoder.decode(value, { stream: true })
      params.onToken(chunk)
    }
  }
}
