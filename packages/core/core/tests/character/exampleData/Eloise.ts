import { ChangeTypes } from "../../../domain/character/baseData/changes";
import { CharacterBaseData } from "../../../domain/character/baseData/character";
import {
  Armor,
  Cloak,
  Ring,
} from "../../../domain/character/baseData/equipment";
import { featureTypes } from "../../../domain/character/baseData/features/feature";
import { Race } from "../../../domain/character/baseData/race";
import { defaultBaseSkills } from "../../../domain/character/baseData/skills";
import { SpecialChangeTypes } from "../../../domain/character/baseData/specialChanges";
import { ClassFeature } from "../../../domain/class/classFeatures";
import { SavingThrowId } from "../../../domain/class/saves";
import {
  beltOfGiantStrength,
  beltOfPhysicalPerfection,
} from "./items/abilityBoostItems";

const races: { [key: string]: Race } = {
  human: {
    uniqueId: "human",
    name: "Human",
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
    name: "Dwarf",
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
  specialChanges: [
    {
      type: 'EXTRA_FEAT_SELECTION',
      featPoolId: "fighterFeatPool",
      amount: 1,
    },
  ],
};

const capeOfResistancePlus3: Cloak = {
  uniqueId: "capeOfResistance",
  name: "Cape of Resistance +3",
  description: "This cape grants a +3 bonus to saving throws.",
  itemType: "CLOAK",
  equipable: true,
  weight: 1,
  equipped: true,
  changes: [
    {
      type: 'SAVING_THROW',
      savingThrowUniqueId: SavingThrowId.ALL,
      formula: {
        expression: "3",
      },
      bonusTypeId: "RESISTANCE",
    },
  ],
};

const mithralChainShirtPlus2: Armor = {
  uniqueId: "mithralChainShirt",
  name: "Mithral Chain Shirt +2",
  description: "Mithral chain shirt",
  itemType: "ARMOR",
  weight: 1,
  equipped: true,
  arcaneSpellFailureChance: 0,
  armorCheckPenalty: 0,
  maxDexBonus: 6,
  baseArmorBonus: 4,
  enhancementBonus: 2,
  speed20: 20,
  speed30: 30,
  equipable: true,
  enhancements: [],
};

const ringOfProtectionPlus2: Ring = {
  uniqueId: "ringOfProtectionPlus2",
  description: "This ring grants a +2 deflection bonus to AC.",
  name: "Ring of Protection +2",
  itemType: "RING",
  weight: 1,
  equipable: true,
  equipped: true,
  changes: [
    {
      type: 'AC',
      formula: {
        expression: "2",
      },
      bonusTypeId: "DEFLECTION",
    },
  ],
};

export const EloiseBaseData: CharacterBaseData = {
  name: "Eloise",
  currentDamage: 0,
  updatedAt: new Date().toISOString(),
  temporaryHp: 0,
  buffs: [],
  currentTemporalHp: 0,
  feats: [],
  sharedBuffs: [],
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
