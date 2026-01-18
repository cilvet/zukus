import { Pressable } from 'react-native'
import { YStack, View } from 'tamagui'

type LevelProgressIndicatorProps = {
  isCompleted: boolean
  isFirstLevel: boolean
  isLastLevel: boolean
  isNextCompleted: boolean
  onDotPress: () => void
}

const DOT_SIZE = 18
const CONNECTOR_WIDTH = 2

export function LevelProgressIndicator({
  isCompleted,
  isFirstLevel,
  isLastLevel,
  isNextCompleted,
  onDotPress,
}: LevelProgressIndicatorProps) {
  // Use theme colors: $borderColor for active, transparent for inactive
  const dotBackgroundColor = isCompleted ? '$borderColor' : 'transparent'
  const dotBorderColor = isCompleted ? '$color' : '$borderColor'

  // Line above: colored if THIS level is completed (and not first level)
  const lineAboveColor = isCompleted ? '$borderColor' : '$borderColorTransparent'

  // Line below: colored if NEXT level is completed (and not last level)
  const lineBelowColor = isNextCompleted ? '$borderColor' : '$borderColorTransparent'

  return (
    <YStack alignItems="center" width={24} alignSelf="stretch" marginRight="$2">
      {/* Connector line from previous level */}
      <View
        width={CONNECTOR_WIDTH}
        flex={1}
        backgroundColor={isFirstLevel ? 'transparent' : lineAboveColor}
      />

      {/* Dot */}
      <Pressable
        onPress={onDotPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {({ pressed }) => (
          <View
            width={DOT_SIZE}
            height={DOT_SIZE}
            borderRadius={DOT_SIZE / 2}
            backgroundColor={dotBackgroundColor}
            borderWidth={2}
            borderColor={dotBorderColor}
            opacity={pressed ? 0.7 : 1}
          />
        )}
      </Pressable>

      {/* Connector line to next level */}
      <View
        width={CONNECTOR_WIDTH}
        flex={1}
        backgroundColor={isLastLevel ? 'transparent' : lineBelowColor}
      />
    </YStack>
  )
}
