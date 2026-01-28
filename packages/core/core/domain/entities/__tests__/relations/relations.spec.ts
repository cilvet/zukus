import { describe, it, expect } from 'bun:test'
import {
  buildRelationIndex,
  getRelationsFrom,
  getRelationsTo,
  generateFilterableKey,
  parseFilterableKey,
  compileRelationField,
  enrichEntityWithRelations,
  compileAndEnrichEntities,
  type RelationEntity,
  type RelationFieldDef
} from '../../relations/compiler'
import type { RelationFieldConfig } from '../../types/base'
import type { Entity } from '../../types/base'

// ============================================================================
// Test Data
// ============================================================================

const createSpellClassRelation = (
  spellId: string,
  classId: string,
  level: number
): RelationEntity => ({
  id: `${spellId}-${classId}`,
  entityType: 'spell-class-relation',
  fromEntityId: spellId,
  toEntityId: classId,
  metadata: { level }
})

const testRelations: RelationEntity[] = [
  // Magic Missile: Wizard 1, Sorcerer 1
  createSpellClassRelation('magic-missile', 'wizard', 1),
  createSpellClassRelation('magic-missile', 'sorcerer', 1),

  // Cure Light Wounds: Cleric 1, Druid 1, Paladin 1, Ranger 2
  createSpellClassRelation('cure-light-wounds', 'cleric', 1),
  createSpellClassRelation('cure-light-wounds', 'druid', 1),
  createSpellClassRelation('cure-light-wounds', 'paladin', 1),
  createSpellClassRelation('cure-light-wounds', 'ranger', 2),

  // Fireball: Wizard 3, Sorcerer 3
  createSpellClassRelation('fireball', 'wizard', 3),
  createSpellClassRelation('fireball', 'sorcerer', 3)
]

const testSpells: Entity[] = [
  { id: 'magic-missile', entityType: 'spell' },
  { id: 'cure-light-wounds', entityType: 'spell' },
  { id: 'fireball', entityType: 'spell' }
]

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
  fieldName: 'classData',
  config: SPELL_CLASS_FIELD_CONFIG
}

// ============================================================================
// Index Building Tests
// ============================================================================

describe('buildRelationIndex', () => {
  it('should build index from relations', () => {
    const index = buildRelationIndex(testRelations)

    expect(index.byFrom.has('spell-class-relation')).toBe(true)
    expect(index.byTo.has('spell-class-relation')).toBe(true)
  })

  it('should index relations by fromEntityId', () => {
    const index = buildRelationIndex(testRelations)

    const magicMissileRelations = getRelationsFrom(index, 'spell-class-relation', 'magic-missile')
    expect(magicMissileRelations).toHaveLength(2)

    const cureRelations = getRelationsFrom(index, 'spell-class-relation', 'cure-light-wounds')
    expect(cureRelations).toHaveLength(4)
  })

  it('should index relations by toEntityId', () => {
    const index = buildRelationIndex(testRelations)

    const wizardRelations = getRelationsTo(index, 'spell-class-relation', 'wizard')
    expect(wizardRelations).toHaveLength(2) // magic-missile, fireball

    const clericRelations = getRelationsTo(index, 'spell-class-relation', 'cleric')
    expect(clericRelations).toHaveLength(1) // cure-light-wounds
  })

  it('should return empty array for non-existent entities', () => {
    const index = buildRelationIndex(testRelations)

    const relations = getRelationsFrom(index, 'spell-class-relation', 'non-existent')
    expect(relations).toHaveLength(0)
  })

  it('should return empty array for non-existent relation types', () => {
    const index = buildRelationIndex(testRelations)

    const relations = getRelationsFrom(index, 'non-existent-type', 'magic-missile')
    expect(relations).toHaveLength(0)
  })
})

// ============================================================================
// Key Generation Tests
// ============================================================================

describe('generateFilterableKey', () => {
  it('should generate key using format', () => {
    const relation = createSpellClassRelation('fireball', 'wizard', 3)
    const key = generateFilterableKey(relation, '{targetId}:{metadata.level}')

    expect(key).toBe('wizard:3')
  })

  it('should lowercase targetId', () => {
    const relation: RelationEntity = {
      id: 'test',
      entityType: 'spell-class-relation',
      fromEntityId: 'fireball',
      toEntityId: 'WIZARD',
      metadata: { level: 3 }
    }

    const key = generateFilterableKey(relation, '{targetId}:{metadata.level}')
    expect(key).toBe('wizard:3')
  })
})

describe('parseFilterableKey', () => {
  it('should parse valid keys', () => {
    const result = parseFilterableKey('wizard:1')
    expect(result).toEqual({ id: 'wizard', value: '1' })
  })

  it('should return null for invalid keys', () => {
    expect(parseFilterableKey('invalid')).toBeNull()
  })

  it('should return null for empty id', () => {
    expect(parseFilterableKey(':1')).toBeNull()
  })
})

// ============================================================================
// Compilation Tests
// ============================================================================

describe('compileRelationField', () => {
  it('should compile relations to filterable structure', () => {
    const index = buildRelationIndex(testRelations)
    const compiled = compileRelationField('magic-missile', SPELL_CLASS_FIELD_CONFIG, index)

    expect(compiled.relations).toHaveLength(2)
    expect(compiled.classLevelKeys).toContain('wizard:1')
    expect(compiled.classLevelKeys).toContain('sorcerer:1')
    expect(compiled.classLevels).toEqual({
      wizard: 1,
      sorcerer: 1
    })
  })

  it('should handle entities with no relations', () => {
    const index = buildRelationIndex(testRelations)
    const compiled = compileRelationField('unknown-spell', SPELL_CLASS_FIELD_CONFIG, index)

    expect(compiled.relations).toHaveLength(0)
    expect(compiled.classLevelKeys).toEqual([])
    expect(compiled.classLevels).toEqual({})
  })
})

// ============================================================================
// Entity Enrichment Tests
// ============================================================================

describe('enrichEntityWithRelations', () => {
  it('should add relation field to entity', () => {
    const index = buildRelationIndex(testRelations)
    const spell = testSpells[0] // magic-missile

    const enriched = enrichEntityWithRelations(spell, [RELATION_FIELD_DEF], index)

    const classData = (enriched as Record<string, unknown>).classData as {
      classLevelKeys: string[]
      classLevels: Record<string, number>
    }

    expect(classData).toBeDefined()
    expect(classData.classLevelKeys).toContain('wizard:1')
    expect(classData.classLevelKeys).toContain('sorcerer:1')
    expect(classData.classLevels).toEqual({
      wizard: 1,
      sorcerer: 1
    })
  })

  it('should preserve original entity properties', () => {
    const index = buildRelationIndex(testRelations)
    const spell = testSpells[0]

    const enriched = enrichEntityWithRelations(spell, [RELATION_FIELD_DEF], index)

    expect(enriched.id).toBe('magic-missile')
    expect(enriched.entityType).toBe('spell')
  })
})

describe('compileAndEnrichEntities', () => {
  it('should enrich all entities in one pass', () => {
    const enriched = compileAndEnrichEntities(testSpells, testRelations, [RELATION_FIELD_DEF])

    expect(enriched).toHaveLength(3)

    // Magic Missile
    const magicMissile = enriched[0] as Record<string, unknown>
    const mmClassData = magicMissile.classData as { classLevelKeys: string[] }
    expect(mmClassData.classLevelKeys).toContain('wizard:1')

    // Cure Light Wounds
    const cure = enriched[1] as Record<string, unknown>
    const cureClassData = cure.classData as { classLevelKeys: string[] }
    expect(cureClassData.classLevelKeys).toContain('cleric:1')
    expect(cureClassData.classLevelKeys).toContain('ranger:2')

    // Fireball
    const fireball = enriched[2] as Record<string, unknown>
    const fbClassData = fireball.classData as { classLevelKeys: string[] }
    expect(fbClassData.classLevelKeys).toContain('wizard:3')
  })
})
