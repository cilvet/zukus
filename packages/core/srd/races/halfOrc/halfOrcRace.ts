/**
 * Half-Orc Race Entity
 *
 * D&D 3.5 SRD Half-Orc:
 * - +2 Strength, -2 Intelligence, -2 Charisma
 * - Medium size, 30 ft. speed
 * - Darkvision 60 ft.
 * - Orc Blood
 * - Favored class: Barbarian
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const halfOrcRace: StandardEntity = {
  id: 'half-orc',
  entityType: 'race',
  name: 'Half-Orc',
  description:
    'Half-orcs are not evil by nature, but evil does lurk within them, whether they embrace it or rebel against it. In the wild frontiers, tribes of human and orc barbarians live in uneasy balance, fighting in times of war and trading in times of peace.',

  // Race fields
  size: 'MEDIUM',
  baseLandSpeed: 30,
  languages: ['common', 'orc'],
  bonusLanguages: ['draconic', 'giant', 'gnoll', 'goblin', 'abyssal'],
  levelAdjustment: 0,
  racialType: 'humanoid',
  racialSubtypes: ['orc'],
  favoredClass: 'barbarian',

  // Ability score adjustments
  effects: [
    { target: 'ability.strength.score', formula: '2', bonusType: 'RACIAL' },
    { target: 'ability.intelligence.score', formula: '-2', bonusType: 'RACIAL' },
    { target: 'ability.charisma.score', formula: '-2', bonusType: 'RACIAL' },
  ],

  levels: {
    '1': {
      providers: [
        {
          granted: {
            specificIds: [
              'half-orc-darkvision',
              'half-orc-orc-blood',
            ],
          },
        },
      ],
    },
  },
} as StandardEntity;
