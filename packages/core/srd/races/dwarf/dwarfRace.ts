/**
 * Dwarf Race Entity
 *
 * D&D 3.5 SRD Dwarf:
 * - +2 Constitution, -2 Charisma
 * - Medium size, 20 ft. speed (not reduced by armor/load)
 * - Darkvision 60 ft.
 * - Favored class: Fighter
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const dwarfRace: StandardEntity = {
  id: 'dwarf',
  entityType: 'race',
  name: 'Dwarf',
  description:
    'Dwarves are known for their skill in warfare, their ability to withstand physical and magical punishment, their knowledge of the earth\'s secrets, their hard work, and their capacity for drinking ale.',

  // Race fields
  size: 'MEDIUM',
  baseLandSpeed: 20,
  languages: ['common', 'dwarven'],
  bonusLanguages: ['giant', 'gnome', 'goblin', 'orc', 'terran', 'undercommon'],
  levelAdjustment: 0,
  racialType: 'humanoid',
  racialSubtypes: ['dwarf'],
  favoredClass: 'fighter',

  // Ability score adjustments
  effects: [
    { target: 'ability.constitution.score', formula: '2', bonusType: 'RACIAL' },
    { target: 'ability.charisma.score', formula: '-2', bonusType: 'RACIAL' },
  ],

  levels: {
    '1': {
      providers: [
        {
          granted: {
            specificIds: [
              'dwarf-darkvision',
              'dwarf-stonecunning',
              'dwarf-stability',
              'dwarf-save-vs-poison',
              'dwarf-save-vs-spells',
              'dwarf-combat-vs-orcs',
              'dwarf-dodge-vs-giants',
              'dwarf-skill-bonuses',
              'dwarf-weapon-familiarity',
              'dwarf-armor-speed',
            ],
          },
        },
      ],
    },
  },
} as StandardEntity;
