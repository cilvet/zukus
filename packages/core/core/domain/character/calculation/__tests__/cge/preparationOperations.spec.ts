import { describe, it, expect } from "bun:test";
import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { createBaseWizard } from "./fixtures";
import {
  addKnownEntity,
  prepareEntityInSlot,
  unprepareSlot,
  unprepareEntity,
  getBoundPreparations,
  getPreparedEntityInSlot,
  getPreparationsByLevel,
  isSlotPrepared,
  getPreparationCountByEntity,
  getUniquePreparedEntities,
  getTotalPreparedCount,
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
  shield: createSpell("shield", "Shield"),
  burningHands: createSpell("burning-hands", "Burning Hands"),
  prestidigitation: createSpell("prestidigitation", "Prestidigitation"),
  detectMagic: createSpell("detect-magic", "Detect Magic"),
  light: createSpell("light", "Light"),
  fireball: createSpell("fireball", "Fireball"),
};

// =============================================================================
// Helper to add spell to spellbook
// =============================================================================

function addToSpellbook(
  character: ReturnType<typeof createBaseWizard>["build"],
  cgeId: string,
  spell: StandardEntity,
  level: number
) {
  return addKnownEntity(character, cgeId, spell, level).character;
}

describe("CGE Preparation Operations (Vancian)", () => {
  describe("prepareEntityInSlot", () => {
    it("should prepare an entity in a slot", () => {
      let character = createBaseWizard(1).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);

      const result = prepareEntityInSlot(
        character,
        "wizard-spells",
        1, // slot level
        0, // slot index
        "magic-missile"
      );

      expect(result.warnings).toHaveLength(0);
      // Slot IDs now include trackId: "base:level-index"
      expect(result.character.cgeState?.["wizard-spells"]?.boundPreparations).toEqual({
        "base:1-0": "magic-missile",
      });
    });

    it("should prepare multiple entities in different slots", () => {
      let character = createBaseWizard(1).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);
      character = addToSpellbook(character, "wizard-spells", SPELLS.mageArmor, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 0, "mage-armor");

      // Should replace the first preparation
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("slot_already_prepared");
      expect(result.character.cgeState?.["wizard-spells"]?.boundPreparations).toEqual({
        "base:1-0": "mage-armor",
      });
    });

    it("should allow same entity in multiple slots", () => {
      let character = createBaseWizard(2).build(); // Level 2: 4 cantrips, 2 level 1 slots
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 1, "magic-missile");

      expect(result.warnings).toHaveLength(0);
      expect(result.character.cgeState?.["wizard-spells"]?.boundPreparations).toEqual({
        "base:1-0": "magic-missile",
        "base:1-1": "magic-missile",
      });
    });

    it("should prepare in different levels", () => {
      let character = createBaseWizard(3).build(); // Level 3: 4 cantrips, 2 level 1, 1 level 2
      character = addToSpellbook(character, "wizard-spells", SPELLS.prestidigitation, 0);
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 0, 0, "prestidigitation");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 0, "magic-missile");

      expect(result.warnings).toHaveLength(0);
      expect(result.character.cgeState?.["wizard-spells"]?.boundPreparations).toEqual({
        "base:0-0": "prestidigitation",
        "base:1-0": "magic-missile",
      });
    });

    it("should warn when replacing existing preparation", () => {
      let character = createBaseWizard(1).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);
      character = addToSpellbook(character, "wizard-spells", SPELLS.mageArmor, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 0, "mage-armor");

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("slot_already_prepared");
      expect(result.warnings[0].message).toContain("magic-missile");
      expect(result.warnings[0].message).toContain("mage-armor");
    });
  });

  describe("unprepareSlot", () => {
    it("should remove preparation from a slot", () => {
      let character = createBaseWizard(1).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");
      result = unprepareSlot(result.character, "wizard-spells", 1, 0);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.cgeState?.["wizard-spells"]?.boundPreparations).toBeUndefined();
    });

    it("should keep other preparations when removing one", () => {
      let character = createBaseWizard(2).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);
      character = addToSpellbook(character, "wizard-spells", SPELLS.mageArmor, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 1, "mage-armor");
      result = unprepareSlot(result.character, "wizard-spells", 1, 0);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.cgeState?.["wizard-spells"]?.boundPreparations).toEqual({
        "base:1-1": "mage-armor",
      });
    });

    it("should warn if slot is not prepared", () => {
      let character = createBaseWizard(1).build();
      // Add to spellbook to initialize cgeState
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);

      const result = unprepareSlot(character, "wizard-spells", 1, 0);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("slot_not_prepared");
    });

    it("should warn if CGE does not exist", () => {
      const character = createBaseWizard(1).build();

      const result = unprepareSlot(character, "nonexistent-cge", 1, 0);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("cge_not_found");
    });
  });

  describe("unprepareEntity", () => {
    it("should remove all preparations of an entity", () => {
      let character = createBaseWizard(2).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);
      character = addToSpellbook(character, "wizard-spells", SPELLS.mageArmor, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 1, "magic-missile");

      const unprepareResult = unprepareEntity(result.character, "wizard-spells", "magic-missile");

      expect(unprepareResult.warnings).toHaveLength(0);
      expect(unprepareResult.removedCount).toBe(2);
      expect(unprepareResult.character.cgeState?.["wizard-spells"]?.boundPreparations).toBeUndefined();
    });

    it("should keep other entities when removing one", () => {
      let character = createBaseWizard(2).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);
      character = addToSpellbook(character, "wizard-spells", SPELLS.mageArmor, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 1, "mage-armor");

      const unprepareResult = unprepareEntity(result.character, "wizard-spells", "magic-missile");

      expect(unprepareResult.removedCount).toBe(1);
      expect(unprepareResult.character.cgeState?.["wizard-spells"]?.boundPreparations).toEqual({
        "base:1-1": "mage-armor",
      });
    });

    it("should return 0 if entity is not prepared", () => {
      let character = createBaseWizard(1).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);

      const result = unprepareEntity(character, "wizard-spells", "nonexistent");

      expect(result.removedCount).toBe(0);
    });
  });

  describe("query functions", () => {
    it("getBoundPreparations should return all preparations", () => {
      let character = createBaseWizard(2).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);
      character = addToSpellbook(character, "wizard-spells", SPELLS.mageArmor, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 1, "mage-armor");

      const preparations = getBoundPreparations(result.character, "wizard-spells");

      expect(preparations).toEqual({
        "base:1-0": "magic-missile",
        "base:1-1": "mage-armor",
      });
    });

    it("getPreparedEntityInSlot should return the entity in a slot", () => {
      let character = createBaseWizard(1).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");

      expect(getPreparedEntityInSlot(result.character, "wizard-spells", 1, 0)).toBe("magic-missile");
      expect(getPreparedEntityInSlot(result.character, "wizard-spells", 1, 1)).toBeUndefined();
    });

    it("getPreparationsByLevel should return sorted preparations", () => {
      let character = createBaseWizard(3).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);
      character = addToSpellbook(character, "wizard-spells", SPELLS.mageArmor, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 1, "mage-armor");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 0, "magic-missile");

      const level1Preps = getPreparationsByLevel(result.character, "wizard-spells", 1);

      expect(level1Preps).toEqual([
        { index: 0, entityId: "magic-missile" },
        { index: 1, entityId: "mage-armor" },
      ]);
    });

    it("isSlotPrepared should check slot status", () => {
      let character = createBaseWizard(1).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");

      expect(isSlotPrepared(result.character, "wizard-spells", 1, 0)).toBe(true);
      expect(isSlotPrepared(result.character, "wizard-spells", 1, 1)).toBe(false);
    });

    it("getPreparationCountByEntity should count preparations", () => {
      let character = createBaseWizard(2).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 1, "magic-missile");

      expect(getPreparationCountByEntity(result.character, "wizard-spells", "magic-missile")).toBe(2);
      expect(getPreparationCountByEntity(result.character, "wizard-spells", "other")).toBe(0);
    });

    it("getUniquePreparedEntities should return unique entities", () => {
      let character = createBaseWizard(3).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);
      character = addToSpellbook(character, "wizard-spells", SPELLS.mageArmor, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 1, "magic-missile");

      const unique = getUniquePreparedEntities(result.character, "wizard-spells");

      expect(unique).toEqual(["magic-missile"]);
    });

    it("getTotalPreparedCount should count all preparations", () => {
      let character = createBaseWizard(3).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);
      character = addToSpellbook(character, "wizard-spells", SPELLS.mageArmor, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 1, "mage-armor");

      expect(getTotalPreparedCount(result.character, "wizard-spells")).toBe(2);
    });
  });

  describe("integration with calculateCharacterSheet", () => {
    it("should include boundSlots in calculated slots", () => {
      let character = createBaseWizard(1).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");

      const sheet = calculateCharacterSheet(result.character);

      const cge = sheet.cge["wizard-spells"];
      expect(cge).toBeDefined();

      const track = cge.tracks[0];
      expect(track.preparationType).toBe("BOUND");

      const level1Slots = track.slots?.find((s) => s.level === 1);
      expect(level1Slots).toBeDefined();
      expect(level1Slots?.boundSlots).toBeDefined();
      expect(level1Slots?.boundSlots?.length).toBe(1); // Wizard level 1 has 1 level 1 slot
      expect(level1Slots?.boundSlots?.[0]).toEqual({
        slotId: "base:1-0",
        level: 1,
        index: 0,
        preparedEntityId: "magic-missile",
      });
    });

    it("should show empty slots when nothing is prepared", () => {
      const character = createBaseWizard(1).build();

      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge["wizard-spells"];
      const track = cge.tracks[0];
      const level1Slots = track.slots?.find((s) => s.level === 1);

      expect(level1Slots?.boundSlots?.[0].preparedEntityId).toBeUndefined();
    });

    it("should generate warning when prepared entity is not in spellbook", () => {
      let character = createBaseWizard(1).build();
      // Prepare without adding to spellbook first
      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "unknown-spell");

      const sheet = calculateCharacterSheet(result.character);

      const warning = sheet.warnings.find((w) => w.type === "prepared_entity_not_known");
      expect(warning).toBeDefined();
      expect(warning?.message).toContain("unknown-spell");
      expect(warning?.message).toContain("spellbook");
    });

    it("should NOT generate warning when prepared entity is in spellbook", () => {
      let character = createBaseWizard(1).build();
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);
      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");

      const sheet = calculateCharacterSheet(result.character);

      const warning = sheet.warnings.find((w) => w.type === "prepared_entity_not_known");
      expect(warning).toBeUndefined();
    });

    it("should generate warning when preparation is in out-of-bounds slot", () => {
      let character = createBaseWizard(1).build();
      // Wizard level 1 has only 1 level 1 slot (index 0), preparing in index 5 is invalid
      let result = prepareEntityInSlot(character, "wizard-spells", 1, 5, "magic-missile");

      const sheet = calculateCharacterSheet(result.character);

      const warning = sheet.warnings.find((w) => w.type === "preparation_slot_out_of_bounds");
      expect(warning).toBeDefined();
      expect(warning?.message).toContain("base:1-5");
      expect(warning?.message).toContain("out of bounds");
    });

    it("should have correct slot structure for multi-slot levels", () => {
      let character = createBaseWizard(4).build(); // Level 4: 4 cantrips, 3 level 1, 2 level 2
      character = addToSpellbook(character, "wizard-spells", SPELLS.magicMissile, 1);
      character = addToSpellbook(character, "wizard-spells", SPELLS.mageArmor, 1);
      character = addToSpellbook(character, "wizard-spells", SPELLS.shield, 1);

      let result = prepareEntityInSlot(character, "wizard-spells", 1, 0, "magic-missile");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 1, "mage-armor");
      result = prepareEntityInSlot(result.character, "wizard-spells", 1, 2, "shield");

      const sheet = calculateCharacterSheet(result.character);

      const cge = sheet.cge["wizard-spells"];
      const track = cge.tracks[0];
      const level1Slots = track.slots?.find((s) => s.level === 1);

      expect(level1Slots?.max).toBe(3);
      expect(level1Slots?.boundSlots).toHaveLength(3);
      expect(level1Slots?.boundSlots?.[0].preparedEntityId).toBe("magic-missile");
      expect(level1Slots?.boundSlots?.[1].preparedEntityId).toBe("mage-armor");
      expect(level1Slots?.boundSlots?.[2].preparedEntityId).toBe("shield");
    });
  });
});
