/**
 * Level System Detection
 * 
 * Functions to determine which level system a character uses
 * and to get class levels from either system.
 * 
 * IMPORTANT: The new level system uses character.level.level as the source of truth
 * for the current level. All functions that iterate over levelSlots must respect
 * this value and only process slots up to (currentLevel - 1) index.
 */

import type { CharacterBaseData } from '../../baseData/character';
import type { ClassEntity, LevelSlot } from '../../../levels/storage/types';

// =============================================================================
// System Detection
// =============================================================================

/**
 * Determines if a character should use the legacy level system.
 * 
 * Returns true if:
 * - useLegacyLevelSystem is explicitly true
 * - OR the character has no new level system data (levelSlots/classEntities)
 * 
 * Returns false if:
 * - The character has levelSlots or classEntities AND useLegacyLevelSystem is not true
 */
export function usesLegacyLevelSystem(character: CharacterBaseData): boolean {
  // Explicit flag takes precedence
  if (character.useLegacyLevelSystem === true) {
    return true;
  }
  
  // Check if character has new level system data
  const hasLevelSlots = character.levelSlots && character.levelSlots.length > 0;
  const hasClassEntities = character.classEntities && Object.keys(character.classEntities).length > 0;
  
  // Use new system if either levelSlots or classEntities exist
  if (hasLevelSlots || hasClassEntities) {
    return false;
  }
  
  // Default to legacy system for characters without any new system data
  return true;
}

/**
 * Gets the current level from character data.
 * This is the source of truth for both systems.
 */
export function getCurrentLevel(character: CharacterBaseData): number {
  return character.level.level;
}

/**
 * Gets levelSlots limited to the current level.
 * Only returns slots from index 0 to (currentLevel - 1).
 */
export function getActiveLevelSlots(character: CharacterBaseData): LevelSlot[] {
  if (!character.levelSlots) {
    return [];
  }
  
  const currentLevel = getCurrentLevel(character);
  return character.levelSlots.slice(0, currentLevel);
}

// =============================================================================
// Class Levels from New System
// =============================================================================

/**
 * Gets class levels from levelSlots (new system).
 * 
 * Only counts slots up to the current level.
 * Counts how many slots are assigned to each class.
 */
export function getClassLevelsFromLevelSlots(
  levelSlots: LevelSlot[],
  currentLevel: number
): Record<string, number> {
  const classLevels: Record<string, number> = {};
  const slotsToProcess = levelSlots.slice(0, currentLevel);
  
  for (const slot of slotsToProcess) {
    if (slot.classId !== null) {
      classLevels[slot.classId] = (classLevels[slot.classId] || 0) + 1;
    }
  }
  
  return classLevels;
}

/**
 * Gets the hit die for a class from classEntities.
 */
export function getClassHitDie(
  classEntities: Record<string, ClassEntity>,
  classId: string
): number {
  const classEntity = classEntities[classId];
  if (!classEntity) {
    return 8; // Default hit die
  }
  return classEntity.hitDie;
}

/**
 * Gets hit points data from levelSlots (new system).
 * 
 * Only processes slots up to the current level.
 * Returns an array of { classId, hpRoll, hitDie } for each level.
 */
export type LevelSlotHpData = {
  classId: string;
  hpRoll: number;
  hitDie: number;
};

export function getHpDataFromLevelSlots(
  levelSlots: LevelSlot[],
  classEntities: Record<string, ClassEntity>,
  currentLevel: number
): LevelSlotHpData[] {
  const hpData: LevelSlotHpData[] = [];
  const slotsToProcess = levelSlots.slice(0, currentLevel);
  
  for (const slot of slotsToProcess) {
    if (slot.classId !== null && slot.hpRoll !== null) {
      const hitDie = getClassHitDie(classEntities, slot.classId);
      hpData.push({
        classId: slot.classId,
        hpRoll: slot.hpRoll,
        hitDie,
      });
    }
  }
  
  return hpData;
}

/**
 * Calculates the total rolled hit dice from levelSlots.
 * Only processes slots up to the current level.
 */
export function getTotalRolledHpFromLevelSlots(
  levelSlots: LevelSlot[],
  classEntities: Record<string, ClassEntity>,
  currentLevel: number
): number {
  const hpData = getHpDataFromLevelSlots(levelSlots, classEntities, currentLevel);
  return hpData.reduce((total, data) => total + data.hpRoll, 0);
}

// =============================================================================
// Class Progressions from New System
// =============================================================================

/**
 * Converts new system save progression to legacy SaveType.
 */
export function convertSaveProgression(progression: 'good' | 'poor'): 'GOOD' | 'POOR' {
  if (progression === 'good') {
    return 'GOOD';
  }
  return 'POOR';
}

/**
 * Converts new system BAB progression to legacy BabType.
 */
export function convertBabProgression(progression: 'full' | 'medium' | 'poor'): 'GOOD' | 'AVERAGE' | 'POOR' {
  if (progression === 'full') {
    return 'GOOD';
  }
  if (progression === 'medium') {
    return 'AVERAGE';
  }
  return 'POOR';
}

/**
 * Gets class information needed for saving throw calculation from classEntities (new system).
 * Only considers levels up to the current level.
 */
export type ClassSaveInfo = {
  classId: string;
  level: number;
  fortitude: 'GOOD' | 'POOR';
  reflex: 'GOOD' | 'POOR';
  will: 'GOOD' | 'POOR';
};

export function getClassSaveInfoFromNewSystem(
  levelSlots: LevelSlot[],
  classEntities: Record<string, ClassEntity>,
  currentLevel: number
): ClassSaveInfo[] {
  const classLevels = getClassLevelsFromLevelSlots(levelSlots, currentLevel);
  const result: ClassSaveInfo[] = [];
  
  for (const [classId, level] of Object.entries(classLevels)) {
    const classEntity = classEntities[classId];
    if (!classEntity) {
      // Default to poor saves if class not found
      result.push({
        classId,
        level,
        fortitude: 'POOR',
        reflex: 'POOR',
        will: 'POOR',
      });
      continue;
    }
    
    result.push({
      classId,
      level,
      fortitude: convertSaveProgression(classEntity.saves.fortitude),
      reflex: convertSaveProgression(classEntity.saves.reflex),
      will: convertSaveProgression(classEntity.saves.will),
    });
  }
  
  return result;
}

/**
 * Gets class information needed for BAB calculation from classEntities (new system).
 * Only considers levels up to the current level.
 */
export type ClassBabInfo = {
  classId: string;
  level: number;
  babProgression: 'GOOD' | 'AVERAGE' | 'POOR';
};

export function getClassBabInfoFromNewSystem(
  levelSlots: LevelSlot[],
  classEntities: Record<string, ClassEntity>,
  currentLevel: number
): ClassBabInfo[] {
  const classLevels = getClassLevelsFromLevelSlots(levelSlots, currentLevel);
  const result: ClassBabInfo[] = [];
  
  for (const [classId, level] of Object.entries(classLevels)) {
    const classEntity = classEntities[classId];
    if (!classEntity) {
      // Default to poor BAB if class not found
      result.push({
        classId,
        level,
        babProgression: 'POOR',
      });
      continue;
    }
    
    result.push({
      classId,
      level,
      babProgression: convertBabProgression(classEntity.babProgression),
    });
  }
  
  return result;
}

