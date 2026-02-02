import type { StandardEntity, FilterState, FilterValue, EntityFilterConfig } from '@zukus/core'
import { createInitialFilterState } from '@zukus/core'

/**
 * Get a nested value from an object using dot notation path.
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

/**
 * Check if an entity matches a facet filter value.
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

    // Entity field is also an array
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

/**
 * Filter entities by search query (name and description).
 */
export function filterBySearch<T extends StandardEntity>(entities: T[], query: string): T[] {
  if (!query.trim()) return entities

  const q = query.toLowerCase().trim()
  return entities.filter((entity) => {
    const nameMatch = entity.name.toLowerCase().includes(q)
    const descMatch = entity.description?.toLowerCase().includes(q)
    return nameMatch || descMatch
  })
}

/**
 * Check if any filter in the state has an active value.
 */
export function hasActiveFilters(filterState: FilterState): boolean {
  return Object.values(filterState).some((value) => {
    if (value === null || value === undefined || value === '') return false
    if (Array.isArray(value)) return value.length > 0
    return true
  })
}

/**
 * Create initial filter state with optional overrides.
 */
export function createFilterStateWithOverrides(
  filterConfig: EntityFilterConfig,
  initialFilterOverrides?: Partial<FilterState>
): FilterState {
  const state = createInitialFilterState(filterConfig)
  if (initialFilterOverrides) {
    Object.assign(state, initialFilterOverrides)
  }
  return state
}
