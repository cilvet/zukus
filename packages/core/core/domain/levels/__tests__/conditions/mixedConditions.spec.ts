/**
 * Tests for mixed conditions (simple + has_entity) in evaluateConditions
 * 
 * Tests combinations of different condition types in a single conditions array
 */

import { describe, test, expect } from 'bun:test';
import type { Condition, ConditionContext } from '../../../character/baseData/conditions';
import { evaluateConditions } from '../../conditions/evaluateConditions';

describe('evaluateConditions - mixed conditions', () => {
  test('should pass when both simple and has_entity conditions pass', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '1',
      },
      {
        type: 'has_entity',
        entityId: 'power-attack',
      },
    ];
    const context: ConditionContext = {
      variables: { 'character.bab': 6 },
      characterEntities: [{ id: 'power-attack', entityType: 'feat' }],
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });

  test('should fail when simple condition fails but has_entity passes', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '6',
      },
      {
        type: 'has_entity',
        entityId: 'power-attack',
      },
    ];
    const context: ConditionContext = {
      variables: { 'character.bab': 2 },
      characterEntities: [{ id: 'power-attack', entityType: 'feat' }],
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });

  test('should fail when has_entity condition fails but simple passes', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '1',
      },
      {
        type: 'has_entity',
        entityId: 'power-attack',
      },
    ];
    const context: ConditionContext = {
      variables: { 'character.bab': 6 },
      characterEntities: [], // No feats
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });
});

