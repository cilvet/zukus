import { fillFormulaWithValues, substituteExpression } from "../../../formulae/formula";
import { DiceRollerImpl } from "../../../rolls/DiceRoller/diceRoller";
import { Change, ContextualizedChange } from "../../baseData/changes";
import { Condition, SimpleCondition } from "../../baseData/conditions";
import { Source } from "../../calculatedSheet/sources";

export type SubstitutionIndex = Record<string, number>;

export function calculateSource<T extends Change>(
  change: ContextualizedChange<T>,
  substitutionIndex: SubstitutionIndex
): Source<T> {
  const conditionsMet =
    !change.conditions ||
    change.conditions.every((condition) => {
      return evaluateCondition(condition, substitutionIndex);
    });

  const expression = fillFormulaWithValues(
    change.formula,
    substitutionIndex
  );
  const rollValue = calculateValue(expression);
  return {
    totalValue: rollValue,
    ...change,
    ...(change.conditions && { unmetConditions: !conditionsMet }),
  };
}

const calculateValue = (expression: string) => {
  try {
    return new DiceRollerImpl().roll(expression).result;
  } catch (e) {
    return 0;
  }
};

/**
 * Evaluates a simple condition (numeric comparison between formulas).
 */
const evaluateSimpleCondition = (condition: SimpleCondition, index: SubstitutionIndex): boolean => {
  try {
    const diceRoller = new DiceRollerImpl();
    const firstValue = diceRoller.roll(
      substituteExpression(condition.firstFormula, index)
    ).result;
    const secondValue = diceRoller.roll(
      substituteExpression(condition.secondFormula, index)
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
    }
  } catch (e) {
    return false;
  }
};

/**
 * Evaluates a condition against the substitution index.
 * 
 * Note: In the character calculation context, we only support 'simple' conditions.
 * 'has_entity' conditions require character entities which are not available here.
 * If a 'has_entity' condition is used, it will always return false.
 */
const evaluateCondition = (condition: Condition, index: SubstitutionIndex): boolean => {
  if (condition.type === 'simple') {
    return evaluateSimpleCondition(condition, index);
  }
  
  if (condition.type === 'has_entity') {
    // has_entity conditions are not supported in character calculation context
    // because we don't have access to character entities here.
    // This should be evaluated at a higher level (levels system).
    console.warn('has_entity conditions are not supported in calculateSource. Use evaluateConditions from levels/conditions instead.');
    return false;
  }
  
  return false;
};
