/**
 * Functions for managing classes in character data.
 * 
 * When a class is added:
 * 1. The class definition is copied from the compendium to character.classEntities
 * 2. Entities from all levels with specificIds or closed entityIds are copied to the pool
 * 3. All copied entities start with applicable: false
 * 
 * When a class is removed:
 * 1. The class is removed from character.classEntities
 * 2. All entities with origin from that class are removed from the pool
 * 3. Entities whose origin points to removed entities are also removed (cascade)
 */

import type { CharacterBaseData } from '../../character/baseData/character';
import type { ClassEntity, EntityInstance } from '../storage/types';
import type { StandardEntity } from '../../entities/types/base';
import type { EntityProvider } from '../providers/types';
import type { CompendiumContext, UpdateResult, UpdateWarning } from './types';

// =============================================================================
// Add Class
// =============================================================================

/**
 * Adds a class to the character.
 * 
 * @param character - The character data to update
 * @param classId - The ID of the class to add
 * @param compendiumContext - Context for resolving class and entities from compendium
 * @returns Updated character data with warnings
 * 
 * This function:
 * 1. Copies the class from compendium to character.classEntities
 * 2. Resolves entities from granted.specificIds and selector.entityIds
 * 3. Adds resolved entities to character.entities pool
 * 4. All entities are created with applicable: false
 */
export function addClass(
  character: CharacterBaseData,
  classId: string,
  compendiumContext: CompendiumContext
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  // Get class from compendium
  const classEntity = compendiumContext.getClass(classId);
  if (!classEntity) {
    warnings.push({
      type: 'class_not_found',
      message: `Class "${classId}" not found in compendium`,
      entityId: classId,
    });
    return { character, warnings };
  }
  
  // Check if class already exists
  if (character.classEntities && character.classEntities[classId]) {
    warnings.push({
      type: 'class_not_found',
      message: `Class "${classId}" already exists in character`,
      entityId: classId,
    });
    return { character, warnings };
  }
  
  // Copy class to character
  const classEntities = {
    ...character.classEntities,
    [classId]: { ...classEntity },
  };
  
  // Resolve entities from all levels
  const { entities: newEntities, resolveWarnings } = resolveClassEntities(
    classEntity,
    compendiumContext
  );
  warnings.push(...resolveWarnings);
  
  // Merge new entities into pool
  const entities = mergeEntities(character.entities || {}, newEntities);
  
  return {
    character: {
      ...character,
      classEntities,
      entities,
    },
    warnings,
  };
}

// =============================================================================
// Remove Class
// =============================================================================

/**
 * Removes a class from the character.
 * 
 * @param character - The character data to update
 * @param classId - The ID of the class to remove
 * @returns Updated character data with warnings
 * 
 * This function:
 * 1. Removes the class from character.classEntities
 * 2. Removes all entities with origin starting with "classLevel:{classId}-"
 * 3. Cascades removal to child entities (whose origin references removed entities)
 */
export function removeClass(
  character: CharacterBaseData,
  classId: string
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  // Check if class exists
  if (!character.classEntities || !character.classEntities[classId]) {
    warnings.push({
      type: 'class_not_found',
      message: `Class "${classId}" not found in character`,
      entityId: classId,
    });
    return { character, warnings };
  }
  
  // Remove class from classEntities
  const { [classId]: _, ...remainingClasses } = character.classEntities;
  
  // Remove entities from this class and cascade
  const entities = removeClassEntities(character.entities || {}, classId);
  
  // Remove levelSlots assignments for this class
  const levelSlots = character.levelSlots?.map(slot => {
    if (slot.classId === classId) {
      return { ...slot, classId: null };
    }
    return slot;
  });
  
  return {
    character: {
      ...character,
      classEntities: remainingClasses,
      entities,
      levelSlots,
    },
    warnings,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Resolves entities from a class definition.
 * Copies entities from providers with specificIds or closed entityIds.
 */
function resolveClassEntities(
  classEntity: ClassEntity,
  compendiumContext: CompendiumContext
): { entities: Record<string, EntityInstance[]>; resolveWarnings: UpdateWarning[] } {
  const entities: Record<string, EntityInstance[]> = {};
  const resolveWarnings: UpdateWarning[] = [];
  
  // Process each level
  for (const [levelKey, levelRow] of Object.entries(classEntity.levels)) {
    if (!levelRow.providers) {
      continue;
    }
    
    const classLevel = parseInt(levelKey, 10);
    
    for (const provider of levelRow.providers) {
      const { resolved, warnings } = resolveProviderEntities(
        provider,
        classEntity.id,
        classLevel,
        compendiumContext
      );
      
      resolveWarnings.push(...warnings);
      
      // Add resolved entities to pool
      for (const instance of resolved) {
        const entityType = instance.entity.entityType;
        if (!entities[entityType]) {
          entities[entityType] = [];
        }
        entities[entityType].push(instance);
      }
    }
  }
  
  return { entities, resolveWarnings };
}

/**
 * Resolves entities from a single provider.
 */
function resolveProviderEntities(
  provider: EntityProvider,
  classId: string,
  classLevel: number,
  compendiumContext: CompendiumContext
): { resolved: EntityInstance[]; warnings: UpdateWarning[] } {
  const resolved: EntityInstance[] = [];
  const warnings: UpdateWarning[] = [];
  
  const origin = `classLevel:${classId}-${classLevel}`;
  
  // Resolve granted.specificIds
  if (provider.granted?.specificIds) {
    for (const entityId of provider.granted.specificIds) {
      // We need to determine entityType - try common types
      const entity = findEntityInCompendium(entityId, compendiumContext);
      
      if (!entity) {
        warnings.push({
          type: 'entity_not_found',
          message: `Entity "${entityId}" not found in compendium`,
          entityId,
        });
        continue;
      }
      
      const instanceId = `${entityId}@${classId}-${classLevel}`;
      
      resolved.push({
        instanceId,
        entity,
        applicable: false,
        origin,
      });
    }
  }
  
  // Resolve selector.entityIds (closed list)
  if (provider.selector?.entityIds) {
    for (const entityId of provider.selector.entityIds) {
      const entity = findEntityInCompendium(entityId, compendiumContext);
      
      if (!entity) {
        warnings.push({
          type: 'entity_not_found',
          message: `Entity "${entityId}" not found in compendium`,
          entityId,
        });
        continue;
      }
      
      const selectorId = provider.selector.id;
      const instanceId = `${entityId}@${classId}-${classLevel}-${selectorId}`;
      
      resolved.push({
        instanceId,
        entity,
        applicable: false,
        origin,
      });
    }
  }
  
  // Note: granted.filter and selector.filter are NOT resolved here
  // They require dynamic evaluation against the compendium at runtime
  
  return { resolved, warnings };
}

/**
 * Finds an entity in the compendium across common entity types.
 */
function findEntityInCompendium(
  entityId: string,
  compendiumContext: CompendiumContext
): StandardEntity | undefined {
  // Try common entity types
  const commonTypes = ['classFeature', 'feat', 'spell', 'item', 'ability'];
  
  for (const entityType of commonTypes) {
    const entity = compendiumContext.getEntity(entityType, entityId);
    if (entity) {
      return entity;
    }
  }
  
  return undefined;
}

/**
 * Merges new entities into the existing pool.
 */
function mergeEntities(
  existing: Record<string, EntityInstance[]>,
  newEntities: Record<string, EntityInstance[]>
): Record<string, EntityInstance[]> {
  const result = { ...existing };
  
  for (const [entityType, instances] of Object.entries(newEntities)) {
    if (!result[entityType]) {
      result[entityType] = [];
    }
    result[entityType] = [...result[entityType], ...instances];
  }
  
  return result;
}

/**
 * Removes all entities from a class and cascades to child entities.
 */
function removeClassEntities(
  entities: Record<string, EntityInstance[]>,
  classId: string
): Record<string, EntityInstance[]> {
  const result: Record<string, EntityInstance[]> = {};
  const removedInstanceIds = new Set<string>();
  
  // First pass: remove direct class entities and collect their IDs
  for (const [entityType, instances] of Object.entries(entities)) {
    const kept: EntityInstance[] = [];
    
    for (const instance of instances) {
      if (instance.origin.startsWith(`classLevel:${classId}-`)) {
        removedInstanceIds.add(instance.instanceId);
      } else {
        kept.push(instance);
      }
    }
    
    result[entityType] = kept;
  }
  
  // Second pass: cascade removal of child entities
  let hasRemovals = true;
  while (hasRemovals) {
    hasRemovals = false;
    
    for (const [entityType, instances] of Object.entries(result)) {
      const kept: EntityInstance[] = [];
      
      for (const instance of instances) {
        // Check if origin references a removed entity
        const parentMatch = instance.origin.match(/entityInstance\.[^:]+:(.+)/);
        if (parentMatch && removedInstanceIds.has(parentMatch[1])) {
          removedInstanceIds.add(instance.instanceId);
          hasRemovals = true;
        } else {
          kept.push(instance);
        }
      }
      
      result[entityType] = kept;
    }
  }
  
  return result;
}

