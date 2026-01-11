import { describe, it, expect } from "bun:test";
import { validateEntity } from "../../index";
import { spellDefinition, discoveryDefinition, featDefinition } from "../fixtures/testDefinitions";

describe("Schema Validation", () => {
  describe("validateEntity", () => {
    it("should validate a correct entity", () => {
      const entity = {
        id: "spell-1",
        name: "Fireball",
        entityType: "spell",
        level: 3,
        school: "Evocation",
        components: ["V", "S", "M"]
      };

      const result = validateEntity(entity, spellDefinition);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should return errors for invalid entity", () => {
      const entity = {
        id: "spell-1",
        name: "Fireball",
        entityType: "spell",
        level: "invalid", // Should be number
        school: "Evocation",
        components: [] // Should be non-empty
      };

      const result = validateEntity(entity, spellDefinition);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it("should validate entities with optional fields", () => {
      const entity = {
        id: "discovery-1",
        name: "Bomb",
        entityType: "discovery",
        prerequisiteLevel: 1
      };

      const result = validateEntity(entity, discoveryDefinition);
      expect(result.valid).toBe(true);
    });

    it("should return errors for invalid reference fields", () => {
      const entity = {
        id: "feat-1",
        name: "Power Attack",
        entityType: "feat",
        prerequisites: "invalid", // Should be array
        requiredFeats: [],         // Should be non-empty
        benefitType: "combat"
      };

      const result = validateEntity(entity, featDefinition);
      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it("should handle missing required fields", () => {
      const entity = {
        id: "spell-1",
        name: "Fireball",
        entityType: "spell"
        // Missing required fields: level, school, components
      };

      const result = validateEntity(entity, spellDefinition);
      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it("should validate complex entities with all field types", () => {
      const entity = {
        id: "complex-spell",
        name: "Complex Spell",
        entityType: "spell",
        level: 5,
        school: "Transmutation",
        components: ["V", "S", "M"],
        metamagic: true,
        damageDice: [3, 6, 8]
      };

      const result = validateEntity(entity, spellDefinition);
      expect(result.valid).toBe(true);
    });
  });
});