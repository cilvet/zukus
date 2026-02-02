import { useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated'
import { XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'

type ActionToastProps = {
  message: string | null
  onDismiss: () => void
  /** Bottom offset (for CounterBar) */
  bottomOffset?: number
}

const TOAST_DURATION = 2000
const ANIMATION_DURATION = 200

/**
 * Toast notification that appears briefly after an action.
 *
 * - Fades in from bottom
 * - Auto-dismisses after ~2 seconds
 * - Can be positioned above CounterBar if present
 *
 * IMPORTANT: Component stays mounted to avoid Reanimated view parent issues.
 * Uses opacity and pointerEvents to hide when not visible.
 */
export function ActionToast({ message, onDismiss, bottomOffset = 0 }: ActionToastProps) {
  'use no memo'

  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)
  const displayedMessage = useRef<string | null>(null)

  // Track the current message to display (keeps showing during fade out)
  if (message) {
    displayedMessage.current = message
  }

  useEffect(() => {
    if (message) {
      // Cancel any pending animations
      cancelAnimation(opacity)
      cancelAnimation(translateY)

      // Animate in
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION })
      translateY.value = withTiming(0, { duration: ANIMATION_DURATION })

      // Then animate out after delay
      opacity.value = withDelay(
        TOAST_DURATION,
        withTiming(0, { duration: ANIMATION_DURATION }, (finished) => {
          if (finished) {
            runOnJS(onDismiss)()
          }
        })
      )
      translateY.value = withDelay(
        TOAST_DURATION,
        withTiming(20, { duration: ANIMATION_DURATION })
      )
    }
  }, [message, onDismiss, opacity, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    pointerEvents: opacity.value > 0 ? 'auto' : 'none',
  }))

  // Always render, but hidden when no message
  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: 16 + bottomOffset },
        animatedStyle,
      ]}
    >
      <XStack
        backgroundColor="$color"
        paddingHorizontal={16}
        paddingVertical={12}
        borderRadius={10}
        alignItems="center"
        gap={10}
        style={styles.toast}
      >
        <FontAwesome6 name="circle-check" size={16} color="#FFFFFF" />
        <Text fontSize={14} fontWeight="500" color="$background">
          {displayedMessage.current ?? ''}
        </Text>
      </XStack>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  toast: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
})
