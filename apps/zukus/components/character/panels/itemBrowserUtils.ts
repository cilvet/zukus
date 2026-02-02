import type { StandardEntity, FilterState, FilterValue, FacetFilterDef } from '@zukus/core'
import {
  itemFilterConfig,
  isFacetFilter,
  isFilterGroup,
  isEntityTypeFilter,
} from '@zukus/core'

export type EnrichedItem = StandardEntity & {
  image?: string
  weight?: number
  cost?: { amount: number; currency: string }
  itemSlot?: string
  tags?: string[]
}

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

function matchesFacetFilter(
  entity: unknown,
  filter: FacetFilterDef,
  filterValue: FilterValue
): boolean {
  if (filterValue === null || filterValue === undefined) return true

  const fieldValue = getNestedValue(entity, filter.facetField)

  // Multi-select: filterValue is an array, match if ANY selected value matches
  if (Array.isArray(filterValue)) {
    if (filterValue.length === 0) return true

    // Entity field is also an array (e.g., tags)
    if (Array.isArray(fieldValue)) {
      return filterValue.some((fv) => fieldValue.includes(fv))
    }

    // Entity field is a single value
    return (filterValue as string[]).includes(fieldValue as string)
  }

  // Single select
  if (filterValue === '') return true

  if (Array.isArray(fieldValue)) {
    return fieldValue.includes(filterValue)
  }

  return fieldValue === filterValue
}

export function applyItemFilters(entities: EnrichedItem[], filterState: FilterState): EnrichedItem[] {
  let result = entities

  for (const filter of itemFilterConfig.filters) {
    if (isEntityTypeFilter(filter)) {
      const selectedTypes = filterState[filter.id]
      if (selectedTypes && Array.isArray(selectedTypes) && selectedTypes.length > 0) {
        result = result.filter((entity) => (selectedTypes as string[]).includes(entity.entityType))
      }
    } else if (isFacetFilter(filter)) {
      const value = filterState[filter.id]
      result = result.filter((entity) => matchesFacetFilter(entity, filter, value))
    } else if (isFilterGroup(filter)) {
      for (const child of filter.children) {
        if (isFacetFilter(child)) {
          const value = filterState[child.id]
          result = result.filter((entity) => matchesFacetFilter(entity, child, value))
        }
      }
    }
  }

  return result
}

export function formatCost(cost?: { amount: number; currency: string }): string | null {
  if (!cost) return null
  return `${cost.amount} ${cost.currency}`
}

export function getAllItems(
  compendium: { getAllEntities: (type: string) => unknown[] },
  entityTypes: string[]
): EnrichedItem[] {
  const items: EnrichedItem[] = []
  for (const entityType of entityTypes) {
    const entities = compendium.getAllEntities(entityType) as EnrichedItem[]
    for (const entity of entities) {
      items.push(entity)
    }
  }
  return items
}

export function getInitialFilterOverrides(
  defaultEntityTypes?: string[]
): { entityType: string[] } | undefined {
  if (defaultEntityTypes && defaultEntityTypes.length > 0) {
    return { entityType: defaultEntityTypes }
  }
  return undefined
}
