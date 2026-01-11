/**
 * Remove a selection from an EntityProvider.
 * 
 * Removes an entity from the provider's entities.selected array.
 * This is a simple operation that always succeeds.
 */

import type { EntityProvider, SelectableEntity } from '../providers/types';

/**
 * Removes a selection from an EntityProvider.
 * 
 * @param provider - The provider to update
 * @param entityId - The ID of the entity to remove
 * @returns A new provider with the entity removed from selected
 * 
 * @example
 * ```typescript
 * const updatedProvider = removeSelection(provider, 'power-attack');
 * ```
 */
export function removeSelection<T extends SelectableEntity>(
  provider: EntityProvider<T>,
  entityId: string
): EntityProvider<T> {
  const currentSelected = provider.entities?.selected || [];
  
  // If entity is not selected, return unchanged
  const entityIndex = currentSelected.findIndex(e => e.id === entityId);
  if (entityIndex === -1) {
    return provider;
  }
  
  // Create new selections without the removed entity
  const remainingSelected = currentSelected.filter(e => e.id !== entityId);
  
  return {
    ...provider,
    entities: {
      granted: provider.entities?.granted || [],
      selected: remainingSelected,
    },
  };
}
