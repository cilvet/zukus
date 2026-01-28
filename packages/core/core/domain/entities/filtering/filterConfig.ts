/**
 * Entity Filter Configuration System
 *
 * Provides a declarative way to configure filters for entity types.
 * Builds on top of the existing facet system but adds:
 * - Relation-based filters with dependencies (e.g., class → level)
 * - UI configuration hints (layout, size, placeholders)
 * - Filter grouping for visual organization
 *
 * @example
 * ```typescript
 * const spellFilterConfig: EntityFilterConfig = {
 *   entityType: 'spell',
 *   label: 'Conjuros',
 *   filters: [
 *     {
 *       kind: 'relation',
 *       id: 'classLevel',
 *       label: 'Clase y Nivel',
 *       relationMapPath: 'classData.classLevels',
 *       primary: {
 *         id: 'class',
 *         label: 'Clase',
 *         options: [
 *           { value: 'wizard', label: 'Mago' },
 *           { value: 'cleric', label: 'Clérigo' },
 *         ],
 *       },
 *       secondary: {
 *         id: 'level',
 *         label: 'Nivel',
 *         labelFormat: 'Nivel {value}',
 *       },
 *     },
 *     {
 *       kind: 'facet',
 *       id: 'school',
 *       label: 'Escuela',
 *       facetField: 'school',
 *     },
 *   ],
 * }
 * ```
 */

// ============================================================================
// Filter Options
// ============================================================================

/**
 * Single option for select/multiselect filters
 */
export type FilterOption = {
  /** Value used for filtering */
  value: string | number
  /** Display label */
  label: string
}

// ============================================================================
// UI Configuration
// ============================================================================

/**
 * UI hints for filter rendering
 */
export type FilterUIConfig = {
  /** Size variant for the control */
  size?: 'compact' | 'normal'
  /** Placeholder text for empty state */
  placeholder?: string
  /** Width hint (for inline layouts) */
  width?: 'auto' | 'equal' | number
}

// ============================================================================
// Filter Definitions
// ============================================================================

/**
 * Base properties for all filter definitions
 */
type FilterDefBase = {
  /** Unique identifier for this filter */
  id: string
  /** Display label */
  label: string
  /** UI configuration hints */
  ui?: FilterUIConfig
}

/**
 * Facet Filter
 *
 * Wraps an existing EntityFacet for simple field-based filtering.
 * The facet provides the filter type and options.
 */
export type FacetFilterDef = FilterDefBase & {
  kind: 'facet'
  /** Reference to the facet's fieldName */
  facetField: string
  /**
   * Allow selecting multiple values (OR logic).
   * When true, the filter state will be an array of selected values.
   * @default false
   */
  multiSelect?: boolean
}

/**
 * Relation Filter
 *
 * Handles filtering based on enriched relation data where one selector
 * depends on another. The canonical example is spell class+level filtering
 * where available levels depend on the selected class.
 *
 * The relation data is expected to be a map on the entity:
 * entity.classData.classLevels = { wizard: 3, cleric: 2 }
 */
export type RelationFilterDef = FilterDefBase & {
  kind: 'relation'
  /**
   * Path to the relation map on the entity.
   * Example: 'classData.classLevels' -> entity.classData.classLevels
   */
  relationMapPath: string
  /**
   * Primary selector configuration (e.g., class selection)
   */
  primary: {
    id: string
    label: string
    /** Available options for primary selector */
    options: FilterOption[]
    ui?: FilterUIConfig
  }
  /**
   * Secondary selector configuration (e.g., level selection)
   * Options are derived dynamically based on primary selection.
   */
  secondary: {
    id: string
    label: string
    /**
     * Format string for option labels.
     * Use {value} as placeholder for the actual value.
     * Example: 'Nivel {value}' -> 'Nivel 0', 'Nivel 1', etc.
     */
    labelFormat: string
    ui?: FilterUIConfig
  }
}

/**
 * Filter Group
 *
 * Groups multiple filters together for visual organization.
 * Useful for placing related filters side-by-side.
 */
export type FilterGroupDef = FilterDefBase & {
  kind: 'group'
  /** Layout direction for children */
  layout: 'row' | 'column'
  /** Child filter definitions */
  children: Array<FacetFilterDef | RelationFilterDef>
}

/**
 * Union of all filter definition types
 */
export type FilterDef = FacetFilterDef | RelationFilterDef | FilterGroupDef

// ============================================================================
// Entity Filter Configuration
// ============================================================================

/**
 * Complete filter configuration for an entity type.
 *
 * This is the main configuration object that defines all available
 * filters for a specific entity type.
 */
export type EntityFilterConfig = {
  /** Entity type identifier (e.g., 'spell', 'feat') */
  entityType: string
  /** Display label for the entity type (e.g., 'Conjuros') */
  label: string
  /** List of filter definitions */
  filters: FilterDef[]
  /** Default values for filters */
  defaults?: Record<string, unknown>
}

// ============================================================================
// Filter State
// ============================================================================

/**
 * Runtime state for a single filter value
 */
export type FilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | null

/**
 * Complete filter state for an entity filter configuration.
 * Keys are filter IDs (or primary.id/secondary.id for relation filters).
 */
export type FilterState = Record<string, FilterValue>

// ============================================================================
// Type Guards
// ============================================================================

export function isFacetFilter(filter: FilterDef): filter is FacetFilterDef {
  return filter.kind === 'facet'
}

export function isRelationFilter(filter: FilterDef): filter is RelationFilterDef {
  return filter.kind === 'relation'
}

export function isFilterGroup(filter: FilterDef): filter is FilterGroupDef {
  return filter.kind === 'group'
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a nested value from an object using a dot-separated path.
 *
 * @example
 * getNestedValue({ a: { b: { c: 1 } } }, 'a.b.c') // => 1
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    if (typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

/**
 * Get available options for a relation filter's secondary selector
 * based on the current primary selection and entity data.
 *
 * @param entities - All entities to scan for available values
 * @param filter - The relation filter definition
 * @param primaryValue - Currently selected primary value (e.g., 'wizard')
 * @returns Array of options for the secondary selector
 */
export function getRelationSecondaryOptions(
  entities: unknown[],
  filter: RelationFilterDef,
  primaryValue: string | null
): FilterOption[] {
  if (!primaryValue) {
    return []
  }

  const valuesSet = new Set<number | string>()

  for (const entity of entities) {
    const relationMap = getNestedValue(entity, filter.relationMapPath)
    if (relationMap && typeof relationMap === 'object') {
      const value = (relationMap as Record<string, unknown>)[primaryValue]
      if (value !== undefined && value !== null) {
        valuesSet.add(value as number | string)
      }
    }
  }

  // Sort values (numeric sort for numbers, string sort for strings)
  const values = Array.from(valuesSet).sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b
    }
    return String(a).localeCompare(String(b))
  })

  // Format labels
  return values.map((value) => ({
    value,
    label: filter.secondary.labelFormat.replace('{value}', String(value)),
  }))
}

/**
 * Apply a relation filter to an entity.
 *
 * @param entity - The entity to check
 * @param filter - The relation filter definition
 * @param primaryValue - Selected primary value (e.g., 'wizard')
 * @param secondaryValue - Selected secondary value (e.g., 3)
 * @returns true if entity matches the filter
 */
export function applyRelationFilter(
  entity: unknown,
  filter: RelationFilterDef,
  primaryValue: string | null,
  secondaryValue: string | number | null
): boolean {
  // No primary filter = match all
  if (primaryValue === null) {
    return true
  }

  const relationMap = getNestedValue(entity, filter.relationMapPath)
  if (!relationMap || typeof relationMap !== 'object') {
    return false
  }

  const entityValue = (relationMap as Record<string, unknown>)[primaryValue]

  // Primary selected but entity doesn't have this relation
  if (entityValue === undefined) {
    return false
  }

  // No secondary filter = match if primary matches
  if (secondaryValue === null) {
    return true
  }

  // Both filters = exact match
  return entityValue === secondaryValue
}

/**
 * Build a filter chip label for a relation filter.
 *
 * @param filter - The relation filter definition
 * @param primaryValue - Selected primary value
 * @param secondaryValue - Selected secondary value
 * @returns Label string (e.g., "Mago 3") or null if no filter active
 */
export function getRelationFilterChipLabel(
  filter: RelationFilterDef,
  primaryValue: string | null,
  secondaryValue: string | number | null
): string | null {
  if (!primaryValue) {
    return null
  }

  const primaryOption = filter.primary.options.find((o) => o.value === primaryValue)
  const primaryLabel = primaryOption?.label ?? primaryValue

  if (secondaryValue !== null) {
    return `${primaryLabel} ${secondaryValue}`
  }

  return primaryLabel
}

/**
 * Extract all filter IDs from a filter configuration (flattening groups).
 */
export function getAllFilterIds(config: EntityFilterConfig): string[] {
  const ids: string[] = []

  function extractIds(filter: FilterDef) {
    if (isFilterGroup(filter)) {
      for (const child of filter.children) {
        extractIds(child)
      }
    } else if (isRelationFilter(filter)) {
      ids.push(filter.primary.id)
      ids.push(filter.secondary.id)
    } else {
      ids.push(filter.id)
    }
  }

  for (const filter of config.filters) {
    extractIds(filter)
  }

  return ids
}

/**
 * Create initial filter state from configuration defaults.
 */
export function createInitialFilterState(config: EntityFilterConfig): FilterState {
  const state: FilterState = {}
  const allIds = getAllFilterIds(config)

  for (const id of allIds) {
    const defaultValue = config.defaults?.[id]
    // Validate that the default value is a valid FilterValue type
    if (
      defaultValue === null ||
      defaultValue === undefined ||
      typeof defaultValue === 'string' ||
      typeof defaultValue === 'number' ||
      typeof defaultValue === 'boolean' ||
      Array.isArray(defaultValue)
    ) {
      state[id] = (defaultValue ?? null) as FilterValue
    } else {
      state[id] = null
    }
  }

  return state
}
