/**
 * Tests for filter policies (permissive vs strict)
 * 
 * Case 3: Permissive filter - Show all feats, marking those that don't meet requirements
 * Case 4: Strict filter - Show only available feats
 */

import { describe, expect, test } from 'bun:test';
import { filterEntitiesWithVariables } from '../../filtering/filterWithVariables';
import type { EntityFilter, SubstitutionIndex } from '../../filtering/types';
import { testFeats, testSpells } from './testData';

describe('Permissive filter', () => {
  test('should return all entities with match status', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'permissive',
      conditions: [
        { field: 'requiredBab', operator: '<=', value: '@character.bab' }
      ]
    };

    const variables: SubstitutionIndex = {
      'character.bab': 4
    };

    const results = filterEntitiesWithVariables(testFeats, [filter], variables);

    // All entities should be returned
    expect(results).toHaveLength(5);
    
    // Check match status
    expect(results.find(r => r.entity.id === 'power-attack')?.matches).toBe(true);
    expect(results.find(r => r.entity.id === 'improved-critical')?.matches).toBe(false);
  });

  test('should mark all entities as not matching when conditions fail', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'permissive',
      conditions: [
        { field: 'requiredBab', operator: '<=', value: '@character.bab' }
      ]
    };

    const variables: SubstitutionIndex = {
      'character.bab': 0
    };

    const results = filterEntitiesWithVariables(testFeats, [filter], variables);

    expect(results).toHaveLength(5);
    expect(results.every(r => r.matches === false)).toBe(true);
  });
});

describe('Strict filter', () => {
  test('should only return matching entities', () => {
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
    expect(results.every(r => r.matches === true)).toBe(true);
  });

  test('should return empty array when nothing matches', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'school', operator: '==', value: 'nonexistent' }
      ]
    };

    const results = filterEntitiesWithVariables(testSpells, [filter], {});

    expect(results).toHaveLength(0);
  });
});

