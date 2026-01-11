import { z } from "zod";
import { EntityFieldDefinition, hasAllowedValues, isEnumField, hasValidEnumConfig } from '../types/fields';
import { EntitySchemaDefinition } from '../types/schema';

// Source data schema
const SourceDataSchema = z.object({
  compendiumId: z.string(),
  page: z.number().int().optional(),
  edition: z.string().optional(),
});

// Base Zod schema for Entity (only required fields)
const BaseEntitySchema = z.object({
  id: z.string(),
  entityType: z.string(),
  replaces_id: z.string().optional(), // Special field for entity replacement
});

// Create a Zod schema for a field based on its definition
function createFieldSchema(field: EntityFieldDefinition): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case 'string':
      if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'string') {
        schema = z.enum(field.allowedValues as [string, ...string[]]);
      } else {
        schema = z.string();
      }
      break;
    case 'integer':
      if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'number') {
        schema = z.number().int().refine(
          (val) => (field.allowedValues as number[]).includes(val),
          { message: `Value must be one of: ${field.allowedValues!.join(', ')}` }
        );
      } else {
        schema = z.number().int();
      }
      break;
    case 'boolean':
      schema = z.boolean();
      break;
    case 'string_array':
      let stringArraySchema;
      if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'string') {
        const enumSchema = z.enum(field.allowedValues as [string, ...string[]]);
        stringArraySchema = z.array(enumSchema);
      } else {
        stringArraySchema = z.array(z.string());
      }
      if (field.nonEmpty) {
        stringArraySchema = stringArraySchema.min(1);
      }
      schema = stringArraySchema;
      break;
    case 'integer_array':
      let intArraySchema = z.array(z.number().int());
      if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'number') {
        const validValues = field.allowedValues as number[];
        const refinedIntSchema = z.number().int().refine(
          (val) => validValues.includes(val),
          { message: `Value must be one of: ${validValues.join(', ')}` }
        );
        intArraySchema = z.array(refinedIntSchema);
      }
      if (field.nonEmpty) {
        intArraySchema = intArraySchema.min(1);
      }
      schema = intArraySchema;
      break;
    case 'reference':
      // References are arrays of string IDs
      if (field.nonEmpty) {
        schema = z.array(z.string()).min(1);
      } else {
        schema = z.array(z.string());
      }
      break;
    case 'object':
      if (!field.objectFields || field.objectFields.length === 0) {
        throw new Error(`Object field '${field.name}' must have objectFields defined`);
      }
      // Create nested object schema recursively
      const objectShape: Record<string, z.ZodTypeAny> = {};
      field.objectFields.forEach(nestedField => {
        objectShape[nestedField.name] = createFieldSchema(nestedField);
      });
      schema = z.object(objectShape);
      break;
    case 'object_array':
      if (!field.objectFields || field.objectFields.length === 0) {
        throw new Error(`Object array field '${field.name}' must have objectFields defined`);
      }
      // Create nested object schema recursively
      const arrayObjectShape: Record<string, z.ZodTypeAny> = {};
      field.objectFields.forEach(nestedField => {
        arrayObjectShape[nestedField.name] = createFieldSchema(nestedField);
      });
      let objectArraySchema = z.array(z.object(arrayObjectShape));
      if (field.nonEmpty) {
        objectArraySchema = objectArraySchema.min(1);
      }
      schema = objectArraySchema;
      break;
    case 'enum':
      if (!hasValidEnumConfig(field)) {
        throw new Error(`Enum field '${field.name}' must have valid options configuration`);
      }
      // Extract values from enum options
      const enumValues = field.options!.map(opt => opt.value);
      const firstEnumType = typeof enumValues[0];
      
      if (firstEnumType === 'string') {
        // String enum
        schema = z.enum(enumValues as [string, ...string[]]);
      } else {
        // Number enum - use refine for validation
        schema = z.number().refine(
          (val) => enumValues.includes(val),
          { message: `Value must be one of: ${enumValues.join(', ')}` }
        );
      }
      break;
    case 'image':
      // Image fields are strings (URL or asset path)
      schema = z.string();
      break;
    case 'dataTable':
      // DataTable fields are records with string keys and object values
      schema = z.record(z.string(), z.record(z.string(), z.any()));
      break;
    default:
      throw new Error(`Unsupported field type: ${field.type}`);
  }

  if (field.optional) {
    schema = schema.optional();
  }

  return schema;
}

// Create a complete Zod schema for an entity type
export function createEntitySchema(definition: EntitySchemaDefinition): z.ZodSchema {
  const additionalFields: Record<string, z.ZodTypeAny> = {};
  const addons = definition.addons ?? [];

  // Add addon fields based on enabled addons
  if (addons.includes('searchable')) {
    additionalFields['name'] = z.string();
    additionalFields['description'] = z.string().optional();
  }
  
  if (addons.includes('taggable')) {
    additionalFields['tags'] = z.array(z.string()).optional();
  }
  
  if (addons.includes('imageable')) {
    additionalFields['image'] = z.string().optional();
  }
  
  if (addons.includes('source')) {
    additionalFields['source'] = SourceDataSchema.optional();
  }
  
  if (addons.includes('effectful')) {
    additionalFields['changes'] = z.array(z.any()).optional();
    additionalFields['specialChanges'] = z.array(z.any()).optional();
    additionalFields['effects'] = z.array(z.any()).optional();
    additionalFields['legacy_changes'] = z.array(z.any()).optional();
    additionalFields['legacy_contextualChanges'] = z.array(z.any()).optional();
    additionalFields['legacy_specialChanges'] = z.array(z.any()).optional();
  }
  
  if (addons.includes('suppressing')) {
    additionalFields['suppression'] = z.array(z.any()).optional();
  }

  // Add custom fields from definition
  definition.fields.forEach(field => {
    additionalFields[field.name] = createFieldSchema(field);
  });

  return BaseEntitySchema.extend(additionalFields);
}

// Generate JSON schema from entity definition
export function generateJsonSchema(definition: EntitySchemaDefinition): object {
  const zodSchema = createEntitySchema(definition);
  return zodSchema._def;
}