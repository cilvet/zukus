/**
 * Tests for filtering with variables
 * 
 * Case 2: Filter with variables - Filter feats by BAB requirement
 */

import { describe, expect, test } from 'bun:test';
import { filterEntitiesWithVariables } from '../../filtering/filterWithVariables';
import type { EntityFilter, SubstitutionIndex } from '../../filtering/types';
import { testFeats } from './testData';

describe('Filter with variables', () => {
  test('should filter feats by BAB requirement using variables', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'requiredBab', operator: '<=', value: '@character.bab' }
      ]
    };

    const variables: SubstitutionIndex = {
      'character.bab': 4
    };

    const results = filterEntitiesWithVariables(testFeats, [filter], variables);

    expect(results).toHaveLength(4);
    expect(results.map(r => r.entity.id)).toEqual([
      'power-attack', 'cleave', 'great-cleave', 'whirlwind-attack'
    ]);
  });

  test('should exclude feats when BAB is too low', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'requiredBab', operator: '<=', value: '@character.bab' }
      ]
    };

    const variables: SubstitutionIndex = {
      'character.bab': 1
    };

    const results = filterEntitiesWithVariables(testFeats, [filter], variables);

    expect(results).toHaveLength(2);
    expect(results.map(r => r.entity.id)).toEqual(['power-attack', 'cleave']);
  });
});

