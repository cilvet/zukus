import { EntityFieldType, DataTableRowKeyConfig, DataTableColumn, EnumOption, RelationFieldConfig } from './base';

// Field definition for dynamic entity properties
export type EntityFieldDefinition = {
  name: string;
  type: EntityFieldType;
  optional?: boolean;
  nonEmpty?: boolean; // Only applies to arrays and references
  description?: string;
  referenceType?: string; // Only applies to reference fields - specifies the type of entities that can be referenced
  allowedValues?: string[] | number[]; // Simple predefined values (deprecated in favor of 'enum' type)
  objectFields?: EntityFieldDefinition[]; // Only applies to 'object' and 'object_array' types - defines nested structure

  // Translation flag - marks this field as translatable
  translatable?: boolean;

  // Formula flag - only applies when type='string'
  // Indicates that this field contains a formula expression for UI autocompletion
  isFormula?: boolean;

  // Enum configuration - only applies when type='enum'
  options?: EnumOption[];

  // DataTable configuration - only applies when type='dataTable'
  rowKey?: DataTableRowKeyConfig;
  columns?: DataTableColumn[];

  // Relation configuration - only applies when type='relation'
  relationConfig?: RelationFieldConfig;

  // Item property configuration - only applies when type='reference' or 'reference_array'
  // When true, Effects from the referenced entities are applied to the parent item (container)
  // Example: A weapon with a "keen" property - the keen's effects modify the weapon's critRange
  applyEffectsToParent?: boolean;
};


// Helper types for working with fields that have allowed values
export type StringFieldWithValues = EntityFieldDefinition & {
  type: 'string';
  allowedValues: string[];
};

export type StringArrayFieldWithValues = EntityFieldDefinition & {
  type: 'string_array';
  allowedValues: string[];
};

export type IntegerFieldWithValues = EntityFieldDefinition & {
  type: 'integer';
  allowedValues: number[];
};

export type IntegerArrayFieldWithValues = EntityFieldDefinition & {
  type: 'integer_array';
  allowedValues: number[];
};

// Type guard functions
export function hasAllowedValues(field: EntityFieldDefinition): field is EntityFieldDefinition & { allowedValues: string[] | number[] } {
  return field.allowedValues !== undefined && field.allowedValues.length > 0;
}

export function isStringFieldWithValues(field: EntityFieldDefinition): field is StringFieldWithValues {
  return field.type === 'string' && hasAllowedValues(field) && typeof field.allowedValues[0] === 'string';
}

export function isStringArrayFieldWithValues(field: EntityFieldDefinition): field is StringArrayFieldWithValues {
  return field.type === 'string_array' && hasAllowedValues(field) && typeof field.allowedValues[0] === 'string';
}

export function isIntegerFieldWithValues(field: EntityFieldDefinition): field is IntegerFieldWithValues {
  return field.type === 'integer' && hasAllowedValues(field) && typeof field.allowedValues[0] === 'number';
}

export function isIntegerArrayFieldWithValues(field: EntityFieldDefinition): field is IntegerArrayFieldWithValues {
  return field.type === 'integer_array' && hasAllowedValues(field) && typeof field.allowedValues[0] === 'number';
}

// Type guards for object fields
export function isObjectField(field: EntityFieldDefinition): boolean {
  return field.type === 'object';
}

export function isObjectArrayField(field: EntityFieldDefinition): boolean {
  return field.type === 'object_array';
}

// Type guards for dataTable fields
export function isDataTableField(field: EntityFieldDefinition): boolean {
  return field.type === 'dataTable';
}

export function hasValidDataTableConfig(field: EntityFieldDefinition): boolean {
  if (field.type !== 'dataTable') {
    return false;
  }
  if (!field.rowKey || !field.rowKey.name) {
    return false;
  }
  if (!field.columns || field.columns.length === 0) {
    return false;
  }
  return true;
}

// Type guards for enum fields
export function isEnumField(field: EntityFieldDefinition): boolean {
  return field.type === 'enum';
}

export function hasValidEnumConfig(field: EntityFieldDefinition): boolean {
  if (field.type !== 'enum') {
    return false;
  }
  if (!field.options || field.options.length === 0) {
    return false;
  }
  
  // Check for duplicate values
  const values = field.options.map(opt => opt.value);
  const uniqueValues = new Set(values);
  if (values.length !== uniqueValues.size) {
    return false;
  }
  
  // Check that all values are the same type (all strings or all numbers)
  const firstType = typeof field.options[0].value;
  const allSameType = field.options.every(opt => typeof opt.value === firstType);
  if (!allSameType) {
    return false;
  }
  
  return true;
}

// Type guard for formula fields
export function isFormulaField(field: EntityFieldDefinition): boolean {
  return field.type === 'string' && field.isFormula === true;
}

// Type guards for relation fields
export function isRelationField(field: EntityFieldDefinition): boolean {
  return field.type === 'relation';
}

export function hasValidRelationConfig(field: EntityFieldDefinition): boolean {
  if (field.type !== 'relation') {
    return false;
  }
  if (!field.relationConfig) {
    return false;
  }
  if (!field.relationConfig.relationType) {
    return false;
  }
  if (!field.relationConfig.targetEntityType) {
    return false;
  }
  return true;
}