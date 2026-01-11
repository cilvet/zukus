import { AbilityKey } from "../../../../baseData/abilities";
import {
  AttackRollChange,
  CriticalConfirmationChange,
} from "../../../../baseData/attacks";
import {
  ChangeTypes,
  ContextualizedChange,
} from "../../../../baseData/changes";
import {
  getSizeCategoryDifference,
  sizeCategories,
} from "../../../../baseData/sizes";
import {
  CalculatedAttackBonus,
  ResolvedAttackContext,
} from "../../../../calculatedSheet/attacks/calculatedAttack";
import { Source } from "../../../../calculatedSheet/sources";
import {
  SubstitutionIndex,
  calculateSource,
} from "../../../sources/calculateSources";
import { getCalculatedSourceValues } from "../../../sources/sumSources";

export const calculateAttackBonus = (
  context: ResolvedAttackContext,
  substitutionValues: SubstitutionIndex
): CalculatedAttackBonus => {
  const babSource = getBaseAttackBonusSource(context);
  const abilitySource = getAbilityAttackBonusSource(context);
  const sizeSource = getSizeAttackBonusSource(context);
  const weaponMagicEnhancementBonusSource =
    getWeaponEnhancementAttackBonusSource(context);
  const otherSources = getOtherAttackBonusSources(context, substitutionValues);
  const contextualSources = getContextualAttackBonusSources(
    context,
    substitutionValues
  );

  const attackSources = [
    babSource,
    abilitySource,
    sizeSource,
    weaponMagicEnhancementBonusSource,
    ...contextualSources,
    ...otherSources,
  ];

  if (context.weapon.isMasterwork && !context.weapon.enhancementBonus) {
    const weaponMasterworkSource =
      getWeaponMasterworkAttackBonusSource(context);
    attackSources.push(weaponMasterworkSource);
  }

  if (isInappropriateSizeWeapon(context)) {
    attackSources.push(getWeaponSizeDifferenceAttackBonusSource(context));
  }

  const { sourceValues, total } = getCalculatedSourceValues(attackSources);
  const criticalConfirmationSources = getCriticalConfirmationBonusSources(
    context,
    substitutionValues
  );
  const {
    sourceValues: criticalConfirmationSourceValues,
    total: criticalConfirmationTotal,
  } = getCalculatedSourceValues([
    ...attackSources,
    ...criticalConfirmationSources,
  ]);
  return {
    totalValue: total,
    criticalConfirmationTotalValue: criticalConfirmationTotal,
    sourceValues,
    sources: attackSources,
    criticalConfirmationSourceValues,
    criticalConfirmationSources,
  };
};

export const getContextualAttackBonusSources = (
  context: ResolvedAttackContext,
  substitutionValues: SubstitutionIndex
): Source<AttackRollChange>[] => {
  const contextualChangesSources = context.appliedContextualChanges.flatMap(
    (change) =>
      change.changes
        .filter(filterAttackChanges)
        .map((change) => calculateSource(change, substitutionValues))
  );

  return [...contextualChangesSources];
};

export const getCriticalConfirmationBonusSources = (
  context: ResolvedAttackContext,
  substitutionValues: SubstitutionIndex
): Source<CriticalConfirmationChange>[] => {
  const regularChangesSources = context.appliedChanges
    .filter(filterCriticalConfirmationChanges)
    .map((change) => calculateSource(change, substitutionValues));

  const contextualChangesSources = context.appliedContextualChanges.flatMap(
    (change) =>
      change.changes
        .filter(filterCriticalConfirmationChanges)
        .map((change) => calculateSource(change, substitutionValues))
  );

  return [...regularChangesSources, ...contextualChangesSources];
};

export const filterCriticalConfirmationChanges = (
  change: ContextualizedChange
): change is ContextualizedChange<CriticalConfirmationChange> => {
  return change.type === 'CRITICAL_CONFIRMATION';
};

export const filterAttackChanges = (
  change: ContextualizedChange
): change is ContextualizedChange<AttackRollChange> => {
  return change.type === 'ATTACK_ROLLS';
};

export const getOtherAttackBonusSources = (
  context: ResolvedAttackContext,
  substitutionValues: SubstitutionIndex
): Source<AttackRollChange>[] => {
  const regularChangesSources = context.appliedChanges
    .filter(filterAttackChanges)
    .map((change) => calculateSource(change, substitutionValues));
  return [...regularChangesSources];
};

export const getWeaponMasterworkAttackBonusSource = (
  context: ResolvedAttackContext
): Source<AttackRollChange> => {
  return {
    attackType: context.attackType,
    bonusTypeId: "ENHANCEMENT",
    formula: {
      expression: "1",
    },
    name: "Masterwork",
    originId: "MASTERWORK",
    originType: "base",
    totalValue: 1,
    type: 'ATTACK_ROLLS',
  };
};

export const getWeaponEnhancementAttackBonusSource = (
  context: ResolvedAttackContext
): Source<AttackRollChange> => {
  const enhancementBonus = context.weapon.enhancementBonus ?? 0;
  return {
    attackType: context.attackType,
    bonusTypeId: "ENHANCEMENT",
    formula: {
      expression: enhancementBonus.toString(),
    },
    name: `[${context.weapon.name}] Enhancement bonus`,
    originId: "ENHANCEMENT",
    originType: "base",
    totalValue: enhancementBonus,
    type: 'ATTACK_ROLLS',
  };
};

export const isInappropriateSizeWeapon = (
  context: ResolvedAttackContext
): boolean => {
  return context.weapon.size !== context.character.size.currentSize;
};

export const getWeaponSizeDifferenceAttackBonusSource = (
  context: ResolvedAttackContext
): Source<AttackRollChange> => {
  const weaponSize = context.weapon.size;
  const characterSize = context.character.size;
  const weaponSizeDifference = getSizeCategoryDifference(
    weaponSize,
    characterSize.currentSize
  );
  const attackPenalty = weaponSizeDifference * -2;
  return {
    attackType: context.attackType,
    bonusTypeId: "BASE",
    formula: {
      expression: attackPenalty.toString(),
    },
    name: "Weapon Size Difference",
    originId: "WEAPON_SIZE_DIFFERENCE",
    originType: "base",
    totalValue: attackPenalty,
    type: 'ATTACK_ROLLS',
  };
};

export const getSizeAttackBonusSource = (
  context: ResolvedAttackContext
): Source<AttackRollChange> => {
  const modifier = sizeCategories[context.character.size.currentSize].attackAndACModifier;
  return {
    attackType: context.attackType,
    bonusTypeId: "BASE",
    formula: {
      expression: modifier.toString(),
    },
    name: "Size modifier",
    originId: "SIZE",
    originType: "base",
    totalValue: modifier,
    type: 'ATTACK_ROLLS',
  };
};

export const getBaseAttackBonusSource = (
  context: ResolvedAttackContext
): Source<AttackRollChange> => {
  return {
    attackType: context.attackType,
    bonusTypeId: "BASE",
    formula: {
      expression: context.character.baseAttackBonus.totalValue.toString(),
    },
    name: "Base Attack Bonus",
    originId: "BASE",
    originType: "base",
    totalValue: context.character.baseAttackBonus.totalValue,
    type: 'ATTACK_ROLLS',
  };
};

export const getAbilityAttackBonusSource = (
  context: ResolvedAttackContext
): Source<AttackRollChange> => {
  let abilityToUse = getAbilityToUse(context);
  const totalModifier =
    context.character.abilityScores[abilityToUse].totalModifier;
  return {
    attackType: context.attackType,
    bonusTypeId: "BASE",
    formula: {
      expression: totalModifier.toString(),
    },
    name: `${abilityToUse} modifier`,
    originId: abilityToUse,
    originType: "base",
    totalValue: totalModifier,
    type: 'ATTACK_ROLLS',
  };
};

export const getAbilityToUse = (context: ResolvedAttackContext): AbilityKey => {
  if (context.weapon.weaponAttackType === "ranged") {
    return "dexterity";
  }
  if (context.weapon.finesse) {
    return "dexterity";
  }
  return "strength";
};