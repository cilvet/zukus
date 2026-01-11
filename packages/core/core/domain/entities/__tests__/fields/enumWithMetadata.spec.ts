import { describe, it, expect } from "bun:test";
import { 
  createEntitySchema, 
  createEntityInstance,
  generateFacets
} from "../../index";
import type { EntitySchemaDefinition } from "../../types/schema";

describe("Enum Fields with Metadata", () => {
  
  const classWithEnumDefinition: EntitySchemaDefinition = {
    typeName: "class_v2",
    description: "D&D Class with enum metadata",
    fields: [
      {
        name: "babProgression",
        type: "enum",
        description: "Base Attack Bonus progression",
        options: [
          { value: "full", name: "Completa", description: "+1 por nivel" },
          { value: "medium", name: "Media", description: "+3/4 por nivel" },
          { value: "poor", name: "Pobre", description: "+1/2 por nivel" }
        ]
      },
      {
        name: "hitDieValue",
        type: "enum",
        description: "Hit die value",
        options: [
          { value: 4, name: "d4", description: "Mínimo dado de golpe" },
          { value: 6, name: "d6" },
          { value: 8, name: "d8" },
          { value: 10, name: "d10" },
          { value: 12, name: "d12", description: "Máximo dado de golpe" }
        ]
      },
      {
        name: "spellcastingType",
        type: "enum",
        description: "Type of spellcasting",
        optional: true,
        options: [
          { value: "prepared", name: "Preparada", description: "Debe preparar hechizos" },
          { value: "spontaneous", name: "Espontánea", description: "Lanza sin preparar" },
          { value: "none", name: "Ninguna", description: "No lanza hechizos" }
        ]
      }
    ]
  };

  describe("Schema validation with enum metadata", () => {
    it("should validate entity with valid enum values", () => {
      const schema = createEntitySchema(classWithEnumDefinition);
      
      const validClass = {
        id: "class-1",
        name: "Fighter",
        entityType: "class_v2",
        babProgression: "full",
        hitDieValue: 10
      };

      expect(() => schema.parse(validClass)).not.toThrow();
    });

    it("should reject entity with invalid enum value", () => {
      const schema = createEntitySchema(classWithEnumDefinition);
      
      const invalidClass = {
        id: "class-2",
        name: "Invalid Class",
        entityType: "class_v2",
        babProgression: "super_full", // Not a valid value
        hitDieValue: 10
      };

      expect(() => schema.parse(invalidClass)).toThrow();
    });

    it("should reject entity with invalid enum number value", () => {
      const schema = createEntitySchema(classWithEnumDefinition);
      
      const invalidClass = {
        id: "class-3",
        name: "Invalid Class",
        entityType: "class_v2",
        babProgression: "full",
        hitDieValue: 7 // Not in enum options
      };

      expect(() => schema.parse(invalidClass)).toThrow();
    });

    it("should validate entity with optional enum field omitted", () => {
      const schema = createEntitySchema(classWithEnumDefinition);
      
      const validClass = {
        id: "class-4",
        name: "Fighter",
        entityType: "class_v2",
        babProgression: "full",
        hitDieValue: 10
        // spellcastingType is optional, not provided
      };

      expect(() => schema.parse(validClass)).not.toThrow();
    });

    it("should validate entity with optional enum field provided", () => {
      const schema = createEntitySchema(classWithEnumDefinition);
      
      const validClass = {
        id: "class-5",
        name: "Wizard",
        entityType: "class_v2",
        babProgression: "poor",
        hitDieValue: 4,
        spellcastingType: "prepared"
      };

      expect(() => schema.parse(validClass)).not.toThrow();
    });

    it("should reject entity with wrong type for enum value", () => {
      const schema = createEntitySchema(classWithEnumDefinition);
      
      const invalidClass = {
        id: "class-6",
        name: "Invalid Class",
        entityType: "class_v2",
        babProgression: 123, // Should be string
        hitDieValue: 10
      };

      expect(() => schema.parse(invalidClass)).toThrow();
    });
  });

  describe("Instance creation with enum fields", () => {
    it("should create instance with first enum value as default", () => {
      const instance = createEntityInstance(classWithEnumDefinition, {
        id: "default-class",
        name: "Default Class"
      });

      expect((instance as any).babProgression).toBe("full");
      expect((instance as any).hitDieValue).toBe(4);
      expect((instance as any).spellcastingType).toBeUndefined(); // Optional field
    });

    it("should create instance with provided enum values", () => {
      const instance = createEntityInstance(classWithEnumDefinition, {
        id: "wizard-class",
        name: "Wizard",
        babProgression: "poor",
        hitDieValue: 4,
        spellcastingType: "prepared"
      });

      expect((instance as any).babProgression).toBe("poor");
      expect((instance as any).hitDieValue).toBe(4);
      expect((instance as any).spellcastingType).toBe("prepared");
    });
  });

  describe("Facet generation for enum fields", () => {
    it("should generate facets using enum options", () => {
      const sampleClasses = [
        {
          id: "1",
          name: "Fighter",
          entityType: "class_v2",
          babProgression: "full",
          hitDieValue: 10
        } as any
      ];

      const facets = generateFacets(classWithEnumDefinition, sampleClasses);
      
      const babFacet = facets.find(f => f.fieldName === "babProgression");
      const hitDieFacet = facets.find(f => f.fieldName === "hitDieValue");

      expect(babFacet?.type).toBe("select");
      expect(babFacet?.options).toHaveLength(3);
      
      // Should include metadata in options
      expect(babFacet?.options).toEqual(expect.arrayContaining([
        expect.objectContaining({ 
          value: "full", 
          name: "Completa", 
          description: "+1 por nivel" 
        })
      ]));
      
      expect(hitDieFacet?.type).toBe("select");
      expect(hitDieFacet?.options).toHaveLength(5);
    });

    it("should not generate facet for optional enum with no values", () => {
      const sampleClasses = [
        {
          id: "1",
          name: "Fighter",
          entityType: "class_v2",
          babProgression: "full",
          hitDieValue: 10
          // spellcastingType not provided
        } as any
      ];

      const facets = generateFacets(classWithEnumDefinition, sampleClasses);
      const spellcastingFacet = facets.find(f => f.fieldName === "spellcastingType");

      // Should still create facet with enum options even if no entities have values
      expect(spellcastingFacet).toBeDefined();
      expect(spellcastingFacet?.options).toHaveLength(3);
    });
  });

  describe("Edge cases", () => {
    it("should reject enum field with empty options array", () => {
      const invalidDefinition: EntitySchemaDefinition = {
        typeName: "invalid",
        fields: [
          {
            name: "badEnum",
            type: "enum",
            options: [] // Empty options should be invalid
          }
        ]
      };

      // Should throw during schema creation or validation
      expect(() => createEntitySchema(invalidDefinition)).toThrow();
    });

    it("should reject enum field with duplicate values", () => {
      const invalidDefinition: EntitySchemaDefinition = {
        typeName: "invalid",
        fields: [
          {
            name: "badEnum",
            type: "enum",
            options: [
              { value: "duplicate", name: "First" },
              { value: "duplicate", name: "Second" } // Duplicate value
            ]
          }
        ]
      };

      expect(() => createEntitySchema(invalidDefinition)).toThrow();
    });

    it("should handle mixed string and number enum values in different fields", () => {
      const mixedDefinition: EntitySchemaDefinition = {
        typeName: "mixed_enum",
        fields: [
          {
            name: "stringEnum",
            type: "enum",
            options: [
              { value: "a", name: "Option A" },
              { value: "b", name: "Option B" }
            ]
          },
          {
            name: "numberEnum",
            type: "enum",
            options: [
              { value: 1, name: "One" },
              { value: 2, name: "Two" }
            ]
          }
        ]
      };

      const schema = createEntitySchema(mixedDefinition);
      
      const validEntity = {
        id: "mixed-1",
        name: "Mixed",
        entityType: "mixed_enum",
        stringEnum: "a",
        numberEnum: 1
      };

      expect(() => schema.parse(validEntity)).not.toThrow();
    });

    it("should reject enum field with mixed types in same options array", () => {
      const invalidDefinition: EntitySchemaDefinition = {
        typeName: "invalid",
        fields: [
          {
            name: "mixedEnum",
            type: "enum",
            options: [
              { value: "string", name: "String" },
              { value: 123, name: "Number" } // Mixed types in same field
            ]
          }
        ]
      };

      // Should throw during schema creation
      expect(() => createEntitySchema(invalidDefinition)).toThrow();
    });
  });
});

