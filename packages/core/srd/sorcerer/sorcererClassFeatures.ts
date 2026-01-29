/**
 * Sorcerer Class Features for D&D 3.5
 *
 * Contains:
 * - Sorcerer Spellcasting (with CGE configuration for spontaneous casting)
 * - Familiar
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { CGEConfig, LevelTable } from '../../core/domain/cge/types';
import type { CGEDefinitionChange } from '../../core/domain/character/baseData/specialChanges';

// =============================================================================
// Slot Tables
// =============================================================================

/**
 * Sorcerer spell slots per day
 * Index 0 = cantrips, 1-9 = spell levels 1-9
 */
const SORCERER_SLOTS_TABLE: LevelTable = {
  1: [5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [6, 4, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [6, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [6, 6, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [6, 6, 4, 0, 0, 0, 0, 0, 0, 0],
  6: [6, 6, 5, 3, 0, 0, 0, 0, 0, 0],
  7: [6, 6, 6, 4, 0, 0, 0, 0, 0, 0],
  8: [6, 6, 6, 5, 3, 0, 0, 0, 0, 0],
  9: [6, 6, 6, 6, 4, 0, 0, 0, 0, 0],
  10: [6, 6, 6, 6, 5, 3, 0, 0, 0, 0],
  11: [6, 6, 6, 6, 6, 4, 0, 0, 0, 0],
  12: [6, 6, 6, 6, 6, 5, 3, 0, 0, 0],
  13: [6, 6, 6, 6, 6, 6, 4, 0, 0, 0],
  14: [6, 6, 6, 6, 6, 6, 5, 3, 0, 0],
  15: [6, 6, 6, 6, 6, 6, 6, 4, 0, 0],
  16: [6, 6, 6, 6, 6, 6, 6, 5, 3, 0],
  17: [6, 6, 6, 6, 6, 6, 6, 6, 4, 0],
  18: [6, 6, 6, 6, 6, 6, 6, 6, 5, 3],
  19: [6, 6, 6, 6, 6, 6, 6, 6, 6, 4],
  20: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
};

/**
 * Sorcerer spells known per class level
 * Index 0 = cantrips, 1-9 = spell levels 1-9
 */
const SORCERER_KNOWN_TABLE: LevelTable = {
  1: [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [5, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [6, 3, 1, 0, 0, 0, 0, 0, 0, 0],
  5: [6, 4, 2, 0, 0, 0, 0, 0, 0, 0],
  6: [7, 4, 2, 1, 0, 0, 0, 0, 0, 0],
  7: [7, 5, 3, 2, 0, 0, 0, 0, 0, 0],
  8: [8, 5, 3, 2, 1, 0, 0, 0, 0, 0],
  9: [8, 5, 4, 3, 2, 0, 0, 0, 0, 0],
  10: [9, 5, 4, 3, 2, 1, 0, 0, 0, 0],
  11: [9, 5, 5, 4, 3, 2, 0, 0, 0, 0],
  12: [9, 5, 5, 4, 3, 2, 1, 0, 0, 0],
  13: [9, 5, 5, 4, 4, 3, 2, 0, 0, 0],
  14: [9, 5, 5, 4, 4, 3, 2, 1, 0, 0],
  15: [9, 5, 5, 4, 4, 4, 3, 2, 0, 0],
  16: [9, 5, 5, 4, 4, 4, 3, 2, 1, 0],
  17: [9, 5, 5, 4, 4, 4, 3, 3, 2, 0],
  18: [9, 5, 5, 4, 4, 4, 3, 3, 2, 1],
  19: [9, 5, 5, 4, 4, 4, 3, 3, 3, 2],
  20: [9, 5, 5, 4, 4, 4, 3, 3, 3, 3],
};

// =============================================================================
// CGE Configuration
// =============================================================================

const sorcererCGEConfig: CGEConfig = {
  id: 'sorcerer-spells',
  classId: 'sorcerer',
  entityType: 'spell',
  levelPath: '@entity.levels.sorcerer',

  // Sorcerer has limited spells known per spell level
  known: {
    type: 'LIMITED_PER_ENTITY_LEVEL',
    table: SORCERER_KNOWN_TABLE,
  },

  tracks: [
    {
      id: 'base',
      label: 'spell_slots',
      resource: {
        type: 'SLOTS',
        table: SORCERER_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      // Spontaneous casting: no preparation needed
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'sorcerer.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.sorcerer',
  },

  labels: {
    known: 'known_spells',
    prepared: 'prepared_spells', // Not used for sorcerer
    slot: 'spell_slot',
    action: 'cast',
  },
};

const sorcererCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: sorcererCGEConfig,
};

// =============================================================================
// Class Features
// =============================================================================

/**
 * Sorcerer Spellcasting
 * Grants the sorcerer's arcane spellcasting ability with CGE configuration.
 */
export const sorcererSpellcasting: StandardEntity = {
  id: 'sorcerer-spellcasting',
  entityType: 'classFeature',
  name: 'Arcane Spellcasting',
  description:
    'A sorcerer casts arcane spells which are drawn primarily from the sorcerer/wizard spell list. He can cast any spell he knows without preparing it ahead of time. To learn or cast a spell, a sorcerer must have a Charisma score equal to at least 10 + the spell level.',
  tags: ['sorcererAbility', 'spellcasting', 'arcane'],
  legacy_specialChanges: [sorcererCGEDefinition],
} as StandardEntity;

/**
 * Sorcerer Familiar
 * Sorcerers gain a familiar at 1st level.
 */
export const sorcererFamiliar: StandardEntity = {
  id: 'sorcerer-familiar',
  entityType: 'classFeature',
  name: 'Familiar',
  description:
    'A sorcerer can obtain a familiar. Doing so takes 24 hours and uses up magical materials that cost 100 gp. A familiar is a magical beast that resembles a small animal and is unusually tough and intelligent. The creature serves as a companion and servant.',
  tags: ['sorcererAbility', 'familiar'],
} as StandardEntity;

// =============================================================================
// Exports
// =============================================================================

export const sorcererClassFeatures: StandardEntity[] = [
  sorcererSpellcasting,
  sorcererFamiliar,
];
