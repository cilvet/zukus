/**
 * Spell Filter Configuration
 *
 * Defines the available filters for spell entities in the D&D 3.5 system.
 * This configuration is used by the UI to render filter controls and
 * by the filtering logic to apply filters to spell lists.
 */

import type { EntityFilterConfig, RelationFilterDef, FacetFilterDef } from '../filterConfig'

// ============================================================================
// Spellcasting Classes
// ============================================================================

/**
 * Default spellcasting classes for D&D 3.5
 * These are the primary classes that can cast spells.
 */
export const SPELLCASTING_CLASS_OPTIONS = [
  { value: 'wizard', label: 'Mago' },
  { value: 'sorcerer', label: 'Hechicero' },
  { value: 'cleric', label: 'Clérigo' },
  { value: 'druid', label: 'Druida' },
  { value: 'bard', label: 'Bardo' },
  { value: 'paladin', label: 'Paladín' },
  { value: 'ranger', label: 'Explorador' },
] as const

// ============================================================================
// Filter Definitions
// ============================================================================

/**
 * Class + Level relation filter
 *
 * This is the primary filter for spells. It uses the enriched relation data
 * where each spell has classData.classLevels mapping class ID to spell level.
 */
export const classLevelFilter: RelationFilterDef = {
  kind: 'relation',
  id: 'classLevel',
  label: 'Clase y Nivel',
  relationMapPath: 'classData.classLevels',
  primary: {
    id: 'class',
    label: 'Clase',
    options: [...SPELLCASTING_CLASS_OPTIONS],
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
 * School of magic filter (multi-select)
 */
export const schoolFilter: FacetFilterDef = {
  kind: 'facet',
  id: 'school',
  label: 'Escuela',
  facetField: 'school',
  multiSelect: true,
  ui: {
    placeholder: 'Todas las escuelas',
  },
}

/**
 * Spell components filter (multi-select)
 */
export const componentsFilter: FacetFilterDef = {
  kind: 'facet',
  id: 'components',
  label: 'Componentes',
  facetField: 'components',
  multiSelect: true,
  ui: {
    placeholder: 'Cualquier componente',
  },
}

/**
 * Casting time filter (multi-select)
 */
export const castingTimeFilter: FacetFilterDef = {
  kind: 'facet',
  id: 'castingTime',
  label: 'Tiempo de lanzamiento',
  facetField: 'castingTime',
  multiSelect: true,
  ui: {
    placeholder: 'Cualquier tiempo',
  },
}

/**
 * Spell range filter (multi-select)
 */
export const rangeFilter: FacetFilterDef = {
  kind: 'facet',
  id: 'range',
  label: 'Alcance',
  facetField: 'range',
  multiSelect: true,
  ui: {
    placeholder: 'Cualquier alcance',
  },
}

/**
 * Spell resistance filter (single select - only 3 values)
 */
export const spellResistanceFilter: FacetFilterDef = {
  kind: 'facet',
  id: 'spellResistance',
  label: 'Resistencia a conjuros',
  facetField: 'spellResistance',
  multiSelect: false,
  ui: {
    placeholder: 'Cualquiera',
  },
}

// ============================================================================
// Complete Configuration
// ============================================================================

/**
 * Complete filter configuration for spell entities.
 *
 * This configuration defines:
 * - Class + Level as the primary relation filter
 * - School, components, and other facet-based filters
 * - Default values (class defaults to the CGE's class)
 */
export const spellFilterConfig: EntityFilterConfig = {
  entityType: 'spell',
  label: 'Conjuros',
  filters: [
    classLevelFilter,
    schoolFilter,
    componentsFilter,
    castingTimeFilter,
    rangeFilter,
    spellResistanceFilter,
  ],
  // Note: defaults are typically set at runtime based on context
  // (e.g., the character's spellcasting class)
}

/**
 * Create a spell filter config with custom defaults.
 *
 * @param defaultClassId - Default class to filter by (e.g., 'wizard')
 * @param defaultLevel - Default level to filter by
 */
export function createSpellFilterConfig(
  defaultClassId?: string,
  defaultLevel?: number
): EntityFilterConfig {
  return {
    ...spellFilterConfig,
    defaults: {
      class: defaultClassId ?? null,
      level: defaultLevel ?? null,
    },
  }
}
