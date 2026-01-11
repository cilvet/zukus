import {
  separateOperators,
  splitAndKeepInArray,
  getComponentFromNumberSection,
  getComponentFromOperatorSection,
  getComponentFromParenthesesSection,
  getRollExpression,
  SubstitutionExpressions,
  getComponentFromSubstitutionSection,
} from "./expressionAnalysis";
import { regularDice } from "../dice";
import { getComponentFromDiceSection } from "./dice/diceExpressionAnalysis";
import { separateByEnclosingCharacters } from "./utils/expressionAnalysisUtils";
import { separateExpressionParentheses } from "./parentheses/parenthesesExpressionAnalysis";
import { RollComponentType, DiceExpression, Operator, RollComponent, Operation, RollExpression } from "../DiceRoller/rollExpression";

describe("Expression analysis", () => {
  const parenthesesInnerComponent = {
    text: "(1d4 + 1)",
    value: {
      type: RollComponentType.ROLL_EXPRESSION,
      value: {
        text: "1d4 + 1",
        components: [
          {
            type: RollComponentType.DICE_EXPRESSION,
            value: {
              dice: regularDice.d4,
              type: 'simple',
              amount: 1,
            } as DiceExpression,
          },
          {
            type: RollComponentType.OPERATOR,
            value: Operator.SUM,
          },
          {
            type: RollComponentType.NUMBER,
            value: 1,
          },
        ],
      } as RollExpression,
    } as RollComponent,
  };

  const sumComponent = {
    type: RollComponentType.OPERATOR,
    value: Operator.SUM,
  } as RollComponent;

  const multiplicationComponent = {
    type: RollComponentType.OPERATOR,
    value: Operator.MULTIPLICATION,
  } as RollComponent;

  describe("separateExpressionParentheses", () => {
    it("separates one parentheses", () => {
      const input = "(1d4 + 3) * 1.5";
      const expectedOutput = ["(1d4 + 3)", " * 1.5"];
      expect(separateExpressionParentheses(input)).toEqual(expectedOutput);
    });
    it("separates multiple parentheses", () => {
      const input = "(1d4 + 3) * 1.5 + (1d4 + 2)";
      const expectedOutput = ["(1d4 + 3)", " * 1.5 + ", "(1d4 + 2)"];
      expect(separateExpressionParentheses(input)).toEqual(expectedOutput);
    });
    it("doesn't separate inner parentheses", () => {
      const input = "(1d4 + 3) * 1.5 + (1d4 + (2d10 + 2)*2)";
      const expectedOutput = ["(1d4 + 3)", " * 1.5 + ", "(1d4 + (2d10 + 2)*2)"];
      expect(separateExpressionParentheses(input)).toEqual(expectedOutput);
    });
    it('throws error if there is a ")" without a "("', () => {
      const input = "(1d4 + 3) * 1.5 + (1d4 + 2d10 + 2)*2)";
      expect(() => separateExpressionParentheses(input)).toThrow();
    });
    it('throws error if there is a "(" without a ")"', () => {
      const input = "(1d4 + 3) * 1.5 + (1d4 + (2d10 + 2)*2";
      expect(() => separateExpressionParentheses(input)).toThrow();
    });
  });
  describe("separateByEnclosingCharacters", () => {
    it("doesn't separate inner instances", () => {
      const input = "[1d4 + 3] * 1.5 + [1d4 + [2d10 + 2]*2]";
      const expectedOutput = ["[1d4 + 3]", " * 1.5 + ", "[1d4 + [2d10 + 2]*2]"];
      expect(separateByEnclosingCharacters(input, "[", "]")).toEqual(
        expectedOutput
      );
    });
  });
  describe("separateOperators", () => {
    it("separates operators", () => {   
      const input = "* 2 + 3d6";
      const expectedOutput = ["*", "2", "+", "3d6"];
      expect(separateOperators(input)).toEqual(expectedOutput);
    });
  });
  describe("splitAndKeepInArray", () => {
    it("splits string and keeps split value in array", () => {
      const input = "hola-buenas";
      const splitValue = "-";
      const expectedOutput = ["hola", "-", "buenas"];
      expect(splitAndKeepInArray(input, splitValue)).toEqual(expectedOutput);
    });
    it("doesn't keep empty strings in array", () => {
      const input = "hola-";
      const splitValue = "-";
      const expectedOutput = ["hola", "-"];
      expect(splitAndKeepInArray(input, splitValue)).toEqual(expectedOutput);
    });
    it("doesn't keep only spaces in array", () => {
      const input = "hola- ";
      const splitValue = "-";
      const expectedOutput = ["hola", "-"];
      expect(splitAndKeepInArray(input, splitValue)).toEqual(expectedOutput);
    });
  });
  describe("getComponentFromDiceSection", () => {
    it("creates component from dice section", () => {
      const input = "1d4";
      const expectedOutput = {
        type: RollComponentType.DICE_EXPRESSION,
        value: {
          type: 'simple',
          amount: 1,
          dice: regularDice.d4,
        } as DiceExpression,
      } as RollComponent;
      expect(getComponentFromDiceSection(input)).toEqual(expectedOutput);
    });
    it("creates component from dice section with extra spaces", () => {
      const input = "  1d4   ";
      const expectedOutput = {
        type: RollComponentType.DICE_EXPRESSION,
        value: {
          type: 'simple',
          amount: 1,
          dice: regularDice.d4,
        } as DiceExpression,
      } as RollComponent;
      expect(getComponentFromDiceSection(input)).toEqual(expectedOutput);
    });
  });
  describe("getComponentFromNumberSection", () => {
    it("creates component from number section", () => {
      const input = "1";
      const expectedOutput = {
        type: RollComponentType.NUMBER,
        value: 1,
      } as RollComponent;
      expect(getComponentFromNumberSection(input)).toEqual(expectedOutput);
    });
    it("creates component from number section with extra spaces", () => {
      const input = "  1    ";
      const expectedOutput = {
        type: RollComponentType.NUMBER,
        value: 1,
      } as RollComponent;
      expect(getComponentFromNumberSection(input)).toEqual(expectedOutput);
    });
  });
  describe("getComponentFromOperatorSection", () => {
    it("creates component from operator section", () => {
      const input = "+";
      const expectedOutput = sumComponent;
      expect(getComponentFromOperatorSection(input)).toEqual(expectedOutput);
    });
  });
  describe("getComponentFromParenthesesSection", () => {
    it("creates full RollExpression component from parentheses section", () => {
      const input = parenthesesInnerComponent.text;
      const expectedOutput = parenthesesInnerComponent.value;
      expect(getComponentFromParenthesesSection(input)).toEqual(expectedOutput);
    });
  });
  describe("getComponentFromSubstitutionSection", () => {
    it("creates component from substitution section", () => {
      const input = "@smite";
      const substitutionExpressions = {
        smite: {
          expression: "1d4",
          extraData: {
            type: "smite",
          },
        },
      } as SubstitutionExpressions;
      const expectedOutput = {
        type: RollComponentType.DICE_EXPRESSION,
        value: {
          type: 'simple',
          amount: 1,
          dice: regularDice.d4,
        } as DiceExpression,
        extraData: {
          type: "smite",
        },
      } as RollComponent;
      expect(
        getComponentFromSubstitutionSection(input, substitutionExpressions)
      ).toEqual(expectedOutput);
    });
  });
  describe("getRollExpression", () => {
    it("creates correct roll expression from text input", () => {
      const input = "(1d4 + 1) * 2 + 3d6";
      const expectedOutput = {
        text: input,
        components: [
          {
            type: RollComponentType.OPERATION,
            value: {
              operator: Operator.MULTIPLICATION,
              firstOperand: parenthesesInnerComponent.value,
              secondOperand: {
                type: RollComponentType.NUMBER,
                value: 2,
              },
            } as Operation,
          },
          sumComponent,
          {
            type: RollComponentType.DICE_EXPRESSION,
            value: {
              type: 'simple',
              dice: regularDice.d6,
              amount: 3,
            },
          },
        ],
      } as RollExpression;
      const rollExpression = getRollExpression(input);
      expect(rollExpression).toEqual(expectedOutput);
    });
    it("creates correct roll expression from text input - division", () => {
      const input = "(1d4 + 1) / 2 + 3d6";
      const expectedOutput = {
        text: input,
        components: [
          {
            type: RollComponentType.OPERATION,
            value: {
              operator: Operator.DIVISION,
              firstOperand: parenthesesInnerComponent.value,
              secondOperand: {
                type: RollComponentType.NUMBER,
                value: 2,
              },
            } as Operation,
          },
          sumComponent,
          {
            type: RollComponentType.DICE_EXPRESSION,
            value: {
              type: 'simple',
              dice: regularDice.d6,
              amount: 3,
            },
          },
        ],
      } as RollExpression;
      const rollExpression = getRollExpression(input);
      expect(rollExpression).toEqual(expectedOutput);
    });
    it("creates correct roll expression from text input - division", () => {
      const input = "1/2 + 3d6";
      const expectedOutput = {
        text: input,
        components: [
          {
            type: RollComponentType.OPERATION,
            value: {
              operator: Operator.DIVISION,
              firstOperand: {
                type: RollComponentType.NUMBER,
                value: 1,
              },
              secondOperand: {
                type: RollComponentType.NUMBER,
                value: 2,
              },
            } as Operation,
          },
          sumComponent,
          {
            type: RollComponentType.DICE_EXPRESSION,
            value: {
              type: 'simple',
              dice: regularDice.d6,
              amount: 3,
            },
          },
        ],
      } as RollExpression;
      const rollExpression = getRollExpression(input);
      expect(rollExpression).toEqual(expectedOutput);
    });
    it("creates nested divison in correct order", () => {
      const input = "1/2/2 + 3d6";
      const expectedOutput = {
        text: input,
        components: [
          {
            type: RollComponentType.OPERATION,
            value: {
              operator: Operator.DIVISION,
              firstOperand: {
                type: RollComponentType.OPERATION,
                value: {
                  operator: Operator.DIVISION,
                  firstOperand: {
                    type: RollComponentType.NUMBER,
                    value: 1,
                  },
                  secondOperand: {
                    type: RollComponentType.NUMBER,
                    value: 2,
                  },
                } as Operation,
              },
              secondOperand: {
                type: RollComponentType.NUMBER,
                value: 2,
              },
            } as Operation,
          },
          sumComponent,
          {
            type: RollComponentType.DICE_EXPRESSION,
            value: {
              type: 'simple',
              dice: regularDice.d6,
              amount: 3,
            },
          },
        ],
      } as RollExpression;
      const rollExpression = getRollExpression(input);
      expect(rollExpression).toEqual(expectedOutput);
    });
    it("creates correct components when substitution expressions are provided", () => {
      const input = "@swordAttack + @fireDamage + 3";
      const substitutionExpressions = {
        swordAttack: {
          expression: "1d6 + 4",
          extraData: {
            description: "Sword attack",
            damageType: "slashing",
          },
        },
        fireDamage: {
          expression: "1d6",
          extraData: {
            description: "Fire damage",
            damageType: "fire",
          },
        },
      } as SubstitutionExpressions;
      const expectedOutput = {
        text: input,
        components: [
          {
            type: RollComponentType.ROLL_EXPRESSION,
            value: {
              text: "1d6 + 4",
              components: [
                {
                  type: RollComponentType.DICE_EXPRESSION,
                  value: {
                    type: 'simple',
                    dice: regularDice.d6,
                    amount: 1,
                  },
                },
                sumComponent,
                {
                  type: RollComponentType.NUMBER,
                  value: 4,
                },
              ],
            },
            extraData: {
              damageType: "slashing",
              description: "Sword attack",
            },
          },
          sumComponent,
          {
            type: RollComponentType.DICE_EXPRESSION,
            value: {
              type: 'simple',
              dice: regularDice.d6,
              amount: 1,
            },
            extraData: {
              damageType: "fire",
              description: "Fire damage",
            },
          },
          sumComponent,
          {
            type: RollComponentType.NUMBER,
            value: 3,
          },
        ],
      } as RollExpression;

      const rollExpression = getRollExpression(input, substitutionExpressions);
      expect(rollExpression).toEqual(expectedOutput);
    });
    it("creates dynamic dice component correctly", () => {
      const input = "(@someDynamicValue)d6";
      const substitutionExpressions: SubstitutionExpressions = {
        someDynamicValue: {
          expression: "5",
        },
      };
      const expectedOutput: RollExpression = {
        text: input,
        components: [
          {
            type: RollComponentType.DICE_EXPRESSION,
            value: {
              dice: regularDice.d6,
              type: 'complex',
              amount: {
                components: [
                  {
                    type: RollComponentType.NUMBER,
                    value: 5,
                  },
                ],
                text: "@someDynamicValue",
              }
            },
          },
        ],
      };
      const rollExpression = getRollExpression(input, substitutionExpressions);
      expect(rollExpression).toEqual(expectedOutput);
    });
  });
});
