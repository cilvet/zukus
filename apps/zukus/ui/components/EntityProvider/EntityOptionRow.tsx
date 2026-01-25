/**
 * EntityOptionRow - A selectable row in the selector options list
 *
 * Shows entity name with optional checkbox, eligibility status, description, and info icon.
 */

import { XStack, YStack, Text } from 'tamagui'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import type { StandardEntity } from '@zukus/core'
import type { FilterResult } from '@zukus/core'
import { Checkbox } from '../../atoms'
import { useTheme } from '../../contexts/ThemeContext'

export type EntityOptionRowProps = {
  entity: StandardEntity
  filterResult: FilterResult<StandardEntity>
  isSelected: boolean
  onToggle: (checked: boolean) => void
  disabled: boolean
  showEligibilityBadge: boolean
  showCheckbox?: boolean
  onInfoPress?: (entity: StandardEntity) => void
}

export function EntityOptionRow({
  entity,
  filterResult,
  isSelected,
  onToggle,
  disabled,
  showEligibilityBadge,
  showCheckbox = true,
  onInfoPress,
}: EntityOptionRowProps) {
  const { themeColors } = useTheme()

  function handlePress() {
    if (disabled) return
    onToggle(!isSelected)
  }

  function handleInfoPress() {
    onInfoPress?.(entity)
  }

  return (
    <XStack
      width="100%"
      paddingVertical={6}
      paddingHorizontal={12}
      backgroundColor="$background"
      borderRadius={8}
      borderWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      gap={8}
      opacity={disabled ? 0.5 : 1}
      cursor={disabled ? 'not-allowed' : 'pointer'}
      hoverStyle={disabled ? {} : { backgroundColor: '$backgroundHover' }}
      pressStyle={disabled ? {} : { backgroundColor: '$backgroundPress' }}
      onPress={handlePress}
    >
      {showCheckbox && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          disabled={disabled}
          size="small"
        />
      )}

      <YStack flex={1}>
        <XStack alignItems="center" gap={8}>
          <Text
            fontSize={14}
            fontWeight="500"
            color={disabled ? '$placeholderColor' : '$color'}
          >
            {entity.name}
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
        </XStack>

        {entity.description && (
          <Text
            fontSize={12}
            color="$placeholderColor"
            numberOfLines={1}
          >
            {entity.description}
          </Text>
        )}
      </YStack>

      {onInfoPress && (
        <XStack
          padding={4}
          cursor="pointer"
          hoverStyle={{ opacity: 0.7 }}
          onPress={(e) => {
            e.stopPropagation?.()
            handleInfoPress()
          }}
        >
          <FontAwesome
            name="info-circle"
            size={18}
            color={themeColors.placeholderColor}
          />
        </XStack>
      )}
    </XStack>
  )
}
