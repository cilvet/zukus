/**
 * Instance Fields System
 *
 * Instance fields are user-editable fields that exist per-instance of an entity,
 * not in the entity definition itself. This allows users to customize individual
 * instances (e.g., mark an item as "active", set a custom charge count, etc.)
 *
 * Instance fields are defined in addons and stored in InventoryItemInstance.instanceValues.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Supported types for instance fields.
 * Only simple, user-editable types are allowed.
 */
export type InstanceFieldType = 'boolean' | 'number' | 'string';

/**
 * Value type that corresponds to an InstanceFieldType.
 */
export type InstanceFieldValue = boolean | number | string;

/**
 * Definition of a field that exists per-instance of an entity.
 *
 * Example: An "activable" addon might define:
 * { name: 'active', type: 'boolean', default: false, label: 'Active' }
 */
export type InstanceFieldDefinition = {
  /** Field name (used as key in instanceValues) */
  name: string;
  /** Field type */
  type: InstanceFieldType;
  /** Default value when not set */
  default: InstanceFieldValue;
  /** Human-readable label for UI */
  label?: string;
  /** Description for UI tooltips */
  description?: string;
};

/**
 * Instance values stored per item/entity instance.
 * Keys are field names, values are the user-set values.
 */
export type InstanceValues = Record<string, InstanceFieldValue>;

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Checks if a value is a valid InstanceFieldValue.
 */
export function isInstanceFieldValue(value: unknown): value is InstanceFieldValue {
  return typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string';
}

/**
 * Checks if a value matches the expected type for a field.
 */
export function isValidValueForField(
  value: unknown,
  field: InstanceFieldDefinition
): boolean {
  if (value === undefined || value === null) {
    return true; // Will use default
  }

  switch (field.type) {
    case 'boolean':
      return typeof value === 'boolean';
    case 'number':
      return typeof value === 'number';
    case 'string':
      return typeof value === 'string';
    default:
      return false;
  }
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Gets the value of an instance field, using the default if not set.
 */
export function getInstanceFieldValue(
  instanceValues: InstanceValues | undefined,
  field: InstanceFieldDefinition
): InstanceFieldValue {
  if (!instanceValues || instanceValues[field.name] === undefined) {
    return field.default;
  }
  return instanceValues[field.name];
}

/**
 * Sets an instance field value, returning a new instanceValues object.
 * Returns undefined if the value matches the default (to save storage).
 */
export function setInstanceFieldValue(
  instanceValues: InstanceValues | undefined,
  field: InstanceFieldDefinition,
  value: InstanceFieldValue
): InstanceValues | undefined {
  const current = instanceValues ?? {};

  // If value equals default, remove it from storage
  if (value === field.default) {
    const { [field.name]: _, ...rest } = current;
    return Object.keys(rest).length === 0 ? undefined : rest;
  }

  return {
    ...current,
    [field.name]: value,
  };
}

/**
 * Creates default instance values for a set of fields.
 * Only includes non-default values, so typically returns undefined.
 */
export function createDefaultInstanceValues(
  fields: InstanceFieldDefinition[]
): InstanceValues | undefined {
  // All fields use their defaults, so no need to store anything
  return undefined;
}

/**
 * Merges instance field definitions from multiple addons.
 * Later definitions override earlier ones with the same name.
 */
export function mergeInstanceFieldDefinitions(
  ...fieldArrays: (InstanceFieldDefinition[] | undefined)[]
): InstanceFieldDefinition[] {
  const fieldMap = new Map<string, InstanceFieldDefinition>();

  for (const fields of fieldArrays) {
    if (!fields) continue;
    for (const field of fields) {
      fieldMap.set(field.name, field);
    }
  }

  return Array.from(fieldMap.values());
}
