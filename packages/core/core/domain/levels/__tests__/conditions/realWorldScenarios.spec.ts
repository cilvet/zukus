/**
 * Tests for real-world scenarios in evaluateConditions
 * 
 * Tests complex conditions that represent actual game mechanics
 */

import { describe, test, expect } from 'bun:test';
import type { Condition } from '../../../character/baseData/conditions';
import { evaluateConditions } from '../../conditions/evaluateConditions';

describe('evaluateConditions - real-world scenarios', () => {
  test('assassin death attack: rogue level 3 + archetype active', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@archetype.assassin.active',
        operator: '==',
        secondFormula: '1',
      },
    ];

    // Assassin archetype active
    expect(evaluateConditions(conditions, { variables: { 'archetype.assassin.active': 1 } })).toBe(true);

    // No assassin archetype
    expect(evaluateConditions(conditions, { variables: { 'archetype.assassin.active': 0 } })).toBe(false);
  });

  test('feat prerequisite: BAB + ability score', () => {
    const conditions: Condition[] = [
      {
        type: 'simple',
        firstFormula: '@character.bab',
        operator: '>=',
        secondFormula: '1',
      },
      {
        type: 'simple',
        firstFormula: '@ability.strength.score',
        operator: '>=',
        secondFormula: '13',
      },
    ];

    // Meets both requirements
    expect(
      evaluateConditions(conditions, {
        variables: {
          'character.bab': 1,
          'ability.strength.score': 15,
        },
      })
    ).toBe(true);

    // Fails BAB requirement
    expect(
      evaluateConditions(conditions, {
        variables: {
          'character.bab': 0,
          'ability.strength.score': 15,
        },
      })
    ).toBe(false);

    // Fails strength requirement
    expect(
      evaluateConditions(conditions, {
        variables: {
          'character.bab': 1,
          'ability.strength.score': 12,
        },
      })
    ).toBe(false);
  });
});

