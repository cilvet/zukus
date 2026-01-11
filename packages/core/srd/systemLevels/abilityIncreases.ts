/**
 * Character Ability Increase Entities for D&D 3.5
 * 
 * These entities represent the +1 ability score increases
 * that characters can select at levels 4, 8, 12, 16, 20.
 * 
 * Each entity applies a +1 UNTYPED bonus to its respective ability score.
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { Effect } from '../../core/domain/character/baseData/effects';
import { effectTargets } from '../../core/domain/character/baseData/effects';

// =============================================================================
// Helper function
// =============================================================================

function createAbilityIncrease(
  abilityId: string,
  abilityName: string
): StandardEntity {
  return {
    id: `${abilityId}-increase`,
    entityType: 'character_ability_increase',
    name: `+1 ${abilityName}`,
    description: `Permanently increase your ${abilityName} score by 1.`,
    tags: ['abilityIncrease', abilityId],
    
    abilityId,
    
    effects: [
      {
        target: effectTargets.ABILITY_SCORE(abilityId),
        formula: { expression: '1' },
        bonusTypeId: 'UNTYPED',
      } as Effect,
    ],
  } as StandardEntity;
}

// =============================================================================
// Ability Increase Entities
// =============================================================================

export const strengthIncrease = createAbilityIncrease('strength', 'Strength');
export const dexterityIncrease = createAbilityIncrease('dexterity', 'Dexterity');
export const constitutionIncrease = createAbilityIncrease('constitution', 'Constitution');
export const intelligenceIncrease = createAbilityIncrease('intelligence', 'Intelligence');
export const wisdomIncrease = createAbilityIncrease('wisdom', 'Wisdom');
export const charismaIncrease = createAbilityIncrease('charisma', 'Charisma');

// =============================================================================
// All ability increases
// =============================================================================

export const allAbilityIncreases: StandardEntity[] = [
  strengthIncrease,
  dexterityIncrease,
  constitutionIncrease,
  intelligenceIncrease,
  wisdomIncrease,
  charismaIncrease,
];

