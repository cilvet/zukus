import type {
  CalculatedAbility,
  CalculatedAbilities,
  CalculatedSavingThrow,
  CalculatedSavingThrows,
  CalculatedSkills,
  CalculatedSingleSkill,
} from '@zukus/core'
import type { Ability } from '../../../components/character/data'

// Character sheet type (inferred from useCharacterSheet)
type CharacterSheetType = {
  equipment: {
    items: Array<{ uniqueId: string; [key: string]: unknown }>
  }
}

/**
 * Gets a calculated ability by key.
 */
export function getCalculatedAbility(
  abilities: CalculatedAbilities | null,
  abilityKey: string
): CalculatedAbility | null {
  if (!abilities) return null
  return (abilities[abilityKey] as CalculatedAbility | undefined) ?? null
}

/**
 * Converts a calculated ability to the panel format.
 */
export function getAbilityForPanel(
  abilities: CalculatedAbilities | null,
  abilityKey: string
): Ability | null {
  const coreAbility = getCalculatedAbility(abilities, abilityKey)
  if (!coreAbility) return null
  return {
    score: coreAbility.totalScore,
    modifier: coreAbility.totalModifier,
  }
}

/**
 * Gets a saving throw by key.
 */
export function getSavingThrowForPanel(
  savingThrows: CalculatedSavingThrows | null,
  savingThrowKey: string
): CalculatedSavingThrow | null {
  if (!savingThrows) return null
  return savingThrows[savingThrowKey as keyof CalculatedSavingThrows] ?? null
}

/**
 * Gets a skill by ID, including sub-skills.
 */
export function getSkillForPanel(
  skills: CalculatedSkills | null,
  skillId: string
): CalculatedSingleSkill | null {
  if (!skills) return null

  const skill = skills[skillId]

  // If not found directly, search in sub-skills
  if (!skill) {
    for (const parentSkill of Object.values(skills)) {
      if (parentSkill.type === 'parent') {
        const subSkill = parentSkill.subSkills.find((s) => s.uniqueId === skillId)
        if (subSkill) {
          return subSkill
        }
      }
    }
    return null
  }

  // Don't show parent skills
  if (skill.type === 'parent') {
    return null
  }

  return skill
}

/**
 * Gets an equipment item by ID.
 */
export function getEquipmentItemForPanel(
  characterSheet: CharacterSheetType | null,
  itemId: string
) {
  if (!characterSheet) return null
  return characterSheet.equipment.items.find((item: { uniqueId: string }) => item.uniqueId === itemId) ?? null
}
