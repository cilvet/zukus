import type { Effect, EffectFormula } from '../../character/baseData/effects';
import type { Condition, SimpleCondition } from '../../character/baseData/conditions';
import type { StandardEntity } from '../types/base';

// =============================================================================
// ENTITY PLACEHOLDER RESOLUTION
// =============================================================================

/**
 * Resolves @entity.X placeholders in a string using values from the entity.
 *
 * @param str The string potentially containing @entity.X placeholders
 * @param entity The entity to read values from
 * @returns The string with placeholders replaced by entity values
 *
 * @example
 * resolveEntityPlaceholders('@entity.casterLevel', { casterLevel: 6 }) // "6"
 * resolveEntityPlaceholders('2 + @entity.bonus', { bonus: 4 }) // "2 + 4"
 */
export function resolveEntityPlaceholders(
  str: string,
  entity: StandardEntity
): string {
  return str.replace(/@entity\.([a-zA-Z0-9_.]+)/g, (match, path: string) => {
    const value = getValueByPath(entity, path);

    if (value === undefined || value === null) {
      // Return 0 for undefined values to avoid formula errors
      return '0';
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }

    // For objects/arrays, return 0 (can't use in formulas)
    return '0';
  });
}

/**
 * Gets a value from an object by dot-notation path.
 *
 * @example
 * getValueByPath({ foo: { bar: 5 } }, 'foo.bar') // 5
 * getValueByPath({ casterLevel: 6 }, 'casterLevel') // 6
 */
function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

// =============================================================================
// EFFECT PLACEHOLDER RESOLUTION
// =============================================================================

/**
 * Resolves @entity.X placeholders in an Effect's formula and conditions.
 *
 * @param effect The effect to resolve
 * @param entity The entity to read values from
 * @returns A new Effect with placeholders resolved
 */
export function resolveEffectEntityPlaceholders(
  effect: Effect,
  entity: StandardEntity
): Effect {
  // Resolve formula
  const resolvedFormula = resolveFormulaPlaceholders(effect.formula, entity);

  // Resolve conditions if present
  const resolvedConditions = effect.conditions
    ? effect.conditions.map((c) => resolveConditionPlaceholders(c, entity))
    : undefined;

  return {
    ...effect,
    formula: resolvedFormula,
    ...(resolvedConditions && { conditions: resolvedConditions }),
  };
}

/**
 * Resolves placeholders in a formula (string, NormalFormula, or SwitchFormula).
 */
function resolveFormulaPlaceholders(
  formula: EffectFormula,
  entity: StandardEntity
): EffectFormula {
  // String formula
  if (typeof formula === 'string') {
    return resolveEntityPlaceholders(formula, entity);
  }

  // Cast to any to handle all formula types uniformly
  const f = formula as Record<string, unknown>;

  // Switch formula - resolve all string fields
  if (f.type === 'switch') {
    const switchExpression = f.switchExpression as string;
    const cases = f.cases as Array<{
      caseValue: string;
      operator: string;
      resultExpression: string;
    }>;
    const defaultValue = f.defaultValue as string;

    return {
      ...formula,
      switchExpression: resolveEntityPlaceholders(switchExpression, entity),
      cases: cases.map((c) => ({
        ...c,
        caseValue: resolveEntityPlaceholders(c.caseValue, entity),
        resultExpression: resolveEntityPlaceholders(c.resultExpression, entity),
      })),
      defaultValue: resolveEntityPlaceholders(defaultValue, entity),
    } as EffectFormula;
  }

  // Normal formula - resolve the expression
  if (typeof f.expression === 'string') {
    return {
      ...formula,
      expression: resolveEntityPlaceholders(f.expression, entity),
    } as EffectFormula;
  }

  // Unknown formula type - return as-is
  return formula;
}

/**
 * Resolves placeholders in a Condition.
 */
function resolveConditionPlaceholders(
  condition: Condition,
  entity: StandardEntity
): Condition {
  if (condition.type !== 'simple') {
    return condition;
  }

  const simpleCondition = condition as SimpleCondition;

  return {
    ...simpleCondition,
    firstFormula: resolveEntityPlaceholders(simpleCondition.firstFormula, entity),
    secondFormula: resolveEntityPlaceholders(simpleCondition.secondFormula, entity),
  };
}
