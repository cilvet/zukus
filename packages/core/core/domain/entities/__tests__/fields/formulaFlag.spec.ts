import { describe, it, expect } from "bun:test";
import { 
  createEntitySchema, 
  createEntityInstance
} from "../../index";
import type { EntitySchemaDefinition } from "../../types/schema";
import type { EntityFieldDefinition } from "../../types/fields";

describe("Formula Flag Support", () => {
  
  const definitionWithFormulas: EntitySchemaDefinition = {
    typeName: "class_with_formulas",
    description: "Class with formula fields",
    fields: [
      {
        name: "skillPointsPerLevel",
        type: "string",
        description: "Skill points gained per level",
        isFormula: true
      },
      {
        name: "regularDescription",
        type: "string",
        description: "Regular text field"
        // isFormula is undefined/false
      },
      {
        name: "bonusFormula",
        type: "string",
        description: "Bonus calculation formula",
        isFormula: true,
        optional: true
      }
    ]
  };

  describe("Schema validation with isFormula flag", () => {
    it("should validate entity with formula field containing formula syntax", () => {
      const schema = createEntitySchema(definitionWithFormulas);
      
      const validEntity = {
        id: "class-1",
        name: "Wizard",
        entityType: "class_with_formulas",
        skillPointsPerLevel: "2 + @ability.intelligence.modifier",
        regularDescription: "A powerful spellcaster"
      };

      expect(() => schema.parse(validEntity)).not.toThrow();
    });

    it("should validate entity with formula field containing simple values", () => {
      const schema = createEntitySchema(definitionWithFormulas);
      
      const validEntity = {
        id: "class-2",
        name: "Fighter",
        entityType: "class_with_formulas",
        skillPointsPerLevel: "4",
        regularDescription: "A martial warrior"
      };

      expect(() => schema.parse(validEntity)).not.toThrow();
    });

    it("should validate formula fields as strings", () => {
      const schema = createEntitySchema(definitionWithFormulas);
      
      // Formula fields should accept any string value
      const validEntity = {
        id: "class-3",
        name: "Rogue",
        entityType: "class_with_formulas",
        skillPointsPerLevel: "@characterLevel * 2 + 4",
        regularDescription: "A stealthy character"
      };

      expect(() => schema.parse(validEntity)).not.toThrow();
    });

    it("should reject formula field with non-string value", () => {
      const schema = createEntitySchema(definitionWithFormulas);
      
      const invalidEntity = {
        id: "class-4",
        name: "Invalid",
        entityType: "class_with_formulas",
        skillPointsPerLevel: 42, // Should be string
        regularDescription: "Description"
      };

      expect(() => schema.parse(invalidEntity)).toThrow();
    });

    it("should handle optional formula fields", () => {
      const schema = createEntitySchema(definitionWithFormulas);
      
      const validEntity = {
        id: "class-5",
        name: "Barbarian",
        entityType: "class_with_formulas",
        skillPointsPerLevel: "4",
        regularDescription: "A savage warrior"
        // bonusFormula is optional, not provided
      };

      expect(() => schema.parse(validEntity)).not.toThrow();

      const validWithOptional = {
        id: "class-6",
        name: "Paladin",
        entityType: "class_with_formulas",
        skillPointsPerLevel: "2",
        regularDescription: "A holy warrior",
        bonusFormula: "@characterLevel / 2"
      };

      expect(() => schema.parse(validWithOptional)).not.toThrow();
    });
  });

  describe("Instance creation with formula fields", () => {
    it("should create instance with empty string default for formula fields", () => {
      const instance = createEntityInstance(definitionWithFormulas, {
        id: "default-class",
        name: "Default Class"
      });

      expect((instance as any).skillPointsPerLevel).toBe("");
      expect((instance as any).regularDescription).toBe("");
      expect((instance as any).bonusFormula).toBeUndefined(); // Optional field
    });

    it("should create instance with provided formula values", () => {
      const instance = createEntityInstance(definitionWithFormulas, {
        id: "custom-class",
        name: "Custom Class",
        skillPointsPerLevel: "4 + @ability.intelligence.modifier",
        regularDescription: "A custom class",
        bonusFormula: "@level * 2"
      });

      expect((instance as any).skillPointsPerLevel).toBe("4 + @ability.intelligence.modifier");
      expect((instance as any).regularDescription).toBe("A custom class");
      expect((instance as any).bonusFormula).toBe("@level * 2");
    });
  });

  describe("Edge cases", () => {
    it("should handle formula fields with allowed values", () => {
      // A field can theoretically have both isFormula and allowedValues
      // Though this might not make practical sense
      const mixedDefinition: EntitySchemaDefinition = {
        typeName: "mixed",
        fields: [
          {
            name: "preset_formula",
            type: "string",
            isFormula: true,
            allowedValues: ["2 + @level", "4 + @level", "@level * 2"]
          }
        ]
      };

      const schema = createEntitySchema(mixedDefinition);
      
      const validEntity = {
        id: "1",
        name: "Test",
        entityType: "mixed",
        preset_formula: "2 + @level"
      };

      expect(() => schema.parse(validEntity)).not.toThrow();
    });

    it("should handle very long formula strings", () => {
      const schema = createEntitySchema(definitionWithFormulas);
      
      const longFormula = "(@characterLevel * 2) + @ability.intelligence.modifier + @ability.wisdom.modifier + floor(@characterLevel / 3) + max(1, @ability.charisma.modifier)";
      
      const validEntity = {
        id: "class-long",
        name: "Complex Class",
        entityType: "class_with_formulas",
        skillPointsPerLevel: longFormula,
        regularDescription: "Complex calculations"
      };

      expect(() => schema.parse(validEntity)).not.toThrow();
    });
  });
});

