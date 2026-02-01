import { describe, it, expect } from 'bun:test'
import {
  getNestedValue,
  getRelationSecondaryOptions,
  applyRelationFilter,
  getRelationFilterChipLabel,
  getAllFilterIds,
  createInitialFilterState,
  isFacetFilter,
  isRelationFilter,
  isFilterGroup,
  type RelationFilterDef,
  type EntityFilterConfig,
  type FacetFilterDef,
  type FilterGroupDef,
} from '../../filtering/filterConfig'

// ============================================================================
// Test Data
// ============================================================================

const classLevelFilter: RelationFilterDef = {
  kind: 'relation',
  id: 'classLevel',
  label: 'Clase y Nivel',
  relationMapPath: 'classData.classLevels',
  primary: {
    id: 'class',
    label: 'Clase',
    options: [
      { value: 'wizard', label: 'Mago' },
      { value: 'cleric', label: 'Clérigo' },
      { value: 'bard', label: 'Bardo' },
    ],
  },
  secondary: {
    id: 'level',
    label: 'Nivel',
    labelFormat: 'Nivel {value}',
  },
}

const schoolFilter: FacetFilterDef = {
  kind: 'facet',
  id: 'school',
  label: 'Escuela',
  facetField: 'school',
}

const spellFilterConfig: EntityFilterConfig = {
  entityType: 'spell',
  label: 'Conjuros',
  filters: [
    classLevelFilter,
    schoolFilter,
    {
      kind: 'group',
      id: 'components',
      label: 'Componentes',
      layout: 'row',
      children: [
        {
          kind: 'facet',
          id: 'verbal',
          label: 'Verbal',
          facetField: 'hasVerbal',
        },
        {
          kind: 'facet',
          id: 'somatic',
          label: 'Somático',
          facetField: 'hasSomatic',
        },
      ],
    } as FilterGroupDef,
  ],
  defaults: {
    class: 'wizard',
  },
}

// Sample spell entities
const spells = [
  {
    id: 'fireball',
    name: 'Fireball',
    classData: {
      classLevels: { wizard: 3, sorcerer: 3 },
    },
  },
  {
    id: 'cure-light-wounds',
    name: 'Cure Light Wounds',
    classData: {
      classLevels: { cleric: 1, bard: 1 },
    },
  },
  {
    id: 'magic-missile',
    name: 'Magic Missile',
    classData: {
      classLevels: { wizard: 1, sorcerer: 1 },
    },
  },
  {
    id: 'heal',
    name: 'Heal',
    classData: {
      classLevels: { cleric: 6 },
    },
  },
  {
    id: 'wish',
    name: 'Wish',
    classData: {
      classLevels: { wizard: 9, sorcerer: 9 },
    },
  },
]

// ============================================================================
// Tests: getNestedValue
// ============================================================================

describe('getNestedValue', () => {
  it('should get top-level value', () => {
    const obj = { name: 'test' }
    expect(getNestedValue(obj, 'name')).toBe('test')
  })

  it('should get nested value', () => {
    const obj = { a: { b: { c: 42 } } }
    expect(getNestedValue(obj, 'a.b.c')).toBe(42)
  })

  it('should return undefined for missing path', () => {
    const obj = { a: { b: 1 } }
    expect(getNestedValue(obj, 'a.c.d')).toBeUndefined()
  })

  it('should return undefined for null object', () => {
    expect(getNestedValue(null, 'a.b')).toBeUndefined()
  })

  it('should handle arrays in path', () => {
    const obj = { classData: { classLevels: { wizard: 3 } } }
    expect(getNestedValue(obj, 'classData.classLevels')).toEqual({ wizard: 3 })
  })
})

// ============================================================================
// Tests: getRelationSecondaryOptions
// ============================================================================

describe('getRelationSecondaryOptions', () => {
  it('should return empty array when no primary selected', () => {
    const options = getRelationSecondaryOptions(spells, classLevelFilter, null)
    expect(options).toEqual([])
  })

  it('should return available levels for wizard', () => {
    const options = getRelationSecondaryOptions(spells, classLevelFilter, 'wizard')
    expect(options).toEqual([
      { value: 1, label: 'Nivel 1' },
      { value: 3, label: 'Nivel 3' },
      { value: 9, label: 'Nivel 9' },
    ])
  })

  it('should return available levels for cleric', () => {
    const options = getRelationSecondaryOptions(spells, classLevelFilter, 'cleric')
    expect(options).toEqual([
      { value: 1, label: 'Nivel 1' },
      { value: 6, label: 'Nivel 6' },
    ])
  })

  it('should return available levels for bard', () => {
    const options = getRelationSecondaryOptions(spells, classLevelFilter, 'bard')
    expect(options).toEqual([
      { value: 1, label: 'Nivel 1' },
    ])
  })

  it('should return empty array for class with no spells', () => {
    const options = getRelationSecondaryOptions(spells, classLevelFilter, 'paladin')
    expect(options).toEqual([])
  })
})

// ============================================================================
// Tests: applyRelationFilter
// ============================================================================

describe('applyRelationFilter', () => {
  const fireball = spells[0]
  const cureLight = spells[1]

  it('should match all when no primary selected', () => {
    expect(applyRelationFilter(fireball, classLevelFilter, null, null)).toBe(true)
    expect(applyRelationFilter(cureLight, classLevelFilter, null, null)).toBe(true)
  })

  it('should filter by class only', () => {
    expect(applyRelationFilter(fireball, classLevelFilter, 'wizard', null)).toBe(true)
    expect(applyRelationFilter(fireball, classLevelFilter, 'cleric', null)).toBe(false)
    expect(applyRelationFilter(cureLight, classLevelFilter, 'cleric', null)).toBe(true)
  })

  it('should filter by class and level', () => {
    expect(applyRelationFilter(fireball, classLevelFilter, 'wizard', 3)).toBe(true)
    expect(applyRelationFilter(fireball, classLevelFilter, 'wizard', 1)).toBe(false)
  })

  it('should handle entity without relation data', () => {
    const noRelation = { id: 'test', name: 'Test' }
    expect(applyRelationFilter(noRelation, classLevelFilter, 'wizard', null)).toBe(false)
  })
})

// ============================================================================
// Tests: getRelationFilterChipLabel
// ============================================================================

describe('getRelationFilterChipLabel', () => {
  it('should return null when no primary selected', () => {
    const label = getRelationFilterChipLabel(classLevelFilter, null, null)
    expect(label).toBeNull()
  })

  it('should return class label only when no level selected', () => {
    const label = getRelationFilterChipLabel(classLevelFilter, 'wizard', null)
    expect(label).toBe('Mago')
  })

  it('should return class and level when both selected', () => {
    const label = getRelationFilterChipLabel(classLevelFilter, 'wizard', 3)
    expect(label).toBe('Mago 3')
  })

  it('should use value as fallback when option not found', () => {
    const label = getRelationFilterChipLabel(classLevelFilter, 'unknown', 5)
    expect(label).toBe('unknown 5')
  })
})

// ============================================================================
// Tests: getAllFilterIds
// ============================================================================

describe('getAllFilterIds', () => {
  it('should extract all filter IDs including nested', () => {
    const ids = getAllFilterIds(spellFilterConfig)
    expect(ids).toContain('class')
    expect(ids).toContain('level')
    expect(ids).toContain('school')
    expect(ids).toContain('verbal')
    expect(ids).toContain('somatic')
  })

  it('should include relation filter primary and secondary IDs', () => {
    const simpleConfig: EntityFilterConfig = {
      entityType: 'spell',
      label: 'Spells',
      filters: [classLevelFilter],
    }
    const ids = getAllFilterIds(simpleConfig)
    expect(ids).toEqual(['class', 'level'])
  })
})

// ============================================================================
// Tests: createInitialFilterState
// ============================================================================

describe('createInitialFilterState', () => {
  it('should create state with null for all filters', () => {
    const configWithoutDefaults: EntityFilterConfig = {
      entityType: 'spell',
      label: 'Spells',
      filters: [schoolFilter],
    }
    const state = createInitialFilterState(configWithoutDefaults)
    expect(state).toEqual({ school: null })
  })

  it('should apply defaults from configuration', () => {
    const state = createInitialFilterState(spellFilterConfig)
    expect(state.class).toBe('wizard')
    expect(state.level).toBeNull()
    expect(state.school).toBeNull()
  })
})

// ============================================================================
// Tests: Type Guards
// ============================================================================

describe('type guards', () => {
  it('isFacetFilter should identify facet filters', () => {
    expect(isFacetFilter(schoolFilter)).toBe(true)
    expect(isFacetFilter(classLevelFilter)).toBe(false)
  })

  it('isRelationFilter should identify relation filters', () => {
    expect(isRelationFilter(classLevelFilter)).toBe(true)
    expect(isRelationFilter(schoolFilter)).toBe(false)
  })

  it('isFilterGroup should identify filter groups', () => {
    const group = spellFilterConfig.filters[2]
    expect(isFilterGroup(group)).toBe(true)
    expect(isFilterGroup(schoolFilter)).toBe(false)
  })
})
