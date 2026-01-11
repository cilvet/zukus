import { BabType } from "../../../class/baseAttackBonus";
import { CharacterClass } from "../../../class/class";
import { BaseAttackBonusChange } from "../../baseData/attacks";
import {
  ChangeTypes
} from "../../baseData/changes";
import { CharacterBaseData } from "../../baseData/character";
import { CalculatedBaseAttackBonus } from "../../calculatedSheet/calculatedBaseAttackBonus";
import { Source } from "../../calculatedSheet/sources";
import { getSheetWithUpdatedField } from "../calculateCharacterSheet";
import { getClassLevels } from "../classLevels/calculateCharacterClassLevels";
import {
  usesLegacyLevelSystem,
  getClassBabInfoFromNewSystem,
  getCurrentLevel,
} from "../classLevels/levelSystemDetection";
import {
  SubstitutionIndex,
  calculateSource,
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

export const getCalculatedBaseAttackBonus: getSheetWithUpdatedField = function (
  baseData: CharacterBaseData,
  substitutionIndex: SubstitutionIndex,
  changes: CharacterChanges,
  contextualChanges?: ContextualChange[],
  specialChanges?: SpecialChange[],
  effects?: CompiledEffects
) {
  const sources = changes.babChanges.map((change) => {
    return calculateSource(change, substitutionIndex);
  });

  const baseAttackBonus = calculateBabForCharacter(
    baseData,
    sources,
    substitutionIndex,
    effects
  );

  const indexValuesToUpdate: SubstitutionIndex = {
    [valueIndexKeys.BAB_BASE]: baseAttackBonus.baseValue,
    [valueIndexKeys.BAB_TOTAL]: baseAttackBonus.totalValue,
  };

  return {
    characterSheetFields: {
      baseAttackBonus,
    },
    indexValues: indexValuesToUpdate,
  };
};

/**
 * Calculates BAB supporting both legacy and new level systems.
 */
function calculateBabForCharacter(
  baseData: CharacterBaseData,
  sources: Source<BaseAttackBonusChange>[],
  substitutionIndex: SubstitutionIndex,
  effects?: CompiledEffects
): CalculatedBaseAttackBonus {
  if (usesLegacyLevelSystem(baseData)) {
    const classLevels = getClassLevels(baseData);
    return getTotalBaseAttackBonus(
      classLevels,
      baseData.classes,
      sources,
      substitutionIndex,
      effects
    );
  }
  
  // New system: get BAB info from classEntities (respecting currentLevel)
  const currentLevel = getCurrentLevel(baseData);
  const babInfo = getClassBabInfoFromNewSystem(
    baseData.levelSlots || [],
    baseData.classEntities || {},
    currentLevel
  );
  
  return getTotalBaseAttackBonusFromNewSystem(
    babInfo,
    sources,
    substitutionIndex,
    effects
  );
}

export function getClassLevelBaseAttackBonus(
  classLevel: number,
  babType: BabType
) {
  switch (babType) {
    case BabType.GOOD:
      return classLevel;
    case BabType.AVERAGE:
      return Math.floor((classLevel * 3) / 4);
    case BabType.POOR:
      return Math.floor(classLevel / 2);
  }
}

export function getTotalBaseAttackBonus(
  classLevels: { [classId: string]: number },
  classes: CharacterClass[],
  sources: Source<BaseAttackBonusChange>[],
  substitutionIndex: SubstitutionIndex,
  effects?: CompiledEffects
): CalculatedBaseAttackBonus {
  const classesBonus = classes.reduce((acc, characterClass) => {
    const classLevel = classLevels[characterClass.uniqueId] || 0;
    return (
      acc +
      getClassLevelBaseAttackBonus(
        classLevel,
        characterClass.baseAttackBonusProgression
      )
    );
  }, 0);

  const baseSource: Source<BaseAttackBonusChange> = {
    name: "Base",
    bonusTypeId: "BASE",
    formula: {
      expression: classesBonus.toString(),
    },
    originId: "base",
    originType: "base",
    totalValue: classesBonus,
    type: 'BAB',
  };

  const allSources = [baseSource, ...sources];
  const changesSourceValues = getCalculatedSourceValues(allSources);

  const finalSourceValues = applyEffectsToBAB(
    changesSourceValues,
    substitutionIndex,
    effects
  );

  const multipleBaseAttackBonuses =
    calculateMultipleBaseAttackBonuses(finalSourceValues.total);

  return {
    baseValue: classesBonus,
    sources,
    totalValue: finalSourceValues.total,
    sourceValues: finalSourceValues.sourceValues,
    multipleBaseAttackBonuses,
  };
}

export function calculateMultipleBaseAttackBonuses(bab: number): number[] {
  const babs = [bab];

  if (bab >= 6) {
    babs.push(bab - 5);
  }

  if (bab >= 11) {
    babs.push(bab - 10);
  }

  if (bab >= 16) {
    babs.push(bab - 15);
  }

  return babs;
}

/**
 * Applies effects targeting "bab.total" to the calculated base attack bonus.
 */
function applyEffectsToBAB(
  changesSourceValues: SourceValueSum,
  substitutionIndex: SubstitutionIndex,
  effects?: CompiledEffects
): SourceValueSum {
  if (!effects) {
    return changesSourceValues;
  }

  const babEffects = getEffectsByTarget(effects, "bab.total");

  if (babEffects.length === 0) {
    return changesSourceValues;
  }

  const calculatedEffects = babEffects.map((effect) =>
    calculateEffect(effect, substitutionIndex)
  );

  const effectsSourceValues = effectsToSourceValues(calculatedEffects);

  return mergeEffectsWithSources(changesSourceValues, effectsSourceValues);
}

/**
 * Calculates BAB from new level system (classEntities).
 */
function getTotalBaseAttackBonusFromNewSystem(
  babInfo: { classId: string; level: number; babProgression: 'GOOD' | 'AVERAGE' | 'POOR' }[],
  sources: Source<BaseAttackBonusChange>[],
  substitutionIndex: SubstitutionIndex,
  effects?: CompiledEffects
): CalculatedBaseAttackBonus {
  const classesBonus = babInfo.reduce((acc, info) => {
    const babType = info.babProgression as BabType;
    return acc + getClassLevelBaseAttackBonus(info.level, babType);
  }, 0);

  const baseSource: Source<BaseAttackBonusChange> = {
    name: "Base",
    bonusTypeId: "BASE",
    formula: {
      expression: classesBonus.toString(),
    },
    originId: "base",
    originType: "base",
    totalValue: classesBonus,
    type: 'BAB',
  };

  const allSources = [baseSource, ...sources];
  const changesSourceValues = getCalculatedSourceValues(allSources);

  const finalSourceValues = applyEffectsToBAB(
    changesSourceValues,
    substitutionIndex,
    effects
  );

  const multipleBaseAttackBonuses =
    calculateMultipleBaseAttackBonuses(finalSourceValues.total);

  return {
    baseValue: classesBonus,
    sources,
    totalValue: finalSourceValues.total,
    sourceValues: finalSourceValues.sourceValues,
    multipleBaseAttackBonuses,
  };
}
