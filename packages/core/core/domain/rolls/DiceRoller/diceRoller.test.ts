import { SubstitutionExpressions } from "../expressionAnalysis/expressionAnalysis";
import { MockDiceRoller } from "./MockDiceRoller";

const diceRoller = new MockDiceRoller();
const { mockAllDiceRollsTo, mockDiceRolls, roll } = diceRoller;

describe("rollExpression", function () {
  
  describe("general expressions", function () {
    it("sums two regular values", () => {
      const result = roll("1 + 1").result;
      expect(result).toEqual(2);
    });
    it("rests negative values", () => {
      const result = roll("1 - 1").result;
      expect(result).toEqual(0);
    });
    it("divides two regular values", () => {
      const result = roll("1/2").result;
      expect(result).toEqual(0.5);
    });
    it("divides nested division", () => {
      const result = roll("1/2/2").result;
      expect(result).toEqual(0.25);
    });
    it("resolves division before multiplication", () => {
      const result = roll("1/2*4").result;
      expect(result).toEqual(2);
    });
    it("resolves parentheses correctly", () => {
      const result = roll("(1/2)").result;
      expect(result).toEqual(0.5);
    });
    it("resolves parentheses sum correctly", () => {
      const result = roll("(1/2) + (2/4)").result;
      expect(result).toEqual(1);
    });
    it("resolves parentheses multiplication correctly", () => {
      const result = roll("(1/2) * (2/4)").result;
      expect(result).toEqual(0.25);
    });
    it("resolves parentheses division correctly", () => {
      const result = roll("(1/2) / (2/4)").result;
      expect(result).toEqual(1);
    });
    it("resolves parentheses and sum correctly", () => {
      const result = roll("(1/2) * 3 + 1/4").result;
      expect(result).toEqual(1.75);
    });
  });

  describe("dice expressions", function () {
    mockAllDiceRollsTo(1)
    it("rolls expression with one dice", () => {
      const result = roll("1d4").result;
      expect(result).toEqual(1);
    });

    it("sums multiple dice expressions", () => {
      const result = roll("1d4 + 3d6 + 1d12").result;
      expect(result).toEqual(5);
    });

    it("calculates difference of two dice expression results correctly", () => {
      const result = roll("3d6 - 1d4").result;
      expect(result).toEqual(2);
    });

    it("calculates multiplication of two dice expression results correctly", () => {
      const result = roll("3d6 * 1d4").result;
      expect(result).toEqual(3);
    });

    it("calculates multiplication of two dice expression results correctly", () => {
      const result = roll("3d6 * 1d4").result;
      expect(result).toEqual(3);
    });

    it("calculates multiplication of two parentheses dice expression results correctly", () => {
      const result = roll("(3d6 + 7) * (1d4 + 2)").result;
      expect(result).toEqual(30);
    });

    it("keeps higher dice roll on a kh expression", () => {
      mockDiceRolls(1, 20);
      const result = roll("2d20kh").result;
      expect(result).toEqual(20);
    });
    it("drops higher and lower numbers", () => {
      mockDiceRolls(20, 1, 5, 5);
      const result = roll("4d20dhdl").result;
      expect(result).toEqual(10);
    });
    it("drops two lower numbers", () => {
      mockDiceRolls(20, 20, 1, 1);
      const result = roll("4d20dl2").result;
      expect(result).toEqual(40);
    });
    it("drops two highest numbers, keeps highest", () => {
      mockDiceRolls(20, 20, 19, 1);
      const result = roll("4d20dh2kh").result;
      expect(result).toEqual(19);
    });
    it("drops two highest, two lowest", () => {
      mockDiceRolls(20, 20, 10, 1, 1);
      const result = roll("5d20dh2dl2").result;
      expect(result).toEqual(10);
    });
    it("drops two highest, two lowest, keeps highest", () => {
      mockDiceRolls(20, 20, 10, 1, 1);
      const result = roll("5d20dh2dl2kh").result;
      expect(result).toEqual(10);
    });

    it("rolls selector expression with division correctly ", () => {
      mockDiceRolls(3, 2, 1)
      const result = roll("3d4kh2/2").result;
      expect(result).toEqual(2.5);
    });

    it("keeps higher roll in substitution expression", () => {
      const rollData = {
        expression:
          "2d20kh + @strengthModifier + @bab + @moraleBonus +@chaosBonus",
        extraData: {
          strengthModifier: { expression: "5" },
          bab: { expression: "10" },
          moraleBonus: { expression: "3" },
          chaosBonus: { expression: "2d6kh" },
        },
        expected: 44,
      };
      mockDiceRolls(20, 1, 6, 1)
      const result = roll(rollData.expression, rollData.extraData).result;
      expect(result).toEqual(rollData.expected);
    });

    it("rolls dice with parenthesis", () => {
      const result = roll("(1)d4").result;
      expect(result).toEqual(1);
    });

    it("rolls dice with parenthesis and extra elements", () => {
      const result = roll("(2)d4 + 1").result;
      expect(result).toEqual(3);
    });

    it("rolls dice with parenthesis and extra elements before", () => {
      const result = roll("1 + (2)d4").result;
      expect(result).toEqual(3);
    });

    it("rolls dice with complex values inside parenthesis", () => {
      const result = roll("(1 + 3*2)d4 + 1").result;
      expect(result).toEqual(8);
    });

    it("rolls dice with dynamic values inside parenthesis", () => {
      const result = roll("(@casterLevel)d6", {
        casterLevel: {
          expression: "10",
        },
      }).result;
      expect(result).toEqual(10);
    });
    it("rolls dice with random values inside parenthesis", () => {
      mockDiceRolls(2, 6, 6)
      const result = roll("(1d6)d6").result;
      expect(result).toEqual(12);
    });

    it("rolls dice with random values inside parenthesis on side of the dice", () => {
      mockDiceRolls(1)
      const result = roll("1d(6)").result;
      expect(result).toEqual(1);
    });

    it("rolls dice with random values inside parenthesis on side of the dice", () => {
      mockDiceRolls(1, 6)
      const result = roll("1d(1d6)").result;
      expect(result).toEqual(1);
    });
    
    it("rolls dice with parenthesis on both sides of the dice", () => {
      mockDiceRolls(1, 1, 1) 
      const result = roll("(3)d(6)").result;
      expect(result).toEqual(3); 
    });

    it("rolls complex dice expression with dice selectors", () => {
      mockDiceRolls(1, 2, 6)
      const result = roll("(3)d6kh").result;
      expect(result).toEqual(6);
    });

    it("rolls dynamic dice expression with selectors based on dice expression with selectors ", () => {
      mockDiceRolls(2, 2, 1, 6, 5, 3, 3)
      const result = roll("(3d2kh2)d6dl2").result;
      expect(result).toEqual(11);
    });
  });

  describe("complex expressions", () => {
    mockAllDiceRollsTo(1)
    const expressionsAndResults = [
      ["(3d6 + 5) * 1.5", 12],
      ["(3d6 + 5) * 2", 16],
      ["(3d6 + 5)/2 * 1.5", 6],
      ["(3d6 + 5)/2/2 * 1.5", 3],
      ["((3d6 + 5)/2)/2 * 1.5", 3],
      ["((3d6 + 5)/2)/2 * (1d20 + 2)", 6],
      ["((3d6 + 5)/2)/2 * (1d20 + 2)/2", 3],
      ["(4d6 + 1d6 + 3) * 1.5", 12],
      ["(4d6 + 1d6 + 3) * 2", 16],
      ["(4d6 + 1d6 + 3)/2 * 1.5", 6],
      ["(4d6 + 1d6 + 3)/2/2 * 1.5", 3],
      ["((4d6 + 1d6 + 3)/2)/2 * 1.5", 3],
      ["((4d6 + 1d6 + 3)/2)/2 * (1d20 + 2)", 6],
    ];
    expressionsAndResults.forEach((tuple) => {
      const expression = tuple[0];
      const expectedResult = tuple[1];
      it(`resolves '${expression}' to ${expectedResult}`, () => {
        expect(roll(expression as string).result).toEqual(expectedResult);
      });
    });
  });

  describe("substitution expressions", () => {
    const expressionsAndResults = [
      [
        "(3d6 + 5) * @twoHandedMultiplier",
        12,
        { twoHandedMultiplier: { expression: "1.5" } },
      ],
      [
        "(3d6 + 5) * @twoHandedMultiplier",
        16,
        { twoHandedMultiplier: { expression: "2" } },
      ],
      ["(@swordDamage) * 1.5", 9, { swordDamage: { expression: "1d6 + 5" } }],
      [
        "@swordDamage * 2",
        14,
        {
          swordDamage: { expression: "1d6 + 5 + @spellFireDamage" },
          spellFireDamage: { expression: "1d6" },
        },
      ],
      [
        "((@axeDamage + @strengthModifier) * 2 + @sonicDamage + @iceDamage) * 3",
        72,
        {
          axeDamage: { expression: "3d6 + @axeFireDamage" },
          axeFireDamage: { expression: "1d6" },
          strengthModifier: { expression: "5" },
          sonicDamage: { expression: "5d6" },
          iceDamage: { expression: "1d6" },
        },
      ],
    ];
    expressionsAndResults.forEach((tuple) => {
      const expression = tuple[0];
      const expectedResult = tuple[1];
      const substitutionExpressions = tuple[2];
      it(`resolves '${expression}' to ${expectedResult}`, () => {
        const rolledResult = roll(
          expression as string,
          substitutionExpressions as SubstitutionExpressions
        );
        expect(rolledResult.result).toEqual(expectedResult);
      });
    });
  });

  describe("functions", () => {

    it("calculates the minimum of two numbers", () => {
      const result = roll("min(5, 10)").result;
      expect(result).toEqual(5);
    });

    it("calculates the maximum of two numbers", () => {
      const result = roll("max(5, 10)").result;
      expect(result).toEqual(10);
    });

    it("rounds down a number", () => {
      const result = roll("floor(3.7)").result;
      expect(result).toEqual(3);
    });

    it("rounds up a number", () => {
      const result = roll("ceil(3.2)").result;
      expect(result).toEqual(4);
    });

    const nestedFunctionTests = [
      {
        expression: "min(6 + floor(max(@level - 11, 0) / 3), 9)", 
        extraData: { level: { expression: "10" } },
        expected: 6
      },
      {
        expression: "ceil(min(10, 8) / max(2, 1))", 
        expected: 4
      },
      {
        expression: "floor(max(3.7, min(2.3, 5.6)))", 
        expected: 3
      },
      {
        expression: "min(ceil(7.2), floor(9.8))", 
        expected: 8
      },
    ];

    nestedFunctionTests.forEach(({ expression, extraData, expected }) => {
      it(`calculates nested functions: ${expression}`, () => {
        const result = roll(expression, extraData).result;
        expect(result).toEqual(expected);
      });
    });
  });
});

function runXtimes(times: number, test: () => void) {
  for (let i of Array(times).keys()) {
    test();
  }
}
