/**
 * Types for CharacterUpdater operations.
 * 
 * The CharacterUpdater provides functions to modify character data
 * for the new level system.
 */

import type { CharacterBaseData } from '../../character/baseData/character';
import type { StandardEntity } from '../../entities/types/base';
import type { ClassEntity, SystemLevelsEntity, RaceEntity } from '../storage/types';

// =============================================================================
// Compendium Context
// =============================================================================

/**
 * Context for accessing compendium data during character updates.
 * Required for operations that need to resolve entities from compendiums.
 */
export type CompendiumContext = {
  /**
   * Get a class by ID from the compendium.
   */
  getClass: (classId: string) => ClassEntity | undefined;
  
  /**
   * Get a system levels entity by ID from the compendium.
   */
  getSystemLevels: (systemLevelsId: string) => SystemLevelsEntity | undefined;

  /**
   * Get a race by ID from the compendium.
   */
  getRace?: (raceId: string) => RaceEntity | undefined;
  
  /**
   * Get an entity by ID and type from the compendium.
   */
  getEntity: (entityType: string, entityId: string) => StandardEntity | undefined;
  
  /**
   * Get all entities of a type from the compendium.
   */
  getAllEntities: (entityType: string) => StandardEntity[];
};

// =============================================================================
// Provider Location
// =============================================================================

/**
 * Location of a provider for selection updates.
 * Identifies where in the character data a provider lives.
 */
export type ProviderLocation =
  | {
      type: 'classLevel';
      classId: string;
      classLevel: number;
      providerIndex: number;
    }
  | {
      type: 'systemLevel';
      characterLevel: number;
      providerIndex: number;
    }
  | {
      type: 'raceLevel';
      raceLevel: number;
      providerIndex: number;
    }
  | {
      type: 'entity';
      parentInstanceId: string;
      providerIndex: number;
    };

// =============================================================================
// Update Results
// =============================================================================

/**
 * Result of an update operation.
 * Contains the updated character data and any warnings.
 */
export type UpdateResult = {
  /** The updated character data */
  character: CharacterBaseData;
  
  /** Warnings encountered during the update (non-blocking) */
  warnings: UpdateWarning[];
};

/**
 * Warning from an update operation.
 */
export type UpdateWarning = {
  type: 'entity_not_found' | 'class_not_found' | 'system_levels_not_found' | 'race_not_found' | 'invalid_index' | 'provider_not_found';
  message: string;
  entityId?: string;
};

