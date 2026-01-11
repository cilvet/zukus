import { describe, it, expect } from "bun:test";
import { 
  createEntitySchema, 
  validateEntity, 
  filterEntities, 
  type EntityFilterCriteria 
} from "../../index";
import { spellDefinition } from "../fixtures/testDefinitions";

describe("Edge Cases and Complex Scenarios", () => {
  describe("Complex entity structures", () => {
    it("should handle entities with integer arrays", () => {
      const entityWithIntArray = {
        id: "spell-complex",
        name: "Complex Spell",
        entityType: "spell",
        level: 2,
        school: "Transmutation",
        components: ["V"],
        damageDice: [2, 4, 6]
      };

      const result = validateEntity(entityWithIntArray, spellDefinition);
      expect(result.valid).toBe(true);
    });

    it("should filter by integer array fields", () => {
      const entities = [
        {
          id: "1",
          name: "Spell A",
          type: "spell",
          damageDice: [1, 4, 6]
        } as any,
        {
          id: "2", 
          name: "Spell B",
          type: "spell",
          damageDice: [2, 6, 8]
        } as any
      ];

      const criteria: EntityFilterCriteria = {
        damageDice: [6]
      };

      const result = filterEntities(entities, criteria);
      expect(result).toHaveLength(2);
    });

    it("should handle complex sorting scenarios", () => {
      const entities = [
        { id: "1", name: "Zebra", type: "test", level: 1 } as any,
        { id: "2", name: "Alpha", type: "test", level: 3 } as any,
        { id: "3", name: "Beta", type: "test", level: 2 } as any
      ];

      // Sort by name ascending
      const byName = filterEntities(entities, { sort_by: "name", sort_order: "asc" });
      expect(byName.map(e => e.name)).toEqual(["Alpha", "Beta", "Zebra"]);

      // Sort by level descending
      const byLevel = filterEntities(entities, { sort_by: "level", sort_order: "desc" });
      expect(byLevel.map(e => (e as any).level)).toEqual([3, 2, 1]);
    });
  });

  describe("Error handling and validation edge cases", () => {
    it("should handle malformed entity data gracefully", () => {
      const malformedEntity = {
        id: 123, // Should be string
        name: null, // Should be string
        entityType: "spell",
        level: "not a number",
        components: "not an array"
      };

      const result = validateEntity(malformedEntity, spellDefinition);
      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it("should handle missing required fields", () => {
      const incompleteEntity = {
        id: "incomplete",
        name: "Incomplete Spell"
        // Missing entityType, level, school, components
      };

      const result = validateEntity(incompleteEntity, spellDefinition);
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes("entityType"))).toBe(true);
    });

    it("should handle extra fields not in schema", () => {
      const entityWithExtraFields = {
        id: "spell-1",
        name: "Fireball",
        entityType: "spell",
        level: 3,
        school: "Evocation",
        components: ["V", "S", "M"],
        extraField: "should be ignored",
        anotherExtra: 123
      };

      // Zod should ignore extra fields by default
      const result = validateEntity(entityWithExtraFields, spellDefinition);
      expect(result.valid).toBe(true);
    });
  });

  describe("Performance and boundary conditions", () => {
    it("should handle large datasets efficiently", () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `entity-${i}`,
        name: `Entity ${i}`,
        type: "test",
        level: i % 10,
        category: i % 3 === 0 ? "A" : i % 3 === 1 ? "B" : "C"
      }));

      const startTime = Date.now();
      const filtered = filterEntities(largeDataset, {
        category: "A",
        sort_by: "level",
        sort_order: "desc"
      });
      const endTime = Date.now();

      expect(filtered.length).toBe(334); // 1000/3 ≈ 333, but includes 0
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it("should handle empty arrays and null values", () => {
      const entitiesWithNulls = [
        { id: "1", name: "Valid", type: "test", tags: ["a", "b"] },
        { id: "2", name: "Empty Tags", type: "test", tags: [] },
        { id: "3", name: "Null Tags", type: "test", tags: null },
        { id: "4", name: "Undefined Tags", type: "test" }
      ] as any[];

      // Should not crash on null/undefined values
      const result = filterEntities(entitiesWithNulls, {
        tags: ["a"]
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Valid");
    });

    it("should handle unicode and special characters", () => {
      const unicodeEntity = {
        id: "unicode-test",
        name: "Tëst Spëll 🧙‍♂️",
        entityType: "spell",
        level: 1,
        school: "Évocation",
        components: ["V", "S"],
        description: "A spell with unicode: αβγδε"
      };

      const result = validateEntity(unicodeEntity, spellDefinition);
      expect(result.valid).toBe(true);

      // Test filtering with unicode
      const filtered = filterEntities([unicodeEntity], {
        name: "Tëst"
      });
      expect(filtered).toHaveLength(1);
    });
  });

  describe("Schema compatibility and evolution", () => {
    it("should maintain backward compatibility with simple schemas", () => {
      const simpleDefinition = {
        typeName: "simple",
        fields: [
          { name: "value", type: "string" as const, optional: false }
        ]
      };

      const schema = createEntitySchema(simpleDefinition);
      const simpleEntity = {
        id: "simple-1",
        name: "Simple Entity",
        entityType: "simple",
        value: "test"
      };

      expect(() => schema.parse(simpleEntity)).not.toThrow();
    });

    it("should handle schema evolution scenarios", () => {
      // Original schema
      const v1Schema = {
        typeName: "evolving",
        fields: [
          { name: "oldField", type: "string" as const, optional: false }
        ]
      };

      // Evolved schema with new optional field
      const v2Schema = {
        typeName: "evolving",
        fields: [
          { name: "oldField", type: "string" as const, optional: false },
          { name: "newField", type: "string" as const, optional: true }
        ]
      };

      const v1Entity = {
        id: "evolving-1",
        name: "Old Entity",
        entityType: "evolving",
        oldField: "value"
      };

      // V1 entity should still validate against V2 schema
      const result = validateEntity(v1Entity, v2Schema);
      expect(result.valid).toBe(true);
    });
  });
});