import {
  BonusType,
  BonusTypes,
  BonusTypesValues,
} from "../../baseData/changes";
import {
  SourceValuesByType,
  Source,
  SourceValue,
} from "../../calculatedSheet/sources";

export function sumSourceValues(sourceValues: SourceValuesByType): number {
  return Object.values(sourceValues).reduce(
    (acc, sourceValue) => acc + sourceValue.total,
    0
  );
}

export type SourceValueSum = {
  total: number;
  sourceValues: SourceValue[];
};

export function sortSourceValues(sourceValues: SourceValue[]): SourceValue[] {
  const baseValues = sourceValues
    .filter((value) => value.bonusTypeId === "BASE")
    .sort((a, b) => b.value - a.value);
  const otherValues = sourceValues.filter(
    (value) => value.bonusTypeId !== "BASE"
  );
  const groupedValues = otherValues.reduce((acc, value) => {
    acc[value.value] = acc[value.value] || [];
    acc[value.value].push(value);
    return acc;
  }, {} as Record<number, SourceValue[]>);
  const sortedGroupedValues = Object.values(groupedValues).sort(
    (a, b) => b[0].value - a[0].value
  );
  return [...baseValues, ...sortedGroupedValues.flat()];
}

export function getReplacedSources(sources: Source[]): Source[] {
  const hasReplacementSource = sources.some(
    (source) => source.bonusTypeId === "REPLACEMENT"
  );
  if (hasReplacementSource) {
    return sources
      .filter((source) => source.bonusTypeId !== "BASE")
      .map((source) => {
        if (source.bonusTypeId !== "REPLACEMENT") {
          return source;
        }
        return {
          ...source,
          bonusTypeId: "BASE",
        };
      });
  }
  return sources;
}

export function getCalculatedSourceValues(sources: Source[]): SourceValueSum {
  const sourcesWithValue = sources.filter(sourceHasValue);
  const sourcesThatMeetAllConditions = sourcesWithValue.filter(
    (source) => !source.unmetConditions
  );
  const replacedSources = getReplacedSources(sourcesThatMeetAllConditions);
  const sourceValuesByType = getSourceValuesByType(replacedSources);
  const sourceValues = getSourceValues(sourceValuesByType);
  const sortedSourceValues = sortSourceValues(sourceValues);
  const total = sumSourceValues(sourceValuesByType);
  return { total, sourceValues: sortedSourceValues };
}

export function getSourceValuesByType(sources: Source[]): SourceValuesByType {
  const sourceValues = separateSourceValues(sources);

  const sourceValuesByType = {} as SourceValuesByType;
  (Object.keys(sourceValues) as BonusTypes[]).forEach((sourceBonusType) => {
    const bonusType = BonusTypesValues[sourceBonusType];
    const sortedSourceValues = sourceValues[sourceBonusType].sort(
      (a, b) => b.value - a.value
    );
    if (sortedSourceValues.length === 0) {
      return;
    }

    const total = bonusType.stacksWithSelf
      ? sourceValues[sourceBonusType].reduce(
          (acc, sourceValue) => acc + sourceValue.value,
          0
        )
      : sortedSourceValues[0].value;

    sourceValuesByType[sourceBonusType] = {
      total: total,
      values: sortedSourceValues.map((sourceValue, index) => {
        return {
          ...sourceValue,
          relevant: bonusType.stacksWithSelf || index === 0,
        };
      }),
    };
  });
  return sourceValuesByType;
}

export function separateSourceValues(
  sources: Source[]
): Record<BonusTypes, SourceValue[]> {
  return sources.reduce((acc, source) => {
    acc[source.bonusTypeId] = acc[source.bonusTypeId] || [];
    acc[source.bonusTypeId].push({
      sourceUniqueId: source.originId,
      value: source.totalValue,
      sourceName: source.name,
      bonusTypeId: source.bonusTypeId,
    });
    return acc;
  }, {} as Record<BonusTypes, SourceValue[]>);
}

export function isZeroValueSource(source: Source): boolean {
  return source.totalValue === 0;
}

export function sourceHasValue(source: Source): boolean {
  return source.totalValue !== 0;
}

export function getSourceValues(
  sourceValuesByType: SourceValuesByType
): SourceValue[] {
  return Object.values(sourceValuesByType).reduce(
    (acc, sourceValue) => [...acc, ...sourceValue.values],
    [] as SourceValue[]
  );
}
