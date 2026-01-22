import { useEffect, useRef, useState } from 'react'
import { ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import ReactMarkdown from 'react-markdown'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTheme } from '../../ui'
import { useAuth } from '../../contexts/AuthContext'
import { transcribeAudio } from '../../services/transcription'
import { TypingIndicatorRow } from './typing-indicators'
import { AudioWaveform } from './AudioWaveform'
import { useAudioRecording } from '../../hooks'
import { useChatMessages, useSmartAutoScroll } from './hooks'

const MAX_WIDTH = 720

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

  const [input, setInput] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)

  // Chat messages hook
  const {
    messages,
    isSending,
    errorText,
    sendMessage,
    hasMessages,
  } = useChatMessages({
    accessToken: session?.access_token,
    onNewContent: () => scrollToBottom(),
  })

  // Smart auto-scroll hook
  const {
    showScrollButton,
    scrollToBottom,
    handleScrollToBottom,
    activateAutoScroll,
    scrollHandlers,
  } = useSmartAutoScroll(scrollRef)

  // Audio recording hook
  const {
    isRecording,
    meteringData,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecording()

  // Scroll when messages change
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true })
  }, [messages.length])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed) return
    setInput('')
    activateAutoScroll()
    await sendMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleSendAudio() {
    const accessToken = session?.access_token
    if (!accessToken || isTranscribing || isSending) return

    setIsTranscribing(true)

    try {
      const audioUri = await stopRecording()
      if (!audioUri) {
        setIsTranscribing(false)
        return
      }

      const result = await transcribeAudio({ audioUri, accessToken })
      const transcribedText = result.text.trim()

      if (!transcribedText) {
        setIsTranscribing(false)
        return
      }

      setIsTranscribing(false)
      activateAutoScroll()
      await sendMessage(transcribedText)
    } catch {
      setIsTranscribing(false)
    }
  }

  async function handleMicrophonePress() {
    await startRecording()
  }

  return (
    <YStack flex={1} backgroundColor={themeColors.background}>
      <YStack flex={1} alignItems="center">
        <YStack flex={1} width="100%" maxWidth={MAX_WIDTH} paddingHorizontal={16} minHeight={0}>
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }}
            onScroll={(e) => scrollHandlers.onScroll(e, hasMessages)}
            onScrollBeginDrag={() => scrollHandlers.onScrollBeginDrag({ nativeEvent: { contentOffset: { y: 0 }, contentSize: { height: 0 }, layoutMeasurement: { height: 0 } } })}
            onScrollEndDrag={scrollHandlers.onScrollEndDrag}
            scrollEventThrottle={16}
          >
            {!hasMessages && (
              <YStack paddingVertical={16} alignItems="center">
                <Text color="$placeholderColor" fontSize={15} textAlign="center">
                  Pregunta lo que quieras
                </Text>
              </YStack>
            )}

            <YStack paddingBottom={12}>
              <TypingIndicatorRow />
            </YStack>

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
                      {message.content.length === 0 && isSending ? (
                        <TypingIndicatorRow />
                      ) : (
                        <AssistantMessage content={message.content} themeColors={themeColors} />
                      )}
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
          {isRecording || isTranscribing ? (
            <>
              {/* Cancel button */}
              {isRecording && !isTranscribing && (
                <Pressable
                  onPress={cancelRecording}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: themeColors.borderColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome name="times" size={14} color={themeColors.color} />
                </Pressable>
              )}

              {/* Waveform or transcribing text */}
              <XStack flex={1} alignItems="center" justifyContent="center">
                {isTranscribing ? (
                  <Text color={themeColors.placeholderColor} fontSize={14}>
                    Transcribiendo...
                  </Text>
                ) : (
                  <AudioWaveform meteringData={meteringData} color={themeColors.actionButton} />
                )}
              </XStack>

              {/* Stop/spinner button */}
              <Pressable
                onPress={handleSendAudio}
                disabled={isTranscribing}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: themeColors.actionButton,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isTranscribing ? (
                  <ActivityIndicator size="small" color={themeColors.accentContrastText} />
                ) : (
                  <FontAwesome name="arrow-up" size={16} color={themeColors.accentContrastText} />
                )}
              </Pressable>
            </>
          ) : (
            <>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                autoFocus
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

              {input.trim() ? (
                <Pressable
                  onPress={handleSend}
                  disabled={isSending}
                  style={({ pressed }) => ({
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isSending ? 'transparent' : themeColors.actionButton,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isSending ? 0.3 : pressed ? 0.7 : 1,
                  })}
                >
                  <FontAwesome
                    name="arrow-up"
                    size={16}
                    color={isSending ? themeColors.placeholderColor : themeColors.accentContrastText}
                  />
                </Pressable>
              ) : (
                <Pressable
                  onPress={handleMicrophonePress}
                  disabled={isSending || isTranscribing}
                  style={({ pressed }) => ({
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: (isSending || isTranscribing) ? 'transparent' : themeColors.actionButton,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: (isSending || isTranscribing) ? 0.3 : pressed ? 0.7 : 1,
                  })}
                >
                  <FontAwesome
                    name="microphone"
                    size={16}
                    color={(isSending || isTranscribing) ? themeColors.placeholderColor : themeColors.accentContrastText}
                  />
                </Pressable>
              )}
            </>
          )}
        </XStack>
      </YStack>
    </YStack>
  )
}
