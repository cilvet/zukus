import { fighter } from "../../../../../srd/classes";
import { buildAbilityChange, buildInitiativeChange } from "../../../../tests/changes/changeBuilder";
import { buildBuff } from "../../../../tests/buffs/buildBuff";
import { buildCharacter } from "../../../../tests/character/buildCharacter";
import { buildItem } from "../../../../tests/items/buildItem";
import { calculateCharacterSheet } from "../calculateCharacterSheet";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";

describe("calculateCharacterSheet - Ability Scores", () => {
  it("calculates ability score with no changes", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.abilityScores.strength.totalScore).toEqual(16);
  });

  it("calculates ability score with static change", () => {
    const strengthChange = buildAbilityChange("strength", "4");
    const strengthItem = buildItem().withChange(strengthChange).build();
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .withBaseAbilityScore("dexterity", 14)
      .withItemEquipped(strengthItem)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.abilityScores.strength.totalScore).toEqual(20);
  });

  it("calculates ability score with buff change", () => {
    const strengthChange = buildAbilityChange("strength", "4");
    const strengthBuff = buildBuff().withChange(strengthChange).build();
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .withBaseAbilityScore("dexterity", 14)
      .withBuff(strengthBuff)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.abilityScores.strength.totalScore).toEqual(20);
  });

  it("calculates ability score with change based on HD", () => {
    const hdToStrengthChange = buildAbilityChange(
      "strength",
      `@${valueIndexKeys.HIT_DICE_BASE}`
    );
    const strengthToInitiativeChange = buildInitiativeChange(
      `@${valueIndexKeys.STR_MODIFIER}`
    );
    const strengthAndInitiativeItem = buildItem()
      .withChange(hdToStrengthChange)
      .withChange(strengthToInitiativeChange)
      .build();
    const character = buildCharacter()
      .withClassLevels(fighter, 4)
      .withBaseAbilityScore("strength", 16)
      .withItemEquipped(strengthAndInitiativeItem)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.abilityScores.strength.totalScore).toEqual(20);
  });
}); 