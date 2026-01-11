/**
 * Tests for result reasons (evaluatedConditions)
 * 
 * Case 5: Result with reasons - Show why a feat is not available
 */

import { describe, expect, test } from 'bun:test';
import { filterEntitiesWithVariables } from '../../filtering/filterWithVariables';
import type { EntityFilter, SubstitutionIndex } from '../../filtering/types';
import { testFeats, testSpells } from './testData';

describe('Result with reasons', () => {
  test('should include condition evaluation details', () => {
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
    const improvedCritical = results.find(r => r.entity.id === 'improved-critical');

    expect(improvedCritical).toBeDefined();
    expect(improvedCritical!.matches).toBe(false);
    expect(improvedCritical!.evaluatedConditions).toHaveLength(1);
    
    const condition = improvedCritical!.evaluatedConditions[0];
    expect(condition.passed).toBe(false);
    expect(condition.actualValue).toBe(8); // requiredBab of improved-critical
    expect(condition.expectedValue).toBe(4); // @character.bab resolved to 4
  });

  test('should show multiple failed conditions', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'permissive',
      conditions: [
        { field: 'school', operator: '==', value: 'evocation' },
        { field: 'level', operator: '>=', value: 5 }
      ]
    };

    const results = filterEntitiesWithVariables(testSpells, [filter], {});
    const fireball = results.find(r => r.entity.id === 'fireball');

    expect(fireball).toBeDefined();
    expect(fireball!.matches).toBe(false);
    expect(fireball!.evaluatedConditions).toHaveLength(2);
    
    // First condition passes (school == evocation)
    expect(fireball!.evaluatedConditions[0].passed).toBe(true);
    
    // Second condition fails (level >= 5, but fireball is level 3)
    expect(fireball!.evaluatedConditions[1].passed).toBe(false);
    expect(fireball!.evaluatedConditions[1].actualValue).toBe(3);
  });
});

