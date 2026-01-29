import { describe, it, expect } from 'bun:test';
import { dnd35ExampleCompendium, dnd35ExampleCalculationContext } from '../examples/dnd35ExampleContext';
import type { StandardEntity } from '../../entities/types/base';

describe('Example Compendium Validation', () => {
  it('should validate all entities in the example compendium', () => {
    const context = dnd35ExampleCalculationContext.compendiumContext;

    if (!context) {
      throw new Error('Compendium context not resolved');
    }

    const validationErrors: Array<{ entityType: string; entityId: string; error: string }> = [];

    // Validate all entities by type
    for (const [entityType, entities] of Object.entries(dnd35ExampleCompendium.entities)) {
      const resolvedType = context.entityTypes.get(entityType);
      
      if (!resolvedType) {
        validationErrors.push({
          entityType,
          entityId: 'schema',
          error: `No schema found for entity type '${entityType}'`,
        });
        continue;
      }

      for (const entity of entities) {
        const result = resolvedType.validator.safeParse(entity);
        
        if (!result.success) {
          validationErrors.push({
            entityType,
            entityId: entity.id,
            error: result.error.message,
          });
        }
      }
    }

    // Report all errors if any
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors.map(
        err => `  - ${err.entityType}:${err.entityId} - ${err.error}`
      ).join('\n');
      
      throw new Error(
        `Found ${validationErrors.length} validation errors in example compendium:\n${errorMessages}`
      );
    }

    // Count total entities validated
    const totalEntities = Object.values(dnd35ExampleCompendium.entities)
      .reduce((sum, entities) => sum + entities.length, 0);
    
    expect(totalEntities).toBeGreaterThan(0);
  });
});

