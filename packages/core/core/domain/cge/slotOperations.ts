/**
 * Functions for managing spell slot usage in CGE.
 *
 * These functions handle runtime slot consumption during gameplay:
 * - useSlot: Spend a slot when casting a spell
 * - refreshSlots: Restore all slots (long rest)
 *
 * Philosophy: The system does NOT restrict - it only warns.
 * Users can use slots even if none remain, but will see warnings.
 */

import type { CharacterBaseData } from '../character/baseData/character';
import type { CGEState } from './types';

// =============================================================================
// Types
// =============================================================================

export type SlotUpdateResult = {
  character: CharacterBaseData;
  warnings: SlotWarning[];
};

export type SlotWarning = {
  type:
    | 'no_slots_remaining'
    | 'cge_state_not_found'
    | 'invalid_level'
    | 'slots_already_full'
    | 'slot_already_used'
    | 'slot_not_prepared';
  message: string;
  cgeId?: string;
  level?: number;
  slotId?: string;
  currentValue?: number;
};

// =============================================================================
// Use Slot
// =============================================================================

/**
 * Uses (spends) one slot of the specified level.
 *
 * @param character - The character data to update
 * @param cgeId - The CGE to use the slot from (e.g., "wizard-spells")
 * @param level - The level of the slot to use (0 for cantrips, 1-9 for spell levels)
 * @returns Updated character data with warnings
 *
 * Note: This does NOT prevent using slots when none remain.
 * Following the "warn, don't restrict" philosophy.
 */
export function useSlot(
  character: CharacterBaseData,
  cgeId: string,
  level: number
): SlotUpdateResult {
  const warnings: SlotWarning[] = [];

  if (level < 0) {
    warnings.push({
      type: 'invalid_level',
      message: `Invalid slot level: ${level}. Must be >= 0.`,
      cgeId,
      level,
    });
    return { character, warnings };
  }

  const levelKey = String(level);

  // Get or initialize CGE state
  const cgeState = character.cgeState ?? {};
  const thisCGEState = cgeState[cgeId] ?? {};
  const slotCurrentValues = thisCGEState.slotCurrentValues ?? {};

  // Get current value (undefined means we haven't used any yet, so it's at max)
  // Values are stored as negative deltas from max (e.g., -1 means "max - 1")
  const currentValue = slotCurrentValues[levelKey];
  const newValue =
    currentValue !== undefined ? currentValue - 1 : -1; // -1 means "max - 1"

  // Note: We cannot warn about "no slots remaining" here because we don't know the max.
  // The character sheet calculation will show negative current values if overspent,
  // and UI can warn based on that.

  // Update the slot value
  const updatedCGEState: CGEState = {
    ...thisCGEState,
    slotCurrentValues: {
      ...slotCurrentValues,
      [levelKey]: newValue,
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
// Use Bound Slot (for BOUND preparation)
// =============================================================================

/**
 * Uses a specific bound slot by its slotId.
 *
 * This is for BOUND preparation systems (like Cleric/Wizard in D&D 3.5)
 * where each slot is tied to a specific prepared entity.
 *
 * @param character - The character data to update
 * @param cgeId - The CGE to use the slot from
 * @param slotId - The specific slot ID (e.g., "base:1-0")
 * @returns Updated character data with warnings
 */
export function useBoundSlot(
  character: CharacterBaseData,
  cgeId: string,
  slotId: string
): SlotUpdateResult {
  const warnings: SlotWarning[] = [];

  // Get or initialize CGE state
  const cgeState = character.cgeState ?? {};
  const thisCGEState = cgeState[cgeId] ?? {};
  const usedBoundSlots = thisCGEState.usedBoundSlots ?? {};

  // Check if slot is already used
  if (usedBoundSlots[slotId]) {
    warnings.push({
      type: 'slot_already_used',
      message: `Slot "${slotId}" in CGE "${cgeId}" has already been used.`,
      cgeId,
      slotId,
    });
    return { character, warnings };
  }

  // Check if slot has a prepared entity
  const boundPreparations = thisCGEState.boundPreparations ?? {};
  if (!boundPreparations[slotId]) {
    warnings.push({
      type: 'slot_not_prepared',
      message: `Slot "${slotId}" in CGE "${cgeId}" has no prepared entity.`,
      cgeId,
      slotId,
    });
    return { character, warnings };
  }

  // Mark the slot as used
  const updatedCGEState: CGEState = {
    ...thisCGEState,
    usedBoundSlots: {
      ...usedBoundSlots,
      [slotId]: true,
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
// Refresh Slots (Long Rest)
// =============================================================================

/**
 * Refreshes all slots to their maximum values.
 *
 * Implementation note: Since the system defaults to max when slotCurrentValues
 * is undefined, we simply remove the slotCurrentValues record to achieve a full refresh.
 *
 * @param character - The character data to update
 * @param cgeId - The CGE to refresh slots for
 * @returns Updated character data with warnings
 */
export function refreshSlots(
  character: CharacterBaseData,
  cgeId: string
): SlotUpdateResult {
  const warnings: SlotWarning[] = [];

  const cgeState = character.cgeState;
  if (!cgeState?.[cgeId]) {
    warnings.push({
      type: 'cge_state_not_found',
      message: `CGE state for "${cgeId}" not found. No slots to refresh.`,
      cgeId,
    });
    return { character, warnings };
  }

  const thisCGEState = cgeState[cgeId];

  // Check if there's anything to refresh
  const hasSlotValues = !!thisCGEState.slotCurrentValues;
  const hasUsedBoundSlots = !!thisCGEState.usedBoundSlots;

  if (!hasSlotValues && !hasUsedBoundSlots) {
    warnings.push({
      type: 'slots_already_full',
      message: `All slots in CGE "${cgeId}" are already at maximum.`,
      cgeId,
    });
    return { character, warnings };
  }

  // Remove slotCurrentValues and usedBoundSlots to reset
  // (system defaults to max when undefined, and no slots used)
  const { slotCurrentValues: _, usedBoundSlots: __, ...restOfCGEState } = thisCGEState;

  const updatedCGEState: CGEState = restOfCGEState;

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
// Query Functions
// =============================================================================

/**
 * Gets the current value of a slot level.
 * Returns undefined if no slots have been used (meaning it's at max).
 */
export function getSlotCurrentValue(
  character: CharacterBaseData,
  cgeId: string,
  level: number
): number | undefined {
  return character.cgeState?.[cgeId]?.slotCurrentValues?.[String(level)];
}

/**
 * Gets all slot current values for a CGE.
 * Returns a record of level -> current value.
 */
export function getAllSlotCurrentValues(
  character: CharacterBaseData,
  cgeId: string
): Record<string, number> {
  return character.cgeState?.[cgeId]?.slotCurrentValues ?? {};
}

/**
 * Checks if any slots have been used (i.e., if slotCurrentValues exists).
 */
export function hasUsedSlots(
  character: CharacterBaseData,
  cgeId: string
): boolean {
  const slotCurrentValues =
    character.cgeState?.[cgeId]?.slotCurrentValues ?? {};
  return Object.keys(slotCurrentValues).length > 0;
}
