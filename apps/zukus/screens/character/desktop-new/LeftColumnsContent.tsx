import { YStack } from 'tamagui'
import {
  useCharacterSavingThrows,
  SavingThrowCard,
  BuffsCompact,
} from '../../../ui'
import { SkillsSection } from '../../../ui/components/character/SkillsSection'
import { SectionHeader, SectionCard } from '../../../components/character'
import { LeftColumn, LAYOUT_DIMENSIONS } from '../../../components/layout'

type LeftColumnsContentProps = {
  onSavingThrowPress: (key: string) => void
}

export function LeftColumnsContent({ onSavingThrowPress }: LeftColumnsContentProps) {
  const savingThrows = useCharacterSavingThrows()

  return (
    <>
      {/* Column 1: Saving Throws + Buffs */}
      <LeftColumn width={LAYOUT_DIMENSIONS.leftColumn1Width}>
        {savingThrows && (
          <SectionCard>
            <SectionHeader icon="*" title="Saving Throws" />
            <YStack gap={8}>
              <SavingThrowCard
                savingThrowKey="fortitude"
                totalValue={savingThrows.fortitude.totalValue}
                onPress={() => onSavingThrowPress('fortitude')}
              />
              <SavingThrowCard
                savingThrowKey="reflex"
                totalValue={savingThrows.reflex.totalValue}
                onPress={() => onSavingThrowPress('reflex')}
              />
              <SavingThrowCard
                savingThrowKey="will"
                totalValue={savingThrows.will.totalValue}
                onPress={() => onSavingThrowPress('will')}
              />
            </YStack>
          </SectionCard>
        )}
        <SectionCard>
          <SectionHeader icon="*" title="Buffs" />
          <BuffsCompact />
        </SectionCard>
      </LeftColumn>

      {/* Column 2: Skills */}
      <LeftColumn width={LAYOUT_DIMENSIONS.leftColumn2Width}>
        <SectionCard>
          <SectionHeader icon="#" title="Skills" />
          <SkillsSection />
        </SectionCard>
      </LeftColumn>
    </>
  )
}
