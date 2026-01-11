import {
  CharacterBaseData,
  CharacterLevelData,
} from "../../baseData/character";
import { usesLegacyLevelSystem, getHpDataFromLevelSlots, getCurrentLevel } from "./levelSystemDetection";

/**
 * Gets level data for the character (legacy system only).
 * 
 * This function returns the legacy CharacterLevelData array.
 * For the new level system, use specialized functions like
 * getHpDataFromLevelSlots() or access entities directly.
 */
export const getCurrentLevelsData = (
  character: CharacterBaseData
): CharacterLevelData[] => {
  const characterLevel = character.level.level;
  const levelsData = character.level.levelsData.slice(0, characterLevel);

  return levelsData;
};

/**
 * Gets the total character level.
 * 
 * IMPORTANT: character.level.level is the source of truth for both systems.
 * This function simply returns that value.
 */
export function getCharacterLevel(character: CharacterBaseData): number {
  return getCurrentLevel(character);
}

/**
 * Gets hit dice count (total number of levels), supporting both systems.
 */
export function getHitDiceCount(character: CharacterBaseData): number {
  return getCharacterLevel(character);
}

/**
 * Gets the total rolled HP from all levels, supporting both systems.
 */
export function getTotalRolledHp(character: CharacterBaseData): number {
  const currentLevel = getCurrentLevel(character);
  
  if (usesLegacyLevelSystem(character)) {
    const levelsData = getCurrentLevelsData(character);
    return levelsData.reduce((acc, levelData) => acc + levelData.hitDieRoll, 0);
  }
  
  // New system: sum hpRoll from levelSlots (up to currentLevel)
  const levelSlots = character.levelSlots || [];
  const classEntities = character.classEntities || {};
  const hpData = getHpDataFromLevelSlots(levelSlots, classEntities, currentLevel);
  return hpData.reduce((total, data) => total + data.hpRoll, 0);
}
