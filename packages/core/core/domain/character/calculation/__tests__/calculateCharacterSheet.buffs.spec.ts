import { buildAbilityChange } from "../../../../tests/changes/changeBuilder";
import { buildCharacter } from "../../../../tests/character/buildCharacter";
import { buildBuff } from "../../../../tests/buffs/buildBuff";
import { Buff } from "../../baseData/buffs";
import { calculateCharacterSheet } from "../calculateCharacterSheet";

describe("calculateCharacterSheet - Buffs", () => {
  it("calculates buff only when it's active", () => {
    const strengthChange = buildAbilityChange("strength", "4");
    const strengthBuff: Buff = {
      ...buildBuff().withChange(strengthChange).build(),
      active: false,
    };
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 10)
      .withBuff(strengthBuff)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.abilityScores.strength.totalScore).toEqual(10);
  });
}); 