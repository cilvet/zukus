/**
 * Warlock Class Features (Complete Arcane)
 *
 * TEST CLASS - Not D&D 3.5 SRD
 *
 * Demonstrates CGE pattern:
 * - LIMITED_TOTAL known (total invocations, not per level)
 * - NONE resource (at-will, no cost)
 * - NONE preparation (just use known invocations)
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { CGEConfig, LevelTable } from '../../core/domain/cge/types';
import type { CGEDefinitionChange } from '../../core/domain/character/baseData/specialChanges';

// =============================================================================
// Tables
// =============================================================================

/**
 * Total invocations known per class level
 * Single value per level
 */
const WARLOCK_KNOWN_TABLE: LevelTable = {
  1: [1],
  2: [2],
  3: [2],
  4: [3],
  5: [3],
  6: [4],
  7: [4],
  8: [5],
  9: [5],
  10: [6],
  11: [7],
  12: [7],
  13: [8],
  14: [8],
  15: [9],
  16: [10],
  17: [10],
  18: [11],
  19: [11],
  20: [12],
};

// =============================================================================
// CGE Configuration
// =============================================================================

const warlockCGEConfig: CGEConfig = {
  id: 'warlock-invocations',
  classId: 'warlock',
  entityType: 'invocation',
  levelPath: '@entity.gradeLevel', // least=1, lesser=6, greater=11, dark=16

  // Warlock has limited total invocations known
  known: {
    type: 'LIMITED_TOTAL',
    table: WARLOCK_KNOWN_TABLE,
  },

  tracks: [
    {
      id: 'base',
      label: 'invocations',
      // At-will: no resource cost
      resource: { type: 'NONE' },
      // No preparation: just use any known invocation
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'warlock.invocation',
    genericPrefix: 'invocation',
    casterLevelVar: 'invocationLevel.warlock',
  },

  labels: {
    known: 'known_invocations',
    action: 'invoke',
  },
};

const warlockCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: warlockCGEConfig,
};

// =============================================================================
// Class Features
// =============================================================================

/**
 * Warlock Invocations
 * Grants the warlock's invocation system.
 */
export const warlockInvocations: StandardEntity = {
  id: 'warlock-invocations',
  entityType: 'classFeature',
  name: 'Invocations',
  description:
    'A warlock does not prepare or cast spells as other wielders of arcane magic do. Instead, he possesses a repertoire of attacks, defenses, and abilities known as invocations that require him to focus the wild energy that suffuses his soul. A warlock can use any invocation he knows at will.',
  tags: ['warlockAbility', 'invocations'],
  legacy_specialChanges: [warlockCGEDefinition],
} as StandardEntity;

/**
 * Eldritch Blast
 * Warlock's signature attack.
 */
export const warlockEldritchBlast: StandardEntity = {
  id: 'warlock-eldritch-blast',
  entityType: 'classFeature',
  name: 'Eldritch Blast',
  description:
    'The first ability a warlock learns is eldritch blast. A warlock attacks his foes with eldritch power, using baleful magical energy to deal damage and sometimes impart other debilitating effects. An eldritch blast is a ray with a range of 60 feet. It is a ranged touch attack that affects a single target, allowing no saving throw. An eldritch blast deals 1d6 points of damage at 1st level and increases in power as the warlock rises in level.',
  tags: ['warlockAbility', 'supernatural', 'attack'],
} as StandardEntity;

// =============================================================================
// Exports
// =============================================================================

export const warlockClassFeatures: StandardEntity[] = [
  warlockInvocations,
  warlockEldritchBlast,
];
