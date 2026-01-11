/**
 * Character Updater Operations
 * 
 * Funciones puras para actualizar datos del personaje.
 * Todas las funciones siguen el patrón:
 * - Reciben CharacterBaseData
 * - Devuelven OperationResult con el personaje actualizado y warnings
 */

// Types
export type { OperationResult, OperationWarning } from '../types';

// Buff operations
export {
  toggleBuff,
  addBuff,
  editBuff,
  deleteBuff,
  toggleSharedBuff,
} from './buffOperations';

// Item operations
export {
  addItem,
  removeItem,
  updateItem,
  toggleItemEquipped,
  updateEquipment,
} from './itemOperations';

// HP operations
export {
  modifyHp,
} from './hpOperations';

// Resource operations
export {
  consumeResource,
  rechargeResource,
  rechargeAllResources,
} from './resourceOperations';

// Special feature operations
export {
  addSpecialFeature,
  updateSpecialFeature,
  removeSpecialFeature,
  setSpecialFeatures,
} from './specialFeatureOperations';

// Character property operations
export {
  setName,
  setTheme,
} from './characterPropertyOperations';

// Re-export operations from levels updater
export {
  // Types
  type CompendiumContext,
  type ProviderLocation,
  type UpdateResult as LevelsUpdateResult,
  type UpdateWarning as LevelsUpdateWarning,
  
  // Level Slots
  setLevelSlotClass,
  setLevelSlotHp,
  addLevelSlot,
  removeLastLevelSlot,
  getCharacterLevel,
  getClassLevel,
  
  // Class Operations
  addClass,
  removeClass,
  
  // Entity Operations
  editEntity,
  createCustomEntity,
  deleteEntity,
  getEntity,
  getEntitiesByType,
  getApplicableEntitiesByType,
  
  // Selection Operations
  updateProviderSelection,
  getProvider,
} from '../../../levels/updater';

