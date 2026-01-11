/**
 * Tests for all comparison operators in evaluateConditions
 * 
 * Tests ==, !=, >, <, >=, <= operators
 */

import { describe, test, expect } from 'bun:test';
import type { Condition, ConditionContext } from '../../../character/baseData/conditions';
import { evaluateConditions } from '../../conditions/evaluateConditions';

describe('evaluateConditions - all operators', () => {
  test('should evaluate == correctly', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@value',
        operator: '==',
        secondFormula: '5',
      },
    ];

    expect(evaluateConditions(conditions, { variables: { value: 5 } })).toBe(true);
    expect(evaluateConditions(conditions, { variables: { value: 4 } })).toBe(false);
  });

  test('should evaluate != correctly', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@value',
        operator: '!=',
        secondFormula: '5',
      },
    ];

    expect(evaluateConditions(conditions, { variables: { value: 4 } })).toBe(true);
    expect(evaluateConditions(conditions, { variables: { value: 5 } })).toBe(false);
  });

  test('should evaluate > correctly', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@value',
        operator: '>',
        secondFormula: '5',
      },
    ];

    expect(evaluateConditions(conditions, { variables: { value: 6 } })).toBe(true);
    expect(evaluateConditions(conditions, { variables: { value: 5 } })).toBe(false);
    expect(evaluateConditions(conditions, { variables: { value: 4 } })).toBe(false);
  });

  test('should evaluate < correctly', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@value',
        operator: '<',
        secondFormula: '5',
      },
    ];

    expect(evaluateConditions(conditions, { variables: { value: 4 } })).toBe(true);
    expect(evaluateConditions(conditions, { variables: { value: 5 } })).toBe(false);
    expect(evaluateConditions(conditions, { variables: { value: 6 } })).toBe(false);
  });

  test('should evaluate >= correctly', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@value',
        operator: '>=',
        secondFormula: '5',
      },
    ];

    expect(evaluateConditions(conditions, { variables: { value: 6 } })).toBe(true);
    expect(evaluateConditions(conditions, { variables: { value: 5 } })).toBe(true);
    expect(evaluateConditions(conditions, { variables: { value: 4 } })).toBe(false);
  });

  test('should evaluate <= correctly', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@value',
        operator: '<=',
        secondFormula: '5',
      },
    ];

    expect(evaluateConditions(conditions, { variables: { value: 4 } })).toBe(true);
    expect(evaluateConditions(conditions, { variables: { value: 5 } })).toBe(true);
    expect(evaluateConditions(conditions, { variables: { value: 6 } })).toBe(false);
  });
});

