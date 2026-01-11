/**
 * Types for entity storage in character data.
 * 
 * These types define how entities are stored in the character's base data
 * for the new level system.
 */

import type { StandardEntity, Entity, SearchableFields, TaggableFields, SourceableFields } from '../../entities/types/base';
import type { EntityProvider } from '../providers/types';

// =============================================================================
// EntityInstance
// =============================================================================

/**
 * Origin types for entity instances.
 * Indicates where an entity came from.
 */
export type EntityOrigin = 
  | `classLevel:${string}`                    // e.g., "classLevel:rogue-2"
  | `characterLevel:${number}`                // e.g., "characterLevel:4" (system-level features)
  | `entityInstance.${string}:${string}`      // e.g., "entityInstance.classFeature:combat-trick@rogue-2-rogue-talent"
  | 'custom';                                 // User-created entity

/**
 * Wrapper for an entity stored in the character's entity pool.
 * 
 * Each entity in the pool has:
 * - A unique instanceId that encodes its origin
 * - The entity data itself
 * - An `applicable` flag set during level resolution
 * - An `origin` that traces where it came from
 */
export type EntityInstance = {
  /**
   * Unique identifier for this instance.
   * Format: "{entityId}@{origin-path}"
   * 
   * Examples:
   * - "sneak-attack-1d6@rogue-1" — granted at rogue level 1
   * - "combat-trick@rogue-2-rogue-talent" — selected in rogue talent at level 2
   * - "power-attack@combat-trick@rogue-2-rogue-talent-combat-feat" — nested selection
   */
  instanceId: string;
  
  /**
   * The actual entity data.
   * Contains id, name, entityType, changes, providers, etc.
   */
  entity: StandardEntity;
  
  /**
   * Whether this entity is currently active.
   * Set to true during level resolution when the entity's provider is reached.
   * Entities with applicable: false are in the pool but not contributing changes.
   */
  applicable: boolean;
  
  /**
   * Where this entity came from.
   * Used for cleanup when removing classes or parent entities.
   * 
   * Formats:
   * - "classLevel:rogue-2" — from a class level provider
   * - "characterLevel:4" — from a system level provider (feat/ability increase)
   * - "entityInstance.classFeature:combat-trick@rogue-2-rogue-talent" — from another entity's provider
   * - "custom" — user-created
   */
  origin: string;
};

// =============================================================================
// LevelSlot
// =============================================================================

/**
 * A single level slot in the character's progression.
 * 
 * Characters have 1 slot per level (level 1 = slot 0, level 2 = slot 1, etc.)
 * Each slot can be assigned to a class and records the HP roll for that level.
 */
export type LevelSlot = {
  /**
   * The class ID for this level, or null if not yet assigned.
   * References a class in character.classes.
   */
  classId: string | null;
  
  /**
   * The HP roll result for this level, or null if not yet rolled.
   * First level typically uses max die value.
   */
  hpRoll: number | null;
};

// =============================================================================
// ClassEntity
// =============================================================================

/**
 * BAB progression types.
 */
export type BabProgression = 'full' | 'medium' | 'poor';

/**
 * Save progression types.
 */
export type SaveProgression = 'good' | 'poor';

/**
 * Save progressions for all three saves.
 */
export type SaveProgressions = {
  fortitude: SaveProgression;
  reflex: SaveProgression;
  will: SaveProgression;
};

/**
 * Class type (base or prestige).
 */
export type ClassType = 'base' | 'prestige';

/**
 * A single row in the class levels table.
 * Contains providers for that level, with selectedInstanceIds populated.
 */
export type ClassLevelRow = {
  /**
   * Providers for this level.
   * Each provider can have granted entities and/or selectors.
   * Selectors will have selectedInstanceIds populated with user choices.
   */
  providers?: EntityProvider[];
};

/**
 * A class entity as stored in the character.
 * 
 * This is a copy of the class definition from the compendium,
 * with providers containing user selections (selectedInstanceIds).
 * 
 * Note: This type mirrors the Class type from entities/examples/schemas/class.schema.ts
 * but is defined here to avoid circular dependencies and to allow future extensions
 * specific to character storage.
 */
export type ClassEntity = Entity
  & SearchableFields
  & Partial<TaggableFields>
  & Partial<SourceableFields>
  & {
    /** Always "class" for class entities */
    entityType: 'class';
    
    /** Hit die size (4, 6, 8, 10, or 12) */
    hitDie: 4 | 6 | 8 | 10 | 12;
    
    /** Base Attack Bonus progression */
    babProgression: BabProgression;
    
    /** Saving throw progressions */
    saves: SaveProgressions;
    
    /** Skill points per level (formula string, e.g., "2 + @ability.intelligence.modifier") */
    skillPointsPerLevel: string;
    
    /** IDs of class skills */
    classSkillIds: string[];
    
    /** Whether this is a base or prestige class */
    classType: ClassType;
    
    /** 
     * Levels data keyed by level number (as string).
     * Each level has providers with potential user selections.
     */
    levels: Record<string, ClassLevelRow>;
    
    /** Prerequisites (for prestige classes) */
    prerequisites?: string;
  };

// =============================================================================
// SystemLevelsEntity
// =============================================================================

/**
 * A row in the system levels table.
 * Contains providers for that character level (e.g., feats, ability increases).
 */
export type SystemLevelRow = {
  /**
   * Providers for this character level.
   * Each provider can have granted entities and/or selectors.
   * Selectors will have selectedInstanceIds populated with user choices.
   */
  providers?: EntityProvider[];
};

/**
 * System levels entity as stored in the character.
 * 
 * This entity defines system-wide level progressions that apply
 * independently of class (e.g., feat selection at levels 1,3,6,9...,
 * ability score increases at levels 4,8,12,16,20).
 * 
 * Unlike classes, there is only one system_levels entity per character,
 * and it tracks character level (not class level).
 */
export type SystemLevelsEntity = Entity
  & SearchableFields
  & Partial<TaggableFields>
  & {
    /** Always "system_levels" */
    entityType: 'system_levels';
    
    /** 
     * Levels data keyed by character level number (as string).
     * Each level has providers for system-wide features.
     * 
     * Example: {
     *   "1": { providers: [featSelector] },
     *   "3": { providers: [featSelector] },
     *   "4": { providers: [abilityIncreaseSelector] },
     *   ...
     * }
     */
    levels: Record<string, SystemLevelRow>;
  };

