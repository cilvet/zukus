import { useCallback, useRef, useState } from 'react'
import { streamChatFromServer, type ChatMessage as ServerChatMessage } from '../../../services/chatServer'
import type { ChatMessage } from '../types'

type UseChatMessagesOptions = {
  accessToken: string | undefined
  onNewContent?: () => void // Llamado cuando hay contenido nuevo (para scroll)
}

export function useChatMessages({ accessToken, onNewContent }: UseChatMessagesOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  const idRef = useRef(0)
  const textBufferRef = useRef('')
  const isTypingRef = useRef(false)

  const createMessageId = useCallback(() => {
    idRef.current += 1
    return `${Date.now()}-${idRef.current}`
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !accessToken || isSending) return

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        content: text.trim(),
        createdAt: Date.now(),
      }

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
      }

      const nextMessages = [...messages, userMessage, assistantMessage]
      setMessages(nextMessages)
      setIsSending(true)
      setErrorText(null)

      // Notificar para scroll inicial
      onNewContent?.()

      const payloadMessages: ServerChatMessage[] = nextMessages
        .filter((m) => m.role !== 'assistant' || m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content }))

      // Typewriter loop con velocidad dinámica
      const typewriterLoop = () => {
        if (textBufferRef.current.length === 0) {
          isTypingRef.current = false
          return
        }

        const bufferSize = textBufferRef.current.length
        let charsToShow: number
        let delay: number

        if (bufferSize < 10) {
          charsToShow = Math.floor(Math.random() * 2) + 1
          delay = 20 + Math.random() * 15
        } else if (bufferSize < 50) {
          charsToShow = Math.floor(Math.random() * 6) + 3
          delay = 15 + Math.random() * 10
        } else {
          charsToShow = Math.floor(Math.random() * 11) + 10
          delay = 10
        }

        charsToShow = Math.min(charsToShow, bufferSize)
        const chars = textBufferRef.current.slice(0, charsToShow)
        textBufferRef.current = textBufferRef.current.slice(charsToShow)

        setMessages((current) =>
          current.map((m) =>
            m.id === assistantMessage.id ? { ...m, content: m.content + chars } : m
          )
        )

        onNewContent?.()
        setTimeout(typewriterLoop, delay)
      }

      const startTyping = () => {
        if (!isTypingRef.current && textBufferRef.current.length > 0) {
          isTypingRef.current = true
          typewriterLoop()
        }
      }

      textBufferRef.current = ''
      let streamError: Error | null = null

      try {
        await streamChatFromServer({
          accessToken,
          messages: payloadMessages,
          onToken: (token) => {
            if (!token) return
            textBufferRef.current += token
            startTyping()
          },
        })
      } catch (error) {
        streamError = error instanceof Error ? error : new Error('Error al enviar mensaje')
      }

      // Esperar a que se vacíe el buffer
      while (textBufferRef.current.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 20))
      }

      if (streamError) {
        setErrorText(streamError.message)
        setMessages((current) =>
          current.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: m.content || 'No se pudo obtener respuesta.' }
              : m
          )
        )
      }

      setIsSending(false)
    },
    [accessToken, isSending, messages, createMessageId, onNewContent]
  )

  const clearError = useCallback(() => {
    setErrorText(null)
  }, [])

  return {
    messages,
    isSending,
    errorText,
    sendMessage,
    clearError,
    hasMessages: messages.length > 0,
  }
}
