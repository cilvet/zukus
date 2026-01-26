import { describe, expect, it, beforeEach } from "bun:test";
import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { createBaseCleric, clericCGEConfig, standardAbilityScores, cleric } from "./fixtures";
import { buildCharacter } from "../../../../../tests/character/buildCharacter";
import {
  prepareEntityInSlot,
  unprepareSlot,
  getBoundPreparations,
  getPreparedEntityInSlot,
  getPreparationsByLevel,
  getTotalPreparedCount,
} from "../../../../cge/preparationOperations";
import { CharacterBaseData } from "../../../baseData/character";

// Helper para crear Cleric sin bonus de Wisdom (para tests de valores exactos)
function createClericNoBonus(level: number = 1) {
  return buildCharacter()
    .withName("Test Cleric No Bonus")
    .withBaseAbilityScores({
      ...standardAbilityScores,
      wisdom: 10, // Sin bonus
      charisma: 10,
    })
    .withClassLevels(cleric, level);
}

// ============================================================================
// TEST SPELLS
// ============================================================================

const SPELLS = {
  // Oraciones (nivel 0)
  light: 'light',
  guidance: 'guidance',
  resistance: 'resistance',

  // Nivel 1
  bless: 'bless',
  cureLightWounds: 'cure-light-wounds',
  shieldOfFaith: 'shield-of-faith',

  // Nivel 1 - Dominio (solo para track de dominio)
  magicWeapon: 'magic-weapon', // War domain
  protectionFromEvil: 'protection-from-evil', // Good domain

  // Nivel 2
  holdPerson: 'hold-person',
  silenceSpell: 'silence',
};

describe("Cleric CGE", () => {
  // ==========================================================================
  // CALCULACION SIN KNOWN CONFIG
  // ==========================================================================

  describe("Calculated CGE without known config", () => {
    it("should calculate CGE without knownLimits when no known config", () => {
      const character = createBaseCleric(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['cleric-spells'];
      expect(cge).toBeDefined();
      expect(cge?.knownLimits).toBeUndefined();
    });

    it("should have correct class level", () => {
      const character = createBaseCleric(3).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['cleric-spells'];
      expect(cge?.classLevel).toBe(3);
    });

    it("should include config reference", () => {
      const character = createBaseCleric(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['cleric-spells'];
      expect(cge?.config).toEqual(clericCGEConfig);
    });
  });

  // ==========================================================================
  // MULTIPLES TRACKS
  // ==========================================================================

  describe("Multiple tracks", () => {
    it("should calculate both base and domain tracks", () => {
      const character = createBaseCleric(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['cleric-spells'];
      expect(cge?.tracks).toHaveLength(2);

      const baseTrack = cge?.tracks.find(t => t.id === 'base');
      const domainTrack = cge?.tracks.find(t => t.id === 'domain');

      expect(baseTrack).toBeDefined();
      expect(domainTrack).toBeDefined();
    });

    it("should have correct labels on each track", () => {
      const character = createBaseCleric(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['cleric-spells'];
      const baseTrack = cge?.tracks.find(t => t.id === 'base');
      const domainTrack = cge?.tracks.find(t => t.id === 'domain');

      expect(baseTrack?.label).toBe('base_slots');
      expect(domainTrack?.label).toBe('domain_slots');
    });

    it("should have BOUND preparation type on both tracks", () => {
      const character = createBaseCleric(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['cleric-spells'];
      const baseTrack = cge?.tracks.find(t => t.id === 'base');
      const domainTrack = cge?.tracks.find(t => t.id === 'domain');

      expect(baseTrack?.preparationType).toBe('BOUND');
      expect(domainTrack?.preparationType).toBe('BOUND');
    });
  });

  // ==========================================================================
  // SLOTS POR TRACK
  // ==========================================================================

  describe("Slots per track", () => {
    it("should calculate base track with orisons and level 1 slots", () => {
      const character = createClericNoBonus(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['cleric-spells'];
      const baseTrack = cge?.tracks.find(t => t.id === 'base');

      // Base track tiene oraciones (level 0) y slots nivel 1
      expect(baseTrack?.slots).toHaveLength(2);

      const level0 = baseTrack?.slots?.find(s => s.level === 0);
      const level1 = baseTrack?.slots?.find(s => s.level === 1);

      expect(level0).toBeDefined();
      expect(level0?.max).toBeGreaterThan(0);
      expect(level1).toBeDefined();
      expect(level1?.max).toBeGreaterThan(0);
    });

    it("should calculate domain track with level 1 slots only", () => {
      const character = createClericNoBonus(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['cleric-spells'];
      const domainTrack = cge?.tracks.find(t => t.id === 'domain');

      // Domain track solo tiene slots nivel 1+ (no oraciones)
      expect(domainTrack?.slots).toHaveLength(1);

      const level1 = domainTrack?.slots?.find(s => s.level === 1);
      expect(level1).toBeDefined();
      expect(level1?.max).toBeGreaterThan(0);
    });

    it("should add more spell levels as class level increases", () => {
      const character = createClericNoBonus(3).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['cleric-spells'];
      const baseTrack = cge?.tracks.find(t => t.id === 'base');
      const domainTrack = cge?.tracks.find(t => t.id === 'domain');

      // A nivel 3, base track tiene oraciones, nivel 1 y nivel 2
      expect(baseTrack?.slots).toHaveLength(3);
      expect(baseTrack?.slots?.find(s => s.level === 0)).toBeDefined();
      expect(baseTrack?.slots?.find(s => s.level === 1)).toBeDefined();
      expect(baseTrack?.slots?.find(s => s.level === 2)).toBeDefined();

      // Domain track tiene nivel 1 y nivel 2
      expect(domainTrack?.slots).toHaveLength(2);
      expect(domainTrack?.slots?.find(s => s.level === 1)).toBeDefined();
      expect(domainTrack?.slots?.find(s => s.level === 2)).toBeDefined();
    });

    it("should have boundSlots for BOUND preparation type", () => {
      const character = createClericNoBonus(1).build();
      const sheet = calculateCharacterSheet(character);

      const cge = sheet.cge?.['cleric-spells'];
      const baseTrack = cge?.tracks.find(t => t.id === 'base');

      // Cada slot level tiene boundSlots con slotIds correctos
      // Formato: "{trackId}:{level}-{index}"
      const level1 = baseTrack?.slots?.find(s => s.level === 1);
      expect(level1?.boundSlots).toBeDefined();
      expect(level1?.boundSlots?.length).toBeGreaterThan(0);
      expect(level1?.boundSlots?.[0].slotId).toBe('base:1-0');
      expect(level1?.boundSlots?.[0].level).toBe(1);
      expect(level1?.boundSlots?.[0].index).toBe(0);
    });
  });

  // ==========================================================================
  // PREPARACION EN BASE TRACK
  // ==========================================================================

  describe("Preparation in base track", () => {
    it("should prepare spell in base track slot", () => {
      let character = createBaseCleric(1).build();

      // Preparar Bless en slot 1-0 del track base
      const result = prepareEntityInSlot(
        character,
        'cleric-spells',
        1, // level
        0, // index
        SPELLS.bless
      );

      // Sin warnings de error
      expect(result.warnings.filter(w => w.type === 'cge_not_found')).toHaveLength(0);
      character = result.character;

      // Verificar que esta preparado
      const prepared = getPreparedEntityInSlot(character, 'cleric-spells', 1, 0);
      expect(prepared).toBe(SPELLS.bless);
    });

    it("should prepare orisons (level 0) in base track", () => {
      let character = createBaseCleric(1).build();

      // Preparar Light en slot 0-0
      const result1 = prepareEntityInSlot(character, 'cleric-spells', 0, 0, SPELLS.light);
      expect(result1.warnings).toHaveLength(0);
      character = result1.character;

      // Preparar Guidance en slot 0-1
      const result2 = prepareEntityInSlot(character, 'cleric-spells', 0, 1, SPELLS.guidance);
      expect(result2.warnings).toHaveLength(0);
      character = result2.character;

      // Verificar
      expect(getPreparedEntityInSlot(character, 'cleric-spells', 0, 0)).toBe(SPELLS.light);
      expect(getPreparedEntityInSlot(character, 'cleric-spells', 0, 1)).toBe(SPELLS.guidance);
    });

    it("should allow preparing same spell in multiple base slots", () => {
      let character = createBaseCleric(3).build();

      // Preparar Bless dos veces
      const result1 = prepareEntityInSlot(character, 'cleric-spells', 1, 0, SPELLS.bless);
      expect(result1.warnings).toHaveLength(0);
      character = result1.character;

      const result2 = prepareEntityInSlot(character, 'cleric-spells', 1, 1, SPELLS.bless);
      expect(result2.warnings).toHaveLength(0);
      character = result2.character;

      // Verificar ambos slots
      expect(getPreparedEntityInSlot(character, 'cleric-spells', 1, 0)).toBe(SPELLS.bless);
      expect(getPreparedEntityInSlot(character, 'cleric-spells', 1, 1)).toBe(SPELLS.bless);
    });
  });

  // ==========================================================================
  // PREPARACION EN DOMAIN TRACK
  // ==========================================================================

  describe("Preparation in domain track", () => {
    it("should prepare spell in domain track slot", () => {
      let character = createBaseCleric(1).build();

      // Preparar Magic Weapon (dominio War) en slot de dominio
      // Nota: Los slots de dominio usan el mismo cgeId pero el tracking es por slotId
      // En este caso, el slot de dominio nivel 1-0 es el mismo "namespace"
      const result = prepareEntityInSlot(
        character,
        'cleric-spells',
        1,
        0,
        SPELLS.magicWeapon
      );

      expect(result.warnings).toHaveLength(0);
      expect(getPreparedEntityInSlot(result.character, 'cleric-spells', 1, 0)).toBe(SPELLS.magicWeapon);
    });
  });

  // ==========================================================================
  // PREPARACIONES INDEPENDIENTES POR TRACK
  // ==========================================================================

  describe("Independent track preparations", () => {
    it("base and domain slots share same slot namespace", () => {
      // IMPORTANTE: En el diseño actual, todos los slots de un CGE comparten
      // el mismo namespace de slotIds. Esto significa que "1-0" en base y
      // "1-0" en domain son EL MISMO slot.
      //
      // Si queremos tracks verdaderamente independientes, necesitariamos
      // cambiar el formato de slotId a incluir trackId: "base:1-0" vs "domain:1-0"
      //
      // Por ahora, documentamos este comportamiento.

      let character = createBaseCleric(3).build();

      // Preparar en lo que pensamos es "base 1-0"
      const result1 = prepareEntityInSlot(character, 'cleric-spells', 1, 0, SPELLS.bless);
      character = result1.character;

      // Sobrescribir con lo que pensamos es "domain 1-0" - PERO ES EL MISMO SLOT
      const result2 = prepareEntityInSlot(character, 'cleric-spells', 1, 0, SPELLS.magicWeapon);
      character = result2.character;

      // Verificar que Magic Weapon sobrescribio a Bless
      expect(getPreparedEntityInSlot(character, 'cleric-spells', 1, 0)).toBe(SPELLS.magicWeapon);
    });

    it("should count total prepared across all shared slots", () => {
      let character = createBaseCleric(3).build();

      // Nivel 3 tiene:
      // Base: 4 oraciones (0-0 a 0-3), 2 nivel 1 (1-0, 1-1), 1 nivel 2 (2-0)
      // Domain: 1 nivel 1 (1-0), 1 nivel 2 (2-0) - PERO COMPARTEN NAMESPACE

      // Preparar algunos conjuros
      let result = prepareEntityInSlot(character, 'cleric-spells', 0, 0, SPELLS.light);
      character = result.character;

      result = prepareEntityInSlot(character, 'cleric-spells', 1, 0, SPELLS.bless);
      character = result.character;

      result = prepareEntityInSlot(character, 'cleric-spells', 2, 0, SPELLS.holdPerson);
      character = result.character;

      expect(getTotalPreparedCount(character, 'cleric-spells')).toBe(3);
    });
  });

  // ==========================================================================
  // UNPREPARE
  // ==========================================================================

  describe("Unprepare spells", () => {
    it("should unprepare spell from slot", () => {
      let character = createBaseCleric(1).build();

      // Preparar
      let result = prepareEntityInSlot(character, 'cleric-spells', 1, 0, SPELLS.bless);
      character = result.character;
      expect(getPreparedEntityInSlot(character, 'cleric-spells', 1, 0)).toBe(SPELLS.bless);

      // Despreparar
      result = unprepareSlot(character, 'cleric-spells', 1, 0);
      // Sin warnings de error (solo se acepta que estaba preparado)
      expect(result.warnings.filter(w => w.type === 'cge_not_found' || w.type === 'slot_not_prepared')).toHaveLength(0);
      character = result.character;

      expect(getPreparedEntityInSlot(character, 'cleric-spells', 1, 0)).toBeUndefined();
    });
  });

  // ==========================================================================
  // CALCULATED SHEET CON PREPARACIONES
  // ==========================================================================

  describe("Calculated sheet with preparations", () => {
    it("should show prepared entities in boundSlots", () => {
      let character = createBaseCleric(1).build();

      // Preparar algunos conjuros
      let result = prepareEntityInSlot(character, 'cleric-spells', 0, 0, SPELLS.light);
      character = result.character;

      result = prepareEntityInSlot(character, 'cleric-spells', 1, 0, SPELLS.bless);
      character = result.character;

      // Calcular sheet
      const sheet = calculateCharacterSheet(character);
      const cge = sheet.cge?.['cleric-spells'];
      const baseTrack = cge?.tracks.find(t => t.id === 'base');

      // Verificar oracion
      const level0 = baseTrack?.slots?.find(s => s.level === 0);
      expect(level0?.boundSlots?.[0].preparedEntityId).toBe(SPELLS.light);
      expect(level0?.boundSlots?.[1].preparedEntityId).toBeUndefined();

      // Verificar nivel 1
      const level1 = baseTrack?.slots?.find(s => s.level === 1);
      expect(level1?.boundSlots?.[0].preparedEntityId).toBe(SPELLS.bless);
    });

    it("should not generate warnings for Cleric (no known config)", () => {
      let character = createBaseCleric(1).build();

      // Preparar conjuro directamente (sin añadir a spellbook)
      const result = prepareEntityInSlot(character, 'cleric-spells', 1, 0, SPELLS.bless);
      character = result.character;

      // Calcular sheet
      const sheet = calculateCharacterSheet(character);

      // Cleric no tiene known config, asi que no hay warning de "prepared but not known"
      const cgeWarnings = (sheet as any)._cgeWarnings ?? sheet.warnings?.filter(
        w => w.type === 'prepared_entity_not_known'
      ) ?? [];

      // No deberia haber warnings de "not known" porque Cleric no tiene sistema de conocidos
      const notKnownWarnings = cgeWarnings.filter(
        (w: any) => w.type === 'prepared_entity_not_known'
      );
      expect(notKnownWarnings).toHaveLength(0);
    });
  });
});
