
export * from "./core/tests/character/buildCharacter";
export * from "./core/tests/character/defaultCharacter";
export { calculateCharacterSheet } from "./core/domain/character/calculation/calculateCharacterSheet";
export { getBuildString } from "./core/domain/character/calculation/classLevels/getBuildString";

// CharacterUpdater
export { CharacterUpdater } from "./core/domain/character/update/characterUpdater/characterUpdater";
export type { ICharacterUpdater, UpdateResult } from "./core/domain/character/interfaces/characterUpdater";

// Types - Character
export type { CharacterSheet } from "./core/domain/character/calculatedSheet/sheet";
export type { CharacterBaseData, SpecialFeature, Alignment } from "./core/domain/character/baseData/character";

// Types - Abilities
export type { CalculatedAbility, CalculatedAbilities } from "./core/domain/character/calculatedSheet/calculatedAbilities";
export type { BaseAbilitiesData, BaseAbilityData } from "./core/domain/character/baseData/abilities";

// Ability Score Generation
export {
  type AbilityScoreMethod,
  type Roll4d6Result,
  STANDARD_ARRAY,
  roll4d6DropLowest,
  generateAbilityScoreSet,
  POINT_BUY_PRESETS,
  DEFAULT_POINT_BUY_BUDGET,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
  getPointBuyIncrementCost,
  getPointBuyDecrementRefund,
  calculatePointBuyTotal,
  canIncrementPointBuy,
  canDecrementPointBuy,
} from "./core/domain/character/abilityScoreGeneration";

// Types - Saving Throws
export type { CalculatedSavingThrow, CalculatedSavingThrows } from "./core/domain/character/calculatedSheet/calculatedSavingThrows";

// Types - Skills
export type { CalculatedSingleSkill, CalculatedParentSkill, CalculatedSkill, CalculatedSkills } from "./core/domain/character/calculatedSheet/calculatedSkills";

// Types - Sources
export type { SourceValue } from "./core/domain/character/calculatedSheet/sources";
export { BonusTypesValues } from "./core/domain/character/baseData/changes";
export type { BonusTypes, Change } from "./core/domain/character/baseData/changes";

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
  // Instance field helpers (per-item operations)
  isItemEquipped,
  isItemWielded,
  isItemActive,
  // Note: setItem*/toggleItem* for state operations are available via inventoryOps namespace
  // The per-item helpers are: inventoryOps.setItemEquipped, inventoryOps.toggleItemEquipped (from instanceFields)
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
  EntityTypeFilterDef,
  FilterDef,
  EntityFilterConfig,
  FilterValue,
  FilterState,
  ItemEntityType,
} from "./core/domain/entities";

export {
  isFacetFilter,
  isRelationFilter,
  isFilterGroup,
  isEntityTypeFilter,
  getNestedValue,
  getRelationSecondaryOptions,
  applyRelationFilter,
  getRelationFilterChipLabel,
  getAllFilterIds,
  createInitialFilterState,
  applyFilterConfig,
  matchesFacetFilter,
  spellFilterConfig,
  createSpellFilterConfig,
  classLevelFilter,
  SPELLCASTING_CLASS_OPTIONS,
  itemFilterConfig,
  createItemFilterConfig,
  ITEM_ENTITY_TYPES,
  ITEM_TYPE_LABELS,
  registerFilterConfig,
  getFilterConfig,
  hasFilterConfig,
} from "./core/domain/entities";

// Instance Fields
export type {
  InstanceFieldDefinition,
  InstanceFieldType,
  InstanceFieldValue,
  InstanceValues,
} from "./core/domain/entities";

export {
  getInstanceFieldsForEntityType,
  getInstanceFieldsFromCompendium,
  hasInstanceFields,
  hasInstanceFieldsFromCompendium,
  hasInstanceField,
  getInstanceField,
  isInstanceFieldValue,
  getInstanceFieldValue,
  setInstanceFieldValue,
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

// System Levels
export { setSystemLevels } from "./core/domain/levels/updater/systemLevelOperations";

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

// Spell, Maneuver, and Power utilities
export {
  allSpells,
  filterSpells,
  getSpellcastingClasses,
  getSpellLevelsForClass,
  allManeuvers,
  filterManeuvers,
  getManeuverClasses,
  getManeuverLevelsForClass,
  allPowers,
  filterPowers,
  getPowerClasses,
  getPowerLevelsForClass,
} from "./core/domain/compendiums";
export type { EnrichedSpell, EnrichedManeuver, EnrichedPower } from "./core/domain/compendiums";

// CGE (Character Generation Engine)
export type {
  CGEConfig,
  CGEState,
  CalculatedCGE,
  CalculatedTrack,
  CalculatedSlot,
  CalculatedBoundSlot,
  CalculatedKnownLimit,
  CalculatedPool,
  ResourceConfigPool,
  CGEUpdateResult,
  CGEWarning,
  PreparationUpdateResult,
  PreparationWarning,
  SlotUpdateResult,
  SlotWarning,
  LevelTable,
} from "./core/domain/cge";

// Special Changes (for specialFeatures)
export type { CGEDefinitionChange, CustomVariableDefinitionChange } from "./core/domain/character/baseData/specialChanges";

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
  // Pool operations
  calculatePoolCost,
  // Validation
  validateCGEConfig,
} from "./core/domain/cge";

// Translations
export type {
  TranslatedFields,
  TranslationPack,
  TranslationPackReference,
  LocalizationContext,
  LocalizationResult,
  TranslationValidationResult,
} from "./core/domain/translations";

export {
  mergeTranslation,
  getLocalizedEntity,
  getLocalizedEntityWithResult,
  getLocalizedEntities,
  embedTranslations,
  embedTranslationsInEntities,
  isVersionCompatible,
  validateTranslationPack,
  dnd35FeatsSpanishPack,
} from "./core/domain/translations";

// Test Classes (for CGE visual testing - NOT D&D 3.5 SRD)
export * from "./testClasses";
