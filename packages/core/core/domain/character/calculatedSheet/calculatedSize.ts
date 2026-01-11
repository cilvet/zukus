import { SizeChange } from "../baseData/changes";
import { Size } from "../baseData/sizes";
import { Source, SourceValue } from "./sources";

export type CalculatedSize = {
  currentSize: Size;
  baseSize: Size;
  sources: Source<SizeChange>[];
  sourceValues: SourceValue[];
  numericValue: number;
};
