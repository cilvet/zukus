import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack } from 'tamagui'
import { useCharacterSavingThrows, useCharacterArmorClass, useCharacterInitiative, useCharacterBAB, useCharacterAttacks, SavingThrowCard, ArmorClassCard, InitiativeCard, BABCard, AttacksSection } from '../../../ui'
import { useNavigateToDetail } from '../../../navigation'
import { SectionHeader, SectionCard } from '../CharacterComponents'
import type { CalculatedAttack } from '@zukus/core'

/**
 * Seccion de estadisticas de combate.
 */
export function CombatSection() {
  const savingThrows = useCharacterSavingThrows()
  const armorClass = useCharacterArmorClass()
  const initiative = useCharacterInitiative()
  const bab = useCharacterBAB()
  const attackData = useCharacterAttacks()
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

  const handleBABPress = () => {
    navigateToDetail('bab', 'bab')
  }

  const handleAttackPress = (attack: CalculatedAttack) => {
    const id = attack.weaponUniqueId ?? attack.name
    navigateToDetail('attack', id, attack.name)
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
            {bab && (
              <BABCard
                totalValue={bab.totalValue}
                multipleAttacks={bab.multipleBaseAttackBonuses}
                onPress={handleBABPress}
              />
            )}
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

        {attackData && attackData.attacks.length > 0 && (
          <SectionCard>
            <SectionHeader icon="ATK" title="Attacks" />
            <AttacksSection
              attacks={attackData.attacks}
              onAttackPress={handleAttackPress}
            />
          </SectionCard>
        )}
      </ScrollView>
    </View>
  )
}
