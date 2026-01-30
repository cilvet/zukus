/**
 * Warblade Class Entity (Tome of Battle)
 *
 * TEST CLASS - Not D&D 3.5 SRD
 *
 * Martial adept who uses readied maneuvers that are expended on use.
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
// Warblade Class
// =============================================================================

/**
 * Warblade class entity
 *
 * Key features:
 * - Martial maneuvers (readied, consumed on use)
 * - Battle Clarity (Int to Reflex)
 * - Full BAB, good Fortitude save
 */
export const warbladeClass: StandardEntity = {
  id: 'warblade',
  entityType: 'class',
  name: 'Warblade',
  description:
    'The warblade is a martial adept who has honed his mind and body to become an engine of destruction. A warblade readies maneuvers each day which are expended when used and can be recovered through specific combat actions.',

  hitDie: 12,
  babProgression: 'good',
  saves: {
    fortitude: 'good',
    reflex: 'poor',
    will: 'poor',
  },
  skillPointsPerLevel: '4 + @ability.intelligence.modifier',
  classSkillIds: [
    'balance',
    'climb',
    'concentration',
    'craft',
    'diplomacy',
    'intimidate',
    'jump',
    'knowledge-history',
    'knowledge-local',
    'martial-lore',
    'swim',
    'tumble',
  ],
  classType: 'base',

  levels: {
    '1': {
      providers: [
        grantFeature('warblade-maneuvers'),
        grantFeature('warblade-battle-clarity'),
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
