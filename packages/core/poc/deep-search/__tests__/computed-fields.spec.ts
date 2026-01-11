/**
 * Tests for Computed Fields System
 */

import { describe, expect, test } from 'bun:test';
import { applyComputedFields, applyComputedFieldsToMany } from '../computed-fields';
import { spellComputedFieldsConfig } from '../spell-computed-fields';

// Type definitions for tests
type SpellLevel = {
  class: string;
  level: number;
};

type SpellEntity = {
  id: string;
  name: string;
  type: string;
  levels: SpellLevel[];
  tags?: string[];
};

let spellCounter = 0;

function buildSpell(overrides: Partial<SpellEntity> & { levels: SpellLevel[] }): SpellEntity {
  spellCounter++;
  return {
    id: `spell-${spellCounter}`,
    name: overrides.name || `Test Spell ${spellCounter}`,
    type: 'spell',
    tags: [],
    ...overrides
  };
}

describe('Computed Fields System', () => {
  const testSpell: SpellEntity = buildSpell({
    name: 'Test Spell',
    levels: [
      { class: 'wizard', level: 1 },
      { class: 'sorcerer', level: 1 },
      { class: 'cleric', level: 2 }
    ]
  });

  describe('applyComputedFields', () => {
    test('should compute classes field', () => {
      const result = applyComputedFields(testSpell, spellComputedFieldsConfig);
      
      expect(result.classes).toEqual(['wizard', 'sorcerer', 'cleric']);
    });

    test('should compute classesWithLevels field', () => {
      const result = applyComputedFields(testSpell, spellComputedFieldsConfig);
      
      expect(result.classesWithLevels).toEqual([
        'wizard 1',
        'sorcerer 1',
        'cleric 2'
      ]);
    });

    test('should compute levels field', () => {
      const result = applyComputedFields(testSpell, spellComputedFieldsConfig);
      
      expect(result.levels).toEqual([1, 1, 2]);
    });

    test('should preserve original entity data', () => {
      const result = applyComputedFields(testSpell, spellComputedFieldsConfig);
      
      expect(result.id).toBe(testSpell.id);
      expect(result.name).toBe(testSpell.name);
      expect(result.type).toBe(testSpell.type);
    });
  });

  describe('applyComputedFieldsToMany', () => {
    const testSpells: SpellEntity[] = [
      buildSpell({
        name: 'Spell 1',
        levels: [{ class: 'wizard', level: 1 }]
      }),
      buildSpell({
        name: 'Spell 2',
        levels: [
          { class: 'cleric', level: 1 },
          { class: 'paladin', level: 2 }
        ]
      }),
      buildSpell({
        name: 'Spell 3',
        levels: [
          { class: 'druid', level: 3 },
          { class: 'ranger', level: 3 },
          { class: 'cleric', level: 2 }
        ]
      })
    ];

    test('should apply computed fields to all entities', () => {
      const results = applyComputedFieldsToMany(testSpells, spellComputedFieldsConfig);
      
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.classes).toBeDefined();
        expect(result.classesWithLevels).toBeDefined();
        expect(result.levels).toBeDefined();
      });
    });

    test('should compute correct values for each entity', () => {
      const results = applyComputedFieldsToMany(testSpells, spellComputedFieldsConfig);
      
      expect(results[0].classes).toEqual(['wizard']);
      expect(results[0].classesWithLevels).toEqual(['wizard 1']);
      expect(results[0].levels).toEqual([1]);
      
      expect(results[1].classes).toEqual(['cleric', 'paladin']);
      expect(results[1].classesWithLevels).toEqual(['cleric 1', 'paladin 2']);
      expect(results[1].levels).toEqual([1, 2]);
      
      expect(results[2].classes).toEqual(['druid', 'ranger', 'cleric']);
      expect(results[2].classesWithLevels).toEqual(['druid 3', 'ranger 3', 'cleric 2']);
      expect(results[2].levels).toEqual([3, 3, 2]);
    });
  });

  describe('Edge Cases', () => {
    test('should handle spell with single class', () => {
      const spell = buildSpell({
        name: 'Single Class Spell',
        levels: [{ class: 'bard', level: 5 }]
      });

      const result = applyComputedFields(spell, spellComputedFieldsConfig);

      expect(result.classes).toEqual(['bard']);
      expect(result.classesWithLevels).toEqual(['bard 5']);
      expect(result.levels).toEqual([5]);
    });

    test('should handle spell with many classes', () => {
      const spell = buildSpell({
        name: 'Multi Class Spell',
        levels: [
          { class: 'wizard', level: 1 },
          { class: 'sorcerer', level: 1 },
          { class: 'cleric', level: 2 },
          { class: 'druid', level: 2 },
          { class: 'bard', level: 3 }
        ]
      });

      const result = applyComputedFields(spell, spellComputedFieldsConfig);

      expect(result.classes).toHaveLength(5);
      expect(result.classesWithLevels).toHaveLength(5);
      expect(result.levels).toHaveLength(5);
      expect(result.classesWithLevels[4]).toBe('bard 3');
    });

    test('should handle high level spells', () => {
      const spell = buildSpell({
        name: 'High Level Spell',
        levels: [
          { class: 'wizard', level: 9 },
          { class: 'sorcerer', level: 9 }
        ]
      });

      const result = applyComputedFields(spell, spellComputedFieldsConfig);

      expect(result.classesWithLevels).toEqual(['wizard 9', 'sorcerer 9']);
      expect(result.levels).toEqual([9, 9]);
    });
  });

  describe('JMESPath Expressions', () => {
    test('classes expression should extract class names', () => {
      const result = applyComputedFields(testSpell, {
        fields: [
          {
            name: 'classes',
            jmespathExpression: 'levels[*].class'
          }
        ]
      });

      expect(result.classes).toEqual(['wizard', 'sorcerer', 'cleric']);
    });

    test('levels expression should extract level numbers', () => {
      const result = applyComputedFields(testSpell, {
        fields: [
          {
            name: 'levels',
            jmespathExpression: 'levels[*].level'
          }
        ]
      });

      expect(result.levels).toEqual([1, 1, 2]);
    });

    test('classesWithLevels expression should join class and level', () => {
      const result = applyComputedFields(testSpell, {
        fields: [
          {
            name: 'classesWithLevels',
            jmespathExpression: 'levels[*].join(\' \', [class, to_string(level)])'
          }
        ]
      });

      expect(result.classesWithLevels).toEqual([
        'wizard 1',
        'sorcerer 1',
        'cleric 2'
      ]);
    });
  });
});




