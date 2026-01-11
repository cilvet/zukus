import { EntitySchemaDefinition } from '../types/schema';
import { EntityFieldDefinition, hasAllowedValues } from '../types/fields';

// Form field types for UI generation
export type FormFieldType = 
  | 'text'
  | 'number' 
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'text_array'
  | 'number_array'
  | 'reference_array';

// Form field definition for UI generation
export type FormFieldDefinition = {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  description?: string;
  options?: Array<{ value: string | number; label: string }>; // For select/multiselect
  referenceType?: string; // For reference fields
  validation?: {
    min?: number;
    max?: number;
    nonEmpty?: boolean;
  };
};

// Form schema for UI generation
export type FormSchema = {
  typeName: string;
  description?: string;
  fields: FormFieldDefinition[];
};

// Convert entity field to form field
function convertFieldToFormField(field: EntityFieldDefinition): FormFieldDefinition {
  const baseField: Partial<FormFieldDefinition> = {
    name: field.name,
    label: field.description || field.name,
    required: !field.optional,
    description: field.description,
    referenceType: field.referenceType,
    validation: {
      nonEmpty: field.nonEmpty
    }
  };

  switch (field.type) {
    case 'string':
      if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'string') {
        return {
          ...baseField,
          type: 'select',
          options: (field.allowedValues as string[]).map(value => ({
            value,
            label: value
          }))
        } as FormFieldDefinition;
      }
      return {
        ...baseField,
        type: 'text'
      } as FormFieldDefinition;

    case 'integer':
      if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'number') {
        return {
          ...baseField,
          type: 'select',
          options: (field.allowedValues as number[]).map(value => ({
            value,
            label: value.toString()
          }))
        } as FormFieldDefinition;
      }
      return {
        ...baseField,
        type: 'number'
      } as FormFieldDefinition;

    case 'boolean':
      return {
        ...baseField,
        type: 'boolean'
      } as FormFieldDefinition;

    case 'string_array':
      if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'string') {
        return {
          ...baseField,
          type: 'multiselect',
          options: (field.allowedValues as string[]).map(value => ({
            value,
            label: value
          }))
        } as FormFieldDefinition;
      }
      return {
        ...baseField,
        type: 'text_array'
      } as FormFieldDefinition;

    case 'integer_array':
      if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'number') {
        return {
          ...baseField,
          type: 'multiselect',
          options: (field.allowedValues as number[]).map(value => ({
            value,
            label: value.toString()
          }))
        } as FormFieldDefinition;
      }
      return {
        ...baseField,
        type: 'number_array'
      } as FormFieldDefinition;

    case 'reference':
      return {
        ...baseField,
        type: 'reference_array'
      } as FormFieldDefinition;

    default:
      throw new Error(`Unsupported field type for form generation: ${field.type}`);
  }
}

// Generate form schema from entity definition
export function generateFormSchema(definition: EntitySchemaDefinition): FormSchema {
  const baseFields: FormFieldDefinition[] = [
    {
      name: 'id',
      label: 'ID',
      type: 'text',
      required: true,
      description: 'Unique identifier for this entity'
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      description: 'Display name for this entity'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      required: false,
      description: 'Optional description'
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'text_array',
      required: false,
      description: 'Optional tags for categorization'
    }
  ];

  const customFields = definition.fields.map(convertFieldToFormField);

  return {
    typeName: definition.typeName,
    description: definition.description,
    fields: [...baseFields, ...customFields]
  };
}

// Get default value for a form field
export function getDefaultValueForField(field: FormFieldDefinition): any {
  switch (field.type) {
    case 'text':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'select':
      const firstValue = field.options?.[0]?.value;
      return firstValue !== undefined ? firstValue : '';
    case 'multiselect':
      if (field.validation?.nonEmpty) {
        return field.options?.[0] ? [field.options[0].value] : [];
      }
      return [];
    case 'text_array':
      if (field.validation?.nonEmpty) {
        return [''];
      }
      return [];
    case 'number_array':
      if (field.validation?.nonEmpty) {
        return [0];
      }
      return [];
    case 'reference_array':
      if (field.validation?.nonEmpty) {
        return [''];
      }
      return [];
    default:
      return null;
  }
}