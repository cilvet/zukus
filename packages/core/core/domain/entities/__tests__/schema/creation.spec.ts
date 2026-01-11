import { describe, it, expect } from "bun:test";
import { createEntitySchema, generateJsonSchema } from "../../index";
import { spellDefinition, featDefinition } from "../fixtures/testDefinitions";

describe("Schema Creation", () => {
  describe("createEntitySchema", () => {
    it("should create a valid Zod schema for spell definition", () => {
      const schema = createEntitySchema(spellDefinition);
      
      const validSpell = {
        id: "spell-1",
        name: "Fireball",
        entityType: "spell",
        level: 3,
        school: "Evocation",
        components: ["V", "S", "M"],
        metamagic: true,
        damageDice: [1, 6]
      };

      expect(() => schema.parse(validSpell)).not.toThrow();
    });

    it("should reject invalid data", () => {
      const schema = createEntitySchema(spellDefinition);
      
      const invalidSpell = {
        id: "spell-1",
        name: "Fireball",
        entityType: "spell",
        level: "three", // Should be integer
        school: "Evocation",
        components: [] // Should be non-empty
      };

      expect(() => schema.parse(invalidSpell)).toThrow();
    });

    it("should handle optional fields correctly", () => {
      const schema = createEntitySchema(spellDefinition);
      
      const spellWithoutOptionals = {
        id: "spell-2",
        name: "Magic Missile",
        entityType: "spell",
        level: 1,
        school: "Evocation",
        components: ["V", "S"]
      };

      expect(() => schema.parse(spellWithoutOptionals)).not.toThrow();
    });

    it("should create a valid Zod schema for feat definition with references", () => {
      const schema = createEntitySchema(featDefinition);
      
      const validFeat = {
        id: "feat-1",
        name: "Power Attack",
        entityType: "feat",
        prerequisites: ["base-attack-1"],
        requiredFeats: ["combat-expertise"],
        benefitType: "combat"
      };

      expect(() => schema.parse(validFeat)).not.toThrow();
    });

    it("should reject feat with empty required reference array", () => {
      const schema = createEntitySchema(featDefinition);
      
      const invalidFeat = {
        id: "feat-1",
        name: "Power Attack",
        entityType: "feat",
        requiredFeats: [], // Should be non-empty
        benefitType: "combat"
      };

      expect(() => schema.parse(invalidFeat)).toThrow();
    });
  });

  describe("generateJsonSchema", () => {
    it("should generate JSON schema from entity definition", () => {
      const jsonSchema = generateJsonSchema(spellDefinition);
      
      expect(jsonSchema).toBeDefined();
      expect(typeof jsonSchema).toBe("object");
    });
  });
});