/**
 * Types for EntityProvider - abstraction for obtaining entities
 * 
 * EntityProvider unifies two ways of obtaining entities:
 * - granted: Automatically given (by specific IDs and/or filter)
 * - selector: User chooses from a set
 * 
 * Both can coexist in the same provider.
 */

import { EntityFilter, FilterResult } from '../filtering/types';

// =============================================================================
// Granted Configuration
// =============================================================================

/**
 * Configuration for automatically granted entities.
 * Both fields can coexist and are combined additively.
 */
export type GrantedConfig = {
  /** Specific entity IDs to grant */
  specificIds?: string[];
  
  /** Filter to match entities to grant */
  filter?: EntityFilter;
};

// =============================================================================
// Selector
// =============================================================================

/**
 * Base entity type for selections.
 * Entities must have at least an id.
 */
export type SelectableEntity = {
  id: string;
  entityType?: string;
  [key: string]: unknown;
};

/**
 * Configuration for user entity selection.
 * 
 * Note: User selections are persisted as instanceIds in EntityProvider.selectedInstanceIds.
 * Resolved entities are stored in EntityProvider.entities.selected during calculation.
 */
export type Selector = {
  /** Unique identifier for this selector */
  id: string;
  
  /** Display name for UI */
  name: string;
  
  /** Entity type to filter by (used with dynamic filter) */
  entityType?: string;
  
  /** Closed list of entity IDs to choose from */
  entityIds?: string[];
  
  /** Additional filter for eligible entities */
  filter?: EntityFilter;
  
  /** Minimum number of selections required */
  min: number;
  
  /** Maximum number of selections allowed */
  max: number;
};

// =============================================================================
// EntityProvider
// =============================================================================

/**
 * Resolved entities stored in a provider.
 * Separates granted from selected for clarity.
 */
export type ResolvedEntities<T = SelectableEntity> = {
  /** Entities automatically granted */
  granted: T[];
  
  /** Entities selected by the user */
  selected: T[];
};

/**
 * Abstraction for obtaining entities, either granted and/or via selection.
 * 
 * - `granted`: Entities given automatically (by IDs and/or filter)
 * - `selector`: User selection configuration
 * - `selectedInstanceIds`: Persisted user selections (instanceIds, not entity IDs)
 * - `entities`: Resolved entities (populated during character resolution)
 * 
 * Both granted and selector can coexist in the same provider.
 */
export type EntityProvider<T = SelectableEntity> = {
  /** Configuration for automatically granted entities */
  granted?: GrantedConfig;
  
  /** Configuration for user selection */
  selector?: Selector;
  
  /**
   * Persisted user selections as instanceIds.
   * These reference EntityInstance entries in the character's entity pool.
   * Only relevant when selector is defined.
   */
  selectedInstanceIds?: string[];
  
  /** 
   * Resolved entities (populated during resolution).
   * Contains both granted and selected entities.
   */
  entities?: ResolvedEntities<T>;
};

// =============================================================================
// Resolution Result
// =============================================================================

/**
 * Warning about an issue during resolution (non-blocking).
 */
export type ResolutionWarning = {
  /** Type of warning */
  type: 'entity_not_found' | 'invalid_filter' | 'invalid_provider' | 'empty_provider';
  
  /** Human-readable message */
  message: string;
  
  /** Related entity ID if applicable */
  entityId?: string;
};

/**
 * Result of resolving granted entities.
 */
export type GrantedResolutionResult<T> = {
  /** Entities that were granted */
  entities: T[];
  
  /** Warnings encountered during resolution */
  warnings: ResolutionWarning[];
};

/**
 * Result of resolving a selector.
 */
export type SelectorResolutionResult<T> = {
  /** The selector configuration */
  selector: Selector;
  
  /** Eligible entities with their filter results */
  eligibleEntities: FilterResult<T>[];
  
  /** Warnings encountered during resolution */
  warnings: ResolutionWarning[];
};

/**
 * Result of resolving an EntityProvider.
 */
export type ProviderResolutionResult<T> = {
  /** Result of granted resolution (if provider has granted config) */
  granted?: GrantedResolutionResult<T>;
  
  /** Result of selector resolution (if provider has selector config) */
  selector?: SelectorResolutionResult<T>;
  
  /** Top-level warnings (e.g., empty provider) */
  warnings: ResolutionWarning[];
};
