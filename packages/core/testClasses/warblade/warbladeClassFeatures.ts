/**
 * Warblade Class Features (Tome of Battle)
 *
 * TEST CLASS - Not D&D 3.5 SRD
 *
 * Demonstrates CGE pattern:
 * - LIMITED_TOTAL known (total maneuvers, not per level)
 * - NONE resource (no slots/pool cost)
 * - LIST GLOBAL preparation (readied maneuvers, consumed on use)
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { CGEConfig, LevelTable } from '../../core/domain/cge/types';
import type { CGEDefinitionChange } from '../../core/domain/character/baseData/specialChanges';

// =============================================================================
// Tables
// =============================================================================

/**
 * Total maneuvers known per class level
 * Single value per level (not per maneuver level)
 */
const WARBLADE_KNOWN_TABLE: LevelTable = {
  1: [3],
  2: [4],
  3: [5],
  4: [5],
  5: [6],
  6: [6],
  7: [7],
  8: [7],
  9: [8],
  10: [8],
  11: [9],
  12: [9],
  13: [10],
  14: [10],
  15: [11],
  16: [11],
  17: [12],
  18: [12],
  19: [13],
  20: [13],
};

// Note: Readied maneuvers use a formula referencing @warblade.readiedManeuvers
// which would be computed from a table in the class's level configuration.

// =============================================================================
// CGE Configuration
// =============================================================================

const warbladeCGEConfig: CGEConfig = {
  id: 'warblade-maneuvers',
  classId: 'warblade',
  entityType: 'maneuver',
  levelPath: '@entity.level',

  // Warblade has limited total maneuvers known
  known: {
    type: 'LIMITED_TOTAL',
    table: WARBLADE_KNOWN_TABLE,
  },

  tracks: [
    {
      id: 'base',
      label: 'readied_maneuvers',
      // No resource cost - just ready and use
      resource: { type: 'NONE' },
      // Global list that gets consumed on use
      preparation: {
        type: 'LIST',
        structure: 'GLOBAL',
        maxFormula: { expression: '@warblade.readiedManeuvers' },
        consumeOnUse: true,
        recovery: 'manual', // Recovered by specific combat actions
      },
    },
  ],

  variables: {
    classPrefix: 'warblade.maneuver',
    genericPrefix: 'maneuver',
    casterLevelVar: 'initiatorLevel.warblade',
  },

  labels: {
    known: 'known_maneuvers',
    prepared: 'readied_maneuvers',
    action: 'initiate',
  },
};

const warbladeCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: warbladeCGEConfig,
};

// =============================================================================
// Class Features
// =============================================================================

/**
 * Warblade Martial Maneuvers
 * Grants the warblade's martial maneuver system.
 */
export const warbladeManeuvers: StandardEntity = {
  id: 'warblade-maneuvers',
  entityType: 'classFeature',
  name: 'Martial Maneuvers',
  description:
    'A warblade begins his career with knowledge of three martial maneuvers. The disciplines available to him are Diamond Mind, Iron Heart, Stone Dragon, Tiger Claw, and White Raven. At each level, a warblade can choose to learn a new maneuver from any discipline available to him.',
  tags: ['warbladeAbility', 'martialManeuvers'],
  legacy_specialChanges: [warbladeCGEDefinition],
} as StandardEntity;

/**
 * Battle Clarity
 * Warblade adds Int bonus to Reflex saves.
 */
export const warbladeBattleClarity: StandardEntity = {
  id: 'warblade-battle-clarity',
  entityType: 'classFeature',
  name: 'Battle Clarity',
  description:
    'You can enter a state of almost mystical awareness of the battlefield around you. As long as you are not flat-footed, you gain an insight bonus equal to your Intelligence bonus (minimum +1) on your Reflex saves.',
  tags: ['warbladeAbility', 'extraordinary'],
} as StandardEntity;

// =============================================================================
// Exports
// =============================================================================

export const warbladeClassFeatures: StandardEntity[] = [
  warbladeManeuvers,
  warbladeBattleClarity,
];
