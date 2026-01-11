/**
 * Computed Fields System using JMESPath
 * 
 * This system allows defining computed fields on entities that are calculated
 * dynamically from the entity's raw data using JMESPath expressions.
 */

import * as jmespath from 'jmespath';
import { Entity } from '../../core/domain/entities/types/base';

/**
 * Definition of a computed field
 */
export type ComputedFieldDefinition = {
  name: string;
  jmespathExpression: string;
  description?: string;
};

/**
 * Entity with computed fields applied
 */
export type EntityWithComputedFields<T extends Entity> = T & Record<string, any>;

/**
 * Configuration for computed fields on an entity type
 */
export type ComputedFieldsConfig = {
  fields: ComputedFieldDefinition[];
};

/**
 * Apply computed fields to a single entity
 * 
 * @param entity - The entity to enrich with computed fields
 * @param config - The computed fields configuration
 * @returns The entity with computed fields added
 */
export function applyComputedFields<T extends Entity>(
  entity: T,
  config: ComputedFieldsConfig
): EntityWithComputedFields<T> {
  const enrichedEntity: any = { ...entity };

  config.fields.forEach((field) => {
    try {
      const computedValue = jmespath.search(entity, field.jmespathExpression);
      enrichedEntity[field.name] = computedValue;
    } catch (error) {
      console.warn(
        `Failed to compute field "${field.name}" for entity ${entity.id}:`,
        error
      );
      enrichedEntity[field.name] = null;
    }
  });

  return enrichedEntity as EntityWithComputedFields<T>;
}

/**
 * Apply computed fields to multiple entities
 * 
 * @param entities - The entities to enrich with computed fields
 * @param config - The computed fields configuration
 * @returns The entities with computed fields added
 */
export function applyComputedFieldsToMany<T extends Entity>(
  entities: T[],
  config: ComputedFieldsConfig
): EntityWithComputedFields<T>[] {
  return entities.map((entity) => applyComputedFields(entity, config));
}

/**
 * Get the value of a computed field from an entity
 * 
 * @param entity - The entity with computed fields
 * @param fieldName - The name of the computed field
 * @returns The value of the computed field, or null if not found
 */
export function getComputedFieldValue<T extends Entity>(
  entity: EntityWithComputedFields<T>,
  fieldName: string
): any {
  return entity[fieldName] ?? null;
}

