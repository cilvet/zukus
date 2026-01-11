import { BaseAbilitiesData, BaseAbilityData } from "../../baseData/abilities";
import {
  ChangeTypes,
  AbilityCheckChange,
  AbilityScoreChange,
} from "../../baseData/changes";
import { CharacterBaseData } from "../../baseData/character";
import {
  CalculatedAbilities,
  CalculatedAbility,
} from "../../calculatedSheet/calculatedAbilities";
import { Source } from "../../calculatedSheet/sources";
import { getSheetWithUpdatedField } from "../calculateCharacterSheet";
import {
  calculateSource,
  SubstitutionIndex,
} from "../sources/calculateSources";
import { CharacterChanges } from "../sources/compileCharacterChanges";
import {
  getCalculatedSourceValues,
  isZeroValueSource,
  SourceValueSum,
} from "../sources/sumSources";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";
import { CompiledEffects, getEffectsByTarget } from "../effects/compileEffects";
import {
  calculateEffect,
  effectsToSourceValues,
  mergeEffectsWithSources,
} from "../effects/applyEffects";
import { ContextualChange } from "../../baseData/contextualChange";
import { SpecialChange } from "../../baseData/specialChanges";

const { ABILITY_CHECKS, ABILITY_SCORE } = ChangeTypes;

export const getCalculatedAbilityScores: getSheetWithUpdatedField =
  function getSheetWithAbilityScores(
    baseData: CharacterBaseData,
    index: SubstitutionIndex,
    changes: CharacterChanges,
    contextualChanges?: ContextualChange[],
    specialChanges?: SpecialChange[],
    effects?: CompiledEffects
  ) {
    const abilitySources = changes.abilityChanges.map((change) =>
      calculateSource(change, index)
    );

    const abilityScores = mapAbilityScores(
      baseData.baseAbilityData,
      abilitySources,
      index,
      effects
    );

    const indexValuesToUpdate: SubstitutionIndex = {};
    Object.keys(abilityScores).forEach((ability) => {
      indexValuesToUpdate[valueIndexKeys.ABILITY_SCORE(ability)] =
        abilityScores[ability].totalScore;
      indexValuesToUpdate[valueIndexKeys.ABILITY_SCORE_MODIFIER(ability)] =
        abilityScores[ability].totalModifier;
    });

    return {
      characterSheetFields: {
        abilityScores,
      },
      indexValues: indexValuesToUpdate,
    };
  };

export function mapAbilityScores(
  abilityScores: BaseAbilitiesData,
  sources: Source<AbilityScoreChange | AbilityCheckChange>[],
  index: SubstitutionIndex,
  effects?: CompiledEffects
): CalculatedAbilities {
  const abilityCheckSources: Source<AbilityCheckChange>[] = [];
  const abilityScoreSources: Source<AbilityScoreChange>[] = [];

  sources.forEach((source) => {
    if (source.type === ABILITY_CHECKS) {
      abilityCheckSources.push(source);
    }
    if (source.type === ABILITY_SCORE) {
      abilityScoreSources.push(source);
    }
  });

  return Object.entries(abilityScores).reduce(
    (acc, [abilityId, abilityScore]) => {
      const scoreSources = abilityScoreSources.filter(
        (source) => source.abilityUniqueId === abilityId
      );

      const checkSources = abilityCheckSources.filter(
        (source) => source.abilityUniqueId === abilityId
      );

      acc[abilityId] = mapAbilityScore(
        abilityScore,
        abilityId,
        scoreSources,
        checkSources,
        index,
        effects
      );
      return acc;
    },
    {} as CalculatedAbilities
  );
}

function getBaseAbilityScoreSource(
  abilityId: string,
  value: number,
  name: string
): Source<AbilityScoreChange> {
  return {
    name: name,
    type: ABILITY_SCORE,
    abilityUniqueId: abilityId,
    totalValue: value,
    originId: "base",
    originType: "base",
    bonusTypeId: "BASE",
    formula: {
      expression: value.toString(),
    },
  };
}

export function mapAbilityScore(
  baseAbilityData: BaseAbilityData,
  abilityId: string,
  sources: Source<AbilityScoreChange>[],
  abilityCheckSources: Source<AbilityCheckChange>[],
  index: SubstitutionIndex,
  effects?: CompiledEffects
): CalculatedAbility {
  const { baseScore, drain = 0, damage = 0, penalty = 0 } = baseAbilityData;

  const baseScoreSource = getBaseAbilityScoreSource(
    abilityId,
    baseScore,
    "Base Score"
  );
  const drainSource = getBaseAbilityScoreSource(abilityId, -drain, "Drain");
  const damageSource = getBaseAbilityScoreSource(abilityId, -damage, "Damage");
  const penaltySource = getBaseAbilityScoreSource(
    abilityId,
    -penalty,
    "Penalty"
  );
  const allSources = [
    baseScoreSource,
    drainSource,
    damageSource,
    penaltySource,
    ...sources,
  ].filter((source) => !isZeroValueSource(source));

  const changesSourceValues = getCalculatedSourceValues(allSources);

  const finalScoreSourceValues = applyEffectsToAbilityScore(
    abilityId,
    changesSourceValues,
    index,
    effects
  );

  const total = finalScoreSourceValues.total >= 0 ? finalScoreSourceValues.total : 0;

  const {
    total: abilityCheckSourceValuesSum,
    sourceValues: abilityCheckSourceValues,
  } = getCalculatedSourceValues([...abilityCheckSources, ...allSources]);

  return {
    totalScore: total,
    totalModifier: getAbilityModifier(total),
    baseScore: baseScore,
    baseModifier: getAbilityModifier(baseScore),
    uniqueAbilityId: abilityId,
    sources: sources,
    abilityCheckScore: abilityCheckSourceValuesSum,
    abilityCheckModifier: getAbilityModifier(abilityCheckSourceValuesSum),
    drain: drain,
    damage: damage,
    penalty: penalty,
    checkSourceVales: abilityCheckSourceValues,
    sourceValues: finalScoreSourceValues.sourceValues,
  };
}

export function getAbilityModifier(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Applies effects targeting "ability.{abilityId}.score" to the calculated ability score.
 */
function applyEffectsToAbilityScore(
  abilityId: string,
  changesSourceValues: SourceValueSum,
  index: SubstitutionIndex,
  effects?: CompiledEffects
): SourceValueSum {
  if (!effects) {
    return changesSourceValues;
  }

  const targetPath = `ability.${abilityId}.score`;
  const abilityEffects = getEffectsByTarget(effects, targetPath);

  if (abilityEffects.length === 0) {
    return changesSourceValues;
  }

  const calculatedEffects = abilityEffects.map((effect) =>
    calculateEffect(effect, index)
  );

  const effectsSourceValues = effectsToSourceValues(calculatedEffects);

  return mergeEffectsWithSources(changesSourceValues, effectsSourceValues);
}
