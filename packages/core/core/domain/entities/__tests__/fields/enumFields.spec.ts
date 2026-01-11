import { describe, it, expect } from "bun:test";
import { 
  createEntitySchema, 
  validateEntity, 
  generateFacets, 
  createEntityInstance,
  hasAllowedValues,
  isStringFieldWithValues,
  isStringArrayFieldWithValues,
  isIntegerFieldWithValues,
  isIntegerArrayFieldWithValues
} from "../../index";
import { classDefinition } from "../fixtures/testDefinitions";

describe("Enum Fields Support", () => {
  describe("Schema validation with predefined values", () => {
    it("should validate entity with predefined string values", () => {
      const schema = createEntitySchema(classDefinition);
      
      const validClass = {
        id: "class-1",
        name: "Fighter",
        entityType: "class",
        hitDie: 10,
        savingThrows: ["fort"],
        alignment: "lawful"
      };

      expect(() => schema.parse(validClass)).not.toThrow();
    });

    it("should reject entity with invalid predefined values", () => {
      const schema = createEntitySchema(classDefinition);
      
      const invalidClass = {
        id: "class-1",
        name: "Fighter",
        entityType: "class",
        hitDie: 7, // Not in allowed values [4, 6, 8, 10, 12]
        savingThrows: ["fort"],
        alignment: "lawful"
      };

      expect(() => schema.parse(invalidClass)).toThrow();
    });

    it("should reject entity with invalid string enum value", () => {
      const schema = createEntitySchema(classDefinition);
      
      const invalidClass = {
        id: "class-1",
        name: "Fighter",
        entityType: "class",
        hitDie: 10,
        savingThrows: ["fort"],
        alignment: "evil" // Not in allowed values ["lawful", "neutral", "chaotic"]
      };

      expect(() => schema.parse(invalidClass)).toThrow();
    });

    it("should reject entity with invalid array enum values", () => {
      const schema = createEntitySchema(classDefinition);
      
      const invalidClass = {
        id: "class-1",
        name: "Fighter",
        entityType: "class",
        hitDie: 10,
        savingThrows: ["fort", "invalid"], // "invalid" not in allowed values
        alignment: "lawful"
      };

      expect(() => schema.parse(invalidClass)).toThrow();
    });

    it("should validate entity with multiple valid enum array values", () => {
      const schema = createEntitySchema(classDefinition);
      
      const validClass = {
        id: "class-1",
        name: "Paladin",
        entityType: "class",
        hitDie: 10,
        savingThrows: ["fort", "will"], // Both valid
        alignment: "lawful"
      };

      expect(() => schema.parse(validClass)).not.toThrow();
    });

    it("should handle optional enum fields", () => {
      const schema = createEntitySchema(classDefinition);
      
      const validClass = {
        id: "class-1",
        name: "Fighter",
        entityType: "class",
        hitDie: 10,
        savingThrows: ["fort"],
        alignment: "lawful"
        // spellLevels is optional, not provided
      };

      expect(() => schema.parse(validClass)).not.toThrow();

      const validClassWithOptional = {
        id: "class-2",
        name: "Wizard",
        entityType: "class",
        hitDie: 4,
        savingThrows: ["will"],
        alignment: "neutral",
        spellLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      };

      expect(() => schema.parse(validClassWithOptional)).not.toThrow();
    });
  });

  describe("Type guards for enum fields", () => {
    it("should correctly identify fields with allowed values", () => {
      const stringFieldWithValues = {
        name: "alignment",
        type: "string" as const,
        allowedValues: ["lawful", "neutral", "chaotic"]
      };

      const stringFieldWithoutValues = {
        name: "description",
        type: "string" as const
      };

      expect(hasAllowedValues(stringFieldWithValues)).toBe(true);
      expect(hasAllowedValues(stringFieldWithoutValues)).toBe(false);
    });

    it("should correctly identify string fields with values", () => {
      const stringFieldWithValues = {
        name: "alignment",
        type: "string" as const,
        allowedValues: ["lawful", "neutral", "chaotic"]
      };

      const intFieldWithValues = {
        name: "hitDie",
        type: "integer" as const,
        allowedValues: [4, 6, 8, 10, 12]
      };

      expect(isStringFieldWithValues(stringFieldWithValues)).toBe(true);
      expect(isStringFieldWithValues(intFieldWithValues)).toBe(false);
    });

    it("should correctly identify string array fields with values", () => {
      const stringArrayFieldWithValues = {
        name: "savingThrows",
        type: "string_array" as const,
        allowedValues: ["fort", "ref", "will"]
      };

      const stringFieldWithValues = {
        name: "alignment",
        type: "string" as const,
        allowedValues: ["lawful", "neutral", "chaotic"]
      };

      expect(isStringArrayFieldWithValues(stringArrayFieldWithValues)).toBe(true);
      expect(isStringArrayFieldWithValues(stringFieldWithValues)).toBe(false);
    });

    it("should correctly identify integer fields with values", () => {
      const intFieldWithValues = {
        name: "hitDie",
        type: "integer" as const,
        allowedValues: [4, 6, 8, 10, 12]
      };

      const stringFieldWithValues = {
        name: "alignment",
        type: "string" as const,
        allowedValues: ["lawful", "neutral", "chaotic"]
      };

      expect(isIntegerFieldWithValues(intFieldWithValues)).toBe(true);
      expect(isIntegerFieldWithValues(stringFieldWithValues)).toBe(false);
    });

    it("should correctly identify integer array fields with values", () => {
      const intArrayFieldWithValues = {
        name: "spellLevels",
        type: "integer_array" as const,
        allowedValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      };

      const intFieldWithValues = {
        name: "hitDie",
        type: "integer" as const,
        allowedValues: [4, 6, 8, 10, 12]
      };

      expect(isIntegerArrayFieldWithValues(intArrayFieldWithValues)).toBe(true);
      expect(isIntegerArrayFieldWithValues(intFieldWithValues)).toBe(false);
    });
  });

  describe("Complex enum field scenarios", () => {
    it("should handle mixed field types with and without enums", () => {
      const mixedDefinition = {
        typeName: "mixed",
        fields: [
          { name: "enumString", type: "string" as const, allowedValues: ["a", "b", "c"] },
          { name: "freeString", type: "string" as const },
          { name: "enumInt", type: "integer" as const, allowedValues: [1, 2, 3] },
          { name: "freeInt", type: "integer" as const },
          { name: "enumStringArray", type: "string_array" as const, allowedValues: ["x", "y", "z"] },
          { name: "freeStringArray", type: "string_array" as const }
        ]
      };

      const schema = createEntitySchema(mixedDefinition);
      
      const validEntity = {
        id: "mixed-1",
        name: "Mixed Entity",
        entityType: "mixed",
        enumString: "a",
        freeString: "any string",
        enumInt: 2,
        freeInt: 999,
        enumStringArray: ["x", "z"],
        freeStringArray: ["any", "values", "here"]
      };

      expect(() => schema.parse(validEntity)).not.toThrow();

      const invalidEntity = {
        id: "mixed-2",
        name: "Invalid Mixed",
        entityType: "mixed",
        enumString: "invalid", // Not in allowed values
        freeString: "any string",
        enumInt: 2,
        freeInt: 999,
        enumStringArray: ["x", "z"],
        freeStringArray: ["any", "values", "here"]
      };

      expect(() => schema.parse(invalidEntity)).toThrow();
    });

    it("should create instances with correct enum defaults", () => {
      const instance = createEntityInstance(classDefinition, {
        id: "default-class",
        name: "Default Class"
      });

      expect((instance as any).hitDie).toBe(4); // First allowed value
      expect((instance as any).alignment).toBe("lawful"); // First allowed value
      expect((instance as any).savingThrows).toEqual(["fort"]); // First allowed value in non-empty array
      expect((instance as any).spellLevels).toBeUndefined(); // Optional field
    });

    it("should generate appropriate facets for enum fields", () => {
      const sampleClasses = [
        {
          id: "1",
          name: "Fighter",
          entityType: "class",
          hitDie: 10,
          alignment: "lawful",
          savingThrows: ["fort"]
        } as any
      ];

      const facets = generateFacets(classDefinition, sampleClasses);
      
      const hitDieFacet = facets.find(f => f.fieldName === "hitDie");
      const alignmentFacet = facets.find(f => f.fieldName === "alignment");
      const savingThrowsFacet = facets.find(f => f.fieldName === "savingThrows");

      // Should use predefined values instead of extracting from entities
      expect(hitDieFacet?.type).toBe("select");
      expect(hitDieFacet?.options).toEqual([4, 6, 8, 10, 12]);
      
      expect(alignmentFacet?.type).toBe("select");
      expect(alignmentFacet?.options).toEqual(["lawful", "neutral", "chaotic"]);
      
      expect(savingThrowsFacet?.type).toBe("multiselect");
      expect(savingThrowsFacet?.options).toEqual(["fort", "ref", "will"]);
    });
  });
});