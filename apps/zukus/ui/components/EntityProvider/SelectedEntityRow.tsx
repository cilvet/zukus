/**
 * SelectedEntityRow - A row showing an already selected entity
 *
 * Shows entity with checked checkbox and option to deselect.
 */

import { XStack, YStack, Text } from 'tamagui'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import type { StandardEntity, EntityInstance } from '@zukus/core'
import { Checkbox } from '../../atoms'
import { useTheme } from '../../contexts/ThemeContext'
import { useLocalizedEntity } from '../../hooks/useLocalizedEntity'

export type SelectedEntityRowProps = {
  entityInstance: EntityInstance
  onDeselect: () => void
  onInfoPress?: (entity: StandardEntity) => void
}

export function SelectedEntityRow({
  entityInstance,
  onDeselect,
  onInfoPress,
}: SelectedEntityRowProps) {
  const { themeColors } = useTheme()
  const entity = useLocalizedEntity(entityInstance.entity)

  function handleToggle(checked: boolean) {
    if (!checked) {
      onDeselect()
    }
  }

  function handleInfoPress() {
    onInfoPress?.(entity)
  }

  return (
    <XStack
      width="100%"
      paddingVertical={6}
      paddingHorizontal={12}
      backgroundColor="$backgroundHover"
      borderRadius={8}
      borderWidth={1}
      borderColor="$borderColorHover"
      alignItems="center"
      gap={8}
      cursor="pointer"
      hoverStyle={{ backgroundColor: '$backgroundPress' }}
      onPress={() => handleToggle(false)}
    >
      <Checkbox
        checked={true}
        onCheckedChange={handleToggle}
        size="small"
      />

      <YStack flex={1}>
        <Text fontSize={14} fontWeight="500" color="$color">
          {entity.name}
        </Text>
        {entity.description && (
          <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
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
