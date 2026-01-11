/**
 * Tests for dynamic variable evaluation in evaluateConditions
 * 
 * Tests conditions with variables in formulas, including both sides
 */

import { describe, test, expect } from 'bun:test';
import type { Condition, ConditionContext } from '../../../character/baseData/conditions';
import { evaluateConditions } from '../../conditions/evaluateConditions';

describe('evaluateConditions - dynamic variable evaluation', () => {
  test('should evaluate with variables in both formulas', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '@requirement.minBab',
      },
    ];
    const context: ConditionContext = {
      variables: {
        'character.bab': 8,
        'requirement.minBab': 6,
      },
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });

  test('should fail when second formula variable makes condition fail', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '@requirement.minBab',
      },
    ];
    const context: ConditionContext = {
      variables: {
        'character.bab': 4,
        'requirement.minBab': 6,
      },
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });

  test('should support numeric literals in formulas', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '10',
        operator: '>',
        secondFormula: '5',
      },
    ];
    const context: ConditionContext = { variables: {} };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });
});

