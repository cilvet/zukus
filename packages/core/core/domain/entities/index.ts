// Base types
export type {
  Entity,
  EntityFieldType,
  // Enum types
  EnumOption,
  // Source types
  SourceData,
  // Addon field types
  SearchableFields,
  TaggableFields,
  ImageableFields,
  EffectfulFields,
  SuppressingFields,
  SourceableFields,
  // Suppression types
  SuppressionScope,
  SuppressionConfig,
  // Composed types
  StandardEntity,
} from './types/base';

// Backward compatibility alias
export type { Entity as SearchableEntity } from './types/base';

export type {
  EntityFieldDefinition,
  StringFieldWithValues,
  StringArrayFieldWithValues,
  IntegerFieldWithValues,
  IntegerArrayFieldWithValues
} from './types/fields';

export {
  hasAllowedValues,
  isStringFieldWithValues,
  isStringArrayFieldWithValues,
  isIntegerFieldWithValues,
  isIntegerArrayFieldWithValues,
  isEnumField,
  hasValidEnumConfig,
  isFormulaField
} from './types/fields';

export type {
  EntitySchemaDefinition
} from './types/schema';

// Schema functions
export {
  createEntitySchema,
  generateJsonSchema
} from './schema/creation';

export {
  validateEntity
} from './schema/validation';

// Filtering
export type {
  EntityFacet
} from './filtering/facets';

export {
  generateFacets
} from './filtering/facets';

export type {
  EntityFilterCriteria
} from './filtering/filters';

export {
  filterEntities
} from './filtering/filters';

// Filter Configuration
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
} from './filtering/filterConfig';

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
} from './filtering/filterConfig';

// Filter Configurations (pre-built)
export {
  spellFilterConfig,
  createSpellFilterConfig,
  classLevelFilter,
  SPELLCASTING_CLASS_OPTIONS,
  itemFilterConfig,
  createItemFilterConfig,
  ITEM_ENTITY_TYPES,
  ITEM_TYPE_LABELS,
} from './filtering/configs';
export type { ItemEntityType } from './filtering/configs';

// Filter Configuration Registry
export {
  registerFilterConfig,
  getFilterConfig,
  hasFilterConfig,
  getRegisteredEntityTypes,
  clearFilterConfigRegistry,
} from './filtering/filterConfigRegistry';

// Forms (new functionality)
export type {
  FormFieldType,
  FormFieldDefinition,
  FormSchema
} from './forms/generator';

export {
  generateFormSchema,
  getDefaultValueForField
} from './forms/generator';

// Instance creation
export {
  createEntityInstance
} from './instances/creation';

// Instance fields
export type {
  InstanceFieldDefinition,
  InstanceFieldType,
  InstanceFieldValue,
  InstanceValues,
} from './types/instanceFields';

export {
  isInstanceFieldValue,
  isValidValueForField,
  getInstanceFieldValue,
  setInstanceFieldValue,
  createDefaultInstanceValues,
  mergeInstanceFieldDefinitions,
} from './types/instanceFields';

export {
  getInstanceFieldsForEntityType,
  getInstanceFieldsFromCompendium,
  hasInstanceFields,
  hasInstanceFieldsFromCompendium,
  hasInstanceField,
  getInstanceField,
} from './instanceFields';