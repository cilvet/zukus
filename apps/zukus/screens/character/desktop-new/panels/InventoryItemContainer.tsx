import { YStack, XStack, Text } from 'tamagui'
import { Pressable } from 'react-native'
import {
  useCharacterStore,
  useInventoryState,
  GenericEntityDetailPanel,
} from '../../../../ui'
import { usePanelNavigation } from '../../../../hooks'
import type { ComputedEntity } from '@zukus/core'

type Props = {
  instanceId: string
}

export function InventoryItemContainer({ instanceId }: Props) {
  const inventoryState = useInventoryState()
  const setInventoryInstanceField = useCharacterStore((state) => state.setInventoryInstanceField)
  const updateInventoryItem = useCharacterStore((state) => state.updateInventoryItem)
  const removeFromInventory = useCharacterStore((state) => state.removeFromInventory)
  const { closePanel } = usePanelNavigation('character')

  const item = inventoryState.items.find((i) => i.instanceId === instanceId)

  if (!item) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Item no encontrado</Text>
      </YStack>
    )
  }

  // Convert InventoryItemInstance to ComputedEntity format for GenericEntityDetailPanel
  const entity = item.entity
  if (!entity) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Entity data not available</Text>
      </YStack>
    )
  }

  // Merge quantity from item into entity so it appears in instance fields
  const computedEntity = {
    ...entity,
    quantity: item.quantity,
    _meta: {
      source: {
        originType: 'inventory' as const,
        originId: item.instanceId,
        name: entity.name,
      },
      suppressed: false,
    },
  } as unknown as ComputedEntity

  const handleRemove = () => {
    removeFromInventory(instanceId)
    closePanel()
  }

  const handleInstanceFieldChange = (field: string, value: unknown) => {
    // Handle quantity separately (it's stored directly on InventoryItemInstance)
    if (field === 'quantity' && typeof value === 'number') {
      updateInventoryItem(instanceId, { quantity: value })
      return
    }
    // Handle boolean instance fields (equipped, wielded, active, etc.)
    if (typeof value === 'boolean') {
      setInventoryInstanceField(instanceId, field, value)
    }
  }

  return (
    <YStack gap={16}>
      <GenericEntityDetailPanel
        entity={computedEntity}
        onInstanceFieldChange={handleInstanceFieldChange}
      />
      <XStack gap={8} paddingHorizontal={16}>
        <Pressable onPress={handleRemove}>
          <YStack
            padding={8}
            borderRadius={6}
            backgroundColor="$red4"
            borderWidth={1}
            borderColor="$red8"
          >
            <Text fontSize={12} color="$red10">
              Remove
            </Text>
          </YStack>
        </Pressable>
      </XStack>
    </YStack>
  )
}
