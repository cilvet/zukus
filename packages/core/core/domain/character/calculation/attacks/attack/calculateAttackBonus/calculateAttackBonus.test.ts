import { bullStrength } from "../../../../../../../srd/commonBuffs/commonBuffs";
import { fighter } from "../../../../../../../srd/classes";
import { bastardSword, longBow, rapier } from "../../../../../../../srd/equipment/weapons";
import { buildCharacter } from "../../../../../../tests/character/buildCharacter";
import { calculateCharacterSheet } from "../../../calculateCharacterSheet";

describe("calculateAttackBonus", () => {
  it("should return the correct attackBonus value for attack", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 4)
      .withBaseAbilityScore("strength", 18)
      .withBuff(bullStrength)
      .withItem(bastardSword)
      .build();
    const characterSheet = calculateCharacterSheet(character);
    const createdAttack = characterSheet.attackData.attacks[0];
    expect(createdAttack.attackBonus.totalValue).toEqual(10);
  });

  it("should use dexterity instead of strength for weapon with finesse", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBaseAbilityScore("strength", 10)
      .withBaseAbilityScore("dexterity", 20)
      .withItem(rapier)
      .build();
    const characterSheet = calculateCharacterSheet(character);
    const createdAttack = characterSheet.attackData.attacks[0];
    expect(createdAttack.attackBonus.totalValue).toEqual(6);
  });

  it("should use dexterity for ranged attacks", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBaseAbilityScore("strength", 10)
      .withBaseAbilityScore("dexterity", 20)
      .withItem(longBow)
      .build();
    const characterSheet = calculateCharacterSheet(character);
    const createdAttack = characterSheet.attackData.attacks[0];
    expect(createdAttack.attackBonus.totalValue).toEqual(6);
  });
});
