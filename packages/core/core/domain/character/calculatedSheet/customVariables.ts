import { SourceValue } from "./sources";

export type CustomVariable = {
  uniqueId: string;
  name: string;
  description?: string;
  totalValue: number;
  sources: SourceValue[];
};
