/**
 * Types for the extended filtering system
 * 
 * This module provides types for filtering entities with:
 * - Metadata about which conditions passed/failed
 * - Policy for strict vs permissive filtering
 * - Variable evaluation support
 */

import { SubstitutionIndex } from '../../character/calculation/sources/calculateSources';

// Re-export for convenience
export type { SubstitutionIndex };

// =============================================================================
// Filter Operators
// =============================================================================

export type FilterOperator = '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'in' | 'meets_conditions';

// =============================================================================
// Entity Property Condition
// =============================================================================

/**
 * A condition that evaluates a property of an entity.
 * 
 * Use either `field` for direct property access (common case)
 * or `jmesPath` for complex queries on nested structures (rare case).
 * 
 * One of `field` or `jmesPath` must be provided, but not both.
 */
export type EntityPropertyCondition = {
  /** Direct field access (e.g., "school", "level", "props.addedAtClassLevel") */
  field?: string;
  
  /** JMESPath expression for complex queries (e.g., "levels[?class=='wizard'].level | [0]") */
  jmesPath?: string;
  
  /** Comparison operator */
  operator: FilterOperator;
  
  /** Value to compare against */
  value: unknown;
};

// =============================================================================
// Filter Types
// =============================================================================

export type FilterLogicType = 'AND' | 'OR' | 'NOT';

/**
 * A filter that combines multiple conditions with logical operators.
 */
export type EntityFilter = {
  type: FilterLogicType;
  conditions: EntityPropertyCondition[];
  
  /** 
   * Policy for filtering:
   * - 'strict': Only return entities that match
   * - 'permissive': Return all entities with their match status
   */
  filterPolicy: 'strict' | 'permissive';
};

// =============================================================================
// Condition Evaluation Result
// =============================================================================

/**
 * Result of evaluating a single condition against an entity.
 */
export type ConditionEvaluationResult = {
  /** The original condition that was evaluated */
  condition: EntityPropertyCondition;
  
  /** Whether the condition passed */
  passed: boolean;
  
  /** The actual value found in the entity */
  actualValue: unknown;
  
  /** The expected value from the condition */
  expectedValue: unknown;
};

// =============================================================================
// Filter Result
// =============================================================================

/**
 * Result of filtering an entity, including metadata about the evaluation.
 */
export type FilterResult<T> = {
  /** The entity that was evaluated */
  entity: T;
  
  /** Whether the entity matches the filter (all conditions passed based on filter logic) */
  matches: boolean;
  
  /** Detailed results for each condition evaluated */
  evaluatedConditions: ConditionEvaluationResult[];
};

