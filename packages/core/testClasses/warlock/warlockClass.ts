/**
 * Warlock Class Entity (Complete Arcane)
 *
 * TEST CLASS - Not D&D 3.5 SRD
 *
 * Arcane wielder with at-will invocations powered by a dark pact.
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
// Warlock Class
// =============================================================================

/**
 * Warlock class entity
 *
 * Key features:
 * - At-will invocations (no resource cost)
 * - Eldritch Blast as signature attack
 * - Charisma-based
 * - Medium BAB, good Will save
 */
export const warlockClass: StandardEntity = {
  id: 'warlock',
  entityType: 'class',
  name: 'Warlock',
  description:
    'Born of a supernatural bloodline, a warlock seeks to master the perilous magic that suffuses his soul. Unlike sorcerers or wizards, who approach arcane magic through the medium of spells, a warlock invokes powerful magic through nothing more than an effort of will.',

  hitDie: 6,
  babProgression: 'medium',
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
    'disguise',
    'intimidate',
    'jump',
    'knowledge-arcana',
    'knowledge-planes',
    'knowledge-religion',
    'profession',
    'sense-motive',
    'spellcraft',
    'use-magic-device',
  ],
  classType: 'base',

  levels: {
    '1': {
      providers: [
        grantFeature('warlock-invocations'),
        grantFeature('warlock-eldritch-blast'),
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
