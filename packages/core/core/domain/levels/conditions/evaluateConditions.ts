/**
 * Evaluate conditions against character state
 * 
 * This module provides functionality to evaluate an array of Condition objects
 * against a ConditionContext. All conditions must pass for the result to be true
 * (AND logic).
 * 
 * Supports two condition types:
 * - `simple`: Numeric comparison between formulas
 * - `has_entity`: Check if character has specific entities
 */

import type { 
  Condition, 
  SimpleCondition, 
  HasEntityCondition, 
  ConditionContext,
  ConditionEntity 
} from '../../character/baseData/conditions';
import type { SubstitutionIndex } from '../filtering/types';
import type { EntityPropertyCondition } from '../filtering/types';
import { substituteExpression } from '../../formulae/formula';

// =============================================================================
// Simple Condition Evaluation
// =============================================================================

/**
 * Evaluates a comparison between two numeric values.
 */
function evaluateComparison(
  leftValue: string,
  operator: string,
  rightValue: string
): boolean {
  const left = parseFloat(leftValue);
  const right = parseFloat(rightValue);

  // If either value is not a valid number, the comparison fails
  if (isNaN(left) || isNaN(right)) {
    return false;
  }

  switch (operator) {
    case '==':
      return left === right;
    case '!=':
      return left !== right;
    case '<':
      return left < right;
    case '>':
      return left > right;
    case '<=':
      return left <= right;
    case '>=':
      return left >= right;
    default:
      return false;
  }
}

/**
 * Evaluates a simple condition (numeric comparison).
 */
function evaluateSimpleCondition(
  condition: SimpleCondition,
  variables: SubstitutionIndex
): boolean {
  const leftValue = substituteExpression(condition.firstFormula, variables);
  const rightValue = substituteExpression(condition.secondFormula, variables);

  return evaluateComparison(leftValue, condition.operator, rightValue);
}

// =============================================================================
// Has Entity Condition Evaluation
// =============================================================================

/**
 * Gets a nested value from an object using dot notation.
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  
  return current;
}

/**
 * Evaluates a single EntityPropertyCondition against an entity.
 */
function evaluateEntityPropertyCondition(
  entity: ConditionEntity,
  condition: EntityPropertyCondition
): boolean {
  const actualValue = condition.field 
    ? getNestedValue(entity, condition.field)
    : undefined;
  const expectedValue = condition.value;
  
  switch (condition.operator) {
    case '==':
      return actualValue === expectedValue;
    
    case '!=':
      return actualValue !== expectedValue;
    
    case '>':
      return typeof actualValue === 'number' && typeof expectedValue === 'number' && actualValue > expectedValue;
    
    case '<':
      return typeof actualValue === 'number' && typeof expectedValue === 'number' && actualValue < expectedValue;
    
    case '>=':
      return typeof actualValue === 'number' && typeof expectedValue === 'number' && actualValue >= expectedValue;
    
    case '<=':
      return typeof actualValue === 'number' && typeof expectedValue === 'number' && actualValue <= expectedValue;
    
    case 'contains':
      if (Array.isArray(actualValue)) {
        return actualValue.includes(expectedValue);
      }
      if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
        return actualValue.includes(expectedValue);
      }
      return false;
    
    case 'in':
      if (Array.isArray(expectedValue)) {
        return expectedValue.includes(actualValue);
      }
      return false;
    
    default:
      return false;
  }
}

/**
 * Checks if an entity matches all filter conditions.
 */
function entityMatchesFilter(
  entity: ConditionEntity,
  filter: EntityPropertyCondition[]
): boolean {
  for (const condition of filter) {
    if (!evaluateEntityPropertyCondition(entity, condition)) {
      return false;
    }
  }
  return true;
}

/**
 * Evaluates a has_entity condition.
 */
function evaluateHasEntityCondition(
  condition: HasEntityCondition,
  characterEntities: ConditionEntity[]
): boolean {
  // Find matching entities
  const matchingEntities = characterEntities.filter(entity => {
    // Check entityId if specified
    if (condition.entityId && entity.id !== condition.entityId) {
      return false;
    }
    
    // Check entityType if specified
    if (condition.entityType && entity.entityType !== condition.entityType) {
      return false;
    }
    
    // Check filter if specified
    if (condition.filter && condition.filter.length > 0) {
      if (!entityMatchesFilter(entity, condition.filter)) {
        return false;
      }
    }
    
    return true;
  });
  
  const count = matchingEntities.length;
  
  // Check count requirements
  if (condition.count) {
    if (condition.count.min !== undefined && count < condition.count.min) {
      return false;
    }
    if (condition.count.max !== undefined && count > condition.count.max) {
      return false;
    }
  } else {
    // Default: at least one matching entity required
    if (count === 0) {
      return false;
    }
  }
  
  return true;
}

// =============================================================================
// Single Condition Evaluation
// =============================================================================

/**
 * Evaluates a single condition against the provided context.
 */
function evaluateSingleCondition(
  condition: Condition,
  context: ConditionContext
): boolean {
  if (condition.type === 'simple') {
    // Cast to SubstitutionIndex - string values will be converted to 0 by substituteExpression
    const numericVariables = Object.fromEntries(
      Object.entries(context.variables).map(([k, v]) => [k, typeof v === 'number' ? v : 0])
    ) as SubstitutionIndex;
    return evaluateSimpleCondition(condition, numericVariables);
  }
  
  if (condition.type === 'has_entity') {
    const entities = context.characterEntities ?? [];
    return evaluateHasEntityCondition(condition, entities);
  }
  
  // Unknown condition type
  return false;
}

// =============================================================================
// Main Function
// =============================================================================

/**
 * Evaluates an array of conditions against the provided context.
 * 
 * All conditions must pass for the result to be true (AND logic).
 * If conditions is undefined or empty, returns true (no requirements = always passes).
 * 
 * @param conditions - Array of conditions to evaluate, or undefined
 * @param context - Context with variables and optionally character entities
 * @returns true if all conditions pass, false otherwise
 * 
 * @example
 * ```typescript
 * // Simple condition (numeric comparison)
 * const simpleConditions: Condition[] = [
 *   {
 *     type: 'simple',
 *     firstFormula: '@character.bab',
 *     operator: '>=',
 *     secondFormula: '6',
 *   },
 * ];
 * 
 * const result = evaluateConditions(simpleConditions, { 
 *   variables: { 'character.bab': 8 } 
 * });
 * // result === true
 * 
 * // Has entity condition
 * const entityConditions: Condition[] = [
 *   {
 *     type: 'has_entity',
 *     entityId: 'power-attack',
 *   },
 * ];
 * 
 * const result2 = evaluateConditions(entityConditions, {
 *   variables: {},
 *   characterEntities: [{ id: 'power-attack', entityType: 'feat' }],
 * });
 * // result2 === true
 * ```
 */
export function evaluateConditions(
  conditions: Condition[] | undefined,
  context: ConditionContext
): boolean {
  // No conditions = always passes
  if (!conditions || conditions.length === 0) {
    return true;
  }

  // All conditions must pass (AND logic)
  for (const condition of conditions) {
    if (!evaluateSingleCondition(condition, context)) {
      return false;
    }
  }

  return true;
}

// =============================================================================
// Backwards Compatibility
// =============================================================================

/**
 * @deprecated Use evaluateConditions with ConditionContext instead.
 * This overload is for backwards compatibility with code that passes
 * SubstitutionIndex directly.
 */
export function evaluateConditionsLegacy(
  conditions: Condition[] | undefined,
  variables: SubstitutionIndex
): boolean {
  return evaluateConditions(conditions, { variables });
}
