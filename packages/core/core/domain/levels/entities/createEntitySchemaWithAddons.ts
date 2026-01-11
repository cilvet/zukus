import { z } from 'zod';
import type { EntityFieldDefinition } from '../../entities/types/fields';
import type { EntitySchemaDefinition } from '../../entities/types/schema';
import type { AddonRegistry } from './types';
import { hasAllowedValues } from '../../entities/types/fields';

// =============================================================================
// Base Schema (implicit fields)
// =============================================================================

/**
 * Base fields that are always present on every entity.
 * These are NOT from an addon - they are implicit.
 */
const BaseEntitySchema = z.object({
  id: z.string(),
  entityType: z.string(),
});

// =============================================================================
// Field Schema Creation
// =============================================================================

/**
 * Creates a Zod schema for a single field definition.
 * Handles all supported field types.
 */
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

    case 'string_array': {
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
    }

    case 'integer_array': {
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
    }

    case 'reference':
      if (field.nonEmpty) {
        schema = z.array(z.string()).min(1);
      } else {
        schema = z.array(z.string());
      }
      break;

    case 'object':
      if (!field.objectFields || field.objectFields.length === 0) {
        // Allow any object if no fields specified
        schema = z.any();
      } else {
        const objectShape: Record<string, z.ZodTypeAny> = {};
        field.objectFields.forEach(nestedField => {
          objectShape[nestedField.name] = createFieldSchema(nestedField);
        });
        schema = z.object(objectShape);
      }
      break;

    case 'object_array': {
      if (!field.objectFields || field.objectFields.length === 0) {
        // Allow any objects if no fields specified
        schema = z.array(z.any());
      } else {
        const arrayObjectShape: Record<string, z.ZodTypeAny> = {};
        field.objectFields.forEach(nestedField => {
          arrayObjectShape[nestedField.name] = createFieldSchema(nestedField);
        });
        schema = z.array(z.object(arrayObjectShape));
      }
      if (field.nonEmpty) {
        schema = (schema as z.ZodArray<z.ZodTypeAny>).min(1);
      }
      break;
    }

    default:
      throw new Error(`Unsupported field type: ${field.type}`);
  }

  if (field.optional) {
    schema = schema.optional();
  }

  return schema;
}

// =============================================================================
// Main Function
// =============================================================================

/**
 * Creates a Zod schema for an entity type, injecting fields from specified addons.
 * 
 * @param definition - The entity schema definition with custom fields and addon IDs
 * @param addonRegistry - Registry of available addons to resolve IDs
 * @returns A Zod schema that validates entities of this type
 * 
 * @example
 * ```typescript
 * const spellSchema = createEntitySchemaWithAddons(
 *   {
 *     typeName: 'spell',
 *     fields: [{ name: 'level', type: 'integer' }],
 *     addons: ['searchable', 'effectful'],
 *   },
 *   defaultAddonRegistry
 * );
 * ```
 */
export function createEntitySchemaWithAddons(
  definition: EntitySchemaDefinition,
  addonRegistry: AddonRegistry
): z.ZodSchema {
  const additionalFields: Record<string, z.ZodTypeAny> = {};

  // 1. Inject fields from addons
  const addonIds = definition.addons || [];
  for (const addonId of addonIds) {
    const addon = addonRegistry[addonId];
    if (!addon) {
      throw new Error(`Unknown addon: "${addonId}". Available addons: ${Object.keys(addonRegistry).join(', ')}`);
    }

    for (const field of addon.fields) {
      additionalFields[field.name] = createFieldSchema(field);
    }
  }

  // 2. Add custom fields from definition (these can override addon fields if needed)
  for (const field of definition.fields) {
    additionalFields[field.name] = createFieldSchema(field);
  }

  // 3. Extend base schema with all fields
  return BaseEntitySchema.extend(additionalFields);
}

