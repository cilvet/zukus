import { CharacterSkillData, SkillData, Skills } from "./skills";
import { Race } from "./race";
import { CharacterClass } from "../../class/class";
import { ClassFeature } from "../../class/classFeatures";
import { Feat } from "./features/feats/feat";
import { BaseAbilitiesData } from "./abilities";
import { Equipment as Equipment } from "./equipment";
import { HitDie } from "./hitDie";
import { Buff } from "./buffs";
import { ProvisionalSpells } from "../calculatedSheet/spells/provisionalSpells";
import { Change } from "./changes";
import { ContextualChange } from "./contextualChange";
import { SpecialChange } from "./specialChanges";
import { Resource } from "../../spells/resources";
import type { StandardEntity } from "../../entities/types/base";
import type { EntityInstance, LevelSlot, ClassEntity, SystemLevelsEntity } from "../../levels/storage/types";

/**
 * Alineamiento del personaje en D&D 3.5.
 * Combinacion de eje ley/caos y bien/mal.
 */
export type Alignment = {
  lawChaos: 'lawful' | 'neutral' | 'chaotic';
  goodEvil: 'good' | 'neutral' | 'evil';
};

export type SpecialFeature = {
  uniqueId: string;
  title: string;
  description: string;
  changes?: Change[];
  contextualChanges?: ContextualChange[];
  specialChanges?: SpecialChange[];
  resources?: Resource[];
}

// Persistent resource data stored in character base data
export type ResourceCurrentValues = {
  [resourceId: string]: {
    currentValue: number;
  }
}

export type CharacterBaseData = {
  name: string;
  customCurrentHp?: number;
  temporaryHp: number;
  currentDamage: number;
  currentTemporalHp: number;
  baseAbilityData: BaseAbilitiesData;
  skills: Skills; // skill that the character has available. Can be modified (eg. change the ability modifier used)
  skillData: CharacterSkillData; // ranks and Changes for each skill. Ranks are calculated with level data in strict mode, or can be modified in simplified mode
  classes: CharacterClass[]; // classes that the character has. The character needs to have at least one level in a class to save it
  level: CharacterLevel; // Extracted from classes and saved separately. Also, levels can be edited without editing the classes.
  race?: Race;
  equipment: Equipment;
  feats: Feat[];
  buffs: Buff[];
  sharedBuffs: Buff[];
  specialFeatures?: SpecialFeature[];
  spells?: ProvisionalSpells;
  theme?: string;
  updatedAt: string;
  pinnedSkills?: string[];
  resourceCurrentValues?: ResourceCurrentValues;
  /** IDs of active compendiums for this character */
  activeCompendiums?: string[];
  /** Custom entities organized by entityType */
  customEntities?: Record<string, StandardEntity[]>;

  // ==========================================================================
  // Character Description Fields
  // ==========================================================================

  /** Character description/notes */
  description?: string;
  /** Character alignment (null = no alignment) */
  alignment?: Alignment | null;

  // Physical characteristics
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  eyes?: string;
  hair?: string;
  skin?: string;

  // Background
  deity?: string;
  /** Character backstory (multiline) */
  background?: string;
  
  // ==========================================================================
  // New Level System (coexists with legacy system above)
  // ==========================================================================
  
  /**
   * Central pool of entity instances.
   * Keyed by entityType (e.g., "classFeature", "feat").
   * Each entity has an instanceId, applicable flag, and origin.
   */
  entities?: Record<string, EntityInstance[]>;
  
  /**
   * Classes added to the character (copied from compendium).
   * Keyed by class ID (e.g., "rogue", "fighter").
   * Contains provider selections (selectedInstanceIds).
   */
  classEntities?: Record<string, ClassEntity>;
  
  /**
   * Level slots for character progression.
   * Index 0 = level 1, index 1 = level 2, etc.
   * Each slot references a class and stores HP roll.
   */
  levelSlots?: LevelSlot[];
  
  /**
   * System-level progressions (feats, ability increases).
   * Copied from compendium, contains user selections.
   * Processed before class providers during resolution.
   */
  systemLevelsEntity?: SystemLevelsEntity;
  
  /**
   * If true, forces the use of the legacy level system (levelsData).
   * If false or undefined, the system will use the new level system
   * when levelSlots/classEntities are present.
   */
  useLegacyLevelSystem?: boolean;
};

export type CharacterLevel = {
  level: number;
  xp: number;
  levelsData: CharacterLevelData[];
};

export type CharacterLevelData = {
  classUniqueId: string;
  level: number;
  hitDie: HitDie;
  hitDieRoll: number;
  levelClassFeatures: ClassFeature[];
  levelFeats: Feat[];
  permanentIntelligenceStatAtLevel: number;
};

