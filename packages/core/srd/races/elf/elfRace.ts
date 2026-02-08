/**
 * Elf Race Entity
 *
 * D&D 3.5 SRD Elf:
 * - +2 Dexterity, -2 Constitution
 * - Medium size, 30 ft. speed
 * - Low-light vision
 * - Immunity to sleep, +2 vs enchantment
 * - Keen Senses: +2 Listen, Search, Spot
 * - Weapon Proficiency: longsword, rapier, bows
 * - Favored class: Wizard
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const elfRace: StandardEntity = {
  id: 'elf',
  entityType: 'race',
  name: 'Elf',
  description:
    'Elves mingle freely in human lands, always welcome yet never at home there. They are well known for their poetry, dance, song, lore, and magical arts. Elves favor things of natural and simple beauty.',

  // Race fields
  size: 'MEDIUM',
  baseLandSpeed: 30,
  languages: ['common', 'elven'],
  bonusLanguages: ['draconic', 'gnoll', 'gnome', 'goblin', 'orc', 'sylvan'],
  levelAdjustment: 0,
  racialType: 'humanoid',
  racialSubtypes: ['elf'],
  favoredClass: 'wizard',

  // Ability score adjustments
  effects: [
    { target: 'ability.dexterity.score', formula: '2', bonusType: 'RACIAL' },
    { target: 'ability.constitution.score', formula: '-2', bonusType: 'RACIAL' },
  ],

  levels: {
    '1': {
      providers: [
        {
          granted: {
            specificIds: [
              'elf-low-light-vision',
              'elf-immunity-to-sleep',
              'elf-enchantment-resistance',
              'elf-keen-senses',
              'elf-weapon-proficiency',
            ],
          },
        },
      ],
    },
  },
} as StandardEntity;
