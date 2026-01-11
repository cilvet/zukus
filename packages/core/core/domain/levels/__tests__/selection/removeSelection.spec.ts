import { describe, it, expect } from 'bun:test';
import { removeSelection } from '../../selection/removeSelection';
import type { EntityProvider, SelectableEntity } from '../../providers/types';

// =============================================================================
// Test Entities
// =============================================================================

type TestEntity = SelectableEntity & {
  name: string;
};

const feat1: TestEntity = { id: 'feat-1', entityType: 'feat', name: 'Power Attack' };
const feat2: TestEntity = { id: 'feat-2', entityType: 'feat', name: 'Cleave' };
const feat3: TestEntity = { id: 'feat-3', entityType: 'feat', name: 'Spell Focus' };

// =============================================================================
// Basic Removal
// =============================================================================

describe('removeSelection - basic', () => {
  it('should remove entity from provider', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [feat1, feat2],
      },
    };

    const result = removeSelection(provider, 'feat-1');

    expect(result.entities).toBeDefined();
    expect(result.entities!.selected).toHaveLength(1);
    expect(result.entities!.selected[0].id).toBe('feat-2');
  });

  it('should return provider unchanged when entity not selected', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [feat1],
      },
    };

    const result = removeSelection(provider, 'feat-2');

    expect(result).toBe(provider);
  });

  it('should not mutate original provider', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [feat1, feat2],
      },
    };

    const result = removeSelection(provider, 'feat-1');

    expect(provider.entities!.selected).toHaveLength(2);
    expect(result).not.toBe(provider);
  });

  it('should preserve granted entities when removing selected', () => {
    const provider: EntityProvider<TestEntity> = {
      granted: { specificIds: ['feat-3'] },
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [feat3],
        selected: [feat1, feat2],
      },
    };

    const result = removeSelection(provider, 'feat-1');

    expect(result.entities!.granted).toHaveLength(1);
    expect(result.entities!.granted[0].id).toBe('feat-3');
    expect(result.entities!.selected).toHaveLength(1);
    expect(result.entities!.selected[0].id).toBe('feat-2');
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('removeSelection - edge cases', () => {
  it('should result in empty selected array when removing last selection', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [feat1],
      },
    };

    const result = removeSelection(provider, 'feat-1');

    expect(result.entities!.selected).toHaveLength(0);
  });

  it('should handle provider with no entities', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
    };

    const result = removeSelection(provider, 'feat-1');

    expect(result).toBe(provider);
  });

  it('should handle provider with empty selected array', () => {
    const provider: EntityProvider<TestEntity> = {
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        min: 1,
        max: 3,
      },
      entities: {
        granted: [],
        selected: [],
      },
    };

    const result = removeSelection(provider, 'feat-1');

    expect(result).toBe(provider);
  });

  it('should preserve all provider properties', () => {
    const provider: EntityProvider<TestEntity> = {
      granted: { specificIds: ['feat-3'] },
      selector: {
        id: 'feat-sel',
        name: 'Select Feats',
        entityType: 'feat',
        entityIds: ['feat-1', 'feat-2', 'feat-3'],
        filter: {
          type: 'AND',
          filterPolicy: 'strict',
          conditions: [{ field: 'category', operator: '==', value: 'combat' }],
        },
        min: 1,
        max: 3,
      },
      entities: {
        granted: [feat3],
        selected: [feat1, feat2],
      },
    };

    const result = removeSelection(provider, 'feat-1');

    expect(result.granted).toBeDefined();
    expect(result.selector!.id).toBe('feat-sel');
    expect(result.selector!.name).toBe('Select Feats');
    expect(result.selector!.entityType).toBe('feat');
    expect(result.selector!.entityIds).toEqual(['feat-1', 'feat-2', 'feat-3']);
    expect(result.selector!.filter).toBeDefined();
    expect(result.selector!.min).toBe(1);
    expect(result.selector!.max).toBe(3);
  });
});
