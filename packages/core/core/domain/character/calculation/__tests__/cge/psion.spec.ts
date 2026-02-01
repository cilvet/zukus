import { describe, expect, it } from "bun:test";
import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { createBasePsion, psionCGEConfig, PSION_KNOWN_TABLE } from "./fixtures";
import {
  addKnownEntity,
  removeKnownEntity,
  getKnownEntitiesByCGE,
  getKnownEntitiesByLevel,
  getTotalKnownCount,
  isEntityKnown,
} from "../../../../cge/knownOperations";
import type { StandardEntity } from "../../../../entities/types/base";

// ============================================================================
// TEST POWERS (StandardEntity)
// ============================================================================

const createPower = (id: string, name: string): StandardEntity => ({
  id,
  name,
  entityType: "power",
  description: `${name} psionic power`,
});

const POWERS = {
  // Nivel 1
  mindThrust: createPower('mind-thrust', 'Mind Thrust'),
  energyRay: createPower('energy-ray', 'Energy Ray'),
  precognition: createPower('precognition', 'Precognition'),
  inertialArmor: createPower('inertial-armor', 'Inertial Armor'),

  // Nivel 2
  egoWhip: createPower('ego-whip', 'Ego Whip'),
  energyPush: createPower('energy-push', 'Energy Push'),

  // Nivel 3
  energyBurst: createPower('energy-burst', 'Energy Burst'),
};

describe("Psion CGE", () => {
  // ==========================================================================
  // CONFIGURACION BASICA
  // ==========================================================================

  describe("CGE Configuration", () => {
    it("should have entityType 'power'", () => {
      expect(psionCGEConfig.entityType).toBe('power');
    });

    it("should have LIMITED_PER_ENTITY_LEVEL known type", () => {
      expect(psionCGEConfig.known?.type).toBe('LIMITED_PER_ENTITY_LEVEL');
    });

    it("should have POOL resource type", () => {
      expect(psionCGEConfig.tracks[0].resource.type).toBe('POOL');
    });

    it("should have NONE preparation type", () => {
      expect(psionCGEConfig.tracks[0].preparation.type).toBe('NONE');
    });

    it("should have resourceId for pool referencing defined resource", () => {
      const resource = psionCGEConfig.tracks[0].resource;
      if (resource.type === 'POOL') {
        expect(resource.resourceId).toBeDefined();
        // El resourceId debe referenciar un recurso definido en resources
        const definedResource = psionCGEConfig.resources?.find(r => r.resourceId === resource.resourceId);
        expect(definedResource).toBeDefined();
      }
    });
  });

  // ==========================================================================
  // CALCULATED CGE
  // ==========================================================================

  describe("Calculated CGE", () => {
    it("should calculate CGE for Psion", () => {
      const character = createBasePsion(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['psion-powers'];
      expect(cge).toBeDefined();
      expect(cge?.classId).toBe('psion');
      expect(cge?.entityType).toBe('power');
    });

    it("should have correct class level", () => {
      const character = createBasePsion(3).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['psion-powers'];
      expect(cge?.classLevel).toBe(3);
    });

    it("should have single track with POOL resource", () => {
      const character = createBasePsion(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['psion-powers'];
      expect(cge?.tracks).toHaveLength(1);
      expect(cge?.tracks[0].resourceType).toBe('POOL');
    });

    it("should have pool with max value", () => {
      const character = createBasePsion(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['psion-powers'];
      expect(cge?.tracks[0].pool).toBeDefined();
      // El pool deberia tener un max calculado (aunque la formula puede no resolver)
      expect(cge?.tracks[0].pool?.max).toBeDefined();
    });

    it("should have NONE preparation type", () => {
      const character = createBasePsion(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['psion-powers'];
      expect(cge?.tracks[0].preparationType).toBe('NONE');
    });

    it("should not have slots for POOL resource", () => {
      const character = createBasePsion(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['psion-powers'];
      expect(cge?.tracks[0].slots).toBeUndefined();
    });
  });

  // ==========================================================================
  // KNOWN LIMITS (LIMITED_PER_ENTITY_LEVEL)
  // ==========================================================================

  describe("Known limits (LIMITED_PER_ENTITY_LEVEL)", () => {
    it("should have knownLimits defined", () => {
      const character = createBasePsion(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['psion-powers'];
      expect(cge?.knownLimits).toBeDefined();
    });

    it("should have limits for each power level", () => {
      const character = createBasePsion(3).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['psion-powers'];
      // A nivel 3, deberia haber limites para niveles 0, 1, 2
      const levels = cge?.knownLimits?.map(l => l.level) ?? [];
      expect(levels).toContain(0);
      expect(levels).toContain(1);
      expect(levels).toContain(2);
    });

    it("should increase known limits with class level", () => {
      const char1 = createBasePsion(1).build();
      const char5 = createBasePsion(5).build();

      const sheet1 = calculateCharacterSheet(char1);
      const sheet5 = calculateCharacterSheet(char5);

      const cge1 = sheet1.cge?.['psion-powers'];
      const cge5 = sheet5.cge?.['psion-powers'];

      // Total conocidos deberia aumentar
      const total1 = cge1?.knownLimits?.reduce((sum, l) => sum + l.max, 0) ?? 0;
      const total5 = cge5?.knownLimits?.reduce((sum, l) => sum + l.max, 0) ?? 0;

      expect(total5).toBeGreaterThan(total1);
    });
  });

  // ==========================================================================
  // CONOCIDOS (KNOWN OPERATIONS)
  // ==========================================================================

  describe("Known operations", () => {
    it("should add power to known list", () => {
      let character = createBasePsion(1).build();

      const result = addKnownEntity(
        character,
        'psion-powers',
        POWERS.mindThrust,
        1 // power level
      );

      expect(result.warnings).toHaveLength(0);
      character = result.character;

      expect(isEntityKnown(character, 'psion-powers', POWERS.mindThrust.id)).toBe(true);
    });

    it("should add multiple powers at different levels", () => {
      let character = createBasePsion(3).build();

      // Nivel 1
      let result = addKnownEntity(character, 'psion-powers', POWERS.mindThrust, 1);
      character = result.character;

      result = addKnownEntity(character, 'psion-powers', POWERS.energyRay, 1);
      character = result.character;

      // Nivel 2
      result = addKnownEntity(character, 'psion-powers', POWERS.egoWhip, 2);
      character = result.character;

      // Verificar por nivel
      const level1 = getKnownEntitiesByLevel(character, 'psion-powers', 1);
      const level2 = getKnownEntitiesByLevel(character, 'psion-powers', 2);

      expect(level1).toContain(POWERS.mindThrust.id);
      expect(level1).toContain(POWERS.energyRay.id);
      expect(level2).toContain(POWERS.egoWhip.id);
    });

    it("should count total known powers", () => {
      let character = createBasePsion(3).build();

      let result = addKnownEntity(character, 'psion-powers', POWERS.mindThrust, 1);
      character = result.character;

      result = addKnownEntity(character, 'psion-powers', POWERS.energyRay, 1);
      character = result.character;

      result = addKnownEntity(character, 'psion-powers', POWERS.egoWhip, 2);
      character = result.character;

      expect(getTotalKnownCount(character, 'psion-powers')).toBe(3);
    });

    it("should remove power from known list", () => {
      let character = createBasePsion(1).build();

      // Anadir
      let result = addKnownEntity(character, 'psion-powers', POWERS.mindThrust, 1);
      character = result.character;
      expect(isEntityKnown(character, 'psion-powers', POWERS.mindThrust.id)).toBe(true);

      // Quitar
      result = removeKnownEntity(character, 'psion-powers', POWERS.mindThrust.id);
      character = result.character;
      expect(isEntityKnown(character, 'psion-powers', POWERS.mindThrust.id)).toBe(false);
    });
  });

  // ==========================================================================
  // POOL CURRENT VALUE
  // ==========================================================================

  describe("Pool current value", () => {
    it("should have current equal to max initially", () => {
      const character = createBasePsion(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['psion-powers'];
      const pool = cge?.tracks[0].pool;

      // Inicialmente current = max
      if (pool) {
        expect(pool.current).toBe(pool.max);
      }
    });
  });

  // ==========================================================================
  // SHEET CON KNOWN
  // ==========================================================================

  describe("Sheet with known powers", () => {
    it("should reflect known count in calculated limits", () => {
      let character = createBasePsion(1).build();

      // Sin conocidos
      let sheet = calculateCharacterSheet(character);
      let cge = sheet.cge?.['psion-powers'];
      const level1Limit = cge?.knownLimits?.find(l => l.level === 1);
      expect(level1Limit?.current).toBe(0);

      // Anadir 1 poder de nivel 1
      const result = addKnownEntity(character, 'psion-powers', POWERS.mindThrust, 1);
      character = result.character;

      sheet = calculateCharacterSheet(character);
      cge = sheet.cge?.['psion-powers'];
      const level1LimitAfter = cge?.knownLimits?.find(l => l.level === 1);
      expect(level1LimitAfter?.current).toBe(1);
    });

    it("should include config reference", () => {
      const character = createBasePsion(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['psion-powers'];
      expect(cge?.config).toEqual(psionCGEConfig);
    });
  });
});
