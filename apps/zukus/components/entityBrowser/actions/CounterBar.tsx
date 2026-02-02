import { Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { XStack, YStack, Text } from 'tamagui'

type CounterBarProps = {
  current: number
  max: number
  label: string
  accentColor: string
  /** Called when user presses OK after completion */
  onComplete?: () => void
}

/**
 * Altura fija del CounterBar - usar para calcular padding del contenido.
 */
export const COUNTER_BAR_HEIGHT = 56

/**
 * Fixed bar at the bottom showing progress (e.g., "3 of 5 prepared").
 *
 * Includes a visual progress indicator and safe area handling.
 * When complete, shows an OK button next to the label.
 */
export function CounterBar({ current, max, label, accentColor, onComplete }: CounterBarProps) {
  const insets = useSafeAreaInsets()

  const progress = max > 0 ? current / max : 0
  const isComplete = current >= max && max > 0

  return (
    <YStack
      style={[styles.container, { paddingBottom: insets.bottom || 8 }]}
      backgroundColor="$background"
      borderTopWidth={1}
      borderTopColor="$borderColor"
    >
      {/* Progress bar */}
      <XStack height={3} backgroundColor="$uiBackgroundColor">
        <XStack
          height={3}
          width={`${progress * 100}%`}
          backgroundColor={isComplete ? '$green10' : accentColor}
        />
      </XStack>

      {/* Label + OK button */}
      <XStack
        paddingHorizontal={16}
        paddingVertical={12}
        alignItems="center"
        justifyContent="center"
        gap={12}
      >
        <Text
          fontSize={15}
          fontWeight="600"
          color={isComplete ? '$green10' : '$color'}
        >
          {label}
        </Text>

        {isComplete && onComplete && (
          <Pressable onPress={onComplete}>
            {({ pressed }) => (
              <XStack
                backgroundColor="$green10"
                paddingVertical={6}
                paddingHorizontal={16}
                borderRadius={6}
                opacity={pressed ? 0.7 : 1}
              >
                <Text fontSize={14} fontWeight="600" color="white">
                  OK
                </Text>
              </XStack>
            )}
          </Pressable>
        )}
      </XStack>
    </YStack>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
})
