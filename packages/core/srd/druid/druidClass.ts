/**
 * Druid Class Entity for D&D 3.5
 *
 * Divine spellcaster with access to the full druid spell list.
 * Features Wild Shape and Animal Companion.
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
// Druid Class
// =============================================================================

/**
 * Druid class entity
 *
 * Key features:
 * - Divine spellcasting with full spell list access (no spellbook)
 * - Animal Companion
 * - Wild Shape (scaling with level)
 * - Nature-themed abilities
 * - Medium BAB, good Fort and Will saves
 */
export const druidClass: StandardEntity = {
  id: 'druid',
  entityType: 'class',
  name: 'Druid',
  description:
    'The fury of a storm, the gentle strength of the morning sun, the cunning of the fox, the power of the bear—all these and more are at the druid\'s command. The druid however, claims no mastery over nature. That claim, she says, is the empty boast of a city dweller. The druid gains her power not by ruling nature but by being at one with it.',

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
    '1': { providers: [grantFeatures('druid-spellcasting', 'druid-animal-companion', 'druid-nature-sense', 'druid-wild-empathy')] },
    '2': { providers: [grantFeature('druid-woodland-stride')] },
    '3': { providers: [grantFeature('druid-trackless-step')] },
    '4': { providers: [grantFeature('druid-resist-natures-lure')] },
    '5': { providers: [grantFeature('druid-wild-shape')] },
    '6': { providers: [] },
    '7': { providers: [] },
    '8': { providers: [] },
    '9': { providers: [grantFeature('druid-venom-immunity')] },
    '10': { providers: [] },
    '11': { providers: [] },
    '12': { providers: [] },
    '13': { providers: [grantFeature('druid-thousand-faces')] },
    '14': { providers: [] },
    '15': { providers: [grantFeature('druid-timeless-body')] },
    '16': { providers: [] },
    '17': { providers: [] },
    '18': { providers: [] },
    '19': { providers: [] },
    '20': { providers: [] },
  },
} as StandardEntity;
