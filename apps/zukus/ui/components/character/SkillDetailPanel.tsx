import { YStack, Text, XStack } from 'tamagui'
import type { SourceValue } from '@zukus/core'
import { SourceValuesTable } from './SourceValuesTable'
import { useTheme } from '../../contexts/ThemeContext'

const ABILITY_NAMES: Record<string, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
}

type SkillDetailPanelProps = {
  skillName: string
  abilityKey: string
  totalBonus: number
  isClassSkill: boolean
  sourceValues: SourceValue[]
}

/**
 * Panel de detalle de una skill.
 * Muestra el total bonus, el ability usado, si es class skill, y los source values.
 * Compartido entre mobile y desktop.
 */
export function SkillDetailPanel({
  skillName,
  abilityKey,
  totalBonus,
  isClassSkill,
  sourceValues,
}: SkillDetailPanelProps) {
  const { themeInfo } = useTheme()
  const colors = themeInfo.colors

  const abilityName = ABILITY_NAMES[abilityKey] ?? abilityKey
  const bonusText = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`

  return (
    <YStack gap={20}>
      {/* Header: nombre de la skill */}
      <YStack gap={4}>
        <Text fontSize={24} fontWeight="700" color={colors.primary}>
          {skillName}
        </Text>
        <Text fontSize={14} color={colors.accent}>
          Ability: {abilityName}
        </Text>
      </YStack>

      {/* Total bonus */}
      <YStack gap={8}>
        <Text fontSize={15} fontWeight="600" color={colors.accent}>
          Total Bonus
        </Text>
        <Text fontSize={32} fontWeight="800" color="#ffffff">
          {bonusText}
        </Text>
      </YStack>

      {/* Class skill indicator */}
      <XStack gap={8} alignItems="center">
        <Text fontSize={18} color={colors.accent}>
          {isClassSkill ? '●' : '○'}
        </Text>
        <Text fontSize={15} color={colors.primary}>
          {isClassSkill ? 'Class Skill' : 'Not a Class Skill'}
        </Text>
      </XStack>

      {/* Source values breakdown */}
      <YStack gap={12}>
        <Text fontSize={15} fontWeight="600" color={colors.accent}>
          Breakdown
        </Text>
        <SourceValuesTable sourceValues={sourceValues} />
      </YStack>
    </YStack>
  )
}
