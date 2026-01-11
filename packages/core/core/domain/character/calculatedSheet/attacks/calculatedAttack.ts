import { MeleeWeapon, RangedWeapon, Weapon } from "../../../weapons/weapon";
import { AbilityKey } from "../../baseData/abilities";
import {
  AttackChange,
  AttackRollChange,
  AttackType,
  BaseAttackBonusChange,
  CriticalConfirmationChange,
  WieldTypes,
} from "../../baseData/attacks";
import { ContextualizedChange } from "../../baseData/changes";
import {
  AttackContextualChange,
  ResolvedAttackContextualChange,
} from "../../baseData/contextualChange";
import { Size } from "../../baseData/sizes";
import { CalculatedBaseAttackBonus } from "../calculatedBaseAttackBonus";
import { CharacterSheet } from "../sheet";
import { Source, SourceValue } from "../sources";
import { DamageFormula } from "./damage/damageFormula";

export type CalculatedAttackData = {
  attacks: CalculatedAttack[];
  attackContextChanges: AttackContextualChange[];
  attackChanges: ContextualizedChange<AttackChange>[];
};

export type CalculatedAttackBonus = {
  totalValue: number;
  criticalConfirmationTotalValue: number;
  sources: Source<AttackRollChange>[];
  sourceValues: SourceValue[];
  criticalConfirmationSources: Source<
    AttackRollChange | CriticalConfirmationChange
  >[];
  criticalConfirmationSourceValues: SourceValue[];
};

export type BaseCalculatedAttack = {
  name: string;
  type: AttackType;
  attackBonus: CalculatedAttackBonus;
  damage: DamageFormula;
  criticalDamage: DamageFormula;
  attackOriginType: "weapon" | "spell" | "spellLike" | "other";
  weaponUniqueId?: string;
};

export type CalculatedWeaponAttack = BaseCalculatedAttack & {
  attackOriginType: "weapon";
  weaponUniqueId: string;
};

export type CalculatedSpellAttack = BaseCalculatedAttack & {
  attackOriginType: "spell";
  spellUniqueId: string;
};

export type CalculatedSpellLikeAttack = BaseCalculatedAttack & {
  attackOriginType: "spellLike";
  spellLikeUniqueId: string;
};

export type CalculatedOtherAttack = BaseCalculatedAttack & {
  attackOriginType: "other";
};

export type CalculatedAttack =
  | CalculatedWeaponAttack
  | CalculatedSpellAttack
  | CalculatedSpellLikeAttack
  | CalculatedOtherAttack;

export type BaseCalculatedAttackContext = {
  type: AttackType;
  contextualChanges: AttackContextualChange[];
  changes: ContextualizedChange<AttackChange>[];
  character: CharacterSheet;
};

export type MeleeWeaponCalculatedAttackContext =
BaseCalculatedAttackContext & {
    type: "melee";
    weapon: MeleeWeapon;
  };

export type RangedWeaponCalculatedAttackContext =
BaseCalculatedAttackContext & {
    type: "ranged";
    weapon: RangedWeapon;
  };

export type WeaponCalculatedAttackContext =
  | MeleeWeaponCalculatedAttackContext
  | RangedWeaponCalculatedAttackContext;

export type CalculatedAttackContext =
  | MeleeWeaponCalculatedAttackContext
  | RangedWeaponCalculatedAttackContext;

export type ResolvedAttackContext = {
  attackType: AttackType;
  weapon: Weapon;
  wieldType: WieldTypes;
  appliedContextualChanges: ResolvedAttackContextualChange[];
  appliedChanges: ContextualizedChange<AttackChange>[];
  character: CharacterSheet;
};
