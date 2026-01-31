/**
 * Instance Fields for Inventory
 *
 * Helper functions for working with instance fields in the inventory system.
 */

import type { InventoryItemInstance } from './types';
import type { AddonDefinition, AddonRegistry } from '../levels/entities/types';
import type { EntitySchemaDefinition } from '../entities/types/schema';
import {
  type InstanceFieldDefinition,
  type InstanceFieldValue,
  type InstanceValues,
  getInstanceFieldValue,
  setInstanceFieldValue,
  mergeInstanceFieldDefinitions,
} from '../entities/types/instanceFields';

// =============================================================================
// Get Instance Field Definitions
// =============================================================================

/**
 * Gets all instance field definitions for an entity type by resolving its addons.
 *
 * @param schema - The entity schema definition
 * @param addonRegistry - Registry of available addons
 * @returns Array of instance field definitions from all addons
 */
export function getInstanceFieldsForSchema(
  schema: EntitySchemaDefinition,
  addonRegistry: AddonRegistry
): InstanceFieldDefinition[] {
  const addonIds = schema.addons ?? [];
  const fieldArrays: (InstanceFieldDefinition[] | undefined)[] = [];

  for (const addonId of addonIds) {
    const addon = addonRegistry[addonId];
    if (addon?.instanceFields) {
      fieldArrays.push(addon.instanceFields);
    }
  }

  return mergeInstanceFieldDefinitions(...fieldArrays);
}

/**
 * Gets instance field definitions directly from a list of addons.
 *
 * @param addons - Array of addon definitions
 * @returns Merged array of instance field definitions
 */
export function getInstanceFieldsFromAddons(
  addons: AddonDefinition[]
): InstanceFieldDefinition[] {
  return mergeInstanceFieldDefinitions(
    ...addons.map((addon) => addon.instanceFields)
  );
}

// =============================================================================
// Item Instance Value Helpers
// =============================================================================

/**
 * Gets a specific instance field value from an inventory item.
 *
 * @param item - The inventory item instance
 * @param field - The field definition
 * @returns The field value (or default if not set)
 */
export function getItemInstanceValue(
  item: InventoryItemInstance,
  field: InstanceFieldDefinition
): InstanceFieldValue {
  return getInstanceFieldValue(item.instanceValues, field);
}

/**
 * Sets an instance field value on an inventory item.
 * Returns a new item with updated instanceValues.
 *
 * @param item - The inventory item instance
 * @param field - The field definition
 * @param value - The new value
 * @returns New item with updated instanceValues
 */
export function setItemInstanceValue(
  item: InventoryItemInstance,
  field: InstanceFieldDefinition,
  value: InstanceFieldValue
): InventoryItemInstance {
  const newInstanceValues = setInstanceFieldValue(
    item.instanceValues,
    field,
    value
  );

  return {
    ...item,
    instanceValues: newInstanceValues,
  };
}

/**
 * Updates an item in the inventory state with a new instance field value.
 *
 * @param items - Current inventory items
 * @param instanceId - ID of the item to update
 * @param field - The field definition
 * @param value - The new value
 * @returns New items array with the updated item
 */
export function updateItemInstanceValue(
  items: InventoryItemInstance[],
  instanceId: string,
  field: InstanceFieldDefinition,
  value: InstanceFieldValue
): InventoryItemInstance[] {
  return items.map((item) => {
    if (item.instanceId !== instanceId) {
      return item;
    }
    return setItemInstanceValue(item, field, value);
  });
}

// =============================================================================
// Active State Helpers (for activable addon)
// =============================================================================

/**
 * The 'active' field definition from the activable addon.
 * Useful for quick access without needing to look up the addon.
 */
export const ACTIVE_FIELD: InstanceFieldDefinition = {
  name: 'active',
  type: 'boolean',
  default: false,
  label: 'Active',
  description: 'Whether this entity is currently active',
};

/**
 * Checks if an item is active (for activable entities).
 *
 * @param item - The inventory item instance
 * @returns true if the item is active, false otherwise
 */
export function isItemActive(item: InventoryItemInstance): boolean {
  return getItemInstanceValue(item, ACTIVE_FIELD) === true;
}

/**
 * Sets the active state of an item.
 *
 * @param item - The inventory item instance
 * @param active - The new active state
 * @returns New item with updated active state
 */
export function setItemActive(
  item: InventoryItemInstance,
  active: boolean
): InventoryItemInstance {
  return setItemInstanceValue(item, ACTIVE_FIELD, active);
}

/**
 * Toggles the active state of an item.
 *
 * @param item - The inventory item instance
 * @returns New item with toggled active state
 */
export function toggleItemActive(
  item: InventoryItemInstance
): InventoryItemInstance {
  return setItemActive(item, !isItemActive(item));
}
