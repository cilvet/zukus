import type { EntityFieldDefinition } from '../../entities/types/fields';
import type { InstanceFieldDefinition } from '../../entities/types/instanceFields';

// =============================================================================
// Addon Definition
// =============================================================================

/**
 * Definition of an addon that can be composed into entity schemas.
 *
 * Addons provide reusable sets of fields that can be added to any entity type.
 * For example, the 'searchable' addon adds 'name' and 'description' fields.
 *
 * Addons can also define instanceFields - user-editable fields that exist
 * per-instance of an entity (stored in InventoryItemInstance.instanceValues).
 */
export type AddonDefinition = {
  /** Unique identifier for the addon */
  id: string;

  /** Human-readable name for the addon */
  name: string;

  /** Fields that this addon adds to an entity (stored in compendium) */
  fields: EntityFieldDefinition[];

  /**
   * Instance fields that exist per-instance of the entity.
   * These are user-editable values stored in InventoryItemInstance.instanceValues.
   * Example: { name: 'active', type: 'boolean', default: false }
   */
  instanceFields?: InstanceFieldDefinition[];
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

