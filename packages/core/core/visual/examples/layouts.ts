/**
 * Examples demonstrating how to use the visual layout system
 * These show practical usage patterns for creating character sheet layouts
 */

import { createSection } from '../layouts/section';
import { createRow } from '../layouts/row';
import { createColumn } from '../layouts/column';
import { createAttributeView } from '../views/attribute';
import { SectionLayout } from '../layouts/section';

/**
 * Example 1: Attributes Section
 * Creates a section titled "Attributes" containing 6 D&D attributes arranged in a 2x3 grid
 */
export const attributesSection: SectionLayout = createSection(
  'attributes-section',
  'Attributes',
  [
    // First row: STR, DEX, CON
    createRow('attributes-row-1', [
      createColumn('str-column', [
        createAttributeView(
          'strength-view',
          'Strength',
          'strength.score',
          'strength.modifier'
        )
      ]),
      createColumn('dex-column', [
        createAttributeView(
          'dexterity-view', 
          'Dexterity',
          'dexterity.score',
          'dexterity.modifier'
        )
      ]),
      createColumn('con-column', [
        createAttributeView(
          'constitution-view',
          'Constitution', 
          'constitution.score',
          'constitution.modifier'
        )
      ])
    ]),
    // Second row: INT, WIS, CHA
    createRow('attributes-row-2', [
      createColumn('int-column', [
        createAttributeView(
          'intelligence-view',
          'Intelligence',
          'intelligence.score',
          'intelligence.modifier'
        )
      ]),
      createColumn('wis-column', [
        createAttributeView(
          'wisdom-view',
          'Wisdom',
          'wisdom.score',
          'wisdom.modifier'
        )
      ]),
      createColumn('cha-column', [
        createAttributeView(
          'charisma-view',
          'Charisma',
          'charisma.score',
          'charisma.modifier'
        )
      ])
    ])
  ],
  'Core character attributes and modifiers'
);

/**
 * Example 2: Combat Stats Section  
 * Shows other types of character data in a more complex layout
 */
export const combatStatsSection: SectionLayout = createSection(
  'combat-stats-section',
  'Combat Statistics',
  [
    createRow('combat-row-1', [
      createColumn('ac-column', [
        createAttributeView(
          'ac-view',
          'Armor Class',
          'armorClass.total',
          'armorClass.touchAC'
        )
      ], 1),
      createColumn('initiative-column', [
        createAttributeView(
          'initiative-view',
          'Initiative',
          'initiative.total',
          'initiative.dexBonus'
        )
      ], 1),
      createColumn('speed-column', [
        createAttributeView(
          'speed-view',
          'Speed',
          'speed.land',
          'speed.baseSpeed'
        )
      ], 1)
    ])
  ]
);

/**
 * Example 3: Nested Layout
 * Demonstrates more complex nesting with sections inside sections
 */
export const characterOverviewLayout: SectionLayout = createSection(
  'character-overview',
  'Character Overview',
  [
    attributesSection,
    combatStatsSection,
    createSection(
      'saves-section',
      'Saving Throws',
      [
        createRow('saves-row', [
          createColumn('fort-column', [
            createAttributeView(
              'fortitude-view',
              'Fortitude',
              'saves.fortitude.total',
              'saves.fortitude.base'
            )
          ]),
          createColumn('ref-column', [
            createAttributeView(
              'reflex-view',
              'Reflex', 
              'saves.reflex.total',
              'saves.reflex.base'
            )
          ]),
          createColumn('will-column', [
            createAttributeView(
              'will-view',
              'Will',
              'saves.will.total',
              'saves.will.base'
            )
          ])
        ])
      ]
    )
  ]
);

console.log(JSON.stringify(characterOverviewLayout, null, 2));