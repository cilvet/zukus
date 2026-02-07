import { Pressable } from 'react-native'
import { XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import type { EntityInstance } from '@zukus/core'
import { getLocalizedEntity, type LocalizationContext } from '@zukus/core'
import { useActiveLocale } from '../../ui/stores/translationStore'

export type SelectedChipsProps = {
  selectedEntities: EntityInstance[]
  onDeselect: (instanceId: string) => void
  placeholderColor: string
}

export function SelectedChips({
  selectedEntities,
  onDeselect,
  placeholderColor,
}: SelectedChipsProps) {
  'use no memo'

  const locale = useActiveLocale()
  const ctx: LocalizationContext = { locale, compendiumLocale: 'en' }

  const localizedEntities = selectedEntities.map((instance) => ({
    ...instance,
    entity: getLocalizedEntity(instance.entity, ctx),
  }))

  if (localizedEntities.length === 0) return null

  return (
    <XStack gap={8} flexWrap="wrap" testID="selected-chips">
      {localizedEntities.map((instance) => (
        <XStack
          key={instance.instanceId}
          backgroundColor="$uiBackgroundColor"
          borderRadius={16}
          paddingHorizontal={10}
          paddingVertical={6}
          borderWidth={1}
          borderColor="$borderColor"
          alignItems="center"
          gap={6}
        >
          <Text fontSize={13} color="$color">
            {instance.entity.name}
          </Text>
          <Pressable
            onPress={() => onDeselect(instance.instanceId)}
            hitSlop={8}
            testID={`chip-remove-${instance.entity.id}`}
          >
            {({ pressed }) => (
              <FontAwesome6
                name="xmark"
                size={14}
                color={placeholderColor}
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>
        </XStack>
      ))}
    </XStack>
  )
}
