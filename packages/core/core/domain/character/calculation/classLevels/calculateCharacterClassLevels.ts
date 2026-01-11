import { CharacterBaseData } from "../../baseData/character";
import { getCurrentLevelsData } from "./getCurrentLevelsData";
import { usesLegacyLevelSystem, getClassLevelsFromLevelSlots, getCurrentLevel } from "./levelSystemDetection";

/**
 * Gets class levels for the character.
 * 
 * Uses the new level system (levelSlots) if available,
 * otherwise falls back to the legacy system (levelsData).
 * 
 * IMPORTANT: Only counts levels up to character.level.level
 */
export function getClassLevels(characterBaseData: CharacterBaseData): {
  [classId: string]: number;
} {
  if (usesLegacyLevelSystem(characterBaseData)) {
    return getClassLevelsLegacy(characterBaseData);
  }
  
  const currentLevel = getCurrentLevel(characterBaseData);
  return getClassLevelsFromLevelSlots(characterBaseData.levelSlots || [], currentLevel);
}

/**
 * Gets class levels from the legacy system (levelsData).
 */
function getClassLevelsLegacy(characterBaseData: CharacterBaseData): {
  [classId: string]: number;
} {
  const levelsData = getCurrentLevelsData(characterBaseData);
  return levelsData.reduce((acc, levelData) => {
    const classId = levelData.classUniqueId;
    const currentLevel = acc[classId] || 0;
    return {
      ...acc,
      [classId]: currentLevel + 1,
    };
  }, {} as { [classId: string]: number });
}
