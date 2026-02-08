/**
 * Functions for managing provider selections in character data.
 * 
 * Provider selections are stored as instanceIds in the provider's
 * selectedInstanceIds array.
 */

import type { CharacterBaseData } from '../../character/baseData/character';
import type { ClassEntity, ClassLevelRow, SystemLevelRow, RaceEntity, RaceLevelRow } from '../storage/types';
import type { EntityProvider } from '../providers/types';
import type { ProviderLocation, UpdateResult, UpdateWarning } from './types';

// =============================================================================
// Update Provider Selection
// =============================================================================

/**
 * Updates the selection for a provider.
 * 
 * @param character - The character data to update
 * @param location - Where the provider is located
 * @param selectedInstanceIds - The new set of selected instance IDs
 * @returns Updated character data with warnings
 * 
 * This is a declarative update - it replaces the entire selection.
 * The caller is responsible for providing the complete new state.
 */
export function updateProviderSelection(
  character: CharacterBaseData,
  location: ProviderLocation,
  selectedInstanceIds: string[]
): UpdateResult {
  if (location.type === 'classLevel') {
    return updateClassLevelProviderSelection(
      character,
      location.classId,
      location.classLevel,
      location.providerIndex,
      selectedInstanceIds
    );
  }
  
  if (location.type === 'systemLevel') {
    return updateSystemLevelProviderSelection(
      character,
      location.characterLevel,
      location.providerIndex,
      selectedInstanceIds
    );
  }

  if (location.type === 'raceLevel') {
    return updateRaceLevelProviderSelection(
      character,
      location.raceLevel,
      location.providerIndex,
      selectedInstanceIds
    );
  }

  return updateEntityProviderSelection(
    character,
    location.parentInstanceId,
    location.providerIndex,
    selectedInstanceIds
  );
}

// =============================================================================
// Class Level Provider Selection
// =============================================================================

/**
 * Updates selection in a class level provider.
 */
function updateClassLevelProviderSelection(
  character: CharacterBaseData,
  classId: string,
  classLevel: number,
  providerIndex: number,
  selectedInstanceIds: string[]
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  // Get class
  if (!character.classEntities || !character.classEntities[classId]) {
    warnings.push({
      type: 'class_not_found',
      message: `Class "${classId}" not found in character`,
      entityId: classId,
    });
    return { character, warnings };
  }
  
  const classEntity = character.classEntities[classId];
  const levelKey = String(classLevel);
  
  // Get level row
  if (!classEntity.levels[levelKey]) {
    warnings.push({
      type: 'provider_not_found',
      message: `Level ${classLevel} not found in class "${classId}"`,
    });
    return { character, warnings };
  }
  
  const levelRow = classEntity.levels[levelKey];
  
  // Get provider
  if (!levelRow.providers || providerIndex >= levelRow.providers.length) {
    warnings.push({
      type: 'provider_not_found',
      message: `Provider index ${providerIndex} not found in class "${classId}" level ${classLevel}`,
    });
    return { character, warnings };
  }
  
  // Update provider
  const updatedProviders = levelRow.providers.map((provider, index) => {
    if (index === providerIndex) {
      return {
        ...provider,
        selectedInstanceIds,
      };
    }
    return provider;
  });
  
  const updatedLevelRow: ClassLevelRow = {
    ...levelRow,
    providers: updatedProviders,
  };
  
  const updatedClass: ClassEntity = {
    ...classEntity,
    levels: {
      ...classEntity.levels,
      [levelKey]: updatedLevelRow,
    },
  };
  
  return {
    character: {
      ...character,
      classEntities: {
        ...character.classEntities,
        [classId]: updatedClass,
      },
    },
    warnings,
  };
}

// =============================================================================
// System Level Provider Selection
// =============================================================================

/**
 * Updates selection in a system level provider.
 */
function updateSystemLevelProviderSelection(
  character: CharacterBaseData,
  characterLevel: number,
  providerIndex: number,
  selectedInstanceIds: string[]
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  // Get system levels entity
  if (!character.systemLevelsEntity) {
    warnings.push({
      type: 'system_levels_not_found',
      message: 'No system levels entity in character',
    });
    return { character, warnings };
  }
  
  const systemLevelsEntity = character.systemLevelsEntity;
  const levelKey = String(characterLevel);
  
  // Get level row
  if (!systemLevelsEntity.levels[levelKey]) {
    warnings.push({
      type: 'provider_not_found',
      message: `Character level ${characterLevel} not found in system levels`,
    });
    return { character, warnings };
  }
  
  const levelRow = systemLevelsEntity.levels[levelKey];
  
  // Get provider
  if (!levelRow.providers || providerIndex >= levelRow.providers.length) {
    warnings.push({
      type: 'provider_not_found',
      message: `Provider index ${providerIndex} not found in system level ${characterLevel}`,
    });
    return { character, warnings };
  }
  
  // Update provider
  const updatedProviders = levelRow.providers.map((provider, index) => {
    if (index === providerIndex) {
      return {
        ...provider,
        selectedInstanceIds,
      };
    }
    return provider;
  });
  
  const updatedLevelRow: SystemLevelRow = {
    ...levelRow,
    providers: updatedProviders,
  };
  
  const updatedSystemLevels = {
    ...systemLevelsEntity,
    levels: {
      ...systemLevelsEntity.levels,
      [levelKey]: updatedLevelRow,
    },
  };
  
  return {
    character: {
      ...character,
      systemLevelsEntity: updatedSystemLevels,
    },
    warnings,
  };
}

// =============================================================================
// Race Level Provider Selection
// =============================================================================

/**
 * Updates selection in a race level provider.
 */
function updateRaceLevelProviderSelection(
  character: CharacterBaseData,
  raceLevel: number,
  providerIndex: number,
  selectedInstanceIds: string[]
): UpdateResult {
  const warnings: UpdateWarning[] = [];

  // Get race entity
  if (!character.raceEntity) {
    warnings.push({
      type: 'race_not_found',
      message: 'No race entity in character',
    });
    return { character, warnings };
  }

  const raceEntity = character.raceEntity;
  const levelKey = String(raceLevel);

  // Get level row
  if (!raceEntity.levels[levelKey]) {
    warnings.push({
      type: 'provider_not_found',
      message: `Race level ${raceLevel} not found in race entity`,
    });
    return { character, warnings };
  }

  const levelRow = raceEntity.levels[levelKey];

  // Get provider
  if (!levelRow.providers || providerIndex >= levelRow.providers.length) {
    warnings.push({
      type: 'provider_not_found',
      message: `Provider index ${providerIndex} not found in race level ${raceLevel}`,
    });
    return { character, warnings };
  }

  // Update provider
  const updatedProviders = levelRow.providers.map((provider, index) => {
    if (index === providerIndex) {
      return {
        ...provider,
        selectedInstanceIds,
      };
    }
    return provider;
  });

  const updatedLevelRow: RaceLevelRow = {
    ...levelRow,
    providers: updatedProviders,
  };

  const updatedRace: RaceEntity = {
    ...raceEntity,
    levels: {
      ...raceEntity.levels,
      [levelKey]: updatedLevelRow,
    },
  };

  return {
    character: {
      ...character,
      raceEntity: updatedRace,
    },
    warnings,
  };
}

// =============================================================================
// Entity Provider Selection
// =============================================================================

/**
 * Updates selection in an entity's provider.
 */
function updateEntityProviderSelection(
  character: CharacterBaseData,
  parentInstanceId: string,
  providerIndex: number,
  selectedInstanceIds: string[]
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  if (!character.entities) {
    warnings.push({
      type: 'entity_not_found',
      message: `Entity "${parentInstanceId}" not found - no entities in character`,
      entityId: parentInstanceId,
    });
    return { character, warnings };
  }
  
  // Find and update the entity
  let found = false;
  const entities: Record<string, typeof character.entities[string]> = {};
  
  for (const [entityType, instances] of Object.entries(character.entities)) {
    entities[entityType] = instances.map(instance => {
      if (instance.instanceId !== parentInstanceId) {
        return instance;
      }
      
      found = true;
      
      // Get entity providers (assuming StandardEntity has providers)
      const entity = instance.entity as { providers?: EntityProvider[] };
      
      if (!entity.providers || providerIndex >= entity.providers.length) {
        warnings.push({
          type: 'provider_not_found',
          message: `Provider index ${providerIndex} not found in entity "${parentInstanceId}"`,
        });
        return instance;
      }
      
      const updatedProviders = entity.providers.map((provider, index) => {
        if (index === providerIndex) {
          return {
            ...provider,
            selectedInstanceIds,
          };
        }
        return provider;
      });
      
      return {
        ...instance,
        entity: {
          ...instance.entity,
          providers: updatedProviders,
        },
      };
    });
  }
  
  if (!found) {
    warnings.push({
      type: 'entity_not_found',
      message: `Entity "${parentInstanceId}" not found in character`,
      entityId: parentInstanceId,
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
// Get Provider
// =============================================================================

/**
 * Gets a provider by location.
 */
export function getProvider(
  character: CharacterBaseData,
  location: ProviderLocation
): EntityProvider | undefined {
  if (location.type === 'classLevel') {
    const classEntity = character.classEntities?.[location.classId];
    if (!classEntity) {
      return undefined;
    }
    
    const levelRow = classEntity.levels[String(location.classLevel)];
    return levelRow?.providers?.[location.providerIndex];
  }
  
  if (location.type === 'systemLevel') {
    const systemLevelsEntity = character.systemLevelsEntity;
    if (!systemLevelsEntity) {
      return undefined;
    }

    const levelRow = systemLevelsEntity.levels[String(location.characterLevel)];
    return levelRow?.providers?.[location.providerIndex];
  }

  if (location.type === 'raceLevel') {
    const raceEntity = character.raceEntity;
    if (!raceEntity) {
      return undefined;
    }

    const levelRow = raceEntity.levels[String(location.raceLevel)];
    return levelRow?.providers?.[location.providerIndex];
  }

  // Entity provider
  if (!character.entities) {
    return undefined;
  }
  
  for (const instances of Object.values(character.entities)) {
    const instance = instances.find(i => i.instanceId === location.parentInstanceId);
    if (instance) {
      const entity = instance.entity as { providers?: EntityProvider[] };
      return entity.providers?.[location.providerIndex];
    }
  }
  
  return undefined;
}

