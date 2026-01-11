/**
 * Types for the suppression system
 * 
 * Suppression allows entities to suppress other entities.
 * This is typically used for:
 * - Archetypes replacing base class features
 * - Mutually exclusive abilities (e.g., barbarian totems)
 */

// Re-export entity types for convenience
export type { 
  Entity, 
  SuppressingFields,
  SuppressionScope,
  SuppressionConfig,
  StandardEntity 
} from '../../entities/types/base';

// =============================================================================
// Suppression Info
// =============================================================================

/**
 * Information about why an entity is suppressed.
 */
export type SuppressionInfo = {
  /** ID of the entity that caused the suppression */
  suppressedById: string;
  
  /** How the suppression was determined */
  method: 'id' | 'filter';
  
  /** Human-readable reason (from SuppressionConfig.reason) */
  reason?: string;
};

// =============================================================================
// Suppression Result
// =============================================================================

/**
 * Result of calculating suppressions.
 * Maps suppressed entity ID to suppression info.
 */
export type SuppressionResult = Map<string, SuppressionInfo>;
