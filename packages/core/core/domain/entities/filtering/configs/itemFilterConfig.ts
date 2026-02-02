/**
 * Item Filter Configuration
 *
 * Defines the available filters for item entities in the D&D 3.5 system.
 * This supports multi-type browsing (weapons, armor, shields, general items, etc.)
 */

import type { EntityFilterConfig, EntityTypeFilterDef, FacetFilterDef } from '../filterConfig'

// ============================================================================
// Item Types
// ============================================================================

/**
 * Default item entity types for D&D 3.5
 * These are the primary entity types that can appear in inventory.
 */
export const ITEM_ENTITY_TYPES = [
  'weapon',
  'armor',
  'shield',
  'item',
  'wand',
  'rod',
  'staff',
  'ring',
  'wonderousItem',
  'potion',
  'scroll',
] as const

export type ItemEntityType = (typeof ITEM_ENTITY_TYPES)[number]

/**
 * Labels for item entity types (in Spanish)
 */
export const ITEM_TYPE_LABELS: Record<string, string> = {
  weapon: 'Armas',
  armor: 'Armaduras',
  shield: 'Escudos',
  item: 'Objetos',
  wand: 'Varitas',
  rod: 'Varas',
  staff: 'Bastones',
  ring: 'Anillos',
  wonderousItem: 'Objetos maravillosos',
  potion: 'Pociones',
  scroll: 'Pergaminos',
}

// ============================================================================
// Filter Definitions
// ============================================================================

/**
 * Entity type filter for selecting which item types to show.
 * By default, all types are shown. User can filter to specific types.
 */
export const itemTypeFilter: EntityTypeFilterDef = {
  kind: 'entityType',
  id: 'entityType',
  label: 'Tipo',
  entityTypes: [...ITEM_ENTITY_TYPES],
  multiSelect: true,
  typeLabels: ITEM_TYPE_LABELS,
  ui: {
    size: 'compact',
  },
}

/**
 * Item slot filter (where the item is worn/equipped)
 */
export const itemSlotFilter: FacetFilterDef = {
  kind: 'facet',
  id: 'itemSlot',
  label: 'Espacio',
  facetField: 'itemSlot',
  multiSelect: true,
  ui: {
    placeholder: 'Cualquier espacio',
  },
}

/**
 * Tags filter for categorization
 */
export const itemTagsFilter: FacetFilterDef = {
  kind: 'facet',
  id: 'tags',
  label: 'Etiquetas',
  facetField: 'tags',
  multiSelect: true,
  ui: {
    placeholder: 'Cualquier etiqueta',
  },
}

// ============================================================================
// Complete Configuration
// ============================================================================

/**
 * Complete filter configuration for item entities.
 *
 * This configuration defines:
 * - Entity type as the primary selector (weapon, armor, etc.)
 * - Common filters that apply to all item types (slot, tags)
 *
 * Note: This is a "meta" configuration that works across multiple entity types.
 * The entityType field is set to 'item' as a convention for the registry.
 */
export const itemFilterConfig: EntityFilterConfig = {
  entityType: 'item',
  label: 'Items',
  filters: [
    itemTypeFilter,
    itemSlotFilter,
    itemTagsFilter,
  ],
}

/**
 * Create an item filter config with custom defaults.
 *
 * @param defaultTypes - Default entity types to filter by
 */
export function createItemFilterConfig(defaultTypes?: string[]): EntityFilterConfig {
  return {
    ...itemFilterConfig,
    defaults: {
      entityType: defaultTypes ?? null,
    },
  }
}
