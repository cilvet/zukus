/**
 * Tests for Entity Variables Generator
 * 
 * Tests the generation of SubstitutionIndex from entity properties.
 */

import { describe, expect, test } from 'bun:test';
import {
  generateEntityVariables,
  mergeEntityVariables,
  getEntityVariablePaths,
} from '../../filtering/entityVariables';

describe('generateEntityVariables', () => {
  describe('primitive values', () => {
    test('should extract string properties', () => {
      const entity = { id: 'spell-1', name: 'Fireball' };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.id']).toBe('spell-1');
      expect(result['entity.name']).toBe('Fireball');
    });

    test('should extract number properties', () => {
      const entity = { level: 3, damage: 10 };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.level']).toBe(3);
      expect(result['entity.damage']).toBe(10);
    });

    test('should convert boolean true to 1', () => {
      const entity = { isActive: true };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.isActive']).toBe(1);
    });

    test('should convert boolean false to 0', () => {
      const entity = { isActive: false };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.isActive']).toBe(0);
    });
  });

  describe('null and undefined handling', () => {
    test('should ignore null values', () => {
      const entity = { name: 'Test', nullValue: null };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.name']).toBe('Test');
      expect(result['entity.nullValue']).toBeUndefined();
    });

    test('should ignore undefined values', () => {
      const entity = { name: 'Test', undefinedValue: undefined };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.name']).toBe('Test');
      expect(result['entity.undefinedValue']).toBeUndefined();
    });
  });

  describe('nested objects', () => {
    test('should flatten single-level nested objects', () => {
      const entity = {
        id: 'item-1',
        props: {
          bonus: 2,
          type: 'enhancement',
        },
      };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.id']).toBe('item-1');
      expect(result['entity.props.bonus']).toBe(2);
      expect(result['entity.props.type']).toBe('enhancement');
    });

    test('should flatten deeply nested objects', () => {
      const entity = {
        data: {
          meta: {
            info: {
              value: 42,
            },
          },
        },
      };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.data.meta.info.value']).toBe(42);
    });

    test('should handle empty nested objects', () => {
      const entity = {
        name: 'Test',
        empty: {},
      };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.name']).toBe('Test');
      // Empty object produces no variables
      expect(Object.keys(result).length).toBe(1);
    });
  });

  describe('arrays', () => {
    test('should include array length', () => {
      const entity = {
        tags: ['fire', 'evocation', 'damage'],
      };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.tags.length']).toBe(3);
    });

    test('should include primitive arrays for contains operator', () => {
      const entity = {
        classes: ['wizard', 'sorcerer'],
      };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.classes']).toEqual(['wizard', 'sorcerer']);
      expect(result['entity.classes.length']).toBe(2);
    });

    test('should handle empty arrays', () => {
      const entity = {
        items: [],
      };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.items.length']).toBe(0);
      expect(result['entity.items']).toBeUndefined();
    });

    test('should include number arrays', () => {
      const entity = {
        levels: [1, 3, 5, 7],
      };
      
      const result = generateEntityVariables(entity);
      
      expect(result['entity.levels']).toEqual([1, 3, 5, 7]);
      expect(result['entity.levels.length']).toBe(4);
    });
  });

  describe('custom prefix', () => {
    test('should use custom prefix', () => {
      const entity = { level: 5 };
      
      const result = generateEntityVariables(entity, 'spell');
      
      expect(result['spell.level']).toBe(5);
      expect(result['entity.level']).toBeUndefined();
    });

    test('should work with empty prefix', () => {
      const entity = { level: 5 };
      
      const result = generateEntityVariables(entity, 'e');
      
      expect(result['e.level']).toBe(5);
    });
  });

  describe('complex entities', () => {
    test('should handle a typical spell entity', () => {
      const spell = {
        id: 'fireball',
        name: 'Fireball',
        level: 3,
        school: 'evocation',
        components: ['V', 'S', 'M'],
        meta: {
          source: 'PHB',
          page: 241,
        },
      };
      
      const result = generateEntityVariables(spell);
      
      expect(result['entity.id']).toBe('fireball');
      expect(result['entity.name']).toBe('Fireball');
      expect(result['entity.level']).toBe(3);
      expect(result['entity.school']).toBe('evocation');
      expect(result['entity.components']).toEqual(['V', 'S', 'M']);
      expect(result['entity.components.length']).toBe(3);
      expect(result['entity.meta.source']).toBe('PHB');
      expect(result['entity.meta.page']).toBe(241);
    });

    test('should handle a feat with requirements', () => {
      const feat = {
        id: 'power-attack',
        name: 'Power Attack',
        requirements: {
          bab: 1,
          strength: 13,
        },
        tags: ['combat', 'melee'],
      };
      
      const result = generateEntityVariables(feat);
      
      expect(result['entity.id']).toBe('power-attack');
      expect(result['entity.requirements.bab']).toBe(1);
      expect(result['entity.requirements.strength']).toBe(13);
      expect(result['entity.tags']).toEqual(['combat', 'melee']);
    });
  });

  describe('depth limit', () => {
    test('should respect max depth of 10', () => {
      // Create a deeply nested object
      const createNested = (depth: number): Record<string, unknown> => {
        if (depth === 0) {
          return { value: 'deep' };
        }
        return { nested: createNested(depth - 1) };
      };
      
      const entity = createNested(15); // 15 levels deep
      const result = generateEntityVariables(entity);
      
      // Should have some variables but not all 15 levels
      const keys = Object.keys(result);
      const maxNesting = keys.reduce((max, key) => {
        const dots = (key.match(/\./g) || []).length;
        return Math.max(max, dots);
      }, 0);
      
      // Max depth is 10, plus 1 for 'entity' prefix = 11 dots max
      expect(maxNesting).toBeLessThanOrEqual(11);
    });
  });
});

describe('mergeEntityVariables', () => {
  test('should merge entity variables with existing variables', () => {
    const entity = { level: 3, school: 'evocation' };
    const existing = { 'character.bab': 5 };
    
    const result = mergeEntityVariables(entity, existing);
    
    expect(result['entity.level']).toBe(3);
    expect(result['entity.school']).toBe('evocation');
    expect(result['character.bab']).toBe(5);
  });

  test('should give precedence to existing variables', () => {
    const entity = { level: 3 };
    const existing = { 'entity.level': 10 }; // Override
    
    const result = mergeEntityVariables(entity, existing);
    
    expect(result['entity.level']).toBe(10); // Existing takes precedence
  });

  test('should work with custom prefix', () => {
    const entity = { level: 3 };
    const existing = { 'character.bab': 5 };
    
    const result = mergeEntityVariables(entity, existing, 'spell');
    
    expect(result['spell.level']).toBe(3);
    expect(result['character.bab']).toBe(5);
  });
});

describe('getEntityVariablePaths', () => {
  test('should return all available variable paths', () => {
    const entity = {
      id: 'test',
      level: 3,
      props: { bonus: 2 },
    };
    
    const paths = getEntityVariablePaths(entity);
    
    expect(paths).toContain('entity.id');
    expect(paths).toContain('entity.level');
    expect(paths).toContain('entity.props.bonus');
  });

  test('should use custom prefix', () => {
    const entity = { level: 3 };
    
    const paths = getEntityVariablePaths(entity, 'spell');
    
    expect(paths).toContain('spell.level');
    expect(paths).not.toContain('entity.level');
  });

  test('should return empty array for empty entity', () => {
    const entity = {};
    
    const paths = getEntityVariablePaths(entity);
    
    expect(paths).toEqual([]);
  });
});

