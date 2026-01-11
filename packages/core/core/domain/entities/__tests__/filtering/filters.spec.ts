import { describe, it, expect } from "bun:test";
import { filterEntities, type EntityFilterCriteria } from "../../index";
import { 
  sampleEntitiesForFiltering, 
  featsWithReferences, 
  entitiesWithIntArrays,
  entitiesForSorting 
} from "../fixtures/testDefinitions";

describe("Entity Filtering", () => {
  describe("filterEntities", () => {
    it("should filter by text fields with partial matching", () => {
      const criteria: EntityFilterCriteria = {
        name: "Fire"
      };
      
      const result = filterEntities(sampleEntitiesForFiltering, criteria);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Fireball");
    });

    it("should filter by exact values", () => {
      const criteria: EntityFilterCriteria = {
        level: 3
      };
      
      const result = filterEntities(sampleEntitiesForFiltering, criteria);
      expect(result).toHaveLength(2);
      expect(result.every(e => (e as any).level === 3)).toBe(true);
    });

    it("should filter by array fields", () => {
      const criteria: EntityFilterCriteria = {
        tags: ["damage"]
      };
      
      const result = filterEntities(sampleEntitiesForFiltering, criteria);
      expect(result).toHaveLength(2);
      expect(result.every(e => e.tags?.includes("damage"))).toBe(true);
    });

    it("should filter with multiple criteria", () => {
      const criteria: EntityFilterCriteria = {
        school: "Evocation",
        tags: ["damage"]
      };
      
      const result = filterEntities(sampleEntitiesForFiltering, criteria);
      expect(result).toHaveLength(2);
      expect(result.every(e => (e as any).school === "Evocation" && e.tags?.includes("damage"))).toBe(true);
    });

    it("should sort results", () => {
      const criteria: EntityFilterCriteria = {
        sort_by: "level",
        sort_order: "desc"
      };
      
      const result = filterEntities(sampleEntitiesForFiltering, criteria);
      expect(result[0].name).toBe("Fireball"); // level 3
      expect(result[2].name).toBe("Cure Light Wounds"); // level 1
    });

    it("should handle empty filter criteria", () => {
      const result = filterEntities(sampleEntitiesForFiltering, {});
      expect(result).toHaveLength(3);
    });

    it("should filter by reference fields", () => {
      // Filter by single reference
      const withPowerAttack = filterEntities(featsWithReferences, {
        prerequisites: ["power-attack"]
      });
      expect(withPowerAttack).toHaveLength(1);
      expect(withPowerAttack[0].name).toBe("Cleave");

      // Filter by multiple references (AND logic)
      const withCleaveAndBab = filterEntities(featsWithReferences, {
        prerequisites: ["cleave", "bab-4"]
      });
      expect(withCleaveAndBab).toHaveLength(1);
      expect(withCleaveAndBab[0].name).toBe("Great Cleave");
    });

    it("should filter by integer array fields", () => {
      const criteria: EntityFilterCriteria = {
        damageDice: [6]
      };

      const result = filterEntities(entitiesWithIntArrays, criteria);
      expect(result).toHaveLength(2);
    });

    it("should handle complex sorting scenarios", () => {
      // Sort by name ascending
      const byName = filterEntities(entitiesForSorting, { sort_by: "name", sort_order: "asc" });
      expect(byName.map(e => e.name)).toEqual(["Alpha", "Beta", "Zebra"]);

      // Sort by level descending
      const byLevel = filterEntities(entitiesForSorting, { sort_by: "level", sort_order: "desc" });
      expect(byLevel.map(e => (e as any).level)).toEqual([3, 2, 1]);
    });

    it("should handle null and undefined values in sorting", () => {
      const entitiesWithNulls = [
        { id: "1", name: "First", type: "test", value: 10 },
        { id: "2", name: "Second", type: "test", value: null },
        { id: "3", name: "Third", type: "test", value: 5 }
      ] as any[];

      const sorted = filterEntities(entitiesWithNulls, { sort_by: "value", sort_order: "asc" });
      expect(sorted[0].name).toBe("Third"); // 5
      expect(sorted[1].name).toBe("First"); // 10
      expect(sorted[2].name).toBe("Second"); // null (should be last)
    });

    it("should handle case-insensitive string filtering", () => {
      const criteria: EntityFilterCriteria = {
        name: "fire" // lowercase
      };
      
      const result = filterEntities(sampleEntitiesForFiltering, criteria);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Fireball"); // Should match "Fireball"
    });

    it("should ignore empty/null/undefined filter values", () => {
      const criteria: EntityFilterCriteria = {
        name: "",
        level: null,
        school: undefined
      };
      
      const result = filterEntities(sampleEntitiesForFiltering, criteria);
      expect(result).toHaveLength(3); // Should return all entities
    });
  });
});