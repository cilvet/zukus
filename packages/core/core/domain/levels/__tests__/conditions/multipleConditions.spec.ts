/**
 * Tests for multiple conditions (AND logic) in evaluateConditions
 * 
 * Tests that ALL conditions must pass for the result to be true
 */

import { describe, test, expect } from 'bun:test';
import type { Condition, ConditionContext } from '../../../character/baseData/conditions';
import { evaluateConditions } from '../../conditions/evaluateConditions';

describe('evaluateConditions - multiple conditions (AND logic)', () => {
  test('should pass when ALL conditions pass', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '6',
      },
      {
        type: 'simple',
        firstFormula: '@character.level',
        operator: '>=',
        secondFormula: '5',
      },
    ];
    const context: ConditionContext = {
      variables: {
        'character.bab': 8,
        'character.level': 10,
      },
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });

  test('should fail when ANY condition fails', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '6',
      },
      {
        type: 'simple',
        firstFormula: '@character.level',
        operator: '>=',
        secondFormula: '5',
      },
    ];
    const context: ConditionContext = {
      variables: {
        'character.bab': 8,
        'character.level': 3, // Fails this condition
      },
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });

  test('should fail when first condition fails', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '6',
      },
      {
        type: 'simple',
        firstFormula: '@character.level',
        operator: '>=',
        secondFormula: '5',
      },
    ];
    const context: ConditionContext = {
      variables: {
        'character.bab': 2, // Fails this condition
        'character.level': 10,
      },
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });

  test('should fail when all conditions fail', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '6',
      },
      {
        type: 'simple',
        firstFormula: '@archetype.assassin.active',
        operator: '==',
        secondFormula: '1',
      },
    ];
    const context: ConditionContext = {
      variables: {
        'character.bab': 2,
        'archetype.assassin.active': 0,
      },
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });
});

