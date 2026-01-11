import { MockDiceRoller } from "../MockDiceRoller";
import { DiceRollerImpl } from "../diceRoller";
import { getAllDiceFromResolvedExpression } from "./getAllDiceFromResolvedExpression";

const diceRoller = new MockDiceRoller();
const { roll, mockAllDiceRollsTo } = diceRoller;

describe("getAllDiceFromResolvedExpression", () => {
  it("returns all dice rolled data", () => {
    mockAllDiceRollsTo(1);
    const expression = roll("1 + (1d6 + 1d8) + 1d6");
    const result = getAllDiceFromResolvedExpression(expression);
    expect(result).toEqual([
      {
        dice: {
          sides: 8,
        },
        allResults: [1],
        keptResults: [1],
        discardedResults: [],
        totalResult: 1,
      },
      {
        dice: {
          sides: 6,
        },
        allResults: [1, 1],
        keptResults: [1, 1],
        discardedResults: [],
        totalResult: 2,
      },
    ]);
  });
});
