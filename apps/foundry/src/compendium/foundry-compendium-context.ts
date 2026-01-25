/**
 * Compendium Context for Foundry VTT
 *
 * Provides access to D&D 3.5 classes, buffs, and entities from @zukus/core
 * for use with the level system operations.
 */

import { dnd35ExampleCompendium } from '@zukus/core';
import type { StandardEntity, ClassEntity, SystemLevelsEntity, Buff, Change } from '@zukus/core';

// Extract classes from the compendium
const classEntities = (dnd35ExampleCompendium.entities.class || []) as StandardEntity[];

// Build a map for quick access
const AVAILABLE_CLASSES: Record<string, StandardEntity> = {};
for (const cls of classEntities) {
  AVAILABLE_CLASSES[cls.id] = cls;
}

// Extract class features
const CLASS_FEATURES = (dnd35ExampleCompendium.entities.classFeature || []) as StandardEntity[];

// All feats from compendium
const FEATS = (dnd35ExampleCompendium.entities.feat || []) as StandardEntity[];

// System levels
const SYSTEM_LEVELS = (dnd35ExampleCompendium.entities.system_levels || []) as StandardEntity[];

// Buffs from compendium
const BUFF_ENTITIES = (dnd35ExampleCompendium.entities.buff || []) as StandardEntity[];

// Build a map for quick access
const AVAILABLE_BUFFS: Record<string, StandardEntity> = {};
for (const buff of BUFF_ENTITIES) {
  AVAILABLE_BUFFS[buff.id] = buff;
}

// Type for CompendiumContext (matches what ops.addClass expects)
type CompendiumContext = {
  getClass: (classId: string) => ClassEntity | undefined;
  getSystemLevels: (systemLevelsId: string) => SystemLevelsEntity | undefined;
  getEntity: (entityType: string, entityId: string) => StandardEntity | undefined;
  getAllEntities: (entityType: string) => StandardEntity[];
};

/**
 * Creates a CompendiumContext for use with level operations.
 *
 * This context provides access to:
 * - Classes: Fighter, Rogue
 * - Class Features: Rogue abilities
 * - Feats: ~40 fighter bonus feats
 * - Buffs: ~15 classic buff spells
 * - System Levels: D&D 3.5 feat/ability progression
 */
export function createFoundryCompendiumContext(): CompendiumContext {
  return {
    getClass: (classId: string) => {
      return AVAILABLE_CLASSES[classId] as ClassEntity | undefined;
    },

    getSystemLevels: (systemLevelsId: string) => {
      const found = SYSTEM_LEVELS.find((s) => s.id === systemLevelsId);
      return found as SystemLevelsEntity | undefined;
    },

    getEntity: (entityType: string, entityId: string) => {
      if (entityType === 'classFeature') {
        return CLASS_FEATURES.find((f) => f.id === entityId);
      }
      if (entityType === 'feat') {
        return FEATS.find((f) => f.id === entityId);
      }
      if (entityType === 'class') {
        return AVAILABLE_CLASSES[entityId];
      }
      if (entityType === 'buff') {
        return AVAILABLE_BUFFS[entityId];
      }
      return undefined;
    },

    getAllEntities: (entityType: string) => {
      if (entityType === 'classFeature') {
        return CLASS_FEATURES;
      }
      if (entityType === 'feat') {
        return FEATS;
      }
      if (entityType === 'class') {
        return Object.values(AVAILABLE_CLASSES);
      }
      if (entityType === 'buff') {
        return Object.values(AVAILABLE_BUFFS);
      }
      return [];
    },
  };
}

/**
 * Get list of available classes for UI display
 */
export function getAvailableClasses() {
  return Object.values(AVAILABLE_CLASSES).map((cls: any) => ({
    id: cls.id,
    name: cls.name,
    description: cls.description || '',
    hitDie: cls.hitDie || 10,
  }));
}

/**
 * Export the pre-created context for convenience
 */
export const foundryCompendiumContext = createFoundryCompendiumContext();

/**
 * Get the default system levels entity for D&D 3.5
 */
export function getSystemLevels() {
  return SYSTEM_LEVELS[0];
}

// ============================================
// Buff Functions
// ============================================

/**
 * Create a Buff object from a compendium entity.
 * Each buff instance gets a unique ID based on timestamp.
 *
 * @param entityId - ID of the buff entity in the compendium
 * @returns Buff object ready to add to a character, or undefined if not found
 */
export function createBuffFromEntity(entityId: string): Buff | undefined {
  const entity = AVAILABLE_BUFFS[entityId] as any;
  if (!entity) return undefined;

  // Use legacy_changes (from effectful addon) or changes as fallback
  const changes = entity.legacy_changes || entity.changes || [];

  return {
    uniqueId: `${entity.id}-${Date.now()}`,
    name: entity.name,
    description: entity.description,
    originType: 'buff',
    originName: entity.name,
    originUniqueId: entity.id,
    active: true,
    changes: changes as Change[],
  };
}

/**
 * Get list of available buff entities for UI display.
 */
export function getAvailableBuffs(): Array<{
  id: string;
  name: string;
  description: string;
}> {
  return BUFF_ENTITIES.map((buff: any) => ({
    id: buff.id,
    name: buff.name,
    description: buff.description,
  }));
}

/**
 * Get a buff entity by ID
 */
export function getBuffEntity(buffId: string): StandardEntity | undefined {
  return AVAILABLE_BUFFS[buffId];
}
