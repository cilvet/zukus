import { useEffect, useRef, useState } from 'react'
import { Platform, Pressable, useWindowDimensions, Keyboard, ScrollView as RNScrollView, ActivityIndicator } from 'react-native'
import { Text, XStack, YStack, Input } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Markdown from 'react-native-markdown-display'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../ui'
import { useAuth } from '../../contexts/AuthContext'
import { transcribeAudio } from '../../services/transcription'
import { TypingIndicatorRow } from './typing-indicators'
import { AudioWaveform } from './AudioWaveform'
import { useAudioRecording } from '../../hooks'
import { useChatMessages, useSmartAutoScroll } from './hooks'

const INPUT_BAR_HEIGHT = 68

// Assistant message with markdown rendering
function AssistantMessage({ content, textColor, codeBackground, borderColor }: { content: string; textColor: string; codeBackground: string; borderColor: string }) {
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
    table: {
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 6,
      marginVertical: 12,
      overflow: 'hidden' as const,
    },
    tableHeader: {
      backgroundColor: codeBackground,
      borderBottomWidth: 2,
      borderColor: borderColor,
    },
    tableHeaderCell: {
      borderRightWidth: 1,
      borderColor: borderColor,
      padding: 10,
      fontWeight: '600' as const,
    },
    tableRow: {
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      borderColor: borderColor,
    },
    tableRowCell: {
      borderRightWidth: 1,
      borderColor: borderColor,
      padding: 10,
    },
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

  const [input, setInput] = useState('')
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const isDesktop = Platform.OS === 'web' && width >= 768

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

  // Track keyboard state
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardOpen(true)
      scrollRef.current?.scrollToEnd({ animated: true })
    })
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardOpen(false)
    })
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

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

  async function handleSendAudio() {
    const accessToken = session?.access_token
    if (!accessToken || isTranscribing || isSending) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await startRecording()
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
        onScroll={(e) => scrollHandlers.onScroll(e, hasMessages)}
        onScrollBeginDrag={scrollHandlers.onScrollBeginDrag}
        onScrollEndDrag={scrollHandlers.onScrollEndDrag}
        onMomentumScrollEnd={scrollHandlers.onMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {!hasMessages && (
          <YStack paddingVertical={16} alignItems="center">
            <Text color="$placeholderColor" fontSize={17}>Todavia no hay mensajes.</Text>
          </YStack>
        )}

        <YStack paddingBottom={12}>
          <TypingIndicatorRow />
        </YStack>

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
                    <Text color={themeColors.accentContrastText} fontSize={17} lineHeight={24}>
                      {message.content}
                    </Text>
                  </YStack>
                </XStack>
              )
            }

            return (
              <XStack key={message.id} justifyContent="flex-start">
                <YStack paddingVertical={4}>
                  {message.content.length === 0 && isSending ? (
                    <TypingIndicatorRow />
                  ) : (
                    <AssistantMessage content={message.content} textColor={themeColors.color} codeBackground={themeColors.backgroundHover} borderColor={themeColors.borderColor} />
                  )}
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

      {/* Input bar */}
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
          {(isRecording || isTranscribing) && (
            <XStack flex={1} alignItems="center" justifyContent="center">
              {isTranscribing ? (
                <Text color={themeColors.placeholderColor} fontSize={15}>
                  Transcribiendo...
                </Text>
              ) : (
                <AudioWaveform meteringData={meteringData} color={themeColors.actionButton} />
              )}
            </XStack>
          )}

          {/* Input - always rendered to keep keyboard open */}
          <Input
            flex={isRecording || isTranscribing ? 0 : 1}
            width={isRecording || isTranscribing ? 0 : undefined}
            opacity={isRecording || isTranscribing ? 0 : 1}
            pointerEvents={isRecording || isTranscribing ? 'none' : 'auto'}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe un mensaje"
            autoFocus
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

          {/* Send/mic/stop button */}
          {isRecording || isTranscribing ? (
            <Pressable
              onPress={handleSendAudio}
              disabled={isTranscribing}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
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
          ) : input.trim() ? (
            <Pressable
              onPress={handleSend}
              disabled={isSending}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isSending ? themeColors.borderColor : themeColors.actionButton,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {({ pressed }) => (
                <FontAwesome
                  name="send"
                  size={16}
                  color={themeColors.accentContrastText}
                  style={{ opacity: pressed ? 0.7 : 1 }}
                />
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={handleMicrophonePress}
              disabled={isSending || isTranscribing}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: (isSending || isTranscribing) ? themeColors.borderColor : themeColors.actionButton,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {({ pressed }) => (
                <FontAwesome
                  name="microphone"
                  size={18}
                  color={themeColors.accentContrastText}
                  style={{ opacity: pressed ? 0.7 : 1 }}
                />
              )}
            </Pressable>
          )}
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
