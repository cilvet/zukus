import { fighter, rogue } from "../../../../../srd/classes";
import { buildSavingThrowChange } from "../../../../tests/changes/changeBuilder";
import { buildCharacter } from "../../../../tests/character/buildCharacter";
import { buildItem } from "../../../../tests/items/buildItem";
import { SavingThrowId } from "../../../class/saves";
import { calculateCharacterSheet } from "../calculateCharacterSheet";

describe("calculateCharacterSheet - Saving Throws", () => {
  it("calculates fortitude save of level 1 fighter", () => {
    const character = buildCharacter().withClassLevels(fighter, 1).build();
    const result = calculateCharacterSheet(character);
    expect(result.savingThrows.fortitude.totalValue).toEqual(2);
  });

  it("calculates fortitude save of level 5 fighter", () => {
    const character = buildCharacter().withClassLevels(fighter, 5).build();
    const result = calculateCharacterSheet(character);
    expect(result.savingThrows.fortitude.totalValue).toEqual(4);
  });

  it("calculates ref save of level 5 fighter", () => {
    const character = buildCharacter().withClassLevels(fighter, 5).build();
    const result = calculateCharacterSheet(character);
    expect(result.savingThrows.reflex.totalValue).toEqual(1);
  });

  it("calculates fortitude save of level 5 fighter / level 3 rogue", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 5)
      .withClassLevels(rogue, 3)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.savingThrows.fortitude.totalValue).toEqual(5);
  });

  it("calculates fortitude save of level 1 fighter with saving throw source", () => {
    const fortitudeChange = buildSavingThrowChange(
      SavingThrowId.FORTITUDE,
      "4"
    );
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withItemEquipped(buildItem().withChange(fortitudeChange).build())
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.savingThrows.fortitude.totalValue).toEqual(6);
  });

  it("calculates all saving throws of level 1 fighter with all saving throws source", () => {
    const allSavesChange = buildSavingThrowChange(SavingThrowId.ALL, "4");
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withItemEquipped(buildItem().withChange(allSavesChange).build())
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.savingThrows.fortitude.totalValue).toEqual(6);
    expect(result.savingThrows.reflex.totalValue).toEqual(4);
    expect(result.savingThrows.will.totalValue).toEqual(4);
  });
}); 