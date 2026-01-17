import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack } from 'tamagui'
import { useCharacterSavingThrows, useCharacterArmorClass, useCharacterInitiative, useCharacterBAB, SavingThrowCard, ArmorClassCard, InitiativeCard, BABCard } from '../../../ui'
import { useNavigateToDetail } from '../../../navigation'
import { SectionHeader, SectionCard, StatBox } from '../CharacterComponents'
import { MOCK_CHARACTER } from '../data'

/**
 * Seccion de estadisticas de combate.
 */
export function CombatSection() {
  const savingThrows = useCharacterSavingThrows()
  const armorClass = useCharacterArmorClass()
  const initiative = useCharacterInitiative()
  const navigateToDetail = useNavigateToDetail()

  const handleSavingThrowPress = (savingThrowKey: string) => {
    navigateToDetail('savingThrow', savingThrowKey)
  }

  const handleArmorClassPress = () => {
    navigateToDetail('armorClass', 'armorClass')
  }

  const handleInitiativePress = () => {
    navigateToDetail('initiative', 'initiative')
  }

  return (
    <View style={{ flex: 1 }} collapsable={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {armorClass && (
          <SectionCard>
            <SectionHeader icon="AC" title="Armor Class" />
            <ArmorClassCard
              totalAC={armorClass.totalAc.totalValue}
              touchAC={armorClass.touchAc.totalValue}
              flatFootedAC={armorClass.flatFootedAc.totalValue}
              onPress={handleArmorClassPress}
            />
          </SectionCard>
        )}

        <SectionCard>
          <SectionHeader icon="CMBT" title="Combat Stats" />
          <YStack gap={8}>
            {initiative && (
              <InitiativeCard
                totalValue={initiative.totalValue}
                onPress={handleInitiativePress}
              />
            )}
            <StatBox label="Speed" value={`${MOCK_CHARACTER.speed}ft`} icon="SPD" />
            <StatBox label="Proficiency" value={`+${MOCK_CHARACTER.proficiencyBonus}`} icon="PROF" />
          </YStack>
        </SectionCard>

        {savingThrows && (
          <SectionCard>
            <SectionHeader icon="SAVE" title="Saving Throws" />
            <XStack gap={8}>
              <SavingThrowCard
                savingThrowKey="fortitude"
                totalValue={savingThrows.fortitude.totalValue}
                onPress={() => handleSavingThrowPress('fortitude')}
              />
              <SavingThrowCard
                savingThrowKey="reflex"
                totalValue={savingThrows.reflex.totalValue}
                onPress={() => handleSavingThrowPress('reflex')}
              />
              <SavingThrowCard
                savingThrowKey="will"
                totalValue={savingThrows.will.totalValue}
                onPress={() => handleSavingThrowPress('will')}
              />
            </XStack>
          </SectionCard>
        )}
      </ScrollView>
    </View>
  )
}
