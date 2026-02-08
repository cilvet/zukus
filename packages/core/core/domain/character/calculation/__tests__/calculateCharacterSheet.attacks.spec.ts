import { fighter } from "../../../../../srd/classes";
import { bastardSword } from "../../../../../srd/equipment/weapons";
import { srdWeapons } from "../../../../../srd/equipment/d35e";
import { buildCharacter } from "../../../../tests/character/buildCharacter";
import { calculateCharacterSheet } from "../calculateCharacterSheet";

const longsword = srdWeapons.find((w) => w.id === "longsword")!;
const shortbow = srdWeapons.find((w) => w.id === "shortbow")!;

describe("calculateCharacterSheet - Attacks", () => {
  it("calculates attack bonus of level 1 fighter", () => {
    const character = buildCharacter()
      .withClassLevels(fighter, 1)
      .withItem(bastardSword)
      .build();
    const result = calculateCharacterSheet(character);
    expect(result.attackData.attacks[0].attackBonus.totalValue).toEqual(1);
  });

  describe("Attacks from inventory entity weapons", () => {
    it("equipped weapon generates a melee attack", () => {
      // Fighter lvl 1 (BAB +1) + STR 14 (mod +2) = attack bonus +3
      const sheet = buildCharacter()
        .withClassLevels(fighter, 1)
        .withBaseAbilityScore("strength", 14)
        .withInventoryWeapon(longsword, { equipped: true })
        .buildCharacterSheet();

      expect(sheet.attackData.attacks.length).toBe(1);
      const attack = sheet.attackData.attacks[0];
      expect(attack.type).toBe("melee");
      // BAB(1) + STR mod(2) = 3
      expect(attack.attackBonus.totalValue).toBe(3);
    });

    it("unequipped weapon does not generate an attack", () => {
      const sheet = buildCharacter()
        .withClassLevels(fighter, 1)
        .withBaseAbilityScore("strength", 14)
        .withInventoryWeapon(longsword, { equipped: false })
        .buildCharacterSheet();

      expect(sheet.attackData.attacks.length).toBe(0);
    });

    it("multiple equipped weapons generate multiple attacks", () => {
      const sheet = buildCharacter()
        .withClassLevels(fighter, 1)
        .withBaseAbilityScore("strength", 14)
        .withInventoryWeapon(longsword, { equipped: true })
        .withInventoryWeapon(longsword, { equipped: true })
        .buildCharacterSheet();

      expect(sheet.attackData.attacks.length).toBe(2);
    });

    it("ranged weapon generates a ranged attack with DEX bonus", () => {
      // Fighter lvl 1 (BAB +1) + DEX 16 (mod +3) = attack bonus +4
      const sheet = buildCharacter()
        .withClassLevels(fighter, 1)
        .withBaseAbilityScore("dexterity", 16)
        .withInventoryWeapon(shortbow, { equipped: true })
        .buildCharacterSheet();

      expect(sheet.attackData.attacks.length).toBe(1);
      const attack = sheet.attackData.attacks[0];
      expect(attack.type).toBe("ranged");
      // BAB(1) + DEX mod(3) = 4
      expect(attack.attackBonus.totalValue).toBe(4);
    });

    it("weapon with enhancement bonus adds to attack roll", () => {
      const longswordPlus1 = { ...longsword, enhancementBonus: 1 };
      // Fighter lvl 1 (BAB +1) + STR 14 (mod +2) + enhancement(+1) = 4
      const sheet = buildCharacter()
        .withClassLevels(fighter, 1)
        .withBaseAbilityScore("strength", 14)
        .withInventoryWeapon(longswordPlus1, { equipped: true })
        .buildCharacterSheet();

      expect(sheet.attackData.attacks.length).toBe(1);
      expect(sheet.attackData.attacks[0].attackBonus.totalValue).toBe(4);
    });

    it("legacy weapon and entity weapon both generate attacks", () => {
      const sheet = buildCharacter()
        .withClassLevels(fighter, 1)
        .withBaseAbilityScore("strength", 14)
        .withItemEquipped(bastardSword)
        .withInventoryWeapon(longsword, { equipped: true })
        .buildCharacterSheet();

      expect(sheet.attackData.attacks.length).toBe(2);
    });
  });
});
