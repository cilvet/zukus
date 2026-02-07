/**
 * Generic Entity Filtering via FilterConfig
 *
 * Consolidates duplicated filtering logic from itemBrowserUtils, cgeUtils,
 * and entityBrowser/utils into a single function that handles all filter kinds.
 *
 * @module applyFilterConfig
 */

import type { StandardEntity } from '../types/base'
import type {
  EntityFilterConfig,
  FilterState,
  FilterValue,
  FilterDef,
  FacetFilterDef,
} from './filterConfig'
import {
  isFacetFilter,
  isRelationFilter,
  isFilterGroup,
  isEntityTypeFilter,
  getNestedValue,
  applyRelationFilter,
} from './filterConfig'

// ============================================================================
// Public API
// ============================================================================

/**
 * Apply all filters from an EntityFilterConfig to a list of entities.
 *
 * Processes each filter definition in order, applying AND logic between them.
 * Supports all filter kinds: facet, relation, entityType, and group (recursive).
 *
 * @param entities - The entities to filter
 * @param config - The filter configuration defining available filters
 * @param filterState - Current runtime filter values
 * @returns Filtered array of entities
 */
export function applyFilterConfig<T extends StandardEntity>(
  entities: T[],
  config: EntityFilterConfig,
  filterState: FilterState
): T[] {
  let result = entities

  for (const filter of config.filters) {
    result = applyFilter(result, filter, filterState)
  }

  return result
}

/**
 * Check if an entity matches a facet filter value.
 *
 * Handles:
 * - Null/empty filter values (passthrough)
 * - Multi-select arrays (OR logic between selected values)
 * - Array entity fields (match if any element matches)
 * - Single value comparison
 */
export function matchesFacetFilter(
  entity: unknown,
  facetField: string,
  filterValue: FilterValue
): boolean {
  if (filterValue === null || filterValue === undefined) return true

  const fieldValue = getNestedValue(entity, facetField)

  // Multi-select: filterValue is an array, match if ANY selected value matches
  if (Array.isArray(filterValue)) {
    if (filterValue.length === 0) return true

    // Entity field is also an array (e.g., tags, components)
    if (Array.isArray(fieldValue)) {
      return filterValue.some((fv) => fieldValue.includes(fv))
    }

    // Entity field is a single value
    return (filterValue as string[]).includes(fieldValue as string)
  }

  // Single select
  if (filterValue === '') return true

  if (Array.isArray(fieldValue)) {
    return fieldValue.includes(filterValue as string)
  }

  return fieldValue === filterValue
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Apply a single filter definition to the entity list.
 * Dispatches to the appropriate handler based on filter kind.
 */
function applyFilter<T extends StandardEntity>(
  entities: T[],
  filter: FilterDef,
  filterState: FilterState
): T[] {
  if (isEntityTypeFilter(filter)) {
    const selectedTypes = filterState[filter.id]
    if (selectedTypes && Array.isArray(selectedTypes) && selectedTypes.length > 0) {
      return entities.filter((entity) =>
        (selectedTypes as string[]).includes(entity.entityType)
      )
    }
    return entities
  }

  if (isRelationFilter(filter)) {
    const primaryValue = filterState[filter.primary.id] as string | null
    const secondaryValue = filterState[filter.secondary.id] as string | number | null

    if (primaryValue !== null) {
      return entities.filter((entity) =>
        applyRelationFilter(entity, filter, primaryValue, secondaryValue)
      )
    }
    return entities
  }

  if (isFacetFilter(filter)) {
    const value = filterState[filter.id]
    return entities.filter((entity) =>
      matchesFacetFilter(entity, filter.facetField, value)
    )
  }

  if (isFilterGroup(filter)) {
    let result = entities
    for (const child of filter.children) {
      result = applyFilter(result, child, filterState)
    }
    return result
  }

  return entities
}
