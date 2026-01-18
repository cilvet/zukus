import React, { useState } from 'react'
import { XStack, YStack, Text } from 'tamagui'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'

export type CollapsibleProps = {
  title: string
  value?: string
  isExpanded?: boolean
  onToggle?: () => void
  children: React.ReactNode
  showExpandIcon?: boolean
}

const AnimatedYStack = Animated.createAnimatedComponent(YStack)

export function Collapsible({
  title,
  value,
  isExpanded: controlledExpanded,
  onToggle,
  children,
  showExpandIcon = true,
}: CollapsibleProps) {
  const [internalExpanded, setInternalExpanded] = useState(false)

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded

  const opacity = useSharedValue(isExpanded ? 1 : 0)
  const scale = useSharedValue(isExpanded ? 1 : 0.97)

  React.useEffect(() => {
    opacity.value = withTiming(isExpanded ? 1 : 0, {
      duration: 150,
      easing: Easing.ease,
    })
    scale.value = withTiming(isExpanded ? 1 : 0.97, {
      duration: 150,
      easing: Easing.ease,
    })
  }, [isExpanded, opacity, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalExpanded(!internalExpanded)
    }
  }

  return (
    <YStack>
      <XStack
        onPress={handleToggle}
        justifyContent="space-between"
        alignItems="center"
        paddingVertical={12}
        paddingHorizontal={16}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={4}
        cursor="pointer"
        hoverStyle={{ opacity: 0.8 }}
        pressStyle={{ opacity: 0.6 }}
      >
        <Text fontSize={14} fontWeight="600" color="$color">
          {title}
        </Text>

        <XStack alignItems="center" gap={8}>
          {showExpandIcon && (
            <Text fontSize={12} color="$placeholderColor">
              {isExpanded ? '▲' : '▼'}
            </Text>
          )}
          {value && (
            <Text fontSize={18} fontWeight="700" color="$color">
              {value}
            </Text>
          )}
        </XStack>
      </XStack>

      {isExpanded && (
        <AnimatedYStack style={animatedStyle}>
          {children}
        </AnimatedYStack>
      )}
    </YStack>
  )
}
