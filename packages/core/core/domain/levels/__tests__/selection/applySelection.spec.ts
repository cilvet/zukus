import { describe, it, expect } from 'bun:test';
import { applySelection } from '../../selection/applySelection';
import type { EntityProvider, SelectableEntity } from '../../providers/types';
import type { EntityFilter } from '../../filtering/types';

// =============================================================================
// Test Entities
// =============================================================================

type TestEntity = SelectableEntity & {
  name: string;
  category?: string;
  level?: number;
};

const testEntities: TestEntity[] = [
  { id: 'feat-1', entityType: 'feat', name: 'Power Attack', category: 'combat', level: 1 },
  { id: 'feat-2', entityType: 'feat', name: 'Cleave', category: 'combat', level: 3 },
  { id: 'feat-3', entityType: 'feat', name: 'Spell Focus', category: 'magic', level: 1 },
  { id: 'talent-1', entityType: 'rogueTalent', name: 'Fast Stealth', level: 3 },
  { id: 'talent-2', entityType: 'rogueTalent', name: 'Trap Sense', level: 3 },
  { id: 'talent-3', entityType: 'rogueTalent', name: 'Evasion', level: 6 },
];

const getEntity = (id: string): TestEntity | undefined => {
  return testEntities.find(e => e.id === id);
};

// =============================================================================
// Basic Selection
// =============================================================================

describe('applySelection - basic', () => {
  it('should add entity to empty provider', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select a Feat',
        min: 1,
        max: 3,
      },
    };

    const entity = getEntity('feat-1')!;
    const result = applySelection(provider, entity, testEntities, {});

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.provider.entities).toBeDefined();
    expect(result.provider.entities!.selected).toHaveLength(1);
    expect(result.provider.entities!.selected[0].id).toBe('feat-1');
  });

  it('should add entity to provider with existing selections', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [getEntity('feat-1')!],
      },
    };

    const entity = getEntity('feat-2')!;
    const result = applySelection(provider, entity, testEntities, {});

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.provider.entities!.selected).toHaveLength(2);
    expect(result.provider.entities!.selected[0].id).toBe('feat-1');
    expect(result.provider.entities!.selected[1].id).toBe('feat-2');
  });

  it('should not mutate original provider', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select a Feat',
        min: 1,
        max: 3,
      },
    };

    const entity = getEntity('feat-1')!;
    const result = applySelection(provider, entity, testEntities, {});

    expect(provider.entities).toBeUndefined();
    expect(result.provider).not.toBe(provider);
  });

  it('should preserve granted entities when adding selected', () => {
    const provider: EntityProvider<TestEntity> = {
      granted: { specificIds: ['feat-3'] },
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [getEntity('feat-3')!],
        selected: [],
      },
    };

    const entity = getEntity('feat-1')!;
    const result = applySelection(provider, entity, testEntities, {});

    expect(result.provider.entities!.granted).toHaveLength(1);
    expect(result.provider.entities!.granted[0].id).toBe('feat-3');
    expect(result.provider.entities!.selected).toHaveLength(1);
    expect(result.provider.entities!.selected[0].id).toBe('feat-1');
  });
});

// =============================================================================
// Error Cases
// =============================================================================

describe('applySelection - errors', () => {
  it('should error when provider has no selector', () => {
    const provider: EntityProvider<TestEntity> = {
      granted: { specificIds: ['feat-1'] },
    };

    const entity = getEntity('feat-1')!;
    const result = applySelection(provider, entity, testEntities, {});

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('no selector');
    expect(result.provider).toBe(provider);
  });

  it('should error when entity is already selected', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [getEntity('feat-1')!],
      },
    };

    const entity = getEntity('feat-1')!;
    const result = applySelection(provider, entity, testEntities, {});

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('already selected');
    expect(result.provider).toBe(provider);
  });

  it('should error when max selections exceeded', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 2,
      },
      entities: {
        granted: [],
        selected: [getEntity('feat-1')!, getEntity('feat-2')!],
      },
    };

    const entity = getEntity('feat-3')!;
    const result = applySelection(provider, entity, testEntities, {});

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Maximum selections');
    expect(result.errors[0]).toContain('2');
    expect(result.provider).toBe(provider);
  });
});

// =============================================================================
// Warnings (Permissive Philosophy)
// =============================================================================

describe('applySelection - warnings (permissive)', () => {
  it('should warn when entity does not meet filter criteria (permissive)', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'permissive',
      conditions: [
        { field: 'level', operator: '<=', value: 3 }
      ],
    };

    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        filter,
        min: 1,
        max: 3,
      },
    };

    // talent-3 has level 6, which exceeds the filter
    const entity = getEntity('talent-3')!;
    const result = applySelection(provider, entity, testEntities, {});

    // Should succeed but with warning
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('does not meet filter criteria');
    expect(result.provider.entities!.selected).toContainEqual(expect.objectContaining({ id: 'talent-3' }));
  });

  it('should warn when entity is filtered out (strict filter)', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'level', operator: '<=', value: 3 }
      ],
    };

    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        filter,
        min: 1,
        max: 3,
      },
    };

    // talent-3 has level 6, which exceeds the filter
    const entity = getEntity('talent-3')!;
    const result = applySelection(provider, entity, testEntities, {});

    // Should succeed but with warning (permissive philosophy)
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('filtered out');
    expect(result.provider.entities!.selected).toContainEqual(expect.objectContaining({ id: 'talent-3' }));
  });

  it('should warn when entity not in entityIds list', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        entityIds: ['feat-1', 'feat-2'],
        min: 1,
        max: 3,
      },
    };

    const entity = getEntity('feat-3')!;
    const result = applySelection(provider, entity, testEntities, {});

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('not in the allowed entity IDs list');
    expect(result.provider.entities!.selected).toContainEqual(expect.objectContaining({ id: 'feat-3' }));
  });

  it('should warn when entity has wrong entityType', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        entityType: 'feat',
        min: 1,
        max: 3,
      },
    };

    const entity = getEntity('talent-1')!;
    const result = applySelection(provider, entity, testEntities, {});

    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("has type 'rogueTalent'");
    expect(result.warnings[0]).toContain("expects 'feat'");
    expect(result.provider.entities!.selected).toContainEqual(expect.objectContaining({ id: 'talent-1' }));
  });

  it('should accumulate multiple warnings', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'permissive',
      conditions: [
        { field: 'category', operator: '==', value: 'combat' }
      ],
    };

    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Combat Feats',
        entityType: 'feat',
        entityIds: ['feat-1', 'feat-2'],
        filter,
        min: 1,
        max: 3,
      },
    };

    // talent-1: wrong entityType, not in entityIds, doesn't match filter (no category)
    const entity = getEntity('talent-1')!;
    const result = applySelection(provider, entity, testEntities, {});

    expect(result.errors).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    expect(result.provider.entities!.selected).toContainEqual(expect.objectContaining({ id: 'talent-1' }));
  });
});

// =============================================================================
// Filter with Variables
// =============================================================================

describe('applySelection - filter with variables', () => {
  it('should evaluate filter with current variables', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'level', operator: '<=', value: '@characterLevel' }
      ],
    };

    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        filter,
        min: 1,
        max: 3,
      },
    };

    const entity = getEntity('talent-2')!; // level 3
    
    // With characterLevel 3, should pass
    const result1 = applySelection(provider, entity, testEntities, { characterLevel: 3 });
    expect(result1.warnings).toHaveLength(0);
    expect(result1.provider.entities!.selected).toContainEqual(expect.objectContaining({ id: 'talent-2' }));
  });

  it('should warn when entity no longer meets variable-based filter', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'level', operator: '<=', value: '@characterLevel' }
      ],
    };

    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        filter,
        min: 1,
        max: 3,
      },
    };

    const entity = getEntity('talent-2')!; // level 3
    
    // With characterLevel 2, should warn (level 3 > 2)
    const result = applySelection(provider, entity, testEntities, { characterLevel: 2 });
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('filtered out');
    // Still adds the entity (permissive philosophy)
    expect(result.provider.entities!.selected).toContainEqual(expect.objectContaining({ id: 'talent-2' }));
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('applySelection - edge cases', () => {
  it('should handle provider with max 1', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select One Feat',
        min: 1,
        max: 1,
      },
    };

    const entity1 = getEntity('feat-1')!;
    const result1 = applySelection(provider, entity1, testEntities, {});
    expect(result1.errors).toHaveLength(0);
    expect(result1.provider.entities!.selected).toHaveLength(1);

    // Try to add second - should error
    const entity2 = getEntity('feat-2')!;
    const result2 = applySelection(result1.provider, entity2, testEntities, {});
    expect(result2.errors).toHaveLength(1);
    expect(result2.errors[0]).toContain('Maximum selections');
  });

  it('should store complete entity, not just ID', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
    };

    const entity = getEntity('feat-1')!;
    const result = applySelection(provider, entity, testEntities, {});

    const stored = result.provider.entities!.selected[0] as TestEntity;
    expect(stored.name).toBe('Power Attack');
    expect(stored.category).toBe('combat');
    expect(stored.level).toBe(1);
  });
});
