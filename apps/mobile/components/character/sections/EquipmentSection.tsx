import { View, StyleSheet } from 'react-native'
import Animated from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { YStack } from 'tamagui'
import { themes } from '@zukus/ui'
import { useCollapsibleHeaderContext } from '../../../contexts'
import { SectionHeader, SectionCard, ItemCard } from '../CharacterComponents'
import { MOCK_CHARACTER } from '../data'

const theme = themes.zukus

/**
 * Sección de equipamiento/inventario.
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
    <View style={styles.page} collapsable={false}>
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight }]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
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
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
})
