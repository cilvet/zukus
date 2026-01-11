import { TemporaryHpChange } from "../../baseData/changes";
import { CharacterBaseData } from "../../baseData/character";
import { CalculatedHitPoints } from "../../calculatedSheet/calculatedHitPoints";
import { Source } from "../../calculatedSheet/sources";
import { getSheetWithUpdatedField } from "../calculateCharacterSheet";
import { getTotalRolledHp } from "../classLevels/getCurrentLevelsData";
import {
  calculateSource,
  SubstitutionIndex,
} from "../sources/calculateSources";
import { CharacterChanges } from "../sources/compileCharacterChanges";
import { getCalculatedSourceValues } from "../sources/sumSources";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";
import { CompiledEffects, getEffectsByTarget } from "../effects/compileEffects";
import { calculateEffect, effectsToSourceValues, mergeEffectsWithSources } from "../effects/applyEffects";
import { ContextualChange } from "../../baseData/contextualChange";
import { SpecialChange } from "../../baseData/specialChanges";

export const getCalculatedHitPoints: getSheetWithUpdatedField = function (
  baseData: CharacterBaseData,
  substitutionIndex: SubstitutionIndex,
  changes: CharacterChanges,
  contextualChanges?: ContextualChange[],
  specialChanges?: SpecialChange[],
  effects?: CompiledEffects
) {
  const sources = changes.temporaryHitPointsChanges.map((change) => {
    return calculateSource(change, substitutionIndex);
  });

  const hitPoints: CalculatedHitPoints = calculateHitPoints(
    baseData,
    substitutionIndex,
    sources,
    effects
  );
  const indexValuesToUpdate: SubstitutionIndex = {
    [valueIndexKeys.MAX_HP]: hitPoints.maxHp,
    [valueIndexKeys.CURRENT_HP]: hitPoints.currentHp,
    [valueIndexKeys.CURRENT_DAMAGE]: hitPoints.currentDamage,
    [valueIndexKeys.TEMPORARY_HP]: hitPoints.temporaryHp,
  };

  return {
    characterSheetFields: {
      hitPoints: hitPoints,
    },
    indexValues: indexValuesToUpdate,
  };
};

export function calculateHitPoints(
  characterBaseData: CharacterBaseData,
  indexValues: SubstitutionIndex,
  temporaryHpSources: Source<TemporaryHpChange>[],
  effects?: CompiledEffects
): CalculatedHitPoints {
  const hitDice = indexValues[valueIndexKeys.HIT_DICE_BASE];
  const constitutionModifier = indexValues[valueIndexKeys.CON_MODIFIER];
  
  // Get total rolled HP (supports both legacy and new level systems)
  const rolledHitDice = getTotalRolledHp(characterBaseData);
  
  let maxHp = rolledHitDice + hitDice * constitutionModifier;

  // Apply effects to max HP
  if (effects) {
    const maxHpEffects = getEffectsByTarget(effects, "hp.max");
    if (maxHpEffects.length > 0) {
      const calculatedEffects = maxHpEffects.map((effect) =>
        calculateEffect(effect, indexValues)
      );
      const effectsSourceValues = effectsToSourceValues(calculatedEffects);
      maxHp += effectsSourceValues.total;
    }
  }

  // Calculate temporary HP from changes
  const { sourceValues: tempHpChangeSourceValues, total: temporaryHpFromChanges } =
    getCalculatedSourceValues(temporaryHpSources);

  // Apply effects to temporary HP
  let temporaryHp = temporaryHpFromChanges;
  let temporaryHpSourceValues = tempHpChangeSourceValues;

  if (effects) {
    const tempHpEffects = getEffectsByTarget(effects, "hp.temporary");
    if (tempHpEffects.length > 0) {
      const calculatedEffects = tempHpEffects.map((effect) =>
        calculateEffect(effect, indexValues)
      );
      const effectsSourceValues = effectsToSourceValues(calculatedEffects);
      const finalSourceValues = mergeEffectsWithSources(
        { total: temporaryHpFromChanges, sourceValues: tempHpChangeSourceValues },
        effectsSourceValues
      );
      temporaryHp = finalSourceValues.total;
      temporaryHpSourceValues = finalSourceValues.sourceValues;
    }
  }

  const customCurrentHp =
    characterBaseData.customCurrentHp &&
    characterBaseData.customCurrentHp > maxHp
      ? maxHp
      : characterBaseData.customCurrentHp;

  return {
    currentHp: customCurrentHp ?? maxHp - characterBaseData.currentDamage,
    maxHp: maxHp,
    currentDamage: characterBaseData.currentDamage,
    temporaryHp: temporaryHp,
    temporaryHpSourceValues: temporaryHpSourceValues,
    temporaryHpSources: temporaryHpSources,
  };
}
