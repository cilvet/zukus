/**
 * Psion Class Entity (Expanded Psionics Handbook)
 *
 * TEST CLASS - Not D&D 3.5 SRD
 *
 * Psionic manifester who uses power points to manifest powers.
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
// Psion Class
// =============================================================================

/**
 * Psion class entity
 *
 * Key features:
 * - Psionic powers with power point pool
 * - Spontaneous manifestation
 * - Intelligence-based manifesting
 * - Poor BAB, good Will save
 */
export const psionClass: StandardEntity = {
  id: 'psion',
  entityType: 'class',
  name: 'Psion',
  description:
    'A psion is a practitioner of psionics, using the power of the mind to manifest incredible effects. Unlike spellcasters, psions use power points to fuel their abilities and can enhance powers by spending extra points.',

  hitDie: 4,
  babProgression: 'poor',
  saves: {
    fortitude: 'poor',
    reflex: 'poor',
    will: 'good',
  },
  skillPointsPerLevel: '2 + @ability.intelligence.modifier',
  classSkillIds: [
    'autohypnosis',
    'concentration',
    'craft',
    'knowledge-psionics',
    'psicraft',
    'profession',
  ],
  classType: 'base',

  levels: {
    '1': {
      providers: [
        grantFeature('psion-powers'),
        grantFeature('psion-discipline'),
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
