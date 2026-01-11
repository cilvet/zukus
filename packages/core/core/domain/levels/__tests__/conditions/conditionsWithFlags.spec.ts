/**
 * Tests for conditions with flags in evaluateConditions
 * 
 * Tests conditions that check boolean flags (like archetype.active)
 * using equality operators
 */

import { describe, test, expect } from 'bun:test';
import type { Condition, ConditionContext } from '../../../character/baseData/conditions';
import { evaluateConditions } from '../../conditions/evaluateConditions';

describe('evaluateConditions - conditions with flags', () => {
  test('should pass when archetype flag is active (== 1)', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@archetype.assassin.active',
        operator: '==',
        secondFormula: '1',
      },
    ];
    const context: ConditionContext = {
      variables: { 'archetype.assassin.active': 1 },
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });

  test('should fail when archetype flag is not active (== 0)', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@archetype.assassin.active',
        operator: '==',
        secondFormula: '1',
      },
    ];
    const context: ConditionContext = {
      variables: { 'archetype.assassin.active': 0 },
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });

  test('should fail when archetype flag variable does not exist', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@archetype.assassin.active',
        operator: '==',
        secondFormula: '1',
      },
    ];
    const context: ConditionContext = {
      variables: {},
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });
});

