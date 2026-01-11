import { getDamageFormulaText } from "./core/domain/character/calculation/attacks/attack/utils/getDamageText";
import { SubstitutionIndex } from "./core/domain/character/calculation/sources/calculateSources";
import { DamageFormula } from "./core/domain/character/calculatedSheet/attacks/damage/damageFormula";

// Test case 1: Numeric value with multiplier
const numericMultiplierFormula: DamageFormula = {
  name: "Multiplier Test",
  type: "complex",
  baseDamage: {
    name: "Base damage",
    type: "simple",
    formula: {
      expression: "10",
    },
    damageType: {
      type: "basic",
      damageType: "slashing",
    },
    damageModifications: [
      {
        type: "multiplyAllDamage",
        multiplier: 1.5,
      },
    ],
  },
  additionalDamageSections: [],
  damageModifications: [],
};

// Test case 2: Dice with multiplier
const diceMultiplierFormula: DamageFormula = {
  name: "Dice Multiplier Test",
  type: "complex",
  baseDamage: {
    name: "Base damage",
    type: "simple",
    formula: {
      expression: "2d6",
    },
    damageType: {
      type: "basic",
      damageType: "slashing",
    },
    damageModifications: [
      {
        type: "multiplyAllDamage",
        multiplier: 1.5,
      },
    ],
  },
  additionalDamageSections: [],
  damageModifications: [],
};

// Test case 3: Mixed with multipliers
const mixedMultiplierFormula: DamageFormula = {
  name: "Mixed Multiplier Test",
  type: "complex",
  baseDamage: {
    name: "Base damage",
    type: "simple",
    formula: {
      expression: "2d6",
    },
    damageType: {
      type: "basic",
      damageType: "slashing",
    },
    damageModifications: [],
  },
  additionalDamageSections: [
    {
      name: "Numeric bonus",
      type: "simple",
      formula: {
        expression: "5",
      },
      damageModifications: [
        {
          type: "multiplyAllDamage",
          multiplier: 2,
        },
      ],
    },
  ],
  damageModifications: [],
};

// Run tests
console.log("Test 1: Numeric value with multiplier");
const result1 = getDamageFormulaText(numericMultiplierFormula, {}, true);
console.log("Result:", result1[0]);
console.log("Expected: '15' (10 * 1.5 = 15)");

console.log("\nTest 2: Dice with multiplier");
const result2 = getDamageFormulaText(diceMultiplierFormula, {}, true);
console.log("Result:", result2[0]);
console.log("Expected: '2d6(* 1.5)' (dice should show multiplication)");

console.log("\nTest 3: Mixed with multipliers");
const result3 = getDamageFormulaText(mixedMultiplierFormula, {}, true);
console.log("Result:", result3[0]);
console.log("Expected: '2d6 + 10' (5 * 2 = 10, dice unchanged)"); 