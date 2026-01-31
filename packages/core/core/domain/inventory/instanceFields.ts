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

// =============================================================================
// Equipped State Helpers (for equippable addon)
// =============================================================================

/**
 * The 'equipped' field definition from the equippable addon.
 */
export const EQUIPPED_FIELD: InstanceFieldDefinition = {
  name: 'equipped',
  type: 'boolean',
  default: false,
  label: 'Equipped',
  description: 'Whether this item is currently equipped',
};

/**
 * Checks if an item is equipped.
 *
 * @param item - The inventory item instance
 * @returns true if the item is equipped, false otherwise
 */
export function isItemEquipped(item: InventoryItemInstance): boolean {
  return getItemInstanceValue(item, EQUIPPED_FIELD) === true;
}

/**
 * Sets the equipped state of an item.
 *
 * @param item - The inventory item instance
 * @param equipped - The new equipped state
 * @returns New item with updated equipped state
 */
export function setItemEquipped(
  item: InventoryItemInstance,
  equipped: boolean
): InventoryItemInstance {
  return setItemInstanceValue(item, EQUIPPED_FIELD, equipped);
}

/**
 * Toggles the equipped state of an item.
 *
 * @param item - The inventory item instance
 * @returns New item with toggled equipped state
 */
export function toggleItemEquipped(
  item: InventoryItemInstance
): InventoryItemInstance {
  return setItemEquipped(item, !isItemEquipped(item));
}

// =============================================================================
// Wielded State Helpers (for wieldable addon)
// =============================================================================

/**
 * The 'wielded' field definition from the wieldable addon.
 */
export const WIELDED_FIELD: InstanceFieldDefinition = {
  name: 'wielded',
  type: 'boolean',
  default: false,
  label: 'Wielded',
  description: 'Whether this weapon is currently wielded (in hand)',
};

/**
 * Checks if a weapon is wielded.
 *
 * @param item - The inventory item instance
 * @returns true if the weapon is wielded, false otherwise
 */
export function isItemWielded(item: InventoryItemInstance): boolean {
  return getItemInstanceValue(item, WIELDED_FIELD) === true;
}

/**
 * Sets the wielded state of a weapon.
 *
 * @param item - The inventory item instance
 * @param wielded - The new wielded state
 * @returns New item with updated wielded state
 */
export function setItemWielded(
  item: InventoryItemInstance,
  wielded: boolean
): InventoryItemInstance {
  return setItemInstanceValue(item, WIELDED_FIELD, wielded);
}

/**
 * Toggles the wielded state of a weapon.
 *
 * @param item - The inventory item instance
 * @returns New item with toggled wielded state
 */
export function toggleItemWielded(
  item: InventoryItemInstance
): InventoryItemInstance {
  return setItemWielded(item, !isItemWielded(item));
}

// =============================================================================
// Instance Values to Substitution Index
// =============================================================================

/**
 * Converts item instance values to a substitution index format.
 * This allows effects with conditions like @instance.equipped to be evaluated.
 *
 * @param item - The inventory item instance
 * @param fields - The instance field definitions for this item type
 * @returns Record with instance values keyed by "instance.{fieldName}"
 */
export function instanceValuesToSubstitutionIndex(
  item: InventoryItemInstance,
  fields: InstanceFieldDefinition[]
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const field of fields) {
    const value = getItemInstanceValue(item, field);
    // Convert to number for substitution (boolean -> 0/1)
    const numericValue =
      typeof value === 'boolean' ? (value ? 1 : 0) : typeof value === 'number' ? value : 0;
    result[`instance.${field.name}`] = numericValue;
  }

  return result;
}
