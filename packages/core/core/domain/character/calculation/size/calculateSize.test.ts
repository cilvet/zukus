import { describe, it, expect } from "bun:test";
import { calculateSize } from "./calculateSize";
import { BaseBonusTypes, ContextualizedChange, SizeChange } from "../../baseData/changes";
import { SubstitutionIndex } from "../sources/calculateSources";
import { CompiledEffects } from "../effects/compileEffects";
import { SourcedEffect } from "../../baseData/effects";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";

// =============================================================================
// HELPERS
// =============================================================================

function createValuesIndex(baseSize: number = 0): SubstitutionIndex {
  return {
    [valueIndexKeys.SIZE_BASE]: baseSize,
    [valueIndexKeys.SIZE_TOTAL]: baseSize,
  };
}

function createSizeChange(
  value: number,
  bonusType: string = "UNTYPED",
  name: string = "Test Change"
): ContextualizedChange<SizeChange> {
  return {
    type: "SIZE",
    formula: { expression: value.toString() },
    bonusTypeId: bonusType as BaseBonusTypes,
    name,
    originId: "test",
    originType: "other",
  };
}

function createSizeEffect(
  value: number | string,
  bonusType: string = "UNTYPED",
  sourceName: string = "Test Effect"
): SourcedEffect {
  return {
    target: "size.total",
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
// TESTS: Basic Size Calculation (without effects)
// =============================================================================

describe("calculateSize - Basic functionality", () => {
  it("should calculate base size correctly with no changes", () => {
    const valuesIndex = createValuesIndex(0); // MEDIUM = 0
    const result = calculateSize([], valuesIndex);

    expect(result.currentSize).toBe("MEDIUM");
    expect(result.baseSize).toBe("MEDIUM");
    expect(result.numericValue).toBe(0);
  });

  it("should apply size changes correctly", () => {
    const valuesIndex = createValuesIndex(0); // MEDIUM
    const sizeChanges = [createSizeChange(1)]; // +1 size category

    const result = calculateSize(sizeChanges, valuesIndex);

    expect(result.currentSize).toBe("LARGE");
    expect(result.numericValue).toBe(1);
  });

  it("should handle multiple stacking untyped changes", () => {
    const valuesIndex = createValuesIndex(0); // MEDIUM
    const sizeChanges = [
      createSizeChange(1, "UNTYPED", "Enlarge"),
      createSizeChange(1, "UNTYPED", "Growth"),
    ];

    const result = calculateSize(sizeChanges, valuesIndex);

    // UNTYPED stacks, so both +1 should apply
    expect(result.numericValue).toBe(2);
    expect(result.currentSize).toBe("HUGE");
  });

  it("should apply stacking rules for non-stacking bonus types", () => {
    const valuesIndex = createValuesIndex(0); // MEDIUM
    const sizeChanges = [
      createSizeChange(2, "ENHANCEMENT", "Belt +2"),
      createSizeChange(1, "ENHANCEMENT", "Ring +1"),
    ];

    const result = calculateSize(sizeChanges, valuesIndex);

    // ENHANCEMENT doesn't stack, only highest applies
    expect(result.numericValue).toBe(2);
    expect(result.currentSize).toBe("HUGE");
  });
});

// =============================================================================
// TESTS: Size Calculation with Effects
// =============================================================================

describe("calculateSize - With Effects", () => {
  it("should apply a simple effect to size", () => {
    const valuesIndex = createValuesIndex(0); // MEDIUM
    const effects = createCompiledEffects([createSizeEffect(1, "UNTYPED", "Enlarge Person")]);

    const result = calculateSize([], valuesIndex, effects);

    expect(result.currentSize).toBe("LARGE");
    expect(result.numericValue).toBe(1);
    expect(result.sourceValues.some((sv) => sv.sourceName === "Enlarge Person")).toBe(true);
  });

  it("should stack untyped effects", () => {
    const valuesIndex = createValuesIndex(0); // MEDIUM
    const effects = createCompiledEffects([
      createSizeEffect(1, "UNTYPED", "Effect 1"),
      createSizeEffect(1, "UNTYPED", "Effect 2"),
    ]);

    const result = calculateSize([], valuesIndex, effects);

    expect(result.numericValue).toBe(2);
    expect(result.currentSize).toBe("HUGE");
  });

  it("should not stack non-stacking effect bonus types", () => {
    const valuesIndex = createValuesIndex(0); // MEDIUM
    const effects = createCompiledEffects([
      createSizeEffect(2, "ENHANCEMENT", "Belt"),
      createSizeEffect(1, "ENHANCEMENT", "Ring"),
    ]);

    const result = calculateSize([], valuesIndex, effects);

    // Only highest enhancement applies
    expect(result.numericValue).toBe(2);
  });

  it("should combine changes and effects correctly", () => {
    const valuesIndex = createValuesIndex(0); // MEDIUM
    const sizeChanges = [createSizeChange(1, "UNTYPED", "Change +1")];
    const effects = createCompiledEffects([createSizeEffect(1, "UNTYPED", "Effect +1")]);

    const result = calculateSize(sizeChanges, valuesIndex, effects);

    // Both untyped bonuses should stack
    expect(result.numericValue).toBe(2);
    expect(result.currentSize).toBe("HUGE");
  });

  it("should apply stacking rules across changes and effects", () => {
    const valuesIndex = createValuesIndex(0); // MEDIUM
    const sizeChanges = [createSizeChange(2, "ENHANCEMENT", "Change Enhancement +2")];
    const effects = createCompiledEffects([
      createSizeEffect(3, "ENHANCEMENT", "Effect Enhancement +3"),
    ]);

    const result = calculateSize(sizeChanges, valuesIndex, effects);

    // Only highest enhancement applies (effect +3)
    expect(result.numericValue).toBe(3);
  });

  it("should stack different bonus types from changes and effects", () => {
    const valuesIndex = createValuesIndex(0); // MEDIUM
    const sizeChanges = [createSizeChange(1, "ENHANCEMENT", "Enhancement +1")];
    const effects = createCompiledEffects([createSizeEffect(1, "UNTYPED", "Untyped +1")]);

    const result = calculateSize(sizeChanges, valuesIndex, effects);

    // Different bonus types stack
    expect(result.numericValue).toBe(2);
  });
});

// =============================================================================
// TESTS: Effect Formula Evaluation
// =============================================================================

describe("calculateSize - Effect Formula Evaluation", () => {
  it("should evaluate effect formulas with variables", () => {
    const valuesIndex = createValuesIndex(0);
    valuesIndex["level"] = 10;

    const effects = createCompiledEffects([
      {
        target: "size.total",
        formula: "floor(@level / 5)", // 10/5 = 2
        bonusType: "UNTYPED",
        sourceRef: "test:level-based",
        sourceName: "Level Based Size",
      },
    ]);

    const result = calculateSize([], valuesIndex, effects);

    expect(result.numericValue).toBe(2);
    expect(result.currentSize).toBe("HUGE");
  });

  it("should handle string formula shorthand", () => {
    const valuesIndex = createValuesIndex(0);

    const effects = createCompiledEffects([
      {
        target: "size.total",
        formula: "1 + 1", // Simple expression
        bonusType: "UNTYPED",
        sourceRef: "test:simple",
        sourceName: "Simple Effect",
      },
    ]);

    const result = calculateSize([], valuesIndex, effects);

    expect(result.numericValue).toBe(2);
  });
});

// =============================================================================
// TESTS: Effect Conditions
// =============================================================================

describe("calculateSize - Effect Conditions", () => {
  it("should apply effect when condition is met", () => {
    const valuesIndex = createValuesIndex(0);
    valuesIndex["level"] = 10;

    const effects = createCompiledEffects([
      {
        target: "size.total",
        formula: "1",
        bonusType: "UNTYPED",
        sourceRef: "test:conditional",
        sourceName: "Conditional Effect",
        conditions: [
          {
            type: "simple",
            firstFormula: "@level",
            operator: ">=",
            secondFormula: "5",
          },
        ],
      },
    ]);

    const result = calculateSize([], valuesIndex, effects);

    expect(result.numericValue).toBe(1);
  });

  it("should not apply effect when condition is not met", () => {
    const valuesIndex = createValuesIndex(0);
    valuesIndex["level"] = 3;

    const effects = createCompiledEffects([
      {
        target: "size.total",
        formula: "1",
        bonusType: "UNTYPED",
        sourceRef: "test:conditional",
        sourceName: "Conditional Effect",
        conditions: [
          {
            type: "simple",
            firstFormula: "@level",
            operator: ">=",
            secondFormula: "5",
          },
        ],
      },
    ]);

    const result = calculateSize([], valuesIndex, effects);

    // Condition not met, effect should not apply
    expect(result.numericValue).toBe(0);
  });
});

// =============================================================================
// TESTS: Edge Cases
// =============================================================================

describe("calculateSize - Edge Cases", () => {
  it("should handle no effects gracefully", () => {
    const valuesIndex = createValuesIndex(0);
    const result = calculateSize([], valuesIndex, undefined);

    expect(result.numericValue).toBe(0);
    expect(result.currentSize).toBe("MEDIUM");
  });

  it("should handle empty effects gracefully", () => {
    const valuesIndex = createValuesIndex(0);
    const effects = createCompiledEffects([]);

    const result = calculateSize([], valuesIndex, effects);

    expect(result.numericValue).toBe(0);
    expect(result.currentSize).toBe("MEDIUM");
  });

  it("should ignore effects with different targets", () => {
    const valuesIndex = createValuesIndex(0);
    const effects = createCompiledEffects([
      {
        target: "ability.strength.score", // Wrong target
        formula: "10",
        bonusType: "UNTYPED",
        sourceRef: "test:wrong-target",
        sourceName: "Wrong Target Effect",
      },
    ]);

    const result = calculateSize([], valuesIndex, effects);

    // Effect should be ignored because it targets ability, not size
    expect(result.numericValue).toBe(0);
  });

  it("should clamp size to valid categories", () => {
    const valuesIndex = createValuesIndex(0);
    const effects = createCompiledEffects([
      createSizeEffect(10, "UNTYPED", "Massive Growth"), // Beyond COLOSSAL
    ]);

    const result = calculateSize([], valuesIndex, effects);

    // Should cap at COLOSSAL (4)
    expect(result.currentSize).toBe("COLOSSAL");
  });

  it("should handle negative size values", () => {
    const valuesIndex = createValuesIndex(0);
    const effects = createCompiledEffects([
      createSizeEffect(-3, "UNTYPED", "Reduce Person"),
    ]);

    const result = calculateSize([], valuesIndex, effects);

    expect(result.numericValue).toBe(-3);
    expect(result.currentSize).toBe("DIMINUTIVE");
  });
});

// =============================================================================
// TESTS: Source Values Traceability
// =============================================================================

describe("calculateSize - Source Values Traceability", () => {
  it("should include effect source information in sourceValues", () => {
    const valuesIndex = createValuesIndex(0);
    const effects = createCompiledEffects([
      createSizeEffect(1, "UNTYPED", "Enlarge Person"),
    ]);

    const result = calculateSize([], valuesIndex, effects);

    const effectSource = result.sourceValues.find(
      (sv) => sv.sourceName === "Enlarge Person"
    );
    expect(effectSource).toBeDefined();
    expect(effectSource?.value).toBe(1);
    expect(effectSource?.sourceUniqueId).toBe("test:enlarge-person");
  });

  it("should mark non-stacking sources as not relevant", () => {
    const valuesIndex = createValuesIndex(0);
    const effects = createCompiledEffects([
      createSizeEffect(3, "ENHANCEMENT", "Strong Enhancement"),
      createSizeEffect(1, "ENHANCEMENT", "Weak Enhancement"),
    ]);

    const result = calculateSize([], valuesIndex, effects);

    const strongSource = result.sourceValues.find(
      (sv) => sv.sourceName === "Strong Enhancement"
    );
    const weakSource = result.sourceValues.find(
      (sv) => sv.sourceName === "Weak Enhancement"
    );

    expect(strongSource?.relevant).toBe(true);
    expect(weakSource?.relevant).toBe(false);
  });
});


