import { describe, it, expect } from 'bun:test';
import { executeInjectEntity } from '../results/injectEntity';
import { executeModifyHP } from '../results/modifyHP';
import { executeDiceRoll } from '../results/diceRoll';
import type {
  InjectBuffResult,
  HealResult,
  DiceRollResult,
} from '../types';

describe('executeInjectEntity', () => {
  const makeResult = (): InjectBuffResult => ({
    type: 'inject_entity',
    entityId: 'buff-mage-armor',
    target: 'self',
    active: true,
  });

  const baseEntity = {
    id: 'buff-mage-armor',
    name: 'Mage Armor',
    casterLevel: 0,
    effects: [
      { target: 'ac.total', formula: '4', bonusType: 'armor' },
    ],
  };

  const lookup = (id: string) => (id === 'buff-mage-armor' ? baseEntity : undefined);

  it('clones entity and applies output values', () => {
    const outcome = executeInjectEntity(makeResult(), { casterLevel: 5 }, lookup);
    expect(outcome.type).toBe('inject_entity');
    expect(outcome.entity.casterLevel).toBe(5);
    expect(outcome.entity.name).toBe('Mage Armor');
  });

  it('does not modify the original entity', () => {
    executeInjectEntity(makeResult(), { casterLevel: 10 }, lookup);
    expect(baseEntity.casterLevel).toBe(0);
  });

  it('resolves dice in effect formulas', () => {
    const entityWithDice = {
      id: 'buff-shield',
      name: 'Shield',
      effects: [
        { target: 'ac.total', formula: '1d4+1', bonusType: 'shield' },
      ],
    };
    const diceLookup = (id: string) => (id === 'buff-shield' ? entityWithDice : undefined);

    const result: InjectBuffResult = {
      type: 'inject_entity',
      entityId: 'buff-shield',
      target: 'self',
      active: true,
    };

    const outcome = executeInjectEntity(result, {}, diceLookup);
    const effects = outcome.entity.effects as { formula: string }[];
    const formulaValue = Number(effects[0].formula);
    expect(formulaValue).toBeGreaterThanOrEqual(2);
    expect(formulaValue).toBeLessThanOrEqual(5);
  });

  it('throws error when entity not found', () => {
    const emptyLookup = () => undefined;
    expect(() => executeInjectEntity(makeResult(), {}, emptyLookup)).toThrow(
      'Entity not found: buff-mage-armor',
    );
  });

  it('preserves effects without dice', () => {
    const outcome = executeInjectEntity(makeResult(), {}, lookup);
    const effects = outcome.entity.effects as { formula: string }[];
    expect(effects[0].formula).toBe('4');
  });
});

describe('executeModifyHP', () => {
  it('rolls a simple formula and returns positive amount', () => {
    const result: HealResult = {
      type: 'heal',
      formula: '1d8 + 5',
      target: 'self',
    };
    const outcome = executeModifyHP(result, {});
    expect(outcome.type).toBe('modify_hp');
    expect(outcome.mode).toBe('heal');
    expect(outcome.amount).toBeGreaterThanOrEqual(6);
    expect(outcome.amount).toBeLessThanOrEqual(13);
  });

  it('substitutes params in formula', () => {
    const result: HealResult = {
      type: 'heal',
      formula: '1d8 + min(@param.casterLevel, 5)',
      target: 'self',
    };
    const outcome = executeModifyHP(result, { casterLevel: 5 });
    expect(outcome.amount).toBeGreaterThanOrEqual(6);
    expect(outcome.amount).toBeLessThanOrEqual(13);
  });

  it('mode is always heal', () => {
    const result: HealResult = {
      type: 'heal',
      formula: '1',
      target: 'self',
    };
    const outcome = executeModifyHP(result, {});
    expect(outcome.mode).toBe('heal');
  });
});

describe('executeDiceRoll', () => {
  it('rolls simple dice and returns result in range', () => {
    const result: DiceRollResult = {
      type: 'dice_roll',
      id: 'damage',
      label: 'Damage Roll',
      diceFormula: '2d6',
    };
    const outcome = executeDiceRoll(result, {});
    expect(outcome.type).toBe('dice_roll');
    expect(outcome.id).toBe('damage');
    expect(outcome.label).toBe('Damage Roll');
    expect(outcome.result).toBeGreaterThanOrEqual(2);
    expect(outcome.result).toBeLessThanOrEqual(12);
  });

  it('substitutes params in formula', () => {
    const result: DiceRollResult = {
      type: 'dice_roll',
      id: 'bonus',
      label: 'Bonus Roll',
      diceFormula: '1d6 + @param.bonus',
    };
    const outcome = executeDiceRoll(result, { bonus: 3 });
    expect(outcome.result).toBeGreaterThanOrEqual(4);
    expect(outcome.result).toBeLessThanOrEqual(9);
    expect(outcome.formula).toBe('1d6 + 3');
  });

  it('returns correct id and label from result', () => {
    const result: DiceRollResult = {
      type: 'dice_roll',
      id: 'initiative',
      label: 'Initiative',
      diceFormula: '1d20',
    };
    const outcome = executeDiceRoll(result, {});
    expect(outcome.id).toBe('initiative');
    expect(outcome.label).toBe('Initiative');
    expect(outcome.result).toBeGreaterThanOrEqual(1);
    expect(outcome.result).toBeLessThanOrEqual(20);
  });
});
