import { CharacterBaseData } from "../../../domain/character/baseData/character";
import {
  featureTypes,
} from "../../../domain/character/baseData/features/feature";
import { Race } from "../../../domain/character/baseData/race";
import { defaultBaseSkills } from "../../../domain/character/baseData/skills";
import { SpecialChangeTypes } from "../../../domain/character/baseData/specialChanges";
import { ClassFeature } from "../../../domain/class/classFeatures";
import { beltOfGiantStrength, beltOfPhysicalPerfection } from "./items/abilityBoostItems";

const races: { [key: string]: Race } = {
  human: {
    uniqueId: "human",
    name: 'human',
    size: "MEDIUM",
    baseSpeeds: {
      landSpeed: {
        value: 30,
      },
    },
    languages: [],
    racialFeatures: [],
  },
  dwarf: {
    uniqueId: "dwarf",
    name: 'dwarf',
    size: "MEDIUM",
    baseSpeeds: {
      landSpeed: {
        value: 20,
      },
    },
    languages: [],
    racialFeatures: [],
  },
};

const extraFighterFeat: ClassFeature = {
  featureType: featureTypes.CLASS_FEATURE,
  uniqueId: "extraFighterFeat",
  name: "Extra Fighter Feat",
  description: "You can select an extra feat from the fighter feat pool.",
  specialChanges: [{
    type: 'EXTRA_FEAT_SELECTION',
    featPoolId: "fighterFeatPool",
    amount: 1,
  }],
};

export const fighter1BaseData: CharacterBaseData = {
  name: "Amparo",
  currentDamage: 0,
  temporaryHp: 0,
  buffs: [],
  currentTemporalHp: 0,
  feats: [],
  sharedBuffs: [],
  updatedAt: new Date().toISOString(),
  baseAbilityData: {
    strength: {
      baseScore: 16,
      drain: 10,
    },
    dexterity: {
      baseScore: 14,
    },
    constitution: {
      baseScore: 14,
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
    honor: {
      baseScore: 10,
    },
  },
  equipment: {
    items: [beltOfGiantStrength, beltOfPhysicalPerfection],
    money: 10,
  },
  skills: defaultBaseSkills,
  classes: [],
  level: {
    level: 1,
    xp: 0,
    levelsData: [
      {
        classUniqueId: "fighter",
        level: 1,
        hitDie: 10,
        hitDieRoll: 10,
        levelClassFeatures: [extraFighterFeat],
        levelFeats: [],
        permanentIntelligenceStatAtLevel: 10,
      },
    ],
  },
  race: races.human,
  skillData: {},
};
