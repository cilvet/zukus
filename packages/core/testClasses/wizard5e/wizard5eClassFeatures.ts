/**
 * Wizard 5e Class Features (D&D 5th Edition)
 *
 * TEST CLASS - Not D&D 3.5 SRD
 *
 * Demonstrates CGE pattern:
 * - UNLIMITED known (spellbook)
 * - SLOTS resource (standard 5e slot progression)
 * - LIST GLOBAL preparation (prepare any spells, not bound to slots)
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { CGEConfig, LevelTable } from '../../core/domain/cge/types';
import type { CGEDefinitionChange } from '../../core/domain/character/baseData/specialChanges';

// =============================================================================
// Tables
// =============================================================================

/**
 * 5e Wizard spell slots per day
 * Index 0 = cantrips (don't use slots), 1-9 = spell levels 1-9
 */
const WIZARD_5E_SLOTS_TABLE: LevelTable = {
  1: [3, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [3, 4, 2, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 4, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 4, 3, 2, 0, 0, 0, 0, 0, 0],
  6: [4, 4, 3, 3, 0, 0, 0, 0, 0, 0],
  7: [4, 4, 3, 3, 1, 0, 0, 0, 0, 0],
  8: [4, 4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [5, 4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [5, 4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [5, 4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [5, 4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [5, 4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [5, 4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [5, 4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [5, 4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [5, 4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [5, 4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [5, 4, 3, 3, 3, 3, 2, 2, 1, 1],
};

// =============================================================================
// CGE Configuration
// =============================================================================

const wizard5eCGEConfig: CGEConfig = {
  id: 'wizard-5e-spells',
  classId: 'wizard-5e',
  entityType: 'spell',
  levelPath: '@entity.level', // In 5e, spell level is independent

  // Wizard has unlimited spells known (spellbook)
  known: { type: 'UNLIMITED' },

  tracks: [
    {
      id: 'base',
      label: 'spell_slots',
      resource: {
        type: 'SLOTS',
        table: WIZARD_5E_SLOTS_TABLE,
        refresh: 'daily',
      },
      // LIST GLOBAL: prepare any spells (not per level)
      // Can cast any prepared spell with any appropriate slot
      preparation: {
        type: 'LIST',
        structure: 'GLOBAL',
        maxFormula: { expression: '@class.wizard5e.level + @ability.intelligence.modifier' },
        consumeOnUse: false,
      },
    },
  ],

  variables: {
    classPrefix: 'wizard5e.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.wizard5e',
  },

  labels: {
    known: 'spellbook',
    prepared: 'prepared_spells',
    slot: 'spell_slot',
    action: 'cast',
  },
};

const wizard5eCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: wizard5eCGEConfig,
};

// =============================================================================
// Class Features
// =============================================================================

/**
 * Wizard 5e Spellcasting
 * Grants the 5e wizard's arcane spellcasting ability.
 */
export const wizard5eSpellcasting: StandardEntity = {
  id: 'wizard-5e-spellcasting',
  entityType: 'classFeature',
  name: 'Spellcasting',
  description:
    'As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power. You prepare the list of wizard spells that are available for you to cast. You can cast any spell you have prepared using a slot of the spell\'s level or higher.',
  tags: ['wizard5eAbility', 'spellcasting', 'arcane'],
  legacy_specialChanges: [wizard5eCGEDefinition],
} as StandardEntity;

/**
 * Arcane Recovery
 * 5e Wizards can recover spell slots during a short rest.
 */
export const wizard5eArcaneRecovery: StandardEntity = {
  id: 'wizard-5e-arcane-recovery',
  entityType: 'classFeature',
  name: 'Arcane Recovery',
  description:
    'You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up), and none of the slots can be 6th level or higher.',
  tags: ['wizard5eAbility', 'recovery'],
} as StandardEntity;

// =============================================================================
// Exports
// =============================================================================

export const wizard5eClassFeatures: StandardEntity[] = [
  wizard5eSpellcasting,
  wizard5eArcaneRecovery,
];
