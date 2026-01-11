/**
 * Tests for empty conditions in evaluateConditions
 * 
 * Tests edge cases when conditions array is empty or undefined
 */

import { describe, test, expect } from 'bun:test';
import type { ConditionContext } from '../../../character/baseData/conditions';
import { evaluateConditions } from '../../conditions/evaluateConditions';

describe('evaluateConditions - empty conditions', () => {
  test('should pass when conditions array is empty', () => {
    const conditions: never[] = [];
    const context: ConditionContext = { variables: {} };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });

  test('should pass when conditions is undefined', () => {
    const context: ConditionContext = { variables: {} };

    const result = evaluateConditions(undefined, context);

    expect(result).toBe(true);
  });
});

