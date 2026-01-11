import { buildAbilityChange } from "../../../../tests/changes/changeBuilder";
import { buildCharacter } from "../../../../tests/character/buildCharacter";
import { buildItem } from "../../../../tests/items/buildItem";
import { calculateCharacterSheet } from "../calculateCharacterSheet";

describe("calculateCharacterSheet - Items", () => {
  it("calculates item generic changes correctly", () => {
    const character = buildCharacter()
      .withItem(
        buildItem().withChange(buildAbilityChange("strength", "4")).build()
      )
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.abilityScores.strength.totalScore).toEqual(14);
  });

  it("calculates item equipped changes correctly", () => {
    const character = buildCharacter()
      .withItem(
        buildItem()
          .withEquippedChange(buildAbilityChange("strength", "4"))
          .equipped()
          .build()
      )
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.abilityScores.strength.totalScore).toEqual(14);
  });

  it("calculates item not equipped changes correctly", () => {
    const character = buildCharacter()
      .withItem(
        buildItem()
          .withEquippedChange(buildAbilityChange("strength", "4"))
          .equipped(false)
          .build()
      )
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.abilityScores.strength.totalScore).toEqual(10);
  });
}); 