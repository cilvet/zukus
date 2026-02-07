import { describe, it, expect } from 'bun:test'
import { applyFilterConfig, matchesFacetFilter } from '../applyFilterConfig'
import type { EntityFilterConfig, FilterState } from '../filterConfig'
import type { StandardEntity } from '../../types/base'

// ============================================================================
// Test Helpers
// ============================================================================

type TestEntity = StandardEntity & {
  school?: string
  components?: string[]
  classData?: { classLevels: Record<string, number> }
  tags?: string[]
  itemSlot?: string
}

function entity(id: string, overrides: Partial<TestEntity> = {}): TestEntity {
  return {
    id,
    entityType: overrides.entityType ?? 'spell',
    name: overrides.name ?? id,
    ...overrides,
  }
}

// ============================================================================
// Filter Configs for Tests
// ============================================================================

const spellConfig: EntityFilterConfig = {
  entityType: 'spell',
  label: 'Conjuros',
  filters: [
    {
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
        ],
      },
      secondary: {
        id: 'level',
        label: 'Nivel',
        labelFormat: 'Nivel {value}',
      },
    },
    {
      kind: 'facet',
      id: 'school',
      label: 'Escuela',
      facetField: 'school',
      multiSelect: true,
    },
    {
      kind: 'facet',
      id: 'components',
      label: 'Componentes',
      facetField: 'components',
      multiSelect: true,
    },
  ],
}

const itemConfig: EntityFilterConfig = {
  entityType: 'item',
  label: 'Items',
  filters: [
    {
      kind: 'entityType',
      id: 'entityType',
      label: 'Tipo',
      entityTypes: ['weapon', 'armor', 'shield', 'item'],
      multiSelect: true,
      typeLabels: {
        weapon: 'Arma',
        armor: 'Armadura',
        shield: 'Escudo',
        item: 'Objeto',
      },
    },
    {
      kind: 'facet',
      id: 'itemSlot',
      label: 'Slot',
      facetField: 'itemSlot',
    },
    {
      kind: 'facet',
      id: 'tags',
      label: 'Tags',
      facetField: 'tags',
      multiSelect: true,
    },
  ],
}

const groupConfig: EntityFilterConfig = {
  entityType: 'maneuver',
  label: 'Maniobras',
  filters: [
    {
      kind: 'group',
      id: 'combatGroup',
      label: 'Combate',
      layout: 'row',
      children: [
        {
          kind: 'relation',
          id: 'classLevel',
          label: 'Clase y Nivel',
          relationMapPath: 'classData.classLevels',
          primary: {
            id: 'class',
            label: 'Clase',
            options: [{ value: 'warblade', label: 'Warblade' }],
          },
          secondary: {
            id: 'level',
            label: 'Nivel',
            labelFormat: 'Nivel {value}',
          },
        },
        {
          kind: 'facet',
          id: 'school',
          label: 'Disciplina',
          facetField: 'school',
          multiSelect: true,
        },
      ],
    },
  ],
}

// ============================================================================
// Test Data
// ============================================================================

const spells: TestEntity[] = [
  entity('fireball', {
    name: 'Fireball',
    school: 'evocation',
    components: ['V', 'S', 'M'],
    classData: { classLevels: { wizard: 3, sorcerer: 3 } },
  }),
  entity('magic-missile', {
    name: 'Magic Missile',
    school: 'evocation',
    components: ['V', 'S'],
    classData: { classLevels: { wizard: 1, sorcerer: 1 } },
  }),
  entity('shield', {
    name: 'Shield',
    school: 'abjuration',
    components: ['V', 'S'],
    classData: { classLevels: { wizard: 1 } },
  }),
  entity('cure-light', {
    name: 'Cure Light Wounds',
    school: 'conjuration',
    components: ['V', 'S'],
    classData: { classLevels: { cleric: 1 } },
  }),
  entity('flame-strike', {
    name: 'Flame Strike',
    school: 'evocation',
    components: ['V', 'S'],
    classData: { classLevels: { cleric: 5 } },
  }),
]

const items: TestEntity[] = [
  entity('longsword', {
    name: 'Longsword',
    entityType: 'weapon',
    itemSlot: 'mainhand',
    tags: ['martial', 'melee'],
  }),
  entity('shortbow', {
    name: 'Shortbow',
    entityType: 'weapon',
    itemSlot: 'mainhand',
    tags: ['martial', 'ranged'],
  }),
  entity('chainmail', {
    name: 'Chainmail',
    entityType: 'armor',
    itemSlot: 'body',
    tags: ['heavy'],
  }),
  entity('buckler', {
    name: 'Buckler',
    entityType: 'shield',
    itemSlot: 'offhand',
    tags: ['light'],
  }),
  entity('rope', {
    name: 'Rope',
    entityType: 'item',
    tags: ['adventuring'],
  }),
]

// ============================================================================
// Tests: Facet Filter
// ============================================================================

describe('applyFilterConfig', () => {
  describe('facet filter', () => {
    it('filters by single facet value', () => {
      const state: FilterState = { class: null, level: null, school: ['evocation'], components: null }
      const result = applyFilterConfig(spells, spellConfig, state)
      expect(result.map((e) => e.id)).toEqual(['fireball', 'magic-missile', 'flame-strike'])
    })

    it('filters by multi-select facet (OR logic)', () => {
      const state: FilterState = {
        class: null,
        level: null,
        school: ['evocation', 'abjuration'],
        components: null,
      }
      const result = applyFilterConfig(spells, spellConfig, state)
      expect(result.map((e) => e.id)).toEqual(['fireball', 'magic-missile', 'shield', 'flame-strike'])
    })

    it('passes through when facet value is null', () => {
      const state: FilterState = { class: null, level: null, school: null, components: null }
      const result = applyFilterConfig(spells, spellConfig, state)
      expect(result).toHaveLength(spells.length)
    })

    it('passes through when facet array is empty', () => {
      const state: FilterState = { class: null, level: null, school: [], components: null }
      const result = applyFilterConfig(spells, spellConfig, state)
      expect(result).toHaveLength(spells.length)
    })

    it('filters by array field (components contains V and M)', () => {
      const state: FilterState = { class: null, level: null, school: null, components: ['M'] }
      const result = applyFilterConfig(spells, spellConfig, state)
      expect(result.map((e) => e.id)).toEqual(['fireball'])
    })
  })

  // ============================================================================
  // Tests: Relation Filter
  // ============================================================================

  describe('relation filter', () => {
    it('filters by primary only (class wizard)', () => {
      const state: FilterState = { class: 'wizard', level: null, school: null, components: null }
      const result = applyFilterConfig(spells, spellConfig, state)
      expect(result.map((e) => e.id)).toEqual(['fireball', 'magic-missile', 'shield'])
    })

    it('filters by primary + secondary (wizard level 1)', () => {
      const state: FilterState = { class: 'wizard', level: 1, school: null, components: null }
      const result = applyFilterConfig(spells, spellConfig, state)
      expect(result.map((e) => e.id)).toEqual(['magic-missile', 'shield'])
    })

    it('passes through when primary is null', () => {
      const state: FilterState = { class: null, level: 1, school: null, components: null }
      const result = applyFilterConfig(spells, spellConfig, state)
      // level alone does nothing because primary is null
      expect(result).toHaveLength(spells.length)
    })

    it('returns empty when no entities match primary', () => {
      const state: FilterState = { class: 'druid', level: null, school: null, components: null }
      const result = applyFilterConfig(spells, spellConfig, state)
      expect(result).toHaveLength(0)
    })
  })

  // ============================================================================
  // Tests: EntityType Filter
  // ============================================================================

  describe('entityType filter', () => {
    it('filters by single entity type', () => {
      const state: FilterState = { entityType: ['weapon'], itemSlot: null, tags: null }
      const result = applyFilterConfig(items, itemConfig, state)
      expect(result.map((e) => e.id)).toEqual(['longsword', 'shortbow'])
    })

    it('filters by multiple entity types (OR)', () => {
      const state: FilterState = { entityType: ['weapon', 'armor'], itemSlot: null, tags: null }
      const result = applyFilterConfig(items, itemConfig, state)
      expect(result.map((e) => e.id)).toEqual(['longsword', 'shortbow', 'chainmail'])
    })

    it('passes through when entityType is null', () => {
      const state: FilterState = { entityType: null, itemSlot: null, tags: null }
      const result = applyFilterConfig(items, itemConfig, state)
      expect(result).toHaveLength(items.length)
    })

    it('passes through when entityType array is empty', () => {
      const state: FilterState = { entityType: [], itemSlot: null, tags: null }
      const result = applyFilterConfig(items, itemConfig, state)
      expect(result).toHaveLength(items.length)
    })
  })

  // ============================================================================
  // Tests: Group Filter (Recursive)
  // ============================================================================

  describe('group filter (recursive)', () => {
    const maneuvers: TestEntity[] = [
      entity('iron-heart-surge', {
        name: 'Iron Heart Surge',
        entityType: 'maneuver',
        school: 'Iron Heart',
        classData: { classLevels: { warblade: 3 } },
      }),
      entity('stone-bones', {
        name: 'Stone Bones',
        entityType: 'maneuver',
        school: 'Stone Dragon',
        classData: { classLevels: { warblade: 1, crusader: 1 } },
      }),
      entity('burning-brand', {
        name: 'Burning Brand',
        entityType: 'maneuver',
        school: 'Desert Wind',
        classData: { classLevels: { swordsage: 2 } },
      }),
    ]

    it('applies filters within a group', () => {
      const state: FilterState = { class: 'warblade', level: null, school: null }
      const result = applyFilterConfig(maneuvers, groupConfig, state)
      expect(result.map((e) => e.id)).toEqual(['iron-heart-surge', 'stone-bones'])
    })

    it('applies both relation and facet inside a group', () => {
      const state: FilterState = { class: 'warblade', level: null, school: ['Iron Heart'] }
      const result = applyFilterConfig(maneuvers, groupConfig, state)
      expect(result.map((e) => e.id)).toEqual(['iron-heart-surge'])
    })

    it('applies relation with secondary inside a group', () => {
      const state: FilterState = { class: 'warblade', level: 1, school: null }
      const result = applyFilterConfig(maneuvers, groupConfig, state)
      expect(result.map((e) => e.id)).toEqual(['stone-bones'])
    })
  })

  // ============================================================================
  // Tests: Composition (Multiple Filters AND)
  // ============================================================================

  describe('composition (AND logic)', () => {
    it('composes relation + facet filters', () => {
      const state: FilterState = {
        class: 'wizard',
        level: 1,
        school: ['abjuration'],
        components: null,
      }
      const result = applyFilterConfig(spells, spellConfig, state)
      expect(result.map((e) => e.id)).toEqual(['shield'])
    })

    it('composes entityType + facet filters', () => {
      const state: FilterState = {
        entityType: ['weapon'],
        itemSlot: 'mainhand',
        tags: ['ranged'],
      }
      const result = applyFilterConfig(items, itemConfig, state)
      expect(result.map((e) => e.id)).toEqual(['shortbow'])
    })

    it('returns empty when no entity matches all filters', () => {
      const state: FilterState = {
        class: 'wizard',
        level: 3,
        school: ['abjuration'],
        components: null,
      }
      const result = applyFilterConfig(spells, spellConfig, state)
      expect(result).toHaveLength(0)
    })
  })

  // ============================================================================
  // Tests: Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('handles empty entity array', () => {
      const state: FilterState = { class: 'wizard', level: null, school: null, components: null }
      const result = applyFilterConfig([], spellConfig, state)
      expect(result).toHaveLength(0)
    })

    it('handles all-null filter state', () => {
      const state: FilterState = { class: null, level: null, school: null, components: null }
      const result = applyFilterConfig(spells, spellConfig, state)
      expect(result).toHaveLength(spells.length)
    })

    it('handles entity with missing relation data', () => {
      const entitiesWithMissing: TestEntity[] = [
        entity('no-class-data', { name: 'No Class Data' }),
        entity('with-data', {
          name: 'With Data',
          classData: { classLevels: { wizard: 1 } },
        }),
      ]
      const state: FilterState = { class: 'wizard', level: null, school: null, components: null }
      const result = applyFilterConfig(entitiesWithMissing, spellConfig, state)
      expect(result.map((e) => e.id)).toEqual(['with-data'])
    })

    it('handles entity with null field for facet', () => {
      const entitiesWithNull: TestEntity[] = [
        entity('no-school', { name: 'No School', school: undefined }),
        entity('has-school', { name: 'Has School', school: 'evocation' }),
      ]
      const state: FilterState = { class: null, level: null, school: ['evocation'], components: null }
      const result = applyFilterConfig(entitiesWithNull, spellConfig, state)
      expect(result.map((e) => e.id)).toEqual(['has-school'])
    })
  })
})

// ============================================================================
// Tests: matchesFacetFilter (utility)
// ============================================================================

describe('matchesFacetFilter', () => {
  it('returns true for null filter value', () => {
    expect(matchesFacetFilter({ school: 'evocation' }, 'school', null)).toBe(true)
  })

  it('returns true for empty string filter value', () => {
    expect(matchesFacetFilter({ school: 'evocation' }, 'school', '')).toBe(true)
  })

  it('returns true for empty array filter value', () => {
    expect(matchesFacetFilter({ school: 'evocation' }, 'school', [])).toBe(true)
  })

  it('matches single string value', () => {
    expect(matchesFacetFilter({ school: 'evocation' }, 'school', 'evocation')).toBe(true)
    expect(matchesFacetFilter({ school: 'evocation' }, 'school', 'abjuration')).toBe(false)
  })

  it('matches multi-select array against single field', () => {
    expect(
      matchesFacetFilter({ school: 'evocation' }, 'school', ['evocation', 'abjuration'])
    ).toBe(true)
    expect(
      matchesFacetFilter({ school: 'conjuration' }, 'school', ['evocation', 'abjuration'])
    ).toBe(false)
  })

  it('matches multi-select array against array field', () => {
    expect(
      matchesFacetFilter({ tags: ['martial', 'melee'] }, 'tags', ['ranged'])
    ).toBe(false)
    expect(
      matchesFacetFilter({ tags: ['martial', 'melee'] }, 'tags', ['martial'])
    ).toBe(true)
  })

  it('matches single value against array field', () => {
    expect(matchesFacetFilter({ tags: ['martial', 'melee'] }, 'tags', 'martial')).toBe(true)
    expect(matchesFacetFilter({ tags: ['martial', 'melee'] }, 'tags', 'ranged')).toBe(false)
  })

  it('handles nested field path', () => {
    expect(
      matchesFacetFilter({ data: { type: 'fire' } }, 'data.type', 'fire')
    ).toBe(true)
  })
})
