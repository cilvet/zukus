import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, Text } from 'tamagui'
import { SectionHeader } from '../CharacterComponents'
import { useNavigateToDetail } from '../../../navigation'
import { useCharacterSheet, useCharacterStore, EquipmentList, EquipmentLayoutToggle, type EquipmentLayout } from '../../../ui'
import { useState } from 'react'

/**
 * Seccion de equipamiento/inventario.
 */
export function EquipmentSection() {
  const navigateToDetail = useNavigateToDetail()
  const characterSheet = useCharacterSheet()
  const toggleItemEquipped = useCharacterStore((state) => state.toggleItemEquipped)
  const [layout, setLayout] = useState<EquipmentLayout>('balanced')

  const handleItemPress = (itemId: string, itemName: string) => {
    navigateToDetail('equipment', itemId, itemName)
  }

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
            icon="E"
            title="Equipment"
            action={<EquipmentLayoutToggle layout={layout} onChange={setLayout} />}
          />
          {!characterSheet ? (
            <Text color="$placeholderColor">Cargando...</Text>
          ) : characterSheet.equipment.items.length === 0 ? (
            <Text color="$placeholderColor">Sin items en el inventario.</Text>
          ) : (
            <EquipmentList
              items={characterSheet.equipment.items}
              layout={layout}
              onItemPress={(item) => handleItemPress(item.uniqueId, item.name)}
              onToggleEquipped={(item) => toggleItemEquipped(item.uniqueId)}
            />
          )}
        </YStack>
      </ScrollView>
    </View>
  )
}
