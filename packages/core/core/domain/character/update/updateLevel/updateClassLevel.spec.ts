import { fighter } from "../../../../../srd/classes";
import { getDefaultCharacterData } from "../../../../tests/character/defaultCharacter";
import { advanceClassLevels } from "./advanceClassLevels";

describe("updateClasslevel", function () {
  const diceRolls = [1, 1, 1, 1, 1];
  it("adds class to character if it doesn't have it", () => {
    const updatedCharacterData = advanceClassLevels(
      getDefaultCharacterData(),
      fighter,
      1,
      diceRolls
    );
    expect(updatedCharacterData.classes).toContain(fighter);
  });

  it("adds level number to character", () => {
    const updatedCharacterData = advanceClassLevels(
      getDefaultCharacterData(),
      fighter,
      1,
      diceRolls
    );
    expect(updatedCharacterData.level.levelsData[0].level).toBe(1);
  });

  it("adds class level to character", () => {
    const updatedCharacterData = advanceClassLevels(
      getDefaultCharacterData(),
      fighter,
      2,
      diceRolls
    );
    expect(updatedCharacterData.level.level).toBe(2);
    expect(updatedCharacterData.level.levelsData[1].level).toBe(2);
  });

  it("adds class features to character level", () => {
    const updatedCharacterData = advanceClassLevels(
      getDefaultCharacterData(),
      fighter,
      1,
      diceRolls
    );
    expect(updatedCharacterData.level.levelsData[0].levelClassFeatures).toBe(
      fighter.levels[0].classFeatures
    );
  });

  it("adds hit die to character level", () => {
    const updatedCharacterData = advanceClassLevels(
      getDefaultCharacterData(),
      fighter,
      1,
      diceRolls
    );
    expect(updatedCharacterData.level.levelsData[0].hitDie).toBe(
      fighter.hitDie
    );
  });

  it("first hit die roll is maxed regardless of what is passed", () => {
    const updatedCharacterData = advanceClassLevels(
      getDefaultCharacterData(),
      fighter,
      1,
      [1]
    );
    expect(updatedCharacterData.level.levelsData[0].hitDieRoll).toBe(
      10
    );
  });
});
