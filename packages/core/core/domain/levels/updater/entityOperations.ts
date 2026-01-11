/**
 * Functions for managing entities in character data.
 * 
 * These functions allow editing, creating, and deleting entities
 * in the character's entity pool.
 */

import type { CharacterBaseData } from '../../character/baseData/character';
import type { EntityInstance } from '../storage/types';
import type { StandardEntity } from '../../entities/types/base';
import type { UpdateResult, UpdateWarning } from './types';

// =============================================================================
// Edit Entity
// =============================================================================

/**
 * Edits an entity in the character's pool.
 * 
 * @param character - The character data to update
 * @param instanceId - The instanceId of the entity to edit
 * @param updates - Partial entity data to merge
 * @returns Updated character data with warnings
 */
export function editEntity(
  character: CharacterBaseData,
  instanceId: string,
  updates: Partial<StandardEntity>
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  if (!character.entities) {
    warnings.push({
      type: 'entity_not_found',
      message: `Entity "${instanceId}" not found - no entities in character`,
      entityId: instanceId,
    });
    return { character, warnings };
  }
  
  // Find the entity
  let found = false;
  const entities: Record<string, EntityInstance[]> = {};
  
  for (const [entityType, instances] of Object.entries(character.entities)) {
    entities[entityType] = instances.map(instance => {
      if (instance.instanceId === instanceId) {
        found = true;
        return {
          ...instance,
          entity: {
            ...instance.entity,
            ...updates,
          },
        };
      }
      return instance;
    });
  }
  
  if (!found) {
    warnings.push({
      type: 'entity_not_found',
      message: `Entity "${instanceId}" not found in character`,
      entityId: instanceId,
    });
    return { character, warnings };
  }
  
  return {
    character: {
      ...character,
      entities,
    },
    warnings,
  };
}

// =============================================================================
// Create Custom Entity
// =============================================================================

/**
 * Creates a custom entity in the character's pool.
 * 
 * @param character - The character data to update
 * @param entity - The entity to create
 * @returns Updated character data with warnings
 * 
 * Custom entities have:
 * - instanceId: "{entity.id}@custom"
 * - origin: "custom"
 * - applicable: true (always active)
 */
export function createCustomEntity(
  character: CharacterBaseData,
  entity: StandardEntity
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  const instanceId = `${entity.id}@custom`;
  const entityType = entity.entityType;
  
  // Check for duplicate
  const existingEntities = character.entities?.[entityType] || [];
  const duplicate = existingEntities.find(e => e.instanceId === instanceId);
  
  if (duplicate) {
    warnings.push({
      type: 'entity_not_found', // Could add a new warning type
      message: `Entity with instanceId "${instanceId}" already exists`,
      entityId: entity.id,
    });
    return { character, warnings };
  }
  
  const newInstance: EntityInstance = {
    instanceId,
    entity,
    applicable: true, // Custom entities are always applicable
    origin: 'custom',
  };
  
  const entities = {
    ...character.entities,
    [entityType]: [...existingEntities, newInstance],
  };
  
  return {
    character: {
      ...character,
      entities,
    },
    warnings,
  };
}

// =============================================================================
// Delete Entity
// =============================================================================

/**
 * Deletes an entity from the character's pool.
 * 
 * @param character - The character data to update
 * @param instanceId - The instanceId of the entity to delete
 * @returns Updated character data with warnings
 * 
 * Note: This also cascades deletion to child entities
 * (entities whose origin references this entity).
 */
export function deleteEntity(
  character: CharacterBaseData,
  instanceId: string
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  if (!character.entities) {
    warnings.push({
      type: 'entity_not_found',
      message: `Entity "${instanceId}" not found - no entities in character`,
      entityId: instanceId,
    });
    return { character, warnings };
  }
  
  // Track removed IDs for cascade
  const removedInstanceIds = new Set<string>([instanceId]);
  
  let hasRemovals = true;
  let entities = { ...character.entities };
  
  while (hasRemovals) {
    hasRemovals = false;
    const newEntities: Record<string, EntityInstance[]> = {};
    
    for (const [entityType, instances] of Object.entries(entities)) {
      const kept: EntityInstance[] = [];
      
      for (const instance of instances) {
        // Direct match
        if (removedInstanceIds.has(instance.instanceId)) {
          hasRemovals = true;
          continue;
        }
        
        // Cascade: check if origin references a removed entity
        const parentMatch = instance.origin.match(/entityInstance\.[^:]+:(.+)/);
        if (parentMatch && removedInstanceIds.has(parentMatch[1])) {
          removedInstanceIds.add(instance.instanceId);
          hasRemovals = true;
          continue;
        }
        
        kept.push(instance);
      }
      
      newEntities[entityType] = kept;
    }
    
    entities = newEntities;
  }
  
  // Check if the original entity was found
  let originalFound = false;
  for (const instances of Object.values(character.entities)) {
    if (instances.some(i => i.instanceId === instanceId)) {
      originalFound = true;
      break;
    }
  }
  
  if (!originalFound) {
    warnings.push({
      type: 'entity_not_found',
      message: `Entity "${instanceId}" not found in character`,
      entityId: instanceId,
    });
  }
  
  return {
    character: {
      ...character,
      entities,
    },
    warnings,
  };
}

// =============================================================================
// Get Entity
// =============================================================================

/**
 * Gets an entity from the character's pool by instanceId.
 */
export function getEntity(
  character: CharacterBaseData,
  instanceId: string
): EntityInstance | undefined {
  if (!character.entities) {
    return undefined;
  }
  
  for (const instances of Object.values(character.entities)) {
    const found = instances.find(i => i.instanceId === instanceId);
    if (found) {
      return found;
    }
  }
  
  return undefined;
}

/**
 * Gets all entities of a specific type from the character's pool.
 */
export function getEntitiesByType(
  character: CharacterBaseData,
  entityType: string
): EntityInstance[] {
  return character.entities?.[entityType] || [];
}

/**
 * Gets all applicable entities of a specific type.
 */
export function getApplicableEntitiesByType(
  character: CharacterBaseData,
  entityType: string
): EntityInstance[] {
  const entities = character.entities?.[entityType] || [];
  return entities.filter(e => e.applicable);
}

