/**
 * Tests for basic filtering without variables
 * 
 * Case 1: Basic filter without variables - Filter spells by school
 */

import { describe, expect, test } from 'bun:test';
import { filterEntitiesWithVariables } from '../../filtering/filterWithVariables';
import type { EntityFilter } from '../../filtering/types';
import { testSpells } from './testData';

describe('Basic filter without variables', () => {
  test('should filter spells by school (evocation)', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'school', operator: '==', value: 'evocation' }
      ]
    };

    const results = filterEntitiesWithVariables(testSpells, [filter], {});

    expect(results).toHaveLength(2);
    expect(results.every(r => r.entity.school === 'evocation')).toBe(true);
    expect(results.map(r => r.entity.id)).toEqual(['fireball', 'magic-missile']);
  });

  test('should filter by level with comparison operator', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'level', operator: '==', value: 1 }
      ]
    };

    const results = filterEntitiesWithVariables(testSpells, [filter], {});

    expect(results).toHaveLength(3);
    expect(results.every(r => r.entity.level === 1)).toBe(true);
  });

  test('should combine multiple conditions with AND', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'school', operator: '==', value: 'evocation' },
        { field: 'level', operator: '==', value: 1 }
      ]
    };

    const results = filterEntitiesWithVariables(testSpells, [filter], {});

    expect(results).toHaveLength(1);
    expect(results[0].entity.id).toBe('magic-missile');
  });
});

