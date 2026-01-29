/**
 * Sorcerer Class Entity for D&D 3.5
 *
 * Arcane spellcaster who casts spontaneously using innate magical power.
 * Uses Charisma for spellcasting and has limited spells known.
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { EntityProvider } from '../../core/domain/levels/providers/types';

// =============================================================================
// Helpers
// =============================================================================

function grantFeature(featureId: string): EntityProvider {
  return {
    granted: {
      specificIds: [featureId],
    },
  };
}

// =============================================================================
// Sorcerer Class
// =============================================================================

/**
 * Sorcerer class entity
 *
 * Key features:
 * - Arcane spellcasting with limited spells known
 * - Spontaneous casting (no preparation needed)
 * - Charisma-based spellcasting
 * - Familiar
 * - Poor BAB, good Will save
 */
export const sorcererClass: StandardEntity = {
  id: 'sorcerer',
  entityType: 'class',
  name: 'Sorcerer',
  description:
    'Sorcerers create magic the way a poet creates poems, with inborn talent honed by practice. They have no books, no mentors, no theories—just raw power that they direct at will. Some sorcerers claim that the blood of dragons courses through their veins.',

  hitDie: 4,
  babProgression: 'poor',
  saves: {
    fortitude: 'poor',
    reflex: 'poor',
    will: 'good',
  },
  skillPointsPerLevel: '2 + @ability.intelligence.modifier',
  classSkillIds: [
    'bluff',
    'concentration',
    'craft',
    'knowledge-arcana',
    'profession',
    'spellcraft',
  ],
  classType: 'base',

  levels: {
    '1': { providers: [grantFeature('sorcerer-spellcasting'), grantFeature('sorcerer-familiar')] },
    '2': { providers: [] },
    '3': { providers: [] },
    '4': { providers: [] },
    '5': { providers: [] },
    '6': { providers: [] },
    '7': { providers: [] },
    '8': { providers: [] },
    '9': { providers: [] },
    '10': { providers: [] },
    '11': { providers: [] },
    '12': { providers: [] },
    '13': { providers: [] },
    '14': { providers: [] },
    '15': { providers: [] },
    '16': { providers: [] },
    '17': { providers: [] },
    '18': { providers: [] },
    '19': { providers: [] },
    '20': { providers: [] },
  },
} as StandardEntity;
