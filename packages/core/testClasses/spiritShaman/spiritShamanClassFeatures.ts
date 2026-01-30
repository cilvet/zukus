/**
 * Spirit Shaman Class Features (Complete Divine)
 *
 * TEST CLASS - Not D&D 3.5 SRD
 *
 * Demonstrates CGE pattern:
 * - No known config (full list access)
 * - SLOTS resource (spell slots per level)
 * - LIST PER_LEVEL preparation (retrieve spells per level, cast spontaneously within level)
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { CGEConfig, LevelTable } from '../../core/domain/cge/types';
import type { CGEDefinitionChange } from '../../core/domain/character/baseData/specialChanges';

// =============================================================================
// Tables
// =============================================================================

/**
 * Spirit Shaman spell slots per day
 * Same as Sorcerer
 */
const SPIRIT_SHAMAN_SLOTS_TABLE: LevelTable = {
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

// =============================================================================
// CGE Configuration
// =============================================================================

const spiritShamanCGEConfig: CGEConfig = {
  id: 'spirit-shaman-spells',
  classId: 'spirit-shaman',
  entityType: 'spell',
  levelPath: '@entity.levels.spiritShaman',

  // No known config: full access to spirit shaman spell list

  tracks: [
    {
      id: 'base',
      label: 'spell_slots',
      resource: {
        type: 'SLOTS',
        table: SPIRIT_SHAMAN_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      // LIST PER_LEVEL: retrieve specific spells per level,
      // but cast spontaneously within those retrieved
      preparation: {
        type: 'LIST',
        structure: 'PER_LEVEL',
        maxPerLevel: SPIRIT_SHAMAN_SLOTS_TABLE, // Same as slots
        consumeOnUse: false, // Cast any retrieved spell with any slot of that level
      },
    },
  ],

  variables: {
    classPrefix: 'spiritShaman.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.spiritShaman',
  },

  labels: {
    prepared: 'retrieved_spells',
    slot: 'spell_slot',
    action: 'cast',
  },
};

const spiritShamanCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: spiritShamanCGEConfig,
};

// =============================================================================
// Class Features
// =============================================================================

/**
 * Spirit Shaman Spellcasting
 * Grants the spirit shaman's divine spellcasting ability.
 */
export const spiritShamanSpellcasting: StandardEntity = {
  id: 'spirit-shaman-spellcasting',
  entityType: 'classFeature',
  name: 'Spirit Magic',
  description:
    'A spirit shaman casts divine spells by calling upon spirits. Each day, she retrieves a selection of spells from the spirit shaman spell list. Once retrieved, she can cast any of them spontaneously using her spell slots of the appropriate level.',
  tags: ['spiritShamanAbility', 'spellcasting', 'divine'],
  legacy_specialChanges: [spiritShamanCGEDefinition],
} as StandardEntity;

/**
 * Spirit Guide
 * Spirit shamans have a spirit guide.
 */
export const spiritShamanSpiritGuide: StandardEntity = {
  id: 'spirit-shaman-spirit-guide',
  entityType: 'classFeature',
  name: 'Spirit Guide',
  description:
    'A spirit shaman gains a spirit guide, an incorporeal spirit that serves as her connection to the spirit world. The spirit guide can provide information, assist in spellcasting, and grant various bonuses.',
  tags: ['spiritShamanAbility', 'spiritGuide'],
} as StandardEntity;

// =============================================================================
// Exports
// =============================================================================

export const spiritShamanClassFeatures: StandardEntity[] = [
  spiritShamanSpellcasting,
  spiritShamanSpiritGuide,
];
