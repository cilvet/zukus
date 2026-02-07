import { Pressable, StyleSheet } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import { Checkbox } from '../../ui/atoms'

/**
 * Height must match FlashList's estimatedItemSize.
 */
export const SELECTION_ROW_HEIGHT = 72

export type SelectionRowProps = {
  id: string
  name: string
  description?: string
  badge?: string | null
  isSelected: boolean
  disabled: boolean
  showEligibilityBadge: boolean
  onToggle: (entityId: string, checked: boolean) => void
  onInfoPress?: (entityId: string) => void
}

export function SelectionRow({
  id,
  name,
  description,
  badge,
  isSelected,
  disabled,
  showEligibilityBadge,
  onToggle,
  onInfoPress,
}: SelectionRowProps) {
  const handlePress = () => {
    if (disabled) return
    onToggle(id, !isSelected)
  }

  return (
    <Pressable onPress={handlePress} style={styles.container} disabled={disabled}>
      {({ pressed }) => (
        <XStack
          height={SELECTION_ROW_HEIGHT}
          alignItems="center"
          paddingHorizontal={16}
          gap={12}
          opacity={disabled ? 0.5 : pressed ? 0.6 : 1}
          borderBottomWidth={StyleSheet.hairlineWidth}
          borderBottomColor="$borderColor"
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked: boolean) => onToggle(id, checked)}
            disabled={disabled}
            size="small"
          />

          <YStack flex={1} gap={2}>
            <XStack alignItems="center" gap={8}>
              <Text
                fontSize={15}
                fontWeight="500"
                color={disabled ? '$placeholderColor' : '$color'}
                flex={1}
                numberOfLines={1}
              >
                {name}
              </Text>

              {showEligibilityBadge && (
                <XStack
                  backgroundColor="$red4"
                  paddingHorizontal={6}
                  paddingVertical={2}
                  borderRadius={4}
                >
                  <Text fontSize={10} color="$red11">
                    No elegible
                  </Text>
                </XStack>
              )}

              {badge && (
                <Text fontSize={12} color="$placeholderColor" marginLeft={4}>
                  {badge}
                </Text>
              )}
            </XStack>
            {description && (
              <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
                {description}
              </Text>
            )}
          </YStack>
        </XStack>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
})
