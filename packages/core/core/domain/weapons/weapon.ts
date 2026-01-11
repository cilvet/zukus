import { WeaponAttackType, WieldTypes } from "../character/baseData/attacks";
import { Change, ContextualizedChange } from "../character/baseData/changes";
import { AttackContextualChange } from "../character/baseData/contextualChange";
import { BaseItem, EquipableItem } from "../character/baseData/equipment";
import { Size } from "../character/baseData/sizes";
import { DamageType } from "../damage/damageTypes";
import { SimpleDiceExpression } from "../rolls/dice";
import { WeaponEnhancement } from "./weaponEnhancements";
import { WeaponProficiencyType } from "./weaponTypes";

const AMMUNITION_TYPES = [
  "ARROW",
  "BOLT",
  "BULLET",
  "DART",
  "SHURIKEN",
  "SLING_BULLET",
] as const;
export type AmmunitionType = (typeof AMMUNITION_TYPES)[number];

const WEIGHT_TYPES = ["LIGHT", "MEDIUM", "HEAVY"] as const;
export type WeightType = (typeof WEIGHT_TYPES)[number];

export type BaseWeapon = BaseItem & EquipableItem & {
  itemType: "WEAPON";
  wielded: boolean;
  damageDice: SimpleDiceExpression;
  size: Size;
  isMasterwork: boolean;
  weaponAttackType: WeaponAttackType;
  enhancementBonus?: 1 | 2 | 3 | 4 | 5;
  enhancements?: WeaponEnhancement[];
  proficiencyType: WeaponProficiencyType;
  defaultWieldType: WieldTypes;
  damageType: DamageType;
  baseCritMultiplier: number;
  baseCritRange: number;
  twoHanded: boolean;
  wieldedChanges?: Change[];
  wieldedContextChanges?: AttackContextualChange[];
  weaponOnlyChanges?: Change[];
  weaponOnlyContextualChanges?: AttackContextualChange[];
};

export type MeleeWeapon = BaseWeapon & {
  weaponAttackType: "melee";
  finesse: boolean;
  reachRange?: number;
  weightType: WeightType;
  thrown: boolean;
  thrownRange?: number;
};

export type RangedWeapon = BaseWeapon & {
  weaponAttackType: "ranged";
  rangeIncrement: number;
  ammunitionType: AmmunitionType;
  requiresLoading: boolean;
};

export type Weapon = MeleeWeapon | RangedWeapon;