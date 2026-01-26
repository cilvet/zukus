import { describe, it, expect } from "bun:test";
import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { createBaseSorcerer, createBaseWizard } from "./fixtures";
import {
  useSlot,
  refreshSlots,
  getSlotCurrentValue,
  getAllSlotCurrentValues,
  hasUsedSlots,
  addKnownEntity,
} from "../../../../cge";
import type { StandardEntity } from "../../../../entities/types/base";

// =============================================================================
// Test Spell Entities
// =============================================================================

const createSpell = (id: string, name: string): StandardEntity => ({
  id,
  name,
  entityType: "spell",
  description: `A ${name.toLowerCase()} spell`,
});

const SPELLS = {
  magicMissile: createSpell("magic-missile", "Magic Missile"),
  mageArmor: createSpell("mage-armor", "Mage Armor"),
  fireball: createSpell("fireball", "Fireball"),
};

// =============================================================================
// useSlot Tests
// =============================================================================

describe("CGE Slot Operations", () => {
  describe("useSlot", () => {
    it("should spend a level 1 slot", () => {
      let character = createBaseSorcerer(1).build();

      // Sorcerer level 1 has 3 level 1 slots
      const result = useSlot(character, "sorcerer-spells", 1);

      expect(result.warnings).toHaveLength(0);
      // Value is -1 because we didn't have a current value set (it was at max)
      expect(result.character.cgeState?.["sorcerer-spells"]?.slotCurrentValues?.["1"]).toBe(-1);
    });

    it("should track multiple slot uses", () => {
      let character = createBaseSorcerer(1).build();

      // Use 2 level 1 slots
      let result = useSlot(character, "sorcerer-spells", 1);
      result = useSlot(result.character, "sorcerer-spells", 1);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.cgeState?.["sorcerer-spells"]?.slotCurrentValues?.["1"]).toBe(-2);
    });

    it("should allow using cantrips (level 0)", () => {
      let character = createBaseSorcerer(1).build();

      const result = useSlot(character, "sorcerer-spells", 0);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.cgeState?.["sorcerer-spells"]?.slotCurrentValues?.["0"]).toBe(-1);
    });

    it("should use slots independently per level", () => {
      let character = createBaseSorcerer(4).build(); // Has level 1 and 2 slots

      let result = useSlot(character, "sorcerer-spells", 1);
      result = useSlot(result.character, "sorcerer-spells", 2);

      expect(result.character.cgeState?.["sorcerer-spells"]?.slotCurrentValues).toEqual({
        "1": -1,
        "2": -1,
      });
    });

    it("should allow overspending slots (value can go very negative)", () => {
      let character = createBaseSorcerer(1).build();

      // Sorcerer level 1 has 3 level 1 slots
      // Use all 3 slots plus one more (overspend)
      let result = useSlot(character, "sorcerer-spells", 1);
      result = useSlot(result.character, "sorcerer-spells", 1);
      result = useSlot(result.character, "sorcerer-spells", 1);
      result = useSlot(result.character, "sorcerer-spells", 1); // Overspend

      // No warnings from useSlot (we don't know max here)
      expect(result.warnings).toHaveLength(0);

      // Value is -4 (4 slots spent from max)
      expect(result.character.cgeState?.["sorcerer-spells"]?.slotCurrentValues?.["1"]).toBe(-4);

      // Character sheet will show negative current (3 max + (-4) = -1)
      const sheet = calculateCharacterSheet(result.character);
      const level1Slots = sheet.cge["sorcerer-spells"].tracks[0].slots?.find((s) => s.level === 1);
      expect(level1Slots?.current).toBe(-1); // Overspent by 1
    });

    it("should warn on invalid level", () => {
      let character = createBaseSorcerer(1).build();

      const result = useSlot(character, "sorcerer-spells", -1);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("invalid_level");
    });

    it("should initialize CGE state if it does not exist", () => {
      let character = createBaseSorcerer(1).build();

      const result = useSlot(character, "sorcerer-spells", 1);

      expect(result.character.cgeState).toBeDefined();
      expect(result.character.cgeState?.["sorcerer-spells"]).toBeDefined();
    });
  });

  describe("refreshSlots", () => {
    it("should restore all slots to max", () => {
      let character = createBaseSorcerer(1).build();

      // Use some slots first
      let result = useSlot(character, "sorcerer-spells", 0);
      result = useSlot(result.character, "sorcerer-spells", 1);
      result = useSlot(result.character, "sorcerer-spells", 1);

      // Verify slots were used
      expect(result.character.cgeState?.["sorcerer-spells"]?.slotCurrentValues).toBeDefined();

      // Refresh
      const refreshResult = refreshSlots(result.character, "sorcerer-spells");

      expect(refreshResult.warnings).toHaveLength(0);
      // slotCurrentValues should be removed (system defaults to max)
      expect(refreshResult.character.cgeState?.["sorcerer-spells"]?.slotCurrentValues).toBeUndefined();
    });

    it("should warn if CGE state does not exist", () => {
      const character = createBaseSorcerer(1).build();

      const result = refreshSlots(character, "nonexistent-cge");

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("cge_state_not_found");
    });

    it("should warn if slots are already at max", () => {
      let character = createBaseSorcerer(1).build();

      // Initialize CGE state without using any slots
      character = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1).character;

      const result = refreshSlots(character, "sorcerer-spells");

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("slots_already_full");
    });

    it("should preserve other CGE state when refreshing", () => {
      let character = createBaseSorcerer(1).build();

      // Add known entity and use slot
      character = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1).character;
      let result = useSlot(character, "sorcerer-spells", 1);

      // Verify knownSelections exists
      expect(result.character.cgeState?.["sorcerer-spells"]?.knownSelections).toBeDefined();

      // Refresh slots
      const refreshResult = refreshSlots(result.character, "sorcerer-spells");

      // knownSelections should still be there
      expect(refreshResult.character.cgeState?.["sorcerer-spells"]?.knownSelections).toBeDefined();
      // slotCurrentValues should be removed
      expect(refreshResult.character.cgeState?.["sorcerer-spells"]?.slotCurrentValues).toBeUndefined();
    });
  });

  describe("query functions", () => {
    it("getSlotCurrentValue should return current value", () => {
      let character = createBaseSorcerer(1).build();

      // Initially undefined (at max)
      expect(getSlotCurrentValue(character, "sorcerer-spells", 1)).toBeUndefined();

      // Use a slot
      let result = useSlot(character, "sorcerer-spells", 1);

      expect(getSlotCurrentValue(result.character, "sorcerer-spells", 1)).toBe(-1);
    });

    it("getAllSlotCurrentValues should return all values", () => {
      let character = createBaseSorcerer(4).build();

      let result = useSlot(character, "sorcerer-spells", 1);
      result = useSlot(result.character, "sorcerer-spells", 1);
      result = useSlot(result.character, "sorcerer-spells", 2);

      const values = getAllSlotCurrentValues(result.character, "sorcerer-spells");

      expect(values).toEqual({
        "1": -2,
        "2": -1,
      });
    });

    it("hasUsedSlots should return correct state", () => {
      let character = createBaseSorcerer(1).build();

      expect(hasUsedSlots(character, "sorcerer-spells")).toBe(false);

      let result = useSlot(character, "sorcerer-spells", 1);

      expect(hasUsedSlots(result.character, "sorcerer-spells")).toBe(true);
    });
  });

  describe("integration with calculateCharacterSheet", () => {
    it("should calculate correct current slots after using some", () => {
      let character = createBaseSorcerer(1).build();
      // Sorcerer level 1: 5 cantrips, 3 level 1 slots

      // Use 2 level 1 slots
      let result = useSlot(character, "sorcerer-spells", 1);
      result = useSlot(result.character, "sorcerer-spells", 1);

      const sheet = calculateCharacterSheet(result.character);

      const cge = sheet.cge["sorcerer-spells"];
      expect(cge).toBeDefined();

      const track = cge.tracks[0];
      const level1Slots = track.slots?.find((s) => s.level === 1);

      expect(level1Slots?.max).toBe(3);
      // slotCurrentValues stores -2 (delta), calculateCGE interprets as max + (-2) = 3 - 2 = 1
      expect(level1Slots?.current).toBe(1);
    });

    it("should show max slots after refresh", () => {
      let character = createBaseSorcerer(1).build();

      // Use some slots
      let result = useSlot(character, "sorcerer-spells", 1);
      result = useSlot(result.character, "sorcerer-spells", 1);

      // Refresh
      const refreshResult = refreshSlots(result.character, "sorcerer-spells");

      const sheet = calculateCharacterSheet(refreshResult.character);

      const cge = sheet.cge["sorcerer-spells"];
      const track = cge.tracks[0];
      const level1Slots = track.slots?.find((s) => s.level === 1);

      // After refresh, current should equal max
      expect(level1Slots?.current).toBe(level1Slots?.max);
    });

    it("should work with Wizard (BOUND preparation)", () => {
      let character = createBaseWizard(1).build();
      // Wizard level 1: 3 cantrips, 1 level 1 slot

      const result = useSlot(character, "wizard-spells", 1);

      const sheet = calculateCharacterSheet(result.character);

      const cge = sheet.cge["wizard-spells"];
      const track = cge.tracks[0];
      const level1Slots = track.slots?.find((s) => s.level === 1);

      expect(level1Slots?.max).toBe(1);
      // slotCurrentValues stores -1 (delta), calculateCGE interprets as max + (-1) = 1 - 1 = 0
      expect(level1Slots?.current).toBe(0);
    });
  });

  describe("real-world scenarios", () => {
    it("should simulate a typical adventuring day for a Sorcerer", () => {
      let character = createBaseSorcerer(1).build();
      // Sorcerer level 1: 5 cantrips, 3 level 1 slots

      // Morning: add known spells
      character = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1).character;
      character = addKnownEntity(character, "sorcerer-spells", SPELLS.mageArmor, 1).character;

      // Combat 1: cast 2 spells
      let result = useSlot(character, "sorcerer-spells", 1);
      result = useSlot(result.character, "sorcerer-spells", 1);

      expect(hasUsedSlots(result.character, "sorcerer-spells")).toBe(true);

      // Combat 2: cast 1 more spell
      result = useSlot(result.character, "sorcerer-spells", 1);

      // Should have used 3 slots (all level 1 slots for a level 1 Sorcerer)
      const valuesAfterCombat = getAllSlotCurrentValues(result.character, "sorcerer-spells");
      expect(valuesAfterCombat["1"]).toBe(-3);

      // Long rest
      const afterRest = refreshSlots(result.character, "sorcerer-spells");

      expect(hasUsedSlots(afterRest.character, "sorcerer-spells")).toBe(false);

      // Verify slots are back to max
      const sheet = calculateCharacterSheet(afterRest.character);
      const cge = sheet.cge["sorcerer-spells"];
      const level1Slots = cge.tracks[0].slots?.find((s) => s.level === 1);
      expect(level1Slots?.current).toBe(level1Slots?.max);
    });
  });
});
