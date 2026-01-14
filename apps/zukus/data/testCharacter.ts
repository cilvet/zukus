import { buildCharacter } from '@zukus/core'
import { fighter } from '@zukus/core/srd/classes'
import {
  bullStrength,
  catsGrace,
  bearsEndurance,
  foxsCunning,
  owlsWisdom,
  eaglesSplendor,
} from '@zukus/core/srd/commonBuffs/commonBuffs'

/**
 * Buffs de enhancement para abilities.
 * Inicialmente todos están desactivados (active: false).
 * El UI permitirá activarlos/desactivarlos.
 */
const enhancementBuffs = [
  { ...bullStrength, active: false },
  { ...catsGrace, active: false },
  { ...bearsEndurance, active: false },
  { ...foxsCunning, active: false },
  { ...owlsWisdom, active: false },
  { ...eaglesSplendor, active: false },
]

const characterBuilder = buildCharacter()
  .withName('Gorwin el Arquero')
  .withBaseAbilityScores({
    strength: 14,
    dexterity: 18,
    constitution: 14,
    intelligence: 10,
    wisdom: 12,
    charisma: 8,
  })
  .withClassLevels(fighter, 5, true)
  .withSkillRanks('climb', 4)
  .withSkillRanks('jump', 4)
  .withSkillRanks('intimidate', 4)
  .withBuffs(enhancementBuffs)

export const testBaseData = characterBuilder.build()
export const testCharacterSheet = characterBuilder.buildCharacterSheet()

/**
 * Mapa de buff uniqueId -> abilityKey para la UI.
 * Usado por BuffsSection para saber qué ability se afecta.
 */
export const BUFF_ABILITY_MAP: Record<string, string> = {
  'bulls-strength': 'strength',
  'cats-grace': 'dexterity',
  'bears-endurance': 'constitution',
  'foxs-cunning': 'intelligence',
  'owls-wisdom': 'wisdom',
  'eagles-splendor': 'charisma',
}

/**
 * Info de display para los buffs de enhancement.
 */
export const BUFF_DISPLAY_INFO: Record<
  string,
  { name: string; emoji: string; checkboxVariant: string }
> = {
  'bulls-strength': { name: 'Fuerza de Toro', emoji: '🐂', checkboxVariant: 'diamond' },
  'cats-grace': { name: 'Gracia Felina', emoji: '🐱', checkboxVariant: 'circle' },
  'bears-endurance': { name: 'Resistencia del Oso', emoji: '🐻', checkboxVariant: 'gothic' },
  'foxs-cunning': { name: 'Astucia del Zorro', emoji: '🦊', checkboxVariant: 'gear' },
  'owls-wisdom': { name: 'Sabiduría del Búho', emoji: '🦉', checkboxVariant: 'shield' },
  'eagles-splendor': { name: 'Esplendor del Águila', emoji: '🦅', checkboxVariant: 'star' },
}
