import type { Buff } from '@zukus/core'

export type AnyChange = NonNullable<Buff['changes']>[number]

export function getFormulaExpression(formula: AnyChange['formula']): string {
  if (formula && typeof formula === 'object' && 'expression' in formula) {
    return formula.expression
  }
  if (formula && typeof formula === 'object' && 'type' in formula && formula.type === 'switch') {
    return '[switch]'
  }
  return '[formula]'
}

export function formatBonus(expression: string): string {
  const num = Number(expression)
  if (!Number.isNaN(num) && num >= 0) {
    return `+${expression}`
  }
  return expression
}

export function getChangeTypeLabel(change: AnyChange): string {
  switch (change.type) {
    case 'ABILITY_SCORE':
      return 'Ability Score'
    case 'AC':
      return 'Armor Class'
    case 'NATURAL_AC':
      return 'Natural AC'
    case 'SAVING_THROW':
      return 'Saving Throw'
    case 'SKILL':
      return 'Skill'
    case 'ABILITY_SKILLS':
      return 'Ability Skills'
    case 'BAB':
      return 'BAB'
    case 'INITIATIVE':
      return 'Initiative'
    case 'SPEED':
      return 'Speed'
    case 'ATTACK_ROLLS':
      return 'Attack Rolls'
    case 'DAMAGE':
      return 'Damage'
    case 'TEMPORARY_HP':
      return 'Temporary HP'
    case 'SIZE':
      return 'Size'
    case 'WEAPON_SIZE':
      return 'Weapon Size'
    case 'CUSTOM_VARIABLE':
      return 'Custom Variable'
    default:
      return change.type
  }
}

export function getChangeTarget(change: AnyChange): string | null {
  switch (change.type) {
    case 'ABILITY_SCORE':
    case 'ABILITY_SKILLS':
      return (change as { abilityUniqueId: string }).abilityUniqueId
    case 'SAVING_THROW':
      return (change as { savingThrowUniqueId: string }).savingThrowUniqueId
    case 'SKILL':
      return (change as { skillUniqueId: string }).skillUniqueId
    case 'SPEED':
      return (change as { speedUniqueId: string }).speedUniqueId
    case 'CUSTOM_VARIABLE':
      return (change as { uniqueId: string }).uniqueId
    default:
      return null
  }
}
