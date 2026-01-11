import {
  BonusTypes,
  Change,
  ChangeContext,
  ChangeTypes,
} from "../baseData/changes";

export type SourceTypes = ChangeTypes;

export type Source<T extends Change = Change> = T &
  ChangeContext & {
    totalValue: number;
    unmetConditions?: boolean;
  };

export type SourceValue = {
  value: number;
  sourceUniqueId: string;
  sourceName: string;
  bonusTypeId: BonusTypes;
  relevant?: boolean;
};

export type SourceValuesByType = Record<BonusTypes, { total: number; values: SourceValue[] }>;
