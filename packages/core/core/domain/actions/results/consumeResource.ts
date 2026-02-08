import { DiceRollerImpl } from '../../rolls/DiceRoller/diceRoller';
import { normalizeFormula } from '../../character/baseData/effects';
import { fillFormulaWithValues } from '../../formulae/formula';
import type { ConsumeResourceResult, ResolvedParams, ConsumeResourceOutcome } from '../types';

export function executeConsumeResource(
  result: ConsumeResourceResult,
  resolvedParams: ResolvedParams,
): ConsumeResourceOutcome {
  const rt = result.resourceType;

  if (rt.kind === 'cge_pool' || rt.kind === 'resource') {
    const substitutionIndex: Record<string, number> = {};
    for (const [key, value] of Object.entries(resolvedParams)) {
      const numValue = typeof value === 'number' ? value : Number(value);
      if (!isNaN(numValue)) {
        substitutionIndex[`param.${key}`] = numValue;
      }
    }

    const formula = normalizeFormula(rt.cost);
    const filled = fillFormulaWithValues(formula, substitutionIndex);

    const roller = new DiceRollerImpl();
    const rolled = roller.roll(filled);

    if (rt.kind === 'cge_pool') {
      return {
        type: 'consume_resource',
        resourceType: { kind: 'cge_pool', trackId: rt.trackId, cost: rolled.result },
      };
    }
    return {
      type: 'consume_resource',
      resourceType: { kind: 'resource', resourceId: rt.resourceId, cost: rolled.result },
    };
  }

  return { type: 'consume_resource', resourceType: rt };
}
