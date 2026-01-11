/**
 * Apply a selection to an EntityProvider.
 * 
 * Adds an entity to the provider's entities.selected array.
 * Follows the permissive philosophy: warns but doesn't block
 * when entity doesn't meet filter criteria.
 */

import type { EntityProvider, SelectableEntity } from '../providers/types';
import type { SubstitutionIndex } from '../filtering/types';
import { filterEntitiesWithVariables } from '../filtering/filterWithVariables';

/**
 * Result of applying a selection.
 */
export type ApplySelectionResult<T extends SelectableEntity = SelectableEntity> = {
  /** The updated provider with the new selection */
  provider: EntityProvider<T>;
  
  /** Non-blocking warnings (e.g., entity doesn't meet filter criteria) */
  warnings: string[];
  
  /** Blocking errors (e.g., max selections exceeded) */
  errors: string[];
};

/**
 * Applies a selection to an EntityProvider.
 * 
 * @param provider - The provider to update
 * @param entity - The entity to add to selections
 * @param allEntities - All available entities (for validation)
 * @param variables - Current variable values for filter evaluation
 * @returns Result with updated provider, warnings, and errors
 * 
 * @example
 * ```typescript
 * const result = applySelection(provider, powerAttackFeat, allFeats, { characterLevel: 5 });
 * if (result.errors.length === 0) {
 *   // Selection was successful (though may have warnings)
 *   const updatedProvider = result.provider;
 * }
 * ```
 */
export function applySelection<T extends SelectableEntity>(
  provider: EntityProvider<T>,
  entity: T,
  allEntities: T[],
  variables: SubstitutionIndex
): ApplySelectionResult<T> {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Must have a selector to apply selections
  if (!provider.selector) {
    return {
      provider,
      warnings: [],
      errors: ['Provider has no selector configuration'],
    };
  }
  
  const selector = provider.selector;
  const currentSelected = provider.entities?.selected || [];
  const currentCount = currentSelected.length;
  
  // Check if already selected
  const alreadySelected = currentSelected.some(e => e.id === entity.id);
  if (alreadySelected) {
    return {
      provider,
      warnings: [],
      errors: [`Entity '${entity.id}' is already selected`],
    };
  }
  
  // Check max constraint
  if (currentCount >= selector.max) {
    return {
      provider,
      warnings: [],
      errors: [`Maximum selections (${selector.max}) already reached`],
    };
  }
  
  // Check if entity meets filter criteria (if filter exists)
  if (selector.filter) {
    const filterResults = filterEntitiesWithVariables(
      [entity],
      [selector.filter],
      variables
    );
    
    // For strict policy, check if entity is in results
    // For permissive, it's always in results but may not match
    const entityResult = filterResults.find(r => r.entity.id === entity.id);
    
    if (!entityResult) {
      // Entity was filtered out (strict mode)
      warnings.push(`Entity '${entity.id}' does not meet filter criteria (filtered out)`);
    } else if (!entityResult.matches) {
      // Entity doesn't match but was included (permissive mode)
      warnings.push(`Entity '${entity.id}' does not meet filter criteria`);
    }
  }
  
  // Check if entity is in entityIds list (if specified)
  if (selector.entityIds && selector.entityIds.length > 0) {
    if (!selector.entityIds.includes(entity.id)) {
      warnings.push(`Entity '${entity.id}' is not in the allowed entity IDs list`);
    }
  }
  
  // Check entityType constraint (if specified)
  if (selector.entityType && entity.entityType !== selector.entityType) {
    warnings.push(`Entity '${entity.id}' has type '${entity.entityType}' but selector expects '${selector.entityType}'`);
  }
  
  // Add the entity to selections
  const updatedProvider: EntityProvider<T> = {
    ...provider,
    entities: {
      granted: provider.entities?.granted || [],
      selected: [...currentSelected, entity],
    },
  };
  
  return {
    provider: updatedProvider,
    warnings,
    errors,
  };
}
