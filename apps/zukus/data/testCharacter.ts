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
  { ...bullStrength, uniqueId: 'bulls-strength-2', active: false },
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
