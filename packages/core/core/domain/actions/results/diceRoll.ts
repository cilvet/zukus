import { DiceRollerImpl } from '../../rolls/DiceRoller/diceRoller';
import { normalizeFormula } from '../../character/baseData/effects';
import { fillFormulaWithValues } from '../../formulae/formula';
import type { DiceRollResult, ResolvedParams, DiceRollOutcome } from '../types';

export function executeDiceRoll(
  result: DiceRollResult,
  resolvedParams: ResolvedParams,
): DiceRollOutcome {
  const substitutionIndex: Record<string, number> = {};
  for (const [key, value] of Object.entries(resolvedParams)) {
    const numValue = typeof value === 'number' ? value : Number(value);
    if (!isNaN(numValue)) {
      substitutionIndex[`param.${key}`] = numValue;
    }
  }

  const formula = normalizeFormula(result.diceFormula);
  const filled = fillFormulaWithValues(formula, substitutionIndex);

  const roller = new DiceRollerImpl();
  const rolled = roller.roll(filled);

  return {
    type: 'dice_roll',
    id: result.id,
    label: result.label,
    result: rolled.result,
    formula: filled,
  };
}
