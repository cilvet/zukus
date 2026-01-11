import { DamageType } from "../../../../damage/damageTypes";
import { Formula } from "../../../../formulae/formula";
import { SourceValue } from "../../sources";

export type DamageModificationType =
  | "replaceDice"
  | "replaceDamageType"
  | "halfReplaceDamageType"
  | "sumToEveryDice"
  | "maxDice"
  | "rollDiceTwiceAndTakeBest"
  | "multiplyAllDamage"
  | "multiplyNonDiceDamage";

export type BaseDamageModification = {
  name?: string;
};

export type MultiplyAllDamageModification = BaseDamageModification & {
  type: "multiplyAllDamage";
  multiplier: number;
};

export type MultiplyNonDiceDamageModification = BaseDamageModification & {
  type: "multiplyNonDiceDamage";
  multiplier: number;
};

export type ReplaceDamageTypeModification = BaseDamageModification & {
  type: "replaceDamageType";
  newDamageType: DamageType;
};

export type ReplaceDiceDamageModification = BaseDamageModification & {
  type: "replaceDice";
  originalDiceSides: number;
  newDiceSides: number;
};

export type DamageModification =
  | MultiplyAllDamageModification
  | ReplaceDamageTypeModification
  | ReplaceDiceDamageModification
  | MultiplyNonDiceDamageModification;

export type ComplexDamageModification = DamageModification & {
  applyTo: "allSections" | "baseSection" | "additionalSections";
};

export type BaseDamageSection = {
  type: "simple" | "complex";
  name: string;
};

export type SimpleDamageSection = BaseDamageSection & {
  type: "simple";
  formula: Formula;
  sources?: SourceValue[];
  damageType?: DamageType;
  damageModifications?: DamageModification[];
};

export type SimpleDamageSectionWithType = SimpleDamageSection & {
  damageType: DamageType;
};

export type ComplexDamageSection = BaseDamageSection & {
  type: "complex";
  baseDamage: DamageFormula;
  additionalDamageSections: DamageSection[];
  damageModifications?: ComplexDamageModification[];
};

export type DamageSection = SimpleDamageSection | ComplexDamageSection;

export type DamageFormula = ComplexDamageSection | SimpleDamageSectionWithType;
