import { describe, it, expect } from "bun:test";
import { calculateInitiative } from "./calculateInitiative";
import { BaseBonusTypes, ContextualizedChange, InitiativeChange } from "../../baseData/changes";
import { SubstitutionIndex } from "../sources/calculateSources";
import { CompiledEffects } from "../effects/compileEffects";
import { SourcedEffect } from "../../baseData/effects";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";

// =============================================================================
// HELPERS
// =============================================================================

function createValuesIndex(dexModifier: number = 0): SubstitutionIndex {
  return {
    [valueIndexKeys.DEX_MODIFIER]: dexModifier,
  };
}

function createInitiativeChange(
  value: number,
  bonusType: string = "UNTYPED",
  name: string = "Test Change"
): ContextualizedChange<InitiativeChange> {
  return {
    type: "INITIATIVE",
    formula: { expression: value.toString() },
    bonusTypeId: bonusType as BaseBonusTypes,
    name,
    originId: "test",
    originType: "other",
  };
}

function createInitiativeEffect(
  value: number | string,
  bonusType: string = "UNTYPED",
  sourceName: string = "Test Effect"
): SourcedEffect {
  return {
    target: "initiative.total",
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

// =============================================================================
// TESTS: Basic Initiative Calculation (without effects)
// =============================================================================

describe("calculateInitiative - Basic functionality", () => {
  it("should calculate initiative with dex modifier only", () => {
    const valuesIndex = createValuesIndex(3);
    const result = calculateInitiative([], valuesIndex);

    expect(result.totalValue).toBe(3);
    expect(result.sourceValues.length).toBe(1);
    expect(result.sourceValues[0].sourceName).toBe("Dexterity Modifier");
  });

  it("should apply initiative changes correctly", () => {
    const valuesIndex = createValuesIndex(3);
    const initiativeChanges = [
      createInitiativeChange(4, "UNTYPED", "Improved Initiative"),
    ];

    const result = calculateInitiative(initiativeChanges, valuesIndex);

    expect(result.totalValue).toBe(7); // 3 + 4
  });

  it("should handle multiple stacking untyped bonuses", () => {
    const valuesIndex = createValuesIndex(2);
    const initiativeChanges = [
      createInitiativeChange(4, "UNTYPED", "Improved Initiative"),
      createInitiativeChange(2, "UNTYPED", "Reactionary Trait"),
    ];

    const result = calculateInitiative(initiativeChanges, valuesIndex);

    expect(result.totalValue).toBe(8); // 2 + 4 + 2
  });

  it("should apply only highest non-stacking bonus", () => {
    const valuesIndex = createValuesIndex(2);
    const initiativeChanges = [
      createInitiativeChange(4, "INSIGHT", "Insight +4"),
      createInitiativeChange(2, "INSIGHT", "Insight +2"),
    ];

    const result = calculateInitiative(initiativeChanges, valuesIndex);

    expect(result.totalValue).toBe(6); // 2 + 4 (only highest insight)
  });

  it("should handle negative dex modifier", () => {
    const valuesIndex = createValuesIndex(-1);
    const result = calculateInitiative([], valuesIndex);

    expect(result.totalValue).toBe(-1);
  });
});

// =============================================================================
// TESTS: Effects Integration
// =============================================================================

describe("calculateInitiative - Effects", () => {
  it("should apply effects to initiative", () => {
    const valuesIndex = createValuesIndex(3);
    const effects = createCompiledEffects([
      createInitiativeEffect(4, "UNTYPED", "Cat's Grace"),
    ]);

    const result = calculateInitiative([], valuesIndex, effects);

    expect(result.totalValue).toBe(7); // 3 + 4
  });

  it("should combine changes and effects", () => {
    const valuesIndex = createValuesIndex(2);
    const initiativeChanges = [
      createInitiativeChange(4, "UNTYPED", "Improved Initiative"),
    ];
    const effects = createCompiledEffects([
      createInitiativeEffect(2, "UNTYPED", "Haste"),
    ]);

    const result = calculateInitiative(initiativeChanges, valuesIndex, effects);

    expect(result.totalValue).toBe(8); // 2 + 4 + 2
  });

  it("should apply stacking rules between changes and effects", () => {
    const valuesIndex = createValuesIndex(2);
    const initiativeChanges = [
      createInitiativeChange(4, "INSIGHT", "Insight bonus"),
    ];
    const effects = createCompiledEffects([
      createInitiativeEffect(2, "INSIGHT", "Lesser insight"),
    ]);

    const result = calculateInitiative(initiativeChanges, valuesIndex, effects);

    expect(result.totalValue).toBe(6); // 2 + 4 (only highest insight)
    
    const relevantSources = result.sourceValues.filter(sv => sv.relevant);
    const insightSources = relevantSources.filter(sv => sv.bonusTypeId === "INSIGHT");
    expect(insightSources.length).toBe(1);
  });

  it("should handle effects with formulas using substitution", () => {
    const valuesIndex = createValuesIndex(3);
    valuesIndex["character.level"] = 5;
    
    const effects = createCompiledEffects([
      createInitiativeEffect("floor(@character.level / 2)", "UNTYPED", "Level-based bonus"),
    ]);

    const result = calculateInitiative([], valuesIndex, effects);

    expect(result.totalValue).toBe(5); // 3 + floor(5/2) = 3 + 2
  });

  it("should handle effects with conditions", () => {
    const valuesIndex = createValuesIndex(3);
    valuesIndex["character.level"] = 10;

    const effectWithCondition: SourcedEffect = {
      target: "initiative.total",
      formula: "4",
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
    const result = calculateInitiative([], valuesIndex, effects);

    expect(result.totalValue).toBe(7); // 3 + 4 (condition met)
  });

  it("should ignore effects when conditions not met", () => {
    const valuesIndex = createValuesIndex(3);
    valuesIndex["character.level"] = 5;

    const effectWithCondition: SourcedEffect = {
      target: "initiative.total",
      formula: "4",
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
    const result = calculateInitiative([], valuesIndex, effects);

    expect(result.totalValue).toBe(3); // Only dex modifier (condition not met)
  });
});

