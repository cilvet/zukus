import { randomInteger } from "../../../utils/random";
import { getResolvedRollExpression } from "../DiceRoller/diceRoller";
import { getRollExpression } from "../expressionAnalysis/expressionAnalysis";

const TIMES_TO_ROLL = 100000;

type AverageResult = {
  expression: string;
  average: number;
  timesRolled: number;
  timeSpent: number;
};

export function calculateAverage(expression: string): AverageResult {
  const startTime = Date.now();
  const processedExpression = getRollExpression(expression);
  let total = 0;
  for (let i = 0; i < TIMES_TO_ROLL; i++) {
    total += getResolvedRollExpression(processedExpression, randomInteger).result;
  }

  const endTime = Date.now();

  return {
    expression,
    average: total / TIMES_TO_ROLL,
    timesRolled: TIMES_TO_ROLL,
    timeSpent: endTime - startTime,
  };
}

const expression = "((4d6 + 1d6 + 3)/2)/2 * (1d20 + 2)";
const result = calculateAverage(expression);

console.log(`Average: ${result.average}`);
console.log(`Time spent: ${result.timeSpent}`);
console.log(`Times rolled: ${result.timesRolled}`);

