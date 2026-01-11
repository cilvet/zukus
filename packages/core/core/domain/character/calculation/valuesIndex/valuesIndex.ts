import { AbilityKey, defaultAbilityIds } from "../../baseData/abilities";
import { CharacterBaseData } from "../../baseData/character";
import { sizeCategories } from "../../baseData/sizes";
import { Skills } from "../../baseData/skills";
import { getAbilityModifier } from "../abilityScores/calculateAbilityScores";
import { getTotalBaseAttackBonus, getClassLevelBaseAttackBonus } from "../baseAttackBonus/calculateBaseAttackBonus";
import { getClassLevels } from "../classLevels/calculateCharacterClassLevels";
import {
  usesLegacyLevelSystem,
  getClassBabInfoFromNewSystem,
  getCurrentLevel,
} from "../classLevels/levelSystemDetection";
import { SubstitutionIndex } from "../sources/calculateSources";
import { BabType } from "../../../class/baseAttackBonus";

export const valueIndexKeys = {
  CHARACTER_LEVEL: "level",
  CASTER_LEVEL: "casterLevel",
  CLASS_LEVEL: (classUniqueId: string) => `class.${classUniqueId}.level`,
  ABILITY_SCORE: (ability: AbilityKey) => `ability.${ability}.score`,
  SKILL_SCORE: (skill: keyof Skills) => `skills.${skill}.total`,
  SKILL_RANKS: (skill: keyof Skills) => `skills.${skill}.ranks`,
  ABILITY_SCORE_MODIFIER: (ability: AbilityKey) => `ability.${ability}.modifier`,
  DEX_SCORE: `ability.dexterity.score`,
  DEX_MODIFIER: "ability.dexterity.modifier",
  STR_SCORE: "ability.strength.score",
  STR_MODIFIER: "ability.strength.modifier",
  CON_SCORE: "ability.constitution.score",
  CON_MODIFIER: "ability.constitution.modifier",
  INT_SCORE: "ability.intelligence.score",
  INT_MODIFIER: "ability.intelligence.modifier",
  WIS_SCORE: "ability.wisdom.score",
  WIS_MODIFIER: "ability.wisdom.modifier",
  CHA_SCORE: "ability.charisma.score",
  CHA_MODIFIER: "ability.charisma.modifier",
  FORT_SAVING_THROW_BASE: "savingThrow.fort.base",
  FORT_SAVING_THROW_TOTAL: "savingThrow.fort.total",
  REF_SAVING_THROW_BASE: "savingThrow.ref.base",
  REF_SAVING_THROW_TOTAL: "savingThrow.ref.total",
  WILL_SAVING_THROW_BASE: "savingThrow.will.base",
  WILL_SAVING_THROW_TOTAL: "savingThrow.will.total",
  MELEE_ATTACK_BASE: "melee.attack.base",
  RANGED_ATTACK_BASE: "ranged.attack.base",
  GRAPPLE_BONUS: "grapple.bonus",
  BAB_BASE: "bab.base",
  BAB_TOTAL: "bab.total",
  HIT_DICE_BASE: "hd.base",
  HIT_DICE_TOTAL: "hd.total",
  CURRENT_HP: "hp.current",
  MAX_HP: "hp.max",
  CURRENT_DAMAGE: "hp.damage",
  TEMPORARY_HP: "hp.temporary",
  SIZE_BASE: "size.base",
  SIZE_TOTAL: "size.total",
  SIZE_MODIFIER: "size.modifier",
  INITIATIVE_BASE: "initiative.base",
  INITIATIVE_TOTAL: "initiative.total",
  SPEED_BASE: "speed.base",
  SPEED_TOTAL: "speed.total",
  SPEED_FLY_BASE: "speed.fly.base",
  SPEED_FLY_TOTAL: "speed.fly.total",
  SPEED_SWIM_BASE: "speed.swim.base",
  SPEED_SWIM_TOTAL: "speed.swim.total",
  SPEED_BUROW_BASE: "speed.burrow.base",
  SPEED_BUROW_TOTAL: "speed.burrow.total",
  AC_TOTAL: "ac.total",
  AC_FLAT_FOOTED: "ac.flatFooted.total",
  AC_TOUCH: "ac.touch.total",
  AC_NATURAL_BASE: "ac.natural.base",
  AC_NATURAL_TOTAL: "ac.natural.total",
  CUSTOM_VARIABLE: (variableId: string) => `customVariable.${variableId}`,
  REST_HEALING_FORMULA: "restHealingFormula",
} as const;

export function getInitialValuesIndex(
  characterBaseData: CharacterBaseData
): SubstitutionIndex {
  const valuesIndex: SubstitutionIndex = {};
  
  // Get current level (source of truth for both systems)
  const characterLevel = getCurrentLevel(characterBaseData);
  
  // Get class levels (supports both legacy and new system)
  const classLevels = getClassLevels(characterBaseData);
  Object.entries(classLevels).forEach(([classUniqueId, level]) => {
    valuesIndex[valueIndexKeys.CLASS_LEVEL(classUniqueId)] = level;
  });
  
  // Calculate BAB based on which system is in use
  let babValue: number;
  if (usesLegacyLevelSystem(characterBaseData)) {
    const BAB = getTotalBaseAttackBonus(
      classLevels,
      characterBaseData.classes,
      [],
      valuesIndex
    );
    babValue = BAB.totalValue;
  } else {
    // New system: calculate BAB from classEntities (respecting currentLevel)
    const babInfo = getClassBabInfoFromNewSystem(
      characterBaseData.levelSlots || [],
      characterBaseData.classEntities || {},
      characterLevel
    );
    babValue = babInfo.reduce((acc, info) => {
      const babType = info.babProgression as BabType;
      return acc + getClassLevelBaseAttackBonus(info.level, babType);
    }, 0);
  }
  
  valuesIndex[valueIndexKeys.CHARACTER_LEVEL] = characterLevel;
  valuesIndex[valueIndexKeys.CASTER_LEVEL] = characterLevel;
  valuesIndex[valueIndexKeys.BAB_BASE] = babValue;
  valuesIndex[valueIndexKeys.BAB_TOTAL] = babValue;
  valuesIndex[valueIndexKeys.HIT_DICE_BASE] = characterLevel;
  valuesIndex[valueIndexKeys.HIT_DICE_TOTAL] = characterLevel;

  const raceSize = characterBaseData.race?.size ?? "MEDIUM";
  valuesIndex[valueIndexKeys.SIZE_BASE] = sizeCategories[raceSize].numericValue;
  valuesIndex[valueIndexKeys.SIZE_TOTAL] = sizeCategories[raceSize].numericValue;
  valuesIndex[valueIndexKeys.SIZE_MODIFIER] = sizeCategories[raceSize].attackAndACModifier;

  Object.keys(characterBaseData.baseAbilityData).forEach((ability) => {
    valuesIndex[valueIndexKeys.ABILITY_SCORE(ability)] =
      characterBaseData.baseAbilityData[ability].baseScore;
    valuesIndex[valueIndexKeys.ABILITY_SCORE_MODIFIER(ability)] =
      getAbilityModifier(characterBaseData.baseAbilityData[ability].baseScore);
  });

  // Rest healing formula: level + constitution modifier
  const constitutionModifier = getAbilityModifier(
    characterBaseData.baseAbilityData.constitution.baseScore
  );
  valuesIndex[valueIndexKeys.REST_HEALING_FORMULA] = 
    characterLevel + constitutionModifier;

  return valuesIndex;
}
