import { describe, it, expect } from "bun:test";
import { getInitialValuesIndex, valueIndexKeys } from "./valuesIndex";
import { buildCharacter } from "../../../../tests/character";
import { fighter } from "../../../../../srd/classes";
import { Race } from "../../baseData/race";

// =============================================================================
// HELPERS
// =============================================================================

const standardRace: Race = {
  uniqueId: "human",
  name: "Human",
  size: "MEDIUM",
  baseSpeeds: { landSpeed: { value: 30 } },
  languages: [],
  racialFeatures: [],
  levelAdjustment: 0,
  racialHD: 0,
};

const drowRace: Race = {
  uniqueId: "drow",
  name: "Drow",
  size: "MEDIUM",
  baseSpeeds: { landSpeed: { value: 30 } },
  languages: [],
  racialFeatures: [],
  levelAdjustment: 2,
  racialHD: 0,
};

const monsterRace: Race = {
  uniqueId: "minotaur",
  name: "Minotaur",
  size: "LARGE",
  baseSpeeds: { landSpeed: { value: 30 } },
  languages: [],
  racialFeatures: [],
  levelAdjustment: 2,
  racialHD: 6,
};

// =============================================================================
// TESTS: System Variables (ECL, totalHD, racialHD, levelAdjustment)
// =============================================================================

describe("valuesIndex - system variables", () => {
  describe("character with no race", () => {
    it("should set ECL equal to character level", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 5)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.ECL]).toBe(5);
    });

    it("should set racialHD to 0", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 5)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.RACIAL_HD]).toBe(0);
    });

    it("should set totalHD equal to character level", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 5)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.TOTAL_HD]).toBe(5);
    });

    it("should set levelAdjustment to 0", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 5)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.LEVEL_ADJUSTMENT]).toBe(0);
    });
  });

  describe("character with standard race (no LA, no racial HD)", () => {
    it("should set ECL equal to character level", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 3)
        .withRace(standardRace)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.ECL]).toBe(3);
    });

    it("should set totalHD equal to character level", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 3)
        .withRace(standardRace)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.TOTAL_HD]).toBe(3);
    });

    it("should set racialHD to 0", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 3)
        .withRace(standardRace)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.RACIAL_HD]).toBe(0);
    });

    it("should set levelAdjustment to 0", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 3)
        .withRace(standardRace)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.LEVEL_ADJUSTMENT]).toBe(0);
    });
  });

  describe("character with LA +2 race (drow)", () => {
    it("should set ECL to character level + level adjustment", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 4)
        .withRace(drowRace)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.ECL]).toBe(6); // 4 + 2
    });

    it("should set levelAdjustment to 2", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 4)
        .withRace(drowRace)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.LEVEL_ADJUSTMENT]).toBe(2);
    });

    it("should set totalHD equal to character level (no racial HD)", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 4)
        .withRace(drowRace)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.TOTAL_HD]).toBe(4);
    });

    it("should set racialHD to 0", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 4)
        .withRace(drowRace)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.RACIAL_HD]).toBe(0);
    });
  });

  describe("character with racial HD and LA (monster race)", () => {
    it("should set totalHD to character level + racial HD", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 2)
        .withRace(monsterRace)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.TOTAL_HD]).toBe(8); // 2 class + 6 racial
    });

    it("should set racialHD to the racial hit dice count", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 2)
        .withRace(monsterRace)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.RACIAL_HD]).toBe(6);
    });

    it("should set ECL to character level + level adjustment", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 2)
        .withRace(monsterRace)
        .build();

      const index = getInitialValuesIndex(character);

      // ECL = class levels + LA (racial HD don't add to ECL directly,
      // they are part of the monster's level progression)
      expect(index[valueIndexKeys.ECL]).toBe(4); // 2 + 2
    });

    it("should set levelAdjustment correctly", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 2)
        .withRace(monsterRace)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.LEVEL_ADJUSTMENT]).toBe(2);
    });
  });

  describe("character level is still correctly set", () => {
    it("should set character level independent of race variables", () => {
      const character = buildCharacter()
        .withClassLevels(fighter, 7)
        .withRace(monsterRace)
        .build();

      const index = getInitialValuesIndex(character);

      expect(index[valueIndexKeys.CHARACTER_LEVEL]).toBe(7);
    });
  });
});
