import { DiceRollerImpl } from '../../rolls/DiceRoller/diceRoller';
import { normalizeFormula } from '../../character/baseData/effects';
import { fillFormulaWithValues } from '../../formulae/formula';
import type { HealResult, ResolvedParams, ModifyHPOutcome } from '../types';

export function executeModifyHP(
  result: HealResult,
  resolvedParams: ResolvedParams,
): ModifyHPOutcome {
  const substitutionIndex: Record<string, number> = {};
  for (const [key, value] of Object.entries(resolvedParams)) {
    const numValue = typeof value === 'number' ? value : Number(value);
    if (!isNaN(numValue)) {
      substitutionIndex[`param.${key}`] = numValue;
    }
  }

  const formula = normalizeFormula(result.formula);
  const filled = fillFormulaWithValues(formula, substitutionIndex);

  const roller = new DiceRollerImpl();
  const rolled = roller.roll(filled);

  return {
    type: 'modify_hp',
    mode: 'heal',
    amount: Math.abs(rolled.result),
    formula: filled,
  };
}
