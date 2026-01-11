/**
 * Functions for managing level slots in character data.
 * 
 * Level slots represent each level the character has gained.
 * Each slot can be assigned to a class and stores the HP roll for that level.
 */

import type { CharacterBaseData } from '../../character/baseData/character';
import type { LevelSlot } from '../storage/types';
import type { UpdateResult, UpdateWarning } from './types';

// =============================================================================
// Set Level Slot Class
// =============================================================================

/**
 * Sets the class for a level slot.
 * 
 * @param character - The character data to update
 * @param slotIndex - The index of the level slot (0 = level 1, 1 = level 2, etc.)
 * @param classId - The class ID to assign, or null to unassign
 * @returns Updated character data with warnings
 * 
 * Note: This only updates the levelSlots array. It does NOT:
 * - Add the class to classEntities (use addClass for that)
 * - Resolve entities from the class
 * - Update the applicable flags
 * 
 * The level resolution phase handles entity applicability.
 */
export function setLevelSlotClass(
  character: CharacterBaseData,
  slotIndex: number,
  classId: string | null
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  // Initialize levelSlots if needed
  const levelSlots = character.levelSlots ? [...character.levelSlots] : [];
  
  // Ensure array has enough slots
  while (levelSlots.length <= slotIndex) {
    levelSlots.push({ classId: null, hpRoll: null });
  }
  
  // Validate classId exists in classEntities (if not null)
  if (classId !== null) {
    const classExists = character.classEntities && character.classEntities[classId];
    if (!classExists) {
      warnings.push({
        type: 'class_not_found',
        message: `Class "${classId}" not found in character.classEntities. Add it first with addClass.`,
        entityId: classId,
      });
    }
  }
  
  // Update the slot
  levelSlots[slotIndex] = {
    ...levelSlots[slotIndex],
    classId,
  };
  
  return {
    character: {
      ...character,
      levelSlots,
    },
    warnings,
  };
}

// =============================================================================
// Set Level Slot HP
// =============================================================================

/**
 * Sets the HP roll for a level slot.
 * 
 * @param character - The character data to update
 * @param slotIndex - The index of the level slot (0 = level 1, 1 = level 2, etc.)
 * @param hpRoll - The HP roll result for this level
 * @returns Updated character data with warnings
 */
export function setLevelSlotHp(
  character: CharacterBaseData,
  slotIndex: number,
  hpRoll: number
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  // Initialize levelSlots if needed
  const levelSlots = character.levelSlots ? [...character.levelSlots] : [];
  
  // Ensure array has enough slots
  while (levelSlots.length <= slotIndex) {
    levelSlots.push({ classId: null, hpRoll: null });
  }
  
  // Update the slot
  levelSlots[slotIndex] = {
    ...levelSlots[slotIndex],
    hpRoll,
  };
  
  return {
    character: {
      ...character,
      levelSlots,
    },
    warnings,
  };
}

// =============================================================================
// Add Level Slot
// =============================================================================

/**
 * Adds a new level slot at the end.
 * 
 * @param character - The character data to update
 * @param slot - The level slot to add (defaults to empty slot)
 * @returns Updated character data
 */
export function addLevelSlot(
  character: CharacterBaseData,
  slot: LevelSlot = { classId: null, hpRoll: null }
): UpdateResult {
  const levelSlots = character.levelSlots ? [...character.levelSlots] : [];
  levelSlots.push(slot);
  
  return {
    character: {
      ...character,
      levelSlots,
    },
    warnings: [],
  };
}

// =============================================================================
// Remove Level Slot
// =============================================================================

/**
 * Removes the last level slot.
 * 
 * @param character - The character data to update
 * @returns Updated character data with warnings
 * 
 * Note: This only removes the slot. Entity cleanup based on
 * class level changes happens during level resolution.
 */
export function removeLastLevelSlot(
  character: CharacterBaseData
): UpdateResult {
  const warnings: UpdateWarning[] = [];
  
  if (!character.levelSlots || character.levelSlots.length === 0) {
    warnings.push({
      type: 'invalid_index',
      message: 'No level slots to remove',
    });
    return { character, warnings };
  }
  
  const levelSlots = character.levelSlots.slice(0, -1);
  
  return {
    character: {
      ...character,
      levelSlots,
    },
    warnings,
  };
}

// =============================================================================
// Get Character Level
// =============================================================================

/**
 * Gets the total character level from levelSlots.
 * Only counts slots with a classId assigned.
 */
export function getCharacterLevel(character: CharacterBaseData): number {
  if (!character.levelSlots) {
    return 0;
  }
  
  return character.levelSlots.filter(slot => slot.classId !== null).length;
}

/**
 * Gets the level in a specific class from levelSlots.
 */
export function getClassLevel(character: CharacterBaseData, classId: string): number {
  if (!character.levelSlots) {
    return 0;
  }
  
  return character.levelSlots.filter(slot => slot.classId === classId).length;
}

