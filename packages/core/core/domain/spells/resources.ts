

import { SourceValue } from "../character/calculatedSheet/sources";
import { Formula } from "../formulae/formula";

export type ResourceRefreshType = 
  | 'daily'        // Refreshes on long rest/24 hours
  | 'encounter'    // Refreshes on short rest/encounter
  | 'at-will'      // No limits, always available
  | 'weekly'       // Refreshes weekly
  | 'never'        // Once used, gone forever
  | 'manual';      // Restored through specific actions/spells

export type Resource = {
  uniqueId: string;
  name: string;
  description?: string;
  image?: string;
  refreshType?: ResourceRefreshType;
  maxValue?: Formula;
  minValue?: Formula;
  initialValue?: Formula;
};

export type ComputedResource = Resource & {
  currentValue: number;
  maxValueSourceValues: SourceValue[];
  currentValueSourceValues: SourceValue[];
  minValueSourceValues: SourceValue[];
};

export type ContextualizedResource = ComputedResource & {
  context: string;
};