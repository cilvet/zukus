import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack } from 'tamagui'
import { SectionHeader, SectionCard, ItemCard } from '../CharacterComponents'
import { MOCK_CHARACTER } from '../data'
import { useNavigateToDetail } from '../../../navigation'

/**
 * Seccion de equipamiento/inventario.
 */
export function EquipmentSection() {
  const navigateToDetail = useNavigateToDetail()

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
        <SectionCard>
          <SectionHeader icon="🎒" title="Equipment" />
          <YStack gap={8}>
            {MOCK_CHARACTER.equipment.map((item, idx) => (
              <ItemCard
                key={idx}
                name={item.name}
                subtitle={item.type}
                onPress={() => handleItemPress(`equipment-${idx}`, item.name)}
              />
            ))}
          </YStack>
        </SectionCard>
      </ScrollView>
    </View>
  )
}
