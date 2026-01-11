import { ArmorType } from "../../items/armor/armorTypes";
import { ShieldType } from "../../items/shields/shieldTypes";
import { LocatedString } from "../../language/locatedString";
import { WeaponProficiencyType } from "../../weapons/weaponTypes";
import { ChangeContext, ContextualizedChange, CustomVariableChange } from "./changes";
import { Formula } from "../../formulae/formula";
import { z } from "zod";
import { Source, SourceValue } from "../calculatedSheet/sources";
import { BaseSource } from "./customVariables";

export const SpecialChangeTypesSchema = z.enum([
  "EXTRA_FEAT_SELECTION",
  "WEAPON_PROFICIENCY",
  "ARMOR_PROFICIENCY",
  "SHIELD_PROFICIENCY",
  "FINESSE",
  "RESOURCE_DEFINITION",
  "CUSTOM_VARIABLE_DEFINITION"
]);

export type SpecialChangeTypes = z.infer<typeof SpecialChangeTypesSchema>;

export type StringWithAutoComplete<T> = keyof T | (string & {});

export type BaseSpecialChange = {
  type: SpecialChangeTypes;
};

export type ExtraFeatSelectionChange = BaseSpecialChange & {
  type: 'EXTRA_FEAT_SELECTION';
  amount: number;
  featPoolId: string;
  selectedFeatIds?: string[];
};

export type WeaponProficiencyChange = BaseSpecialChange & {
  type: 'WEAPON_PROFICIENCY';
  weaponTypes?: WeaponProficiencyType[];
  weaponIds?: string[];
  weaponNameContainsAny?: string[];
};

export type ArmorProficiencyChange = BaseSpecialChange & {
  type: 'ARMOR_PROFICIENCY';
  armorTypes: ArmorType[];
  armorNameContainsAny?: string[];
};

export type ShieldProficiencyChange = BaseSpecialChange & {
  type: 'SHIELD_PROFICIENCY';
  shieldTypes: ShieldType[];
  shieldIds?: string[];
  shieldNameContainsAny?: string[];
};

export type FinesseChange = BaseSpecialChange & {
  type: 'FINESSE';
};

export type ResourceDefinitionChange = BaseSpecialChange & {
  type: 'RESOURCE_DEFINITION';
  resourceId: string;                    // "psionic_power_points"
  name: string;                          // "Psionic Power Points"
  description?: string;
  image?: string;                        // URL or path to resource image
  maxValueFormula: Formula;              // "@classes.psion.level + @ability.intelligence.modifier"
  minValueFormula?: Formula;             // "0" (default)
  initialValueFormula?: Formula;         // Si no se especifica, usa maxValueFormula
  defaultChargesPerUseFormula?: Formula; // "1" (default)
  rechargeFormula: Formula;              // "@classes.psion.level + @ability.intelligence.modifier"
};

export type CustomVariableDefinitionChange = BaseSpecialChange & {
  type: 'CUSTOM_VARIABLE_DEFINITION';
  variableId: string;
  name: string;
  description?: string;
  baseSources: BaseSource[];
};

const a: CustomVariableDefinitionChange = {
  type: 'CUSTOM_VARIABLE_DEFINITION',
  variableId: 'custom_variable_id',
  name: 'Custom Variable',
  baseSources: [{
    bonusTypeId: 'ARMOR',
    type: 'CUSTOM_VARIABLE',
    uniqueId: 'custom_variable_id',
    formula: {
      expression: '0',
    },
    name: 'The name of the variable',
    createVariableForSource: true,
  }],
};

export type SpecialChange =
  | ExtraFeatSelectionChange
  | WeaponProficiencyChange
  | ArmorProficiencyChange
  | ShieldProficiencyChange
  | FinesseChange
  | ResourceDefinitionChange
  | CustomVariableDefinitionChange;

export type ContextualizedSpecialChange<
  T extends SpecialChange = SpecialChange
> = T & ChangeContext;

export type BonusType = {
  name: LocatedString;
  stacksWithSelf: boolean;
};
