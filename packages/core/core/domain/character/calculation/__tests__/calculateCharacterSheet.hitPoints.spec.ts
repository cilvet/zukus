import { bard, fighter, rogue } from "../../../../../srd/classes";
import { buildAbilityChange, buildBaseAttackBonusChange } from "../../../../tests/changes/changeBuilder";
import { buildCharacter } from "../../../../tests/character/buildCharacter";
import { buildItem } from "../../../../tests/items/buildItem";
import { calculateCharacterSheet } from "../calculateCharacterSheet";

describe("calculateCharacterSheet - Hit Points", () => {
  it("max hp of level 1 character with no con modifier is equal to it's max dice result", () => {
    const character = buildCharacter().withClassLevels(fighter, 1).build();
    const result = calculateCharacterSheet(character);
    expect(result.hitPoints.maxHp).toEqual(10);
  });

  it("max hp of level 1 character with con modifier is equal to it's max dice result plus con modifier", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBaseAbilityScore("constitution", 14)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.hitPoints.maxHp).toEqual(12);
  });

  it("max hp of level 5 character with con modifier is equal to it's max dice result plus con modifier multiplied by level", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 5)
      .withBaseAbilityScore("constitution", 14)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.hitPoints.maxHp).toEqual(24);
  });

  it("current damage of character is unchanged", () => {
    const currentDamage = 5;
    const character = buildCharacter()
      .withClassLevels(fighter, 5)
      .withBaseAbilityScore("constitution", 14)
      .withCurrentDamage(currentDamage)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.hitPoints.currentDamage).toEqual(currentDamage);
  });

  it("max hp of character takes into account CON sources", () => {
    const bearsEnduranceChange = buildAbilityChange("constitution", "4");
    const conItem = buildItem().withChange(bearsEnduranceChange).build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withItemEquipped(conItem)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.hitPoints.maxHp).toEqual(12);
  });

  it("CON sources of same type don't stack ", () => {
    const bearsEnduranceChange = buildAbilityChange("constitution", "4");
    const conItem = buildItem()
      .withChange(bearsEnduranceChange)
      .withChange(bearsEnduranceChange)
      .build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withItemEquipped(conItem)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.hitPoints.maxHp).toEqual(12);
  });

  it("Calculates BAB of character build with more levels but level set to 1", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 5)
      .withClassLevels(rogue, 3)
      .withClassLevels(bard, 2)
      .withCurrentLevel(1)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.baseAttackBonus.totalValue).toEqual(1);
  });

  it("calculates normal BAB of level 1 fighter", () => {
    const character = buildCharacter().withClassLevels(fighter, 1).build();
    const result = calculateCharacterSheet(character);
    expect(result.baseAttackBonus.totalValue).toEqual(1);
  });

  it("calculates normal BAB of level 5 fighter", () => {
    const character = buildCharacter().withClassLevels(fighter, 5).build();
    const result = calculateCharacterSheet(character);
    expect(result.baseAttackBonus.totalValue).toEqual(5);
  });

  it("calculates normal BAB of level 5 fighter with BAB source", () => {
    const babChange = buildBaseAttackBonusChange("5");
    const babItem = buildItem().withChange(babChange).build();
    const character = buildCharacter()
      .withClassLevels(fighter, 5)
      .withItemEquipped(babItem)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.baseAttackBonus.totalValue).toEqual(10);
  });

  it("calculates enhanced BAB of level 5 fighter with BAB source of same type", () => {
    const babChange = buildBaseAttackBonusChange("5");
    const babItem = buildItem()
      .withChange(babChange)
      .withChange(babChange)
      .build();
    const character = buildCharacter()
      .withClassLevels(fighter, 5)
      .withItemEquipped(babItem)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.baseAttackBonus.totalValue).toEqual(10);
  });

  it("calculates enhanced BAB of level 5 fighter with BAB source of different type", () => {
    const babChange = buildBaseAttackBonusChange("5");
    const babChange2 = buildBaseAttackBonusChange("5", "CIRCUMNSTANCE");
    const babItem = buildItem()
      .withChange(babChange)
      .withChange(babChange2)
      .build();
    const character = buildCharacter()
      .withClassLevels(fighter, 5)
      .withItemEquipped(babItem)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.baseAttackBonus.totalValue).toEqual(15);
  });
}); 