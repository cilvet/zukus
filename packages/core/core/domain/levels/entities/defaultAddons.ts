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
 * Provides: effects (optional), specialEffects (optional)
 * 
 * Note: effects is the new name for changes, specialEffects for specialChanges.
 * This renaming applies only to entity definitions in the levels system.
 */
export const effectfulAddon: AddonDefinition = {
  id: 'effectful',
  name: 'Effectful',
  fields: [
    { 
      name: 'effects', 
      type: 'object_array', 
      optional: true, 
      description: 'Effects applied when entity is active (formerly "changes")',
      objectFields: [], // Change schema is complex, validation handled separately
    },
    { 
      name: 'specialEffects', 
      type: 'object_array', 
      optional: true, 
      description: 'Special effects like proficiencies (formerly "specialChanges")',
      objectFields: [], // SpecialChange schema is complex, validation handled separately
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

