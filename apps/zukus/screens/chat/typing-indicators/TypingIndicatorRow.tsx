import { XStack } from 'tamagui'
import { TypingDot } from './TypingDot'

// Simple wrapper that shows the TypingDot in a row layout
// Used when the assistant is generating a response
export function TypingIndicatorRow() {
  return (
    <XStack justifyContent="flex-start" paddingVertical={2} paddingLeft={4} alignItems="center">
      <TypingDot />
    </XStack>
  )
}
