import { describe, it, expect, beforeAll } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'
import {
  buildRelationIndex,
  compileRelationField,
  enrichEntitiesWithRelations,
  type RelationEntity,
  type RelationFieldDef
} from '../../relations/compiler'
import {
  createRelationCondition,
  extractUniqueTargets,
  extractMetadataValuesForTarget,
  countByRelationKey
} from '../../relations/filterHelpers'
import { filterEntitiesWithVariables } from '../../../levels/filtering/filterWithVariables'
import type { RelationFieldConfig } from '../../types/base'
import type { Entity } from '../../types/base'

// ============================================================================
// Test Data Loading
// ============================================================================

type SpellEntity = Entity & {
  name: string
  school: string
  description: string
}

let spells: SpellEntity[] = []
let relations: RelationEntity[] = []
let enrichedSpells: SpellEntity[] = []

const SPELL_CLASS_FIELD_CONFIG: RelationFieldConfig = {
  relationType: 'spell-class-relation',
  targetEntityType: 'class',
  metadataFields: [{ name: 'level', type: 'integer', required: true }],
  compile: {
    keyFormat: '{targetId}:{metadata.level}',
    keysFieldName: 'classLevelKeys',
    mapFieldName: 'classLevels',
    mapValueField: 'level'
  }
}

const RELATION_FIELD_DEF: RelationFieldDef = {
  fieldName: 'classLevels',
  config: SPELL_CLASS_FIELD_CONFIG
}

beforeAll(() => {
  const testDataDir = path.join(__dirname, '..', '..', 'relations', '__testdata__')

  const spellsPath = path.join(testDataDir, 'spells.json')
  const relationsPath = path.join(testDataDir, 'spell-class-relations.json')

  if (!fs.existsSync(spellsPath) || !fs.existsSync(relationsPath)) {
    console.warn('Test data not found. Run transformSpellsToRelations.ts first.')
    return
  }

  spells = JSON.parse(fs.readFileSync(spellsPath, 'utf-8'))
  relations = JSON.parse(fs.readFileSync(relationsPath, 'utf-8'))

  // Build index and enrich spells
  const index = buildRelationIndex(relations)
  enrichedSpells = enrichEntitiesWithRelations(spells, [RELATION_FIELD_DEF], index)
})

// ============================================================================
// Performance Tests
// ============================================================================

describe('Relation System Performance', () => {
  describe('Index Building', () => {
    it('should build index efficiently for ~6000 relations', () => {
      const start = performance.now()

      const index = buildRelationIndex(relations)

      const elapsed = performance.now() - start

      console.log(`Index building: ${elapsed.toFixed(2)}ms for ${relations.length} relations`)

      // Debería ser menos de 50ms
      expect(elapsed).toBeLessThan(50)

      // Verificar que el índice es correcto
      expect(index.byFrom.has('spell-class-relation')).toBe(true)
    })
  })

  describe('Entity Enrichment', () => {
    it('should enrich ~2800 spells efficiently', () => {
      const index = buildRelationIndex(relations)

      const start = performance.now()

      const enriched = enrichEntitiesWithRelations(spells, [RELATION_FIELD_DEF], index)

      const elapsed = performance.now() - start

      console.log(`Enrichment: ${elapsed.toFixed(2)}ms for ${spells.length} spells`)

      // Debería ser menos de 100ms
      expect(elapsed).toBeLessThan(100)

      // Verificar que están enriquecidos
      expect(enriched.length).toBe(spells.length)

      const firstWithRelations = enriched.find(
        (s) => (s as unknown as { classLevels?: unknown }).classLevels
      )
      expect(firstWithRelations).toBeDefined()
    })
  })

  describe('Filtering Performance', () => {
    it('should filter by class+level efficiently', () => {
      if (enrichedSpells.length === 0) {
        console.warn('Skipping: no enriched spells')
        return
      }

      // Filtrar por "wizard:1"
      const condition = createRelationCondition('classLevels.classLevelKeys', 'wizard', 1)

      const start = performance.now()

      const results = filterEntitiesWithVariables(
        enrichedSpells,
        [
          {
            type: 'AND',
            filterPolicy: 'strict',
            conditions: [condition]
          }
        ],
        {}
      )

      const elapsed = performance.now() - start

      const matchCount = results.filter((r) => r.matches).length
      console.log(`Filter (wizard:1): ${elapsed.toFixed(2)}ms, found ${matchCount} spells`)

      // Debería ser menos de 50ms
      expect(elapsed).toBeLessThan(50)

      // Debería encontrar al menos algunos spells
      expect(matchCount).toBeGreaterThan(0)
    })

    it('should filter by class only (any level) efficiently', () => {
      if (enrichedSpells.length === 0) {
        console.warn('Skipping: no enriched spells')
        return
      }

      // Filtrar por cualquier conjuro de cleric
      // Necesitamos buscar en classLevels.classLevels (el mapa)
      const start = performance.now()

      // Filtrado manual porque no hay operador "has key"
      const clericSpells = enrichedSpells.filter((spell) => {
        const classLevels = (spell as unknown as { classLevels?: { classLevels?: Record<string, number> } })
          .classLevels?.classLevels
        return classLevels && 'cleric' in classLevels
      })

      const elapsed = performance.now() - start

      console.log(`Filter (cleric any): ${elapsed.toFixed(2)}ms, found ${clericSpells.length} spells`)

      expect(elapsed).toBeLessThan(50)
      expect(clericSpells.length).toBeGreaterThan(0)
    })

    it('should filter by multiple conditions efficiently', () => {
      if (enrichedSpells.length === 0) {
        console.warn('Skipping: no enriched spells')
        return
      }

      // Filtrar por wizard:1 Y school = evocation
      const classCondition = createRelationCondition('classLevels.classLevelKeys', 'wizard', 1)

      const start = performance.now()

      const results = filterEntitiesWithVariables(
        enrichedSpells,
        [
          {
            type: 'AND',
            filterPolicy: 'strict',
            conditions: [classCondition, { field: 'school', operator: '==', value: 'evocación' }]
          }
        ],
        {}
      )

      const elapsed = performance.now() - start

      const matchCount = results.filter((r) => r.matches).length
      console.log(`Filter (wizard:1 + evocation): ${elapsed.toFixed(2)}ms, found ${matchCount} spells`)

      expect(elapsed).toBeLessThan(50)
    })
  })

  describe('UI Helpers Performance', () => {
    it('should extract unique targets efficiently', () => {
      if (enrichedSpells.length === 0) {
        console.warn('Skipping: no enriched spells')
        return
      }

      const start = performance.now()

      const classes = extractUniqueTargets(enrichedSpells, 'classLevels')

      const elapsed = performance.now() - start

      console.log(`Extract classes: ${elapsed.toFixed(2)}ms, found ${classes.length} classes`)

      expect(elapsed).toBeLessThan(100)
      expect(classes.length).toBeGreaterThan(0)
    })

    it('should extract metadata values for target efficiently', () => {
      if (enrichedSpells.length === 0) {
        console.warn('Skipping: no enriched spells')
        return
      }

      const start = performance.now()

      const levels = extractMetadataValuesForTarget(enrichedSpells, 'classLevels', 'wizard', 'level')

      const elapsed = performance.now() - start

      console.log(`Extract wizard levels: ${elapsed.toFixed(2)}ms, found ${levels.length} levels`)

      expect(elapsed).toBeLessThan(100)
      expect(levels).toContain(1)
      expect(levels).toContain(9)
    })

    it('should count by relation key efficiently', () => {
      if (enrichedSpells.length === 0) {
        console.warn('Skipping: no enriched spells')
        return
      }

      const start = performance.now()

      const counts = countByRelationKey(enrichedSpells, 'classLevels.classLevelKeys')

      const elapsed = performance.now() - start

      const wizardLevel1Count = counts.get('wizard:1') || 0
      console.log(`Count by key: ${elapsed.toFixed(2)}ms, wizard:1 has ${wizardLevel1Count} spells`)

      expect(elapsed).toBeLessThan(100)
      expect(wizardLevel1Count).toBeGreaterThan(0)
    })
  })
})

// ============================================================================
// Functional Tests
// ============================================================================

describe('Relation System Functional Tests', () => {
  it('should correctly compile spell-class relations', () => {
    if (enrichedSpells.length === 0) {
      console.warn('Skipping: no enriched spells')
      return
    }

    // Buscar un spell conocido
    const fireball = enrichedSpells.find((s) => s.name.toLowerCase().includes('bola de fuego'))

    if (fireball) {
      const classLevels = (fireball as unknown as { classLevels?: { classLevelKeys?: string[] } })
        .classLevels

      expect(classLevels).toBeDefined()
      expect(classLevels?.classLevelKeys).toBeDefined()
      expect(Array.isArray(classLevels?.classLevelKeys)).toBe(true)

      console.log(`Fireball classLevelKeys: ${classLevels?.classLevelKeys?.join(', ')}`)
    }
  })

  it('should be filterable with existing filter system', () => {
    if (enrichedSpells.length === 0) {
      console.warn('Skipping: no enriched spells')
      return
    }

    // Usar el sistema de filtrado existente
    const condition = createRelationCondition('classLevels.classLevelKeys', 'wizard', 3)

    const results = filterEntitiesWithVariables(
      enrichedSpells,
      [
        {
          type: 'AND',
          filterPolicy: 'permissive',
          conditions: [condition]
        }
      ],
      {}
    )

    const matching = results.filter((r) => r.matches)

    console.log(`Wizard level 3 spells: ${matching.length}`)
    expect(matching.length).toBeGreaterThan(0)

    // Verificar que los resultados son correctos
    for (const result of matching.slice(0, 3)) {
      const spell = result.entity as unknown as { classLevels?: { classLevelKeys?: string[] } }
      expect(spell.classLevels?.classLevelKeys).toContain('wizard:3')
    }
  })
})
