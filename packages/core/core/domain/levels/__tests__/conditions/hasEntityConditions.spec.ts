/**
 * Tests for has_entity conditions in evaluateConditions
 * 
 * Tests conditions that check if character has specific entities
 * by ID, type, filters, and count requirements
 */

import { describe, test, expect } from 'bun:test';
import type { Condition, ConditionContext, ConditionEntity } from '../../../character/baseData/conditions';
import { evaluateConditions } from '../../conditions/evaluateConditions';

describe('evaluateConditions - has_entity conditions', () => {
  const powerAttackFeat: ConditionEntity = {
    id: 'power-attack',
    entityType: 'feat',
    name: 'Power Attack',
    tags: ['combat'],
  };

  const cleaveFeate: ConditionEntity = {
    id: 'cleave',
    entityType: 'feat',
    name: 'Cleave',
    tags: ['combat'],
  };

  const metamagicFeat1: ConditionEntity = {
    id: 'empower-spell',
    entityType: 'feat',
    name: 'Empower Spell',
    tags: ['metamagic'],
  };

  const metamagicFeat2: ConditionEntity = {
    id: 'maximize-spell',
    entityType: 'feat',
    name: 'Maximize Spell',
    tags: ['metamagic'],
  };

  test('should pass when character has specific entity by ID', () => {
    const conditions: Condition[] = [
      {
        type: 'has_entity',
        entityId: 'power-attack',
      },
    ];
    const context: ConditionContext = {
      variables: {},
      characterEntities: [powerAttackFeat, cleaveFeate],
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });

  test('should fail when character does not have specific entity by ID', () => {
    const conditions: Condition[] = [
      {
        type: 'has_entity',
        entityId: 'great-cleave',
      },
    ];
    const context: ConditionContext = {
      variables: {},
      characterEntities: [powerAttackFeat, cleaveFeate],
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });

  test('should pass when character has any entity of specified type', () => {
    const conditions: Condition[] = [
      {
        type: 'has_entity',
        entityType: 'feat',
      },
    ];
    const context: ConditionContext = {
      variables: {},
      characterEntities: [powerAttackFeat],
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });

  test('should fail when character has no entities of specified type', () => {
    const conditions: Condition[] = [
      {
        type: 'has_entity',
        entityType: 'spell',
      },
    ];
    const context: ConditionContext = {
      variables: {},
      characterEntities: [powerAttackFeat],
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });

  test('should pass when character has entity matching filter', () => {
    const conditions: Condition[] = [
      {
        type: 'has_entity',
        entityType: 'feat',
        filter: [{ field: 'tags', operator: 'contains', value: 'combat' }],
      },
    ];
    const context: ConditionContext = {
      variables: {},
      characterEntities: [powerAttackFeat, metamagicFeat1],
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });

  test('should fail when no entity matches filter', () => {
    const conditions: Condition[] = [
      {
        type: 'has_entity',
        entityType: 'feat',
        filter: [{ field: 'tags', operator: 'contains', value: 'combat' }],
      },
    ];
    const context: ConditionContext = {
      variables: {},
      characterEntities: [metamagicFeat1, metamagicFeat2],
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });

  test('should pass when count.min is met', () => {
    const conditions: Condition[] = [
      {
        type: 'has_entity',
        entityType: 'feat',
        filter: [{ field: 'tags', operator: 'contains', value: 'metamagic' }],
        count: { min: 2 },
      },
    ];
    const context: ConditionContext = {
      variables: {},
      characterEntities: [metamagicFeat1, metamagicFeat2, powerAttackFeat],
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });

  test('should fail when count.min is not met', () => {
    const conditions: Condition[] = [
      {
        type: 'has_entity',
        entityType: 'feat',
        filter: [{ field: 'tags', operator: 'contains', value: 'metamagic' }],
        count: { min: 3 },
      },
    ];
    const context: ConditionContext = {
      variables: {},
      characterEntities: [metamagicFeat1, metamagicFeat2],
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });

  test('should pass when count.max is not exceeded', () => {
    const conditions: Condition[] = [
      {
        type: 'has_entity',
        entityType: 'feat',
        count: { max: 3 },
      },
    ];
    const context: ConditionContext = {
      variables: {},
      characterEntities: [powerAttackFeat, cleaveFeate],
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(true);
  });

  test('should fail when count.max is exceeded', () => {
    const conditions: Condition[] = [
      {
        type: 'has_entity',
        entityType: 'feat',
        count: { max: 1 },
      },
    ];
    const context: ConditionContext = {
      variables: {},
      characterEntities: [powerAttackFeat, cleaveFeate],
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });

  test('should fail when characterEntities is not provided', () => {
    const conditions: Condition[] = [
      {
        type: 'has_entity',
        entityId: 'power-attack',
      },
    ];
    const context: ConditionContext = {
      variables: {},
      // characterEntities not provided
    };

    const result = evaluateConditions(conditions, context);

    expect(result).toBe(false);
  });
});

