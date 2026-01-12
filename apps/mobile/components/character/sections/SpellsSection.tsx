import { View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { YStack } from 'tamagui'
import { useCollapsibleHeaderContext } from '../../../contexts'
import { SectionHeader, SectionCard, ItemCard } from '../CharacterComponents'
import { MOCK_CHARACTER } from '../data'

/**
 * Seccion de hechizos.
 */
export function SpellsSection() {
  const router = useRouter()
  const { scrollHandler, headerHeight } = useCollapsibleHeaderContext()

  const handleSpellPress = (spellId: string, spellName: string) => {
    router.push({
      pathname: '/(tabs)/(character)/[id]',
      params: { id: spellId, type: 'item', name: spellName },
    })
  }

  return (
    <View style={{ flex: 1 }} collapsable={false}>
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, paddingTop: headerHeight, gap: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <SectionCard>
          <SectionHeader icon="📜" title="Spells" />
          <YStack gap={8}>
            {MOCK_CHARACTER.spells.map((spell, idx) => (
              <ItemCard
                key={idx}
                name={spell.name}
                subtitle={`Level ${spell.level}`}
                onPress={() => handleSpellPress(`spell-${idx}`, spell.name)}
              />
            ))}
          </YStack>
        </SectionCard>
      </Animated.ScrollView>
    </View>
  )
}
