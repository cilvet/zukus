import { describe, it, expect } from 'bun:test';
import { compileContextualEffects, applyContextualEffects } from '../contextualEffects';
import type { ContextualEffectGroup, ContextualFields, ResolvedParams } from '../types';

function makeGroup(overrides: Partial<ContextualEffectGroup> & { id: string; context: string }): ContextualEffectGroup {
  return {
    name: overrides.id,
    effects: [],
    optional: true,
    ...overrides,
  };
}

describe('compileContextualEffects', () => {
  it('returns empty result for empty entities', () => {
    const result = compileContextualEffects([]);
    expect(result.all).toEqual([]);
    expect(result.byContext).toEqual({});
  });

  it('returns empty result for entities without contextualEffects', () => {
    const entities: ContextualFields[] = [
      {},
      { contextualEffects: undefined },
    ];
    const result = compileContextualEffects(entities);
    expect(result.all).toEqual([]);
    expect(result.byContext).toEqual({});
  });

  it('indexes groups by context from multiple entities', () => {
    const group1 = makeGroup({ id: 'g1', context: 'casting' });
    const group2 = makeGroup({ id: 'g2', context: 'attack' });
    const group3 = makeGroup({ id: 'g3', context: 'casting' });

    const entities: ContextualFields[] = [
      { contextualEffects: [group1, group2] },
      { contextualEffects: [group3] },
    ];

    const result = compileContextualEffects(entities);
    expect(result.all).toHaveLength(3);
    expect(result.byContext['casting']).toHaveLength(2);
    expect(result.byContext['casting'][0].id).toBe('g1');
    expect(result.byContext['casting'][1].id).toBe('g3');
    expect(result.byContext['attack']).toHaveLength(1);
    expect(result.byContext['attack'][0].id).toBe('g2');
  });

  it('collects all groups in the all array', () => {
    const group1 = makeGroup({ id: 'g1', context: 'casting' });
    const group2 = makeGroup({ id: 'g2', context: 'attack' });

    const entities: ContextualFields[] = [
      { contextualEffects: [group1] },
      { contextualEffects: [group2] },
    ];

    const result = compileContextualEffects(entities);
    expect(result.all).toHaveLength(2);
    expect(result.all[0].id).toBe('g1');
    expect(result.all[1].id).toBe('g2');
  });
});

describe('applyContextualEffects', () => {
  it('returns params unchanged when no active effects', () => {
    const params: ResolvedParams = { attackBonus: 5, damage: 10 };
    const result = applyContextualEffects(params, [], {});
    expect(result).toEqual({ attackBonus: 5, damage: 10 });
  });

  it('does not mutate original params', () => {
    const params: ResolvedParams = { attackBonus: 5 };
    const group = makeGroup({
      id: 'power-attack',
      context: 'attack',
      effects: [
        { target: 'param.attackBonus', formula: '-2' },
      ],
    });
    const result = applyContextualEffects(params, [group], {});
    expect(result.attackBonus).toBe(3);
    expect(params.attackBonus).toBe(5);
  });

  it('applies single effect modifying a param', () => {
    const params: ResolvedParams = { attackBonus: 10, damage: 5 };
    const group = makeGroup({
      id: 'flanking',
      context: 'attack',
      effects: [
        { target: 'param.attackBonus', formula: '2' },
      ],
    });

    const result = applyContextualEffects(params, [group], {});
    expect(result.attackBonus).toBe(12);
    expect(result.damage).toBe(5);
  });

  it('applies effect with variables (slider pattern)', () => {
    const params: ResolvedParams = { attackBonus: 10, damage: 5 };
    const group = makeGroup({
      id: 'power-attack',
      context: 'attack',
      variables: [
        { id: 'points', name: 'Power Attack Points', min: '1', max: '5' },
      ],
      effects: [
        { target: 'param.attackBonus', formula: '-@points' },
        { target: 'param.damage', formula: '@points * 2' },
      ],
    });

    const variableValues = {
      'power-attack': { points: 3 },
    };

    const result = applyContextualEffects(params, [group], variableValues);
    expect(result.attackBonus).toBe(7);  // 10 + (-3)
    expect(result.damage).toBe(11);       // 5 + (3*2)
  });

  it('accumulates effects from multiple active groups', () => {
    const params: ResolvedParams = { attackBonus: 10 };
    const group1 = makeGroup({
      id: 'flanking',
      context: 'attack',
      effects: [
        { target: 'param.attackBonus', formula: '2' },
      ],
    });
    const group2 = makeGroup({
      id: 'higher-ground',
      context: 'attack',
      effects: [
        { target: 'param.attackBonus', formula: '1' },
      ],
    });

    const result = applyContextualEffects(params, [group1, group2], {});
    expect(result.attackBonus).toBe(13); // 10 + 2 + 1
  });

  it('ignores effects that do not target param.* prefix', () => {
    const params: ResolvedParams = { attackBonus: 10 };
    const group = makeGroup({
      id: 'buff',
      context: 'attack',
      effects: [
        { target: 'bab.total', formula: '2' },
        { target: 'param.attackBonus', formula: '3' },
      ],
    });

    const result = applyContextualEffects(params, [group], {});
    expect(result.attackBonus).toBe(13);
    // bab.total should not appear in result
    expect(result).not.toHaveProperty('total');
  });
});
