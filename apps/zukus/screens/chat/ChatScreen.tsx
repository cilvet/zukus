import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, Pressable, useWindowDimensions, Keyboard, ScrollView as RNScrollView } from 'react-native'
import { Text, XStack, YStack, Input } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Markdown from 'react-native-markdown-display'
import { useTheme } from '../../ui'
import { useAuth } from '../../contexts/AuthContext'
import { streamChatFromServer, type ChatMessage as ServerChatMessage } from '../../services/chatServer'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

// Constants
const INPUT_BAR_HEIGHT = 68
const SCROLL_THRESHOLD = 50 // Distance from bottom to consider "at bottom"

// Assistant message with markdown rendering
function AssistantMessage({ content, textColor, codeBackground }: { content: string; textColor: string; codeBackground: string }) {
  const markdownStyles = {
    body: { color: textColor, fontSize: 17, lineHeight: 24 },
    paragraph: { marginTop: 0, marginBottom: 16 },
    heading1: { color: textColor, fontSize: 24, fontWeight: '700' as const, marginTop: 20, marginBottom: 12 },
    heading2: { color: textColor, fontSize: 20, fontWeight: '600' as const, marginTop: 18, marginBottom: 10 },
    heading3: { color: textColor, fontSize: 18, fontWeight: '600' as const, marginTop: 16, marginBottom: 8 },
    strong: { fontWeight: '600' as const },
    em: { fontStyle: 'italic' as const },
    code_inline: { 
      backgroundColor: codeBackground, 
      color: textColor, 
      paddingHorizontal: 4, 
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 15,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    code_block: { 
      backgroundColor: codeBackground, 
      color: textColor, 
      padding: 12, 
      borderRadius: 8,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginVertical: 12,
    },
    fence: { 
      backgroundColor: codeBackground, 
      color: textColor, 
      padding: 12, 
      borderRadius: 8,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginVertical: 12,
    },
    blockquote: { 
      backgroundColor: codeBackground, 
      borderLeftWidth: 3, 
      borderLeftColor: textColor, 
      paddingLeft: 12,
      marginLeft: 0,
      marginVertical: 12,
    },
    bullet_list: { marginTop: 8, marginBottom: 16 },
    ordered_list: { marginTop: 8, marginBottom: 16 },
    list_item: { marginBottom: 6 },
  }

  return (
    <Markdown style={markdownStyles}>
      {content}
    </Markdown>
  )
}

export function ChatScreen() {
  const { themeColors } = useTheme()
  const { session } = useAuth()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const scrollRef = useRef<RNScrollView>(null)
  const idRef = useRef(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  
  const isDesktop = Platform.OS === 'web' && width >= 768

  // Typewriter effect refs
  const textBufferRef = useRef('')
  const isTypingRef = useRef(false)

  // Smart auto-scroll refs
  const lastScrollTime = useRef(0)
  const lastScrollYRef = useRef(0)
  const isAtBottomRef = useRef(true)
  const userIsDraggingRef = useRef(false)

  // Throttled scroll to end - only if user is at bottom, max once per 100ms
  const scrollToBottom = useCallback(() => {
    if (!isAtBottomRef.current) return

    const now = Date.now()
    if (now - lastScrollTime.current < 100) return
    lastScrollTime.current = now

    // Small delay to let layout update, but check again before scrolling
    setTimeout(() => {
      // Double-check user hasn't scrolled away during the delay
      if (!isAtBottomRef.current) return
      scrollRef.current?.scrollToEnd({ animated: false }) // No animation - instant scroll
    }, 50)
  }, [])

  // Manual scroll to bottom (for the floating button)
  const handleScrollToBottom = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true })
    setShowScrollButton(false)
    isAtBottomRef.current = true
  }, [])

  // Track when user manually scrolls (drag)
  const handleScrollBeginDrag = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    // User started dragging - they're taking control of scroll
    userIsDraggingRef.current = true
    // Cancel any ongoing animated scroll by stopping at current position
    const currentY = event.nativeEvent.contentOffset.y
    scrollRef.current?.scrollTo({ y: currentY, animated: false })
  }, [])

  // Check scroll position to show/hide button and update isAtBottom
  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } } }) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height
    const isAtBottom = distanceFromBottom <= SCROLL_THRESHOLD

    // Detect scroll direction when user is dragging
    if (userIsDraggingRef.current) {
      const scrolledUp = contentOffset.y < lastScrollYRef.current - 5 // 5px tolerance

      if (scrolledUp) {
        // User scrolled up - disable auto-scroll immediately
        isAtBottomRef.current = false
      } else if (isAtBottom) {
        // User scrolled to bottom - re-enable auto-scroll
        isAtBottomRef.current = true
      }
    }

    lastScrollYRef.current = contentOffset.y
    setShowScrollButton(!isAtBottom)
  }, [])

  // When user stops dragging, momentum might continue
  const handleScrollEndDrag = useCallback((event: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number }; velocity?: { y: number } } }) => {
    const { contentOffset, contentSize, layoutMeasurement, velocity } = event.nativeEvent
    const hasNoMomentum = !velocity || Math.abs(velocity.y) < 0.1

    // If no momentum, finalize scroll state now
    if (hasNoMomentum) {
      userIsDraggingRef.current = false
      const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height
      isAtBottomRef.current = distanceFromBottom <= SCROLL_THRESHOLD
    }
    // Otherwise, onMomentumScrollEnd will handle it
  }, [])

  // When momentum scroll ends
  const handleMomentumScrollEnd = useCallback((event: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } } }) => {
    userIsDraggingRef.current = false
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height
    isAtBottomRef.current = distanceFromBottom <= SCROLL_THRESHOLD
  }, [])

  // Track keyboard state and scroll to end when it opens (if user was at bottom)
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardOpen(true)
      if (isAtBottomRef.current) {
        scrollRef.current?.scrollToEnd({ animated: true })
      }
    })
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardOpen(false)
    })
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const createMessageId = () => {
    idRef.current += 1
    return `${Date.now()}-${idRef.current}`
  }

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollRef.current?.scrollToEnd({ animated: true })
    }
  }, [messages.length])

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

    // Always scroll to bottom when user sends a message
    isAtBottomRef.current = true
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true })
    }, 100)

    const payloadMessages: ServerChatMessage[] = nextMessages
      .filter((message) => message.role !== 'assistant' || message.content.trim().length > 0)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }))

    // Typewriter effect: show text gradually but adapt speed to keep up with agent
    const typewriterLoop = () => {
      if (textBufferRef.current.length === 0) {
        isTypingRef.current = false
        return
      }
      
      const bufferSize = textBufferRef.current.length
      
      // Dynamic speed: show more characters when buffer is large
      // Small buffer (< 10): 1-2 chars, smooth effect
      // Medium buffer (10-50): 3-8 chars, catching up
      // Large buffer (> 50): 10-20 chars, fast catch up
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
        current.map((message) => {
          if (message.id !== assistantMessage.id) return message
          return { ...message, content: `${message.content}${chars}` }
        }),
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
    
    // Ensure all remaining text is shown after stream ends (outside try/catch)
    const waitForBuffer = async () => {
      while (textBufferRef.current.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 20))
      }
    }
    await waitForBuffer()
    
    if (streamError) {
      setErrorText(streamError.message)
      setMessages((current) =>
        current.map((message) => {
          if (message.id !== assistantMessage.id) return message
          return { ...message, content: message.content || 'No se pudo obtener respuesta.' }
        }),
      )
    }

    setIsSending(false)
  }

  return (
    <YStack flex={1} backgroundColor={themeColors.background}>
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: INPUT_BAR_HEIGHT + (isKeyboardOpen ? 0 : insets.bottom) + 8,
        }}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {messages.length === 0 && (
          <YStack paddingVertical={16} alignItems="center">
            <Text color="$placeholderColor" fontSize={17}>Todavia no hay mensajes.</Text>
          </YStack>
        )}

        <YStack gap={6}>
          {messages.map((message) => {
            const isUser = message.role === 'user'

            if (isUser) {
              return (
                <XStack key={message.id} justifyContent="flex-end">
                  <YStack
                    maxWidth={isDesktop ? '60%' : '80%'}
                    paddingHorizontal={14}
                    paddingVertical={10}
                    borderRadius={16}
                    backgroundColor={themeColors.actionButton}
                  >
                    <Text color={themeColors.textPrimary} fontSize={17} lineHeight={24}>
                      {message.content}
                    </Text>
                  </YStack>
                </XStack>
              )
            }

            // Assistant message: no background, no max width, with fade-in
            return (
              <XStack key={message.id} justifyContent="flex-start">
                <YStack paddingVertical={4}>
                  <AssistantMessage content={message.content} textColor={themeColors.color} codeBackground={themeColors.backgroundHover} />
                </YStack>
              </XStack>
            )
          })}
        </YStack>
      </KeyboardAwareScrollView>

      {/* Floating scroll to bottom button */}
      {showScrollButton && (
        <KeyboardStickyView
          offset={{ closed: 0, opened: insets.bottom }}
          style={{
            position: 'absolute',
            bottom: insets.bottom + INPUT_BAR_HEIGHT + 8,
            right: 16,
            zIndex: 10,
          }}
        >
          <Pressable
            onPress={handleScrollToBottom}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: themeColors.backgroundHover,
              borderWidth: 1,
              borderColor: themeColors.borderColor,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <FontAwesome name="chevron-down" size={14} color={themeColors.color} />
          </Pressable>
        </KeyboardStickyView>
      )}

      {/* Input que se mueve con el teclado */}
      <KeyboardStickyView
        offset={{ closed: 0, opened: insets.bottom }}
        style={{
          position: 'absolute',
          bottom: insets.bottom,
          left: 0,
          right: 0,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: themeColors.background,
        }}
      >
        <XStack
          gap={10}
          alignItems="center"
          backgroundColor={themeColors.backgroundHover}
          borderRadius={26}
          paddingLeft={16}
          paddingRight={6}
          paddingVertical={6}
          borderWidth={1}
          borderColor={themeColors.borderColor}
        >
          {errorText && (
            <Text color="$red10" fontSize={14}>
              {errorText}
            </Text>
          )}
          <Input
            flex={1}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe un mensaje"
            backgroundColor="transparent"
            borderWidth={0}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            submitBehavior="submit"
            fontSize={17}
            height={40}
            paddingVertical={0}
            paddingHorizontal={0}
          />
          <Pressable
            onPress={handleSend}
            disabled={isSending || !input.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: (isSending || !input.trim()) 
                ? themeColors.borderColor 
                : themeColors.actionButton,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {({ pressed }) => (
              <FontAwesome
                name="send"
                size={16}
                color={themeColors.textPrimary}
                style={{ opacity: pressed ? 0.7 : 1 }}
              />
            )}
          </Pressable>
        </XStack>
      </KeyboardStickyView>

      {/* Safe area bottom */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height={insets.bottom}
        backgroundColor="#000"
      />
    </YStack>
  )
}
