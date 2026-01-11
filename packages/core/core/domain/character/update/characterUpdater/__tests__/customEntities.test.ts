import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { CharacterUpdater } from "../characterUpdater";
import { buildCharacter } from "../../../../../tests/character/buildCharacter";
import { fighter } from "../../../../../../srd/classes";
import type { StandardEntity } from "../../../../../entities/types/base";
import { ChangeTypes } from "../../../baseData/changes";

// =============================================================================
// Test Helpers
// =============================================================================

function createMockEntity(
  id: string,
  entityType: string,
  overrides: Partial<StandardEntity> = {}
): StandardEntity {
  return {
    id,
    entityType,
    name: `Entity ${id}`,
    description: `Description for ${id}`,
    ...overrides,
  };
}

function createMockEntityWithChanges(
  id: string,
  entityType: string,
  changes: StandardEntity["legacy_changes"] = []
): StandardEntity {
  return createMockEntity(id, entityType, {
    legacy_changes: changes,
  });
}

// =============================================================================
// Tests: Custom Entities Management
// =============================================================================

describe("CharacterUpdater - Custom Entities Management", () => {
  let characterUpdater: CharacterUpdater | null = null;

  beforeEach(() => {
    const character = buildCharacter()
      .withName("Test Character")
      .withClassLevels(fighter, 3)
      .build();

    characterUpdater = new CharacterUpdater(character, []);
  });

  afterEach(() => {
    if (characterUpdater) {
      characterUpdater = null;
    }
  });

  describe("addCustomEntity", () => {
    it("should add entity when customEntities does not exist", () => {
      const entity = createMockEntity("power-attack", "feat");

      const result = characterUpdater!.addCustomEntity(entity, "feat");

      expect(result.success).toBe(true);

      const updatedCharacter = characterUpdater!.getCharacterBaseData()!;
      expect(updatedCharacter.customEntities).toBeDefined();
      expect(updatedCharacter.customEntities!["feat"]).toHaveLength(1);
      expect(updatedCharacter.customEntities!["feat"][0].id).toBe("power-attack");
    });

    it("should add entity when entityType does not exist", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [createMockEntity("existing-feat", "feat")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const entity = createMockEntity("fireball", "spell");
      const result = characterUpdater.addCustomEntity(entity, "spell");

      expect(result.success).toBe(true);

      const updatedCharacter = characterUpdater.getCharacterBaseData()!;
      expect(updatedCharacter.customEntities!["spell"]).toHaveLength(1);
      expect(updatedCharacter.customEntities!["spell"][0].id).toBe("fireball");
    });

    it("should add entity to existing entityType array", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [createMockEntity("existing-feat", "feat")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const entity = createMockEntity("power-attack", "feat");
      const result = characterUpdater.addCustomEntity(entity, "feat");

      expect(result.success).toBe(true);

      const updatedCharacter = characterUpdater.getCharacterBaseData()!;
      expect(updatedCharacter.customEntities!["feat"]).toHaveLength(2);
      expect(
        updatedCharacter.customEntities!["feat"].some((e) => e.id === "power-attack")
      ).toBe(true);
    });

    it("should fail when entity already exists", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      const existingEntity = createMockEntity("power-attack", "feat");
      character.customEntities = {
        feat: [existingEntity],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const duplicateEntity = createMockEntity("power-attack", "feat");
      const result = characterUpdater.addCustomEntity(duplicateEntity, "feat");

      expect(result.success).toBe(false);
      expect(result.error).toContain("already exists");
    });

    it("should fail when entity.entityType does not match provided entityType", () => {
      const entity = createMockEntity("power-attack", "feat");

      const result = characterUpdater!.addCustomEntity(entity, "spell");

      expect(result.success).toBe(false);
      expect(result.error).toContain("does not match");
    });

    it("should fail when character is not set", () => {
      characterUpdater = new CharacterUpdater(null, []);

      const entity = createMockEntity("power-attack", "feat");
      const result = characterUpdater.addCustomEntity(entity, "feat");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Character is not set");
    });

    it("should recalculate character sheet after adding entity", () => {
      const entity = createMockEntityWithChanges("power-attack", "feat", [
        {
          type: ChangeTypes.BAB,
          formula: { expression: "2" },
          bonusTypeId: "UNTYPED",
        },
      ]);

      const result = characterUpdater!.addCustomEntity(entity, "feat");

      expect(result.success).toBe(true);

      const sheet = characterUpdater!.getCharacterSheet()!;
      expect(sheet.computedEntities).toBeDefined();
      expect(sheet.computedEntities.some((e) => e.id === "power-attack")).toBe(true);
    });
  });

  describe("removeCustomEntity", () => {
    it("should remove entity from customEntities", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [
          createMockEntity("power-attack", "feat"),
          createMockEntity("cleave", "feat"),
        ],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const result = characterUpdater.removeCustomEntity("power-attack", "feat");

      expect(result.success).toBe(true);

      const updatedCharacter = characterUpdater.getCharacterBaseData()!;
      expect(updatedCharacter.customEntities!["feat"]).toHaveLength(1);
      expect(
        updatedCharacter.customEntities!["feat"].some((e) => e.id === "power-attack")
      ).toBe(false);
      expect(
        updatedCharacter.customEntities!["feat"].some((e) => e.id === "cleave")
      ).toBe(true);
    });

    it("should remove entityType key when array becomes empty", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [createMockEntity("power-attack", "feat")],
        spell: [createMockEntity("fireball", "spell")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const result = characterUpdater.removeCustomEntity("power-attack", "feat");

      expect(result.success).toBe(true);

      const updatedCharacter = characterUpdater.getCharacterBaseData()!;
      expect(updatedCharacter.customEntities!["feat"]).toBeUndefined();
      expect(updatedCharacter.customEntities!["spell"]).toBeDefined();
    });

    it("should remove customEntities when all entityTypes are empty", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [createMockEntity("power-attack", "feat")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const result = characterUpdater.removeCustomEntity("power-attack", "feat");

      expect(result.success).toBe(true);

      const updatedCharacter = characterUpdater.getCharacterBaseData()!;
      expect(updatedCharacter.customEntities).toBeUndefined();
    });

    it("should fail when customEntities does not exist", () => {
      const result = characterUpdater!.removeCustomEntity("power-attack", "feat");

      expect(result.success).toBe(false);
      expect(result.error).toContain("No customEntities found");
    });

    it("should fail when entityType does not exist", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [createMockEntity("power-attack", "feat")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const result = characterUpdater.removeCustomEntity("fireball", "spell");

      expect(result.success).toBe(false);
      expect(result.error).toContain("No entities of type");
    });

    it("should fail when entity does not exist", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [createMockEntity("power-attack", "feat")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const result = characterUpdater.removeCustomEntity("nonexistent", "feat");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should fail when character is not set", () => {
      characterUpdater = new CharacterUpdater(null, []);

      const result = characterUpdater.removeCustomEntity("power-attack", "feat");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Character is not set");
    });

    it("should recalculate character sheet after removing entity", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [
          createMockEntityWithChanges("power-attack", "feat", [
            {
              type: ChangeTypes.BAB,
              formula: { expression: "2" },
              bonusTypeId: "UNTYPED",
            },
          ]),
        ],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const initialSheet = characterUpdater.getCharacterSheet()!;
      expect(initialSheet.computedEntities.some((e) => e.id === "power-attack")).toBe(
        true
      );

      const result = characterUpdater.removeCustomEntity("power-attack", "feat");

      expect(result.success).toBe(true);

      const updatedSheet = characterUpdater.getCharacterSheet()!;
      expect(updatedSheet.computedEntities.some((e) => e.id === "power-attack")).toBe(
        false
      );
    });
  });

  describe("updateCustomEntity", () => {
    it("should update entity in customEntities", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      const originalEntity = createMockEntity("power-attack", "feat", {
        name: "Power Attack",
        description: "Original description",
      });

      character.customEntities = {
        feat: [originalEntity],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const updatedEntity = createMockEntity("power-attack", "feat", {
        name: "Power Attack (Updated)",
        description: "Updated description",
      });

      const result = characterUpdater.updateCustomEntity(
        "power-attack",
        "feat",
        updatedEntity
      );

      expect(result.success).toBe(true);

      const updatedCharacter = characterUpdater.getCharacterBaseData()!;
      expect(updatedCharacter.customEntities!["feat"][0].name).toBe(
        "Power Attack (Updated)"
      );
      expect(updatedCharacter.customEntities!["feat"][0].description).toBe(
        "Updated description"
      );
    });

    it("should fail when entity.entityType does not match provided entityType", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [createMockEntity("power-attack", "feat")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const entity = createMockEntity("power-attack", "spell");
      const result = characterUpdater.updateCustomEntity("power-attack", "feat", entity);

      expect(result.success).toBe(false);
      expect(result.error).toContain("does not match");
    });

    it("should fail when entity.id does not match provided entityId", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [createMockEntity("power-attack", "feat")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const entity = createMockEntity("cleave", "feat");
      const result = characterUpdater.updateCustomEntity("power-attack", "feat", entity);

      expect(result.success).toBe(false);
      expect(result.error).toContain("does not match");
    });

    it("should fail when customEntities does not exist", () => {
      const entity = createMockEntity("power-attack", "feat");
      const result = characterUpdater!.updateCustomEntity("power-attack", "feat", entity);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No customEntities found");
    });

    it("should fail when entityType does not exist", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [createMockEntity("power-attack", "feat")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const entity = createMockEntity("fireball", "spell");
      const result = characterUpdater.updateCustomEntity("fireball", "spell", entity);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No entities of type");
    });

    it("should fail when entity does not exist", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [createMockEntity("power-attack", "feat")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const entity = createMockEntity("nonexistent", "feat");
      const result = characterUpdater.updateCustomEntity("nonexistent", "feat", entity);

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should fail when character is not set", () => {
      characterUpdater = new CharacterUpdater(null, []);

      const entity = createMockEntity("power-attack", "feat");
      const result = characterUpdater.updateCustomEntity("power-attack", "feat", entity);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Character is not set");
    });

    it("should recalculate character sheet after updating entity", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      const originalEntity = createMockEntityWithChanges("power-attack", "feat", [
        {
          type: ChangeTypes.BAB,
          formula: { expression: "2" },
          bonusTypeId: "UNTYPED",
        },
      ]);

      character.customEntities = {
        feat: [originalEntity],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const updatedEntity = createMockEntityWithChanges("power-attack", "feat", [
        {
          type: ChangeTypes.BAB,
          formula: { expression: "4" },
          bonusTypeId: "UNTYPED",
        },
      ]);

      const result = characterUpdater.updateCustomEntity(
        "power-attack",
        "feat",
        updatedEntity
      );

      expect(result.success).toBe(true);

      const sheet = characterUpdater.getCharacterSheet()!;
      const computedEntity = sheet.computedEntities.find((e) => e.id === "power-attack");
      expect(computedEntity).toBeDefined();
    });
  });

  describe("getCustomEntities", () => {
    it("should return empty array when entityType provided and customEntities does not exist", () => {
      const result = characterUpdater!.getCustomEntities("feat");

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it("should return empty object when no entityType provided and customEntities does not exist", () => {
      const result = characterUpdater!.getCustomEntities();

      expect(typeof result).toBe("object");
      expect(Array.isArray(result)).toBe(false);
      expect(Object.keys(result).length).toBe(0);
    });

    it("should return entities for specific entityType", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [
          createMockEntity("power-attack", "feat"),
          createMockEntity("cleave", "feat"),
        ],
        spell: [createMockEntity("fireball", "spell")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const result = characterUpdater.getCustomEntities("feat");

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("power-attack");
      expect(result[1].id).toBe("cleave");
    });

    it("should return empty array when entityType does not exist", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [createMockEntity("power-attack", "feat")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const result = characterUpdater.getCustomEntities("spell");

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it("should return all customEntities when no entityType provided", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [createMockEntity("power-attack", "feat")],
        spell: [createMockEntity("fireball", "spell")],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const result = characterUpdater.getCustomEntities();

      expect(typeof result).toBe("object");
      expect(Array.isArray(result)).toBe(false);
      expect(result["feat"]).toBeDefined();
      expect(result["spell"]).toBeDefined();
      expect(result["feat"]).toHaveLength(1);
      expect(result["spell"]).toHaveLength(1);
    });

    it("should return empty object when character is not set", () => {
      characterUpdater = new CharacterUpdater(null, []);

      const result = characterUpdater.getCustomEntities();

      expect(typeof result).toBe("object");
      expect(Array.isArray(result)).toBe(false);
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe("Integration with character calculation", () => {
    it("should include entities in computedEntities after adding", () => {
      const entity = createMockEntityWithChanges("power-attack", "feat", [
        {
          type: ChangeTypes.BAB,
          formula: { expression: "2" },
          bonusTypeId: "UNTYPED",
        },
      ]);

      const result = characterUpdater!.addCustomEntity(entity, "feat");

      expect(result.success).toBe(true);

      const sheet = characterUpdater!.getCharacterSheet()!;
      expect(sheet.computedEntities).toBeDefined();
      const computedEntity = sheet.computedEntities.find((e) => e.id === "power-attack");
      expect(computedEntity).toBeDefined();
      expect(computedEntity!._meta.source.originType).toBe("feat");
      expect(computedEntity!._meta.source.originId).toBe("power-attack");
    });

    it("should remove entities from computedEntities after removing", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      character.customEntities = {
        feat: [
          createMockEntityWithChanges("power-attack", "feat", [
            {
              type: ChangeTypes.BAB,
              formula: { expression: "2" },
              bonusTypeId: "UNTYPED",
            },
          ]),
        ],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const initialSheet = characterUpdater.getCharacterSheet()!;
      expect(initialSheet.computedEntities.some((e) => e.id === "power-attack")).toBe(
        true
      );

      const result = characterUpdater.removeCustomEntity("power-attack", "feat");

      expect(result.success).toBe(true);

      const updatedSheet = characterUpdater.getCharacterSheet()!;
      expect(updatedSheet.computedEntities.some((e) => e.id === "power-attack")).toBe(
        false
      );
    });

    it("should update computedEntities after updating entity", () => {
      const character = buildCharacter()
        .withName("Test Character")
        .withClassLevels(fighter, 3)
        .build();

      const originalEntity = createMockEntityWithChanges("power-attack", "feat", [
        {
          type: ChangeTypes.BAB,
          formula: { expression: "2" },
          bonusTypeId: "UNTYPED",
        },
      ]);

      character.customEntities = {
        feat: [originalEntity],
      };

      characterUpdater = new CharacterUpdater(character, []);

      const updatedEntity = createMockEntityWithChanges("power-attack", "feat", [
        {
          type: ChangeTypes.BAB,
          formula: { expression: "4" },
          bonusTypeId: "UNTYPED",
        },
      ]);

      const result = characterUpdater.updateCustomEntity(
        "power-attack",
        "feat",
        updatedEntity
      );

      expect(result.success).toBe(true);

      const sheet = characterUpdater.getCharacterSheet()!;
      const computedEntity = sheet.computedEntities.find((e) => e.id === "power-attack");
      expect(computedEntity).toBeDefined();
    });
  });
});

