/**
 * Psion Class Features (Expanded Psionics Handbook)
 *
 * TEST CLASS - Not D&D 3.5 SRD
 *
 * Demonstrates CGE pattern:
 * - LIMITED_TOTAL known (total powers, not per level)
 * - POOL resource (power points, cost = power level)
 * - NONE preparation (spontaneous manifestation)
 */

import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { CGEConfig, LevelTable } from '../../core/domain/cge/types';
import type { CGEDefinitionChange } from '../../core/domain/character/baseData/specialChanges';

// =============================================================================
// Tables
// =============================================================================

/**
 * Total powers known per class level
 * Single value per level (not per power level)
 */
const PSION_KNOWN_TABLE: LevelTable = {
  1: [3],
  2: [5],
  3: [7],
  4: [9],
  5: [11],
  6: [13],
  7: [15],
  8: [17],
  9: [19],
  10: [21],
  11: [23],
  12: [25],
  13: [27],
  14: [29],
  15: [31],
  16: [33],
  17: [35],
  18: [37],
  19: [39],
  20: [41],
};

// Note: Power points use a formula referencing @psion.powerPoints.max
// which would be computed from a table in the class's level configuration.

// =============================================================================
// CGE Configuration
// =============================================================================

const psionCGEConfig: CGEConfig = {
  id: 'psion-powers',
  classId: 'psion',
  entityType: 'power',
  levelPath: '@entity.level',

  // Psion has limited total powers known
  known: {
    type: 'LIMITED_TOTAL',
    table: PSION_KNOWN_TABLE,
  },

  tracks: [
    {
      id: 'base',
      label: 'power_points',
      // Pool resource with cost based on power level
      resource: {
        type: 'POOL',
        maxFormula: { expression: '@psion.powerPoints.max' },
        costPath: '@entity.level', // Cost = power level
        refresh: 'daily',
      },
      // Spontaneous manifestation - no preparation
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'psion.power',
    genericPrefix: 'power',
    casterLevelVar: 'manifesterLevel.psion',
  },

  labels: {
    known: 'known_powers',
    pool: 'power_points',
    action: 'manifest',
  },
};

const psionCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: psionCGEConfig,
};

// =============================================================================
// Class Features
// =============================================================================

/**
 * Psion Powers
 * Grants the psion's psionic power system.
 */
export const psionPowers: StandardEntity = {
  id: 'psion-powers',
  entityType: 'classFeature',
  name: 'Psionic Powers',
  description:
    'A psion learns and manifests psionic powers, which are mental abilities fueled by power points. A psion can learn any power from the psion/wilder list, and can manifest any power she knows as long as she has sufficient power points.',
  tags: ['psionAbility', 'psionics'],
  legacy_specialChanges: [psionCGEDefinition],
} as StandardEntity;

/**
 * Discipline
 * Psions choose a discipline at 1st level.
 */
export const psionDiscipline: StandardEntity = {
  id: 'psion-discipline',
  entityType: 'classFeature',
  name: 'Discipline',
  description:
    'A psion must choose a discipline of psionics at 1st level: Egoist (Psychometabolism), Kineticist (Psychokinesis), Nomad (Psychoportation), Seer (Clairsentience), Shaper (Metacreativity), or Telepath (Telepathy).',
  tags: ['psionAbility', 'discipline'],
} as StandardEntity;

// =============================================================================
// Exports
// =============================================================================

export const psionClassFeatures: StandardEntity[] = [
  psionPowers,
  psionDiscipline,
];
