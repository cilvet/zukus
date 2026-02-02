export * from './types';
export * from './itemOperations';
export * from './currencies';
export * from './containerOperations';
export * from './weightCalculations';
export * from './properties';
export * from './weapons';
// Instance field helpers - only export the readonly "is*" functions to avoid conflicts
// with the state-level operations in itemOperations that have the same names
export {
  isItemEquipped,
  isItemWielded,
  isItemActive,
  // Per-item mutators (different signature from state-level ones in itemOperations):
  // Use these when you have the item and want to get a new item with updated state
  setItemEquipped as setItemInstanceEquipped,
  setItemWielded as setItemInstanceWielded,
  setItemActive as setItemInstanceActive,
  toggleItemEquipped as toggleItemInstanceEquipped,
  toggleItemWielded as toggleItemInstanceWielded,
  toggleItemActive as toggleItemInstanceActive,
} from './instanceFields';
