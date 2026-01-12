import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { YStack } from 'tamagui'
import { useCollapsibleHeaderContext } from '../../../contexts'
import { SectionHeader, SectionCard, ItemCard } from '../CharacterComponents'
import { MOCK_CHARACTER } from '../data'

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

/**
 * Seccion de equipamiento/inventario.
 */
export function EquipmentSection() {
  const router = useRouter()
  const { scrollHandler, headerHeight } = useCollapsibleHeaderContext()

  const handleItemPress = (itemId: string, itemName: string) => {
    router.push({
      pathname: '/(tabs)/(character)/[id]',
      params: { id: itemId, type: 'item', name: itemName },
    })
  }

  return (
    <View style={{ flex: 1 }} collapsable={false}>
      <AnimatedScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, paddingTop: headerHeight, gap: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
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
      </AnimatedScrollView>
    </View>
  )
}
