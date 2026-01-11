import {
  ContextualizedChange,
  SizeChange,
} from "../../baseData/changes";
import { CharacterBaseData } from "../../baseData/character";
import {
  getSizeCategory,
} from "../../baseData/sizes";
import { CalculatedSize } from "../../calculatedSheet/calculatedSize";
import { Source } from "../../calculatedSheet/sources";
import { getSheetWithUpdatedField } from "../calculateCharacterSheet";
import {
  calculateSource,
  SubstitutionIndex,
} from "../sources/calculateSources";
import { CharacterChanges } from "../sources/compileCharacterChanges";
import { getCalculatedSourceValues, SourceValueSum } from "../sources/sumSources";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";
import { CompiledEffects, getEffectsByTarget } from "../effects/compileEffects";
import {
  calculateEffect,
  effectsToSourceValues,
  mergeEffectsWithSources,
} from "../effects/applyEffects";
import { ContextualChange } from "../../baseData/contextualChange";
import { SpecialChange } from "../../baseData/specialChanges";

export const getCalculatedSize: getSheetWithUpdatedField =
  function (
    baseData: CharacterBaseData,
    index: SubstitutionIndex,
    changes: CharacterChanges,
    contextualChanges?: ContextualChange[],
    specialChanges?: SpecialChange[],
    effects?: CompiledEffects
  ) {
    const calculatedSize = calculateSize(changes.sizeChanges, index, effects);

    const indexValuesToUpdate: SubstitutionIndex = {
      [valueIndexKeys.SIZE_TOTAL]: calculatedSize.numericValue,
    };

    return {
      characterSheetFields: {
        size: calculatedSize,
      },
      indexValues: indexValuesToUpdate,
    };
  };

export function calculateSize(
  sizeChanges: ContextualizedChange<SizeChange>[],
  valuesIndex: SubstitutionIndex,
  effects?: CompiledEffects
): CalculatedSize {
  const baseSizeNumber = valuesIndex[valueIndexKeys.SIZE_BASE];

  const resolvedSizeSources = sizeChanges.map((change) =>
    calculateSource(change, valuesIndex)
  );

  const dexBaseSource = getBaseSizeSource(baseSizeNumber, "Base size");
  const allSources = [dexBaseSource, ...resolvedSizeSources];

  // Calculate source values from changes
  const changesSourceValues = getCalculatedSourceValues(allSources);

  // Apply effects targeting size.total
  const finalSourceValues = applyEffectsToSize(
    changesSourceValues,
    valuesIndex,
    effects
  );

  const currentSize = getSizeCategory(finalSourceValues.total);
  const baseSize = getSizeCategory(baseSizeNumber);

  return {
    currentSize,
    baseSize,
    numericValue: finalSourceValues.total,
    sources: allSources,
    sourceValues: finalSourceValues.sourceValues,
  };
}

/**
 * Applies effects targeting "size.total" to the calculated size.
 */
function applyEffectsToSize(
  changesSourceValues: SourceValueSum,
  valuesIndex: SubstitutionIndex,
  effects?: CompiledEffects
): SourceValueSum {
  if (!effects) {
    return changesSourceValues;
  }

  // Get effects targeting size.total
  const sizeEffects = getEffectsByTarget(effects, "size.total");

  if (sizeEffects.length === 0) {
    return changesSourceValues;
  }

  // Calculate each effect
  const calculatedEffects = sizeEffects.map((effect) =>
    calculateEffect(effect, valuesIndex)
  );

  // Convert to source values
  const effectsSourceValues = effectsToSourceValues(calculatedEffects);

  // Merge with changes source values
  return mergeEffectsWithSources(changesSourceValues, effectsSourceValues);
}

function getBaseSizeSource(value: number, name: string): Source<SizeChange> {
  return {
    name,
    type: 'SIZE',
    totalValue: value,
    originId: "base",
    originType: "base",
    bonusTypeId: "BASE",
    formula: {
      expression: value.toString(),
    },
  };
}
