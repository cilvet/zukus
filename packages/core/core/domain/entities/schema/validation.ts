import { z } from "zod";
import { createEntitySchema } from './creation';
import { EntitySchemaDefinition } from '../types/schema';

// Validate an entity against its schema definition
export function validateEntity(entity: any, definition: EntitySchemaDefinition): { valid: boolean; errors?: string[] } {
  try {
    const schema = createEntitySchema(definition);
    schema.parse(entity);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error']
    };
  }
}