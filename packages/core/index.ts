
export * from "./core/tests/character/buildCharacter";
export * from "./core/tests/character/defaultCharacter";
export { calculateCharacterSheet } from "./core/domain/character/calculation/calculateCharacterSheet";

// CharacterUpdater
export { CharacterUpdater } from "./core/domain/character/update/characterUpdater/characterUpdater";
export type { ICharacterUpdater, UpdateResult } from "./core/domain/character/interfaces/characterUpdater";

// Types - Character
export type { CharacterSheet } from "./core/domain/character/calculatedSheet/sheet";
export type { CharacterBaseData, SpecialFeature, Alignment } from "./core/domain/character/baseData/character";

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

// Types - Equipment (legacy)
export type { Equipment, Item } from "./core/domain/character/baseData/equipment";

// Inventory System (new)
export type {
  InventoryState,
  InventoryItemInstance,
  CurrencyState,
  InventoryWarning,
  InventoryUpdateResult,
} from "./core/domain/inventory";
export type {
  CurrencyDefinition,
  CurrencyWarning,
} from "./core/domain/inventory/currencies/types";
export type {
  WeightBreakdown,
  ItemEntityInfo,
  ItemEntityResolver,
} from "./core/domain/inventory/weightCalculations";
export {
  createEmptyInventoryState,
  createItemInstance,
  inventorySuccess,
  inventoryWithWarning,
} from "./core/domain/inventory";
export * as inventoryOps from "./core/domain/inventory";

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
export { getDamageFormulaText } from "./core/domain/character/calculation/attacks/attack/utils/getDamageText";
export type { SubstitutionIndex } from "./core/domain/character/calculation/sources/calculateSources";
export type { DamageSectionValue } from "./core/domain/character/calculation/attacks/attack/utils/getDamageText";

// Weapons
export type { Weapon } from "./core/domain/weapons/weapon";

// Formula System
export { substituteExpression, fillFormulaWithValues } from "./core/domain/formulae/formula";
export type { Formula, NormalFormula, SwitchFormula } from "./core/domain/formulae/formula";
export { getRollExpression } from "./core/domain/rolls/expressionAnalysis/expressionAnalysis";
export { getResolvedRollExpression } from "./core/domain/rolls/DiceRoller/diceRoller";

// Operations (updater operations)
export * as ops from "./core/domain/character/updater/operations";

// Types - Levels
export type { LevelSlot, ClassEntity, SystemLevelsEntity, EntityInstance } from "./core/domain/levels/storage/types";
export type { EntityProvider, Selector } from "./core/domain/levels/providers/types";
export type { StandardEntity, ComputedEntity, ComputedEntityMeta } from "./core/domain/entities/types/base";
export type { EntitySchemaDefinition } from "./core/domain/entities/types/schema";

// Types - Filtering
export type { FilterResult, EntityFilter, SubstitutionIndex as FilterSubstitutionIndex } from "./core/domain/levels/filtering/types";

// Entity Filter Configuration
export type {
  FilterOption,
  FilterUIConfig,
  FacetFilterDef,
  RelationFilterDef,
  FilterGroupDef,
  FilterDef,
  EntityFilterConfig,
  FilterValue,
  FilterState,
} from "./core/domain/entities";

export {
  isFacetFilter,
  isRelationFilter,
  isFilterGroup,
  getNestedValue,
  getRelationSecondaryOptions,
  applyRelationFilter,
  getRelationFilterChipLabel,
  getAllFilterIds,
  createInitialFilterState,
  spellFilterConfig,
  createSpellFilterConfig,
  classLevelFilter,
  SPELLCASTING_CLASS_OPTIONS,
  registerFilterConfig,
  getFilterConfig,
  hasFilterConfig,
} from "./core/domain/entities";

// Types - Updater
export type { ProviderLocation } from "./core/domain/levels/updater/types";

// Provider Resolution
export { resolveProvider } from "./core/domain/levels/providers/resolveProvider";

// Entity Selection API
export {
  selectEntityInProvider,
  deselectEntityFromProvider,
  getSelectedEntityInstances,
} from "./core/domain/levels/updater/entitySelectionApi";
export { getProvider } from "./core/domain/levels/updater/selectionOperations";

// Compendiums
export { dnd35ExampleCompendium, dnd35ExampleCalculationContext } from "./core/domain/compendiums";
export type {
  Compendium,
  CompendiumReference,
  CompendiumRegistry,
  CalculationContext,
  CompendiumDataPort,
  EntityTypeInfo,
  EntityListResult,
  GetEntitiesOptions,
} from "./core/domain/compendiums";

// Spell and Maneuver utilities
export {
  allSpells,
  filterSpells,
  getSpellcastingClasses,
  getSpellLevelsForClass,
  allManeuvers,
  filterManeuvers,
  getManeuverClasses,
  getManeuverLevelsForClass,
} from "./core/domain/compendiums";
export type { EnrichedSpell, EnrichedManeuver } from "./core/domain/compendiums";

// CGE (Character Generation Engine)
export type {
  CGEConfig,
  CGEState,
  CalculatedCGE,
  CalculatedTrack,
  CalculatedSlot,
  CalculatedBoundSlot,
  CalculatedKnownLimit,
  CGEUpdateResult,
  CGEWarning,
  PreparationUpdateResult,
  PreparationWarning,
  SlotUpdateResult,
  SlotWarning,
  LevelTable,
} from "./core/domain/cge";

// CGE Definition Change (for specialFeatures)
export type { CGEDefinitionChange } from "./core/domain/character/baseData/specialChanges";

export {
  // Known entity operations
  addKnownEntity,
  removeKnownEntity,
  getKnownEntitiesByCGE,
  getKnownEntitiesByLevel,
  getKnownCountsByLevel,
  getTotalKnownCount,
  isEntityKnown,
  // Preparation operations (Vancian)
  prepareEntityInSlot,
  unprepareSlot,
  unprepareEntity,
  getBoundPreparations,
  getPreparedEntityInSlot,
  getPreparationsByLevel,
  isSlotPrepared,
  getPreparationCountByEntity,
  getUniquePreparedEntities,
  getTotalPreparedCount,
  // Slot operations (runtime usage)
  useSlot,
  refreshSlots,
  getSlotCurrentValue,
  getAllSlotCurrentValues,
  hasUsedSlots,
  useBoundSlot,
  setSlotValue,
  // Validation
  validateCGEConfig,
} from "./core/domain/cge";

// Test Classes (for CGE visual testing - NOT D&D 3.5 SRD)
export * from "./testClasses";
