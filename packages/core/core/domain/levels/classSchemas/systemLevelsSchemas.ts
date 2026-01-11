/**
 * Schema definitions for system-level entities.
 *
 * These schemas define the structure of:
 * - `system_levels`: System-wide level progressions (feats, ability increases)
 * - `character_ability_increase`: Entities for +1 to an ability score
 */

import type { EntitySchemaDefinition } from '../../entities/types/schema';
import type { EntityFieldDefinition } from '../../entities/types/fields';

// =============================================================================
// Shared Field Definitions (reused from classSchemas)
// =============================================================================

/**
 * Granted configuration fields.
 * Note: 'filter' field is omitted from schema validation as EntityFilter
 * is a complex structure validated separately at runtime.
 */
const grantedConfigFields: EntityFieldDefinition[] = [
  {
    name: 'specificIds',
    type: 'string_array',
    optional: true,
    description: 'Specific entity IDs to grant',
  },
];

/**
 * Selector configuration fields.
 * Note: 'filter' field is omitted from schema validation as EntityFilter
 * is a complex structure validated separately at runtime.
 */
const selectorConfigFields: EntityFieldDefinition[] = [
  { name: 'id', type: 'string', description: 'Unique identifier for this selector' },
  { name: 'name', type: 'string', description: 'Display name for UI' },
  { name: 'entityType', type: 'string', optional: true, description: 'Entity type to filter by' },
  { name: 'entityIds', type: 'string_array', optional: true, description: 'Closed list of entity IDs' },
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

// =============================================================================
// SystemLevels Schema
// =============================================================================

/**
 * Schema definition for system levels.
 *
 * System levels define progressions that apply to all characters
 * regardless of class (e.g., feat selection, ability score increases).
 */
export const systemLevelsSchemaDefinition: EntitySchemaDefinition = {
  typeName: 'system_levels',
  description: 'System-wide level progressions (feats, ability increases, etc.)',
  addons: ['searchable'],
  fields: [
    {
      name: 'levels',
      type: 'object',
      description: 'Level data keyed by character level number (as string)',
      objectFields: [
        {
          name: 'providers',
          type: 'object_array',
          optional: true,
          description: 'EntityProviders that grant or offer entities at this level',
          objectFields: providerFields,
        },
      ],
    },
  ],
};

// =============================================================================
// CharacterAbilityIncrease Schema
// =============================================================================

/**
 * Schema definition for character ability increase.
 *
 * These entities represent the +1 ability score increases
 * that characters receive at levels 4, 8, 12, 16, 20.
 * Each ability has its own entity (strength-increase, dexterity-increase, etc.)
 */
export const characterAbilityIncreaseSchemaDefinition: EntitySchemaDefinition = {
  typeName: 'character_ability_increase',
  description: 'A +1 increase to a specific ability score',
  addons: ['searchable', 'effectful'],
  fields: [
    {
      name: 'abilityId',
      type: 'string',
      description: 'The ability this increase applies to',
      allowedValues: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'],
    },
  ],
};

// =============================================================================
// Export all schema definitions
// =============================================================================

export const systemLevelsSchemas = {
  system_levels: systemLevelsSchemaDefinition,
  character_ability_increase: characterAbilityIncreaseSchemaDefinition,
};

