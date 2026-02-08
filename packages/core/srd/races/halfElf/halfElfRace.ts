/**
 * Half-Elf Race Entity
 *
 * D&D 3.5 SRD Half-Elf:
 * - No ability score adjustments
 * - Medium size, 30 ft. speed
 * - Low-light vision
 * - Immunity to sleep, +2 vs enchantment
 * - +1 Listen, Search, Spot
 * - +2 Diplomacy, +2 Gather Information
 * - Elven Blood
 * - Favored class: Any
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const halfElfRace: StandardEntity = {
  id: 'half-elf',
  entityType: 'race',
  name: 'Half-Elf',
  description:
    'Half-elves have the curiosity and ambition of their human heritage and the refined senses and love of nature of their elven heritage.',

  // Race fields
  size: 'MEDIUM',
  baseLandSpeed: 30,
  languages: ['common', 'elven'],
  bonusLanguages: ['any'],
  levelAdjustment: 0,
  racialType: 'humanoid',
  racialSubtypes: ['elf'],
  favoredClass: 'any',

  // No ability score adjustments

  levels: {
    '1': {
      providers: [
        {
          granted: {
            specificIds: [
              'half-elf-low-light-vision',
              'half-elf-immunity-to-sleep',
              'half-elf-enchantment-resistance',
              'half-elf-keen-senses',
              'half-elf-diplomacy',
              'half-elf-elven-blood',
            ],
          },
        },
      ],
    },
  },
} as StandardEntity;
