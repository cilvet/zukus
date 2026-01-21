import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView, Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import ReactMarkdown from 'react-markdown'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTheme } from '../../ui'
import { useAuth } from '../../contexts/AuthContext'
import { streamChatFromServer, type ChatMessage as ServerChatMessage } from '../../services/chatServer'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

const MAX_WIDTH = 720
const SCROLL_THRESHOLD = 50

function AssistantMessage({ content, themeColors }: { content: string; themeColors: ReturnType<typeof useTheme>['themeColors'] }) {
  return (
    <div style={{ fontSize: 16, lineHeight: 1.6, color: themeColors.color, fontFamily: 'Roboto, sans-serif' }}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p style={{ margin: '0 0 12px 0' }}>{children}</p>,
          h1: ({ children }) => <h1 style={{ fontSize: 22, fontWeight: 600, margin: '20px 0 12px' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: 19, fontWeight: 600, margin: '18px 0 10px' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: 17, fontWeight: 600, margin: '16px 0 8px' }}>{children}</h3>,
          strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          code: ({ className, children }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return (
                <pre style={{
                  backgroundColor: themeColors.backgroundHover,
                  padding: 14,
                  borderRadius: 8,
                  overflow: 'auto',
                  fontSize: 14,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  margin: '12px 0',
                }}>
                  <code>{children}</code>
                </pre>
              )
            }
            return (
              <code style={{
                backgroundColor: themeColors.backgroundHover,
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 14,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => <>{children}</>,
          ul: ({ children }) => <ul style={{ margin: '8px 0 12px', paddingLeft: 24 }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ margin: '8px 0 12px', paddingLeft: 24 }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote style={{
              borderLeft: `3px solid ${themeColors.borderColor}`,
              margin: '12px 0',
              paddingLeft: 16,
              color: themeColors.placeholderColor,
            }}>
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export function ChatScreenWeb() {
  const { themeColors } = useTheme()
  const { session } = useAuth()
  const scrollRef = useRef<ScrollView>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const hasMessages = messages.length > 0

  const textBufferRef = useRef('')
  const isTypingRef = useRef(false)
  const lastScrollTime = useRef(0)
  const isAtBottomRef = useRef(true)
  const lastScrollYRef = useRef(0)
  const userIsDraggingRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    if (!isAtBottomRef.current) return
    const now = Date.now()
    if (now - lastScrollTime.current < 100) return
    lastScrollTime.current = now
    setTimeout(() => {
      if (!isAtBottomRef.current) return
      scrollRef.current?.scrollToEnd({ animated: false })
    }, 50)
  }, [])

  const handleScrollToBottom = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true })
    setShowScrollButton(false)
    isAtBottomRef.current = true
  }, [])

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } } }) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height
    const isAtBottom = distanceFromBottom <= SCROLL_THRESHOLD

    if (userIsDraggingRef.current) {
      const scrolledUp = contentOffset.y < lastScrollYRef.current - 5
      if (scrolledUp) {
        isAtBottomRef.current = false
      } else if (isAtBottom) {
        isAtBottomRef.current = true
      }
    }

    lastScrollYRef.current = contentOffset.y
    setShowScrollButton(!isAtBottom && hasMessages)
  }, [hasMessages])

  const handleScrollEndDrag = useCallback((event: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } } }) => {
    userIsDraggingRef.current = false
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height
    isAtBottomRef.current = distanceFromBottom <= SCROLL_THRESHOLD
  }, [])

  const createMessageId = () => {
    idRef.current += 1
    return `${Date.now()}-${idRef.current}`
  }

  useEffect(() => {
    if (isAtBottomRef.current && hasMessages) {
      scrollRef.current?.scrollToEnd({ animated: true })
    }
  }, [messages.length, hasMessages])

  async function handleSend() {
    const accessToken = session?.access_token
    const trimmed = input.trim()

    if (!trimmed || !accessToken || isSending) return

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: trimmed,
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
    setInput('')
    setIsSending(true)
    setErrorText(null)

    isAtBottomRef.current = true
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true })
    }, 100)

    const payloadMessages: ServerChatMessage[] = nextMessages
      .filter((m) => m.role !== 'assistant' || m.content.trim().length > 0)
      .map((m) => ({ role: m.role, content: m.content }))

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
        current.map((m) => m.id === assistantMessage.id ? { ...m, content: m.content + chars } : m)
      )
      scrollToBottom()
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

    while (textBufferRef.current.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 20))
    }

    if (streamError) {
      setErrorText(streamError.message)
      setMessages((current) =>
        current.map((m) => m.id === assistantMessage.id ? { ...m, content: m.content || 'No se pudo obtener respuesta.' } : m)
      )
    }

    setIsSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <YStack flex={1} backgroundColor={themeColors.background}>
      <YStack flex={1} alignItems="center">
        <YStack flex={1} width="100%" maxWidth={MAX_WIDTH} paddingHorizontal={16} minHeight={0}>
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }}
            onScroll={handleScroll}
            onScrollBeginDrag={() => { userIsDraggingRef.current = true }}
            onScrollEndDrag={handleScrollEndDrag}
            scrollEventThrottle={16}
          >
            {!hasMessages && (
              <YStack paddingVertical={16} alignItems="center">
                <Text color="$placeholderColor" fontSize={15} textAlign="center">
                  Pregunta lo que quieras
                </Text>
              </YStack>
            )}

            <YStack gap={20}>
              {messages.map((message) => {
                if (message.role === 'user') {
                  return (
                    <XStack key={message.id} justifyContent="flex-end">
                      <YStack
                        maxWidth="80%"
                        paddingHorizontal={16}
                        paddingVertical={10}
                        borderRadius={18}
                        backgroundColor={themeColors.actionButton}
                      >
                        <Text color={themeColors.accentContrastText} fontSize={15} lineHeight={22}>
                          {message.content}
                        </Text>
                      </YStack>
                    </XStack>
                  )
                }

                return (
                  <XStack key={message.id} justifyContent="flex-start">
                    <YStack paddingVertical={2} flex={1}>
                      <AssistantMessage content={message.content} themeColors={themeColors} />
                    </YStack>
                  </XStack>
                )
              })}
            </YStack>
          </ScrollView>
        </YStack>
      </YStack>

      {showScrollButton && (
        <Pressable
          onPress={handleScrollToBottom}
          style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: [{ translateX: -18 }],
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: themeColors.backgroundHover,
            borderWidth: 1,
            borderColor: themeColors.borderColor,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <FontAwesome name="chevron-down" size={12} color={themeColors.color} />
        </Pressable>
      )}

      <YStack
        paddingVertical={12}
        paddingHorizontal={16}
        backgroundColor={themeColors.background}
        alignItems="center"
      >
        {errorText && (
          <Text color="$red10" fontSize={13} marginBottom={8}>{errorText}</Text>
        )}

        <XStack
          width="100%"
          maxWidth={MAX_WIDTH}
          backgroundColor={themeColors.backgroundHover}
          borderRadius={24}
          paddingLeft={20}
          paddingRight={6}
          paddingVertical={6}
          alignItems="center"
          gap={8}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              fontSize: 15,
              color: themeColors.color,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '8px 0',
              fontFamily: 'Roboto, sans-serif',
            }}
          />
          <Pressable
            onPress={handleSend}
            disabled={isSending || !input.trim()}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: (isSending || !input.trim()) ? 'transparent' : themeColors.actionButton,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: (isSending || !input.trim()) ? 0.3 : pressed ? 0.7 : 1,
            })}
          >
            <FontAwesome name="arrow-up" size={16} color={(isSending || !input.trim()) ? themeColors.placeholderColor : themeColors.accentContrastText} />
          </Pressable>
        </XStack>
      </YStack>
    </YStack>
  )
}
