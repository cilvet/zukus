/**
 * Functions for managing system levels in character data.
 * 
 * System levels define character-wide progression independent of classes,
 * such as feats every 3 levels and ability score increases every 4 levels.
 * 
 * When system levels are set:
 * 1. The system levels entity is copied from the compendium to character.systemLevelsEntity
 * 2. Entities from all levels with specificIds or closed entityIds are copied to the pool
 * 3. All copied entities start with applicable: false
 * 
 * When system levels are removed:
 * 1. The entity is removed from character.systemLevelsEntity
 * 2. All entities with origin starting with "characterLevel:" are removed from the pool
 */

import type { CharacterBaseData } from '../../character/baseData/character';
import type { SystemLevelsEntity, EntityInstance } from '../storage/types';
import type { StandardEntity } from '../../entities/types/base';
import type { EntityProvider } from '../providers/types';
import type { CompendiumContext, UpdateResult, UpdateWarning } from './types';

// =============================================================================
// Set System Levels
// =============================================================================

/**
 * Sets the system levels entity for the character.
 * 
 * @param character - The character data to update
 * @param systemLevelsId - The ID of the system levels entity to use
 * @param compendiumContext - Context for resolving system levels and entities from compendium
 * @returns Updated character data with warnings
 * 
 * This function:
 * 1. Copies the system levels entity from compendium to character.systemLevelsEntity
 * 2. Resolves entities from granted.specificIds and selector.entityIds
 * 3. Adds resolved entities to character.entities pool
 * 4. All entities are created with applicable: false
 */
export function setSystemLevels(
  character: CharacterBaseData,
  systemLevelsId: string,
  compendiumContext: CompendiumContext
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  // Get system levels from compendium
  const systemLevelsEntity = compendiumContext.getSystemLevels(systemLevelsId);
  if (!systemLevelsEntity) {
    warnings.push({
      type: 'system_levels_not_found',
      message: `System levels "${systemLevelsId}" not found in compendium`,
      entityId: systemLevelsId,
    });
    return { character, warnings };
  }
  
  // If there's an existing system levels, remove its entities first
  let updatedCharacter = character;
  if (character.systemLevelsEntity) {
    const removeResult = removeSystemLevels(character);
    updatedCharacter = removeResult.character;
    warnings.push(...removeResult.warnings);
  }
  
  // Resolve entities from all levels
  const { entities: newEntities, resolveWarnings } = resolveSystemLevelsEntities(
    systemLevelsEntity,
    compendiumContext
  );
  warnings.push(...resolveWarnings);
  
  // Merge new entities into pool
  const entities = mergeEntities(updatedCharacter.entities || {}, newEntities);
  
  return {
    character: {
      ...updatedCharacter,
      systemLevelsEntity: { ...systemLevelsEntity },
      entities,
    },
    warnings,
  };
}

// =============================================================================
// Remove System Levels
// =============================================================================

/**
 * Removes the system levels entity from the character.
 * 
 * @param character - The character data to update
 * @returns Updated character data with warnings
 * 
 * This function:
 * 1. Removes the system levels entity from character.systemLevelsEntity
 * 2. Removes all entities with origin starting with "characterLevel:"
 */
export function removeSystemLevels(
  character: CharacterBaseData
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  // Check if system levels exists
  if (!character.systemLevelsEntity) {
    warnings.push({
      type: 'system_levels_not_found',
      message: 'No system levels entity in character',
    });
    return { character, warnings };
  }
  
  // Remove entities from system levels
  const entities = removeSystemLevelEntities(character.entities || {});
  
  // Remove systemLevelsEntity
  const { systemLevelsEntity: _, ...rest } = character;
  
  return {
    character: {
      ...rest,
      entities,
    } as CharacterBaseData,
    warnings,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Resolves entities from a system levels definition.
 * Copies entities from providers with specificIds or closed entityIds.
 */
function resolveSystemLevelsEntities(
  systemLevelsEntity: SystemLevelsEntity,
  compendiumContext: CompendiumContext
): { entities: Record<string, EntityInstance[]>; resolveWarnings: UpdateWarning[] } {
  const entities: Record<string, EntityInstance[]> = {};
  const resolveWarnings: UpdateWarning[] = [];
  
  // Process each level
  for (const [levelKey, levelRow] of Object.entries(systemLevelsEntity.levels)) {
    if (!levelRow.providers) {
      continue;
    }
    
    const characterLevel = parseInt(levelKey, 10);
    
    for (const provider of levelRow.providers) {
      const { resolved, warnings } = resolveProviderEntities(
        provider,
        characterLevel,
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
  characterLevel: number,
  compendiumContext: CompendiumContext
): { resolved: EntityInstance[]; warnings: UpdateWarning[] } {
  const resolved: EntityInstance[] = [];
  const warnings: UpdateWarning[] = [];
  
  const origin = `characterLevel:${characterLevel}`;
  
  // Resolve granted.specificIds
  if (provider.granted?.specificIds) {
    for (const entityId of provider.granted.specificIds) {
      const entity = findEntityInCompendium(entityId, compendiumContext);
      
      if (!entity) {
        warnings.push({
          type: 'entity_not_found',
          message: `Entity "${entityId}" not found in compendium`,
          entityId,
        });
        continue;
      }
      
      const instanceId = `${entityId}@characterLevel-${characterLevel}`;
      
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
      const instanceId = `${entityId}@characterLevel-${characterLevel}-${selectorId}`;
      
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
  // Try common entity types for system levels
  const commonTypes = ['feat', 'character_ability_increase', 'classFeature', 'spell', 'item', 'ability'];
  
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
 * Removes all entities from system levels.
 */
function removeSystemLevelEntities(
  entities: Record<string, EntityInstance[]>
): Record<string, EntityInstance[]> {
  const result: Record<string, EntityInstance[]> = {};
  const removedInstanceIds = new Set<string>();
  
  // First pass: remove direct system level entities and collect their IDs
  for (const [entityType, instances] of Object.entries(entities)) {
    const kept: EntityInstance[] = [];
    
    for (const instance of instances) {
      if (instance.origin.startsWith('characterLevel:')) {
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

