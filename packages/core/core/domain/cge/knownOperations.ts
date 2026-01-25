/**
 * Functions for managing known entities in CGE.
 *
 * These functions allow adding, removing, and querying entities
 * in a CGE's known pool.
 *
 * Philosophy: The system does NOT restrict - it only warns.
 * Users can add more entities than allowed, but will see warnings.
 */

import type { CharacterBaseData } from '../character/baseData/character';
import type { CGEState } from './types';
import type { StandardEntity } from '../entities/types/base';
import type { EntityInstance } from '../levels/storage/types';

// =============================================================================
// Types
// =============================================================================

export type CGEUpdateResult = {
  character: CharacterBaseData;
  warnings: CGEWarning[];
};

export type CGEWarning = {
  type: 'cge_not_found' | 'entity_already_known' | 'entity_not_found';
  message: string;
  cgeId?: string;
  entityId?: string;
};

// =============================================================================
// Add Known Entity
// =============================================================================

/**
 * Generates an instanceId for a CGE known entity.
 */
function generateCGEInstanceId(entityId: string, cgeId: string): string {
  return `${entityId}@cge:${cgeId}`;
}

/**
 * Adds an entity to the known pool of a CGE.
 *
 * @param character - The character data to update
 * @param cgeId - The CGE to add the entity to (e.g., "sorcerer-spells")
 * @param entity - The entity to add (from compendium)
 * @param entityLevel - The level of the entity (e.g., 1 for a level 1 spell)
 * @returns Updated character data with warnings
 *
 * This function:
 * 1. Adds the entity ID to `cgeState.knownSelections`
 * 2. Creates an EntityInstance in `character.entities`
 *
 * Note: This does NOT check limits - that's done during calculation.
 * The philosophy is to allow the action and warn later.
 */
export function addKnownEntity(
  character: CharacterBaseData,
  cgeId: string,
  entity: StandardEntity,
  entityLevel: number
): CGEUpdateResult {
  const warnings: CGEWarning[] = [];
  const levelKey = String(entityLevel);
  const entityId = entity.id;

  // Get or initialize CGE state
  const cgeState = character.cgeState ?? {};
  const thisCGEState = cgeState[cgeId] ?? {};
  const knownSelections = thisCGEState.knownSelections ?? {};
  const currentLevel = knownSelections[levelKey] ?? [];

  // Check if already known
  if (currentLevel.includes(entityId)) {
    warnings.push({
      type: 'entity_already_known',
      message: `Entity "${entityId}" is already known at level ${entityLevel} for CGE "${cgeId}"`,
      cgeId,
      entityId,
    });
    return { character, warnings };
  }

  // Add entity ID to knownSelections
  const updatedCGEState: CGEState = {
    ...thisCGEState,
    knownSelections: {
      ...knownSelections,
      [levelKey]: [...currentLevel, entityId],
    },
  };

  // Create EntityInstance for the entity pool
  const instanceId = generateCGEInstanceId(entityId, cgeId);
  const entityType = entity.entityType;
  const existingEntities = character.entities?.[entityType] ?? [];

  const newInstance: EntityInstance = {
    instanceId,
    entity,
    applicable: true,
    origin: `cge:${cgeId}`,
  };

  return {
    character: {
      ...character,
      cgeState: {
        ...cgeState,
        [cgeId]: updatedCGEState,
      },
      entities: {
        ...character.entities,
        [entityType]: [...existingEntities, newInstance],
      },
    },
    warnings,
  };
}

// =============================================================================
// Remove Known Entity
// =============================================================================

/**
 * Removes an entity from the known pool of a CGE.
 *
 * @param character - The character data to update
 * @param cgeId - The CGE to remove the entity from
 * @param entityId - The entity ID to remove
 * @returns Updated character data with warnings
 *
 * This function:
 * 1. Removes the entity ID from `cgeState.knownSelections`
 * 2. Removes the EntityInstance from `character.entities`
 */
export function removeKnownEntity(
  character: CharacterBaseData,
  cgeId: string,
  entityId: string
): CGEUpdateResult {
  const warnings: CGEWarning[] = [];

  const cgeState = character.cgeState;
  if (!cgeState) {
    warnings.push({
      type: 'cge_not_found',
      message: `CGE "${cgeId}" not found - no CGE state in character`,
      cgeId,
    });
    return { character, warnings };
  }

  const thisCGEState = cgeState[cgeId];
  if (!thisCGEState?.knownSelections) {
    warnings.push({
      type: 'entity_not_found',
      message: `Entity "${entityId}" not found in CGE "${cgeId}" - no known selections`,
      cgeId,
      entityId,
    });
    return { character, warnings };
  }

  // Find and remove the entity from any level in knownSelections
  let foundInSelections = false;
  const updatedKnownSelections: Record<string, string[]> = {};

  for (const [levelKey, entityIds] of Object.entries(thisCGEState.knownSelections)) {
    const filtered = entityIds.filter(id => {
      if (id === entityId) {
        foundInSelections = true;
        return false;
      }
      return true;
    });

    // Only keep non-empty levels
    if (filtered.length > 0) {
      updatedKnownSelections[levelKey] = filtered;
    }
  }

  if (!foundInSelections) {
    warnings.push({
      type: 'entity_not_found',
      message: `Entity "${entityId}" not found in CGE "${cgeId}"`,
      cgeId,
      entityId,
    });
    return { character, warnings };
  }

  const updatedCGEState: CGEState = {
    ...thisCGEState,
    knownSelections: updatedKnownSelections,
  };

  // Remove the entity instance from character.entities
  const instanceIdToRemove = generateCGEInstanceId(entityId, cgeId);
  const updatedEntities: Record<string, EntityInstance[]> = {};

  if (character.entities) {
    for (const [entityType, instances] of Object.entries(character.entities)) {
      const filtered = instances.filter(
        instance => instance.instanceId !== instanceIdToRemove
      );
      if (filtered.length > 0) {
        updatedEntities[entityType] = filtered;
      }
    }
  }

  return {
    character: {
      ...character,
      cgeState: {
        ...cgeState,
        [cgeId]: updatedCGEState,
      },
      entities: updatedEntities,
    },
    warnings,
  };
}

// =============================================================================
// Get Known Entities
// =============================================================================

/**
 * Gets all known entity IDs for a CGE, organized by level.
 */
export function getKnownEntitiesByCGE(
  character: CharacterBaseData,
  cgeId: string
): Record<string, string[]> {
  return character.cgeState?.[cgeId]?.knownSelections ?? {};
}

/**
 * Gets known entity IDs for a specific level.
 */
export function getKnownEntitiesByLevel(
  character: CharacterBaseData,
  cgeId: string,
  level: number
): string[] {
  return character.cgeState?.[cgeId]?.knownSelections?.[String(level)] ?? [];
}

/**
 * Gets the count of known entities per level for a CGE.
 * Useful for UI display (e.g., "2/3" spells known at level 1).
 */
export function getKnownCountsByLevel(
  character: CharacterBaseData,
  cgeId: string
): Record<number, number> {
  const selections = character.cgeState?.[cgeId]?.knownSelections ?? {};
  const counts: Record<number, number> = {};

  for (const [levelKey, entityIds] of Object.entries(selections)) {
    const level = parseInt(levelKey, 10);
    if (!isNaN(level)) {
      counts[level] = entityIds.length;
    }
  }

  return counts;
}

/**
 * Gets the total count of all known entities for a CGE.
 */
export function getTotalKnownCount(
  character: CharacterBaseData,
  cgeId: string
): number {
  const selections = character.cgeState?.[cgeId]?.knownSelections ?? {};
  let total = 0;

  for (const entityIds of Object.values(selections)) {
    total += entityIds.length;
  }

  return total;
}

/**
 * Checks if an entity is known in a CGE.
 */
export function isEntityKnown(
  character: CharacterBaseData,
  cgeId: string,
  entityId: string
): boolean {
  const selections = character.cgeState?.[cgeId]?.knownSelections ?? {};

  for (const entityIds of Object.values(selections)) {
    if (entityIds.includes(entityId)) {
      return true;
    }
  }

  return false;
}
