/**
 * Gnome Race Entity
 *
 * D&D 3.5 SRD Gnome:
 * - +2 Constitution, -2 Strength
 * - Small size, 20 ft. speed
 * - Low-light vision
 * - SLAs: speak with animals, dancing lights, ghost sound, prestidigitation
 * - Favored class: Bard
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const gnomeRace: StandardEntity = {
  id: 'gnome',
  entityType: 'race',
  name: 'Gnome',
  description:
    'Gnomes are welcome everywhere as technicians, alchemists, and inventors. Despite the demand for their skills, most gnomes prefer to remain among their own kind, living in comfortable burrows beneath rolling, wooded hills.',

  // Race fields
  size: 'SMALL',
  baseLandSpeed: 20,
  languages: ['common', 'gnome'],
  bonusLanguages: ['draconic', 'dwarven', 'elven', 'giant', 'goblin', 'orc'],
  levelAdjustment: 0,
  racialType: 'humanoid',
  racialSubtypes: ['gnome'],
  favoredClass: 'bard',

  // Ability score adjustments
  effects: [
    { target: 'ability.constitution.score', formula: '2', bonusType: 'RACIAL' },
    { target: 'ability.strength.score', formula: '-2', bonusType: 'RACIAL' },
  ],

  levels: {
    '1': {
      providers: [
        {
          granted: {
            specificIds: [
              'gnome-low-light-vision',
              'gnome-illusion-resistance',
              'gnome-illusion-dc-bonus',
              'gnome-combat-vs-kobolds',
              'gnome-dodge-vs-giants',
              'gnome-skill-bonuses',
              'gnome-weapon-familiarity',
              // SLA trait (defines CGE for the UI panel)
              'gnome-spell-like-abilities',
            ],
          },
        },
        // Grant the actual SLA entities
        {
          granted: {
            specificIds: [
              'gnome-sla-dancing-lights',
              'gnome-sla-ghost-sound',
              'gnome-sla-prestidigitation',
              'gnome-sla-speak-with-animals',
            ],
          },
        },
      ],
    },
  },
} as StandardEntity;
