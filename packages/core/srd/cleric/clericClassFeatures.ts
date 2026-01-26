/**
 * Cleric Class Features for D&D 3.5
 *
 * Contains:
 * - Cleric Spellcasting (with CGE configuration)
 * - Turn/Rebuke Undead
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { CGEConfig, LevelTable } from '../../core/domain/cge/types';
import type { CGEDefinitionChange } from '../../core/domain/character/baseData/specialChanges';

// =============================================================================
// Slot Tables
// =============================================================================

/**
 * Cleric base spell slots (excluding domain slots)
 * Index 0 = cantrips (orisons), 1-9 = spell levels 1-9
 */
const CLERIC_BASE_SLOTS_TABLE: LevelTable = {
  1: [3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [5, 3, 2, 0, 0, 0, 0, 0, 0, 0],
  5: [5, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  6: [5, 3, 3, 2, 0, 0, 0, 0, 0, 0],
  7: [6, 4, 3, 2, 1, 0, 0, 0, 0, 0],
  8: [6, 4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [6, 4, 4, 3, 2, 1, 0, 0, 0, 0],
  10: [6, 4, 4, 3, 3, 2, 0, 0, 0, 0],
  11: [6, 5, 4, 4, 3, 2, 1, 0, 0, 0],
  12: [6, 5, 4, 4, 3, 3, 2, 0, 0, 0],
  13: [6, 5, 5, 4, 4, 3, 2, 1, 0, 0],
  14: [6, 5, 5, 4, 4, 3, 3, 2, 0, 0],
  15: [6, 5, 5, 5, 4, 4, 3, 2, 1, 0],
  16: [6, 5, 5, 5, 4, 4, 3, 3, 2, 0],
  17: [6, 5, 5, 5, 5, 4, 4, 3, 2, 1],
  18: [6, 5, 5, 5, 5, 4, 4, 3, 3, 2],
  19: [6, 5, 5, 5, 5, 5, 4, 4, 3, 3],
  20: [6, 5, 5, 5, 5, 5, 4, 4, 4, 4],
};

/**
 * Cleric domain spell slots (1 per spell level available)
 */
const CLERIC_DOMAIN_SLOTS_TABLE: LevelTable = {
  1: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  5: [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  6: [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  7: [0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  8: [0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  9: [0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  10: [0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  11: [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  12: [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  13: [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  14: [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  15: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  16: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  17: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  18: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  19: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  20: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
};

// =============================================================================
// CGE Configuration
// =============================================================================

const clericCGEConfig: CGEConfig = {
  id: 'cleric-spells',
  classId: 'cleric',
  entityType: 'spell',
  levelPath: '@entity.levels.cleric',

  // No known config: Cleric can prepare any spell from the cleric list
  // (no spellbook, full list access)

  tracks: [
    {
      id: 'base',
      label: 'base_slots',
      resource: {
        type: 'SLOTS',
        table: CLERIC_BASE_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      preparation: { type: 'BOUND' },
    },
    {
      id: 'domain',
      label: 'domain_slots',
      // TODO: filter for domain spells only using EntityFilter
      resource: {
        type: 'SLOTS',
        table: CLERIC_DOMAIN_SLOTS_TABLE,
        refresh: 'daily',
      },
      preparation: { type: 'BOUND' },
    },
  ],

  variables: {
    classPrefix: 'cleric.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.cleric',
  },

  labels: {
    known: 'divine_spells',
    prepared: 'prepared_spells',
    slot: 'spell_slot',
    action: 'cast',
  },
};

const clericCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: clericCGEConfig,
};

// =============================================================================
// Class Features
// =============================================================================

/**
 * Cleric Spellcasting
 * Grants the cleric's divine spellcasting ability with CGE configuration.
 */
export const clericSpellcasting: StandardEntity = {
  id: 'cleric-spellcasting',
  entityType: 'classFeature',
  name: 'Divine Spellcasting',
  description:
    'A cleric casts divine spells, which are drawn from the cleric spell list. A cleric must choose and prepare her spells in advance. To prepare or cast a spell, a cleric must have a Wisdom score equal to at least 10 + the spell level.',
  tags: ['clericAbility', 'spellcasting', 'divine'],
  legacy_specialChanges: [clericCGEDefinition],
} as StandardEntity;

/**
 * Turn/Rebuke Undead
 * Clerics can turn or rebuke undead creatures.
 */
export const clericTurnUndead: StandardEntity = {
  id: 'cleric-turn-undead',
  entityType: 'classFeature',
  name: 'Turn or Rebuke Undead',
  description:
    'Any cleric, regardless of alignment, has the power to affect undead creatures by channeling the power of his faith through his holy (or unholy) symbol. A good cleric (or a neutral cleric who worships a good deity) can turn or destroy undead creatures. An evil cleric (or a neutral cleric who worships an evil deity) instead rebukes or commands such creatures.',
  tags: ['clericAbility', 'supernatural', 'channeling'],
} as StandardEntity;

// =============================================================================
// Exports
// =============================================================================

export const clericClassFeatures: StandardEntity[] = [
  clericSpellcasting,
  clericTurnUndead,
];
