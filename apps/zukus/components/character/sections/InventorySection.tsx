import { View, Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { SectionHeader } from '../CharacterComponents'
import { useNavigateToDetail } from '../../../navigation'
import {
  useCharacterStore,
  useInventoryState,
  useTheme,
  InventoryList,
  InventoryHeader,
} from '../../../ui'

/**
 * Seccion de inventario (nuevo sistema basado en entidades).
 */
export function InventorySection() {
  const navigateToDetail = useNavigateToDetail()
  const inventoryState = useInventoryState()
  const toggleInventoryEquipped = useCharacterStore((state) => state.toggleInventoryEquipped)
  const { themeInfo } = useTheme()

  const handleItemPress = (instanceId: string, itemName: string) => {
    navigateToDetail('inventoryItem', instanceId, itemName)
  }

  const handleAddItem = () => {
    navigateToDetail('itemBrowser', 'browse', 'Buscar Items')
  }

  const handleCurrenciesPress = () => {
    navigateToDetail('currencyEdit', 'edit', 'Monedas')
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
            action={
              <Pressable onPress={handleAddItem} hitSlop={8}>
                {({ pressed }) => (
                  <XStack
                    backgroundColor={themeInfo.colors.accent}
                    paddingHorizontal={10}
                    paddingVertical={6}
                    borderRadius={6}
                    alignItems="center"
                    gap={4}
                    opacity={pressed ? 0.7 : 1}
                  >
                    <FontAwesome6 name="plus" size={12} color="#FFFFFF" />
                    <Text fontSize={12} fontWeight="600" color="#FFFFFF">
                      Anadir
                    </Text>
                  </XStack>
                )}
              </Pressable>
            }
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
