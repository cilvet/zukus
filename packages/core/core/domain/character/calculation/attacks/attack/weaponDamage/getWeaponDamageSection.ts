import { DamageType } from "../../../../../damage/damageTypes";
import { Weapon } from "../../../../../weapons/weapon";
import { AttackChange } from "../../../../baseData/attacks";
import { ChangeTypes, ContextualizedChange } from "../../../../baseData/changes";
import { contextualizeAttackChangeWithWeapon } from "../../../../calculatedSheet/attacks/attackContext/availableAttackContext";
import { ResolvedAttackContext } from "../../../../calculatedSheet/attacks/calculatedAttack";
import {
  DamageFormula,
  DamageSection,
} from "../../../../calculatedSheet/attacks/damage/damageFormula";
import { filterDamageChanges } from "../utils/filterDamageChanges";
import { filterDamageTypeChanges } from "../utils/filterDamageTypeChanges";
import { getDamageSectionFromChange } from "../utils/getDamageSectionFromChange";

export const getWeaponDamageType = (
  context: ResolvedAttackContext
): DamageType => {
  const { weapon, appliedContextualChanges } = context;

  const allContextDamageTypeChanges = appliedContextualChanges
    .flatMap((change) => change.changes)
    .filter(filterDamageTypeChanges);

  let damageType = weapon.damageType;

  allContextDamageTypeChanges.forEach((change: AttackChange) => {
    if (change.type === 'DAMAGE_TYPE') {
      damageType = change.damageType;
    }
  });

  return damageType;
};

export const getWeaponDamageSection = (
  context: ResolvedAttackContext
): DamageFormula => {
  const { weapon } = context;
  const additionalDamageSections: DamageSection[] = [];

  if (weapon.enhancementBonus !== undefined) {
    const enhancementBonusDamageSection: DamageSection = {
      name: "Enhancement bonus",
      type: "simple",
      formula: {
        expression: `${weapon.enhancementBonus}`,
      },
    };
    additionalDamageSections.push(enhancementBonusDamageSection);
  }

  const wieldedWeaponChangesDamageSections =
    getAllWeaponWieldedDamageSections(weapon);

  additionalDamageSections.push(...wieldedWeaponChangesDamageSections);

  let damageType = getWeaponDamageType(context);

  const weaponDamageSection: DamageFormula = {
    name: "Weapon damage",
    type: "complex",
    baseDamage: {
      name: `${weapon.name} damage`,
      type: "simple",
      formula: {
        expression: weapon.damageDice,
      },
      damageType,
      damageModifications: [],
    },
    additionalDamageSections,
    damageModifications: [],
  };

  return weaponDamageSection;
};

export const getAllWeaponWieldedDamageSections = (
  weapon: Weapon
): DamageSection[] => {
  const wieldedWeaponChangesDamageSections =
    weapon.wieldedChanges
      ?.map((change) => contextualizeAttackChangeWithWeapon(weapon, change))
      .filter(filterDamageChanges)
      .map(getDamageSectionFromChange) ?? [];

  const enhancementWieldedWeaponChangesDamageSections =
    weapon.enhancements
      ?.flatMap((enhancement) => {
        return (
          enhancement.wieldedChanges
            ?.map((change): ContextualizedChange => ({
              ...change,
              originId: weapon.uniqueId,
              originType: "item",
              name: enhancement.name
            })
            )
            .filter(filterDamageChanges)
            .map(getDamageSectionFromChange) ?? []
        );
      })
      .filter((section): section is DamageSection => section !== undefined) ??
    [];

  return [
    ...wieldedWeaponChangesDamageSections,
    ...enhancementWieldedWeaponChangesDamageSections,
  ];
};
