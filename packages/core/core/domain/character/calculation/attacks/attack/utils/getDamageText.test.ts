import { getDamageFormulaText } from "./getDamageText";
import {
  DamageFormula,
  DamageSection,
} from "../../../../calculatedSheet/attacks/damage/damageFormula";
import { SubstitutionIndex } from "../../../sources/calculateSources";

describe("getDamageFormulaText", () => {
  const testCases: Array<{
    damageFormula: DamageFormula;
    substitutionData: SubstitutionIndex;
    expected: string;
  }> = [
    {
      damageFormula: {
        name: "Melee attack",
        type: "complex",
        baseDamage: {
          name: "Weapon damage",
          type: "complex",
          baseDamage: {
            name: "Bastard sword damage",
            type: "simple",
            formula: {
              expression: "1d10",
            },
            damageType: {
              type: "basic",
              damageType: "slashing",
            },
            damageModifications: [],
          },
          additionalDamageSections: [
            {
              name: "Flaming",
              type: "simple",
              formula: {
                expression: "1d6",
              },
              damageType: {
                type: "basic",
                damageType: "slashing",
              },
            },
          ],
          damageModifications: [],
        },
        additionalDamageSections: [
          {
            name: "Base ability damage",
            type: "simple",
            formula: {
              expression: "4",
            },
            damageModifications: [
              {
                type: "multiplyAllDamage",
                multiplier: 1.5,
              },
            ],
          },
          {
            name: "Bardic Inspiration",
            type: "simple",
            formula: {
              expression: "@bardicInspiration",
            },
          },
        ],
        damageModifications: [],
      },
      substitutionData: { bardicInspiration: 2 },
      expected: "1d10 + 1d6 + 8",
    },
  ];

  testCases.forEach(({ damageFormula, substitutionData, expected }) => {
    it(`should return ${expected} for the given damage formula and substitution data`, () => {
      const result = getDamageFormulaText(damageFormula, substitutionData);
      expect(result[0]).toEqual(expected);
    });
  });

  describe("Dice Unification", () => {
    const baseDamageFormula: DamageFormula = {
      name: "Test attack",
      type: "complex",
      baseDamage: {
        name: "Base damage",
        type: "simple",
        formula: {
          expression: "1d6",
        },
        damageType: {
          type: "basic",
          damageType: "slashing",
        },
        damageModifications: [],
      },
      additionalDamageSections: [
        {
          name: "Additional d6",
          type: "simple",
          formula: {
            expression: "2d6",
          },
        },
        {
          name: "More d6",
          type: "simple",
          formula: {
            expression: "1d6",
          },
        },
        {
          name: "Different dice",
          type: "simple",
          formula: {
            expression: "1d8",
          },
        },
        {
          name: "Numeric bonus",
          type: "simple",
          formula: {
            expression: "3",
          },
        },
      ],
      damageModifications: [],
    };

    it("should unite dice of the same type when uniteDice is true", () => {
      const result = getDamageFormulaText(baseDamageFormula, {}, true);
      expect(result[0]).toEqual("1d8 + 4d6 + 3");
    });

    it("should not unite dice when uniteDice is false", () => {
      const result = getDamageFormulaText(baseDamageFormula, {}, false);
      expect(result[0]).toEqual("1d6 + 2d6 + 1d6 + 1d8 + 3");
    });

    it("should handle mixed dice expressions with addition", () => {
      const mixedDamageFormula: DamageFormula = {
        name: "Mixed attack",
        type: "complex",
        baseDamage: {
          name: "Base damage",
          type: "simple",
          formula: {
            expression: "1d6 + 2",
          },
          damageType: {
            type: "basic",
            damageType: "slashing",
          },
          damageModifications: [],
        },
        additionalDamageSections: [
          {
            name: "Additional damage",
            type: "simple",
            formula: {
              expression: "1d6 + 1d8 + 3",
            },
          },
        ],
        damageModifications: [],
      };

      const result = getDamageFormulaText(mixedDamageFormula, {}, true);
      expect(result[0]).toEqual("1d8 + 2d6 + 5");
    });

    it("should handle simple mage bane expression", () => {
      const damageFormula: DamageFormula = {
        name: "Melee attack",
        type: "complex",
        baseDamage: {
          name: "Weapon damage",
          type: "complex",
          baseDamage: {
            name: "Hacha de Sigmar damage",
            type: "simple",
            formula: {
              expression: "3d6",
            },
            damageType: {
              damageType: "slashing",
              type: "basic",
            },
            damageModifications: [],
          },
          additionalDamageSections: [
            
          ],
          damageModifications: [],
        },
        additionalDamageSections: [
          {
            name: "Mage bane",
            type: "simple",
            formula: {
              expression: "2d6",
            },
          },
        ],
        damageModifications: [],
      };

      const result = getDamageFormulaText(damageFormula, {}, true);
      expect(result[0]).toEqual("5d6");
    });

    it("should handle complex expressions that cannot be unified", () => {
      const complexDamageFormula: DamageFormula = {
        name: "Complex attack",
        type: "complex",
        baseDamage: {
          damageType: {
            type: "basic",
            damageType: "slashing",
          },
          name: "Base damage",
          type: "simple",
          formula: {
            expression: "1d6",
          },
          damageModifications: [],
        },
        additionalDamageSections: [
          {
            name: "Complex damage",
            type: "simple",
            formula: {
              expression: "2d6 * 2",
            },
          },
          {
            name: "Simple damage",
            type: "simple",
            formula: {
              expression: "1d6",
            },
          },
        ],
        damageModifications: [],
      };

      const result = getDamageFormulaText(complexDamageFormula, {}, true);
      expect(result[0]).toEqual("2d6 + 4");
    });

    it("should sort unified dice by size (descending)", () => {
      const sortTestDamageFormula: DamageFormula = {
        name: "Sort test attack",
        type: "complex",
        baseDamage: {
          damageType: {
            type: "basic",
            damageType: "slashing",
          },
          name: "Base damage",
          type: "simple",
          formula: {
            expression: "1d4",
          },
          damageModifications: [],
        },
        additionalDamageSections: [
          {
            name: "d20 damage",
            type: "simple",
            formula: {
              expression: "1d20",
            },
          },
          {
            name: "d8 damage",
            type: "simple",
            formula: {
              expression: "2d8",
            },
          },
          {
            name: "More d4",
            type: "simple",
            formula: {
              expression: "1d4",
            },
          },
        ],
        damageModifications: [],
      };

      const result = getDamageFormulaText(sortTestDamageFormula, {}, true);
      expect(result[0]).toEqual("1d20 + 2d8 + 2d4");
    });

    it("should handle empty expressions gracefully", () => {
      const emptyDamageFormula: DamageFormula = {
        name: "Empty attack",
        type: "complex",
        baseDamage: {
          damageType: {
            type: "basic",
            damageType: "slashing",
          },
          name: "Base damage",
          type: "simple",
          formula: {
            expression: "0",
          },
          damageModifications: [],
        },
        additionalDamageSections: [],
        damageModifications: [],
      };

      const result = getDamageFormulaText(emptyDamageFormula, {}, true);
      expect(result[0]).toBeDefined();
    });
  });
});
