import { describe, it, expect } from 'bun:test';
import { validateSelector } from '../../selection/validateSelector';
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
  { id: 'feat-4', entityType: 'feat', name: 'Epic Strike', category: 'combat', level: 10 },
  { id: 'talent-1', entityType: 'rogueTalent', name: 'Fast Stealth', level: 3 },
  { id: 'talent-2', entityType: 'rogueTalent', name: 'Trap Sense', level: 3 },
  { id: 'talent-3', entityType: 'rogueTalent', name: 'Evasion', level: 6 },
];

const getEntity = (id: string): TestEntity | undefined => {
  return testEntities.find(e => e.id === id);
};

// =============================================================================
// Min/Max Validation
// =============================================================================

describe('validateSelector - min/max', () => {
  it('should be valid when selection count is within min/max', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [getEntity('feat-1')!, getEntity('feat-2')!],
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should error when below minimum', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 2,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [getEntity('feat-1')!],
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Minimum selections (2) not met');
    expect(result.errors[0]).toContain('Current: 1');
  });

  it('should error when above maximum', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 2,
      },
      entities: {
        granted: [],
        selected: [getEntity('feat-1')!, getEntity('feat-2')!, getEntity('feat-3')!],
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Maximum selections (2) exceeded');
    expect(result.errors[0]).toContain('Current: 3');
  });

  it('should error when no selections and min > 0', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Minimum selections (1) not met');
    expect(result.errors[0]).toContain('Current: 0');
  });

  it('should be valid with min 0 and no selections', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 0,
        max: 3,
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should be valid when provider has no selector', () => {
    const provider: EntityProvider<TestEntity> = {
      granted: { specificIds: ['feat-1'] },
      entities: {
        granted: [getEntity('feat-1')!],
        selected: [],
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});

// =============================================================================
// Filter Validation
// =============================================================================

describe('validateSelector - filter validation', () => {
  it('should warn when selected entity no longer meets filter', () => {
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
      entities: {
        granted: [],
        selected: [getEntity('feat-4')!], // level 10, doesn't meet filter
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true); // Warnings don't make it invalid
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("'feat-4' no longer meets filter criteria");
  });

  it('should warn based on current variables', () => {
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
      entities: {
        granted: [],
        selected: [getEntity('feat-2')!], // level 3
      },
    };

    // With characterLevel 2, feat-2 (level 3) should warn
    const result = validateSelector(provider, testEntities, { characterLevel: 2 });

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("'feat-2' no longer meets filter criteria");
  });

  it('should not warn when entity meets filter', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'category', operator: '==', value: 'combat' }
      ],
    };

    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Combat Feats',
        filter,
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [getEntity('feat-1')!], // category: combat
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('should warn for each entity that fails filter', () => {
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
      entities: {
        granted: [],
        selected: [
          getEntity('feat-1')!, // level 1 - OK
          getEntity('feat-4')!, // level 10 - Fail
          getEntity('talent-3')!, // level 6 - Fail
        ],
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(2);
    expect(result.warnings[0]).toContain("'feat-4'");
    expect(result.warnings[1]).toContain("'talent-3'");
  });
});

// =============================================================================
// EntityIds Validation
// =============================================================================

describe('validateSelector - entityIds validation', () => {
  it('should warn when selected entity not in entityIds list', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        entityIds: ['feat-1', 'feat-2'],
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [getEntity('feat-3')!],
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("'feat-3' is not in the allowed entity IDs list");
  });

  it('should not warn when entity is in entityIds list', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        entityIds: ['feat-1', 'feat-2', 'feat-3'],
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [getEntity('feat-2')!],
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });
});

// =============================================================================
// EntityType Validation
// =============================================================================

describe('validateSelector - entityType validation', () => {
  it('should warn when selected entity has wrong entityType', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        entityType: 'feat',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [getEntity('talent-1')!],
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("'talent-1' has type 'rogueTalent'");
    expect(result.warnings[0]).toContain("expects 'feat'");
  });

  it('should not warn when entity has correct entityType', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        entityType: 'feat',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [getEntity('feat-1')!],
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });
});

// =============================================================================
// Entity Existence Validation
// =============================================================================

describe('validateSelector - entity existence', () => {
  it('should warn when selected entity not found in allEntities', () => {
    const unknownEntity: TestEntity = {
      id: 'unknown-feat',
      entityType: 'feat',
      name: 'Unknown Feat',
    };

    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [unknownEntity],
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("'unknown-feat' is not found in available entities");
  });

  it('should not warn when all entities exist', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [getEntity('feat-1')!, getEntity('feat-2')!],
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('validateSelector - edge cases', () => {
  it('should handle empty selected entities object', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 0,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [],
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should accumulate multiple warnings from different checks', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
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
      entities: {
        granted: [],
        selected: [getEntity('talent-1')!], // Wrong entityType, not in entityIds, no category
      },
    };

    const result = validateSelector(provider, testEntities, {});

    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
  });
});
