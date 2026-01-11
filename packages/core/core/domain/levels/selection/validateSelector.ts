/**
 * Validate an EntityProvider's selector state.
 * 
 * Checks:
 * - min/max constraints on selected entities
 * - Whether selected entities still meet filter criteria
 * - Whether selected entities are still in allowed lists
 */

import type { EntityProvider, SelectableEntity } from '../providers/types';
import type { SubstitutionIndex } from '../filtering/types';
import { filterEntitiesWithVariables } from '../filtering/filterWithVariables';

/**
 * Result of validating a selector's state.
 */
export type SelectorValidationResult = {
  /** Whether the selector is in a valid state */
  valid: boolean;
  
  /** Non-blocking warnings (e.g., entities that no longer meet filter) */
  warnings: string[];
  
  /** Blocking errors (e.g., min/max violations) */
  errors: string[];
};

/**
 * Validates an EntityProvider's selector state.
 * 
 * @param provider - The provider to validate
 * @param allEntities - All available entities (for reference)
 * @param variables - Current variable values for filter evaluation
 * @returns Validation result with valid flag, warnings, and errors
 * 
 * @example
 * ```typescript
 * const result = validateSelector(provider, allFeats, { characterLevel: 3 });
 * if (!result.valid) {
 *   console.log('Errors:', result.errors);
 * }
 * if (result.warnings.length > 0) {
 *   console.log('Warnings:', result.warnings);
 * }
 * ```
 */
export function validateSelector<T extends SelectableEntity>(
  provider: EntityProvider<T>,
  allEntities: T[],
  variables: SubstitutionIndex
): SelectorValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Must have a selector to validate
  if (!provider.selector) {
    return {
      valid: true,
      warnings: [],
      errors: [],
    };
  }
  
  const selector = provider.selector;
  const selectedEntities = provider.entities?.selected || [];
  const selectedCount = selectedEntities.length;
  
  // Check min constraint
  if (selectedCount < selector.min) {
    errors.push(`Minimum selections (${selector.min}) not met. Current: ${selectedCount}`);
  }
  
  // Check max constraint
  if (selectedCount > selector.max) {
    errors.push(`Maximum selections (${selector.max}) exceeded. Current: ${selectedCount}`);
  }
  
  // Check filter criteria for each selection
  if (selector.filter && selectedEntities.length > 0) {
    // Use strict mode to see which ones truly match
    const strictFilter = {
      ...selector.filter,
      filterPolicy: 'strict' as const,
    };
    
    const filterResults = filterEntitiesWithVariables(
      selectedEntities,
      [strictFilter],
      variables
    );
    
    const matchingIds = new Set(filterResults.map(r => r.entity.id));
    
    for (const entity of selectedEntities) {
      if (!matchingIds.has(entity.id)) {
        warnings.push(`Entity '${entity.id}' no longer meets filter criteria`);
      }
    }
  }
  
  // Check entityIds constraint
  if (selector.entityIds && selector.entityIds.length > 0) {
    const allowedIds = new Set(selector.entityIds);
    for (const entity of selectedEntities) {
      if (!allowedIds.has(entity.id)) {
        warnings.push(`Entity '${entity.id}' is not in the allowed entity IDs list`);
      }
    }
  }
  
  // Check entityType constraint
  if (selector.entityType) {
    for (const entity of selectedEntities) {
      if (entity.entityType !== selector.entityType) {
        warnings.push(
          `Entity '${entity.id}' has type '${entity.entityType}' but selector expects '${selector.entityType}'`
        );
      }
    }
  }
  
  // Check that selected entities exist in allEntities
  const allEntityIds = new Set(allEntities.map(e => e.id));
  for (const entity of selectedEntities) {
    if (!allEntityIds.has(entity.id)) {
      warnings.push(`Entity '${entity.id}' is not found in available entities`);
    }
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}
