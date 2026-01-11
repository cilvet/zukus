import { CharacterBaseData } from "../../domain/character/baseData/character";
import { defaultBaseSkills } from "../../domain/character/baseData/skills";
import { regularDice } from "../../domain/rolls/dice";

export function getDefaultCharacterData(): CharacterBaseData {
  return {
    name: "Default",
    currentDamage: 0,
    updatedAt: new Date().toISOString(),
    temporaryHp: 0,
    feats: [],
    sharedBuffs: [],
    currentTemporalHp: 0,
    baseAbilityData: {
      strength: {
        baseScore: 10,
      },
      dexterity: {
        baseScore: 10,
      },
      constitution: {
        baseScore: 10,
      },
      intelligence: {
        baseScore: 10,
      },
      wisdom: {
        baseScore: 10,
      },
      charisma: {
        baseScore: 10,
      },
    },
    equipment: {
      items: [],
      money: 0,
    },
    skills: defaultBaseSkills,
    classes: [],
    level: {
      level: 0,
      xp: 0,
      levelsData: [],
    },
    skillData: {},
    buffs: [],
  };
}
