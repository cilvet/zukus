import { CharacterBaseData, CharacterLevel, SpecialFeature } from "../baseData/character";
import { Equipment } from "../baseData/equipment";
import { CalculatedAttackData } from "./attacks/calculatedAttack";
import { CalculatedAbilities, CalculatedAbility } from "./calculatedAbilities";
import { CalculatedArmorClass } from "./calculatedArmorClass";
import { CalculatedBaseAttackBonus } from "./calculatedBaseAttackBonus";
import { CalculatedGrapple } from "./calculatedGrapple";
import { CalculatedHitPoints } from "./calculatedHitPoints";
import { CalculatedInitiative } from "./calculatedInitiative";
import { CalculatedSavingThrows } from "./calculatedSavingThrows";
import { CalculatedSize } from "./calculatedSize";
import { CalculatedSkills } from "./calculatedSkills";
import { CalculatedSpeeds } from "./calculatedSpeed";
import { ProvisionalSpells } from "./spells/provisionalSpells";
import { CustomVariable } from "./customVariables";
import { CalculatedResources } from "../baseData/resources";
import type { ComputedEntity } from "../../entities/types/base";
import { usesLegacyLevelSystem } from "../calculation/classLevels/levelSystemDetection";

/**
 * Warning generated during character calculation.
 */
export type CharacterWarning = {
  type: string;
  message: string;
  context?: Record<string, unknown>;
};

export type CharacterSheet = {
  name: string;
  hitPoints: CalculatedHitPoints;
  abilityScores: CalculatedAbilities;
  savingThrows: CalculatedSavingThrows;
  armorClass: CalculatedArmorClass;
  baseAttackBonus: CalculatedBaseAttackBonus;
  speeds: CalculatedSpeeds;
  initiative: CalculatedInitiative;
  size: CalculatedSize;
  grapple: CalculatedGrapple;
  attackData: CalculatedAttackData;
  substitutionValues: Record<string, number>;
  equipment: Equipment;
  skills: CalculatedSkills;
  level: CharacterLevel;
  specialFeatures: SpecialFeature[];
  spells?: ProvisionalSpells;
  revisionUniqueId?: string;
  customVariables: CustomVariable[];
  resources: CalculatedResources;
  /** Warnings generated during calculation */
  warnings: CharacterWarning[];
  /** Computed entities from customEntities with metadata */
  computedEntities: ComputedEntity[];
};

function getEmptyAbilityScore(abilityId: string): CalculatedAbility {
  return {
    uniqueAbilityId: abilityId,
    baseScore: 10,
    baseModifier: 0,
    totalScore: 10,
    abilityCheckScore: 10,
    totalModifier: 0,
    abilityCheckModifier: 0,
    drain: 0,
    damage: 0,
    penalty: 0,
    checkSourceVales: [],
    sourceValues: [],
    sources: [],
  };
}

const defaultValueAndSources = (value: number = 0) => ({
  totalValue: value,
  sourceValues: [],
  sources: [],
});

export function getInitialCharacterSheet(
  characterBaseData: CharacterBaseData
): CharacterSheet {
  // Calculate level based on which system is in use
  const calculatedLevel = getCalculatedLevel(characterBaseData);
  
  return {
    spells: characterBaseData.spells,
    specialFeatures: characterBaseData.specialFeatures ?? [],
    name: characterBaseData.name,
    customVariables: [],
    resources: {},
    warnings: [],
    computedEntities: [],
    abilityScores: {
      strength: getEmptyAbilityScore("strength"),
      dexterity: getEmptyAbilityScore("dexterity"),
      constitution: getEmptyAbilityScore("constitution"),
      intelligence: getEmptyAbilityScore("intelligence"),
      wisdom: getEmptyAbilityScore("wisdom"),
      charisma: getEmptyAbilityScore("charisma"),
    },
    armorClass: {
      naturalAc: {
        ...defaultValueAndSources(),
      },
      flatFootedAc: {
        ...defaultValueAndSources(10),
      },
      touchAc: {
        ...defaultValueAndSources(10),
      },
      totalAc: {
        ...defaultValueAndSources(10),
      },
    },
    baseAttackBonus: {
      baseValue: 0,
      totalValue: 0,
      multipleBaseAttackBonuses: [0],
      sources: [],
      sourceValues: [],
    },
    grapple: {
      ...defaultValueAndSources(),
    },
    initiative: {
      ...defaultValueAndSources(),
    },
    savingThrows: {
      fortitude: {
        baseValue: 0,
        ...defaultValueAndSources(),
      },
      reflex: {
        baseValue: 0,
        ...defaultValueAndSources(),
      },
      will: {
        baseValue: 0,
        ...defaultValueAndSources(),
      },
    },
    size: {
      baseSize: "MEDIUM",
      currentSize: "MEDIUM",
      numericValue: 0,
      sources: [],
      sourceValues: [],
    },
    speeds: {
      landSpeed: {
        ...defaultValueAndSources(30),
      },
    },
    hitPoints: {
      currentDamage: characterBaseData.currentDamage,
      currentHp: 0,
      maxHp: 0,
      temporaryHp: characterBaseData.temporaryHp,
      temporaryHpSources: [],
      temporaryHpSourceValues: [],
    },
    substitutionValues: {},
    equipment: characterBaseData.equipment,
    attackData: {
      attackChanges: [],
      attackContextChanges: [],
      attacks: [],
    },
    skills: {},
    level: calculatedLevel,
  };
}

/**
 * Gets the CharacterLevel object, supporting both legacy and new systems.
 * 
 * IMPORTANT: character.level.level is the source of truth for both systems.
 * The new system doesn't use levelsData.
 */
function getCalculatedLevel(characterBaseData: CharacterBaseData): CharacterLevel {
  if (usesLegacyLevelSystem(characterBaseData)) {
    return characterBaseData.level;
  }
  
  // New system: use character.level.level as source of truth
  // levelsData is not used in the new system
  return {
    level: characterBaseData.level.level,
    xp: characterBaseData.level?.xp ?? 0,
    levelsData: [], // New system doesn't use levelsData
  };
}
