/**
 * Tests for JMESPath support in filtering
 */

import { describe, expect, test } from 'bun:test';
import {
  filterEntitiesWithVariables,
  evaluateCondition,
} from '../../filtering/filterWithVariables';
import type {
  EntityFilter,
  EntityPropertyCondition,
} from '../../filtering/types';
import { spellsWithLevels } from './testData';

describe('JMESPath support', () => {
  test('should access simple nested field with JMESPath', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { jmesPath: 'meta.source', operator: '==', value: 'PHB' }
      ]
    };

    const results = filterEntitiesWithVariables(spellsWithLevels, [filter], {});
    
    expect(results).toHaveLength(4);
  });

  test('should extract all classes from levels array', () => {
    const condition: EntityPropertyCondition = {
      jmesPath: 'levels[*].class',
      operator: 'contains',
      value: 'wizard'
    };

    const result = evaluateCondition(spellsWithLevels[0], condition, {});
    
    expect(result.passed).toBe(true);
    expect(result.actualValue).toEqual(['wizard', 'sorcerer']);
  });

  test('should filter spells available to wizard', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { jmesPath: 'levels[*].class', operator: 'contains', value: 'wizard' }
      ]
    };

    const results = filterEntitiesWithVariables(spellsWithLevels, [filter], {});
    
    expect(results).toHaveLength(2);
    expect(results.map(r => r.entity.id)).toEqual(['magic-missile', 'fireball']);
  });

  test('should filter spells available to cleric', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { jmesPath: 'levels[*].class', operator: 'contains', value: 'cleric' }
      ]
    };

    const results = filterEntitiesWithVariables(spellsWithLevels, [filter], {});
    
    expect(results).toHaveLength(2);
    expect(results.map(r => r.entity.id)).toEqual(['cure-light', 'heal']);
  });

  test('should get first level for a specific class using filter expression', () => {
    // Get the wizard level from magic missile
    const condition: EntityPropertyCondition = {
      jmesPath: "levels[?class=='wizard'].level | [0]",
      operator: '==',
      value: 1
    };

    const result = evaluateCondition(spellsWithLevels[0], condition, {});
    
    expect(result.passed).toBe(true);
    expect(result.actualValue).toBe(1);
  });

  test('should filter wizard spells by level using JMESPath filter', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { jmesPath: "levels[?class=='wizard'].level | [0]", operator: '>=', value: 3 }
      ]
    };

    const results = filterEntitiesWithVariables(spellsWithLevels, [filter], {});
    
    // Only fireball has wizard level >= 3
    expect(results).toHaveLength(1);
    expect(results[0].entity.id).toBe('fireball');
  });

  test('should handle JMESPath that returns null for non-matching filter', () => {
    const condition: EntityPropertyCondition = {
      jmesPath: "levels[?class=='wizard'].level | [0]",
      operator: '==',
      value: 1
    };

    // cure-light doesn't have wizard level
    const result = evaluateCondition(spellsWithLevels[2], condition, {});
    
    expect(result.passed).toBe(false);
    expect(result.actualValue).toBeNull();
  });

  test('should count array length with JMESPath', () => {
    const condition: EntityPropertyCondition = {
      jmesPath: 'length(levels)',
      operator: '>=',
      value: 3
    };

    const result = evaluateCondition(spellsWithLevels[2], condition, {}); // cure-light has 4 levels
    
    expect(result.passed).toBe(true);
    expect(result.actualValue).toBe(4);
  });

  test('should filter spells with many class options', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { jmesPath: 'length(levels)', operator: '>=', value: 3 }
      ]
    };

    const results = filterEntitiesWithVariables(spellsWithLevels, [filter], {});
    
    // Only cure-light has 4 class/level entries
    expect(results).toHaveLength(1);
    expect(results[0].entity.id).toBe('cure-light');
  });

  test('should combine JMESPath with field conditions', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'school', operator: '==', value: 'evocation' },
        { jmesPath: "levels[?class=='wizard'].level | [0]", operator: '==', value: 1 }
      ]
    };

    const results = filterEntitiesWithVariables(spellsWithLevels, [filter], {});
    
    // Only magic-missile is evocation AND wizard level 1
    expect(results).toHaveLength(1);
    expect(results[0].entity.id).toBe('magic-missile');
  });

  test('should access array elements by index', () => {
    const condition: EntityPropertyCondition = {
      jmesPath: 'components[0]',
      operator: '==',
      value: 'V'
    };

    const result = evaluateCondition(spellsWithLevels[0], condition, {});
    
    expect(result.passed).toBe(true);
    expect(result.actualValue).toBe('V');
  });

  test('should check if component exists using contains', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { jmesPath: 'components', operator: 'contains', value: 'M' }
      ]
    };

    const results = filterEntitiesWithVariables(spellsWithLevels, [filter], {});
    
    // Only fireball has M component
    expect(results).toHaveLength(1);
    expect(results[0].entity.id).toBe('fireball');
  });

  test('should return detailed evaluation for JMESPath conditions', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'permissive',
      conditions: [
        { jmesPath: "levels[?class=='wizard'].level | [0]", operator: '<=', value: 1 }
      ]
    };

    const results = filterEntitiesWithVariables(spellsWithLevels, [filter], {});
    const fireball = results.find(r => r.entity.id === 'fireball');
    
    expect(fireball).toBeDefined();
    expect(fireball!.matches).toBe(false);
    expect(fireball!.evaluatedConditions[0].actualValue).toBe(3); // wizard level 3
    expect(fireball!.evaluatedConditions[0].expectedValue).toBe(1);
  });
});

