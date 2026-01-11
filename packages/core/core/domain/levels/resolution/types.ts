/**
 * Types for level entity resolution.
 * 
 * Level resolution is the process of determining which entities
 * are applicable based on the character's level slots and class levels.
 */

import type { EntityInstance } from '../storage/types';

// =============================================================================
// Resolution Result
// =============================================================================

/**
 * Result of level entity resolution.
 */
export type ResolutionResult = {
  /**
   * Updated entity pool with applicable flags set.
   */
  entities: Record<string, EntityInstance[]>;
  
  /**
   * Warnings encountered during resolution.
   */
  warnings: ResolutionWarning[];
};

/**
 * Warning from resolution process.
 */
export type ResolutionWarning = {
  type: 'missing_selection' | 'invalid_selection' | 'class_not_found';
  message: string;
  classId?: string;
  instanceId?: string;
};

