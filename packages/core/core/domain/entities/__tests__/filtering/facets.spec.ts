import { describe, it, expect } from "bun:test";
import { generateFacets } from "../../index";
import { 
  spellDefinition, 
  featDefinition, 
  classDefinition,
  sampleSpells, 
  sampleFeats,
  sampleClasses 
} from "../fixtures/testDefinitions";

describe("Facet Generation", () => {
  describe("generateFacets", () => {
    it("should generate base facets for SearchableEntity", () => {
      const facets = generateFacets(spellDefinition, sampleSpells);
      
      const nameFacet = facets.find(f => f.fieldName === "name");
      const entityTypeFacet = facets.find(f => f.fieldName === "entityType");
      const tagsFacet = facets.find(f => f.fieldName === "tags");

      expect(nameFacet).toBeDefined();
      expect(nameFacet?.type).toBe("text");
      
      expect(entityTypeFacet).toBeDefined();
      expect(entityTypeFacet?.type).toBe("select");
      expect(entityTypeFacet?.options).toEqual(["spell"]);
      
      expect(tagsFacet).toBeDefined();
      expect(tagsFacet?.type).toBe("multiselect");
      expect(tagsFacet?.options).toEqual(["damage", "area", "healing"]);
    });

    it("should generate facets for custom fields", () => {
      const facets = generateFacets(spellDefinition, sampleSpells);
      
      const levelFacet = facets.find(f => f.fieldName === "level");
      const schoolFacet = facets.find(f => f.fieldName === "school");
      const componentsFacet = facets.find(f => f.fieldName === "components");

      expect(levelFacet).toBeDefined();
      expect(levelFacet?.type).toBe("number");
      
      expect(schoolFacet).toBeDefined();
      expect(schoolFacet?.type).toBe("text");
      
      expect(componentsFacet).toBeDefined();
      expect(componentsFacet?.type).toBe("multiselect");
      expect(componentsFacet?.options).toEqual(["V", "S", "M"]);
    });

    it("should generate facets for reference fields", () => {
      const facets = generateFacets(featDefinition, sampleFeats);
      
      const prerequisitesFacet = facets.find(f => f.fieldName === "prerequisites");
      const requiredFeatsFacet = facets.find(f => f.fieldName === "requiredFeats");

      expect(prerequisitesFacet).toBeDefined();
      expect(prerequisitesFacet?.type).toBe("multiselect");
      expect(prerequisitesFacet?.options).toEqual(["bab-1", "power-attack", "strength-13"]);
      
      expect(requiredFeatsFacet).toBeDefined();
      expect(requiredFeatsFacet?.type).toBe("multiselect");
      expect(requiredFeatsFacet?.options).toEqual(["combat-expertise"]);
    });

    it("should generate select facets for fields with allowed values", () => {
      const facets = generateFacets(classDefinition, sampleClasses);
      
      const hitDieFacet = facets.find(f => f.fieldName === "hitDie");
      const alignmentFacet = facets.find(f => f.fieldName === "alignment");
      const savingThrowsFacet = facets.find(f => f.fieldName === "savingThrows");

      expect(hitDieFacet?.type).toBe("select");
      expect(hitDieFacet?.options).toEqual([4, 6, 8, 10, 12]);
      
      expect(alignmentFacet?.type).toBe("select");
      expect(alignmentFacet?.options).toEqual(["lawful", "neutral", "chaotic"]);
      
      expect(savingThrowsFacet?.type).toBe("multiselect");
      expect(savingThrowsFacet?.options).toEqual(["fort", "ref", "will"]);
    });

    it("should handle empty entities list", () => {
      const facets = generateFacets(spellDefinition, []);
      
      expect(facets.length).toBeGreaterThan(0); // Should still have base facets
      
      const entityTypeFacet = facets.find(f => f.fieldName === "entityType");
      expect(entityTypeFacet?.options).toEqual([]); // Empty because no entities
    });

    it("should generate boolean facets correctly", () => {
      const facets = generateFacets(spellDefinition, sampleSpells);
      
      const metamagicFacet = facets.find(f => f.fieldName === "metamagic");
      expect(metamagicFacet?.type).toBe("boolean");
      expect(metamagicFacet?.options).toBeUndefined();
    });
  });
});