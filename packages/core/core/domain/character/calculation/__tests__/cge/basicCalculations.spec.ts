import { describe, it, expect } from "bun:test";
import { calculateCharacterSheet } from "../../calculateCharacterSheet";
import { createBaseSorcerer } from "./fixtures";
import {
  expectCGEExists,
  expectCGESlots,
  expectCGEKnownLimits,
  expectCGESlotVariables,
  expectCGEKnownVariables,
} from "./helpers";

describe("CGE Calculations - Basic", () => {
  describe("Sorcerer Level 1", () => {
    it("should calculate CGE for sorcerer with correct slots", () => {
      const character = createBaseSorcerer(1).build();
      const sheet = calculateCharacterSheet(character);

      // Verificar que el CGE existe
      expectCGEExists(sheet.cge, "sorcerer-spells", "sorcerer");

      // Verificar slots: nivel 1 tiene 5 cantrips y 3 slots nivel 1
      expectCGESlots(sheet.cge["sorcerer-spells"], [
        { level: 0, max: 5 },
        { level: 1, max: 3 },
      ]);
    });

    it("should calculate known limits correctly", () => {
      const character = createBaseSorcerer(1).build();
      const sheet = calculateCharacterSheet(character);

      // Verificar conocidos: nivel 1 tiene 4 cantrips y 2 nivel 1
      expectCGEKnownLimits(sheet.cge["sorcerer-spells"], [
        { level: 0, max: 4 },
        { level: 1, max: 2 },
      ]);
    });

    it("should expose slot variables in substitution index", () => {
      const character = createBaseSorcerer(1).build();
      const sheet = calculateCharacterSheet(character);

      // Verificar variables de slots
      expectCGESlotVariables(sheet.substitutionValues, "sorcerer.spell", [
        { level: 0, max: 5 },
        { level: 1, max: 3 },
      ]);
    });

    it("should expose known variables in substitution index", () => {
      const character = createBaseSorcerer(1).build();
      const sheet = calculateCharacterSheet(character);

      // Verificar variables de conocidos
      expectCGEKnownVariables(sheet.substitutionValues, "sorcerer.spell", [
        { level: 0, max: 4 },
        { level: 1, max: 2 },
      ]);
    });
  });

  describe("Sorcerer Level 4", () => {
    it("should calculate slots for higher level", () => {
      const character = createBaseSorcerer(4).build();
      const sheet = calculateCharacterSheet(character);

      // Nivel 4: 6 cantrips, 6 nivel 1, 3 nivel 2
      expectCGESlots(sheet.cge["sorcerer-spells"], [
        { level: 0, max: 6 },
        { level: 1, max: 6 },
        { level: 2, max: 3 },
      ]);
    });

    it("should calculate known limits for higher level", () => {
      const character = createBaseSorcerer(4).build();
      const sheet = calculateCharacterSheet(character);

      // Nivel 4: 6 cantrips conocidos, 3 nivel 1, 1 nivel 2
      expectCGEKnownLimits(sheet.cge["sorcerer-spells"], [
        { level: 0, max: 6 },
        { level: 1, max: 3 },
        { level: 2, max: 1 },
      ]);
    });
  });

  describe("Class Level Variable", () => {
    it("should expose class level in cge result", () => {
      const character = createBaseSorcerer(3).build();
      const sheet = calculateCharacterSheet(character);

      expect(sheet.cge["sorcerer-spells"].classLevel).toBe(3);
    });
  });
});
