
export * from "./core/tests/character/buildCharacter";
export * from "./core/tests/character/defaultCharacter";
export { calculateCharacterSheet } from "./core/domain/character/calculation/calculateCharacterSheet";

// CharacterUpdater
export { CharacterUpdater } from "./core/domain/character/update/characterUpdater/characterUpdater";
export type { ICharacterUpdater, UpdateResult } from "./core/domain/character/interfaces/characterUpdater";

// Types - Character
export type { CharacterSheet } from "./core/domain/character/calculatedSheet/sheet";
export type { CharacterBaseData, SpecialFeature } from "./core/domain/character/baseData/character";

// Types - Abilities
export type { CalculatedAbility, CalculatedAbilities } from "./core/domain/character/calculatedSheet/calculatedAbilities";

// Types - Saving Throws
export type { CalculatedSavingThrow, CalculatedSavingThrows } from "./core/domain/character/calculatedSheet/calculatedSavingThrows";

// Types - Skills
export type { CalculatedSingleSkill, CalculatedParentSkill, CalculatedSkill, CalculatedSkills } from "./core/domain/character/calculatedSheet/calculatedSkills";

// Types - Sources
export type { SourceValue } from "./core/domain/character/calculatedSheet/sources";
export { BonusTypesValues } from "./core/domain/character/baseData/changes";
export type { BonusTypes } from "./core/domain/character/baseData/changes";

// Types - Buffs
export type { Buff } from "./core/domain/character/baseData/buffs";

// Types - Equipment
export type { Equipment, Item } from "./core/domain/character/baseData/equipment";

// Types - Attacks
export type {
  CalculatedAttack,
  CalculatedAttackData,
  CalculatedAttackBonus,
  BaseCalculatedAttack,
  CalculatedWeaponAttack,
  ResolvedAttackContext,
} from "./core/domain/character/calculatedSheet/attacks/calculatedAttack";
export type {
  AttackType,
  AttackChange,
  AttackRollChange,
  WieldTypes,
} from "./core/domain/character/baseData/attacks";
export type {
  AttackContextualChange,
  ResolvedAttackContextualChange,
} from "./core/domain/character/baseData/contextualChange";
export type { ContextualVariable, ResolvedContextualVariable } from "./core/domain/character/baseData/variable";

// Attack Calculation
export { calculateAttackBonus } from "./core/domain/character/calculation/attacks/attack/calculateAttackBonus/calculateAttackBonus";
export { getAttackDamageFormula } from "./core/domain/character/calculation/attacks/attack/getAttackDamageFormula";
export { getWeaponAttackContext } from "./core/domain/character/calculatedSheet/attacks/attackContext/availableAttackContext";
export type { SubstitutionIndex } from "./core/domain/character/calculation/sources/calculateSources";

// Weapons
export type { Weapon } from "./core/domain/weapons/weapon";

// Formula System
export { substituteExpression, fillFormulaWithValues } from "./core/domain/formulae/formula";
export type { Formula, NormalFormula, SwitchFormula } from "./core/domain/formulae/formula";
export { getRollExpression } from "./core/domain/rolls/expressionAnalysis/expressionAnalysis";
export { getResolvedRollExpression } from "./core/domain/rolls/DiceRoller/diceRoller";
