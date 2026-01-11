import { rollExpressionHasDice } from "./rollExpressionHasDice";
import { MockDiceRoller } from "../MockDiceRoller";

const diceRoller = new MockDiceRoller();
const { roll } = diceRoller;

describe("rollExpressionHasDice", () => {
  const testCases = [
    { expression: "1 + 1", expected: false },
    { expression: "1d6", expected: true },
    { expression: "1 + (1d6 + 1d8) + 1d6", expected: true },
    { expression: "(1 + 1) * 2", expected: false },
    { expression: "(1d6 + 1) * 2", expected: true },
    { expression: "(1 * 5 + 2)d6", expected: true },
  ];

  testCases.forEach(({ expression, expected }) => {
    it(`should return ${expected} for the expression ${expression}`, () => {
      const rollExpression = roll(expression);
      const result = rollExpressionHasDice(rollExpression);
      expect(result).toEqual(expected);
    });
  });
});
