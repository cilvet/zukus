import { describe, it, expect } from "bun:test";
import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { createBaseSorcerer } from "./fixtures";
import {
  addKnownEntity,
  removeKnownEntity,
  getKnownEntitiesByCGE,
  getKnownEntitiesByLevel,
  getKnownCountsByLevel,
  getTotalKnownCount,
  isEntityKnown,
} from "../../../../cge/knownOperations";
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
  burningHands: createSpell("burning-hands", "Burning Hands"),
  prestidigitation: createSpell("prestidigitation", "Prestidigitation"),
  detectMagic: createSpell("detect-magic", "Detect Magic"),
  fireball: createSpell("fireball", "Fireball"),
};

describe("CGE Known Operations", () => {
  describe("addKnownEntity", () => {
    it("should add an entity to the known pool", () => {
      const character = createBaseSorcerer(1).build();

      const result = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.cgeState?.["sorcerer-spells"]?.knownSelections?.["1"]).toEqual([
        "magic-missile",
      ]);
    });

    it("should create an EntityInstance in character.entities", () => {
      const character = createBaseSorcerer(1).build();

      const result = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1);

      const spellInstances = result.character.entities?.["spell"] ?? [];
      expect(spellInstances).toHaveLength(1);
      expect(spellInstances[0].instanceId).toBe("magic-missile@cge:sorcerer-spells");
      expect(spellInstances[0].entity.id).toBe("magic-missile");
      expect(spellInstances[0].applicable).toBe(true);
      expect(spellInstances[0].origin).toBe("cge:sorcerer-spells");
    });

    it("should add multiple entities to the same level", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.mageArmor, 1);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.cgeState?.["sorcerer-spells"]?.knownSelections?.["1"]).toEqual([
        "magic-missile",
        "mage-armor",
      ]);

      // Both should be in entities
      const spellInstances = result.character.entities?.["spell"] ?? [];
      expect(spellInstances).toHaveLength(2);
    });

    it("should add entities to different levels", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.prestidigitation, 0);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.magicMissile, 1);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.cgeState?.["sorcerer-spells"]?.knownSelections?.["0"]).toEqual([
        "prestidigitation",
      ]);
      expect(result.character.cgeState?.["sorcerer-spells"]?.knownSelections?.["1"]).toEqual([
        "magic-missile",
      ]);
    });

    it("should warn if entity is already known", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.magicMissile, 1);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("entity_already_known");
      // Should not duplicate the entity
      expect(result.character.cgeState?.["sorcerer-spells"]?.knownSelections?.["1"]).toEqual([
        "magic-missile",
      ]);
    });
  });

  describe("removeKnownEntity", () => {
    it("should remove an entity from the known pool", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.mageArmor, 1);
      result = removeKnownEntity(result.character, "sorcerer-spells", "magic-missile");

      expect(result.warnings).toHaveLength(0);
      expect(result.character.cgeState?.["sorcerer-spells"]?.knownSelections?.["1"]).toEqual([
        "mage-armor",
      ]);
    });

    it("should remove the EntityInstance from character.entities", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.mageArmor, 1);

      // Verify both entities exist
      expect(result.character.entities?.["spell"]).toHaveLength(2);

      result = removeKnownEntity(result.character, "sorcerer-spells", "magic-missile");

      // Only mage-armor should remain
      const spellInstances = result.character.entities?.["spell"] ?? [];
      expect(spellInstances).toHaveLength(1);
      expect(spellInstances[0].entity.id).toBe("mage-armor");
    });

    it("should remove entity regardless of level", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.fireball, 3);
      result = removeKnownEntity(result.character, "sorcerer-spells", "fireball");

      expect(result.warnings).toHaveLength(0);
      expect(result.character.cgeState?.["sorcerer-spells"]?.knownSelections?.["3"]).toBeUndefined();
      expect(result.character.entities?.["spell"]).toBeUndefined();
    });

    it("should warn if entity is not found", () => {
      const character = createBaseSorcerer(1).build();

      const result = removeKnownEntity(character, "sorcerer-spells", "nonexistent-spell");

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("cge_not_found");
    });

    it("should warn if entity is not in the known pool", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1);
      result = removeKnownEntity(result.character, "sorcerer-spells", "nonexistent-spell");

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("entity_not_found");
    });
  });

  describe("query functions", () => {
    it("getKnownEntitiesByCGE should return all known entities", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.prestidigitation, 0);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.detectMagic, 0);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.magicMissile, 1);

      const known = getKnownEntitiesByCGE(result.character, "sorcerer-spells");

      expect(known["0"]).toEqual(["prestidigitation", "detect-magic"]);
      expect(known["1"]).toEqual(["magic-missile"]);
    });

    it("getKnownEntitiesByLevel should return entities for a specific level", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.prestidigitation, 0);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.magicMissile, 1);

      expect(getKnownEntitiesByLevel(result.character, "sorcerer-spells", 0)).toEqual([
        "prestidigitation",
      ]);
      expect(getKnownEntitiesByLevel(result.character, "sorcerer-spells", 1)).toEqual([
        "magic-missile",
      ]);
      expect(getKnownEntitiesByLevel(result.character, "sorcerer-spells", 2)).toEqual([]);
    });

    it("getKnownCountsByLevel should return counts per level", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.prestidigitation, 0);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.detectMagic, 0);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.magicMissile, 1);

      const counts = getKnownCountsByLevel(result.character, "sorcerer-spells");

      expect(counts[0]).toBe(2);
      expect(counts[1]).toBe(1);
    });

    it("getTotalKnownCount should return total known entities", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.prestidigitation, 0);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.detectMagic, 0);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.magicMissile, 1);

      expect(getTotalKnownCount(result.character, "sorcerer-spells")).toBe(3);
    });

    it("isEntityKnown should check if entity is known", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1);

      expect(isEntityKnown(result.character, "sorcerer-spells", "magic-missile")).toBe(true);
      expect(isEntityKnown(result.character, "sorcerer-spells", "fireball")).toBe(false);
    });
  });

  describe("integration with calculateCharacterSheet", () => {
    it("should count known entities in knownLimits.current", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.prestidigitation, 0);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.detectMagic, 0);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.magicMissile, 1);

      const sheet = calculateCharacterSheet(result.character);

      const cge = sheet.cge["sorcerer-spells"];
      expect(cge).toBeDefined();

      // Cantrips: 2 known (max is 4)
      const cantrips = cge.knownLimits?.find((k) => k.level === 0);
      expect(cantrips?.current).toBe(2);
      expect(cantrips?.max).toBe(4);

      // Level 1: 1 known (max is 2)
      const level1 = cge.knownLimits?.find((k) => k.level === 1);
      expect(level1?.current).toBe(1);
      expect(level1?.max).toBe(2);
    });

    it("should expose known.current in substitutionValues", () => {
      let character = createBaseSorcerer(1).build();

      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.prestidigitation, 0);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.magicMissile, 1);

      const sheet = calculateCharacterSheet(result.character);

      expect(sheet.substitutionValues["sorcerer.spell.known.0.current"]).toBe(1);
      expect(sheet.substitutionValues["sorcerer.spell.known.1.current"]).toBe(1);
    });

    it("should generate warning when exceeding known limit", () => {
      let character = createBaseSorcerer(1).build();

      // Sorcerer level 1 can know 2 level 1 spells
      // Adding 3 should trigger a warning
      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.mageArmor, 1);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.burningHands, 1);

      const sheet = calculateCharacterSheet(result.character);

      // Should have warning for exceeding limit
      const knownWarning = sheet.warnings.find((w) => w.type === "known_limit_exceeded");
      expect(knownWarning).toBeDefined();
      expect(knownWarning?.message).toContain("3/2");
      expect(knownWarning?.message).toContain("1 over limit");

      // Current should still reflect 3 (we don't restrict)
      const level1 = sheet.cge["sorcerer-spells"].knownLimits?.find((k) => k.level === 1);
      expect(level1?.current).toBe(3);
      expect(level1?.max).toBe(2);
    });

    it("should NOT generate warning when within limits", () => {
      let character = createBaseSorcerer(1).build();

      // Add exactly at the limit (2 level 1 spells)
      let result = addKnownEntity(character, "sorcerer-spells", SPELLS.magicMissile, 1);
      result = addKnownEntity(result.character, "sorcerer-spells", SPELLS.mageArmor, 1);

      const sheet = calculateCharacterSheet(result.character);

      const knownWarning = sheet.warnings.find((w) => w.type === "known_limit_exceeded");
      expect(knownWarning).toBeUndefined();
    });
  });
});
