/**
 * Cleric Class Entity for D&D 3.5
 *
 * Divine spellcaster with access to the full cleric spell list.
 * Uses Vancian preparation (BOUND) with two tracks: base slots and domain slots.
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

function grantFeatures(...featureIds: string[]): EntityProvider {
  return {
    granted: {
      specificIds: featureIds,
    },
  };
}

// =============================================================================
// Cleric Class
// =============================================================================

/**
 * Cleric class entity
 *
 * Key features:
 * - Divine spellcasting with full spell list access (no spellbook)
 * - Two spell tracks: base slots and domain slots
 * - Turn/Rebuke Undead
 * - Medium BAB, good Fort and Will saves
 */
export const clericClass: StandardEntity = {
  id: 'cleric',
  entityType: 'class',
  name: 'Cleric',
  description:
    'The handiwork of the gods is everywhere—in places of natural beauty, in mighty crusades, in soaring temples, and in the hearts of worshipers. Like people, gods run the gamut from benevolent to malicious, reserved to intrusive, simple to inscrutable. The gods, however, work mostly through intermediaries—their clerics.',

  hitDie: 8,
  babProgression: 'medium',
  saves: {
    fortitude: 'good',
    reflex: 'poor',
    will: 'good',
  },
  skillPointsPerLevel: '2 + @ability.intelligence.modifier',
  classSkillIds: [
    'concentration',
    'craft',
    'diplomacy',
    'heal',
    'knowledge-arcana',
    'knowledge-history',
    'knowledge-religion',
    'knowledge-the-planes',
    'profession',
    'spellcraft',
  ],
  classType: 'base',

  levels: {
    '1': { providers: [grantFeatures('cleric-spellcasting', 'cleric-turn-undead')] },
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
