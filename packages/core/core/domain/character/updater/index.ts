/**
 * Character Updater Module
 * 
 * Sistema unificado para actualizar datos del personaje.
 * Combina operaciones puras con un wrapper de estado (CharacterUpdater).
 */

// Export types
export type { OperationResult, OperationWarning } from './types';
export { success, withWarning } from './types';

// Export all operations
export * from './operations';

// Export CharacterUpdater class (to be refactored)
export { CharacterUpdater } from '../update/characterUpdater/characterUpdater';

