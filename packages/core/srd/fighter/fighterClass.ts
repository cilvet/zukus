/**
 * Fighter Class Entity for D&D 3.5
 * 
 * This file defines the Fighter class as an entity for the levels system.
 * The Fighter is a martial class focused on combat prowess.
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { EntitySchemaDefinition } from '../../core/domain/entities/types/schema';
import type { EntityProvider } from '../../core/domain/levels/providers/types';

/**
 * Schema definition for D&D 3.5 Classes
 */
export const classSchema: EntitySchemaDefinition = {
  typeName: 'class',
  description: 'D&D 3.5 Character Class',
  version: '1.0.0',
  addons: ['searchable', 'taggable'],
  fields: [
    {
      name: 'hitDie',
      type: 'integer',
      description: 'Hit die size (4, 6, 8, 10, or 12)',
    },
    {
      name: 'babProgression',
      type: 'string',
      description: 'Base Attack Bonus progression (full, medium, poor)',
    },
    {
      name: 'saves',
      type: 'object',
      description: 'Saving throw progressions',
      objectFields: [
        {
          name: 'fortitude',
          type: 'string',
          description: 'Fortitude save progression (good or poor)',
        },
        {
          name: 'reflex',
          type: 'string',
          description: 'Reflex save progression (good or poor)',
        },
        {
          name: 'will',
          type: 'string',
          description: 'Will save progression (good or poor)',
        },
      ],
    },
    {
      name: 'skillPointsPerLevel',
      type: 'string',
      description: 'Skill points per level (formula)',
    },
    {
      name: 'classSkillIds',
      type: 'string_array',
      description: 'IDs of class skills',
    },
    {
      name: 'classType',
      type: 'string',
      description: 'Class type (base or prestige)',
    },
    {
      name: 'levels',
      type: 'dataTable',
      description: 'Levels data with providers',
      rowKey: {
        name: 'Level',
        startingNumber: 1,
        incremental: true,
      },
      columns: [
        {
          id: 'providers',
          name: 'Providers',
          type: 'entityProvider',
          allowMultiple: true,
          optional: true,
        },
      ],
    },
  ],
};

/**
 * Creates a bonus feat provider for a specific fighter level
 */
function createBonusFeatProvider(level: number): EntityProvider {
  return {
    selector: {
      id: `fighter-bonus-feat-${level}`,
      name: `Bonus Fighter Feat (Level ${level})`,
      entityType: 'feat',
      filter: {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'tags', operator: 'contains', value: 'fighterBonusFeat' },
        ],
      },
      min: 1,
      max: 1,
    },
  };
}

/**
 * Fighter class entity with proper levels structure
 * Fighter gains bonus feats at level 1 and every even level (2, 4, 6, etc.)
 */
export const fighterClass: StandardEntity = {
  id: 'fighter',
  entityType: 'class',
  name: 'Fighter',
  description: 'The questing knight, the conquering overlord, the king\'s champion, the elite foot soldier, the hardened mercenary, and the bandit king—all are fighters. Fighters can be stalwart defenders of those in need, cruel marauders, or gutsy adventurers.',
  
  hitDie: 10,
  babProgression: 'full',
  saves: {
    fortitude: 'good',
    reflex: 'poor',
    will: 'poor',
  },
  skillPointsPerLevel: '2 + @ability.intelligence.modifier',
  classSkillIds: [
    'climb',
    'craft',
    'handle-animal',
    'intimidate',
    'jump',
    'ride',
    'swim',
  ],
  classType: 'base',
  
  levels: {
    '1': { providers: [createBonusFeatProvider(1)] },
    '2': { providers: [createBonusFeatProvider(2)] },
    '3': { providers: [] },
    '4': { providers: [createBonusFeatProvider(4)] },
    '5': { providers: [] },
    '6': { providers: [createBonusFeatProvider(6)] },
    '7': { providers: [] },
    '8': { providers: [createBonusFeatProvider(8)] },
    '9': { providers: [] },
    '10': { providers: [createBonusFeatProvider(10)] },
    '11': { providers: [] },
    '12': { providers: [createBonusFeatProvider(12)] },
    '13': { providers: [] },
    '14': { providers: [createBonusFeatProvider(14)] },
    '15': { providers: [] },
    '16': { providers: [createBonusFeatProvider(16)] },
    '17': { providers: [] },
    '18': { providers: [createBonusFeatProvider(18)] },
    '19': { providers: [] },
    '20': { providers: [createBonusFeatProvider(20)] },
  },
} as StandardEntity;

