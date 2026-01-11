import type { EntityFieldDefinition } from '../../entities/types/fields';

// =============================================================================
// Addon Definition
// =============================================================================

/**
 * Definition of an addon that can be composed into entity schemas.
 * 
 * Addons provide reusable sets of fields that can be added to any entity type.
 * For example, the 'searchable' addon adds 'name' and 'description' fields.
 */
export type AddonDefinition = {
  /** Unique identifier for the addon */
  id: string;
  
  /** Human-readable name for the addon */
  name: string;
  
  /** Fields that this addon adds to an entity */
  fields: EntityFieldDefinition[];
};

// =============================================================================
// Addon Registry
// =============================================================================

/**
 * Registry of available addons indexed by their ID.
 * 
 * This is passed to schema creation functions to resolve addon IDs
 * to their actual field definitions.
 */
export type AddonRegistry = Record<string, AddonDefinition>;

