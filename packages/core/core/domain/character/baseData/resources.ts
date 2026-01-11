import { SourceValue } from "../calculatedSheet/sources";
import { Formula } from "../../formulae/formula";

/**
 * Represents a calculated resource on the character sheet
 */
export type CalculatedResource = {
  uniqueId: string;
  name: string;
  description?: string;
  image?: string;
  
  // Current values with source tracking
  maxValue: number;
  minValue: number;
  currentValue: number;
  defaultChargesPerUse: number;
  rechargeAmount: number;
  
  // Source tracking for transparency
  maxValueSources: SourceValue[];
  minValueSources: SourceValue[];
  currentValueSources: SourceValue[];
  defaultChargesPerUseSources: SourceValue[];
  rechargeAmountSources: SourceValue[];
};

/**
 * Collection of all calculated resources for a character
 */
export type CalculatedResources = {
  [resourceId: string]: CalculatedResource;
};