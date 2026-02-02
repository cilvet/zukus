import { Pressable } from 'react-native'
import { XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import type { ButtonConfig } from '../types'
import { isDropdownConfig } from '../types'

type ActionButtonProps = {
  config: ButtonConfig
  entityId: string
  accentColor: string
  placeholderColor: string
  disabled?: boolean
  /** For dropdown: opens the dropdown sheet */
  onOpenDropdown?: (entityId: string) => void
  /** For counter: executes action directly */
  onExecute?: (actionId: string, entityId: string) => void
}

/**
 * Action button rendered in each entity row.
 *
 * - Dropdown type: Shows label + chevron, opens dropdown on press
 * - Counter type: Shows action label, executes directly on press
 */
export function ActionButton({
  config,
  entityId,
  accentColor,
  placeholderColor,
  disabled = false,
  onOpenDropdown,
  onExecute,
}: ActionButtonProps) {
  const handlePress = () => {
    if (disabled) return

    if (isDropdownConfig(config)) {
      onOpenDropdown?.(entityId)
    } else {
      onExecute?.(config.action.id, entityId)
    }
  }

  const label = isDropdownConfig(config) ? config.label : config.action.label
  const icon = isDropdownConfig(config) ? config.icon : config.action.icon

  return (
    <Pressable onPress={handlePress} hitSlop={8} disabled={disabled}>
      {({ pressed }) => (
        <XStack
          backgroundColor={disabled ? '$uiBackgroundColor' : accentColor}
          paddingHorizontal={12}
          paddingVertical={8}
          borderRadius={8}
          alignItems="center"
          gap={6}
          opacity={disabled ? 0.5 : pressed ? 0.7 : 1}
        >
          {icon && (
            <FontAwesome6
              name={icon as any}
              size={12}
              color={disabled ? placeholderColor : '#FFFFFF'}
            />
          )}
          <Text
            fontSize={13}
            fontWeight="600"
            color={disabled ? '$placeholderColor' : '#FFFFFF'}
          >
            {label}
          </Text>
          {isDropdownConfig(config) && (
            <FontAwesome6
              name="chevron-down"
              size={10}
              color={disabled ? placeholderColor : '#FFFFFF'}
            />
          )}
        </XStack>
      )}
    </Pressable>
  )
}
