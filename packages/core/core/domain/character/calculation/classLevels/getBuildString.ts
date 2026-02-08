import type { CharacterBaseData } from '../../baseData/character';
import { getClassLevels } from './calculateCharacterClassLevels';
import { usesLegacyLevelSystem } from './levelSystemDetection';

/**
 * Returns a human-readable build summary for a character.
 *
 * Examples: "Fighter 5 / Wizard 3", "Rogue 1", null (no classes)
 *
 * Works with both the new level system (levelSlots + classEntities)
 * and the legacy system (level.levelsData + classes).
 */
export function getBuildString(character: CharacterBaseData): string | null {
  const classLevels = getClassLevels(character);
  const entries = Object.entries(classLevels);

  if (entries.length === 0) return null;

  const isLegacy = usesLegacyLevelSystem(character);

  const parts = entries.map(([classId, level]) => {
    const name = isLegacy
      ? character.classes?.find((c) => c.uniqueId === classId)?.name
      : character.classEntities?.[classId]?.name;
    return `${name || classId} ${level}`;
  });

  return parts.join(' / ');
}
