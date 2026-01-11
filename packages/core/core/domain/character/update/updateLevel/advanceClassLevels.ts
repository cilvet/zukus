import { CharacterClass, ClassLevel } from "../../../class/class";
import {
  CharacterBaseData,
  CharacterLevelData,
} from "../../baseData/character";
import { getClassLevels } from "../../calculation/classLevels/calculateCharacterClassLevels";

export function advanceClassLevels(
  characterData: CharacterBaseData,
  characterClass: CharacterClass,
  levelsToAdd: number,
  hitDieRolls: number[],
  maxFirstDice: boolean = true
): CharacterBaseData {
  const hasClass = characterData.classes.find(
    (charClass) => charClass.uniqueId === characterClass.uniqueId
  );
  if (!hasClass) {
    characterData.classes.push(characterClass);
  }

  const allClassLevels = getClassLevels(characterData);
  const classLevels = allClassLevels[characterClass.uniqueId];

  const levelsArray = Array(levelsToAdd).fill(0);

  levelsArray.forEach((_, index) => {
    const level = characterData.level.level + 1;
    const classLevel = ((classLevels || 0) + index + 1) || 1;
    const isFirstLevel = characterData.level.level === 0;
    let hitDieRoll = hitDieRolls[index];
    if (isFirstLevel && maxFirstDice) {
      hitDieRoll = characterClass.hitDie;
    }

    characterData.level.levelsData.push(
      {
        classUniqueId: characterClass.uniqueId,
        hitDie: characterClass.hitDie,
        hitDieRoll: hitDieRoll,
        level: level,
        levelClassFeatures: characterClass.levels[classLevel - 1]?.classFeatures ?? [],
        levelFeats: [],
        permanentIntelligenceStatAtLevel: 0,
      }
    );
    characterData.level.level += 1;
  });

  return characterData;
}