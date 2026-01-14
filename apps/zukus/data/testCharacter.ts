import { buildCharacter } from '@zukus/core'
import { fighter } from '@zukus/core/srd/classes'

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

export const testBaseData = characterBuilder.build()
export const testCharacterSheet = characterBuilder.buildCharacterSheet()
