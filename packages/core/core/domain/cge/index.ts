/**
 * CGE (Character Generation Engine) Module
 *
 * Provides types and operations for managing character entity systems
 * like spellcasting, maneuvers, psionics, etc.
 */

// Types
export type {
  CGEConfig,
  CGEState,
  CGELabels,
  CalculatedCGE,
  CalculatedTrack,
  CalculatedSlot,
  CalculatedBoundSlot,
  CalculatedPool,
  CalculatedKnownLimit,
  KnownConfig,
  ResourceConfig,
  ResourceConfigNone,
  ResourceConfigSlots,
  ResourceConfigPool,
  PreparationConfig,
  PreparationConfigNone,
  PreparationConfigBound,
  PreparationConfigList,
  Track,
  VariablesConfig,
  EntityFilter,
  LevelTable,
  RefreshType,
  Formula,
} from './types';

export { validateCGEConfig } from './types';

// Known Entity Operations
export type { CGEUpdateResult, CGEWarning } from './knownOperations';

export {
  addKnownEntity,
  removeKnownEntity,
  getKnownEntitiesByCGE,
  getKnownEntitiesByLevel,
  getKnownCountsByLevel,
  getTotalKnownCount,
  isEntityKnown,
} from './knownOperations';

// Preparation Operations (Vancian-style)
export type {
  PreparationUpdateResult,
  PreparationWarning,
} from './preparationOperations';

export {
  prepareEntityInSlot,
  unprepareSlot,
  unprepareEntity,
  getBoundPreparations,
  getPreparedEntityInSlot,
  getPreparationsByLevel,
  isSlotPrepared,
  getPreparationCountByEntity,
  getUniquePreparedEntities,
  getTotalPreparedCount,
} from './preparationOperations';

// Slot Operations (Runtime usage)
export type { SlotUpdateResult, SlotWarning } from './slotOperations';

export {
  useSlot,
  useBoundSlot,
  refreshSlots,
  setSlotValue,
  getSlotCurrentValue,
  getAllSlotCurrentValues,
  hasUsedSlots,
} from './slotOperations';
