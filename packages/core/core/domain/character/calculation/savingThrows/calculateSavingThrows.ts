import { SavingThrowId, SaveType } from "../../../class/saves";
import { ChangeTypes, SavingThrowChange } from "../../baseData/changes";
import { CharacterBaseData } from "../../baseData/character";
import {
  CalculatedSavingThrow,
  CalculatedSavingThrows,
} from "../../calculatedSheet/calculatedSavingThrows";
import { Source } from "../../calculatedSheet/sources";
import { getSheetWithUpdatedField } from "../calculateCharacterSheet";
import { getClassLevels } from "../classLevels/calculateCharacterClassLevels";
import {
  usesLegacyLevelSystem,
  getClassSaveInfoFromNewSystem,
  getCurrentLevel,
} from "../classLevels/levelSystemDetection";
import {
  SubstitutionIndex,
  calculateSource,
} from "../sources/calculateSources";
import { CharacterChanges } from "../sources/compileCharacterChanges";
import { getCalculatedSourceValues } from "../sources/sumSources";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";
import { CompiledEffects, getEffectsByTarget } from "../effects/compileEffects";
import { calculateEffect, effectsToSourceValues, mergeEffectsWithSources } from "../effects/applyEffects";
import { ContextualChange } from "../../baseData/contextualChange";
import { SpecialChange } from "../../baseData/specialChanges";

export const getCalculatedSavingThrows: getSheetWithUpdatedField = function (
  baseData: CharacterBaseData,
  index: SubstitutionIndex,
  changes: CharacterChanges,
  contextualChanges?: ContextualChange[],
  specialChanges?: SpecialChange[],
  effects?: CompiledEffects
) {
  const savingThrowSources = changes.savingThrowChanges.map((change) =>
    calculateSource(change, index)
  );

  const savingThrows = mapSavingThrows(baseData, savingThrowSources, index, effects);

  const indexValuesToUpdate: SubstitutionIndex = {};

  indexValuesToUpdate[valueIndexKeys.FORT_SAVING_THROW_TOTAL] =
    savingThrows.fortitude.totalValue;
  indexValuesToUpdate[valueIndexKeys.FORT_SAVING_THROW_BASE] =
    savingThrows.fortitude.baseValue;
  indexValuesToUpdate[valueIndexKeys.REF_SAVING_THROW_TOTAL] =
    savingThrows.reflex.totalValue;
  indexValuesToUpdate[valueIndexKeys.REF_SAVING_THROW_BASE] =
    savingThrows.reflex.baseValue;
  indexValuesToUpdate[valueIndexKeys.WILL_SAVING_THROW_TOTAL] =
    savingThrows.will.totalValue;
  indexValuesToUpdate[valueIndexKeys.WILL_SAVING_THROW_BASE] =
    savingThrows.will.baseValue;

  return {
    characterSheetFields: {
      savingThrows,
    },
    indexValues: indexValuesToUpdate,
  };
};

const getAbilityScoreModifier = (
  abilityUniqueId: SavingThrowId,
  index: SubstitutionIndex
) => {
  
  const abilityScoreModifierSource: Record<
    SavingThrowId,
    Source<SavingThrowChange> | undefined
  > = {
    [SavingThrowId.FORTITUDE]: {
      type: 'SAVING_THROW',
      savingThrowUniqueId: SavingThrowId.FORTITUDE,
      bonusTypeId: "BASE",
      formula: {
        expression: `@${valueIndexKeys.CON_MODIFIER}`,
      },
      name: "Constitution modifier",
      originId: "CON",
      originType: "base",
      totalValue: index[valueIndexKeys.CON_MODIFIER],
    },
    [SavingThrowId.REFLEX]: {
      type: 'SAVING_THROW',
      savingThrowUniqueId: SavingThrowId.REFLEX,
      bonusTypeId: "BASE",
      formula: {
        expression: `@${valueIndexKeys.DEX_MODIFIER}`,
      },
      name: "Dexterity modifier",
      originId: "DEX",
      originType: "base",
      totalValue: index[valueIndexKeys.DEX_MODIFIER],
    },
    [SavingThrowId.WILL]: {
      type: 'SAVING_THROW',
      savingThrowUniqueId: SavingThrowId.WILL,
      bonusTypeId: "BASE",
      formula: {
        expression: `@${valueIndexKeys.WIS_MODIFIER}`,
      },
      name: "Wisdom modifier",
      originId: "WIS",
      originType: "base",
      totalValue: index[valueIndexKeys.WIS_MODIFIER],
    },
    [SavingThrowId.ALL]: undefined,
  };

  return abilityScoreModifierSource[abilityUniqueId];
}

export function mapSavingThrows(
  baseData: CharacterBaseData,
  savingThrowSources: Source<SavingThrowChange>[],
  index: SubstitutionIndex,
  effects?: CompiledEffects
): CalculatedSavingThrows {
  const fortitude = calculateSavingThrow(
    baseData,
    savingThrowSources.filter(
      (source) =>
        source.savingThrowUniqueId === SavingThrowId.FORTITUDE ||
        source.savingThrowUniqueId === SavingThrowId.ALL
    ),
    SavingThrowId.FORTITUDE,
    index,
    effects
  );

  const reflex = calculateSavingThrow(
    baseData,
    savingThrowSources.filter(
      (source) =>
        source.savingThrowUniqueId === SavingThrowId.REFLEX ||
        source.savingThrowUniqueId === SavingThrowId.ALL
    ),
    SavingThrowId.REFLEX,
    index,
    effects
  );

  const will = calculateSavingThrow(
    baseData,
    savingThrowSources.filter(
      (source) =>
        source.savingThrowUniqueId === SavingThrowId.WILL ||
        source.savingThrowUniqueId === SavingThrowId.ALL
    ),
    SavingThrowId.WILL,
    index,
    effects
  );

  return {
    fortitude,
    reflex,
    will,
  };
}

const goodSaveProgression = [
  2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12,
];
const badSaveProgression = [
  0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6,
];

const variantGoodSaveProgression = [
  1, 1, 2, 2, 3, 3, 4, 4, 5, 5,
];

const variantBadSaveProgression = [
  0, 1, 1, 1, 2, 2, 2, 3, 3, 3,
];

const saveProgressions = {
  [SaveType.GOOD]: goodSaveProgression,
  [SaveType.POOR]: badSaveProgression,
  [SaveType.VARIANT_GOOD]: variantGoodSaveProgression,
  [SaveType.VARIANT_POOR]: variantBadSaveProgression,
};

export function calculateSavingThrow(
  baseData: CharacterBaseData,
  savingThrowSources: Source<SavingThrowChange>[],
  savingThrowId: SavingThrowId,
  index: SubstitutionIndex,
  effects?: CompiledEffects
): CalculatedSavingThrow {
  const classesWithLevelsAndProgressions = getClassSaveProgressions(baseData, savingThrowId);

  const classSources: Source<SavingThrowChange>[] =
    classesWithLevelsAndProgressions.map(({ classId, level, progression }) => {
      const saveProgression = saveProgressions[progression];
      const classSource: Source<SavingThrowChange> = {
        type: 'SAVING_THROW',
        savingThrowUniqueId: savingThrowId,
        bonusTypeId: "BASE",
        formula: {
          expression: saveProgression[level - 1].toString(),
        },
        name: `${classId} ${level}`,
        originId: classId,
        originType: "base",
        totalValue: saveProgression[level - 1],
      };
      return classSource;
    });

  const abilityScoreModifierSource = getAbilityScoreModifier(savingThrowId, index);

  const allSources = [...savingThrowSources, ...classSources, ...abilityScoreModifierSource ? [abilityScoreModifierSource] : []];

  const { total: changesTotal, sourceValues: changesSourceValues } = getCalculatedSourceValues(allSources);

  // Apply effects to saving throw
  let finalTotal = changesTotal;
  let finalSourceValues = changesSourceValues;

  const saveTypeMap: Record<SavingThrowId, string> = {
    [SavingThrowId.FORTITUDE]: "fortitude",
    [SavingThrowId.REFLEX]: "reflex",
    [SavingThrowId.WILL]: "will",
    [SavingThrowId.ALL]: "",
  };

  const saveTypeName = saveTypeMap[savingThrowId];
  if (saveTypeName && effects) {
    const targetEffects = getEffectsByTarget(effects, `savingThrow.${saveTypeName}.total`);
    if (targetEffects.length > 0) {
      const calculatedEffects = targetEffects.map((effect) =>
        calculateEffect(effect, index)
      );
      const effectsSourceValues = effectsToSourceValues(calculatedEffects);
      const changesSum = { total: changesTotal, sourceValues: changesSourceValues };
      const merged = mergeEffectsWithSources(changesSum, effectsSourceValues);
      finalTotal = merged.total;
      finalSourceValues = merged.sourceValues;
    }
  }

  return {
    baseValue: finalTotal,
    sources: savingThrowSources,
    sourceValues: finalSourceValues,
    totalValue: finalTotal,
  };
}

/**
 * Gets class save progressions from either the legacy or new level system.
 */
function getClassSaveProgressions(
  baseData: CharacterBaseData,
  savingThrowId: SavingThrowId
): { classId: string; level: number; progression: SaveType }[] {
  const result: { classId: string; level: number; progression: SaveType }[] = [];
  
  if (usesLegacyLevelSystem(baseData)) {
    // Legacy system: get from baseData.classes
    const classLevels = getClassLevels(baseData);
    
    Object.keys(classLevels).forEach((classId) => {
      const classLevel = classLevels[classId];
      const classData = baseData.classes.find(
        (classData) => classData.uniqueId === classId
      );
      if (!classData) {
        throw new Error(`Class with id ${classId} not found in base data`);
      }
      
      let progression: SaveType;
      switch (savingThrowId) {
        case SavingThrowId.FORTITUDE:
          progression = classData.baseSavesProgression.fortitude;
          break;
        case SavingThrowId.REFLEX:
          progression = classData.baseSavesProgression.reflex;
          break;
        case SavingThrowId.WILL:
          progression = classData.baseSavesProgression.will;
          break;
        default:
          return;
      }
      
      result.push({
        classId,
        level: classLevel,
        progression,
      });
    });
  } else {
    // New system: get from classEntities (respecting currentLevel)
    const currentLevel = getCurrentLevel(baseData);
    const classSaveInfo = getClassSaveInfoFromNewSystem(
      baseData.levelSlots || [],
      baseData.classEntities || {},
      currentLevel
    );
    
    for (const info of classSaveInfo) {
      let progression: SaveType;
      switch (savingThrowId) {
        case SavingThrowId.FORTITUDE:
          progression = info.fortitude as SaveType;
          break;
        case SavingThrowId.REFLEX:
          progression = info.reflex as SaveType;
          break;
        case SavingThrowId.WILL:
          progression = info.will as SaveType;
          break;
        default:
          continue;
      }
      
      result.push({
        classId: info.classId,
        level: info.level,
        progression,
      });
    }
  }
  
  return result;
}
