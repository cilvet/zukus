import { Pressable } from 'react-native'
import { XStack, Text } from 'tamagui'
import * as Haptics from 'expo-haptics'
import { showActionToast } from './utils'

type ActionButtonProps = {
  canUse: boolean
  accentColor: string
  disabledColor: string
  entityName: string
  actionLabel: string
  onPress: () => void
}

export function ActionButton({
  canUse,
  accentColor,
  disabledColor,
  entityName,
  actionLabel,
  onPress,
}: ActionButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    showActionToast(actionLabel, entityName)
    onPress()
  }

  return (
    <Pressable onPress={handlePress} disabled={!canUse} hitSlop={8}>
      {({ pressed }) => (
        <XStack
          paddingVertical={4}
          paddingHorizontal={10}
          backgroundColor="transparent"
          borderWidth={1}
          borderColor={canUse ? accentColor : disabledColor}
          borderRadius={6}
          opacity={pressed ? 0.7 : canUse ? 1 : 0.5}
        >
          <Text
            fontSize={11}
            fontWeight="600"
            color={canUse ? accentColor : '$placeholderColor'}
          >
            {actionLabel}
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}
