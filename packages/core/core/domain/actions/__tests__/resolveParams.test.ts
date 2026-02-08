import { describe, it, expect } from 'bun:test';
import { resolveParams } from '../resolveParams';
import type { ActionDefinition } from '../types';
import type { StandardEntity } from '../../entities/types/base';
import type { SubstitutionIndex } from '../../character/calculation/sources/calculateSources';

function makeAction(params: ActionDefinition['params']): ActionDefinition {
  return {
    id: 'test-action',
    name: 'Test Action',
    actionType: 'cast_spell',
    params,
    results: [],
  };
}

const baseEntity: StandardEntity = {
  id: 'spell-1',
  entityType: 'spell',
  name: 'Fireball',
  spellLevel: 3,
  school: 'evocation',
  nested: { damage: { base: 5 } },
};

const baseIndex: SubstitutionIndex = {
  'class.wizard.level': 10,
  'ability.intelligence.modifier': 4,
  'bab.total': 5,
};

describe('resolveParams', () => {
  it('resolves character source from substitution index', () => {
    const action = makeAction([
      { id: 'casterLevel', name: 'Caster Level', source: { type: 'character', path: 'class.wizard.level' } },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result.casterLevel).toBe(10);
  });

  it('resolves character source with @ prefix', () => {
    const action = makeAction([
      { id: 'casterLevel', name: 'Caster Level', source: { type: 'character', path: '@class.wizard.level' } },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result.casterLevel).toBe(10);
  });

  it('defaults to 0 for missing character source', () => {
    const action = makeAction([
      { id: 'missing', name: 'Missing', source: { type: 'character', path: 'nonexistent.path' } },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result.missing).toBe(0);
  });

  it('resolves entity source from entity field', () => {
    const action = makeAction([
      { id: 'level', name: 'Spell Level', source: { type: 'entity', path: 'spellLevel' } },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result.level).toBe(3);
  });

  it('resolves entity source with @entity. prefix', () => {
    const action = makeAction([
      { id: 'level', name: 'Spell Level', source: { type: 'entity', path: '@entity.spellLevel' } },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result.level).toBe(3);
  });

  it('resolves entity source with nested dot-path', () => {
    const action = makeAction([
      { id: 'baseDmg', name: 'Base Damage', source: { type: 'entity', path: 'nested.damage.base' } },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result.baseDmg).toBe(5);
  });

  it('resolves entity source string field', () => {
    const action = makeAction([
      { id: 'school', name: 'School', source: { type: 'entity', path: 'school' } },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result.school).toBe('evocation');
  });

  it('resolves formula source referencing earlier params', () => {
    const action = makeAction([
      { id: 'casterLevel', name: 'Caster Level', source: { type: 'character', path: 'class.wizard.level' } },
      { id: 'damageDice', name: 'Damage Dice', source: { type: 'formula', expression: '@param.casterLevel + 2' } },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result.casterLevel).toBe(10);
    expect(result.damageDice).toBe(12);
  });

  it('resolves formula source referencing character index', () => {
    const action = makeAction([
      { id: 'bonus', name: 'Bonus', source: { type: 'formula', expression: '@ability.intelligence.modifier + @bab.total' } },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result.bonus).toBe(9);
  });

  it('resolves dynamic source with provided value', () => {
    const action = makeAction([
      {
        id: 'empower',
        name: 'Empower',
        source: { type: 'dynamic', inputType: { kind: 'boolean', label: 'Empower Spell?' } },
      },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex, { empower: true });
    expect(result.empower).toBe(true);
  });

  it('resolves dynamic boolean with default when no value provided', () => {
    const action = makeAction([
      {
        id: 'empower',
        name: 'Empower',
        source: { type: 'dynamic', inputType: { kind: 'boolean', label: 'Empower Spell?' } },
      },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result.empower).toBe(false);
  });

  it('resolves dynamic number with default when no value provided', () => {
    const action = makeAction([
      {
        id: 'extraDice',
        name: 'Extra Dice',
        source: { type: 'dynamic', inputType: { kind: 'number', min: '0', max: '5' } },
      },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result.extraDice).toBe(0);
  });

  it('resolves dynamic select with default (first option) when no value provided', () => {
    const action = makeAction([
      {
        id: 'element',
        name: 'Element',
        source: {
          type: 'dynamic',
          inputType: {
            kind: 'select',
            options: [
              { value: 'fire', label: 'Fire' },
              { value: 'cold', label: 'Cold' },
            ],
          },
        },
      },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result.element).toBe('fire');
  });

  it('resolves mixed params in order', () => {
    const action = makeAction([
      { id: 'casterLevel', name: 'CL', source: { type: 'character', path: 'class.wizard.level' } },
      { id: 'spellLevel', name: 'SL', source: { type: 'entity', path: 'spellLevel' } },
      { id: 'dcBase', name: 'DC', source: { type: 'formula', expression: '10 + @param.spellLevel + @ability.intelligence.modifier' } },
      {
        id: 'maximize',
        name: 'Maximize',
        source: { type: 'dynamic', inputType: { kind: 'boolean', label: 'Maximize?' } },
      },
    ]);
    const result = resolveParams(action, baseEntity, baseIndex, { maximize: true });
    expect(result.casterLevel).toBe(10);
    expect(result.spellLevel).toBe(3);
    expect(result.dcBase).toBe(17); // 10 + 3 + 4
    expect(result.maximize).toBe(true);
  });

  it('returns empty object for action with no params', () => {
    const action = makeAction(undefined);
    const result = resolveParams(action, baseEntity, baseIndex);
    expect(result).toEqual({});
  });
});
