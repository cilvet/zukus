/**
 * Entity Variables Generator
 * 
 * Generates a variable index from an entity's properties,
 * enabling the use of @entity.property syntax in filters.
 * 
 * Supports:
 * - Primitive values (string, number, boolean)
 * - Nested objects (flattened with dot notation)
 * - Arrays (included as-is for operators like 'contains')
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Extended variable index that supports any value type.
 * 
 * This is more permissive than SubstitutionIndex (which only supports numbers)
 * because entity properties can be strings, arrays, etc.
 * 
 * The filtering system's resolveValue function handles string variable 
 * references that start with @, and the evaluateOperator function 
 * handles the actual comparison of values.
 */
export type EntityVariableIndex = Record<string, unknown>;

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_PREFIX = 'entity';
const MAX_DEPTH = 10;

// =============================================================================
// Type Guards
// =============================================================================

function isPrimitive(value: unknown): value is string | number | boolean {
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// =============================================================================
// Main Function
// =============================================================================

/**
 * Generates an EntityVariableIndex from an entity's properties.
 * 
 * This allows using @entity.property syntax in filter conditions.
 * Nested properties are flattened using dot notation.
 * 
 * @param entity - The entity to extract variables from
 * @param prefix - Optional prefix for variable names (default: 'entity')
 * @returns An EntityVariableIndex with all extractable properties
 * 
 * @example
 * ```typescript
 * const entity = { 
 *   id: 'spell-1', 
 *   level: 3, 
 *   props: { bonus: 2 } 
 * };
 * 
 * const variables = generateEntityVariables(entity);
 * // Result: {
 * //   'entity.id': 'spell-1',
 * //   'entity.level': 3,
 * //   'entity.props.bonus': 2
 * // }
 * ```
 */
export function generateEntityVariables<T extends Record<string, unknown>>(
  entity: T,
  prefix: string = DEFAULT_PREFIX
): EntityVariableIndex {
  const result: EntityVariableIndex = {};
  
  flattenObject(entity, prefix, result, 0);
  
  return result;
}

/**
 * Recursively flattens an object into an EntityVariableIndex.
 * 
 * @param obj - The object to flatten
 * @param currentPath - The current path prefix
 * @param result - The accumulator object
 * @param depth - Current recursion depth
 */
function flattenObject(
  obj: Record<string, unknown>,
  currentPath: string,
  result: EntityVariableIndex,
  depth: number
): void {
  if (depth > MAX_DEPTH) {
    return;
  }
  
  const keys = Object.keys(obj);
  
  for (const key of keys) {
    const value = obj[key];
    const fullPath = `${currentPath}.${key}`;
    
    if (value === null || value === undefined) {
      continue;
    }
    
    if (isPrimitive(value)) {
      result[fullPath] = convertToSubstitutionValue(value);
      continue;
    }
    
    if (Array.isArray(value)) {
      handleArrayValue(value, fullPath, result);
      continue;
    }
    
    if (isPlainObject(value)) {
      flattenObject(value, fullPath, result, depth + 1);
      continue;
    }
  }
}

/**
 * Converts a primitive value to a substitution-compatible value.
 * 
 * The SubstitutionIndex expects numbers, but we want to support
 * strings and booleans for comparison purposes.
 */
function convertToSubstitutionValue(value: string | number | boolean): unknown {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  return value;
}

/**
 * Handles array values, extracting useful information.
 * 
 * For arrays:
 * - Creates a .length property
 * - If array contains primitives, includes the array for 'contains' operator
 */
function handleArrayValue(
  arr: unknown[],
  path: string,
  result: EntityVariableIndex
): void {
  // Always include length
  result[`${path}.length`] = arr.length;
  
  // If array is non-empty and contains primitives, include the array itself
  if (arr.length > 0 && isPrimitive(arr[0])) {
    // Store the array for use with 'contains' and 'in' operators
    result[path] = arr;
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Merges entity variables with existing variables.
 * 
 * Entity variables have lower priority - existing variables take precedence.
 * 
 * @param entity - The entity to extract variables from
 * @param existingVariables - Existing variables that take precedence
 * @param prefix - Optional prefix for entity variable names
 * @returns Combined EntityVariableIndex
 */
export function mergeEntityVariables<T extends Record<string, unknown>>(
  entity: T,
  existingVariables: EntityVariableIndex,
  prefix: string = DEFAULT_PREFIX
): EntityVariableIndex {
  const entityVariables = generateEntityVariables(entity, prefix);
  
  return {
    ...entityVariables,
    ...existingVariables, // Existing variables take precedence
  };
}

/**
 * Gets the list of available variable paths for an entity.
 * 
 * Useful for UI autocomplete functionality.
 * 
 * @param entity - The entity to analyze
 * @param prefix - Optional prefix for variable names
 * @returns Array of available variable paths
 */
export function getEntityVariablePaths<T extends Record<string, unknown>>(
  entity: T,
  prefix: string = DEFAULT_PREFIX
): string[] {
  const variables = generateEntityVariables(entity, prefix);
  return Object.keys(variables);
}

