import { describe, expect, it } from "bun:test";
import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { createBaseWarlock, warlockCGEConfig, WARLOCK_KNOWN_TABLE } from "./fixtures";
import {
  addKnownEntity,
  removeKnownEntity,
  getKnownEntitiesByCGE,
  getTotalKnownCount,
  isEntityKnown,
} from "../../../../cge/knownOperations";
import type { StandardEntity } from "../../../../entities/types/base";

// ============================================================================
// TEST INVOCATIONS (StandardEntity)
// ============================================================================

const createInvocation = (id: string, name: string): StandardEntity => ({
  id,
  name,
  entityType: "invocation",
  description: `${name} invocation`,
});

const INVOCATIONS = {
  // Least (nivel 1+)
  eldritchSpear: createInvocation('eldritch-spear', 'Eldritch Spear'),
  hideousBlow: createInvocation('hideous-blow', 'Hideous Blow'),
  seeTheUnseen: createInvocation('see-the-unseen', 'See the Unseen'),
  darkOnesOwnLuck: createInvocation('dark-ones-own-luck', "Dark One's Own Luck"),

  // Lesser (nivel 6+)
  fleeTheScene: createInvocation('flee-the-scene', 'Flee the Scene'),
  voraciousDispelling: createInvocation('voracious-dispelling', 'Voracious Dispelling'),
};

describe("Warlock CGE", () => {
  // ==========================================================================
  // CONFIGURACION BASICA
  // ==========================================================================

  describe("CGE Configuration", () => {
    it("should have entityType 'invocation'", () => {
      expect(warlockCGEConfig.entityType).toBe('invocation');
    });

    it("should have LIMITED_TOTAL known type", () => {
      expect(warlockCGEConfig.known?.type).toBe('LIMITED_TOTAL');
    });

    it("should have NONE resource type", () => {
      expect(warlockCGEConfig.tracks[0].resource.type).toBe('NONE');
    });

    it("should have NONE preparation type", () => {
      expect(warlockCGEConfig.tracks[0].preparation.type).toBe('NONE');
    });
  });

  // ==========================================================================
  // CALCULATED CGE
  // ==========================================================================

  describe("Calculated CGE", () => {
    it("should calculate CGE for Warlock", () => {
      const character = createBaseWarlock(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warlock-invocations'];
      expect(cge).toBeDefined();
      expect(cge?.classId).toBe('warlock');
      expect(cge?.entityType).toBe('invocation');
    });

    it("should have correct class level", () => {
      const character = createBaseWarlock(4).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warlock-invocations'];
      expect(cge?.classLevel).toBe(4);
    });

    it("should have single track with NONE resource", () => {
      const character = createBaseWarlock(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warlock-invocations'];
      expect(cge?.tracks).toHaveLength(1);
      expect(cge?.tracks[0].resourceType).toBe('NONE');
    });

    it("should have NONE preparation type", () => {
      const character = createBaseWarlock(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warlock-invocations'];
      expect(cge?.tracks[0].preparationType).toBe('NONE');
    });

    it("should not have slots or pool for NONE resource", () => {
      const character = createBaseWarlock(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warlock-invocations'];
      expect(cge?.tracks[0].slots).toBeUndefined();
      expect(cge?.tracks[0].pool).toBeUndefined();
    });
  });

  // ==========================================================================
  // KNOWN LIMITS (LIMITED_TOTAL)
  // ==========================================================================

  describe("Known limits (LIMITED_TOTAL)", () => {
    it("should calculate total known limit from table", () => {
      const character = createBaseWarlock(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warlock-invocations'];
      // LIMITED_TOTAL tiene un solo limite para el total
      expect(cge?.knownLimits).toBeDefined();
    });

    it("should increase known limit with class level", () => {
      const char1 = createBaseWarlock(1).build();
      const char4 = createBaseWarlock(4).build();

      const sheet1 = calculateCharacterSheet(char1);
      const sheet4 = calculateCharacterSheet(char4);

      const cge1 = sheet1.cge?.['warlock-invocations'];
      const cge4 = sheet4.cge?.['warlock-invocations'];

      // Nivel 1: 1 invocacion, Nivel 4: 3 invocaciones
      const total1 = cge1?.knownLimits?.reduce((sum, l) => sum + l.max, 0) ?? 0;
      const total4 = cge4?.knownLimits?.reduce((sum, l) => sum + l.max, 0) ?? 0;

      expect(total4).toBeGreaterThan(total1);
    });
  });

  // ==========================================================================
  // CONOCIDOS (KNOWN OPERATIONS)
  // ==========================================================================

  describe("Known operations", () => {
    it("should add invocation to known list", () => {
      let character = createBaseWarlock(1).build();

      const result = addKnownEntity(
        character,
        'warlock-invocations',
        INVOCATIONS.eldritchSpear,
        0 // entityLevel (Least = 0 en nuestra convencion)
      );

      expect(result.warnings).toHaveLength(0);
      character = result.character;

      expect(isEntityKnown(character, 'warlock-invocations', INVOCATIONS.eldritchSpear.id)).toBe(true);
    });

    it("should remove invocation from known list", () => {
      let character = createBaseWarlock(1).build();

      // Anadir
      let result = addKnownEntity(character, 'warlock-invocations', INVOCATIONS.eldritchSpear, 0);
      character = result.character;
      expect(isEntityKnown(character, 'warlock-invocations', INVOCATIONS.eldritchSpear.id)).toBe(true);

      // Quitar (removeKnownEntity toma entityId string)
      result = removeKnownEntity(character, 'warlock-invocations', INVOCATIONS.eldritchSpear.id);
      character = result.character;
      expect(isEntityKnown(character, 'warlock-invocations', INVOCATIONS.eldritchSpear.id)).toBe(false);
    });

    it("should get all known invocations", () => {
      let character = createBaseWarlock(4).build();

      // Anadir varias invocaciones
      let result = addKnownEntity(character, 'warlock-invocations', INVOCATIONS.eldritchSpear, 0);
      character = result.character;

      result = addKnownEntity(character, 'warlock-invocations', INVOCATIONS.hideousBlow, 0);
      character = result.character;

      result = addKnownEntity(character, 'warlock-invocations', INVOCATIONS.darkOnesOwnLuck, 0);
      character = result.character;

      // getKnownEntitiesByCGE devuelve Record<level, entityIds[]>
      const known = getKnownEntitiesByCGE(character, 'warlock-invocations');
      const allKnownIds = Object.values(known).flat();

      expect(allKnownIds).toContain(INVOCATIONS.eldritchSpear.id);
      expect(allKnownIds).toContain(INVOCATIONS.hideousBlow.id);
      expect(allKnownIds).toContain(INVOCATIONS.darkOnesOwnLuck.id);
      expect(allKnownIds).toHaveLength(3);
    });

    it("should count total known invocations", () => {
      let character = createBaseWarlock(4).build();

      // Anadir 2 invocaciones
      let result = addKnownEntity(character, 'warlock-invocations', INVOCATIONS.eldritchSpear, 0);
      character = result.character;

      result = addKnownEntity(character, 'warlock-invocations', INVOCATIONS.hideousBlow, 0);
      character = result.character;

      expect(getTotalKnownCount(character, 'warlock-invocations')).toBe(2);
    });
  });

  // ==========================================================================
  // AT-WILL USAGE (NONE RESOURCE)
  // ==========================================================================

  describe("At-will usage", () => {
    it("should not require slot tracking for at-will abilities", () => {
      let character = createBaseWarlock(1).build();

      // Anadir invocacion
      const result = addKnownEntity(character, 'warlock-invocations', INVOCATIONS.eldritchSpear, 0);
      character = result.character;

      // Calcular sheet
      const sheet = calculateCharacterSheet(character);
      const cge = sheet.cge?.['warlock-invocations'];

      // El track tiene resourceType NONE, no hay slots que consumir
      expect(cge?.tracks[0].resourceType).toBe('NONE');
      expect(cge?.tracks[0].slots).toBeUndefined();

      // La invocacion simplemente esta conocida y disponible at-will
      expect(isEntityKnown(character, 'warlock-invocations', INVOCATIONS.eldritchSpear.id)).toBe(true);
    });
  });

  // ==========================================================================
  // SHEET CON KNOWN
  // ==========================================================================

  describe("Sheet with known entities", () => {
    it("should reflect known count in calculated limits", () => {
      let character = createBaseWarlock(1).build();

      // Sin conocidos
      let sheet = calculateCharacterSheet(character);
      let cge = sheet.cge?.['warlock-invocations'];
      const limitBefore = cge?.knownLimits?.[0];
      expect(limitBefore?.current).toBe(0);

      // Anadir 1 invocacion
      const result = addKnownEntity(character, 'warlock-invocations', INVOCATIONS.eldritchSpear, 0);
      character = result.character;

      sheet = calculateCharacterSheet(character);
      cge = sheet.cge?.['warlock-invocations'];
      const limitAfter = cge?.knownLimits?.[0];
      expect(limitAfter?.current).toBe(1);
    });

    it("should include config reference", () => {
      const character = createBaseWarlock(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warlock-invocations'];
      expect(cge?.config).toEqual(warlockCGEConfig);
    });
  });
});
