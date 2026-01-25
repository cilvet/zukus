/**
 * Functions for managing prepared entities in CGE (Vancian-style).
 *
 * These functions handle preparation type BOUND, where entities
 * are prepared into specific slots.
 *
 * Philosophy: The system does NOT restrict - it only warns.
 * Users can prepare entities they don't know, but will see warnings.
 */

import type { CharacterBaseData } from '../character/baseData/character';
import type { CGEState } from './types';

// =============================================================================
// Types
// =============================================================================

export type PreparationUpdateResult = {
  character: CharacterBaseData;
  warnings: PreparationWarning[];
};

export type PreparationWarning = {
  type:
    | 'cge_not_found'
    | 'entity_not_known'
    | 'slot_out_of_bounds'
    | 'slot_already_prepared'
    | 'slot_not_prepared';
  message: string;
  cgeId?: string;
  entityId?: string;
  slotLevel?: number;
  slotIndex?: number;
};

// =============================================================================
// Slot ID Helpers
// =============================================================================

/**
 * Generates a slot ID for bound preparations.
 * Format: "{level}-{index}" (e.g., "1-0" for first level 1 slot)
 */
function generateSlotId(level: number, index: number): string {
  return `${level}-${index}`;
}

/**
 * Parses a slot ID into level and index.
 */
function parseSlotId(slotId: string): { level: number; index: number } | null {
  const parts = slotId.split('-');
  if (parts.length !== 2) return null;

  const level = parseInt(parts[0], 10);
  const index = parseInt(parts[1], 10);

  if (isNaN(level) || isNaN(index)) return null;
  return { level, index };
}

// =============================================================================
// Prepare Entity in Slot
// =============================================================================

/**
 * Prepares an entity in a specific slot (Vancian-style).
 *
 * @param character - The character data to update
 * @param cgeId - The CGE to prepare in (e.g., "wizard-spells")
 * @param slotLevel - The level of the slot (e.g., 1 for a level 1 spell slot)
 * @param slotIndex - The index of the slot at that level (0-based)
 * @param entityId - The entity ID to prepare
 * @returns Updated character data with warnings
 *
 * Note: This does NOT check if the entity is known or if the slot exists.
 * Those checks happen during calculation, following the "warn, don't restrict" philosophy.
 */
export function prepareEntityInSlot(
  character: CharacterBaseData,
  cgeId: string,
  slotLevel: number,
  slotIndex: number,
  entityId: string
): PreparationUpdateResult {
  const warnings: PreparationWarning[] = [];
  const slotId = generateSlotId(slotLevel, slotIndex);

  // Get or initialize CGE state
  const cgeState = character.cgeState ?? {};
  const thisCGEState = cgeState[cgeId] ?? {};
  const boundPreparations = thisCGEState.boundPreparations ?? {};

  // Check if slot already has a preparation (info warning, not blocking)
  if (boundPreparations[slotId]) {
    warnings.push({
      type: 'slot_already_prepared',
      message: `Slot ${slotId} already has entity "${boundPreparations[slotId]}" prepared. Replacing with "${entityId}".`,
      cgeId,
      entityId,
      slotLevel,
      slotIndex,
    });
  }

  // Prepare the entity in the slot
  const updatedCGEState: CGEState = {
    ...thisCGEState,
    boundPreparations: {
      ...boundPreparations,
      [slotId]: entityId,
    },
  };

  return {
    character: {
      ...character,
      cgeState: {
        ...cgeState,
        [cgeId]: updatedCGEState,
      },
    },
    warnings,
  };
}

// =============================================================================
// Unprepare Slot
// =============================================================================

/**
 * Removes the preparation from a specific slot.
 *
 * @param character - The character data to update
 * @param cgeId - The CGE to unprepare from
 * @param slotLevel - The level of the slot
 * @param slotIndex - The index of the slot at that level
 * @returns Updated character data with warnings
 */
export function unprepareSlot(
  character: CharacterBaseData,
  cgeId: string,
  slotLevel: number,
  slotIndex: number
): PreparationUpdateResult {
  const warnings: PreparationWarning[] = [];
  const slotId = generateSlotId(slotLevel, slotIndex);

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
  if (!thisCGEState?.boundPreparations) {
    warnings.push({
      type: 'slot_not_prepared',
      message: `Slot ${slotId} in CGE "${cgeId}" is not prepared`,
      cgeId,
      slotLevel,
      slotIndex,
    });
    return { character, warnings };
  }

  const boundPreparations = thisCGEState.boundPreparations;
  if (!boundPreparations[slotId]) {
    warnings.push({
      type: 'slot_not_prepared',
      message: `Slot ${slotId} in CGE "${cgeId}" is not prepared`,
      cgeId,
      slotLevel,
      slotIndex,
    });
    return { character, warnings };
  }

  // Remove the preparation
  const { [slotId]: removed, ...remainingPreparations } = boundPreparations;

  const updatedCGEState: CGEState = {
    ...thisCGEState,
    boundPreparations:
      Object.keys(remainingPreparations).length > 0
        ? remainingPreparations
        : undefined,
  };

  return {
    character: {
      ...character,
      cgeState: {
        ...cgeState,
        [cgeId]: updatedCGEState,
      },
    },
    warnings,
  };
}

// =============================================================================
// Unprepare All Instances of an Entity
// =============================================================================

/**
 * Removes all preparations of a specific entity from all slots.
 * Useful when "forgetting" an entity from the spellbook.
 *
 * @param character - The character data to update
 * @param cgeId - The CGE to unprepare from
 * @param entityId - The entity ID to unprepare everywhere
 * @returns Updated character data with warnings (includes count of removed preparations)
 */
export function unprepareEntity(
  character: CharacterBaseData,
  cgeId: string,
  entityId: string
): PreparationUpdateResult & { removedCount: number } {
  const warnings: PreparationWarning[] = [];
  let removedCount = 0;

  const cgeState = character.cgeState;
  if (!cgeState?.[cgeId]?.boundPreparations) {
    return { character, warnings, removedCount: 0 };
  }

  const boundPreparations = cgeState[cgeId].boundPreparations!;
  const updatedPreparations: Record<string, string> = {};

  for (const [slotId, preparedEntityId] of Object.entries(boundPreparations)) {
    if (preparedEntityId === entityId) {
      removedCount++;
    } else {
      updatedPreparations[slotId] = preparedEntityId;
    }
  }

  const updatedCGEState: CGEState = {
    ...cgeState[cgeId],
    boundPreparations:
      Object.keys(updatedPreparations).length > 0
        ? updatedPreparations
        : undefined,
  };

  return {
    character: {
      ...character,
      cgeState: {
        ...cgeState,
        [cgeId]: updatedCGEState,
      },
    },
    warnings,
    removedCount,
  };
}

// =============================================================================
// Query Functions
// =============================================================================

/**
 * Gets all bound preparations for a CGE.
 * Returns a record of slotId -> entityId.
 */
export function getBoundPreparations(
  character: CharacterBaseData,
  cgeId: string
): Record<string, string> {
  return character.cgeState?.[cgeId]?.boundPreparations ?? {};
}

/**
 * Gets the entity prepared in a specific slot.
 * Returns undefined if slot is not prepared.
 */
export function getPreparedEntityInSlot(
  character: CharacterBaseData,
  cgeId: string,
  slotLevel: number,
  slotIndex: number
): string | undefined {
  const slotId = generateSlotId(slotLevel, slotIndex);
  return character.cgeState?.[cgeId]?.boundPreparations?.[slotId];
}

/**
 * Gets all preparations for a specific level.
 * Returns an array of { index, entityId }.
 */
export function getPreparationsByLevel(
  character: CharacterBaseData,
  cgeId: string,
  level: number
): Array<{ index: number; entityId: string }> {
  const boundPreparations =
    character.cgeState?.[cgeId]?.boundPreparations ?? {};
  const preparations: Array<{ index: number; entityId: string }> = [];

  for (const [slotId, entityId] of Object.entries(boundPreparations)) {
    const parsed = parseSlotId(slotId);
    if (parsed && parsed.level === level) {
      preparations.push({ index: parsed.index, entityId });
    }
  }

  // Sort by index
  preparations.sort((a, b) => a.index - b.index);
  return preparations;
}

/**
 * Checks if a specific slot is prepared.
 */
export function isSlotPrepared(
  character: CharacterBaseData,
  cgeId: string,
  slotLevel: number,
  slotIndex: number
): boolean {
  const slotId = generateSlotId(slotLevel, slotIndex);
  return character.cgeState?.[cgeId]?.boundPreparations?.[slotId] !== undefined;
}

/**
 * Counts how many times an entity is prepared across all slots.
 */
export function getPreparationCountByEntity(
  character: CharacterBaseData,
  cgeId: string,
  entityId: string
): number {
  const boundPreparations =
    character.cgeState?.[cgeId]?.boundPreparations ?? {};
  let count = 0;

  for (const preparedEntityId of Object.values(boundPreparations)) {
    if (preparedEntityId === entityId) {
      count++;
    }
  }

  return count;
}

/**
 * Gets all unique entities that are prepared.
 * Returns an array of entity IDs (no duplicates).
 */
export function getUniquePreparedEntities(
  character: CharacterBaseData,
  cgeId: string
): string[] {
  const boundPreparations =
    character.cgeState?.[cgeId]?.boundPreparations ?? {};
  return [...new Set(Object.values(boundPreparations))];
}

/**
 * Gets the total count of prepared slots.
 */
export function getTotalPreparedCount(
  character: CharacterBaseData,
  cgeId: string
): number {
  const boundPreparations =
    character.cgeState?.[cgeId]?.boundPreparations ?? {};
  return Object.keys(boundPreparations).length;
}
