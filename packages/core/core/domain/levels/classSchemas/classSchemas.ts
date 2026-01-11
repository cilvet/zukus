/**
 * Schema definitions for class-related entities.
 *
 * These schemas define the structure of:
 * - `class`: A character class (Fighter, Rogue, etc.)
 * - `classLevel`: A specific level of a class with its providers
 * - `classFeature`: An ability or feature granted by a class
 */

import type { EntitySchemaDefinition } from '../../entities/types/schema';
import type { EntityFieldDefinition } from '../../entities/types/fields';

// =============================================================================
// Shared Field Definitions
// =============================================================================

/**
 * Save progression field definition (used in saves object).
 */
const saveProgressionField: EntityFieldDefinition = {
  name: 'progression',
  type: 'string',
  allowedValues: ['good', 'poor'],
};

/**
 * Saves object structure.
 */
const savesFields: EntityFieldDefinition[] = [
  { name: 'fortitude', type: 'string', allowedValues: ['good', 'poor'] },
  { name: 'reflex', type: 'string', allowedValues: ['good', 'poor'] },
  { name: 'will', type: 'string', allowedValues: ['good', 'poor'] },
];

/**
 * Variable definition structure for definesVariables.
 */
const variableDefinitionFields: EntityFieldDefinition[] = [
  { name: 'name', type: 'string', description: 'Variable name (e.g., sneakAttackDice)' },
  { name: 'value', type: 'integer', optional: true, description: 'Static value' },
  {
    name: 'formula',
    type: 'object',
    optional: true,
    description: 'Dynamic formula',
    objectFields: [
      { name: 'expression', type: 'string', description: 'Formula expression' },
    ],
  },
];

// =============================================================================
// Class Schema
// =============================================================================

/**
 * Schema definition for a character class.
 *
 * A class defines:
 * - Hit die and skill points
 * - BAB and save progressions
 * - Class skills
 * - References to its levels
 */
export const classSchemaDefinition: EntitySchemaDefinition = {
  typeName: 'class',
  description: 'A character class (e.g., Fighter, Rogue, Wizard)',
  addons: ['searchable'],
  fields: [
    {
      name: 'hitDie',
      type: 'integer',
      description: 'Hit die size (4, 6, 8, 10, or 12)',
      allowedValues: [4, 6, 8, 10, 12],
    },
    {
      name: 'babProgression',
      type: 'string',
      description: 'Base Attack Bonus progression',
      allowedValues: ['full', 'medium', 'poor'],
    },
    {
      name: 'saves',
      type: 'object',
      description: 'Saving throw progressions',
      objectFields: savesFields,
    },
    {
      name: 'classType',
      type: 'string',
      description: 'Type of class',
      allowedValues: ['base', 'prestige'],
    },
    {
      name: 'skillPointsPerLevel',
      type: 'integer',
      description: 'Skill points gained per level (before INT modifier)',
    },
    {
      name: 'classSkillIds',
      type: 'reference',
      optional: true,
      description: 'IDs of skills that are class skills',
      referenceType: 'skill',
    },
    {
      name: 'levelIds',
      type: 'reference',
      optional: true,
      description: 'IDs of classLevel entities for each level',
      referenceType: 'classLevel',
    },
  ],
};

// =============================================================================
// ClassLevel Schema
// =============================================================================

/**
 * Granted configuration fields.
 */
const grantedConfigFields: EntityFieldDefinition[] = [
  {
    name: 'specificIds',
    type: 'string_array',
    optional: true,
    description: 'Specific entity IDs to grant',
  },
  {
    name: 'filter',
    type: 'object',
    optional: true,
    description: 'Filter to match entities to grant',
    objectFields: [], // EntityFilter is complex, validated separately
  },
];

/**
 * Selector configuration fields.
 */
const selectorConfigFields: EntityFieldDefinition[] = [
  { name: 'id', type: 'string', description: 'Unique identifier for this selector' },
  { name: 'name', type: 'string', description: 'Display name for UI' },
  { name: 'entityType', type: 'string', optional: true, description: 'Entity type to filter by' },
  { name: 'entityIds', type: 'string_array', optional: true, description: 'Closed list of entity IDs' },
  {
    name: 'filter',
    type: 'object',
    optional: true,
    description: 'Additional filter for eligible entities',
    objectFields: [], // EntityFilter is complex, validated separately
  },
  { name: 'min', type: 'integer', description: 'Minimum selections required' },
  { name: 'max', type: 'integer', description: 'Maximum selections allowed' },
];

/**
 * EntityProvider fields.
 */
const providerFields: EntityFieldDefinition[] = [
  {
    name: 'granted',
    type: 'object',
    optional: true,
    description: 'Configuration for automatically granted entities',
    objectFields: grantedConfigFields,
  },
  {
    name: 'selector',
    type: 'object',
    optional: true,
    description: 'Configuration for user selection',
    objectFields: selectorConfigFields,
  },
];

/**
 * Schema definition for a class level.
 *
 * A class level defines:
 * - Which class it belongs to
 * - The level number
 * - Providers (features) for that level
 */
export const classLevelSchemaDefinition: EntitySchemaDefinition = {
  typeName: 'classLevel',
  description: 'A specific level of a class with its features',
  addons: ['searchable'],
  fields: [
    {
      name: 'classId',
      type: 'string',
      description: 'ID of the class this level belongs to',
    },
    {
      name: 'level',
      type: 'integer',
      description: 'The level number (1-20 for base, 1-10 for prestige)',
    },
    {
      name: 'providers',
      type: 'object_array',
      description: 'EntityProviders that grant or offer entities at this level',
      objectFields: providerFields,
    },
  ],
};

// =============================================================================
// ClassFeature Schema
// =============================================================================

/**
 * Schema definition for a class feature.
 *
 * A class feature is an ability granted by a class level.
 * It can:
 * - Apply effects to the character (effectful addon)
 * - Suppress other features (suppressing addon)
 * - Define variables for other systems to consume
 * - Provide additional entities through selectors or grants (providable addon)
 */
export const classFeatureSchemaDefinition: EntitySchemaDefinition = {
  typeName: 'classFeature',
  description: 'An ability or feature granted by a class',
  addons: ['searchable', 'effectful', 'suppressing', 'providable'],
  fields: [
    {
      name: 'definesVariables',
      type: 'object_array',
      optional: true,
      description: 'Variables this feature defines (e.g., sneakAttackDice)',
      objectFields: variableDefinitionFields,
    },
  ],
};

// =============================================================================
// Export all schema definitions
// =============================================================================

export const classSchemas = {
  class: classSchemaDefinition,
  classLevel: classLevelSchemaDefinition,
  classFeature: classFeatureSchemaDefinition,
};

