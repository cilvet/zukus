import { fighter } from "../../../../../srd/classes";
import {
  fullPlateArmor,
  heavySteelShield,
  leatherArmor,
} from "../../../../../srd/equipment/armor";
import { mageArmor } from "../../../../tests/buffs/exampleBuffs";
import { buildBuff } from "../../../../tests/buffs/buildBuff";
import { buildACChange } from "../../../../tests/changes/changeBuilder";
import { buildCharacter } from "../../../../tests/character/buildCharacter";
import { buildArmor } from "../../../../tests/items/buildArmor";
import { buildShield } from "../../../../tests/items/buildShield";
import { Armor } from "../../baseData/equipment";
import { calculateCharacterSheet } from "../calculateCharacterSheet";

describe("calculateCharacterSheet - Armor Class", () => {
  it("calculates armor class of level 1 fighter", () => {
    const character = buildCharacter().withClassLevels(fighter, 1).build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(10);
  });

  it("calculates armor class of level 1 fighter with 16 dex", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBaseAbilityScore("dexterity", 16)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(13);
  });

  it("calculates armor class of level 1 fighter with 16 dex wearing leather armor", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBaseAbilityScore("dexterity", 16)
      .withItemEquipped(leatherArmor)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(15);
  });

  it("calculates armor class of level 1 fighter with 16 dex wearing leather armor with +1 enhancement bonus", () => {
    const leatherArmorPlusOne = buildArmor(leatherArmor)
      .withEnhancementBonus(1)
      .build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBaseAbilityScore("dexterity", 16)
      .withItemEquipped(leatherArmorPlusOne)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(16);
  });

  it("calculates armor class correctly when max dex bonus of armor is exceeded", () => {
    const armorWitZeroDexBonus: Armor = {
      ...fullPlateArmor,
      maxDexBonus: 0,
    };
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBaseAbilityScore("dexterity", 12)
      .withItemEquipped(armorWitZeroDexBonus)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(18);
  });

  it("calculates AC correctly when character is using a shield", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withItemEquipped(heavySteelShield)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(12);
  });

  it("calculates AC correctly when character is using a shield with a +3 enhancement bonus", () => {
    const heavySteelShieldPlusThree = buildShield(heavySteelShield)
      .withEnhancementBonus(3)
      .build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withItemEquipped(heavySteelShieldPlusThree)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(15);
  });

  it("calculates AC correctly when character is using a shield and armor", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withItemEquipped(heavySteelShield)
      .withItemEquipped(fullPlateArmor)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(20);
  });

  it("calculates AC correctly when character is using a shield and armor and exceeds max dex bonus", () => {
    const armorWitZeroDexBonus: Armor = {
      ...fullPlateArmor,
      maxDexBonus: 0,
    };
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBaseAbilityScore("dexterity", 18)
      .withItemEquipped(heavySteelShield)
      .withItemEquipped(armorWitZeroDexBonus)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(20);
  });

  it("calculates AC correctly when armor bonus buff overlaps with armor", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withItemEquipped(fullPlateArmor)
      .withBuff(mageArmor)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(18);
  });

  it("calculates AC correctly when multiple dodge bonus buff are stacked", () => {
    const dodgeChange = buildACChange("1", "DODGE");
    const dodgeBonus = buildBuff().withChange(dodgeChange).build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withItemEquipped(fullPlateArmor)
      .withBuff(dodgeBonus)
      .withBuff(dodgeBonus)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(20);
  });

  it("calculates AC correctly with non armor specific bonuses", () => {
    const sacredChange = buildACChange("1", "SACRED");
    const insightChange = buildACChange("1", "INSIGHT");
    const circumstantialChange = buildACChange("1", "CIRCUMNSTANCE");
    const luckChange = buildACChange("1", "LUCK");
    const moraleChange = buildACChange("1", "MORALE");
    const nonArmorSpecificBonusesBuff = buildBuff()
      .withChange(sacredChange)
      .withChange(insightChange)
      .withChange(circumstantialChange)
      .withChange(luckChange)
      .withChange(moraleChange)
      .build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBuff(nonArmorSpecificBonusesBuff)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.totalAc.totalValue).toEqual(15);
  });

  it("calculates touch AC correctly with no armor", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBaseAbilityScore("dexterity", 18)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.touchAc.totalValue).toEqual(14);
  });

  it("calculates touch AC correctly with no armor and dodge bonus", () => {
    const dodgeChange = buildACChange("1", "DODGE");
    const dodgeBuff = buildBuff().withChange(dodgeChange).build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBaseAbilityScore("dexterity", 18)
      .withBuff(dodgeBuff)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.touchAc.totalValue).toEqual(15);
  });

  it("calculates touch AC correctly with no armor and non armor specific bonuses", () => {
    const sacredChange = buildACChange("1", "SACRED");
    const insightChange = buildACChange("1", "INSIGHT");
    const circumstantialChange = buildACChange("1", "CIRCUMNSTANCE");
    const luckChange = buildACChange("1", "LUCK");
    const moraleChange = buildACChange("1", "MORALE");
    const nonArmorSpecificBonusesBuff = buildBuff()
      .withChange(sacredChange)
      .withChange(insightChange)
      .withChange(circumstantialChange)
      .withChange(luckChange)
      .withChange(moraleChange)
      .build();
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBuff(nonArmorSpecificBonusesBuff)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.touchAc.totalValue).toEqual(15);
  });

  it("calculates touch AC correctly with armor max dex penalty", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withBaseAbilityScore("dexterity", 18)
      .withItemEquipped(fullPlateArmor)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.armorClass.touchAc.totalValue).toEqual(11);
  });
}); 