import { YStack } from 'tamagui'
import type { InventoryItemInstance } from '@zukus/core'
import { InventoryItemView } from './InventoryItemView'

type InventoryListProps = {
  items: InventoryItemInstance[]
  onItemPress?: (item: InventoryItemInstance) => void
  onToggleEquipped?: (item: InventoryItemInstance) => void
}

export function InventoryList({
  items,
  onItemPress,
  onToggleEquipped,
}: InventoryListProps) {
  "use no memo"
  return (
    <YStack gap={4}>
      {items.map((item) => (
        <InventoryItemView
          key={item.instanceId}
          item={item}
          onPress={() => onItemPress?.(item)}
          onToggleEquipped={() => onToggleEquipped?.(item)}
        />
      ))}
    </YStack>
  )
}
