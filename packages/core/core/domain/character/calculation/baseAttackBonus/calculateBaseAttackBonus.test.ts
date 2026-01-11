import { describe, it, expect } from "bun:test";
import { getTotalBaseAttackBonus, calculateMultipleBaseAttackBonuses } from "./calculateBaseAttackBonus";
import { BabType } from "../../../class/baseAttackBonus";
import { CharacterClass } from "../../../class/class";
import { BaseAttackBonusChange } from "../../baseData/attacks";
import { BaseBonusTypes } from "../../baseData/changes";
import { Source } from "../../calculatedSheet/sources";
import { SubstitutionIndex } from "../sources/calculateSources";
import { CompiledEffects } from "../effects/compileEffects";
import { SourcedEffect } from "../../baseData/effects";

// =============================================================================
// HELPERS
// =============================================================================

function createValuesIndex(): SubstitutionIndex {
  return {};
}

function createBABSource(
  value: number,
  bonusType: string = "UNTYPED",
  name: string = "Test Source"
): Source<BaseAttackBonusChange> {
  return {
    type: "BAB",
    formula: { expression: value.toString() },
    bonusTypeId: bonusType as BaseBonusTypes,
    name,
    originId: "test",
    originType: "other",
    totalValue: value,
  };
}

function createBABEffect(
  value: number | string,
  bonusType: string = "UNTYPED",
  sourceName: string = "Test Effect"
): SourcedEffect {
  return {
    target: "bab.total",
    formula: typeof value === "number" ? value.toString() : value,
    bonusType,
    sourceRef: `test:${sourceName.toLowerCase().replace(/\s+/g, "-")}`,
    sourceName,
  };
}

function createCompiledEffects(effects: SourcedEffect[]): CompiledEffects {
  const compiled: CompiledEffects = {
    all: effects,
    byPrefix: new Map(),
  };

  effects.forEach((effect) => {
    const prefix = effect.target.split(".")[0];
    const existing = compiled.byPrefix.get(prefix);
    if (existing) {
      existing.push(effect);
    } else {
      compiled.byPrefix.set(prefix, [effect]);
    }
  });

  return compiled;
}

function createFighterClass(level: number): CharacterClass {
  return {
    uniqueId: "fighter",
    name: "Fighter",
    level,
    baseAttackBonusProgression: BabType.GOOD,
    hitDie: 10,
    fortitudeSaveProgression: "GOOD",
    reflexSaveProgression: "POOR",
    willSaveProgression: "POOR",
    skillRanksPerLevel: 2,
    classSkills: [],
    classFeatures: [],
  };
}

function createWizardClass(level: number): CharacterClass {
  return {
    uniqueId: "wizard",
    name: "Wizard",
    level,
    baseAttackBonusProgression: BabType.POOR,
    hitDie: 4,
    fortitudeSaveProgression: "POOR",
    reflexSaveProgression: "POOR",
    willSaveProgression: "GOOD",
    skillRanksPerLevel: 2,
    classSkills: [],
    classFeatures: [],
  };
}

// =============================================================================
// TESTS: Multiple Attack Bonuses
// =============================================================================

describe("calculateMultipleBaseAttackBonuses", () => {
  it("should return single attack for BAB < 6", () => {
    expect(calculateMultipleBaseAttackBonuses(5)).toEqual([5]);
    expect(calculateMultipleBaseAttackBonuses(1)).toEqual([1]);
  });

  it("should return two attacks for BAB 6-10", () => {
    expect(calculateMultipleBaseAttackBonuses(6)).toEqual([6, 1]);
    expect(calculateMultipleBaseAttackBonuses(10)).toEqual([10, 5]);
  });

  it("should return three attacks for BAB 11-15", () => {
    expect(calculateMultipleBaseAttackBonuses(11)).toEqual([11, 6, 1]);
    expect(calculateMultipleBaseAttackBonuses(15)).toEqual([15, 10, 5]);
  });

  it("should return four attacks for BAB >= 16", () => {
    expect(calculateMultipleBaseAttackBonuses(16)).toEqual([16, 11, 6, 1]);
    expect(calculateMultipleBaseAttackBonuses(20)).toEqual([20, 15, 10, 5]);
  });
});

// =============================================================================
// TESTS: Basic BAB Calculation (without effects)
// =============================================================================

describe("getTotalBaseAttackBonus - Basic functionality", () => {
  it("should calculate BAB for single class correctly", () => {
    const classLevels = { fighter: 5 };
    const classes = [createFighterClass(5)];

    const result = getTotalBaseAttackBonus(
      classLevels,
      classes,
      [],
      createValuesIndex()
    );

    expect(result.totalValue).toBe(5); // Fighter 5 = +5 BAB
    expect(result.baseValue).toBe(5);
    expect(result.multipleBaseAttackBonuses).toEqual([5]);
  });

  it("should calculate BAB for multiclass correctly", () => {
    const classLevels = { fighter: 5, wizard: 3 };
    const classes = [createFighterClass(5), createWizardClass(3)];

    const result = getTotalBaseAttackBonus(
      classLevels,
      classes,
      [],
      createValuesIndex()
    );

    expect(result.totalValue).toBe(6); // Fighter 5 (+5) + Wizard 3 (+1) = +6
    expect(result.baseValue).toBe(6);
    expect(result.multipleBaseAttackBonuses).toEqual([6, 1]);
  });

  it("should apply BAB changes correctly", () => {
    const classLevels = { fighter: 5 };
    const classes = [createFighterClass(5)];
    const sources = [createBABSource(2, "UNTYPED", "Divine Power")];

    const result = getTotalBaseAttackBonus(
      classLevels,
      classes,
      sources,
      createValuesIndex()
    );

    expect(result.totalValue).toBe(7); // 5 + 2
  });

  it("should handle multiple stacking untyped bonuses", () => {
    const classLevels = { fighter: 5 };
    const classes = [createFighterClass(5)];
    const sources = [
      createBABSource(2, "UNTYPED", "Bonus 1"),
      createBABSource(1, "UNTYPED", "Bonus 2"),
    ];

    const result = getTotalBaseAttackBonus(
      classLevels,
      classes,
      sources,
      createValuesIndex()
    );

    expect(result.totalValue).toBe(8); // 5 + 2 + 1
  });

  it("should apply only highest non-stacking bonus", () => {
    const classLevels = { fighter: 5 };
    const classes = [createFighterClass(5)];
    const sources = [
      createBABSource(3, "MORALE", "Morale +3"),
      createBABSource(1, "MORALE", "Morale +1"),
    ];

    const result = getTotalBaseAttackBonus(
      classLevels,
      classes,
      sources,
      createValuesIndex()
    );

    expect(result.totalValue).toBe(8); // 5 + 3 (only highest morale)
  });
});

// =============================================================================
// TESTS: Effects Integration
// =============================================================================

describe("getTotalBaseAttackBonus - Effects", () => {
  it("should apply effects to BAB", () => {
    const classLevels = { fighter: 5 };
    const classes = [createFighterClass(5)];
    const effects = createCompiledEffects([
      createBABEffect(2, "UNTYPED", "Divine Favor"),
    ]);

    const result = getTotalBaseAttackBonus(
      classLevels,
      classes,
      [],
      createValuesIndex(),
      effects
    );

    expect(result.totalValue).toBe(7); // 5 + 2
  });

  it("should combine changes and effects", () => {
    const classLevels = { fighter: 5 };
    const classes = [createFighterClass(5)];
    const sources = [createBABSource(2, "UNTYPED", "Magic weapon")];
    const effects = createCompiledEffects([
      createBABEffect(1, "UNTYPED", "Haste"),
    ]);

    const result = getTotalBaseAttackBonus(
      classLevels,
      classes,
      sources,
      createValuesIndex(),
      effects
    );

    expect(result.totalValue).toBe(8); // 5 + 2 + 1
  });

  it("should apply stacking rules between changes and effects", () => {
    const classLevels = { fighter: 5 };
    const classes = [createFighterClass(5)];
    const sources = [createBABSource(3, "MORALE", "Inspire Courage")];
    const effects = createCompiledEffects([
      createBABEffect(2, "MORALE", "Lesser morale"),
    ]);

    const result = getTotalBaseAttackBonus(
      classLevels,
      classes,
      sources,
      createValuesIndex(),
      effects
    );

    expect(result.totalValue).toBe(8); // 5 + 3 (only highest morale)
    
    const relevantSources = result.sourceValues.filter(sv => sv.relevant);
    const moraleSources = relevantSources.filter(sv => sv.bonusTypeId === "MORALE");
    expect(moraleSources.length).toBe(1);
  });

  it("should handle effects with formulas using substitution", () => {
    const classLevels = { fighter: 5 };
    const classes = [createFighterClass(5)];
    const valuesIndex = createValuesIndex();
    valuesIndex["character.level"] = 8;
    
    const effects = createCompiledEffects([
      createBABEffect("floor(@character.level / 4)", "UNTYPED", "Level-based bonus"),
    ]);

    const result = getTotalBaseAttackBonus(
      classLevels,
      classes,
      [],
      valuesIndex,
      effects
    );

    expect(result.totalValue).toBe(7); // 5 + floor(8/4) = 5 + 2
  });

  it("should update multiple attack bonuses correctly with effects", () => {
    const classLevels = { fighter: 10 };
    const classes = [createFighterClass(10)];
    const effects = createCompiledEffects([
      createBABEffect(6, "UNTYPED", "Major boost"),
    ]);

    const result = getTotalBaseAttackBonus(
      classLevels,
      classes,
      [],
      createValuesIndex(),
      effects
    );

    expect(result.totalValue).toBe(16); // 10 + 6
    expect(result.multipleBaseAttackBonuses).toEqual([16, 11, 6, 1]);
  });

  it("should handle effects with conditions", () => {
    const classLevels = { fighter: 5 };
    const classes = [createFighterClass(5)];
    const valuesIndex = createValuesIndex();
    valuesIndex["character.level"] = 10;

    const effectWithCondition: SourcedEffect = {
      target: "bab.total",
      formula: "2",
      bonusType: "UNTYPED",
      sourceRef: "test:conditional-bonus",
      sourceName: "High Level Bonus",
      conditions: [
        {
          type: "simple",
          firstFormula: "@character.level",
          operator: ">=",
          secondFormula: "10",
        },
      ],
    };

    const effects = createCompiledEffects([effectWithCondition]);
    const result = getTotalBaseAttackBonus(
      classLevels,
      classes,
      [],
      valuesIndex,
      effects
    );

    expect(result.totalValue).toBe(7); // 5 + 2 (condition met)
  });

  it("should ignore effects when conditions not met", () => {
    const classLevels = { fighter: 5 };
    const classes = [createFighterClass(5)];
    const valuesIndex = createValuesIndex();
    valuesIndex["character.level"] = 5;

    const effectWithCondition: SourcedEffect = {
      target: "bab.total",
      formula: "2",
      bonusType: "UNTYPED",
      sourceRef: "test:conditional-bonus",
      sourceName: "High Level Bonus",
      conditions: [
        {
          type: "simple",
          firstFormula: "@character.level",
          operator: ">=",
          secondFormula: "10",
        },
      ],
    };

    const effects = createCompiledEffects([effectWithCondition]);
    const result = getTotalBaseAttackBonus(
      classLevels,
      classes,
      [],
      valuesIndex,
      effects
    );

    expect(result.totalValue).toBe(5); // Only base BAB (condition not met)
  });
});

