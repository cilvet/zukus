import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useRouter } from 'expo-router'
import { YStack, XStack } from 'tamagui'
import { useCharacterAbilities } from '@zukus/ui'
import { SectionHeader, SectionCard, AbilityCard, SkillItem } from '../CharacterComponents'
import { MOCK_CHARACTER } from '../data'
import type { Ability } from '../data'

/**
 * Mapea los datos de ability del core al formato esperado por AbilityCard.
 */
function mapAbility(coreAbility: { totalScore: number; totalModifier: number }): Ability {
  return {
    score: coreAbility.totalScore,
    modifier: coreAbility.totalModifier,
  }
}

/**
 * Seccion de ability scores y skills.
 * Usa selector de Zustand para abilities (re-render granular).
 */
export function AbilitiesSection() {
  const router = useRouter()
  const abilities = useCharacterAbilities()

  const handleAbilityPress = (abilityKey: string) => {
    router.push({
      pathname: '/(tabs)/(character)/[id]',
      params: { id: abilityKey, type: 'ability' },
    })
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
                ability={mapAbility(abilities.strength)}
                onPress={() => handleAbilityPress('strength')}
              />
              <AbilityCard
                abilityKey="dexterity"
                ability={mapAbility(abilities.dexterity)}
                onPress={() => handleAbilityPress('dexterity')}
              />
              <AbilityCard
                abilityKey="constitution"
                ability={mapAbility(abilities.constitution)}
                onPress={() => handleAbilityPress('constitution')}
              />
            </XStack>
            <XStack justifyContent="space-between">
              <AbilityCard
                abilityKey="intelligence"
                ability={mapAbility(abilities.intelligence)}
                onPress={() => handleAbilityPress('intelligence')}
              />
              <AbilityCard
                abilityKey="wisdom"
                ability={mapAbility(abilities.wisdom)}
                onPress={() => handleAbilityPress('wisdom')}
              />
              <AbilityCard
                abilityKey="charisma"
                ability={mapAbility(abilities.charisma)}
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
