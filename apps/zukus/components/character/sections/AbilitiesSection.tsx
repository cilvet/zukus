import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack } from 'tamagui'
import { useCharacterAbilities, AbilityCard } from '../../../ui'
import { SectionHeader, SectionCard, SkillItem } from '../CharacterComponents'
import { MOCK_CHARACTER } from '../data'
import { useNavigateToDetail } from '../../../navigation'

/**
 * Seccion de ability scores y skills.
 * Usa selector de Zustand para abilities (re-render granular).
 * El AbilityCard detecta cambios en su score y hace glow automáticamente.
 */
export function AbilitiesSection() {
  const navigateToDetail = useNavigateToDetail()
  const abilities = useCharacterAbilities()

  const handleAbilityPress = (abilityKey: string) => {
    navigateToDetail('ability', abilityKey)
  }

  // Si no hay datos aún, mostrar placeholder
  if (!abilities) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <YStack padding={16}>
          <SectionCard>
            <SectionHeader icon="*" title="Cargando..." />
          </SectionCard>
        </YStack>
      </View>
    )
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
          <SectionHeader icon="*" title="Ability Scores" />
          <YStack gap={12}>
            <XStack justifyContent="space-between">
              <AbilityCard
                abilityKey="strength"
                score={abilities.strength.totalScore}
                modifier={abilities.strength.totalModifier}
                onPress={() => handleAbilityPress('strength')}
              />
              <AbilityCard
                abilityKey="dexterity"
                score={abilities.dexterity.totalScore}
                modifier={abilities.dexterity.totalModifier}
                onPress={() => handleAbilityPress('dexterity')}
              />
              <AbilityCard
                abilityKey="constitution"
                score={abilities.constitution.totalScore}
                modifier={abilities.constitution.totalModifier}
                onPress={() => handleAbilityPress('constitution')}
              />
            </XStack>
            <XStack justifyContent="space-between">
              <AbilityCard
                abilityKey="intelligence"
                score={abilities.intelligence.totalScore}
                modifier={abilities.intelligence.totalModifier}
                onPress={() => handleAbilityPress('intelligence')}
              />
              <AbilityCard
                abilityKey="wisdom"
                score={abilities.wisdom.totalScore}
                modifier={abilities.wisdom.totalModifier}
                onPress={() => handleAbilityPress('wisdom')}
              />
              <AbilityCard
                abilityKey="charisma"
                score={abilities.charisma.totalScore}
                modifier={abilities.charisma.totalModifier}
                onPress={() => handleAbilityPress('charisma')}
              />
            </XStack>
          </YStack>
        </SectionCard>

        <SectionCard>
          <SectionHeader icon="#" title="Skills" />
          <YStack>
            {/* Skills siguen usando mock por ahora - se migrarán en fase 6.5 */}
            {MOCK_CHARACTER.skills.map((skill, index) => (
              <SkillItem key={index} skill={skill} />
            ))}
          </YStack>
        </SectionCard>
      </ScrollView>
    </View>
  )
}
