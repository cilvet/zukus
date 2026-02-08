import { DiceRollerImpl } from '../../rolls/DiceRoller/diceRoller';
import type { InjectBuffResult, ResolvedOutputs, InjectEntityOutcome } from '../types';

const DICE_NOTATION_REGEX = /\d+d\d+/;

export function executeInjectEntity(
  result: InjectBuffResult,
  outputValues: ResolvedOutputs,
  entityLookup: (id: string) => Record<string, unknown> | undefined,
): InjectEntityOutcome {
  const original = entityLookup(result.entityId);
  if (!original) {
    throw new Error(`Entity not found: ${result.entityId}`);
  }

  const entity: Record<string, unknown> = JSON.parse(JSON.stringify(original));

  for (const [key, value] of Object.entries(outputValues)) {
    entity[key] = value;
  }

  if (Array.isArray(entity.effects)) {
    const roller = new DiceRollerImpl();
    entity.effects = (entity.effects as Record<string, unknown>[]).map((effect) => {
      if (typeof effect.formula === 'string' && DICE_NOTATION_REGEX.test(effect.formula)) {
        const rolled = roller.roll(effect.formula);
        return { ...effect, formula: String(rolled.result) };
      }
      return effect;
    });
  }

  return { type: 'inject_entity', entity };
}
