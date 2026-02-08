/**
 * Functions for managing race in character data.
 *
 * When a race is added:
 * 1. The race definition is copied from the compendium to character.raceEntity
 * 2. Entities from all levels with specificIds or closed entityIds are copied to the pool
 * 3. All copied entities start with applicable: false
 *
 * When a race is removed:
 * 1. The race is removed from character.raceEntity
 * 2. All entities with origin starting with "race:" are removed from the pool
 * 3. Entities whose origin points to removed entities are also removed (cascade)
 */

import type { CharacterBaseData } from '../../character/baseData/character';
import type { RaceEntity, EntityInstance } from '../storage/types';
import type { StandardEntity } from '../../entities/types/base';
import type { EntityProvider } from '../providers/types';
import type { CompendiumContext, UpdateResult, UpdateWarning } from './types';

// =============================================================================
// Add Race
// =============================================================================

/**
 * Adds a race to the character.
 *
 * @param character - The character data to update
 * @param raceId - The ID of the race to add
 * @param compendiumContext - Context for resolving race and entities from compendium
 * @returns Updated character data with warnings
 *
 * This function:
 * 1. Copies the race from compendium to character.raceEntity
 * 2. Resolves entities from granted.specificIds and selector.entityIds
 * 3. Adds resolved entities to character.entities pool
 * 4. All entities are created with applicable: false
 */
export function addRace(
  character: CharacterBaseData,
  raceId: string,
  compendiumContext: CompendiumContext
): UpdateResult {
  const warnings: UpdateWarning[] = [];

  // Get race from compendium
  const raceEntity = compendiumContext.getRace?.(raceId);
  if (!raceEntity) {
    warnings.push({
      type: 'race_not_found',
      message: `Race "${raceId}" not found in compendium`,
      entityId: raceId,
    });
    return { character, warnings };
  }

  // If there's an existing race, remove it first
  let updatedCharacter = character;
  if (character.raceEntity) {
    const removeResult = removeRace(character);
    updatedCharacter = removeResult.character;
    warnings.push(...removeResult.warnings);
  }

  // Resolve entities from all levels
  const { entities: newEntities, resolveWarnings } = resolveRaceEntities(
    raceEntity,
    compendiumContext
  );
  warnings.push(...resolveWarnings);

  // Merge new entities into pool
  const entities = mergeEntities(updatedCharacter.entities || {}, newEntities);

  return {
    character: {
      ...updatedCharacter,
      raceEntity: { ...raceEntity },
      entities,
    },
    warnings,
  };
}

// =============================================================================
// Remove Race
// =============================================================================

/**
 * Removes the race from the character.
 *
 * @param character - The character data to update
 * @returns Updated character data with warnings
 *
 * This function:
 * 1. Removes the race entity from character.raceEntity
 * 2. Removes all entities with origin starting with "race:"
 * 3. Cascades removal to child entities
 */
export function removeRace(
  character: CharacterBaseData
): UpdateResult {
  const warnings: UpdateWarning[] = [];

  if (!character.raceEntity) {
    warnings.push({
      type: 'race_not_found',
      message: 'No race entity in character',
    });
    return { character, warnings };
  }

  // Remove entities from race
  const entities = removeRaceEntities(character.entities || {});

  // Remove raceEntity
  const { raceEntity: _, ...rest } = character;

  return {
    character: {
      ...rest,
      entities,
    } as CharacterBaseData,
    warnings,
  };
}

// =============================================================================
// Change Race
// =============================================================================

/**
 * Changes the character's race.
 * Removes the current race and adds the new one.
 *
 * @param character - The character data to update
 * @param newRaceId - The ID of the new race
 * @param compendiumContext - Context for resolving race and entities from compendium
 * @returns Updated character data with warnings
 */
export function changeRace(
  character: CharacterBaseData,
  newRaceId: string,
  compendiumContext: CompendiumContext
): UpdateResult {
  const warnings: UpdateWarning[] = [];

  // Remove existing race if present
  let updatedCharacter = character;
  if (character.raceEntity) {
    const removeResult = removeRace(character);
    updatedCharacter = removeResult.character;
    warnings.push(...removeResult.warnings);
  }

  // Add new race
  const addResult = addRace(updatedCharacter, newRaceId, compendiumContext);
  warnings.push(...addResult.warnings);

  return {
    character: addResult.character,
    warnings,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Resolves entities from a race definition.
 * Copies entities from providers with specificIds or closed entityIds.
 */
function resolveRaceEntities(
  raceEntity: RaceEntity,
  compendiumContext: CompendiumContext
): { entities: Record<string, EntityInstance[]>; resolveWarnings: UpdateWarning[] } {
  const entities: Record<string, EntityInstance[]> = {};
  const resolveWarnings: UpdateWarning[] = [];

  // Process each level
  for (const [levelKey, levelRow] of Object.entries(raceEntity.levels)) {
    if (!levelRow.providers) {
      continue;
    }

    const raceLevel = parseInt(levelKey, 10);

    for (const provider of levelRow.providers) {
      const { resolved, warnings } = resolveProviderEntities(
        provider,
        raceEntity.id,
        raceLevel,
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
  raceId: string,
  raceLevel: number,
  compendiumContext: CompendiumContext
): { resolved: EntityInstance[]; warnings: UpdateWarning[] } {
  const resolved: EntityInstance[] = [];
  const warnings: UpdateWarning[] = [];

  const origin = `race:${raceId}-${raceLevel}`;

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

      const instanceId = `${entityId}@${raceId}-${raceLevel}`;

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
      const instanceId = `${entityId}@${raceId}-${raceLevel}-${selectorId}`;

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
  // Try common entity types for races
  const commonTypes = ['racialTrait', 'feat', 'classFeature', 'spell', 'item', 'ability'];

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
 * Removes all entities from a race and cascades to child entities.
 */
function removeRaceEntities(
  entities: Record<string, EntityInstance[]>
): Record<string, EntityInstance[]> {
  const result: Record<string, EntityInstance[]> = {};
  const removedInstanceIds = new Set<string>();

  // First pass: remove direct race entities and collect their IDs
  for (const [entityType, instances] of Object.entries(entities)) {
    const kept: EntityInstance[] = [];

    for (const instance of instances) {
      if (instance.origin.startsWith('race:')) {
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
