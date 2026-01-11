/**
 * Tests for filter logic types (OR, NOT) and multiple filters
 */

import { describe, expect, test } from 'bun:test';
import { filterEntitiesWithVariables } from '../../filtering/filterWithVariables';
import type { EntityFilter } from '../../filtering/types';
import { testSpells } from './testData';

describe('Filter logic types', () => {
  test('OR: should match if any condition passes', () => {
    const filter: EntityFilter = {
      type: 'OR',
      filterPolicy: 'strict',
      conditions: [
        { field: 'school', operator: '==', value: 'evocation' },
        { field: 'school', operator: '==', value: 'abjuration' }
      ]
    };

    const results = filterEntitiesWithVariables(testSpells, [filter], {});

    expect(results).toHaveLength(3);
    expect(results.map(r => r.entity.id)).toEqual(['fireball', 'magic-missile', 'shield']);
  });

  test('NOT: should match if all conditions fail', () => {
    const filter: EntityFilter = {
      type: 'NOT',
      filterPolicy: 'strict',
      conditions: [
        { field: 'school', operator: '==', value: 'evocation' }
      ]
    };

    const results = filterEntitiesWithVariables(testSpells, [filter], {});

    expect(results).toHaveLength(2);
    expect(results.map(r => r.entity.id)).toEqual(['charm-person', 'shield']);
  });
});

describe('Multiple filters', () => {
  test('should combine multiple filters with AND logic', () => {
    const filters: EntityFilter[] = [
      {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'type', operator: '==', value: 'spell' }
        ]
      },
      {
        type: 'OR',
        filterPolicy: 'strict',
        conditions: [
          { field: 'school', operator: '==', value: 'evocation' },
          { field: 'school', operator: '==', value: 'enchantment' }
        ]
      }
    ];

    const results = filterEntitiesWithVariables(testSpells, filters, {});

    expect(results).toHaveLength(3);
    expect(results.map(r => r.entity.id)).toEqual(['fireball', 'magic-missile', 'charm-person']);
  });
});

