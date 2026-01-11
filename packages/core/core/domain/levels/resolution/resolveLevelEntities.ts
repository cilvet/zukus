/**
 * Level Entity Resolution
 * 
 * This module handles the resolution of entities based on level slots.
 * It determines which entities are "applicable" (active) for a character
 * based on their current class levels.
 * 
 * The resolution process:
 * 1. Start with all entities as applicable: false
 * 2. Walk through levelSlots from slot 0 to current level
 * 3. For each slot (character level):
 *    a. FIRST: Process system-level providers (feats, ability increases)
 *    b. THEN: Process class-level providers for the class in that slot
 * 4. Mark granted entities and selected entities as applicable
 * 5. Recursively process providers in applicable entities
 * 6. Custom entities (origin: "custom") are always applicable
 */

import type { CharacterBaseData } from '../../character/baseData/character';
import type { EntityInstance, ClassEntity, ClassLevelRow, SystemLevelRow } from '../storage/types';
import type { EntityProvider } from '../providers/types';
import type { ResolutionResult, ResolutionWarning } from './types';

// =============================================================================
// Main Resolution Function
// =============================================================================

/**
 * Resolves entity applicability based on level slots.
 * 
 * @param character - The character data to resolve
 * @returns Resolution result with updated entities and warnings
 * 
 * This function:
 * 1. Resets all entities to applicable: false (except custom)
 * 2. Walks through levelSlots tracking class levels
 * 3. Marks entities as applicable based on providers
 * 4. Handles nested providers recursively
 */
export function resolveLevelEntities(character: CharacterBaseData): ResolutionResult {
  const warnings: ResolutionWarning[] = [];
  
  // No entities to resolve
  if (!character.entities) {
    return { entities: {}, warnings };
  }
  
  // Reset all entities to applicable: false, except custom
  let entities = resetApplicability(character.entities);
  
  // Track class levels
  const classLevelCounters: Record<string, number> = {};
  
  // Track visited entity instances to avoid infinite recursion
  const visitedInstanceIds = new Set<string>();
  
  // Process each level slot up to the character's current level
  // If level.level is 0 or undefined, process all slots (backwards compatibility)
  const levelSlots = character.levelSlots || [];
  const characterLevel = character.level?.level;
  const hasExplicitLevel = characterLevel !== undefined && characterLevel > 0;
  const effectiveSlotCount = hasExplicitLevel 
    ? Math.min(levelSlots.length, characterLevel)
    : levelSlots.length;
  
  // Get system levels entity (if present)
  const systemLevels = character.systemLevelsEntity;
  
  for (let i = 0; i < effectiveSlotCount; i++) {
    const slot = levelSlots[i];
    const currentCharacterLevel = i + 1; // Level slots are 0-indexed
    
    // =========================================================================
    // STEP 1: Process system-level providers FIRST
    // =========================================================================
    if (systemLevels) {
      const systemLevelKey = String(currentCharacterLevel);
      const systemLevelRow = systemLevels.levels[systemLevelKey];
      
      if (systemLevelRow?.providers) {
        const { updatedEntities, providerWarnings } = processSystemProviders(
          systemLevelRow.providers,
          entities,
          visitedInstanceIds,
          currentCharacterLevel
        );
        
        entities = updatedEntities;
        warnings.push(...providerWarnings);
      }
    }
    
    // =========================================================================
    // STEP 2: Process class-level providers
    // =========================================================================
    if (!slot.classId) {
      continue;
    }
    
    // Increment class level counter
    const classId = slot.classId;
    classLevelCounters[classId] = (classLevelCounters[classId] || 0) + 1;
    const classLevel = classLevelCounters[classId];
    
    // Get class from character
    const classEntity = character.classEntities?.[classId];
    if (!classEntity) {
      warnings.push({
        type: 'class_not_found',
        message: `Class "${classId}" not found in character.classEntities`,
        classId,
      });
      continue;
    }
    
    // Get level row
    const levelKey = String(classLevel);
    const levelRow = classEntity.levels[levelKey];
    
    if (!levelRow?.providers) {
      continue;
    }
    
    // Process providers for this level
    const { updatedEntities, providerWarnings } = processClassProviders(
      levelRow.providers,
      entities,
      visitedInstanceIds,
      classId,
      classLevel
    );
    
    entities = updatedEntities;
    warnings.push(...providerWarnings);
  }
  
  return { entities, warnings };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Resets all entities to applicable: false, except custom entities.
 */
function resetApplicability(
  entities: Record<string, EntityInstance[]>
): Record<string, EntityInstance[]> {
  const result: Record<string, EntityInstance[]> = {};
  
  for (const [entityType, instances] of Object.entries(entities)) {
    result[entityType] = instances.map(instance => {
      // Custom entities are always applicable
      if (instance.origin === 'custom') {
        return { ...instance, applicable: true };
      }
      return { ...instance, applicable: false };
    });
  }
  
  return result;
}

/**
 * Origin type for provider processing.
 */
type ProviderOrigin = 
  | { type: 'class'; classId: string; classLevel: number }
  | { type: 'characterLevel'; characterLevel: number };

/**
 * Processes system-level providers (feats, ability increases).
 */
function processSystemProviders(
  providers: EntityProvider[],
  entities: Record<string, EntityInstance[]>,
  visitedInstanceIds: Set<string>,
  characterLevel: number
): { updatedEntities: Record<string, EntityInstance[]>; providerWarnings: ResolutionWarning[] } {
  const origin: ProviderOrigin = { type: 'characterLevel', characterLevel };
  return processProvidersWithOrigin(providers, entities, visitedInstanceIds, origin);
}

/**
 * Processes class-level providers.
 */
function processClassProviders(
  providers: EntityProvider[],
  entities: Record<string, EntityInstance[]>,
  visitedInstanceIds: Set<string>,
  classId: string,
  classLevel: number
): { updatedEntities: Record<string, EntityInstance[]>; providerWarnings: ResolutionWarning[] } {
  const origin: ProviderOrigin = { type: 'class', classId, classLevel };
  return processProvidersWithOrigin(providers, entities, visitedInstanceIds, origin);
}

/**
 * Processes an array of providers, marking applicable entities.
 */
function processProvidersWithOrigin(
  providers: EntityProvider[],
  entities: Record<string, EntityInstance[]>,
  visitedInstanceIds: Set<string>,
  origin: ProviderOrigin
): { updatedEntities: Record<string, EntityInstance[]>; providerWarnings: ResolutionWarning[] } {
  let updatedEntities = entities;
  const providerWarnings: ResolutionWarning[] = [];
  
  for (const provider of providers) {
    const result = processProvider(
      provider,
      updatedEntities,
      visitedInstanceIds,
      origin
    );
    
    updatedEntities = result.updatedEntities;
    providerWarnings.push(...result.providerWarnings);
  }
  
  return { updatedEntities, providerWarnings };
}

/**
 * Processes a single provider, marking its entities as applicable.
 */
function processProvider(
  provider: EntityProvider,
  entities: Record<string, EntityInstance[]>,
  visitedInstanceIds: Set<string>,
  origin: ProviderOrigin
): { updatedEntities: Record<string, EntityInstance[]>; providerWarnings: ResolutionWarning[] } {
  let updatedEntities = entities;
  const providerWarnings: ResolutionWarning[] = [];
  
  // Collect instance IDs to mark as applicable
  const instancesToMark: string[] = [];
  
  // Granted entities: match by origin pattern
  if (provider.granted?.specificIds) {
    for (const entityId of provider.granted.specificIds) {
      // Find instance with matching origin
      const instanceId = findGrantedInstanceId(
        entities,
        entityId,
        origin
      );
      
      if (instanceId) {
        instancesToMark.push(instanceId);
      }
    }
  }
  
  // Selected entities: use selectedInstanceIds
  if (provider.selector && provider.selectedInstanceIds) {
    for (const instanceId of provider.selectedInstanceIds) {
      instancesToMark.push(instanceId);
    }
  }
  
  // Mark entities as applicable
  for (const instanceId of instancesToMark) {
    // Skip if already visited (prevents infinite loops)
    if (visitedInstanceIds.has(instanceId)) {
      continue;
    }
    
    const { found, updatedEntities: marked, instance } = markAsApplicable(
      updatedEntities,
      instanceId
    );
    
    if (!found) {
      providerWarnings.push({
        type: 'invalid_selection',
        message: `Entity instance "${instanceId}" not found in pool`,
        instanceId,
      });
      continue;
    }
    
    updatedEntities = marked;
    visitedInstanceIds.add(instanceId);
    
    // Process nested providers in the entity
    if (instance) {
      const nestedResult = processNestedProviders(
        instance,
        updatedEntities,
        visitedInstanceIds
      );
      
      updatedEntities = nestedResult.updatedEntities;
      providerWarnings.push(...nestedResult.providerWarnings);
    }
  }
  
  return { updatedEntities, providerWarnings };
}

/**
 * Builds the expected origin string based on provider origin type.
 */
function buildOriginString(origin: ProviderOrigin): string {
  if (origin.type === 'class') {
    return `classLevel:${origin.classId}-${origin.classLevel}`;
  }
  return `characterLevel:${origin.characterLevel}`;
}

/**
 * Finds the instanceId for a granted entity based on origin pattern.
 */
function findGrantedInstanceId(
  entities: Record<string, EntityInstance[]>,
  entityId: string,
  origin: ProviderOrigin
): string | undefined {
  const expectedOrigin = buildOriginString(origin);
  
  for (const instances of Object.values(entities)) {
    for (const instance of instances) {
      if (instance.entity.id === entityId && instance.origin === expectedOrigin) {
        return instance.instanceId;
      }
    }
  }
  
  return undefined;
}

/**
 * Marks an entity as applicable and returns the instance.
 */
function markAsApplicable(
  entities: Record<string, EntityInstance[]>,
  instanceId: string
): { found: boolean; updatedEntities: Record<string, EntityInstance[]>; instance?: EntityInstance } {
  let found = false;
  let foundInstance: EntityInstance | undefined;
  const updatedEntities: Record<string, EntityInstance[]> = {};
  
  for (const [entityType, instances] of Object.entries(entities)) {
    updatedEntities[entityType] = instances.map(instance => {
      if (instance.instanceId === instanceId) {
        found = true;
        foundInstance = instance;
        return { ...instance, applicable: true };
      }
      return instance;
    });
  }
  
  return { found, updatedEntities, instance: foundInstance };
}

/**
 * Processes providers nested within an entity.
 */
function processNestedProviders(
  instance: EntityInstance,
  entities: Record<string, EntityInstance[]>,
  visitedInstanceIds: Set<string>
): { updatedEntities: Record<string, EntityInstance[]>; providerWarnings: ResolutionWarning[] } {
  // Check if entity has providers
  const entityWithProviders = instance.entity as { providers?: EntityProvider[] };
  
  if (!entityWithProviders.providers || entityWithProviders.providers.length === 0) {
    return { updatedEntities: entities, providerWarnings: [] };
  }
  
  // Process each provider
  let updatedEntities = entities;
  const providerWarnings: ResolutionWarning[] = [];
  
  for (const provider of entityWithProviders.providers) {
    // For nested providers, we only process selectedInstanceIds
    // (granted entities from nested providers would need different origin handling)
    if (provider.selector && provider.selectedInstanceIds) {
      for (const selectedId of provider.selectedInstanceIds) {
        if (visitedInstanceIds.has(selectedId)) {
          continue;
        }
        
        const { found, updatedEntities: marked, instance: nestedInstance } = markAsApplicable(
          updatedEntities,
          selectedId
        );
        
        if (!found) {
          providerWarnings.push({
            type: 'invalid_selection',
            message: `Nested entity instance "${selectedId}" not found in pool`,
            instanceId: selectedId,
          });
          continue;
        }
        
        updatedEntities = marked;
        visitedInstanceIds.add(selectedId);
        
        // Recursively process nested providers
        if (nestedInstance) {
          const deepResult = processNestedProviders(
            nestedInstance,
            updatedEntities,
            visitedInstanceIds
          );
          
          updatedEntities = deepResult.updatedEntities;
          providerWarnings.push(...deepResult.providerWarnings);
        }
      }
    }
  }
  
  return { updatedEntities, providerWarnings };
}

