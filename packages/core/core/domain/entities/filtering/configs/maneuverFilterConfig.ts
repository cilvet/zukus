/**
 * Maneuver Filter Configuration
 *
 * Defines the available filters for maneuver entities (Tome of Battle).
 * This configuration is used by the UI to render filter controls and
 * by the filtering logic to apply filters to maneuver lists.
 */

import type { EntityFilterConfig, RelationFilterDef, FacetFilterDef } from '../filterConfig'

// ============================================================================
// Martial Adept Classes
// ============================================================================

/**
 * Classes that can learn martial maneuvers
 */
export const MARTIAL_ADEPT_CLASS_OPTIONS = [
  { value: 'warblade', label: 'Warblade' },
  { value: 'crusader', label: 'Crusader' },
  { value: 'swordsage', label: 'Swordsage' },
] as const

// ============================================================================
// Filter Definitions
// ============================================================================

/**
 * Class + Level relation filter
 *
 * This is the primary filter for maneuvers. It uses the enriched relation data
 * where each maneuver has classData.classLevels mapping class ID to maneuver level.
 */
export const classLevelFilter: RelationFilterDef = {
  kind: 'relation',
  id: 'classLevel',
  label: 'Clase y Nivel',
  relationMapPath: 'classData.classLevels',
  primary: {
    id: 'class',
    label: 'Clase',
    options: [...MARTIAL_ADEPT_CLASS_OPTIONS],
    ui: {
      size: 'compact',
      placeholder: 'Todas las clases',
    },
  },
  secondary: {
    id: 'level',
    label: 'Nivel',
    labelFormat: 'Nivel {value}',
    ui: {
      size: 'compact',
      placeholder: 'Todos los niveles',
    },
  },
}

/**
 * Discipline filter (multi-select)
 */
export const disciplineFilter: FacetFilterDef = {
  kind: 'facet',
  id: 'discipline',
  label: 'Disciplina',
  facetField: 'discipline',
  multiSelect: true,
  ui: {
    placeholder: 'Todas las disciplinas',
  },
}

/**
 * Maneuver type filter (multi-select)
 */
export const maneuverTypeFilter: FacetFilterDef = {
  kind: 'facet',
  id: 'type',
  label: 'Tipo',
  facetField: 'type',
  multiSelect: true,
  ui: {
    placeholder: 'Todos los tipos',
  },
}

/**
 * Initiation action filter (multi-select)
 */
export const initiationActionFilter: FacetFilterDef = {
  kind: 'facet',
  id: 'initiationAction',
  label: 'Accion de iniciacion',
  facetField: 'initiationAction',
  multiSelect: true,
  ui: {
    placeholder: 'Cualquier accion',
  },
}

// ============================================================================
// Complete Configuration
// ============================================================================

/**
 * Complete filter configuration for maneuver entities.
 *
 * This configuration defines:
 * - Class + Level as the primary relation filter
 * - Discipline, type, and initiation action as facet filters
 */
export const maneuverFilterConfig: EntityFilterConfig = {
  entityType: 'maneuver',
  label: 'Maniobras',
  filters: [
    classLevelFilter,
    disciplineFilter,
    maneuverTypeFilter,
    initiationActionFilter,
  ],
}

/**
 * Create a maneuver filter config with custom defaults.
 *
 * @param defaultClassId - Default class to filter by (e.g., 'warblade')
 * @param defaultLevel - Default level to filter by
 */
export function createManeuverFilterConfig(
  defaultClassId?: string,
  defaultLevel?: number
): EntityFilterConfig {
  return {
    ...maneuverFilterConfig,
    defaults: {
      class: defaultClassId ?? null,
      level: defaultLevel ?? null,
    },
  }
}
