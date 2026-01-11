import { DiceRollerImpl } from "../diceRoller";
import {
  DiceRolledData,
  ResolvedRollComponent,
  ResolvedRollExpression,
  RollComponentType,
} from "../rollExpression";

export function getAllDiceFromResolvedExpression(
  resolvedExpression: ResolvedRollExpression
): DiceRolledData[] {
  return resolvedExpression.components
    .flatMap(extractDiceResults)
    .filter(Boolean)
    .reduce(unifyDiceResults, []);
}

export function extractDiceResults(component: ResolvedRollComponent) {
  const diceRolledData = component.result?.diceRolledData || [];
  if (component.type === RollComponentType.ROLL_EXPRESSION) {
    const allInternalDiceRolledData = getAllDiceFromResolvedExpression(
      component.value as ResolvedRollExpression
    );
    return [...diceRolledData, ...allInternalDiceRolledData];
  }

  return diceRolledData;
}

export function unifyDiceResults(
  previous: DiceRolledData[],
  current: DiceRolledData
) {
  const diceRolledData = previous.find(
    (data) => data.dice.sides === current.dice.sides
  );
  if (!diceRolledData) {
    return [...previous, current];
  }
  const allResults = [...diceRolledData.allResults, ...current.allResults];
  const keptResults = [...diceRolledData.keptResults, ...current.keptResults];
  const discardedResults = [
    ...diceRolledData.discardedResults,
    ...current.discardedResults,
  ];
  const totalResult = allResults.reduce(
    (previous, current) => previous + current,
    0
  );
  return [
    ...previous.filter((data) => data.dice.sides !== current.dice.sides),
    {
      dice: current.dice,
      allResults,
      keptResults,
      discardedResults,
      totalResult,
    },
  ];
}