import type { Change, ChangeOriginType } from '../../character/baseData/changes';
import type { SpecialChange } from '../../character/baseData/specialChanges';
import type { ContextualChange } from '../../character/baseData/contextualChange';
import type { Effect } from '../../character/baseData/effects';
import type { EntityFilter } from '../../levels/filtering/types';

// =============================================================================
// Enum Types
// =============================================================================

/**
 * Option for enum fields with metadata.
 * Provides human-readable names and descriptions for enum values.
 */
export type EnumOption = {
  /** The actual value stored in the entity (string or number) */
  value: string | number;
  /** Human-readable name for display in UI */
  name: string;
  /** Optional description explaining the option */
  description?: string;
};

// =============================================================================
// Base Entity (minimum required fields)
// =============================================================================

/**
 * Base entity type with only the essential fields.
 * All entities must have at least these fields.
 */
export type Entity = {
  id: string;
  entityType: string;
};

// =============================================================================
// Field Type Addons
// =============================================================================

/**
 * Fields for entities that can be searched/displayed.
 */
export type SearchableFields = {
  name: string;
  description?: string;
};

/**
 * Fields for entities that can have tags.
 */
export type TaggableFields = {
  tags?: string[];
};

/**
 * Fields for entities that can have an image.
 */
export type ImageableFields = {
  image?: string;
};

/**
 * Source information for an entity.
 * Indicates where the entity comes from (compendium, book, page).
 */
export type SourceData = {
  /** ID of the compendium or source book */
  compendiumId: string;
  /** Page number in the source (optional) */
  page?: number;
  /** Edition or version of the source (optional) */
  edition?: string;
};

/**
 * Fields for entities that have source information.
 */
export type SourceableFields = {
  source?: SourceData;
};

/**
 * Fields for entities that can apply effects to characters.
 * 
 * The `legacy_*` prefixed fields are for the current Change-based system.
 * The `effects` field is for the new Effect-based system.
 * 
 * Note: `changes` and `specialChanges` are kept for backwards compatibility
 * with existing entities. New entities should use the `legacy_*` fields.
 */
export type EffectfulFields = {
  // Legacy system - currently used
  changes?: Change[];
  specialChanges?: SpecialChange[];
  
  // New legacy-prefixed fields for clarity
  legacy_changes?: Change[];
  legacy_contextualChanges?: ContextualChange[];
  legacy_specialChanges?: SpecialChange[];
  
  // Effect-based system (new, coexists with legacy)
  effects?: Effect[];
};

// =============================================================================
// Suppression Configuration
// =============================================================================

/**
 * Scope of suppression - which entities are affected.
 * - 'applied': Only entities the character already has
 * - 'selectable': Only entities available for selection
 * - 'all': Both applied and selectable entities
 */
export type SuppressionScope = 'applied' | 'selectable' | 'all';

/**
 * Configuration for how an entity suppresses other entities.
 */
export type SuppressionConfig = {
  /** Which entities are affected by this suppression */
  scope: SuppressionScope;
  
  /** Human-readable reason for the suppression (for UI display) */
  reason?: string;
  
  /** Explicit list of entity IDs to suppress */
  ids?: string[];
  
  /** Dynamic filter to determine which entities to suppress */
  filter?: EntityFilter;
};

/**
 * Fields for entities that can suppress other entities.
 */
export type SuppressingFields = {
  suppression?: SuppressionConfig[];
};

// =============================================================================
// Composed Entity Types
// =============================================================================

/**
 * Standard entity with all common addons.
 * This is the expected entity type for most systems (levels, CGE, etc.)
 */
export type StandardEntity = Entity 
  & SearchableFields 
  & TaggableFields 
  & ImageableFields 
  & EffectfulFields 
  & SuppressingFields;

// =============================================================================
// Computed Entity (processed during character calculation)
// =============================================================================

/**
 * Metadata for a computed entity during character calculation.
 */
export type ComputedEntityMeta = {
  /** Source information for traceability */
  source: {
    /** Origin type derived from entityType */
    originType: ChangeOriginType;
    /** The entity's ID */
    originId: string;
    /** The entity's name for display */
    name: string;
  };
  /** Whether this entity is suppressed by another entity */
  suppressed?: boolean;
  /** If suppressed, the reason why */
  suppressedReason?: string;
  /** ID of the entity that suppressed this one */
  suppressedBy?: string;
};

/**
 * Entity with computation metadata.
 * This is the entity as it appears in the calculated CharacterSheet.
 * 
 * Contains all original entity data plus `_meta` with:
 * - Source information for traceability
 * - Suppression status
 */
export type ComputedEntity = StandardEntity & {
  _meta: ComputedEntityMeta;
};

// =============================================================================
// Field Types (for schema system)
// =============================================================================

/**
 * Field types supported in the entity composition system.
 */
export type EntityFieldType =
  | 'string'
  | 'integer'
  | 'number'  // Decimal numbers (e.g., weight: 2.5)
  | 'boolean'
  | 'string_array'
  | 'integer_array'
  | 'reference'
  | 'reference_array'  // Array of references to other entities
  | 'object'
  | 'object_array'
  | 'image'  // URL or library asset ID (e.g., "icons/SkillsIcons/Skillicons/fire.png")
  | 'dataTable'  // Tabular data with numeric row keys and typed columns
  | 'enum'  // Predefined options with metadata (name, description)
  | 'relation';  // Populated from relation entities with metadata

// =============================================================================
// DataTable Types
// =============================================================================

/**
 * Column type for dataTable fields.
 * Supports basic types, references, and entity providers.
 */
export type DataTableColumnType = 'reference' | 'entityProvider' | 'integer' | 'string' | 'boolean';

/**
 * Configuration for a single column in a dataTable.
 */
export type DataTableColumn = {
  /**
   * Unique identifier for the column.
   * Used as key in the row data object.
   */
  id: string;
  
  /**
   * Display name for the column header.
   */
  name: string;
  
  /**
   * Type of value stored in this column.
   */
  type: DataTableColumnType;
  
  /**
   * Only for type='reference'.
   * Specifies which entity type can be referenced.
   */
  referenceType?: string;
  
  /**
   * For type='reference' or type='entityProvider'.
   * If true, the value is an array.
   * If false (default), it's a single value.
   */
  allowMultiple?: boolean;
  
  /**
   * If true, this column can have empty/null values.
   * Default: false
   */
  optional?: boolean;
};

/**
 * Configuration for the row key (first column) of a dataTable.
 */
export type DataTableRowKeyConfig = {
  /**
   * Display name for the row key column header.
   * Examples: "Level", "Caster Level", "Tier"
   */
  name: string;
  
  /**
   * Starting number for row keys.
   * Default: 1
   */
  startingNumber?: number;
  
  /**
   * If true, row keys must be consecutive without gaps.
   * Example with startingNumber=1: 1, 2, 3, 4... (valid)
   * Example with startingNumber=1: 1, 3, 5... (invalid if incremental=true)
   * Default: false
   */
  incremental?: boolean;
};

/**
 * Full configuration for a dataTable field.
 * This is included in EntityFieldDefinition when type='dataTable'.
 */
export type DataTableFieldConfig = {
  /**
   * Configuration for the first column (always numeric).
   * Defines the "row key" of each row.
   */
  rowKey: DataTableRowKeyConfig;
  
  /**
   * Column definitions for the table.
   * Each column defines what type of value it contains.
   */
  columns: DataTableColumn[];
};

/**
 * The value type for a dataTable field.
 * Keys are row numbers (as strings in JSON), values are objects with column data.
 */
export type DataTableValue = Record<string, Record<string, unknown>>;

// =============================================================================
// Relation Field Types
// =============================================================================

/**
 * A metadata field in a relation.
 * Defines what data the relation carries between two entities.
 */
export type RelationMetadataField = {
  /** Name of the metadata field */
  name: string;

  /** Type of the metadata value */
  type: 'string' | 'integer' | 'boolean';

  /** Human-readable description */
  description?: string;

  /** Whether this field is required */
  required?: boolean;

  /** Allowed values (for validation) */
  allowedValues?: (string | number)[];
};

/**
 * Configuration for how to compile a relation field into a filterable structure.
 *
 * For D&D 3.5 spell-class relations, this generates:
 * - classLevelKeys: ['wizard:1', 'sorcerer:1'] (filterable with 'contains')
 * - classLevels: { wizard: 1, sorcerer: 1 } (direct access)
 */
export type RelationCompileConfig = {
  /**
   * Format for generating filterable keys.
   * Uses placeholders: {targetId}, {metadata.fieldName}
   * Example: "{targetId}:{metadata.level}" -> "wizard:1"
   */
  keyFormat: string;

  /**
   * Name of the generated array field containing filterable keys.
   * Example: "classLevelKeys"
   */
  keysFieldName: string;

  /**
   * Optional: Name of the generated map field for direct access.
   * Maps targetId -> metadata value (when there's a single key metadata).
   * Example: "classLevels" -> { wizard: 1, sorcerer: 1 }
   */
  mapFieldName?: string;

  /**
   * When mapFieldName is set, which metadata field to use as the value.
   * Example: "level"
   */
  mapValueField?: string;
};

/**
 * Configuration for a relation field.
 */
export type RelationFieldConfig = {
  /**
   * The type of relation this field uses.
   * Must match a RelationTypeDefinition.id
   * Example: "spell-class"
   */
  relationType: string;

  /**
   * The entity type that this relation points to.
   * Example: "class" (for spell-class relations)
   */
  targetEntityType: string;

  /**
   * Metadata fields that each relation instance carries.
   * Example: [{ name: 'level', type: 'integer', required: true }]
   */
  metadataFields: RelationMetadataField[];

  /**
   * How to compile relations into a filterable structure.
   * If not provided, the raw relation data is stored.
   */
  compile?: RelationCompileConfig;
};

/**
 * A single relation instance as stored in an entity.
 * This is the raw data before compilation.
 */
export type RelationValue = {
  /** ID of the target entity */
  targetId: string;

  /** Metadata for this specific relation */
  metadata: Record<string, unknown>;
};

/**
 * The compiled value of a relation field.
 * Contains both the raw relations and the compiled filterable data.
 */
export type CompiledRelationValue = {
  /** Raw relation data */
  relations: RelationValue[];

  /**
   * Compiled filterable keys (if compile.keysFieldName is configured).
   * Example: ['wizard:1', 'sorcerer:1']
   */
  [key: string]: unknown;
};
