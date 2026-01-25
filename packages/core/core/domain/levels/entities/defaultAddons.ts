import type { AddonDefinition, AddonRegistry } from './types';

// =============================================================================
// Searchable Addon
// =============================================================================

/**
 * Addon for entities that can be searched and displayed.
 * Provides: name (required), description (optional)
 */
export const searchableAddon: AddonDefinition = {
  id: 'searchable',
  name: 'Searchable',
  fields: [
    { name: 'name', type: 'string', description: 'Display name of the entity' },
    { name: 'description', type: 'string', optional: true, description: 'Detailed description' },
  ],
};

// =============================================================================
// Taggable Addon
// =============================================================================

/**
 * Addon for entities that can have tags for categorization/filtering.
 * Provides: tags (optional string array)
 */
export const taggableAddon: AddonDefinition = {
  id: 'taggable',
  name: 'Taggable',
  fields: [
    { name: 'tags', type: 'string_array', optional: true, description: 'Tags for categorization' },
  ],
};

// =============================================================================
// Imageable Addon
// =============================================================================

/**
 * Addon for entities that can have an associated image.
 * Provides: image (optional string - URL or path)
 */
export const imageableAddon: AddonDefinition = {
  id: 'imageable',
  name: 'Imageable',
  fields: [
    { name: 'image', type: 'string', optional: true, description: 'Image URL or path' },
  ],
};

// =============================================================================
// Effectful Addon
// =============================================================================

/**
 * Addon for entities that can apply effects to characters.
 *
 * Provides both legacy and new effect systems:
 * - Legacy: legacy_changes, legacy_specialChanges, legacy_contextualChanges
 * - New: effects (simplified target-based system)
 *
 * Most entities should use legacy_changes until the new Effect system is fully adopted.
 */
export const effectfulAddon: AddonDefinition = {
  id: 'effectful',
  name: 'Effectful',
  fields: [
    // Legacy system (currently used by most entities)
    {
      name: 'legacy_changes',
      type: 'object_array',
      optional: true,
      description: 'Mechanical changes this entity applies (Change[])',
      objectFields: [],
    },
    {
      name: 'legacy_specialChanges',
      type: 'object_array',
      optional: true,
      description: 'Special changes like proficiencies (SpecialChange[])',
      objectFields: [],
    },
    {
      name: 'legacy_contextualChanges',
      type: 'object_array',
      optional: true,
      description: 'Contextual/situational changes (ContextualChange[])',
      objectFields: [],
    },
    // New Effect-based system
    {
      name: 'effects',
      type: 'object_array',
      optional: true,
      description: 'Effects using the new target-based system (Effect[])',
      objectFields: [],
    },
  ],
};

// =============================================================================
// Suppressing Addon
// =============================================================================

/**
 * Addon for entities that can suppress other entities.
 * Provides: suppression (optional array of SuppressionConfig)
 * 
 * See: core/domain/entities/types/base.ts for SuppressionConfig type
 */
export const suppressingAddon: AddonDefinition = {
  id: 'suppressing',
  name: 'Suppressing',
  fields: [
    { 
      name: 'suppression', 
      type: 'object_array', 
      optional: true, 
      description: 'Suppression configurations',
      objectFields: [], // SuppressionConfig schema handled separately
    },
  ],
};

// =============================================================================
// Providable Addon
// =============================================================================

/**
 * Addon for entities that can provide other entities.
 * Provides: providers (optional array of EntityProvider)
 * 
 * This allows entities to grant additional entities or offer selections.
 * For example, a Fighter's "Bonus Feat" feature can contain a selector
 * for choosing from fighter-eligible feats.
 * 
 * See: core/domain/levels/providers/types.ts for EntityProvider type
 */
export const providableAddon: AddonDefinition = {
  id: 'providable',
  name: 'Providable',
  fields: [
    { 
      name: 'providers', 
      type: 'object_array', 
      optional: true, 
      description: 'EntityProviders for granting/selecting additional entities',
      objectFields: [], // EntityProvider schema validated separately
    },
  ],
};

// =============================================================================
// Default Registry
// =============================================================================

/**
 * Registry containing all default addons.
 * Pass this to createEntitySchemaWithAddons for standard entity creation.
 */
export const defaultAddonRegistry: AddonRegistry = {
  searchable: searchableAddon,
  taggable: taggableAddon,
  imageable: imageableAddon,
  effectful: effectfulAddon,
  suppressing: suppressingAddon,
  providable: providableAddon,
};

