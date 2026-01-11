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