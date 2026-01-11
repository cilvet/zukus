/**
 * Extended filtering system with variable support
 * 
 * Provides filtering capabilities with:
 * - Variable substitution (e.g., @character.bab)
 * - Detailed evaluation results (which conditions passed/failed)
 * - Policy support (strict vs permissive)
 */

import jmespath from 'jmespath';
import type {
  EntityFilter,
  EntityPropertyCondition,
  FilterResult,
  ConditionEvaluationResult,
  SubstitutionIndex,
} from './types';
import type { Condition } from '../../character/baseData/conditions';
import { evaluateConditions } from '../conditions/evaluateConditions';

// =============================================================================
// Helper: Get value from entity
// =============================================================================

/**
 * Gets a value from an entity using field path or JMESPath expression.
 */
function getValueFromEntity<T>(entity: T, condition: EntityPropertyCondition): unknown {
  if (condition.field) {
    return getFieldValue(entity, condition.field);
  }
  
  if (condition.jmesPath) {
    return jmespath.search(entity, condition.jmesPath);
  }
  
  return undefined;
}

/**
 * Gets a nested field value using dot notation (e.g., "props.addedAtClassLevel").
 */
function getFieldValue<T>(entity: T, fieldPath: string): unknown {
  const parts = fieldPath.split('.');
  let current: unknown = entity;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  
  return current;
}

// =============================================================================
// Helper: Resolve variable in value
// =============================================================================

/**
 * Resolves a value that may contain a variable reference (e.g., @character.bab).
 */
function resolveValue(value: unknown, variables: SubstitutionIndex): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  
  if (!value.startsWith('@')) {
    return value;
  }
  
  // Remove @ prefix and look up in variables
  const variablePath = value.slice(1);
  
  if (variablePath in variables) {
    return variables[variablePath];
  }
  
  // Variable not found, return undefined
  return undefined;
}

// =============================================================================
// Evaluate a single condition
// =============================================================================

/**
 * Evaluates a single condition against an entity.
 */
export function evaluateCondition<T>(
  entity: T,
  condition: EntityPropertyCondition,
  variables: SubstitutionIndex
): ConditionEvaluationResult {
  const actualValue = getValueFromEntity(entity, condition);
  const expectedValue = resolveValue(condition.value, variables);
  
  // Special handling for meets_conditions operator
  if (condition.operator === 'meets_conditions') {
    const conditions = actualValue as Condition[] | undefined;
    const passed = evaluateConditions(conditions, { variables });
    
    return {
      condition,
      passed,
      actualValue,
      expectedValue: null,
    };
  }
  
  const passed = evaluateOperator(actualValue, condition.operator, expectedValue);
  
  return {
    condition,
    passed,
    actualValue,
    expectedValue,
  };
}

/**
 * Evaluates an operator between two values.
 */
function evaluateOperator(actual: unknown, operator: string, expected: unknown): boolean {
  switch (operator) {
    case '==':
      return actual === expected;
    
    case '!=':
      return actual !== expected;
    
    case '>':
      return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
    
    case '<':
      return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
    
    case '>=':
      return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;
    
    case '<=':
      return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;
    
    case 'contains':
      if (Array.isArray(actual)) {
        return actual.includes(expected);
      }
      if (typeof actual === 'string' && typeof expected === 'string') {
        return actual.includes(expected);
      }
      return false;
    
    case 'in':
      if (Array.isArray(expected)) {
        return expected.includes(actual);
      }
      return false;
    
    default:
      return false;
  }
}

// =============================================================================
// Evaluate a filter against an entity
// =============================================================================

/**
 * Evaluates a filter against an entity, returning detailed results.
 */
function evaluateFilter<T>(
  entity: T,
  filter: EntityFilter,
  variables: SubstitutionIndex
): FilterResult<T> {
  const evaluatedConditions = filter.conditions.map(condition =>
    evaluateCondition(entity, condition, variables)
  );
  
  let matches: boolean;
  
  switch (filter.type) {
    case 'AND':
      matches = evaluatedConditions.every(result => result.passed);
      break;
    
    case 'OR':
      matches = evaluatedConditions.some(result => result.passed);
      break;
    
    case 'NOT':
      matches = evaluatedConditions.every(result => !result.passed);
      break;
    
    default:
      matches = false;
  }
  
  return {
    entity,
    matches,
    evaluatedConditions,
  };
}

// =============================================================================
// Main filtering function
// =============================================================================

/**
 * Filters entities with variable support and detailed results.
 * 
 * @param entities - The entities to filter
 * @param filters - Array of filters to apply (combined with AND logic)
 * @param variables - Variable values for substitution (e.g., { "character.bab": 6 })
 * @returns Array of FilterResults
 * 
 * @example
 * ```typescript
 * const results = filterEntitiesWithVariables(
 *   feats,
 *   [{
 *     type: 'AND',
 *     filterPolicy: 'permissive',
 *     conditions: [
 *       { field: 'requiredBab', operator: '<=', value: '@character.bab' }
 *     ]
 *   }],
 *   { 'character.bab': 6 }
 * );
 * ```
 */
export function filterEntitiesWithVariables<T>(
  entities: T[],
  filters: EntityFilter[],
  variables: SubstitutionIndex
): FilterResult<T>[] {
  if (filters.length === 0) {
    // No filters: return all entities as matching
    return entities.map(entity => ({
      entity,
      matches: true,
      evaluatedConditions: [],
    }));
  }
  
  // Determine the overall policy from the first filter
  // (all filters in a group should have the same policy)
  const policy = filters[0].filterPolicy;
  
  // Evaluate all entities against all filters
  const results: FilterResult<T>[] = [];
  
  for (const entity of entities) {
    // Evaluate entity against all filters
    const filterResults = filters.map(filter => evaluateFilter(entity, filter, variables));
    
    // Entity matches if it passes ALL filters
    const overallMatches = filterResults.every(result => result.matches);
    
    // Combine all evaluated conditions from all filters
    const allEvaluatedConditions = filterResults.flatMap(result => result.evaluatedConditions);
    
    const result: FilterResult<T> = {
      entity,
      matches: overallMatches,
      evaluatedConditions: allEvaluatedConditions,
    };
    
    // For strict policy, only include matching entities
    if (policy === 'strict') {
      if (overallMatches) {
        results.push(result);
      }
    } else {
      // Permissive: include all entities
      results.push(result);
    }
  }
  
  return results;
}

