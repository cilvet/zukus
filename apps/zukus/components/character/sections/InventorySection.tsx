import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, Text } from 'tamagui'
import { SectionHeader } from '../CharacterComponents'
import { useNavigateToDetail } from '../../../navigation'
import {
  useCharacterStore,
  useInventoryState,
  InventoryList,
  InventoryLayoutToggle,
  InventoryHeader,
  type InventoryLayout,
} from '../../../ui'
import { useState } from 'react'

/**
 * Seccion de inventario (nuevo sistema basado en entidades).
 */
export function InventorySection() {
  const navigateToDetail = useNavigateToDetail()
  const inventoryState = useInventoryState()
  const toggleInventoryEquipped = useCharacterStore((state) => state.toggleInventoryEquipped)
  const [layout, setLayout] = useState<InventoryLayout>('balanced')

  const handleItemPress = (instanceId: string, itemName: string) => {
    navigateToDetail('inventoryItem', instanceId, itemName)
  }

  const handleCurrenciesPress = () => {
    // TODO: Open currency edit panel
  }

  // Calculate total weight
  const items = inventoryState?.items ?? []
  const currencies = inventoryState?.currencies ?? {}

  const currentWeight = items.reduce((total, item) => {
    const weight = item.entity?.weight
    if (typeof weight === 'number') {
      return total + weight * item.quantity
    }
    return total
  }, 0)

  // TODO: Get max weight from character sheet (based on STR and encumbrance rules)
  const maxWeight = 100

  return (
    <View style={{ flex: 1 }} collapsable={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <YStack gap={12}>
          <SectionHeader
            icon="I"
            title="Inventario"
            action={<InventoryLayoutToggle layout={layout} onChange={setLayout} />}
          />

          <InventoryHeader
            currentWeight={currentWeight}
            maxWeight={maxWeight}
            currencies={currencies}
            onCurrenciesPress={handleCurrenciesPress}
          />

          {items.length === 0 ? (
            <Text color="$placeholderColor">Sin items en el inventario.</Text>
          ) : (
            <InventoryList
              items={items}
              layout={layout}
              onItemPress={(item) => {
                const name = item.customName ?? item.entity?.name ?? item.itemId
                handleItemPress(item.instanceId, name)
              }}
              onToggleEquipped={(item) => toggleInventoryEquipped(item.instanceId)}
            />
          )}
        </YStack>
      </ScrollView>
    </View>
  )
}
