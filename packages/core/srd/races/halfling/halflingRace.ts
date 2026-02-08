/**
 * Halfling Race Entity
 *
 * D&D 3.5 SRD Halfling:
 * - +2 Dexterity, -2 Strength
 * - Small size, 20 ft. speed
 * - +1 all saves, +2 vs fear
 * - +1 attack with thrown weapons/slings
 * - +2 Climb, Jump, Listen, Move Silently
 * - Favored class: Rogue
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const halflingRace: StandardEntity = {
  id: 'halfling',
  entityType: 'race',
  name: 'Halfling',
  description:
    'Halflings are clever, capable, and resourceful survivors. They are notoriously curious and show a daring that many larger people can\'t match.',

  // Race fields
  size: 'SMALL',
  baseLandSpeed: 20,
  languages: ['common', 'halfling'],
  bonusLanguages: ['dwarven', 'elven', 'gnome', 'goblin', 'orc'],
  levelAdjustment: 0,
  racialType: 'humanoid',
  racialSubtypes: ['halfling'],
  favoredClass: 'rogue',

  // Ability score adjustments
  effects: [
    { target: 'ability.dexterity.score', formula: '2', bonusType: 'RACIAL' },
    { target: 'ability.strength.score', formula: '-2', bonusType: 'RACIAL' },
  ],

  levels: {
    '1': {
      providers: [
        {
          granted: {
            specificIds: [
              'halfling-saving-throw-bonus',
              'halfling-fearless',
              'halfling-keen-thrower',
              'halfling-skill-bonuses',
            ],
          },
        },
      ],
    },
  },
} as StandardEntity;
