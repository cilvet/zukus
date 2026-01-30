/**
 * Wizard Class Features for D&D 3.5
 *
 * Contains:
 * - Wizard Spellcasting (with CGE configuration for prepared vancian casting)
 * - Scribe Scroll
 * - Bonus Feats
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { CGEConfig, LevelTable } from '../../core/domain/cge/types';
import type { CGEDefinitionChange } from '../../core/domain/character/baseData/specialChanges';

// =============================================================================
// Slot Tables
// =============================================================================

/**
 * Wizard spell slots per day
 * Index 0 = cantrips, 1-9 = spell levels 1-9
 */
const WIZARD_SLOTS_TABLE: LevelTable = {
  1: [3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 2, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  6: [4, 3, 3, 2, 0, 0, 0, 0, 0, 0],
  7: [4, 4, 3, 2, 1, 0, 0, 0, 0, 0],
  8: [4, 4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 4, 4, 3, 2, 1, 0, 0, 0, 0],
  10: [4, 4, 4, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 4, 4, 4, 3, 2, 1, 0, 0, 0],
  12: [4, 4, 4, 4, 3, 3, 2, 0, 0, 0],
  13: [4, 4, 4, 4, 4, 3, 2, 1, 0, 0],
  14: [4, 4, 4, 4, 4, 3, 3, 2, 0, 0],
  15: [4, 4, 4, 4, 4, 4, 3, 2, 1, 0],
  16: [4, 4, 4, 4, 4, 4, 3, 3, 2, 0],
  17: [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],
  18: [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],
  19: [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],
  20: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
};

// =============================================================================
// CGE Configuration
// =============================================================================

const wizardCGEConfig: CGEConfig = {
  id: 'wizard-spells',
  classId: 'wizard',
  entityType: 'spell',
  levelPath: '@entity.levels.wizard',

  // Wizard has unlimited spells known (spellbook)
  known: { type: 'UNLIMITED' },

  tracks: [
    {
      id: 'base',
      label: 'spell_slots',
      resource: {
        type: 'SLOTS',
        table: WIZARD_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      // Vancian preparation: each slot is bound to a specific spell
      preparation: { type: 'BOUND' },
    },
  ],

  variables: {
    classPrefix: 'wizard.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.wizard',
  },

  labels: {
    known: 'spellbook',
    prepared: 'prepared_spells',
    slot: 'spell_slot',
    action: 'cast',
  },
};

const wizardCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: wizardCGEConfig,
};

// =============================================================================
// Class Features
// =============================================================================

/**
 * Wizard Spellcasting
 * Grants the wizard's arcane spellcasting ability with CGE configuration.
 */
export const wizardSpellcasting: StandardEntity = {
  id: 'wizard-spellcasting',
  entityType: 'classFeature',
  name: 'Arcane Spellcasting',
  description:
    'A wizard casts arcane spells which are drawn from the sorcerer/wizard spell list. A wizard must choose and prepare her spells ahead of time. To learn, prepare, or cast a spell, the wizard must have an Intelligence score equal to at least 10 + the spell level.',
  tags: ['wizardAbility', 'spellcasting', 'arcane'],
  legacy_specialChanges: [wizardCGEDefinition],
} as StandardEntity;

/**
 * Scribe Scroll
 * Wizards gain Scribe Scroll as a bonus feat at 1st level.
 */
export const wizardScribeScroll: StandardEntity = {
  id: 'wizard-scribe-scroll',
  entityType: 'classFeature',
  name: 'Scribe Scroll',
  description:
    'At 1st level, a wizard gains Scribe Scroll as a bonus feat.',
  tags: ['wizardAbility', 'bonusFeat'],
} as StandardEntity;

/**
 * Wizard Familiar
 * Wizards gain a familiar at 1st level.
 */
export const wizardFamiliar: StandardEntity = {
  id: 'wizard-familiar',
  entityType: 'classFeature',
  name: 'Familiar',
  description:
    'A wizard can obtain a familiar. Doing so takes 24 hours and uses up magical materials that cost 100 gp. A familiar is a magical beast that resembles a small animal and is unusually tough and intelligent.',
  tags: ['wizardAbility', 'familiar'],
} as StandardEntity;

// =============================================================================
// Exports
// =============================================================================

export const wizardClassFeatures: StandardEntity[] = [
  wizardSpellcasting,
  wizardScribeScroll,
  wizardFamiliar,
];
