/**
 * CharacterUpdater module
 * 
 * Provides functions to update character data for the new level system.
 * All functions are pure - they take character data and return new character data.
 */

// Types
export type {
  CompendiumContext,
  ProviderLocation,
  UpdateResult,
  UpdateWarning,
} from './types';

// Level Slots
export {
  setLevelSlotClass,
  setLevelSlotHp,
  addLevelSlot,
  removeLastLevelSlot,
  getCharacterLevel,
  getClassLevel,
} from './levelSlots';

// Class Operations
export {
  addClass,
  removeClass,
} from './classOperations';

// System Level Operations
export {
  setSystemLevels,
  removeSystemLevels,
} from './systemLevelOperations';

// Entity Operations
export {
  editEntity,
  createCustomEntity,
  deleteEntity,
  getEntity,
  getEntitiesByType,
  getApplicableEntitiesByType,
} from './entityOperations';

// Selection Operations
export {
  updateProviderSelection,
  getProvider,
} from './selectionOperations';

// Entity Selection API
export {
  selectEntityInProvider,
  deselectEntityFromProvider,
  getSelectedEntityInstances,
  generateInstanceId,
  generateOrigin,
} from './entitySelectionApi';

export type {
  SelectionResult,
  DeselectionResult,
} from './entitySelectionApi';

