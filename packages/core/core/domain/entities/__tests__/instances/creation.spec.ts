import { describe, it, expect } from "bun:test";
import { createEntityInstance } from "../../index";
import { 
  spellDefinition, 
  discoveryDefinition, 
  featDefinition,
  classDefinition 
} from "../fixtures/testDefinitions";

describe("Entity Instance Creation", () => {
  describe("createEntityInstance", () => {
    it("should create an entity with default values", () => {
      const instance = createEntityInstance(spellDefinition, {
        id: "new-spell",
        name: "New Spell"
      });

      expect(instance.id).toBe("new-spell");
      expect(instance.name).toBe("New Spell");
      expect(instance.entityType).toBe("spell");
      expect((instance as any).level).toBe(0);
      expect((instance as any).school).toBe("");
      expect((instance as any).components).toEqual([""]);
    });

    it("should not override provided values", () => {
      const instance = createEntityInstance(spellDefinition, {
        id: "existing-spell",
        name: "Existing Spell",
        level: 5
      } as any);

      expect((instance as any).level).toBe(5);
    });

    it("should handle optional fields correctly", () => {
      const instance = createEntityInstance(discoveryDefinition, {
        id: "new-discovery",
        name: "New Discovery"
      });

      expect(instance.id).toBe("new-discovery");
      expect(instance.entityType).toBe("discovery");
      expect((instance as any).prerequisiteLevel).toBe(0);
      expect((instance as any).category).toBeUndefined();
      expect((instance as any).keywords).toBeUndefined();
    });

    it("should create correct default arrays based on nonEmpty constraint", () => {
      const instance = createEntityInstance(spellDefinition);
      
      // components has nonEmpty: true, should get ['']
      expect((instance as any).components).toEqual([""]);
      
      // damageDice is optional, should be undefined
      expect((instance as any).damageDice).toBeUndefined();
    });

    it("should create feat instance with reference field defaults", () => {
      const instance = createEntityInstance(featDefinition, {
        id: "new-feat",
        name: "New Feat"
      });

      expect(instance.id).toBe("new-feat");
      expect(instance.entityType).toBe("feat");
      expect((instance as any).benefitType).toBe("");
      
      // requiredFeats has nonEmpty: true, should get ['']
      expect((instance as any).requiredFeats).toEqual([""]);
      
      // prerequisites is optional, should be undefined
      expect((instance as any).prerequisites).toBeUndefined();
    });

    it("should create entity instance with default enum values", () => {
      const instance = createEntityInstance(classDefinition, {
        id: "new-class",
        name: "New Class"
      });

      expect(instance.id).toBe("new-class");
      expect(instance.entityType).toBe("class");
      expect((instance as any).hitDie).toBe(4); // First allowed value
      expect((instance as any).alignment).toBe("lawful"); // First allowed value
      expect((instance as any).savingThrows).toEqual(["fort"]); // First allowed value in non-empty array
    });

    it("should handle all field types correctly", () => {
      const complexDefinition = {
        typeName: "complex",
        fields: [
          { name: "stringField", type: "string" as const, optional: false },
          { name: "intField", type: "integer" as const, optional: false },
          { name: "boolField", type: "boolean" as const, optional: false },
          { name: "stringArrayEmpty", type: "string_array" as const, optional: false, nonEmpty: false },
          { name: "stringArrayNonEmpty", type: "string_array" as const, optional: false, nonEmpty: true },
          { name: "intArrayEmpty", type: "integer_array" as const, optional: false, nonEmpty: false },
          { name: "intArrayNonEmpty", type: "integer_array" as const, optional: false, nonEmpty: true },
          { name: "referenceEmpty", type: "reference" as const, optional: false, nonEmpty: false },
          { name: "referenceNonEmpty", type: "reference" as const, optional: false, nonEmpty: true }
        ]
      };

      const instance = createEntityInstance(complexDefinition, {
        id: "complex-entity",
        name: "Complex Entity"
      });

      expect((instance as any).stringField).toBe("");
      expect((instance as any).intField).toBe(0);
      expect((instance as any).boolField).toBe(false);
      expect((instance as any).stringArrayEmpty).toEqual([]);
      expect((instance as any).stringArrayNonEmpty).toEqual([""]);
      expect((instance as any).intArrayEmpty).toEqual([]);
      expect((instance as any).intArrayNonEmpty).toEqual([0]);
      expect((instance as any).referenceEmpty).toEqual([]);
      expect((instance as any).referenceNonEmpty).toEqual([""]);
    });

    it("should handle integer enum fields correctly", () => {
      const enumDefinition = {
        typeName: "enum-test",
        fields: [
          { 
            name: "intEnum", 
            type: "integer" as const, 
            optional: false,
            allowedValues: [10, 20, 30]
          },
          { 
            name: "intArrayEnum", 
            type: "integer_array" as const, 
            optional: false,
            nonEmpty: true,
            allowedValues: [1, 2, 3]
          }
        ]
      };

      const instance = createEntityInstance(enumDefinition, {
        id: "enum-entity",
        name: "Enum Entity"
      });

      expect((instance as any).intEnum).toBe(10); // First allowed value
      expect((instance as any).intArrayEnum).toEqual([1]); // First allowed value in array
    });

    it("should preserve base SearchableEntity fields", () => {
      const instance = createEntityInstance(spellDefinition, {
        id: "test-spell",
        name: "Test Spell",
        description: "A test spell",
        tags: ["test", "magic"],
        image: "spell-icon.png"
      });

      expect(instance.id).toBe("test-spell");
      expect(instance.name).toBe("Test Spell");
      expect(instance.description).toBe("A test spell");
      expect(instance.tags).toEqual(["test", "magic"]);
      expect(instance.image).toBe("spell-icon.png");
      expect(instance.entityType).toBe("spell");
    });
  });
});