/**
 * Types for selection functions
 * 
 * These types support the selection system where users can
 * add/remove entities from providers and validate their choices.
 */

import type { EntityProvider, Selector, SelectableEntity } from '../providers/types';

/**
 * Re-export from applySelection for convenience
 */
export type { ApplySelectionResult } from './applySelection';

/**
 * Re-export from validateSelector for convenience
 */
export type { SelectorValidationResult } from './validateSelector';

/**
 * Re-export provider types for convenience
 */
export type { EntityProvider, Selector, SelectableEntity };
