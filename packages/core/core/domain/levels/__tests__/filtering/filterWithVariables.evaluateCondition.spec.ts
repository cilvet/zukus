/**
 * Unit tests for evaluateCondition function
 */

import { describe, expect, test } from 'bun:test';
import { evaluateCondition } from '../../filtering/filterWithVariables';
import type { EntityPropertyCondition, SubstitutionIndex } from '../../filtering/types';
import { testFeats, testSpells } from './testData';

describe('evaluateCondition', () => {
  test('should handle == operator', () => {
    const condition: EntityPropertyCondition = {
      field: 'school',
      operator: '==',
      value: 'evocation'
    };

    const result = evaluateCondition(testSpells[0], condition, {});
    expect(result.passed).toBe(true);
    expect(result.actualValue).toBe('evocation');
  });

  test('should handle != operator', () => {
    const condition: EntityPropertyCondition = {
      field: 'school',
      operator: '!=',
      value: 'evocation'
    };

    const result = evaluateCondition(testSpells[2], condition, {}); // charm-person, enchantment
    expect(result.passed).toBe(true);
  });

  test('should handle > operator', () => {
    const condition: EntityPropertyCondition = {
      field: 'level',
      operator: '>',
      value: 2
    };

    const result = evaluateCondition(testSpells[0], condition, {}); // fireball, level 3
    expect(result.passed).toBe(true);
  });

  test('should handle contains operator for arrays', () => {
    const entity = { ...testSpells[0], tags: ['fire', 'damage', 'aoe'] };
    const condition: EntityPropertyCondition = {
      field: 'tags',
      operator: 'contains',
      value: 'fire'
    };

    const result = evaluateCondition(entity, condition, {});
    expect(result.passed).toBe(true);
  });

  test('should handle in operator', () => {
    const condition: EntityPropertyCondition = {
      field: 'school',
      operator: 'in',
      value: ['evocation', 'abjuration']
    };

    const result = evaluateCondition(testSpells[0], condition, {}); // fireball, evocation
    expect(result.passed).toBe(true);
  });

  test('should resolve variable in value', () => {
    const condition: EntityPropertyCondition = {
      field: 'requiredBab',
      operator: '<=',
      value: '@character.bab'
    };

    const variables: SubstitutionIndex = { 'character.bab': 5 };
    const result = evaluateCondition(testFeats[2], condition, variables); // great-cleave, requiredBab 4
    
    expect(result.passed).toBe(true);
    expect(result.expectedValue).toBe(5);
  });

  test('should handle missing field gracefully', () => {
    const condition: EntityPropertyCondition = {
      field: 'nonexistent',
      operator: '==',
      value: 'test'
    };

    const result = evaluateCondition(testSpells[0], condition, {});
    expect(result.passed).toBe(false);
    expect(result.actualValue).toBeUndefined();
  });
});

