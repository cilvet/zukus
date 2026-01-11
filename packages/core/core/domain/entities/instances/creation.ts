import { Entity } from '../types/base';
import { EntitySchemaDefinition } from '../types/schema';
import { hasAllowedValues, isEnumField } from '../types/fields';

// Create a new entity instance with default values
export function createEntityInstance(definition: EntitySchemaDefinition, baseData: Partial<Entity> = {}): Entity {
  const instance: any = {
    id: baseData.id || '',
    entityType: definition.typeName,
    ...baseData
  };

  // Add default values for required fields
  definition.fields.forEach(field => {
    if (!field.optional && !(field.name in instance)) {
      switch (field.type) {
        case 'string':
          if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'string') {
            // Use first allowed value as default
            instance[field.name] = field.allowedValues[0];
          } else {
            instance[field.name] = '';
          }
          break;
        case 'integer':
          if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'number') {
            // Use first allowed value as default
            instance[field.name] = field.allowedValues[0];
          } else {
            instance[field.name] = 0;
          }
          break;
        case 'boolean':
          instance[field.name] = false;
          break;
        case 'string_array':
          if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'string') {
            if (field.nonEmpty) {
              // Use first allowed value for non-empty arrays
              instance[field.name] = [field.allowedValues[0]];
            } else {
              instance[field.name] = [];
            }
          } else {
            instance[field.name] = field.nonEmpty ? [''] : [];
          }
          break;
        case 'integer_array':
          if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'number') {
            if (field.nonEmpty) {
              // Use first allowed value for non-empty arrays
              instance[field.name] = [field.allowedValues[0]];
            } else {
              instance[field.name] = [];
            }
          } else {
            instance[field.name] = field.nonEmpty ? [0] : [];
          }
          break;
        case 'reference':
          instance[field.name] = field.nonEmpty ? [''] : [];
          break;
        case 'enum':
          if (isEnumField(field) && field.options && field.options.length > 0) {
            // Use first option value as default
            instance[field.name] = field.options[0].value;
          }
          break;
        case 'object':
          // For object fields, initialize as empty object
          instance[field.name] = {};
          break;
        case 'object_array':
          // For object arrays, initialize as empty or single-element array
          instance[field.name] = field.nonEmpty ? [{}] : [];
          break;
        case 'image':
          // For image fields, default to empty string
          instance[field.name] = '';
          break;
        case 'dataTable':
          // For dataTable fields, default to empty record
          instance[field.name] = {};
          break;
      }
    }
  });

  return instance as Entity;
}