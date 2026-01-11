import { fighter } from "../../../../../srd/classes";
import { buildAbilityChange, buildInitiativeChange } from "../../../../tests/changes/changeBuilder";
import { buildCharacter } from "../../../../tests/character/buildCharacter";
import { buildItem } from "../../../../tests/items/buildItem";
import { calculateCharacterSheet } from "../calculateCharacterSheet";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";

describe("calculateCharacterSheet - Initiative", () => {
  it("calculates initiative without changes", () => {
    const character = buildCharacter()
      .withBaseAbilityScore("dexterity", 16)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.initiative.totalValue).toEqual(3);
  });

  it("calculates initiative with static change to initiative", () => {
    const initiativeChange = buildInitiativeChange("4");
    const initiativeItem = buildItem().withChange(initiativeChange).build();
    const character = buildCharacter()
      .withBaseAbilityScore("dexterity", 16)
      .withItemEquipped(initiativeItem)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.initiative.totalValue).toEqual(7);
  });

  it("calculates initiative with base ability value change", () => {
    const strengthToInitiativeChange = buildInitiativeChange(
      `@${valueIndexKeys.STR_MODIFIER}`
    );
    const strengthItem = buildItem()
      .withChange(strengthToInitiativeChange)
      .build();
    const character = buildCharacter()
      .withBaseAbilityScore("strength", 16)
      .withBaseAbilityScore("dexterity", 14)
      .withItemEquipped(strengthItem)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.initiative.totalValue).toEqual(5);
  });

  it("calculates initiative with calculated ability value change", () => {
    const hdToStrengthChange = buildAbilityChange(
      "strength",
      `@${valueIndexKeys.HIT_DICE_BASE}`
    );
    const strengthToInitiativeChange = buildInitiativeChange(
      `@${valueIndexKeys.STR_MODIFIER}`
    );
    const strengthItem = buildItem()
      .withChange(hdToStrengthChange)
      .withChange(strengthToInitiativeChange)
      .build();
    const character = buildCharacter()
      .withClassLevels(fighter, 4)
      .withBaseAbilityScore("strength", 16)
      .withBaseAbilityScore("dexterity", 14)
      .withItemEquipped(strengthItem)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.initiative.totalValue).toEqual(7);
  });
}); 