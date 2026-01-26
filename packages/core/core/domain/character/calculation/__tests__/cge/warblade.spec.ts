import { describe, expect, it } from "bun:test";
import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { createBaseWarblade, warbladeCGEConfig, WARBLADE_KNOWN_TABLE, WARBLADE_READIED_TABLE } from "./fixtures";
import {
  addKnownEntity,
  removeKnownEntity,
  getKnownEntitiesByCGE,
  getTotalKnownCount,
  isEntityKnown,
} from "../../../../cge/knownOperations";
import type { StandardEntity } from "../../../../entities/types/base";

// ============================================================================
// TEST MANEUVERS (StandardEntity)
// ============================================================================

const createManeuver = (id: string, name: string): StandardEntity => ({
  id,
  name,
  entityType: "maneuver",
  description: `${name} martial maneuver`,
});

const MANEUVERS = {
  // Iron Heart (nivel 1)
  steelWind: createManeuver('steel-wind', 'Steel Wind'),
  punishingStance: createManeuver('punishing-stance', 'Punishing Stance'),

  // Stone Dragon (nivel 1)
  stoneBones: createManeuver('stone-bones', 'Stone Bones'),
  chargingMinotaur: createManeuver('charging-minotaur', 'Charging Minotaur'),

  // Tiger Claw (nivel 1)
  clawAtTheMoon: createManeuver('claw-at-the-moon', 'Claw at the Moon'),
  wolfFangStrike: createManeuver('wolf-fang-strike', 'Wolf Fang Strike'),

  // Diamond Mind (nivel 2)
  emeraldRazor: createManeuver('emerald-razor', 'Emerald Razor'),
};

describe("Warblade CGE", () => {
  // ==========================================================================
  // CONFIGURACION BASICA
  // ==========================================================================

  describe("CGE Configuration", () => {
    it("should have entityType 'maneuver'", () => {
      expect(warbladeCGEConfig.entityType).toBe('maneuver');
    });

    it("should have LIMITED_TOTAL known type", () => {
      expect(warbladeCGEConfig.known?.type).toBe('LIMITED_TOTAL');
    });

    it("should have NONE resource type", () => {
      expect(warbladeCGEConfig.tracks[0].resource.type).toBe('NONE');
    });

    it("should have LIST preparation type", () => {
      expect(warbladeCGEConfig.tracks[0].preparation.type).toBe('LIST');
    });

    it("should have consumeOnUse=true for LIST preparation", () => {
      const prep = warbladeCGEConfig.tracks[0].preparation;
      if (prep.type === 'LIST') {
        expect(prep.consumeOnUse).toBe(true);
      }
    });

    it("should have recovery for consumable preparation", () => {
      const prep = warbladeCGEConfig.tracks[0].preparation;
      if (prep.type === 'LIST') {
        expect(prep.recovery).toBe('encounter');
      }
    });

    it("should have GLOBAL structure for readied maneuvers", () => {
      const prep = warbladeCGEConfig.tracks[0].preparation;
      if (prep.type === 'LIST') {
        expect(prep.structure).toBe('GLOBAL');
      }
    });
  });

  // ==========================================================================
  // CALCULATED CGE
  // ==========================================================================

  describe("Calculated CGE", () => {
    it("should calculate CGE for Warblade", () => {
      const character = createBaseWarblade(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warblade-maneuvers'];
      expect(cge).toBeDefined();
      expect(cge?.classId).toBe('warblade');
      expect(cge?.entityType).toBe('maneuver');
    });

    it("should have correct class level", () => {
      const character = createBaseWarblade(4).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warblade-maneuvers'];
      expect(cge?.classLevel).toBe(4);
    });

    it("should have single track with NONE resource", () => {
      const character = createBaseWarblade(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warblade-maneuvers'];
      expect(cge?.tracks).toHaveLength(1);
      expect(cge?.tracks[0].resourceType).toBe('NONE');
    });

    it("should have LIST preparation type", () => {
      const character = createBaseWarblade(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warblade-maneuvers'];
      expect(cge?.tracks[0].preparationType).toBe('LIST');
    });

    it("should not have slots or pool for NONE resource", () => {
      const character = createBaseWarblade(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warblade-maneuvers'];
      expect(cge?.tracks[0].slots).toBeUndefined();
      expect(cge?.tracks[0].pool).toBeUndefined();
    });
  });

  // ==========================================================================
  // KNOWN LIMITS (LIMITED_TOTAL)
  // ==========================================================================

  describe("Known limits (LIMITED_TOTAL)", () => {
    it("should have knownLimits defined", () => {
      const character = createBaseWarblade(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warblade-maneuvers'];
      expect(cge?.knownLimits).toBeDefined();
    });

    it("should increase known limit with class level", () => {
      const char1 = createBaseWarblade(1).build();
      const char5 = createBaseWarblade(5).build();

      const sheet1 = calculateCharacterSheet(char1);
      const sheet5 = calculateCharacterSheet(char5);

      const cge1 = sheet1.cge?.['warblade-maneuvers'];
      const cge5 = sheet5.cge?.['warblade-maneuvers'];

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
    it("should add maneuver to known list", () => {
      let character = createBaseWarblade(1).build();

      const result = addKnownEntity(
        character,
        'warblade-maneuvers',
        MANEUVERS.steelWind,
        1 // maneuver level
      );

      expect(result.warnings).toHaveLength(0);
      character = result.character;

      expect(isEntityKnown(character, 'warblade-maneuvers', MANEUVERS.steelWind.id)).toBe(true);
    });

    it("should add multiple maneuvers", () => {
      let character = createBaseWarblade(1).build();

      // Anadir las 3 maniobras iniciales del Warblade
      let result = addKnownEntity(character, 'warblade-maneuvers', MANEUVERS.steelWind, 1);
      character = result.character;

      result = addKnownEntity(character, 'warblade-maneuvers', MANEUVERS.stoneBones, 1);
      character = result.character;

      result = addKnownEntity(character, 'warblade-maneuvers', MANEUVERS.clawAtTheMoon, 1);
      character = result.character;

      expect(getTotalKnownCount(character, 'warblade-maneuvers')).toBe(3);
    });

    it("should remove maneuver from known list", () => {
      let character = createBaseWarblade(1).build();

      // Anadir
      let result = addKnownEntity(character, 'warblade-maneuvers', MANEUVERS.steelWind, 1);
      character = result.character;
      expect(isEntityKnown(character, 'warblade-maneuvers', MANEUVERS.steelWind.id)).toBe(true);

      // Quitar
      result = removeKnownEntity(character, 'warblade-maneuvers', MANEUVERS.steelWind.id);
      character = result.character;
      expect(isEntityKnown(character, 'warblade-maneuvers', MANEUVERS.steelWind.id)).toBe(false);
    });

    it("should get all known maneuvers", () => {
      let character = createBaseWarblade(3).build();

      // Anadir varias maniobras
      let result = addKnownEntity(character, 'warblade-maneuvers', MANEUVERS.steelWind, 1);
      character = result.character;

      result = addKnownEntity(character, 'warblade-maneuvers', MANEUVERS.stoneBones, 1);
      character = result.character;

      result = addKnownEntity(character, 'warblade-maneuvers', MANEUVERS.emeraldRazor, 2);
      character = result.character;

      const known = getKnownEntitiesByCGE(character, 'warblade-maneuvers');
      const allKnownIds = Object.values(known).flat();

      expect(allKnownIds).toContain(MANEUVERS.steelWind.id);
      expect(allKnownIds).toContain(MANEUVERS.stoneBones.id);
      expect(allKnownIds).toContain(MANEUVERS.emeraldRazor.id);
      expect(allKnownIds).toHaveLength(3);
    });
  });

  // ==========================================================================
  // SHEET CON KNOWN
  // ==========================================================================

  describe("Sheet with known maneuvers", () => {
    it("should reflect known count in calculated limits", () => {
      let character = createBaseWarblade(1).build();

      // Sin conocidos
      let sheet = calculateCharacterSheet(character);
      let cge = sheet.cge?.['warblade-maneuvers'];
      // LIMITED_TOTAL tiene un solo limite (level 0 por convencion)
      const limitBefore = cge?.knownLimits?.[0];
      expect(limitBefore?.current).toBe(0);

      // Anadir 1 maniobra
      const result = addKnownEntity(character, 'warblade-maneuvers', MANEUVERS.steelWind, 1);
      character = result.character;

      sheet = calculateCharacterSheet(character);
      cge = sheet.cge?.['warblade-maneuvers'];
      const limitAfter = cge?.knownLimits?.[0];
      expect(limitAfter?.current).toBe(1);
    });

    it("should include config reference", () => {
      const character = createBaseWarblade(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warblade-maneuvers'];
      expect(cge?.config).toEqual(warbladeCGEConfig);
    });
  });

  // ==========================================================================
  // READIED MANEUVERS (LIST PREPARATION)
  // ==========================================================================

  describe("Readied maneuvers concept", () => {
    // Nota: Las operaciones de LIST preparation pueden no estar implementadas aun.
    // Estos tests documentan el comportamiento esperado.

    it("should have LIST preparation configuration", () => {
      const character = createBaseWarblade(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['warblade-maneuvers'];
      expect(cge?.tracks[0].preparationType).toBe('LIST');

      // La config original deberia tener los detalles de LIST
      const config = cge?.config;
      const prep = config?.tracks[0].preparation;
      if (prep?.type === 'LIST') {
        expect(prep.structure).toBe('GLOBAL');
        expect(prep.consumeOnUse).toBe(true);
        expect(prep.recovery).toBe('encounter');
      }
    });
  });
});
