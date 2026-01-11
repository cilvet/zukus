import { describe, it, expect } from "bun:test";
import { 
  createEntitySchema, 
  createEntityInstance
} from "../../index";
import type { EntitySchemaDefinition } from "../../types/schema";

describe("Source Addon Support", () => {
  
  const definitionWithSource: EntitySchemaDefinition = {
    typeName: "spell_with_source",
    description: "Spell with source metadata",
    addons: ["source"], // Enable source addon
    fields: [
      {
        name: "level",
        type: "integer",
        description: "Spell level"
      },
      {
        name: "school",
        type: "string",
        description: "School of magic"
      }
    ]
  };

  const definitionWithoutSource: EntitySchemaDefinition = {
    typeName: "spell_without_source",
    description: "Spell without source metadata",
    fields: [
      {
        name: "level",
        type: "integer"
      }
    ]
  };

  describe("Schema validation with source addon", () => {
    it("should validate entity with complete source data", () => {
      const schema = createEntitySchema(definitionWithSource);
      
      const validSpell = {
        id: "fireball",
        name: "Fireball",
        entityType: "spell_with_source",
        level: 3,
        school: "Evocation",
        source: {
          compendiumId: "srd-3.5",
          page: 231,
          edition: "3.5"
        }
      };

      expect(() => schema.parse(validSpell)).not.toThrow();
    });

    it("should validate entity with minimal source data (only compendiumId)", () => {
      const schema = createEntitySchema(definitionWithSource);
      
      const validSpell = {
        id: "magic-missile",
        name: "Magic Missile",
        entityType: "spell_with_source",
        level: 1,
        school: "Evocation",
        source: {
          compendiumId: "phb"
        }
      };

      expect(() => schema.parse(validSpell)).not.toThrow();
    });

    it("should validate entity with source including page number", () => {
      const schema = createEntitySchema(definitionWithSource);
      
      const validSpell = {
        id: "lightning-bolt",
        name: "Lightning Bolt",
        entityType: "spell_with_source",
        level: 3,
        school: "Evocation",
        source: {
          compendiumId: "phb",
          page: 298
        }
      };

      expect(() => schema.parse(validSpell)).not.toThrow();
    });

    it("should reject entity with missing compendiumId in source", () => {
      const schema = createEntitySchema(definitionWithSource);
      
      const invalidSpell = {
        id: "invalid-spell",
        name: "Invalid Spell",
        entityType: "spell_with_source",
        level: 1,
        school: "Evocation",
        source: {
          page: 100 // Missing compendiumId
        }
      };

      expect(() => schema.parse(invalidSpell)).toThrow();
    });

    it("should reject entity with invalid page number type", () => {
      const schema = createEntitySchema(definitionWithSource);
      
      const invalidSpell = {
        id: "invalid-page",
        name: "Invalid Page",
        entityType: "spell_with_source",
        level: 1,
        school: "Evocation",
        source: {
          compendiumId: "phb",
          page: "298" // Should be number
        }
      };

      expect(() => schema.parse(invalidSpell)).toThrow();
    });

    it("should allow optional source field when addon is enabled", () => {
      const schema = createEntitySchema(definitionWithSource);
      
      const validSpell = {
        id: "custom-spell",
        name: "Custom Spell",
        entityType: "spell_with_source",
        level: 2,
        school: "Abjuration"
        // source is optional, not provided
      };

      // Source addon should make the field optional
      expect(() => schema.parse(validSpell)).not.toThrow();
    });
  });

  describe("Schema without source addon", () => {
    it("should not have source field when addon is not enabled", () => {
      const schema = createEntitySchema(definitionWithoutSource);
      
      const validSpell = {
        id: "basic-spell",
        name: "Basic Spell",
        entityType: "spell_without_source",
        level: 1
      };

      expect(() => schema.parse(validSpell)).not.toThrow();
    });

    it("should allow extra fields including source in entities without addon", () => {
      const schema = createEntitySchema(definitionWithoutSource);
      
      // Zod's passthrough should allow extra fields
      const spellWithSource = {
        id: "spell-extra",
        name: "Spell with Extra",
        entityType: "spell_without_source",
        level: 1,
        source: {
          compendiumId: "custom"
        }
      };

      // Should not throw - extra fields are allowed
      expect(() => schema.parse(spellWithSource)).not.toThrow();
    });
  });

  describe("Source addon field structure", () => {
    it("should preserve source structure in parsed entity", () => {
      const schema = createEntitySchema(definitionWithSource);
      
      const spellData = {
        id: "power-word-kill",
        name: "Power Word Kill",
        entityType: "spell_with_source",
        level: 9,
        school: "Enchantment",
        source: {
          compendiumId: "srd-3.5",
          page: 264,
          edition: "3.5"
        }
      };

      const parsed = schema.parse(spellData);
      
      expect((parsed as any).source).toBeDefined();
      expect((parsed as any).source.compendiumId).toBe("srd-3.5");
      expect((parsed as any).source.page).toBe(264);
      expect((parsed as any).source.edition).toBe("3.5");
    });
  });

  describe("Instance creation with source addon", () => {
    it("should create instance without source field by default", () => {
      const instance = createEntityInstance(definitionWithSource, {
        id: "new-spell",
        name: "New Spell"
      });

      // Source is optional, so it should be undefined
      expect((instance as any).source).toBeUndefined();
    });

    it("should create instance with provided source data", () => {
      const instance = createEntityInstance(definitionWithSource, {
        id: "custom-spell",
        name: "Custom Spell",
        source: {
          compendiumId: "homebrew",
          page: 42
        }
      });

      expect((instance as any).source).toBeDefined();
      expect((instance as any).source.compendiumId).toBe("homebrew");
      expect((instance as any).source.page).toBe(42);
    });
  });

  describe("Multiple addons compatibility", () => {
    it("should work with multiple addons including source", () => {
      const multiAddonDefinition: EntitySchemaDefinition = {
        typeName: "feat_with_addons",
        description: "Feat with multiple addons",
        addons: ["searchable", "taggable", "source"],
        fields: [
          {
            name: "prerequisite",
            type: "string",
            optional: true
          }
        ]
      };

      const schema = createEntitySchema(multiAddonDefinition);
      
      const validFeat = {
        id: "power-attack",
        name: "Power Attack",
        entityType: "feat_with_addons",
        description: "Trade accuracy for damage",
        tags: ["combat", "fighter"],
        source: {
          compendiumId: "phb",
          page: 98
        },
        prerequisite: "Str 13+"
      };

      expect(() => schema.parse(validFeat)).not.toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should handle source with very long compendiumId", () => {
      const schema = createEntitySchema(definitionWithSource);
      
      const validSpell = {
        id: "spell-1",
        name: "Test Spell",
        entityType: "spell_with_source",
        level: 1,
        school: "Evocation",
        source: {
          compendiumId: "very-long-compendium-name-with-multiple-words-and-dashes-2024-edition-expanded"
        }
      };

      expect(() => schema.parse(validSpell)).not.toThrow();
    });

    it("should handle source with page number zero", () => {
      const schema = createEntitySchema(definitionWithSource);
      
      const validSpell = {
        id: "intro-spell",
        name: "Introduction Spell",
        entityType: "spell_with_source",
        level: 0,
        school: "Universal",
        source: {
          compendiumId: "phb",
          page: 0 // Valid page number
        }
      };

      expect(() => schema.parse(validSpell)).not.toThrow();
    });

    it("should handle source with edition containing special characters", () => {
      const schema = createEntitySchema(definitionWithSource);
      
      const validSpell = {
        id: "updated-spell",
        name: "Updated Spell",
        entityType: "spell_with_source",
        level: 2,
        school: "Transmutation",
        source: {
          compendiumId: "errata",
          edition: "3.5e (2024 reprint)"
        }
      };

      expect(() => schema.parse(validSpell)).not.toThrow();
    });
  });
});

