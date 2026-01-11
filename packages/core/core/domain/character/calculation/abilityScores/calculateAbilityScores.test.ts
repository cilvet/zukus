import { describe, it, expect } from "bun:test";
import { mapAbilityScore, getAbilityModifier } from "./calculateAbilityScores";
import { BaseAbilityData } from "../../baseData/abilities";
import { AbilityCheckChange, AbilityScoreChange, BaseBonusTypes } from "../../baseData/changes";
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

function createAbilityScoreSource(
  abilityId: string,
  value: number,
  bonusType: string = "UNTYPED",
  name: string = "Test Source"
): Source<AbilityScoreChange> {
  return {
    type: "ABILITY_SCORE",
    abilityUniqueId: abilityId,
    formula: { expression: value.toString() },
    bonusTypeId: bonusType as BaseBonusTypes,
    name,
    originId: "test",
    originType: "other",
    totalValue: value,
  };
}

function createAbilityEffect(
  abilityId: string,
  value: number | string,
  bonusType: string = "UNTYPED",
  sourceName: string = "Test Effect"
): SourcedEffect {
  return {
    target: `ability.${abilityId}.score`,
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

function createBaseAbilityData(baseScore: number): BaseAbilityData {
  return {
    baseScore,
    drain: 0,
    damage: 0,
    penalty: 0,
  };
}

// =============================================================================
// TESTS: Basic Ability Score Calculation (without effects)
// =============================================================================

describe("mapAbilityScore - Basic functionality", () => {
  it("should calculate ability score correctly with no changes", () => {
    const baseData = createBaseAbilityData(14);
    const result = mapAbilityScore(
      baseData,
      "strength",
      [],
      [],
      createValuesIndex()
    );

    expect(result.totalScore).toBe(14);
    expect(result.totalModifier).toBe(2); // (14 - 10) / 2 = 2
    expect(result.baseScore).toBe(14);
    expect(result.baseModifier).toBe(2);
  });

  it("should apply ability score changes correctly", () => {
    const baseData = createBaseAbilityData(14);
    const sources = [createAbilityScoreSource("strength", 4, "ENHANCEMENT", "Belt of Strength")];
    
    const result = mapAbilityScore(
      baseData,
      "strength",
      sources,
      [],
      createValuesIndex()
    );

    expect(result.totalScore).toBe(18);
    expect(result.totalModifier).toBe(4);
  });

  it("should handle multiple stacking untyped bonuses", () => {
    const baseData = createBaseAbilityData(10);
    const sources = [
      createAbilityScoreSource("strength", 2, "UNTYPED", "Bonus 1"),
      createAbilityScoreSource("strength", 2, "UNTYPED", "Bonus 2"),
    ];

    const result = mapAbilityScore(
      baseData,
      "strength",
      sources,
      [],
      createValuesIndex()
    );

    expect(result.totalScore).toBe(14); // 10 + 2 + 2
  });

  it("should apply only highest enhancement bonus", () => {
    const baseData = createBaseAbilityData(10);
    const sources = [
      createAbilityScoreSource("strength", 4, "ENHANCEMENT", "Belt +4"),
      createAbilityScoreSource("strength", 2, "ENHANCEMENT", "Belt +2"),
    ];

    const result = mapAbilityScore(
      baseData,
      "strength",
      sources,
      [],
      createValuesIndex()
    );

    expect(result.totalScore).toBe(14); // 10 + 4 (only highest)
    expect(result.sourceValues.filter(sv => sv.relevant).length).toBeGreaterThan(0);
  });

  it("should handle drain, damage, and penalty", () => {
    const baseData: BaseAbilityData = {
      baseScore: 16,
      drain: 2,
      damage: 1,
      penalty: 1,
    };

    const result = mapAbilityScore(
      baseData,
      "strength",
      [],
      [],
      createValuesIndex()
    );

    expect(result.totalScore).toBe(12); // 16 - 2 - 1 - 1
    expect(result.drain).toBe(2);
    expect(result.damage).toBe(1);
    expect(result.penalty).toBe(1);
  });

  it("should not allow negative ability scores", () => {
    const baseData: BaseAbilityData = {
      baseScore: 10,
      drain: 15,
      damage: 0,
      penalty: 0,
    };

    const result = mapAbilityScore(
      baseData,
      "strength",
      [],
      [],
      createValuesIndex()
    );

    expect(result.totalScore).toBe(0); // Clamped at 0
  });
});

// =============================================================================
// TESTS: Effects Integration
// =============================================================================

describe("mapAbilityScore - Effects", () => {
  it("should apply effects to ability score", () => {
    const baseData = createBaseAbilityData(14);
    const effects = createCompiledEffects([
      createAbilityEffect("strength", 4, "ENHANCEMENT", "Bull's Strength"),
    ]);

    const result = mapAbilityScore(
      baseData,
      "strength",
      [],
      [],
      createValuesIndex(),
      effects
    );

    expect(result.totalScore).toBe(18); // 14 + 4
    expect(result.totalModifier).toBe(4);
  });

  it("should combine changes and effects", () => {
    const baseData = createBaseAbilityData(10);
    const sources = [
      createAbilityScoreSource("strength", 2, "UNTYPED", "Rage"),
    ];
    const effects = createCompiledEffects([
      createAbilityEffect("strength", 4, "ENHANCEMENT", "Bull's Strength"),
    ]);

    const result = mapAbilityScore(
      baseData,
      "strength",
      sources,
      [],
      createValuesIndex(),
      effects
    );

    expect(result.totalScore).toBe(16); // 10 + 2 + 4
  });

  it("should apply stacking rules between changes and effects", () => {
    const baseData = createBaseAbilityData(10);
    const sources = [
      createAbilityScoreSource("strength", 4, "ENHANCEMENT", "Belt +4"),
    ];
    const effects = createCompiledEffects([
      createAbilityEffect("strength", 2, "ENHANCEMENT", "Spell +2"),
    ]);

    const result = mapAbilityScore(
      baseData,
      "strength",
      sources,
      [],
      createValuesIndex(),
      effects
    );

    expect(result.totalScore).toBe(14); // 10 + 4 (only highest enhancement)
    
    const relevantSources = result.sourceValues.filter(sv => sv.relevant);
    const enhancementSources = relevantSources.filter(sv => sv.bonusTypeId === "ENHANCEMENT");
    expect(enhancementSources.length).toBe(1);
  });

  it("should handle effects with formulas using substitution", () => {
    const baseData = createBaseAbilityData(10);
    const valuesIndex = createValuesIndex();
    valuesIndex["character.level"] = 5;
    
    const effects = createCompiledEffects([
      createAbilityEffect("strength", "@character.level", "UNTYPED", "Level-based bonus"),
    ]);

    const result = mapAbilityScore(
      baseData,
      "strength",
      [],
      [],
      valuesIndex,
      effects
    );

    expect(result.totalScore).toBe(15); // 10 + 5
  });

  it("should only apply effects targeting the specific ability", () => {
    const baseData = createBaseAbilityData(14);
    const effects = createCompiledEffects([
      createAbilityEffect("strength", 4, "ENHANCEMENT", "Strength boost"),
      createAbilityEffect("dexterity", 4, "ENHANCEMENT", "Dexterity boost"),
    ]);

    const result = mapAbilityScore(
      baseData,
      "strength",
      [],
      [],
      createValuesIndex(),
      effects
    );

    expect(result.totalScore).toBe(18); // Should only apply strength effect
  });
});

// =============================================================================
// TESTS: Ability Modifier Calculation
// =============================================================================

describe("getAbilityModifier", () => {
  it("should calculate modifiers correctly", () => {
    expect(getAbilityModifier(10)).toBe(0);
    expect(getAbilityModifier(11)).toBe(0);
    expect(getAbilityModifier(12)).toBe(1);
    expect(getAbilityModifier(14)).toBe(2);
    expect(getAbilityModifier(18)).toBe(4);
    expect(getAbilityModifier(20)).toBe(5);
  });

  it("should handle low ability scores", () => {
    expect(getAbilityModifier(9)).toBe(-1);
    expect(getAbilityModifier(8)).toBe(-1);
    expect(getAbilityModifier(6)).toBe(-2);
    expect(getAbilityModifier(3)).toBe(-4);
  });
});

