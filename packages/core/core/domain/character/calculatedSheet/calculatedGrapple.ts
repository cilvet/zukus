import { Source, SourceValue } from "./sources";

export interface CalculatedGrapple {
  totalValue: number;
  sources: Source[];
  sourceValues: SourceValue[];
}
