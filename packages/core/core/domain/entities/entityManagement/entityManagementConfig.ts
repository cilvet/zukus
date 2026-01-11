import { Formula } from '../../formulae/formula';
import type { EntityView } from './entityView';

type VisualizationPolicy = "WARN" | "STRICT";

type CapacityTable = {
  [entityLevel: number]: Formula
};

type ManagementModeUsesPerEntity = {
  type: "USES_PER_ENTITY";
  usesPerDayFormula?: Formula;
};

type ManagementModePreparedByLevel = {
  type: "PREPARED_BY_LEVEL";
  slotCapacities: CapacityTable;
  allowOvercast: boolean;
};

type ManagementModeSpontaneous = {
  type: "SPONTANEOUS";
  slotCapacities: CapacityTable;
  knownLimitPerLevel?: CapacityTable;
  allowOvercast: boolean;
};

type ManagementModeGlobalPrepared = {
  type: "GLOBAL_PREPARED";
  maxPreparedFormula: Formula;
  slotCapacities: CapacityTable;
  allowOvercast: boolean;
};

type ManagementModeAllAccess = {
  type: "ALL_ACCESS";
  slotCapacities?: CapacityTable;
  usesPerDayFormula?: Formula;
  allowOvercast?: boolean;
};

type ManagementMode =
  | ManagementModeUsesPerEntity
  | ManagementModePreparedByLevel
  | ManagementModeSpontaneous
  | ManagementModeGlobalPrepared
  | ManagementModeAllAccess;

export type EntityManagementConfig = {
  id: string; 
  entityType: string;
  levelResolution: string;
  classLevelVariable: string;
  accessSource: EntityView;
  visualizationPolicy: VisualizationPolicy;
  managementMode: ManagementMode;
};

export type {
  VisualizationPolicy,
  CapacityTable,
  ManagementMode,
  ManagementModeUsesPerEntity,
  ManagementModePreparedByLevel,
  ManagementModeSpontaneous,
  ManagementModeGlobalPrepared,
  ManagementModeAllAccess,
};
