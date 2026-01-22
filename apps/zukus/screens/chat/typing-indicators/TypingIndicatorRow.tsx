import { XStack } from 'tamagui'
import { ArcaneDot } from './ArcaneDot'
import { EmberDot } from './EmberDot'
import { FrostDot } from './FrostDot'
import { VerdantDot } from './VerdantDot'

export function TypingIndicatorRow() {
  return (
    <XStack justifyContent="flex-start" paddingVertical={6} paddingLeft={10} gap={24} alignItems="center">
      <FrostDot />
      <EmberDot />
      <ArcaneDot />
      <VerdantDot />
    </XStack>
  )
}
