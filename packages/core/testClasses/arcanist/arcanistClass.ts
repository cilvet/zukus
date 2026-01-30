/**
 * Arcanist Class Entity (Pathfinder 1e)
 *
 * TEST CLASS - Not D&D 3.5 SRD
 *
 * Hybrid arcane caster combining wizard flexibility with sorcerer spontaneity.
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
// Arcanist Class
// =============================================================================

/**
 * Arcanist class entity
 *
 * Key features:
 * - Arcane spellcasting with spellbook (unlimited known)
 * - List per level preparation (prepare specific spells per level)
 * - Spontaneous casting within prepared spells of each level
 * - Intelligence-based spellcasting
 * - Arcane Reservoir
 * - Poor BAB, good Will save
 */
export const arcanistClass: StandardEntity = {
  id: 'arcanist',
  entityType: 'class',
  name: 'Arcanist',
  description:
    'Some spellcasters seek the secrets of magic, pursuing the power to make the impossible possible. Others are born with magic in their blood, or acquire it through study. Arcanists are blessed with both approaches, using their unique understanding of the ways of magic to unlock its secrets.',

  hitDie: 6,
  babProgression: 'poor',
  saves: {
    fortitude: 'poor',
    reflex: 'poor',
    will: 'good',
  },
  skillPointsPerLevel: '2 + @ability.intelligence.modifier',
  classSkillIds: [
    'appraise',
    'craft',
    'fly',
    'knowledge-arcana',
    'knowledge-dungeoneering',
    'knowledge-engineering',
    'knowledge-geography',
    'knowledge-history',
    'knowledge-local',
    'knowledge-nature',
    'knowledge-nobility',
    'knowledge-planes',
    'knowledge-religion',
    'linguistics',
    'profession',
    'spellcraft',
    'use-magic-device',
  ],
  classType: 'base',

  levels: {
    '1': {
      providers: [
        grantFeature('arcanist-spellcasting'),
        grantFeature('arcanist-arcane-reservoir'),
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
