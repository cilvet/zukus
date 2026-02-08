import type { SubstitutionIndex } from '../character/calculation/sources/calculateSources';
import { normalizeFormula } from '../character/baseData/effects';
import { fillFormulaWithValues } from '../formulae/formula';
import { DiceRollerImpl } from '../rolls/DiceRoller/diceRoller';
import type { ActionOutput, ResolvedOutputs, ResolvedParams } from './types';

const diceRoller = new DiceRollerImpl();

export function resolveOutputs(
  outputs: ActionOutput[],
  resolvedParams: ResolvedParams,
): ResolvedOutputs {
  const result: ResolvedOutputs = {};

  const paramIndex: SubstitutionIndex = {};
  for (const [key, val] of Object.entries(resolvedParams)) {
    if (typeof val === 'number') {
      paramIndex[`param.${key}`] = val;
    }
  }

  for (const output of outputs) {
    const formula = normalizeFormula(output.formula);
    const filled = fillFormulaWithValues(formula, paramIndex);
    const rolled = diceRoller.roll(filled);
    result[output.targetField] = rolled.result;
  }

  return result;
}
