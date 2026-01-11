import { fighter } from "../../../../../srd/classes";
import { bastardSword } from "../../../../../srd/equipment/weapons";
import { buildCharacter } from "../../../../tests/character/buildCharacter";
import { calculateCharacterSheet } from "../calculateCharacterSheet";

describe("calculateCharacterSheet - Attacks", () => {
  it("calculates attack bonus of level 1 fighter", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withItem(bastardSword)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.attackData.attacks[0].attackBonus.totalValue).toEqual(1);
  });
}); 