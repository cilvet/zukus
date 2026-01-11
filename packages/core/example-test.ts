import { getDamageFormulaText } from "./core/domain/character/calculation/attacks/attack/utils/getDamageText";
import { SubstitutionIndex } from "./core/domain/character/calculation/sources/calculateSources";
import { DamageFormula } from "./core/domain/character/calculatedSheet/attacks/damage/damageFormula";

// The example damage formula from the user
const exampleDamageFormula: DamageFormula = {
    "name": "Melee attack",
    "type": "complex",
    "baseDamage": {
        "name": "Weapon damage",
        "type": "complex",
        "baseDamage": {
            "name": "Longbow damage",
            "type": "simple",
            "formula": {
                "expression": "1d8"
            },
            "damageType": {
                "firstDamageType": "piercing",
                "secondDamageType": "electric",
                "type": "halfAndHalf"
            },
            "damageModifications": []
        },
        "additionalDamageSections": [
            {
                "name": "Enhancement bonus",
                "type": "simple",
                "formula": {
                    "expression": "1"
                }
            }
        ],
        "damageModifications": []
    },
    "additionalDamageSections": [
        {
            "name": "Longbow",
            "type": "simple",
            "formula": {
                "expression": "@ability.strength.modifier"
            }
        },
        {
            "name": "Flecha energizada",
            "type": "simple",
            "formula": {
                "expression": "1d6"
            },
            "damageType": {
                "damageType": "electric",
                "type": "basic"
            }
        },
        {
            "name": "Puntería increíble",
            "type": "simple",
            "formula": {
                "expression": "@ability.dexterity.modifier"
            }
        },
        {
            "name": "Mage bane",
            "type": "simple",
            "formula": {
                "expression": "2d6"
            }
        },
        {
            "name": "Mage bane",
            "type": "simple",
            "formula": {
                "expression": "2"
            }
        }
    ],
    "damageModifications": []
} as DamageFormula; // Using type assertion for simplicity

// Example substitution data
const substitutionData: SubstitutionIndex = {
    "ability.strength.modifier": 3,
    "ability.dexterity.modifier": 5
};

// Run the test
console.log("Testing with uniteDice = true:");
const result = getDamageFormulaText(exampleDamageFormula, substitutionData, true);
console.log("Result:", result[0]);

// Expected output should contain 1d8 + 3d6 + numeric values
// Something like: "1d8 + 3d6 + 3 + 5 + 3" or "1d8 + 3d6 + 11" 