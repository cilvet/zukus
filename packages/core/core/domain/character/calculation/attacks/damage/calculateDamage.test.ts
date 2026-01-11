import { calculateDamage, getDiceTypeTransformation } from "./calculateDamage";
import { DamageFormula } from "../../../calculatedSheet/attacks/damage/damageFormula";
import { DamageResult } from "../../../calculatedSheet/attacks/damage/damageResult";
import { MockDiceRoller } from "../../../../rolls/DiceRoller/MockDiceRoller";
import { applyTransformationToDiceInExpression } from "../../../../rolls/DiceRoller/diceModifications/applyDiceModifications";

const mockDiceRoller = new MockDiceRoller();
mockDiceRoller.mockAllDiceRollsTo(1);

function getDamageFormula(): DamageFormula {
  const damageFormula: DamageFormula = {
    type: "complex",
    name: "Sword",
    baseDamage: {
      name: "Sword damage",
      type: "simple",
      formula: {
        expression: "1d10",
      },
      damageType: {
        type: "basic",
        damageType: "slashing",
      },
    },
    additionalDamageSections: [
      {
        name: "Dex bonus",
        type: "simple",
        formula: {
          expression: "6",
        },
      },
      {
        name: "Weapon specialization",
        type: "simple",
        formula: {
          expression: "2",
        },
      },
      {
        name: "Int bonus",
        type: "simple",
        formula: {
          expression: "5",
        },
        damageType: {
          type: "basic",
          damageType: "precision",
        },
      },
      {
        name: "Bardic inspiration - Zanya",
        type: "simple",
        formula: {
          expression: "5d6",
        },
        damageType: {
          type: "basic",
          damageType: "sonic",
        },
      },
    ],
  };
  return damageFormula;
}

describe("calculateDamage", () => {
  it("should calculate the correct total damage", () => {
    const damageFormula = getDamageFormula();
    const expectedResult: DamageResult = {
      totalDamage: 19,
      damageSections: [
        {
          name: "Sword damage",
          totalDamage: 1,
          originalExpression: "1d10",
          damageTypeResults: [
            {
              damageTypeId: "slashing",
              damageType: { type: "basic", damageType: "slashing" },
              totalDamage: 1,
            },
          ],
          diceResults: [
            {
              dice: { sides: 10 },
              allResults: [1],
              keptResults: [1],
              discardedResults: [],
              totalResult: 1,
            },
          ],
        },
        {
          name: "Dex bonus",
          totalDamage: 6,
          originalExpression: "6",
          damageTypeResults: [],
          inheritedTypeDamage: 6,
        },
        {
          name: "Weapon specialization",
          totalDamage: 2,
          originalExpression: "2",
          damageTypeResults: [],
          inheritedTypeDamage: 2,
        },
        {
          name: "Int bonus",
          totalDamage: 5,
          originalExpression: "5",
          damageTypeResults: [
            {
              damageTypeId: "precision",
              damageType: { type: "basic", damageType: "precision" },
              totalDamage: 5,
            },
          ],
        },
        {
          name: "Bardic inspiration - Zanya",
          totalDamage: 5,
          originalExpression: "5d6",
          damageTypeResults: [
            {
              damageTypeId: "sonic",
              damageType: { type: "basic", damageType: "sonic" },
              totalDamage: 5,
            },
          ],
          diceResults: [
            {
              dice: { sides: 6 },
              allResults: [1, 1, 1, 1, 1],
              keptResults: [1, 1, 1, 1, 1],
              discardedResults: [],
              totalResult: 5,
            },
          ],
        },
      ],
      damageTypeResults: [
        {
          damageTypeId: "slashing",
          damageType: { type: "basic", damageType: "slashing" },
          totalDamage: 9,
        },
        {
          damageTypeId: "precision",
          damageType: { type: "basic", damageType: "precision" },
          totalDamage: 5,
        },
        {
          damageTypeId: "sonic",
          damageType: { type: "basic", damageType: "sonic" },
          totalDamage: 5,
        },
      ],
    };

    const result = calculateDamage(damageFormula, mockDiceRoller);
    expect(result).toEqual(expectedResult);
  });

  it("should calculate the correct total damage with damage for gorwin", () => {
    const gorwinDamageFormula: DamageFormula = {
      name: "Bow damage",
      type: "complex",
      baseDamage: {
        name: "Bow damage",
        type: "simple",
        formula: {
          expression: "2d8",
        },
        damageType: {
          type: "halfAndHalf",
          firstDamageType: "piercing",
          secondDamageType: "electric",
        },
      },
      additionalDamageSections: [
        {
          name: "Dex bonus",
          type: "simple",
          formula: {
            expression: "6",
          },
        },
        {
          name: "Int bonus",
          type: "simple",
          formula: {
            expression: "5",
          },
        },
        {
          name: "Azote de magos",
          type: "simple",
          formula: {
            expression: "2d6",
          },
        },
      ],
    };

    const expectedResult: DamageResult = {
      totalDamage: 15,
      damageSections: [
        {
          name: "Bow damage",
          totalDamage: 2,
          originalExpression: "2d8",
          damageTypeResults: [
            {
              damageTypeId: "half-piercing-half-electric",
              damageType: {
                type: "halfAndHalf",
                firstDamageType: "piercing",
                secondDamageType: "electric",
              },
              totalDamage: 2,
            },
          ],
          diceResults: [
            {
              dice: { sides: 8 },
              allResults: [1, 1],
              keptResults: [1, 1],
              discardedResults: [],
              totalResult: 2,
            },
          ],
        },
        {
          name: "Dex bonus",
          totalDamage: 6,
          originalExpression: "6",
          damageTypeResults: [],
          inheritedTypeDamage: 6,
        },
        {
          name: "Int bonus",
          totalDamage: 5,
          originalExpression: "5",
          damageTypeResults: [],
          inheritedTypeDamage: 5,
        },
        {
          name: "Azote de magos",
          totalDamage: 2,
          originalExpression: "2d6",
          damageTypeResults: [],
          diceResults: [
            {
              dice: { sides: 6 },
              allResults: [1, 1],
              keptResults: [1, 1],
              discardedResults: [],
              totalResult: 2,
            },
          ],
          inheritedTypeDamage: 2,
        },
      ],
      damageTypeResults: [
        {
          damageTypeId: "piercing",
          damageType: { type: "basic", damageType: "piercing" },
          totalDamage: 8,
        },
        {
          damageTypeId: "electric",
          damageType: { type: "basic", damageType: "electric" },
          totalDamage: 7,
        },
      ],
    };

    const result = calculateDamage(gorwinDamageFormula, mockDiceRoller);
    expect(result).toEqual(expectedResult);
  });
});

describe("applyDiceModifications", () => {
  it("should replace dice with the same number of sides", () => {
    const expectedResult = {
      components: [
        {
          type: "DICE_EXPRESSION",
          value: { dice: { sides: 8 }, type: "simple", amount: 1 },
        },
        { type: "OPERATOR", value: "+" },
        {
          type: "ROLL_EXPRESSION",
          value: {
            components: [
              {
                type: "OPERATION",
                value: {
                  operator: "*",
                  firstOperand: {
                    type: "DICE_EXPRESSION",
                    value: { dice: { sides: 8 }, type: "simple", amount: 1 },
                  },
                  secondOperand: { type: "NUMBER", value: 4 },
                },
              },
            ],
            text: "1d6 * 4",
          },
        },
      ],
      text: "1d6 + (1d6 * 4)",
    };
    const exampleFormula = "1d6 + (1d6 * 4)";
    const mockDiceRoller = new MockDiceRoller();

    const rollExpression = mockDiceRoller.getRollExpression(exampleFormula);
    const transformD6toD8 = getDiceTypeTransformation(
      { sides: 6 },
      { sides: 8 }
    );

    const modifiedExpression = applyTransformationToDiceInExpression(
      rollExpression,
      transformD6toD8
    );

    expect(modifiedExpression).toEqual(expectedResult);


  });

  it("should multiply damage in simple damage sections", () => {
    const damageFormula: DamageFormula = {
      name: 'Melee attack',
      type: 'complex',
      baseDamage: {
        name: 'Weapon damage',
        type: 'complex',
        baseDamage: {
          name: 'Sword damage',
          type: 'simple',
          formula: { expression: '1d10' },
          damageType: { type: 'basic', damageType: 'slashing' },
          damageModifications: []
        },
        additionalDamageSections: [],
        damageModifications: []
      },
      additionalDamageSections: [
        {
          name: 'Base ability damage',
          type: 'simple',
          formula: { expression: '5' },
          damageModifications: [ { type: 'multiplyAllDamage', multiplier: 1.5 } ]
        }
      ]
    }

    const expectedResult: DamageResult = {
      totalDamage: 8,
      damageSections: [
        {
          name: 'Sword damage',
          totalDamage: 1,
          originalExpression: '1d10',
          damageTypeResults: [
            {
              damageTypeId: 'slashing',
              damageType: { type: 'basic', damageType: 'slashing' },
              totalDamage: 1
            }
          ],
          diceResults: [
            {
              dice: { sides: 10 },
              allResults: [ 1 ],
              keptResults: [ 1 ],
              discardedResults: [],
              totalResult: 1
            }
          ]
        },
        {
          name: 'Base ability damage',
          totalDamage: 7,
          originalExpression: '5',
          damageTypeResults: [],
          inheritedTypeDamage: 7,
          appliedDamageModifications: [ { type: 'multiplyAllDamage', multiplier: 1.5 } ]
        }
      ],
      damageTypeResults: [
        {
          damageTypeId: 'slashing',
          damageType: { type: 'basic', damageType: 'slashing' },
          totalDamage: 8
        }
      ]
    }

    const result = calculateDamage(damageFormula, mockDiceRoller);
    expect(result).toEqual(expectedResult);
  });
});
