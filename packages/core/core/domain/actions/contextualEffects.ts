import type { SubstitutionIndex } from '../character/calculation/sources/calculateSources';
import { normalizeFormula } from '../character/baseData/effects';
import { fillFormulaWithValues } from '../formulae/formula';
import { DiceRollerImpl } from '../rolls/DiceRoller/diceRoller';
import type {
  CompiledContextualEffects,
  ContextualEffectGroup,
  ContextualFields,
  ResolvedParams,
} from './types';

const diceRoller = new DiceRollerImpl();

export function compileContextualEffects(
  entities: ContextualFields[],
): CompiledContextualEffects {
  const all: ContextualEffectGroup[] = [];
  const byContext: Record<string, ContextualEffectGroup[]> = {};

  for (const entity of entities) {
    if (!entity.contextualEffects) continue;
    for (const group of entity.contextualEffects) {
      all.push(group);
      if (!byContext[group.context]) {
        byContext[group.context] = [];
      }
      byContext[group.context].push(group);
    }
  }

  return { all, byContext };
}

export function applyContextualEffects(
  resolvedParams: ResolvedParams,
  activeEffects: ContextualEffectGroup[],
  variableValues: Record<string, Record<string, number>>,
): ResolvedParams {
  const result: ResolvedParams = { ...resolvedParams };

  for (const group of activeEffects) {
    const paramIndex: SubstitutionIndex = {};
    for (const [key, val] of Object.entries(result)) {
      if (typeof val === 'number') {
        paramIndex[`param.${key}`] = val;
      }
    }

    const groupVars = variableValues[group.id];
    if (groupVars) {
      for (const [varId, varVal] of Object.entries(groupVars)) {
        paramIndex[varId] = varVal;
      }
    }

    for (const effect of group.effects) {
      if (!effect.target.startsWith('param.')) continue;
      const paramName = effect.target.slice('param.'.length);

      const formula = normalizeFormula(effect.formula);
      const filled = fillFormulaWithValues(formula, paramIndex);
      const rolled = diceRoller.roll(filled);

      const currentVal = typeof result[paramName] === 'number' ? (result[paramName] as number) : 0;
      result[paramName] = currentVal + rolled.result;
    }
  }

  return result;
}
