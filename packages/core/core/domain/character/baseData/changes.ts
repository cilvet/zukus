import { SavingThrowId } from "../../class/saves";
import { FormulaSchema } from "../../formulae/formula";
import { AbilityKey, defaultAbilityKeys } from "./abilities";
import { ACBonusTypesSchema, ACBonusTypesValues } from "./armorClass";
import { AttackChange } from "./attacks";
import { ConditionSchema } from "./conditions";
import { DefaultBaseSpeeds } from "./speed";
import { toJSONSchema, z } from "zod";


export enum ChangeTypes {
  ABILITY_SCORE = "ABILITY_SCORE",
  ABILITY_CHECKS = "ABILITY_CHECKS",
  AC = "AC",
  NATURAL_AC = "NATURAL_AC",
  SAVING_THROW = "SAVING_THROW",
  SKILL = "SKILL",
  ABILITY_SKILLS = "ABILITY_SKILLS",
  BAB = "BAB",
  INITIATIVE = "INITIATIVE",
  SPEED = "SPEED",
  ATTACK_ROLLS = "ATTACK_ROLLS",
  DAMAGE = "DAMAGE",
  SKILL_POINTS_PER_LEVEL = "SKILL_POINTS_PER_LEVEL",
  TEMPORARY_HP = "TEMPORARY_HP",
  CRITICAL_RANGE = "CRITICAL_RANGE",
  DAMAGE_TYPE = "DAMAGE_TYPE",
  CRITICAL_MULTIPLIER = "CRITICAL_MULTIPLIER",
  CRITICAL_CONFIRMATION = "CRITICAL_CONFIRMATION",
  WEAPON_SIZE = "WEAPON_SIZE",
  SIZE = "SIZE",
  CUSTOM_VARIABLE = "CUSTOM_VARIABLE",
}

export const ChangeTypesSchema = z.enum([
  "ABILITY_SCORE",
  "ABILITY_CHECKS",
  "AC",
  "NATURAL_AC",
  "SAVING_THROW",
  "SKILL",
  "ABILITY_SKILLS",
  "BAB",
  "INITIATIVE",
  "SPEED",
  "ATTACK_ROLLS",
  "DAMAGE",
  "SKILL_POINTS_PER_LEVEL",
  "TEMPORARY_HP",
  "CRITICAL_RANGE",
  "DAMAGE_TYPE",
  "CRITICAL_MULTIPLIER",
  "CRITICAL_CONFIRMATION",
  "WEAPON_SIZE",
  "SIZE",
  "CUSTOM_VARIABLE",
  "GENERAL"
]);

export type StringWithAutoComplete<T> = keyof T | (string & {});

export const BaseBonusTypesSchema = z.enum([
  "BASE",
  "REPLACEMENT",
  "UNTYPED",
  "ENHANCEMENT",
  "MORALE",
  "LUCK",
  "INSIGHT",
  "COMPETENCE",
  "PROFANE",
  "DIVINE",
  "SACRED",
  "RESISTANCE",
  "CIRCUMNSTANCE",
  "STATUS",
  "DODGE",
  "DEFLECTION",
  "MISC",
  "SIZE",
  "RACIAL"
]);

export const BonusTypesSchema = z.union([BaseBonusTypesSchema, ACBonusTypesSchema]);

export const BaseChangeSchema = z.object({
  formula: FormulaSchema,
  bonusTypeId: BonusTypesSchema.describe("The type of bonus: 'UNTYPED' by default"),
  type: ChangeTypesSchema.describe("The type of change: 'ABILITY_SCORE', 'ABILITY_CHECKS', 'AC', 'NATURAL_AC', 'SAVING_THROW', 'SKILL', 'ABILITY_SKILLS', 'SKILL_POINTS_PER_LEVEL', 'SPEED', 'INITIATIVE', 'TEMPORARY_HP', 'SIZE', 'WEAPON_SIZE'"),
  conditions: z.array(ConditionSchema).optional(),
});

export type BaseChange = z.infer<typeof BaseChangeSchema>;

export type AbilityScoreChange = BaseChange & {
  type: 'ABILITY_SCORE';
  abilityUniqueId: AbilityKey;
};

const abilityScoresEnum = z.enum(defaultAbilityKeys as [string, ...string[]]);

export const AbilityScoreChangeSchema = BaseChangeSchema.extend({
  type: z.literal('ABILITY_SCORE'),
  abilityUniqueId: abilityScoresEnum,
});

export type AbilityCheckChange = BaseChange & {
  type: 'ABILITY_CHECKS';
  abilityUniqueId: string;
};

export const AbilityCheckChangeSchema = BaseChangeSchema.extend({
  type: z.literal('ABILITY_CHECKS'),
  abilityUniqueId: abilityScoresEnum,
});

export const GeneralChangeSchema = BaseChangeSchema.extend({
  type: z.literal('GENERAL'),
  path: z.string(),
});

export type GeneralChange = BaseChange & {
  type: 'GENERAL';
};

export type ArmorClassChange = BaseChange & {
  type: 'AC';
};

export const ArmorClassChangeSchema = BaseChangeSchema.extend({
  type: z.literal('AC'),
});

export type NaturalArmorClassChange = BaseChange & {
  type: 'NATURAL_AC';
};

export const NaturalArmorClassChangeSchema = BaseChangeSchema.extend({
  type: z.literal('NATURAL_AC'),
});

export type SavingThrowChange = BaseChange & {
  type: 'SAVING_THROW';
  savingThrowUniqueId: SavingThrowId;
};

const savingThrowsEnum = z.enum(Object.keys(SavingThrowId) as [string, ...string[]]);

export const SavingThrowChangeSchema = BaseChangeSchema.extend({
  type: z.literal('SAVING_THROW'),
  savingThrowUniqueId: savingThrowsEnum.describe("The type of saving throw: 'FORTITUDE', 'REFLEX', 'WILL', 'ALL'"),
});

export type SingleSkillChange = BaseChange & {
  type: 'SKILL';
  skillUniqueId: string;
};

export const SingleSkillChangeSchema = BaseChangeSchema.extend({
  type: z.literal('SKILL'),
  skillUniqueId: z.string().describe("The type of skill: 'ACROBATICS', 'ANIMAL_HANDLING', 'ARCANA', 'ATHLETICS', 'BLUFF'..."),
});

export type AbilitySkillsChange = BaseChange & {
  type: 'ABILITY_SKILLS';
  abilityUniqueId: string;
};

export const AbilitySkillsChangeSchema = BaseChangeSchema.extend({
  type: z.literal('ABILITY_SKILLS'),
  abilityUniqueId: abilityScoresEnum.describe("The type of ability: 'STRENGTH', 'DEXTERITY', 'CONSTITUTION', 'INTELLIGENCE', 'WISDOM', 'CHARISMA'"),
});

export type SkillChange = AbilitySkillsChange | SingleSkillChange;

export const SkillChangeSchema = z.union([AbilitySkillsChangeSchema, SingleSkillChangeSchema]);

export type SkillPointsPerLevelChange = BaseChange & {
  type: 'SKILL_POINTS_PER_LEVEL';
  multiplesOnFirstLevel?: boolean;
};

export const SkillPointsPerLevelChangeSchema = BaseChangeSchema.extend({
  type: z.literal('SKILL_POINTS_PER_LEVEL'),
  multiplesOnFirstLevel: z.boolean().optional(),
});

export type SpeedChange = BaseChange & {
  type: 'SPEED';
  speedUniqueId: StringWithAutoComplete<DefaultBaseSpeeds>;
};

export const SpeedChangeSchema = BaseChangeSchema.extend({
  type: z.literal('SPEED'),
  speedUniqueId: z.string(),
});

export type InitiativeChange = BaseChange & {
  type: 'INITIATIVE';
};

export const InitiativeChangeSchema = BaseChangeSchema.extend({
  type: z.literal('INITIATIVE'),
});

export type TemporaryHitPointsChange = BaseChange & {
  type: 'TEMPORARY_HP';
};

export type TemporaryHpChange = BaseChange & {
  type: 'TEMPORARY_HP';
};

export const TemporaryHitPointsChangeSchema = BaseChangeSchema.extend({
  type: z.literal('TEMPORARY_HP'),
});

export type SizeChange = BaseChange & {
  type: 'SIZE';
};

export const SizeChangeSchema = BaseChangeSchema.extend({
  type: z.literal('SIZE'),
});

export type WeaponSizeChange = BaseChange & {
  type: 'WEAPON_SIZE';
};

export const WeaponSizeChangeSchema = BaseChangeSchema.extend({
  type: z.literal('WEAPON_SIZE'),
});

export const FormulaReplacementChangeSchema = BaseChangeSchema.extend({
  type: z.literal('FORMULA_REPLACEMENT'),
  formulaToReplace: FormulaSchema,
});

// la idea es que no haga falta "definir" las variables. al igual que en lenguajes como python, al asignarle un valor la variable se define.
// por ejemplo, si quiero la variable sneakAttackDiceAmount, no necesito definirla, solo asignarle un valor, como: ceil(1/2 * @classes.rogue.level)
// subsecuentes cambios a la variable se _sumarán_ al valor de la variable.
// por ejemplo, si una clase de prestigio también avanza dicha variable (como asesino), añadirá un valor: ceil(1/2 * @classes.assassin.level)

export const CustomVariableChangeSchema = BaseChangeSchema.extend({
  type: z.literal('CUSTOM_VARIABLE'),
  uniqueId: z.string().describe("The name of the variable to replace, preferably in camelCase, example: sneakAttackDiceAmount"),
});

// Inferred TypeScript types
export type CustomVariableChange = z.infer<typeof CustomVariableChangeSchema>;

export const ChangeSchema = z.discriminatedUnion('type', [
  AbilityScoreChangeSchema,
  AbilityCheckChangeSchema,
  ArmorClassChangeSchema,
  NaturalArmorClassChangeSchema,
  SavingThrowChangeSchema,
  SingleSkillChangeSchema,
  AbilitySkillsChangeSchema,
  SkillPointsPerLevelChangeSchema,
  SpeedChangeSchema,
  InitiativeChangeSchema,
  TemporaryHitPointsChangeSchema,
  SizeChangeSchema,
  WeaponSizeChangeSchema,
  CustomVariableChangeSchema,
]);


export const ChangeOriginTypeSchema = z.enum([
  'item',
  'feat',
  'classFeature',
  'raceFeature',
  'spell',
  'potion',
  'environment',
  'other',
  'base',
  'specialFeature',
  'entity',
  'buff',
  'race',
]);

export const ChangeContextSchema = z.object({
  name: z.string(),
  originType: ChangeOriginTypeSchema,
  originId: z.string(),
});


export type Change =
  | AttackChange
  | ArmorClassChange
  | AbilityScoreChange
  | AbilityCheckChange
  | ArmorClassChange
  | SavingThrowChange
  | SkillPointsPerLevelChange
  | SpeedChange
  | InitiativeChange
  | TemporaryHpChange
  | NaturalArmorClassChange
  | SizeChange
  | WeaponSizeChange
  | SkillChange
  | CustomVariableChange

export type ChangeOriginType =
  | "item"
  | "feat"
  | "classFeature"
  | "raceFeature"
  | "spell"
  | "potion"
  | "environment"
  | "other"
  | "base"
  | "specialFeature"
  | "entity"
  | "buff"
  | "race"

export type ChangeContext = {
  name: string;
  originType: ChangeOriginType;
  originId: string;
};

export type ContextualizedChange<T extends BaseChange = Change> = T & ChangeContext;

export type BonusType = {
  name: string;
  uniqueId: string;
  stacksWithSelf: boolean;
};

export type BaseBonusTypes = z.infer<typeof BaseBonusTypesSchema>;

export type BonusTypes = z.infer<typeof BonusTypesSchema>;

export const BaseBonusTypeValues: { [key in BaseBonusTypes]: BonusType } = {
  BASE: {
    name: "Base",
    uniqueId: "base",
    stacksWithSelf: true,
  },
  REPLACEMENT: {
    name: "Replacement",
    uniqueId: "replacement",
    stacksWithSelf: true,
  },
  UNTYPED: {
    name: "Untyped",
    uniqueId: "untyped",
    stacksWithSelf: true,
  },
  ENHANCEMENT: {
    name: "Enhancement",
    uniqueId: "enhancement",
    stacksWithSelf: false,
  },
  MORALE: {
    name: "Morale",
    uniqueId: "morale",
    stacksWithSelf: false,
  },
  LUCK: {
    name: "Luck",
    uniqueId: "luck",
    stacksWithSelf: false,
  },
  INSIGHT: {
    name: "Insight",
    uniqueId: "insight",
    stacksWithSelf: false,
  },
  COMPETENCE: {
    name: "Competence",
    uniqueId: "competence",
    stacksWithSelf: false,
  },
  PROFANE: {
    name: "Profane",
    uniqueId: "profane",
    stacksWithSelf: false,
  },
  DIVINE: {
    name: "Divine",
    uniqueId: "divine",
    stacksWithSelf: false,
  },
  SACRED: {
    name: "Sacred",
    uniqueId: "sacred",
    stacksWithSelf: false,
  },
  RESISTANCE: {
    name: "Resistance",
    uniqueId: "resistance",
    stacksWithSelf: false,
  },
  CIRCUMNSTANCE: {
    name: "Circumstance",
    uniqueId: "circumstance",
    stacksWithSelf: true,
  },
  STATUS: {
    name: "Status",
    uniqueId: "status",
    stacksWithSelf: false,
  },
  DODGE: {
    name: "Dodge",
    uniqueId: "dodge",
    stacksWithSelf: true,
  },
  DEFLECTION: {
    name: "Deflection",
    uniqueId: "deflection",
    stacksWithSelf: false,
  },
  MISC: {
    name: "Misc",
    uniqueId: "misc",
    stacksWithSelf: false,
  },
  SIZE: {
    name: "Size",
    uniqueId: "size",
    stacksWithSelf: false,
  },
  RACIAL: {
    name: "Racial",
    uniqueId: "racial",
    stacksWithSelf: false,
  },
};

export const BonusTypesValues: { [key in BonusTypes]: BonusType } = {
  ...BaseBonusTypeValues,
  ...ACBonusTypesValues,
};


