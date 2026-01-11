/**
 * Tests for the 'meets_conditions' filter operator
 * 
 * This operator allows filtering entities based on whether their internal
 * conditions field evaluates to true given the current variables.
 */

import { describe, test, expect } from 'bun:test';
import type { Condition } from '../../../character/baseData/conditions';
import type { EntityFilter, SubstitutionIndex } from '../../filtering/types';
import { filterEntitiesWithVariables } from '../../filtering/filterWithVariables';

// Test entity type that includes a conditions field
type TestFeature = {
  id: string;
  name: string;
  conditions?: Condition[];
};

describe('meets_conditions operator', () => {
  // ==========================================================================
  // Basic functionality
  // ==========================================================================
  describe('basic functionality', () => {
    test('should match entity when all conditions pass', () => {
      const features: TestFeature[] = [
        {
          id: 'power-attack',
          name: 'Power Attack',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@character.bab',
              operator: '>=',
              secondFormula: '1',
            },
          ],
        },
      ];

      const filter: EntityFilter = {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'conditions', operator: 'meets_conditions', value: null },
        ],
      };

      const variables: SubstitutionIndex = { 'character.bab': 5 };
      const results = filterEntitiesWithVariables(features, [filter], variables);

      expect(results).toHaveLength(1);
      expect(results[0].entity.id).toBe('power-attack');
      expect(results[0].matches).toBe(true);
    });

    test('should not match entity when conditions fail', () => {
      const features: TestFeature[] = [
        {
          id: 'power-attack',
          name: 'Power Attack',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@character.bab',
              operator: '>=',
              secondFormula: '6',
            },
          ],
        },
      ];

      const filter: EntityFilter = {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'conditions', operator: 'meets_conditions', value: null },
        ],
      };

      const variables: SubstitutionIndex = { 'character.bab': 3 };
      const results = filterEntitiesWithVariables(features, [filter], variables);

      expect(results).toHaveLength(0);
    });

    test('should match entity without conditions (no requirements)', () => {
      const features: TestFeature[] = [
        {
          id: 'basic-feat',
          name: 'Basic Feat',
          // No conditions
        },
      ];

      const filter: EntityFilter = {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'conditions', operator: 'meets_conditions', value: null },
        ],
      };

      const variables: SubstitutionIndex = {};
      const results = filterEntitiesWithVariables(features, [filter], variables);

      expect(results).toHaveLength(1);
      expect(results[0].matches).toBe(true);
    });

    test('should match entity with empty conditions array', () => {
      const features: TestFeature[] = [
        {
          id: 'simple-feat',
          name: 'Simple Feat',
          conditions: [],
        },
      ];

      const filter: EntityFilter = {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'conditions', operator: 'meets_conditions', value: null },
        ],
      };

      const variables: SubstitutionIndex = {};
      const results = filterEntitiesWithVariables(features, [filter], variables);

      expect(results).toHaveLength(1);
      expect(results[0].matches).toBe(true);
    });
  });

  // ==========================================================================
  // Multiple conditions (AND logic)
  // ==========================================================================
  describe('multiple conditions in entity', () => {
    test('should match when all entity conditions pass', () => {
      const features: TestFeature[] = [
        {
          id: 'improved-power-attack',
          name: 'Improved Power Attack',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@character.bab',
              operator: '>=',
              secondFormula: '6',
            },
            {
              type: 'simple',
              firstFormula: '@feat.powerAttack.selected',
              operator: '==',
              secondFormula: '1',
            },
          ],
        },
      ];

      const filter: EntityFilter = {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'conditions', operator: 'meets_conditions', value: null },
        ],
      };

      const variables: SubstitutionIndex = {
        'character.bab': 8,
        'feat.powerAttack.selected': 1,
      };

      const results = filterEntitiesWithVariables(features, [filter], variables);

      expect(results).toHaveLength(1);
      expect(results[0].matches).toBe(true);
    });

    test('should not match when any entity condition fails', () => {
      const features: TestFeature[] = [
        {
          id: 'improved-power-attack',
          name: 'Improved Power Attack',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@character.bab',
              operator: '>=',
              secondFormula: '6',
            },
            {
              type: 'simple',
              firstFormula: '@feat.powerAttack.selected',
              operator: '==',
              secondFormula: '1',
            },
          ],
        },
      ];

      const filter: EntityFilter = {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'conditions', operator: 'meets_conditions', value: null },
        ],
      };

      const variables: SubstitutionIndex = {
        'character.bab': 8,
        'feat.powerAttack.selected': 0, // Missing prerequisite feat
      };

      const results = filterEntitiesWithVariables(features, [filter], variables);

      expect(results).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Filtering multiple entities
  // ==========================================================================
  describe('filtering multiple entities', () => {
    test('should filter entities based on their individual conditions', () => {
      const features: TestFeature[] = [
        {
          id: 'basic-feat',
          name: 'Basic Feat',
          // No conditions - should pass
        },
        {
          id: 'bab-1-feat',
          name: 'BAB 1 Feat',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@character.bab',
              operator: '>=',
              secondFormula: '1',
            },
          ],
        },
        {
          id: 'bab-6-feat',
          name: 'BAB 6 Feat',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@character.bab',
              operator: '>=',
              secondFormula: '6',
            },
          ],
        },
        {
          id: 'bab-11-feat',
          name: 'BAB 11 Feat',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@character.bab',
              operator: '>=',
              secondFormula: '11',
            },
          ],
        },
      ];

      const filter: EntityFilter = {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'conditions', operator: 'meets_conditions', value: null },
        ],
      };

      const variables: SubstitutionIndex = { 'character.bab': 6 };
      const results = filterEntitiesWithVariables(features, [filter], variables);

      expect(results).toHaveLength(3);
      expect(results.map(r => r.entity.id)).toContain('basic-feat');
      expect(results.map(r => r.entity.id)).toContain('bab-1-feat');
      expect(results.map(r => r.entity.id)).toContain('bab-6-feat');
      expect(results.map(r => r.entity.id)).not.toContain('bab-11-feat');
    });
  });

  // ==========================================================================
  // Permissive policy
  // ==========================================================================
  describe('permissive policy', () => {
    test('should return all entities with match status in permissive mode', () => {
      const features: TestFeature[] = [
        {
          id: 'passes',
          name: 'Passes',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@character.bab',
              operator: '>=',
              secondFormula: '1',
            },
          ],
        },
        {
          id: 'fails',
          name: 'Fails',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@character.bab',
              operator: '>=',
              secondFormula: '10',
            },
          ],
        },
      ];

      const filter: EntityFilter = {
        type: 'AND',
        filterPolicy: 'permissive',
        conditions: [
          { field: 'conditions', operator: 'meets_conditions', value: null },
        ],
      };

      const variables: SubstitutionIndex = { 'character.bab': 5 };
      const results = filterEntitiesWithVariables(features, [filter], variables);

      expect(results).toHaveLength(2);
      
      const passes = results.find(r => r.entity.id === 'passes');
      const fails = results.find(r => r.entity.id === 'fails');
      
      expect(passes?.matches).toBe(true);
      expect(fails?.matches).toBe(false);
    });
  });

  // ==========================================================================
  // Combined with other filter conditions
  // ==========================================================================
  describe('combined with other filter conditions', () => {
    test('should work with other field conditions (AND)', () => {
      const features: TestFeature[] = [
        {
          id: 'fighter-feat',
          name: 'Fighter Feat',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@character.bab',
              operator: '>=',
              secondFormula: '1',
            },
          ],
        },
        {
          id: 'wizard-feat',
          name: 'Wizard Feat',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@character.bab',
              operator: '>=',
              secondFormula: '1',
            },
          ],
        },
      ];

      const filter: EntityFilter = {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'conditions', operator: 'meets_conditions', value: null },
          { field: 'name', operator: 'contains', value: 'Fighter' },
        ],
      };

      const variables: SubstitutionIndex = { 'character.bab': 5 };
      const results = filterEntitiesWithVariables(features, [filter], variables);

      expect(results).toHaveLength(1);
      expect(results[0].entity.id).toBe('fighter-feat');
    });
  });

  // ==========================================================================
  // Custom field path for conditions
  // ==========================================================================
  describe('custom field path', () => {
    test('should support conditions in nested field (e.g., props.conditions)', () => {
      type NestedFeature = {
        id: string;
        name: string;
        props: {
          conditions?: Condition[];
        };
      };

      const features: NestedFeature[] = [
        {
          id: 'nested-feat',
          name: 'Nested Feat',
          props: {
            conditions: [
              {
                type: 'simple',
                firstFormula: '@character.level',
                operator: '>=',
                secondFormula: '5',
              },
            ],
          },
        },
      ];

      const filter: EntityFilter = {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'props.conditions', operator: 'meets_conditions', value: null },
        ],
      };

      const variables: SubstitutionIndex = { 'character.level': 10 };
      const results = filterEntitiesWithVariables(features, [filter], variables);

      expect(results).toHaveLength(1);
      expect(results[0].matches).toBe(true);
    });
  });

  // ==========================================================================
  // Archetype-specific scenarios
  // ==========================================================================
  describe('archetype scenarios', () => {
    test('should filter features by archetype activation', () => {
      const features: TestFeature[] = [
        {
          id: 'base-sneak-attack',
          name: 'Sneak Attack',
          // No conditions - base rogue feature
        },
        {
          id: 'assassin-death-attack',
          name: 'Death Attack',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@archetype.assassin.active',
              operator: '==',
              secondFormula: '1',
            },
          ],
        },
        {
          id: 'scout-skirmish',
          name: 'Skirmish',
          conditions: [
            {
              type: 'simple',
              firstFormula: '@archetype.scout.active',
              operator: '==',
              secondFormula: '1',
            },
          ],
        },
      ];

      const filter: EntityFilter = {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'conditions', operator: 'meets_conditions', value: null },
        ],
      };

      // Assassin archetype is active
      const assassinVariables: SubstitutionIndex = {
        'archetype.assassin.active': 1,
        'archetype.scout.active': 0,
      };

      const assassinResults = filterEntitiesWithVariables(features, [filter], assassinVariables);

      expect(assassinResults).toHaveLength(2);
      expect(assassinResults.map(r => r.entity.id)).toContain('base-sneak-attack');
      expect(assassinResults.map(r => r.entity.id)).toContain('assassin-death-attack');
      expect(assassinResults.map(r => r.entity.id)).not.toContain('scout-skirmish');
    });
  });
});

