import { fillFormulaWithValues } from "../../../formulae/formula";
import { DiceRollerImpl } from "../../../rolls/DiceRoller/diceRoller";
import { BonusTypes } from "../../baseData/changes";
import { Condition, SimpleCondition } from "../../baseData/conditions";
import {
  normalizeFormula,
  SourcedEffect,
} from "../../baseData/effects";
import { SourceValue } from "../../calculatedSheet/sources";
import { SubstitutionIndex } from "../sources/calculateSources";
import { SourceValueSum } from "../sources/sumSources";

// =============================================================================
// EFFECT SOURCE - A calculated effect ready to be applied
// =============================================================================

/**
 * An effect that has been calculated and is ready to be merged with sources.
 */
export type CalculatedEffect = {
  totalValue: number;
  bonusType: string;
  sourceRef: string;
  sourceName: string;
  conditionsMet: boolean;
};

// =============================================================================
// CALCULATE EFFECT
// =============================================================================

/**
 * Calculates an effect's value using the substitution index.
 */
export function calculateEffect(
  effect: SourcedEffect,
  substitutionIndex: SubstitutionIndex
): CalculatedEffect {
  const formula = normalizeFormula(effect.formula);
  const expression = fillFormulaWithValues(formula, substitutionIndex);

  let totalValue = 0;
  try {
    totalValue = new DiceRollerImpl().roll(expression).result;
  } catch (e) {
    console.warn(`Failed to calculate effect formula: ${expression}`, e);
  }

  const conditionsMet =
    !effect.conditions ||
    effect.conditions.every((condition) =>
      evaluateCondition(condition, substitutionIndex)
    );

  return {
    totalValue,
    bonusType: effect.bonusType ?? "UNTYPED",
    sourceRef: effect.sourceRef,
    sourceName: effect.sourceName,
    conditionsMet,
  };
}

/**
 * Evaluates a condition against the substitution index.
 */
function evaluateCondition(
  condition: Condition,
  index: SubstitutionIndex
): boolean {
  if (condition.type === "simple") {
    return evaluateSimpleCondition(condition, index);
  }

  // has_entity and other conditions are not supported in effect calculation
  console.warn(
    `Condition type '${condition.type}' is not supported in effect calculation.`
  );
  return false;
}

/**
 * Evaluates a simple numeric comparison condition.
 */
function evaluateSimpleCondition(
  condition: SimpleCondition,
  index: SubstitutionIndex
): boolean {
  try {
    const diceRoller = new DiceRollerImpl();
    const substituteExpression = (expr: string) =>
      expr.replace(/@([a-zA-Z0-9._-]+)/g, (_, key) => {
        const value = index[key];
        return value !== undefined ? value.toString() : "0";
      });

    const firstValue = diceRoller.roll(
      substituteExpression(condition.firstFormula)
    ).result;
    const secondValue = diceRoller.roll(
      substituteExpression(condition.secondFormula)
    ).result;

    switch (condition.operator) {
      case "==":
        return firstValue === secondValue;
      case "!=":
        return firstValue !== secondValue;
      case "<":
        return firstValue < secondValue;
      case ">":
        return firstValue > secondValue;
      case "<=":
        return firstValue <= secondValue;
      case ">=":
        return firstValue >= secondValue;
      default:
        return false;
    }
  } catch (e) {
    return false;
  }
}

// =============================================================================
// FILTER EFFECTS BY TARGET
// =============================================================================

/**
 * Filters effects by their target path.
 * Supports exact matches and wildcard patterns like "ability.*"
 *
 * @param effects Array of sourced effects
 * @param targetPattern The target pattern to match (e.g., "size.total", "ability.*")
 * @returns Filtered effects that match the target pattern
 */
export function filterEffectsByTarget(
  effects: SourcedEffect[],
  targetPattern: string
): SourcedEffect[] {
  // Check for wildcard pattern
  if (targetPattern.endsWith(".*")) {
    const prefix = targetPattern.slice(0, -2);
    return effects.filter((effect) => effect.target.startsWith(prefix + "."));
  }

  // Exact match
  return effects.filter((effect) => effect.target === targetPattern);
}

// =============================================================================
// APPLY EFFECTS TO SOURCE VALUES
// =============================================================================

/**
 * Default bonus type configuration.
 * Bonus types not in this map will be treated as non-stacking.
 */
const DEFAULT_STACKING_RULES: Record<string, boolean> = {
  UNTYPED: true,
  DODGE: true,
  CIRCUMSTANCE: true,
  BASE: true,
};

/**
 * Checks if a bonus type stacks with itself.
 */
function bonusTypeStacksWithSelf(
  bonusType: string,
  customStackingRules?: Record<string, boolean>
): boolean {
  const rules = customStackingRules ?? DEFAULT_STACKING_RULES;
  return rules[bonusType] ?? false;
}

/**
 * Converts calculated effects to source values and applies stacking rules.
 *
 * @param calculatedEffects Array of calculated effects
 * @param customStackingRules Optional custom stacking rules
 * @returns Object with total and individual source values
 */
export function effectsToSourceValues(
  calculatedEffects: CalculatedEffect[],
  customStackingRules?: Record<string, boolean>
): SourceValueSum {
  // Filter out effects that don't meet conditions or have zero value
  const validEffects = calculatedEffects.filter(
    (effect) => effect.conditionsMet && effect.totalValue !== 0
  );

  // Group by bonus type
  const byBonusType: Record<string, CalculatedEffect[]> = {};
  validEffects.forEach((effect) => {
    if (!byBonusType[effect.bonusType]) {
      byBonusType[effect.bonusType] = [];
    }
    byBonusType[effect.bonusType].push(effect);
  });

  // Apply stacking rules and create source values
  const sourceValues: SourceValue[] = [];
  let total = 0;

  Object.entries(byBonusType).forEach(([bonusType, effects]) => {
    const stacksWithSelf = bonusTypeStacksWithSelf(bonusType, customStackingRules);

    // Sort by value descending (highest first)
    const sortedEffects = effects.sort((a, b) => b.totalValue - a.totalValue);

    sortedEffects.forEach((effect, index) => {
      const isRelevant = stacksWithSelf || index === 0;

      sourceValues.push({
        value: effect.totalValue,
        // Cast to BonusTypes for compatibility with existing system
        // In the future, SourceValue.bonusTypeId should be string
        bonusTypeId: bonusType as BonusTypes,
        relevant: isRelevant,
        sourceName: effect.sourceName,
        sourceUniqueId: effect.sourceRef,
      });

      if (isRelevant) {
        total += effect.totalValue;
      }
    });
  });

  return { total, sourceValues };
}

// =============================================================================
// MERGE EFFECTS WITH EXISTING SOURCE VALUES
// =============================================================================

/**
 * Merges effect source values with existing source values,
 * applying stacking rules across both.
 *
 * @param existingSourceValueSum Existing calculated source values
 * @param effectSourceValueSum Effect source values to merge
 * @param customStackingRules Optional custom stacking rules
 * @returns Combined source values with updated totals
 */
export function mergeEffectsWithSources(
  existingSourceValueSum: SourceValueSum,
  effectSourceValueSum: SourceValueSum,
  customStackingRules?: Record<string, boolean>
): SourceValueSum {
  // Combine all source values
  const allSourceValues = [
    ...existingSourceValueSum.sourceValues,
    ...effectSourceValueSum.sourceValues,
  ];

  // Re-apply stacking rules across all sources
  const byBonusType: Record<string, SourceValue[]> = {};
  allSourceValues.forEach((sv) => {
    if (!byBonusType[sv.bonusTypeId]) {
      byBonusType[sv.bonusTypeId] = [];
    }
    byBonusType[sv.bonusTypeId].push(sv);
  });

  const finalSourceValues: SourceValue[] = [];
  let total = 0;

  Object.entries(byBonusType).forEach(([bonusType, sourceValuesOfType]) => {
    const stacksWithSelf = bonusTypeStacksWithSelf(bonusType, customStackingRules);

    // Sort by value descending
    const sorted = sourceValuesOfType.sort((a, b) => b.value - a.value);

    sorted.forEach((sv, index) => {
      const isRelevant = stacksWithSelf || index === 0;

      finalSourceValues.push({
        ...sv,
        relevant: isRelevant,
      });

      if (isRelevant) {
        total += sv.value;
      }
    });
  });

  return { total, sourceValues: finalSourceValues };
}


