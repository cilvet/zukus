import { describe, it, expect } from 'bun:test';
import { compileCharacterEntities, getOriginTypeFromEntityType } from '../compileCharacterEntities';
import type { CharacterBaseData } from '../../../baseData/character';
import type { StandardEntity } from '../../../../entities/types/base';
import type { ResolvedCompendiumContext, ResolvedEntityType } from '../../../../compendiums/types';
import { ChangeTypes } from '../../../baseData/changes';
import { z } from 'zod';

// =============================================================================
// Test Helpers
// =============================================================================

function createMockCharacterBaseData(
  customEntities?: Record<string, StandardEntity[]>
): CharacterBaseData {
  return {
    name: 'Test Character',
    temporaryHp: 0,
    currentDamage: 0,
    currentTemporalHp: 0,
    baseAbilityData: {
      strength: { base: 10 },
      dexterity: { base: 10 },
      constitution: { base: 10 },
      intelligence: { base: 10 },
      wisdom: { base: 10 },
      charisma: { base: 10 },
    },
    skills: {},
    skillData: {},
    classes: [],
    level: { level: 1, xp: 0, levelsData: [] },
    equipment: { items: [], weapons: [] },
    feats: [],
    buffs: [],
    sharedBuffs: [],
    updatedAt: new Date().toISOString(),
    customEntities,
  };
}

function createMockCompendiumContext(
  availableTypeNames: string[] = ['feat', 'spell', 'item']
): ResolvedCompendiumContext {
  const entityTypes = new Map<string, ResolvedEntityType>();
  
  for (const typeName of availableTypeNames) {
    entityTypes.set(typeName, {
      schema: {
        typeName,
        version: '1.0.0',
        fields: [],
      },
      validator: z.object({
        id: z.string(),
        entityType: z.string(),
        name: z.string(),
      }),
      sourceCompendiumId: 'core',
    });
  }

  return {
    entityTypes,
    availableTypeNames,
    activeCompendiums: [{ id: 'core', name: 'Core' }],
    warnings: [],
  };
}

function createMockEntity(
  id: string,
  entityType: string,
  overrides: Partial<StandardEntity> = {}
): StandardEntity {
  return {
    id,
    entityType,
    name: `Entity ${id}`,
    ...overrides,
  };
}

// =============================================================================
// Tests: getOriginTypeFromEntityType
// =============================================================================

describe('getOriginTypeFromEntityType', () => {
  it('should return "feat" for entityType "feat"', () => {
    expect(getOriginTypeFromEntityType('feat')).toBe('feat');
  });

  it('should return "item" for entityType "item"', () => {
    expect(getOriginTypeFromEntityType('item')).toBe('item');
  });

  it('should return "buff" for entityType "buff"', () => {
    expect(getOriginTypeFromEntityType('buff')).toBe('buff');
  });

  it('should return "spell" for entityType "spell"', () => {
    expect(getOriginTypeFromEntityType('spell')).toBe('spell');
  });

  it('should return "entity" for unknown entityType', () => {
    expect(getOriginTypeFromEntityType('custom-type')).toBe('entity');
  });

  it('should return "entity" for arbitrary entityType', () => {
    expect(getOriginTypeFromEntityType('my-homebrew-type')).toBe('entity');
  });
});

// =============================================================================
// Tests: compileCharacterEntities - Basic
// =============================================================================

describe('compileCharacterEntities', () => {
  describe('basic compilation', () => {
    it('should return empty result when no customEntities', () => {
      const baseData = createMockCharacterBaseData();
      
      const result = compileCharacterEntities(baseData);
      
      expect(result.computedEntities).toHaveLength(0);
      expect(result.changes).toHaveLength(0);
      expect(result.contextualChanges).toHaveLength(0);
      expect(result.specialChanges).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should return empty result when customEntities is undefined', () => {
      const baseData = createMockCharacterBaseData(undefined);
      
      const result = compileCharacterEntities(baseData);
      
      expect(result.computedEntities).toHaveLength(0);
    });

    it('should compile entities without changes', () => {
      const entity = createMockEntity('test-feat', 'feat');
      const baseData = createMockCharacterBaseData({
        feat: [entity],
      });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.computedEntities).toHaveLength(1);
      expect(result.computedEntities[0].id).toBe('test-feat');
      expect(result.computedEntities[0]._meta.source.originType).toBe('feat');
      expect(result.computedEntities[0]._meta.source.originId).toBe('test-feat');
      expect(result.computedEntities[0]._meta.source.name).toBe('Entity test-feat');
      expect(result.changes).toHaveLength(0);
    });
  });

  describe('entities with legacy_changes', () => {
    it('should compile entities with legacy_changes', () => {
      const entity = createMockEntity('power-attack', 'feat', {
        legacy_changes: [
          {
            type: ChangeTypes.BAB,
            formula: { expression: '2' },
            bonusTypeId: 'UNTYPED',
          },
        ],
      });
      const baseData = createMockCharacterBaseData({ feat: [entity] });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.computedEntities).toHaveLength(1);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe(ChangeTypes.BAB);
      expect(result.changes[0].originType).toBe('feat');
      expect(result.changes[0].originId).toBe('power-attack');
      expect(result.changes[0].name).toBe('Entity power-attack');
    });

    it('should compile entities with multiple legacy_changes', () => {
      const entity = createMockEntity('multi-feat', 'feat', {
        legacy_changes: [
          { type: ChangeTypes.BAB, formula: { expression: '1' }, bonusTypeId: 'UNTYPED' },
          { type: ChangeTypes.INITIATIVE, formula: { expression: '2' }, bonusTypeId: 'UNTYPED' },
        ],
      });
      const baseData = createMockCharacterBaseData({ feat: [entity] });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.changes).toHaveLength(2);
    });
  });

  describe('entities with changes (backwards compatibility)', () => {
    it('should compile entities with old changes field', () => {
      const entity = createMockEntity('old-feat', 'feat', {
        changes: [
          {
            type: ChangeTypes.INITIATIVE,
            formula: { expression: '4' },
            bonusTypeId: 'UNTYPED',
          },
        ],
      });
      const baseData = createMockCharacterBaseData({ feat: [entity] });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe(ChangeTypes.INITIATIVE);
    });

    it('should prioritize legacy_changes over changes', () => {
      const entity = createMockEntity('mixed-feat', 'feat', {
        changes: [
          { type: ChangeTypes.BAB, formula: { expression: '1' }, bonusTypeId: 'UNTYPED' },
        ],
        legacy_changes: [
          { type: ChangeTypes.INITIATIVE, formula: { expression: '2' }, bonusTypeId: 'UNTYPED' },
        ],
      });
      const baseData = createMockCharacterBaseData({ feat: [entity] });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      // Should use legacy_changes, not changes
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe(ChangeTypes.INITIATIVE);
    });
  });

  describe('entities with legacy_contextualChanges', () => {
    it('should compile entities with legacy_contextualChanges', () => {
      const entity = createMockEntity('power-attack-feat', 'feat', {
        legacy_contextualChanges: [
          {
            type: 'attack' as const,
            name: 'Power Attack',
            appliesTo: 'melee' as const,
            optional: true,
            available: true,
            variables: [],
            changes: [],
          },
        ],
      });
      const baseData = createMockCharacterBaseData({ feat: [entity] });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.contextualChanges).toHaveLength(1);
      expect(result.contextualChanges[0].name).toBe('Power Attack');
    });

    it('should compile entities with multiple legacy_contextualChanges', () => {
      const entity = createMockEntity('multi-context', 'feat', {
        legacy_contextualChanges: [
          {
            type: 'attack' as const,
            name: 'Power Attack',
            appliesTo: 'melee' as const,
            optional: true,
            available: true,
            variables: [],
            changes: [],
          },
          {
            type: 'attack' as const,
            name: 'Combat Expertise',
            appliesTo: 'all' as const,
            optional: true,
            available: true,
            variables: [],
            changes: [],
          },
        ],
      });
      const baseData = createMockCharacterBaseData({ feat: [entity] });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.contextualChanges).toHaveLength(2);
    });

    it('should return empty contextualChanges when not provided', () => {
      const entity = createMockEntity('no-contextual', 'feat');
      const baseData = createMockCharacterBaseData({ feat: [entity] });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.contextualChanges).toHaveLength(0);
    });
  });

  describe('entities with specialChanges', () => {
    it('should compile entities with legacy_specialChanges', () => {
      const entity = createMockEntity('special-feat', 'feat', {
        legacy_specialChanges: [
          { type: 'EXTRA_FEAT_SELECTION', amount: 1 },
        ],
      });
      const baseData = createMockCharacterBaseData({ feat: [entity] });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.specialChanges).toHaveLength(1);
    });

    it('should fall back to specialChanges for backwards compatibility', () => {
      const entity = createMockEntity('old-special', 'feat', {
        specialChanges: [
          { type: 'EXTRA_FEAT_SELECTION', amount: 1 },
        ],
      });
      const baseData = createMockCharacterBaseData({ feat: [entity] });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.specialChanges).toHaveLength(1);
    });
  });

  describe('ComputedEntity metadata', () => {
    it('should create proper _meta.source for feat entities', () => {
      const entity = createMockEntity('test-feat', 'feat', { name: 'Test Feat' });
      const baseData = createMockCharacterBaseData({ feat: [entity] });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.computedEntities[0]._meta).toEqual({
        source: {
          originType: 'feat',
          originId: 'test-feat',
          name: 'Test Feat',
        },
        suppressed: false,
      });
    });

    it('should derive originType from entityType', () => {
      const spellEntity = createMockEntity('fireball', 'spell');
      const itemEntity = createMockEntity('sword', 'item');
      const customEntity = createMockEntity('custom', 'custom-type');
      
      const baseData = createMockCharacterBaseData({
        spell: [spellEntity],
        item: [itemEntity],
        'custom-type': [customEntity],
      });
      const context = createMockCompendiumContext(['spell', 'item', 'custom-type']);
      
      const result = compileCharacterEntities(baseData, context);
      
      const spellComputed = result.computedEntities.find(e => e.id === 'fireball');
      const itemComputed = result.computedEntities.find(e => e.id === 'sword');
      const customComputed = result.computedEntities.find(e => e.id === 'custom');
      
      expect(spellComputed?._meta.source.originType).toBe('spell');
      expect(itemComputed?._meta.source.originType).toBe('item');
      expect(customComputed?._meta.source.originType).toBe('entity');
    });

    it('should use entity id as name fallback', () => {
      const entity: StandardEntity = {
        id: 'no-name-entity',
        entityType: 'feat',
        name: '', // Empty name
      };
      const baseData = createMockCharacterBaseData({ feat: [entity] });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      // Should fall back to id when name is empty
      expect(result.computedEntities[0]._meta.source.name).toBe('no-name-entity');
    });
  });

  describe('entityType validation', () => {
    it('should generate warning for unknown entityType', () => {
      const entity = createMockEntity('unknown', 'unknown-type');
      const baseData = createMockCharacterBaseData({ 'unknown-type': [entity] });
      const context = createMockCompendiumContext(['feat', 'spell']);
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('unknown_entity_type');
      expect(result.warnings[0].context?.entityType).toBe('unknown-type');
    });

    it('should skip entities with unknown entityType', () => {
      const entity = createMockEntity('unknown', 'unknown-type', {
        legacy_changes: [
          { type: ChangeTypes.BAB, formula: { expression: '5' }, bonusTypeId: 'UNTYPED' },
        ],
      });
      const baseData = createMockCharacterBaseData({ 'unknown-type': [entity] });
      const context = createMockCompendiumContext(['feat', 'spell']);
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.computedEntities).toHaveLength(0);
      expect(result.changes).toHaveLength(0);
    });

    it('should process valid entityTypes and skip invalid ones', () => {
      const validEntity = createMockEntity('valid', 'feat', {
        legacy_changes: [
          { type: ChangeTypes.BAB, formula: { expression: '1' }, bonusTypeId: 'UNTYPED' },
        ],
      });
      const invalidEntity = createMockEntity('invalid', 'unknown-type');
      
      const baseData = createMockCharacterBaseData({
        feat: [validEntity],
        'unknown-type': [invalidEntity],
      });
      const context = createMockCompendiumContext(['feat']);
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.computedEntities).toHaveLength(1);
      expect(result.computedEntities[0].id).toBe('valid');
      expect(result.changes).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe('multiple entity types', () => {
    it('should compile entities from multiple entityTypes', () => {
      const featEntity = createMockEntity('feat-1', 'feat');
      const spellEntity = createMockEntity('spell-1', 'spell');
      const itemEntity = createMockEntity('item-1', 'item');
      
      const baseData = createMockCharacterBaseData({
        feat: [featEntity],
        spell: [spellEntity],
        item: [itemEntity],
      });
      const context = createMockCompendiumContext(['feat', 'spell', 'item']);
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.computedEntities).toHaveLength(3);
    });

    it('should preserve entity order within each type', () => {
      const entities = [
        createMockEntity('feat-1', 'feat'),
        createMockEntity('feat-2', 'feat'),
        createMockEntity('feat-3', 'feat'),
      ];
      
      const baseData = createMockCharacterBaseData({ feat: entities });
      const context = createMockCompendiumContext();
      
      const result = compileCharacterEntities(baseData, context);
      
      expect(result.computedEntities.map(e => e.id)).toEqual(['feat-1', 'feat-2', 'feat-3']);
    });
  });

  describe('without context', () => {
    it('should process entities without context (permissive mode)', () => {
      const entity = createMockEntity('test', 'feat', {
        legacy_changes: [
          { type: ChangeTypes.BAB, formula: { expression: '1' }, bonusTypeId: 'UNTYPED' },
        ],
      });
      const baseData = createMockCharacterBaseData({ feat: [entity] });
      
      // No context provided
      const result = compileCharacterEntities(baseData, undefined);
      
      // Should process the entity
      expect(result.computedEntities).toHaveLength(1);
      expect(result.changes).toHaveLength(1);
      expect(result.warnings).toHaveLength(0);
    });
  });
});

