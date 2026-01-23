import { XStack } from 'tamagui'
import { ArcaneDot } from './ArcaneDot'
import { EmberDot } from './EmberDot'
import { FrostDot } from './FrostDot'
import { VerdantDot } from './VerdantDot'

// =============================================================================
// DEBUG MODE
// =============================================================================
// Set this to `true` to show all themed dots side by side at their full size.
// This is useful for visual debugging and giving feedback on dot animations.
// In production, this should ALWAYS be `false` - the row will be completely
// hidden and take no space.
// =============================================================================
const SHOW_DEBUG_DOTS = false

export function DebugDotsRow() {
  if (!SHOW_DEBUG_DOTS) {
    return null
  }

  return (
    <XStack justifyContent="flex-start" paddingVertical={6} paddingLeft={10} gap={24} alignItems="center">
      <FrostDot />
      <EmberDot />
      <ArcaneDot />
      <VerdantDot />
    </XStack>
  )
}
