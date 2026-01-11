import {
  ChangeTypes,
  ContextualizedChange, InitiativeChange,
} from "../../baseData/changes";
import { CharacterBaseData } from "../../baseData/character";
import { CalculatedInitiative } from "../../calculatedSheet/calculatedInitiative";
import { Source } from "../../calculatedSheet/sources";
import { getSheetWithUpdatedField } from "../calculateCharacterSheet";
import {
  calculateSource,
  SubstitutionIndex,
} from "../sources/calculateSources";
import { CharacterChanges } from "../sources/compileCharacterChanges";
import {
  getCalculatedSourceValues,
  SourceValueSum,
} from "../sources/sumSources";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";
import { CompiledEffects, getEffectsByTarget } from "../effects/compileEffects";
import {
  calculateEffect,
  effectsToSourceValues,
  mergeEffectsWithSources,
} from "../effects/applyEffects";
import { ContextualChange } from "../../baseData/contextualChange";
import { SpecialChange } from "../../baseData/specialChanges";

export const getCalculatedInitiative: getSheetWithUpdatedField =
  function (
    baseData: CharacterBaseData,
    index: SubstitutionIndex,
    changes: CharacterChanges,
    contextualChanges?: ContextualChange[],
    specialChanges?: SpecialChange[],
    effects?: CompiledEffects
  ) {
    
    const calculatedInitiative = calculateInitiative(
      changes.initiativeChanges,
      index,
      effects
    );

    const indexValuesToUpdate: SubstitutionIndex = {
      [valueIndexKeys.INITIATIVE_TOTAL]: calculatedInitiative.totalValue,
    };

    return {
      characterSheetFields: {
        initiative: calculatedInitiative,
      },
      indexValues: indexValuesToUpdate
    };
  };

export function calculateInitiative(
  initiativeChanges: ContextualizedChange<InitiativeChange>[],
  valuesIndex: SubstitutionIndex,
  effects?: CompiledEffects
): CalculatedInitiative {
  const dexModifier = valuesIndex[valueIndexKeys.DEX_MODIFIER];

  const resolvedInitiativeSources = initiativeChanges.map((change) =>
    calculateSource(change, valuesIndex)
  );

  const dexBaseSource = getBaseInitiativeSource(
    dexModifier,
    "Dexterity Modifier"
  );
  const allSources = [dexBaseSource, ...resolvedInitiativeSources];

  const changesSourceValues = getCalculatedSourceValues(allSources);

  const finalSourceValues = applyEffectsToInitiative(
    changesSourceValues,
    valuesIndex,
    effects
  );

  return {
    totalValue: finalSourceValues.total,
    sources: allSources,
    sourceValues: finalSourceValues.sourceValues,
  };
}

function getBaseInitiativeSource(
  value: number,
  name: string
): Source<InitiativeChange> {
  return {
    name: name,
    type: 'INITIATIVE',
    totalValue: value,
    originId: "base",
    originType: "base",
    bonusTypeId: "BASE",
    formula: {
      expression: value.toString(),
    },
  };
}

/**
 * Applies effects targeting "initiative.total" to the calculated initiative.
 */
function applyEffectsToInitiative(
  changesSourceValues: SourceValueSum,
  valuesIndex: SubstitutionIndex,
  effects?: CompiledEffects
): SourceValueSum {
  if (!effects) {
    return changesSourceValues;
  }

  const initiativeEffects = getEffectsByTarget(effects, "initiative.total");

  if (initiativeEffects.length === 0) {
    return changesSourceValues;
  }

  const calculatedEffects = initiativeEffects.map((effect) =>
    calculateEffect(effect, valuesIndex)
  );

  const effectsSourceValues = effectsToSourceValues(calculatedEffects);

  return mergeEffectsWithSources(changesSourceValues, effectsSourceValues);
}
