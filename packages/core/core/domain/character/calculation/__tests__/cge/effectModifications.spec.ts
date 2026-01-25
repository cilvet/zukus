import { describe, it, expect } from "bun:test";
import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { createBaseSorcerer } from "./fixtures";
import { buildBuff } from "../../../../../tests/buffs/buildBuff";
import { CustomVariableChange } from "../../../baseData/changes";

describe("CGE Calculations - Effect Modifications", () => {
  describe("Buff modifying slot max", () => {
    it("should allow a buff to add bonus slots", () => {
      // Buff that adds +2 to level 1 slots
      const bonusSlotsChange: CustomVariableChange = {
        type: "CUSTOM_VARIABLE",
        uniqueId: "sorcerer.spell.slot.1.max",
        formula: { expression: "2" },
        bonusTypeId: "UNTYPED",
      };

      const bonusSlotsBuff = buildBuff()
        .withChange(bonusSlotsChange)
        .build();
      bonusSlotsBuff.name = "Pearl of Power";

      const character = createBaseSorcerer(1)
        .withBuff(bonusSlotsBuff)
        .build();

      const sheet = calculateCharacterSheet(character);

      // Sorcerer level 1 has 3 level 1 slots base, with +2 bonus = 5
      const cge = sheet.cge["sorcerer-spells"];
      const level1Slots = cge.tracks[0].slots?.find(s => s.level === 1);

      expect(level1Slots?.max).toBe(5);
    });

    it("should allow multiple buffs to stack on slots", () => {
      // Two different buffs adding to slots
      const buff1: CustomVariableChange = {
        type: "CUSTOM_VARIABLE",
        uniqueId: "sorcerer.spell.slot.1.max",
        formula: { expression: "1" },
        bonusTypeId: "UNTYPED",
      };

      const buff2: CustomVariableChange = {
        type: "CUSTOM_VARIABLE",
        uniqueId: "sorcerer.spell.slot.1.max",
        formula: { expression: "1" },
        bonusTypeId: "UNTYPED",
      };

      const character = createBaseSorcerer(1)
        .withBuff(buildBuff().withChange(buff1).build())
        .withBuff(buildBuff().withChange(buff2).build())
        .build();

      const sheet = calculateCharacterSheet(character);

      // Base 3 + 1 + 1 = 5
      const cge = sheet.cge["sorcerer-spells"];
      const level1Slots = cge.tracks[0].slots?.find(s => s.level === 1);

      expect(level1Slots?.max).toBe(5);
    });
  });

  describe("Buff modifying known max", () => {
    it("should allow a buff to add bonus known spells", () => {
      const bonusKnownChange: CustomVariableChange = {
        type: "CUSTOM_VARIABLE",
        uniqueId: "sorcerer.spell.known.1.max",
        formula: { expression: "1" },
        bonusTypeId: "UNTYPED",
      };

      const character = createBaseSorcerer(1)
        .withBuff(buildBuff().withChange(bonusKnownChange).build())
        .build();

      const sheet = calculateCharacterSheet(character);

      // Sorcerer level 1 has 2 known level 1 spells base, with +1 = 3
      const cge = sheet.cge["sorcerer-spells"];
      const level1Known = cge.knownLimits?.find(k => k.level === 1);

      expect(level1Known?.max).toBe(3);
    });
  });

  describe("Variable exposure", () => {
    it("should expose modified slot values in substitutionValues", () => {
      const bonusSlotsChange: CustomVariableChange = {
        type: "CUSTOM_VARIABLE",
        uniqueId: "sorcerer.spell.slot.1.max",
        formula: { expression: "2" },
        bonusTypeId: "UNTYPED",
      };

      const character = createBaseSorcerer(1)
        .withBuff(buildBuff().withChange(bonusSlotsChange).build())
        .build();

      const sheet = calculateCharacterSheet(character);

      // Both short key and customVariable prefixed key should have the value
      expect(sheet.substitutionValues["sorcerer.spell.slot.1.max"]).toBe(5);
      expect(sheet.substitutionValues["customVariable.sorcerer.spell.slot.1.max"]).toBe(5);
    });
  });
});
