import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack } from 'tamagui'
import { SectionHeader, SectionCard, StatBox } from '../CharacterComponents'
import { MOCK_CHARACTER } from '../data'

/**
 * Seccion de estadisticas de combate.
 */
export function CombatSection() {
  return (
    <View style={{ flex: 1 }} collapsable={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <SectionCard>
          <SectionHeader icon="⚔️" title="Combat Stats" />
          <YStack gap={8}>
            <StatBox label="Armor Class" value={MOCK_CHARACTER.ac} icon="🛡️" />
            <StatBox label="Speed" value={`${MOCK_CHARACTER.speed}ft`} icon="👟" />
            <StatBox label="Proficiency" value={`+${MOCK_CHARACTER.proficiencyBonus}`} icon="⭐" />
          </YStack>
        </SectionCard>
      </ScrollView>
    </View>
  )
}
