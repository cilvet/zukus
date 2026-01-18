import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack } from 'tamagui'
import { SectionHeader, SectionCard, ItemCard } from '../CharacterComponents'
import { MOCK_CHARACTER } from '../data'
import { useNavigateToDetail } from '../../../navigation'

/**
 * Seccion de hechizos.
 */
export function SpellsSection() {
  const navigateToDetail = useNavigateToDetail()

  const handleSpellPress = (spellId: string, spellName: string) => {
    navigateToDetail('spell', spellId, spellName)
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
      </ScrollView>
    </View>
  )
}
