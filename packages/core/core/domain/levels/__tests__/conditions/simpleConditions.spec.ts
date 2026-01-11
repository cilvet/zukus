/**
 * Tests for simple conditions in evaluateConditions
 * 
 * Simple conditions perform numeric comparisons between formulas
 * using operators like >=, ==, !=, >, <, <=
 */

import { describe, test, expect } from 'bun:test';
import type { Condition, ConditionContext } from '../../../character/baseData/conditions';
import { evaluateConditions } from '../../conditions/evaluateConditions';

describe('evaluateConditions - simple conditions', () => {
  test('should pass when BAB meets minimum requirement', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '6',
      },
    ];
    const context: ConditionContext = {
      variables: { 'character.bab': 8 },
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });

  test('should fail when BAB does not meet minimum requirement', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '6',
      },
    ];
    const context: ConditionContext = {
      variables: { 'character.bab': 4 },
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });

  test('should pass when BAB equals exact requirement', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '6',
      },
    ];
    const context: ConditionContext = {
      variables: { 'character.bab': 6 },
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });
});

