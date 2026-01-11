import { gorwin } from "../../../data/characters/gorwin";
import { sigmar } from "../../../data/characters/sigmar";
import { CharacterBaseData } from "../../domain/character/baseData/character";

export function classLevelsToString(character: CharacterBaseData): string {
  // Create a map to count levels per class
  const classLevels = new Map<string, number>();

  // Count levels for each class
  character.level.levelsData.forEach(levelData => {
    const currentCount = classLevels.get(levelData.classUniqueId) || 0;
    classLevels.set(levelData.classUniqueId, currentCount + 1);
  });

  // Convert to string format "Class1 N1 / Class2 N2 / ..."
  const parts = Array.from(classLevels.entries()).map(([classId, levels]) => {
    return `${classId} ${levels}`;
  });

  return parts.join(" / ");
}

export function classLevelsNames(character: CharacterBaseData): string[] {
  const classLevels = new Map<string, number>();

  character.level.levelsData.forEach(levelData => {
    const currentCount = classLevels.get(levelData.classUniqueId) || 0;
    classLevels.set(levelData.classUniqueId, currentCount + 1);
  });

  const parts = Array.from(classLevels.entries()).map(([classId, levels]) => {
    const className = character.classes.find(c => c.uniqueId === classId)?.name || classId;
    return `${className} ${levels}`;
  });

  return parts;

}