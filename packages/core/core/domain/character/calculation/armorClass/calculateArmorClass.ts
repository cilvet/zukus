import {
  ACBonusTypes,
  ACBonusTypesValues,
} from "../../baseData/armorClass";
import {
  ContextualizedChange,
  ArmorClassChange,
  ChangeTypes,
  NaturalArmorClassChange,
} from "../../baseData/changes";
import { CharacterBaseData } from "../../baseData/character";
import { Armor, Shield } from "../../baseData/equipment";
import { sizeCategories } from "../../baseData/sizes";
import {
  CalculatedACType,
  CalculatedArmorClass,
} from "../../calculatedSheet/calculatedArmorClass";
import { Source } from "../../calculatedSheet/sources";
import { getSheetWithUpdatedField } from "../calculateCharacterSheet";
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

export const getCalculatedArmorClass: getSheetWithUpdatedField = function (
  baseData: CharacterBaseData,
  index: SubstitutionIndex,
  changes: CharacterChanges,
  contextualChanges?: ContextualChange[],
  specialChanges?: SpecialChange[],
  effects?: CompiledEffects
) {
  const armorClass = calculateArmorClass(baseData, changes.acChanges, index, effects);

  const indexValuesToUpdate: SubstitutionIndex = {
    [valueIndexKeys.AC_TOTAL]: armorClass.totalAc.totalValue,
    [valueIndexKeys.AC_TOUCH]: armorClass.touchAc.totalValue,
    [valueIndexKeys.AC_FLAT_FOOTED]: armorClass.flatFootedAc.totalValue,
    [valueIndexKeys.AC_NATURAL_TOTAL]: armorClass.naturalAc.totalValue,
  };

  return {
    characterSheetFields: {
      armorClass,
    },
    indexValues: indexValuesToUpdate,
  };
};

export function calculateArmorClass(
  baseData: CharacterBaseData,
  armorClassChanges: ContextualizedChange<
    ArmorClassChange | NaturalArmorClassChange
  >[],
  valuesIndex: SubstitutionIndex,
  effects?: CompiledEffects
): CalculatedArmorClass {
  const genericAcChanges = armorClassChanges.filter(
    (change) => change.type === 'AC'
  ) as ContextualizedChange<ArmorClassChange>[];

  const naturalAcChanges = armorClassChanges.filter(
    (change) => change.type === 'NATURAL_AC'
  ) as ContextualizedChange<NaturalArmorClassChange>[];


  const baseAcSource = getBaseArmorClassSource(10, "Base", "BASE");

  const sizeAcSource = getBaseArmorClassSource(
    valuesIndex[valueIndexKeys.SIZE_BASE],
    "Size Modifier",
    "SIZE"
  );

  const equippedArmor: Armor = baseData.equipment.items.find(
    (item) => item.itemType === "ARMOR" && item.equipped
  ) as Armor;

  const equippedArmorBonus = equippedArmor
    ? equippedArmor.baseArmorBonus + equippedArmor.enhancementBonus
    : 0;

  const equippedArmorSource = getBaseArmorClassSource(
    equippedArmorBonus,
    equippedArmor?.name || "No Armor",
    "ARMOR"
  );

  const equippedShield: Shield = baseData.equipment.items.find(
    (item) => item.itemType === "SHIELD" && item.equipped
  ) as Shield;

  const equippedShieldBonus = equippedShield
    ? equippedShield.baseShieldBonus + equippedShield.enhancementBonus
    : 0;

  const equippedShieldSource = getBaseArmorClassSource(
    equippedShieldBonus,
    equippedShield?.name || "No Shield",
    "SHIELD"
  );

  const naturalAc = getNaturalArmorCalculated(naturalAcChanges, valuesIndex);
  const naturalAcSource = getBaseArmorClassSource(
    naturalAc.totalValue,
    "Natural Armor",
    "NATURAL_ARMOR"
  );

  const characterDexModifier = valuesIndex[valueIndexKeys.DEX_MODIFIER];
  const appliedDexModifier = Math.min(
    characterDexModifier,
    equippedArmor?.maxDexBonus?? 1000
  );

  const dexBaseSource = getBaseArmorClassSource(
    appliedDexModifier,
    "Dexterity Modifier",
    "DEXTERITY"
  );

  const sizeModifier = valuesIndex[valueIndexKeys.SIZE_BASE];
  const sizeBaseSource = getBaseArmorClassSource(
    sizeModifier,
    "Size Modifier",
    "SIZE"
  );

  const acSources = genericAcChanges.map((change) =>
    calculateSource(change, valuesIndex)
  );

  const allSources = [
    baseAcSource,
    dexBaseSource,
    sizeBaseSource,
    naturalAcSource,
    equippedArmorSource,
    equippedShieldSource,
    sizeAcSource,
    ...acSources,
  ];

  const flatFootedAcSources = allSources.filter(
    (source) =>
      !(source.bonusTypeId in ACBonusTypesValues) ||
      ACBonusTypesValues[source.bonusTypeId as ACBonusTypes]
        .countsForFlatFootedAC
  );

  const touchAcSources = allSources.filter(
    (source) =>
      !(source.bonusTypeId in ACBonusTypesValues) ||
      ACBonusTypesValues[source.bonusTypeId as ACBonusTypes].countsForTouchAC
  );

  const { total: changesTotal, sourceValues: changesSourceValues } = getCalculatedSourceValues(allSources);
  const { total: touchAcChangesTotal, sourceValues: touchAcChangesSourceValues } =
    getCalculatedSourceValues(touchAcSources);
  const { total: flatFootedAcChangesTotal, sourceValues: flatFootedAcChangesSourceValues } =
    getCalculatedSourceValues(flatFootedAcSources);

  // Apply effects to total AC
  let totalAcFinal = changesTotal;
  let totalAcSourceValues = changesSourceValues;
  if (effects) {
    const totalAcEffects = getEffectsByTarget(effects, "ac.total");
    if (totalAcEffects.length > 0) {
      const calculatedEffects = totalAcEffects.map((effect) =>
        calculateEffect(effect, valuesIndex)
      );
      const effectsSourceValues = effectsToSourceValues(calculatedEffects);
      const merged = mergeEffectsWithSources(
        { total: changesTotal, sourceValues: changesSourceValues },
        effectsSourceValues
      );
      totalAcFinal = merged.total;
      totalAcSourceValues = merged.sourceValues;
    }
  }

  // Apply effects to touch AC
  let touchAcFinal = touchAcChangesTotal;
  let touchAcSourceValues = touchAcChangesSourceValues;
  if (effects) {
    const touchAcEffects = getEffectsByTarget(effects, "ac.touch.total");
    if (touchAcEffects.length > 0) {
      const calculatedEffects = touchAcEffects.map((effect) =>
        calculateEffect(effect, valuesIndex)
      );
      const effectsSourceValues = effectsToSourceValues(calculatedEffects);
      const merged = mergeEffectsWithSources(
        { total: touchAcChangesTotal, sourceValues: touchAcChangesSourceValues },
        effectsSourceValues
      );
      touchAcFinal = merged.total;
      touchAcSourceValues = merged.sourceValues;
    }
  }

  // Apply effects to flat-footed AC
  let flatFootedAcFinal = flatFootedAcChangesTotal;
  let flatFootedAcSourceValues = flatFootedAcChangesSourceValues;
  if (effects) {
    const flatFootedAcEffects = getEffectsByTarget(effects, "ac.flatFooted.total");
    if (flatFootedAcEffects.length > 0) {
      const calculatedEffects = flatFootedAcEffects.map((effect) =>
        calculateEffect(effect, valuesIndex)
      );
      const effectsSourceValues = effectsToSourceValues(calculatedEffects);
      const merged = mergeEffectsWithSources(
        { total: flatFootedAcChangesTotal, sourceValues: flatFootedAcChangesSourceValues },
        effectsSourceValues
      );
      flatFootedAcFinal = merged.total;
      flatFootedAcSourceValues = merged.sourceValues;
    }
  }

  return {
    totalAc: {
      totalValue: totalAcFinal,
      sources: allSources,
      sourceValues: totalAcSourceValues,
    },
    touchAc: {
      totalValue: touchAcFinal,
      sources: touchAcSources,
      sourceValues: touchAcSourceValues,
    },
    flatFootedAc: {
      totalValue: flatFootedAcFinal,
      sources: flatFootedAcSources,
      sourceValues: flatFootedAcSourceValues,
    },
    naturalAc,
  };
}

function getBaseArmorClassSource(
  value: number,
  name: string,
  acBonusType: ACBonusTypes
): Source<ArmorClassChange> {
  return {
    type: 'AC',
    totalValue: value,
    name,
    originType: "base",
    originId: "base",
    bonusTypeId: acBonusType,
    formula: {
      expression: value.toString(),
    },
  };
}

function getNaturalArmorCalculated(
  naturalAcChanges: ContextualizedChange<NaturalArmorClassChange>[],
  valuesIndex: SubstitutionIndex
): CalculatedACType {
  const baseNaturalArmor = valuesIndex[valueIndexKeys.AC_NATURAL_BASE] ?? 0;

  const baseSource: Source<NaturalArmorClassChange> = {
    type: 'NATURAL_AC',
    totalValue: baseNaturalArmor,
    name: "Natural Armor",
    originType: "base",
    originId: "base",
    bonusTypeId: "BASE",
    formula: {
      expression: baseNaturalArmor.toString(),
    },
  };

  const calculatedNaturalAcSources = naturalAcChanges.map((change) =>
    calculateSource(change, valuesIndex)
  );

  const allSources = [
    ...(baseNaturalArmor !== 0 ? [baseSource] : []),
    ...calculatedNaturalAcSources,
  ];

  const { total: naturalAcTotal, sourceValues: naturalAcSourceValues } =
    getCalculatedSourceValues(allSources);

  return {
    totalValue: naturalAcTotal,
    sources: allSources,
    sourceValues: naturalAcSourceValues,
  };
}
