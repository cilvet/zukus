/**
 * Arcanist Class Features (Pathfinder 1e)
 *
 * TEST CLASS - Not D&D 3.5 SRD
 *
 * Demonstrates CGE pattern:
 * - UNLIMITED known (spellbook)
 * - SLOTS resource (fewer than Wizard)
 * - LIST PER_LEVEL preparation (prepare per level, cast spontaneously within level)
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { CGEConfig, LevelTable } from '../../core/domain/cge/types';
import type { CGEDefinitionChange } from '../../core/domain/character/baseData/specialChanges';

// =============================================================================
// Tables
// =============================================================================

/**
 * Arcanist spell slots per day (fewer than Wizard)
 */
const ARCANIST_SLOTS_TABLE: LevelTable = {
  1: [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [0, 4, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [0, 4, 2, 0, 0, 0, 0, 0, 0, 0],
  5: [0, 4, 3, 0, 0, 0, 0, 0, 0, 0],
  6: [0, 4, 4, 2, 0, 0, 0, 0, 0, 0],
  7: [0, 4, 4, 3, 0, 0, 0, 0, 0, 0],
  8: [0, 4, 4, 4, 2, 0, 0, 0, 0, 0],
  9: [0, 4, 4, 4, 3, 0, 0, 0, 0, 0],
  10: [0, 4, 4, 4, 4, 2, 0, 0, 0, 0],
  11: [0, 4, 4, 4, 4, 3, 0, 0, 0, 0],
  12: [0, 4, 4, 4, 4, 4, 2, 0, 0, 0],
  13: [0, 4, 4, 4, 4, 4, 3, 0, 0, 0],
  14: [0, 4, 4, 4, 4, 4, 4, 2, 0, 0],
  15: [0, 4, 4, 4, 4, 4, 4, 3, 0, 0],
  16: [0, 4, 4, 4, 4, 4, 4, 4, 2, 0],
  17: [0, 4, 4, 4, 4, 4, 4, 4, 3, 0],
  18: [0, 4, 4, 4, 4, 4, 4, 4, 4, 2],
  19: [0, 4, 4, 4, 4, 4, 4, 4, 4, 3],
  20: [0, 4, 4, 4, 4, 4, 4, 4, 4, 4],
};

/**
 * Arcanist spells prepared per level (different from slots!)
 */
const ARCANIST_PREPARED_TABLE: LevelTable = {
  1: [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [0, 3, 1, 0, 0, 0, 0, 0, 0, 0],
  5: [0, 4, 2, 0, 0, 0, 0, 0, 0, 0],
  6: [0, 4, 2, 1, 0, 0, 0, 0, 0, 0],
  7: [0, 4, 3, 2, 0, 0, 0, 0, 0, 0],
  8: [0, 4, 3, 2, 1, 0, 0, 0, 0, 0],
  9: [0, 4, 4, 3, 2, 0, 0, 0, 0, 0],
  10: [0, 4, 4, 3, 2, 1, 0, 0, 0, 0],
  11: [0, 4, 4, 4, 3, 2, 0, 0, 0, 0],
  12: [0, 4, 4, 4, 3, 2, 1, 0, 0, 0],
  13: [0, 4, 4, 4, 4, 3, 2, 0, 0, 0],
  14: [0, 4, 4, 4, 4, 3, 2, 1, 0, 0],
  15: [0, 4, 4, 4, 4, 4, 3, 2, 0, 0],
  16: [0, 4, 4, 4, 4, 4, 3, 2, 1, 0],
  17: [0, 4, 4, 4, 4, 4, 4, 3, 2, 0],
  18: [0, 4, 4, 4, 4, 4, 4, 3, 2, 1],
  19: [0, 4, 4, 4, 4, 4, 4, 4, 3, 2],
  20: [0, 4, 4, 4, 4, 4, 4, 4, 4, 3],
};

// =============================================================================
// CGE Configuration
// =============================================================================

const arcanistCGEConfig: CGEConfig = {
  id: 'arcanist-spells',
  classId: 'arcanist',
  entityType: 'spell',
  levelPath: '@entity.levels.arcanist',

  // Arcanist has unlimited spells known (spellbook like Wizard)
  known: { type: 'UNLIMITED' },

  tracks: [
    {
      id: 'base',
      label: 'spell_slots',
      resource: {
        type: 'SLOTS',
        table: ARCANIST_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      // LIST PER_LEVEL: prepare specific spells per level,
      // cast spontaneously within those prepared for that level
      preparation: {
        type: 'LIST',
        structure: 'PER_LEVEL',
        maxPerLevel: ARCANIST_PREPARED_TABLE,
        consumeOnUse: false, // Cast any prepared spell with any slot of that level
      },
    },
  ],

  variables: {
    classPrefix: 'arcanist.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.arcanist',
  },

  labels: {
    known: 'spellbook',
    prepared: 'prepared_spells',
    slot: 'spell_slot',
    action: 'cast',
  },
};

const arcanistCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: arcanistCGEConfig,
};

// =============================================================================
// Class Features
// =============================================================================

/**
 * Arcanist Spellcasting
 * Grants the arcanist's arcane spellcasting ability.
 */
export const arcanistSpellcasting: StandardEntity = {
  id: 'arcanist-spellcasting',
  entityType: 'classFeature',
  name: 'Arcane Spellcasting',
  description:
    'An arcanist casts arcane spells drawn from the sorcerer/wizard spell list. An arcanist must prepare her spells ahead of time, but unlike a wizard, she can cast any spell she has prepared using any available spell slot of the appropriate level. This hybrid approach combines the versatility of a sorcerer with the flexibility of a wizard.',
  tags: ['arcanistAbility', 'spellcasting', 'arcane'],
  legacy_specialChanges: [arcanistCGEDefinition],
} as StandardEntity;

/**
 * Arcane Reservoir
 * Arcanist's pool of arcane energy.
 */
export const arcanistArcaneReservoir: StandardEntity = {
  id: 'arcanist-arcane-reservoir',
  entityType: 'classFeature',
  name: 'Arcane Reservoir',
  description:
    'An arcanist has an innate pool of magical energy called her arcane reservoir. This reservoir can be used to fuel various arcanist abilities and enhance spells.',
  tags: ['arcanistAbility', 'arcaneReservoir'],
} as StandardEntity;

// =============================================================================
// Exports
// =============================================================================

export const arcanistClassFeatures: StandardEntity[] = [
  arcanistSpellcasting,
  arcanistArcaneReservoir,
];
