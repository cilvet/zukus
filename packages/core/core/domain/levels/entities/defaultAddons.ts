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
// D&D 3.5 Item Addon
// =============================================================================

/**
 * Addon for D&D 3.5 items with standard item properties.
 * Provides: weight, cost, itemSlot, aura, casterLevel
 *
 * This addon is specific to D&D 3.5 and provides the common fields
 * needed for items in that system.
 */
export const dnd35itemAddon: AddonDefinition = {
  id: 'dnd35item',
  name: 'D&D 3.5 Item',
  fields: [
    { name: 'weight', type: 'number', description: 'Weight of the item in pounds' },
    {
      name: 'cost',
      type: 'object',
      optional: true,
      description: 'Cost of the item',
      objectFields: [
        { name: 'amount', type: 'number', description: 'Numeric cost value' },
        { name: 'currency', type: 'string', description: 'Currency type (gp, sp, cp)' },
      ],
    },
    { name: 'itemSlot', type: 'string', optional: true, description: 'Body slot this item occupies' },
    { name: 'aura', type: 'string', optional: true, description: 'Magic aura school and strength' },
    { name: 'casterLevel', type: 'integer', optional: true, description: 'Caster level for magic items' },
  ],
};

// =============================================================================
// Container Addon
// =============================================================================

/**
 * Addon for items that can contain other items.
 * Provides: capacity, ignoresContentWeight
 *
 * This addon is generic and can be used with any item system.
 * Examples: backpacks, bags of holding, quivers.
 */
export const containerAddon: AddonDefinition = {
  id: 'container',
  name: 'Container',
  fields: [
    { name: 'capacity', type: 'number', description: 'Maximum weight capacity in pounds' },
    {
      name: 'ignoresContentWeight',
      type: 'boolean',
      description: 'If true, contents do not count toward carried weight (e.g., bag of holding)',
    },
  ],
};

// =============================================================================
// Activable Addon
// =============================================================================

/**
 * Addon for entities that can be activated/deactivated by the user.
 *
 * Provides an 'active' instance field (boolean, default false).
 * When active is true, the entity's effects apply to the character.
 * When active is false, the entity's effects are suppressed.
 *
 * Use cases:
 * - Toggle items (Ring of Invisibility, Boots of Speed)
 * - Class features that can be turned on/off
 * - Conditional abilities
 */
export const activableAddon: AddonDefinition = {
  id: 'activable',
  name: 'Activable',
  fields: [],
  instanceFields: [
    {
      name: 'active',
      type: 'boolean',
      default: false,
      label: 'Active',
      description: 'Whether this entity is currently active',
    },
  ],
};

// =============================================================================
// Equippable Addon
// =============================================================================

/**
 * Addon for items that can be equipped by a character.
 *
 * Provides an 'equipped' instance field (boolean, default false).
 * When equipped, the item's effects apply to the character.
 *
 * Use cases:
 * - Armor, shields, rings, amulets, etc.
 * - Any item that needs to be "worn" to grant its benefits
 */
export const equippableAddon: AddonDefinition = {
  id: 'equippable',
  name: 'Equippable',
  fields: [],
  instanceFields: [
    {
      name: 'equipped',
      type: 'boolean',
      default: false,
      label: 'Equipped',
      description: 'Whether this item is currently equipped',
    },
  ],
};

// =============================================================================
// Wieldable Addon
// =============================================================================

/**
 * Addon for weapons that can be wielded by a character.
 *
 * Provides a 'wielded' instance field (boolean, default false).
 * A wielded weapon generates attacks and applies wielded-only effects.
 *
 * Note: A weapon can be equipped (on belt) but not wielded (in hand).
 * Wielded implies equipped for effect purposes.
 *
 * Use cases:
 * - All weapons that can be used for attacks
 */
export const wieldableAddon: AddonDefinition = {
  id: 'wieldable',
  name: 'Wieldable',
  fields: [],
  instanceFields: [
    {
      name: 'wielded',
      type: 'boolean',
      default: false,
      label: 'Wielded',
      description: 'Whether this weapon is currently wielded (in hand)',
    },
  ],
};

// =============================================================================
// Stackable Addon
// =============================================================================

/**
 * Addon for items that can be stacked (have quantity > 1).
 *
 * Provides a 'quantity' instance field (number, default 1).
 * Items with this addon can have multiple units in a single inventory slot.
 *
 * Use cases:
 * - Ammunition (arrows, bolts, bullets)
 * - Consumables (potions, scrolls, food)
 * - Materials and components
 */
export const stackableAddon: AddonDefinition = {
  id: 'stackable',
  name: 'Stackable',
  fields: [],
  instanceFields: [
    {
      name: 'quantity',
      type: 'number',
      default: 1,
      label: 'Quantity',
      description: 'Number of units in this stack',
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
  dnd35item: dnd35itemAddon,
  container: containerAddon,
  activable: activableAddon,
  equippable: equippableAddon,
  wieldable: wieldableAddon,
  stackable: stackableAddon,
};

