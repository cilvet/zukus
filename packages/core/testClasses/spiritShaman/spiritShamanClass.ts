/**
 * Spirit Shaman Class Entity (Complete Divine)
 *
 * TEST CLASS - Not D&D 3.5 SRD
 *
 * Divine caster who retrieves spells from spirits and casts spontaneously within each level.
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
// Spirit Shaman Class
// =============================================================================

/**
 * Spirit Shaman class entity
 *
 * Key features:
 * - Divine spellcasting with retrieval (list per level)
 * - Spontaneous casting within each level
 * - Charisma-based spellcasting
 * - Spirit Guide
 * - Medium BAB, good Will and Fortitude saves
 */
export const spiritShamanClass: StandardEntity = {
  id: 'spirit-shaman',
  entityType: 'class',
  name: 'Spirit Shaman',
  description:
    'A spirit shaman is a divine spellcaster who draws power from the spirit world. Unlike clerics or druids, a spirit shaman retrieves spells each day from spirits and can then cast those spells spontaneously throughout the day.',

  hitDie: 8,
  babProgression: 'medium',
  saves: {
    fortitude: 'good',
    reflex: 'poor',
    will: 'good',
  },
  skillPointsPerLevel: '4 + @ability.intelligence.modifier',
  classSkillIds: [
    'concentration',
    'craft',
    'diplomacy',
    'handle-animal',
    'heal',
    'knowledge-nature',
    'knowledge-planes',
    'listen',
    'profession',
    'ride',
    'spellcraft',
    'spot',
    'survival',
    'swim',
  ],
  classType: 'base',

  levels: {
    '1': {
      providers: [
        grantFeature('spirit-shaman-spellcasting'),
        grantFeature('spirit-shaman-spirit-guide'),
      ],
    },
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
