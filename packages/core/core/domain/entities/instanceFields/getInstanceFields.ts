/**
 * Helper to get instance fields for an entity type from the compendium context.
 *
 * Instance fields are user-editable fields that exist per-instance of an entity.
 * They are defined in addons (e.g., equippable, wieldable, activable).
 */

import type { ResolvedCompendiumContext, Compendium } from '../../compendiums/types';
import type { InstanceFieldDefinition } from '../types/instanceFields';
import type { AddonRegistry } from '../../levels/entities/types';
import { defaultAddonRegistry } from '../../levels/entities/defaultAddons';

/**
 * Gets the instance fields for an entity type by looking up its schema
 * and resolving the addons to their instance field definitions.
 *
 * @param entityType - The entity type name (e.g., 'armor', 'weapon')
 * @param compendiumContext - The resolved compendium context
 * @param addonRegistry - Optional custom addon registry (defaults to defaultAddonRegistry)
 * @returns Array of instance field definitions, or empty array if none found
 */
export function getInstanceFieldsForEntityType(
  entityType: string,
  compendiumContext: ResolvedCompendiumContext | undefined,
  addonRegistry: AddonRegistry = defaultAddonRegistry
): InstanceFieldDefinition[] {
  if (!compendiumContext) {
    return [];
  }

  const resolvedType = compendiumContext.entityTypes.get(entityType);
  if (!resolvedType) {
    return [];
  }

  const schema = resolvedType.schema;
  const addonIds = schema.addons ?? [];

  const instanceFields: InstanceFieldDefinition[] = [];

  for (const addonId of addonIds) {
    const addon = addonRegistry[addonId];
    if (addon?.instanceFields) {
      instanceFields.push(...addon.instanceFields);
    }
  }

  return instanceFields;
}

/**
 * Gets instance fields for an entity type directly from a Compendium.
 * This is a convenience function when you have access to the compendium
 * but not the resolved context.
 *
 * @param entityType - The entity type name (e.g., 'armor', 'weapon')
 * @param compendium - The compendium containing the schema definitions
 * @param addonRegistry - Optional custom addon registry (defaults to defaultAddonRegistry)
 * @returns Array of instance field definitions, or empty array if none found
 */
export function getInstanceFieldsFromCompendium(
  entityType: string,
  compendium: Compendium,
  addonRegistry: AddonRegistry = defaultAddonRegistry
): InstanceFieldDefinition[] {
  const schema = compendium.schemas.find((s) => s.typeName === entityType);
  if (!schema) {
    return [];
  }

  const addonIds = schema.addons ?? [];
  const instanceFields: InstanceFieldDefinition[] = [];

  for (const addonId of addonIds) {
    const addon = addonRegistry[addonId];
    if (addon?.instanceFields) {
      instanceFields.push(...addon.instanceFields);
    }
  }

  return instanceFields;
}

/**
 * Checks if an entity type has any instance fields.
 */
export function hasInstanceFields(
  entityType: string,
  compendiumContext: ResolvedCompendiumContext | undefined,
  addonRegistry: AddonRegistry = defaultAddonRegistry
): boolean {
  return getInstanceFieldsForEntityType(entityType, compendiumContext, addonRegistry).length > 0;
}

/**
 * Checks if an entity type has any instance fields using a Compendium directly.
 */
export function hasInstanceFieldsFromCompendium(
  entityType: string,
  compendium: Compendium,
  addonRegistry: AddonRegistry = defaultAddonRegistry
): boolean {
  return getInstanceFieldsFromCompendium(entityType, compendium, addonRegistry).length > 0;
}

/**
 * Checks if an entity type has a specific instance field.
 *
 * @param entityType - The entity type name (e.g., 'armor', 'weapon')
 * @param fieldName - The instance field name to check (e.g., 'equipped', 'wielded')
 * @param compendium - The compendium containing the schema definitions
 * @param addonRegistry - Optional custom addon registry (defaults to defaultAddonRegistry)
 * @returns true if the entity type has the specified instance field
 */
export function hasInstanceField(
  entityType: string,
  fieldName: string,
  compendium: Compendium,
  addonRegistry: AddonRegistry = defaultAddonRegistry
): boolean {
  const fields = getInstanceFieldsFromCompendium(entityType, compendium, addonRegistry);
  return fields.some((f) => f.name === fieldName);
}

/**
 * Gets a specific instance field definition for an entity type.
 *
 * @param entityType - The entity type name (e.g., 'armor', 'weapon')
 * @param fieldName - The instance field name to get (e.g., 'equipped', 'wielded')
 * @param compendium - The compendium containing the schema definitions
 * @param addonRegistry - Optional custom addon registry (defaults to defaultAddonRegistry)
 * @returns The instance field definition, or undefined if not found
 */
export function getInstanceField(
  entityType: string,
  fieldName: string,
  compendium: Compendium,
  addonRegistry: AddonRegistry = defaultAddonRegistry
): InstanceFieldDefinition | undefined {
  const fields = getInstanceFieldsFromCompendium(entityType, compendium, addonRegistry);
  return fields.find((f) => f.name === fieldName);
}
