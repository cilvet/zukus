import { fighter } from "../../../../../../srd/classes";
import { bardicInspiration1 } from "../../../../../../srd/commonBuffs/commonBuffs";
import { bastardSword } from "../../../../../../srd/equipment/weapons";
import { flaming } from "../../../../../../srd/weaponEnhancements/weaponEnhacements";
import { buildCharacter } from "../../../../../tests/character/buildCharacter";
import { MockDiceRoller } from "../../../../rolls/DiceRoller/MockDiceRoller";
import { MeleeWeapon } from "../../../../weapons/weapon";
import { ResolvedAttackContext } from "../../../calculatedSheet/attacks/calculatedAttack";
import { getAttackDamageFormula } from "./getAttackDamageFormula";

const flamingBastardSword: MeleeWeapon = {
  ...bastardSword,
  enhancements: [flaming],
};

describe("getAttackDamageFormula", () => {
  it("should return the correct damage formula for a melee attack", () => {
    const characterSheet = buildCharacter()
      .withClassLevels(fighter, 1)
      .buildCharacterSheet();
    const context: ResolvedAttackContext = {
      attackType: "melee",
      appliedContextualChanges: [],
      character: characterSheet,
      weapon: flamingBastardSword,
      wieldType: "primary",
      appliedChanges: [],
    };
    const damageFormula = getAttackDamageFormula(context);
    const diceRoller = new MockDiceRoller();
    diceRoller.mockAllDiceRollsTo(1);

    const expectedDamageFormula = {
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
              damageType: "fire",
              type: "basic",
            },
          },
        ],
        damageModifications: [],
      },
      additionalDamageSections: [
        {
          name: "Strength",
          type: "simple",
          formula: {
            expression: "0",
          },
          damageModifications: [],
        },
      ],
      damageModifications: [],
    };
    expect(damageFormula).toStrictEqual(expectedDamageFormula);
  });

  it("should return the correct damage formula for a melee attack with multiple damage sources", () => {
    const characterSheet = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBuff(bardicInspiration1)
      .buildCharacterSheet();

    const context: ResolvedAttackContext = {
      attackType: "melee",
      appliedContextualChanges: [],
      character: characterSheet,
      weapon: flamingBastardSword,
      wieldType: "twoHanded",
      appliedChanges: [],
    };
    const damageFormula = getAttackDamageFormula(context);
    const diceRoller = new MockDiceRoller();
    diceRoller.mockAllDiceRollsTo(1);

    //calculateDamage(damageFormula, diceRoller, characterSheet.substitutionValues);
    const expectedDamageFormula = {
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
              damageType: "fire",
              type: "basic",
            },
          },
        ],
        damageModifications: [],
      },
      additionalDamageSections: [
        {
          name: "Strength",
          type: "simple",
          formula: {
            expression: "0",
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
            expression: "1",
          },
        },
      ],
      damageModifications: [],
    };
    expect(damageFormula).toEqual(expectedDamageFormula);
  });
});
