/**
 * Drow (Dark Elf) Race Entity
 *
 * D&D 3.5 SRD Drow:
 * - +2 Dexterity, +2 Intelligence, +2 Charisma, -2 Constitution
 * - Medium size, 30 ft. speed
 * - Darkvision 120 ft.
 * - Spell Resistance 11 + class levels
 * - SLAs: dancing lights, darkness, faerie fire (CL = class levels)
 * - Level Adjustment: +2
 * - Favored class: Wizard (male) / Cleric (female)
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const drowRace: StandardEntity = {
  id: 'drow',
  entityType: 'race',
  name: 'Drow',
  description:
    'Also known as dark elves, drow are a depraved and evil subterranean offshoot of the elven race. They have black skin that resembles polished obsidian and stark white or pale yellow hair.',

  // Race fields
  size: 'MEDIUM',
  baseLandSpeed: 30,
  languages: ['common', 'elven', 'undercommon'],
  bonusLanguages: ['abyssal', 'aquan', 'draconic', 'drow-sign-language', 'gnome', 'goblin'],
  levelAdjustment: 2,
  racialType: 'humanoid',
  racialSubtypes: ['elf'],
  favoredClass: 'wizard',

  // Ability score adjustments
  effects: [
    { target: 'ability.dexterity.score', formula: '2', bonusType: 'RACIAL' },
    { target: 'ability.intelligence.score', formula: '2', bonusType: 'RACIAL' },
    { target: 'ability.charisma.score', formula: '2', bonusType: 'RACIAL' },
    { target: 'ability.constitution.score', formula: '-2', bonusType: 'RACIAL' },
  ],

  levels: {
    '1': {
      providers: [
        {
          granted: {
            specificIds: [
              'drow-darkvision',
              'drow-immunity-to-sleep',
              'drow-enchantment-resistance',
              'drow-spell-resistance',
              'drow-will-save-vs-spells',
              'drow-keen-senses',
              'drow-light-blindness',
              'drow-weapon-proficiency',
              // SLA trait (defines CGE for the UI panel)
              'drow-spell-like-abilities',
            ],
          },
        },
        // Grant the actual SLA entities
        {
          granted: {
            specificIds: [
              'drow-sla-dancing-lights',
              'drow-sla-darkness',
              'drow-sla-faerie-fire',
            ],
          },
        },
      ],
    },
  },
} as StandardEntity;
