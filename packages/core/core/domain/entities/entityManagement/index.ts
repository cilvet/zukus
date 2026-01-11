/**
 * Entity Management System - Sistema de Gestión de Entidades Accionables (CGE)
 * 
 * Este módulo exporta los tipos y funciones para el sistema CGE.
 */

// Entity View
export type { EntityView, EntityFilter } from './entityView';

// Configuration (immutable)
export type {
  EntityManagementConfig,
  VisualizationPolicy,
  CapacityTable,
  ManagementMode,
  ManagementModeUsesPerEntity,
  ManagementModePreparedByLevel,
  ManagementModeSpontaneous,
  ManagementModeGlobalPrepared,
  ManagementModeAllAccess,
} from './entityManagementConfig';

// State (mutable)
export type {
  EntityManagementState,
  SlotsByLevelState,
  UsesPerEntityState,
  IneligibleEntity,
  KnownEntitiesState,
  PreparedByLevelState,
  GlobalPreparedState,
  DailyResetPolicy,
} from './entityManagementState';

export { getDefaultResetPolicy } from './entityManagementState';

