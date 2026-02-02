import { Pressable } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import type { InventoryItemInstance } from '@zukus/core'
import { Checkbox } from '../../../atoms'
import { EntityImage } from '../../EntityImage'
import { useCompendiumContext } from '../../EntityProvider'
import {
  isItemEquipped,
  isItemWielded,
  isItemActive,
  hasInstanceField,
} from '@zukus/core'

type InventoryItemViewProps = {
  item: InventoryItemInstance
  onPress?: () => void
  onToggleEquipped?: () => void
}

function getItemName(item: InventoryItemInstance): string {
  return item.customName ?? item.entity?.name ?? item.itemId
}

function getWeightText(item: InventoryItemInstance): string | null {
  const weight = item.entity?.weight
  if (typeof weight !== 'number') return null
  const totalWeight = weight * item.quantity
  return `${totalWeight} lb`
}

function StatusIndicators({ item }: { item: InventoryItemInstance }) {
  const equipped = isItemEquipped(item)
  const wielded = isItemWielded(item)
  const active = isItemActive(item)

  if (!equipped && !wielded && !active) return null

  return (
    <XStack gap={4}>
      {equipped && (
        <YStack
          paddingVertical={2}
          paddingHorizontal={6}
          borderRadius={4}
          backgroundColor="$blue4"
        >
          <Text fontSize={9} color="$blue10" fontWeight="600">
            EQ
          </Text>
        </YStack>
      )}
      {wielded && (
        <YStack
          paddingVertical={2}
          paddingHorizontal={6}
          borderRadius={4}
          backgroundColor="$orange4"
        >
          <Text fontSize={9} color="$orange10" fontWeight="600">
            WD
          </Text>
        </YStack>
      )}
      {active && (
        <YStack
          paddingVertical={2}
          paddingHorizontal={6}
          borderRadius={4}
          backgroundColor="$green4"
        >
          <Text fontSize={9} color="$green10" fontWeight="600">
            ON
          </Text>
        </YStack>
      )}
    </XStack>
  )
}

/**
 * Fixed-width slot for equip toggle.
 * Shows checkbox if item supports equipped, otherwise shows a placeholder dash.
 */
function EquipSlot({
  item,
  onToggleEquipped,
}: {
  item: InventoryItemInstance
  onToggleEquipped?: () => void
}) {
  const { compendium } = useCompendiumContext()
  const supportsEquipped = hasInstanceField(item.entityType, 'equipped', compendium)

  // Fixed width container to ensure alignment
  return (
    <YStack width={20} alignItems="center" justifyContent="center">
      {supportsEquipped ? (
        <Checkbox
          checked={isItemEquipped(item)}
          onCheckedChange={() => onToggleEquipped?.()}
          size="small"
          variant="diamond"
        />
      ) : (
        <YStack
          width={12}
          height={2}
          backgroundColor="$borderColor"
          borderRadius={1}
        />
      )}
    </YStack>
  )
}

export function InventoryItemView({
  item,
  onPress,
  onToggleEquipped,
}: InventoryItemViewProps) {
  "use no memo"
  const name = getItemName(item)
  const weightText = getWeightText(item)

  return (
    <XStack
      paddingVertical={8}
      paddingHorizontal={4}
      alignItems="center"
      gap={10}
    >
      {/* Equip slot - fixed width for alignment */}
      <EquipSlot item={item} onToggleEquipped={onToggleEquipped} />

      {/* Image */}
      <EntityImage image={item.entity?.image} fallbackText={name} size={32} />

      {/* Content - pressable */}
      <Pressable onPress={onPress} style={{ flex: 1 }}>
        <XStack alignItems="center" gap={8} flex={1}>
          <YStack gap={2} flex={1}>
            <Text fontSize={14} fontWeight="600" color="$color" numberOfLines={1}>
              {name}
            </Text>
            <StatusIndicators item={item} />
          </YStack>

          {/* Weight on right */}
          {weightText ? (
            <Text fontSize={11} color="$placeholderColor">
              {weightText}
            </Text>
          ) : null}
        </XStack>
      </Pressable>
    </XStack>
  )
}
