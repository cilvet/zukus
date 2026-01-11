import {
  AbilitySkillsChange,
  ChangeTypes,
  ContextualizedChange,
  SingleSkillChange,
  SkillChange,
} from "../../baseData/changes";
import { CharacterBaseData } from "../../baseData/character";
import {
  ParentSkill,
  SimpleSkill,
  Skill,
  SkillData,
  defaultBaseSkills,
} from "../../baseData/skills";
import {
  CalculatedParentSkill,
  CalculatedSingleSkill,
  CalculatedSkill,
  CalculatedSkills,
} from "../../calculatedSheet/calculatedSkills";
import { Source } from "../../calculatedSheet/sources";
import { getSheetWithUpdatedField } from "../calculateCharacterSheet";
import {
  SubstitutionIndex,
  calculateSource,
} from "../sources/calculateSources";
import { CharacterChanges } from "../sources/compileCharacterChanges";
import { getCalculatedSourceValues } from "../sources/sumSources";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";
import { CompiledEffects, getEffectsByTarget } from "../effects/compileEffects";
import { calculateEffect, effectsToSourceValues, mergeEffectsWithSources } from "../effects/applyEffects";
import { ContextualChange } from "../../baseData/contextualChange";
import { SpecialChange } from "../../baseData/specialChanges";

export const getCalculatedSkills: getSheetWithUpdatedField = function (
  baseData: CharacterBaseData,
  index: SubstitutionIndex,
  changes: CharacterChanges,
  contextualChanges?: ContextualChange[],
  specialChanges?: SpecialChange[],
  effects?: CompiledEffects
) {

  const classSkills = getCharacterClassSkills(baseData);

  const calculatedSkills = calculateSkills(
    baseData,
    changes.skillChanges,
    index,
    classSkills,
    effects
  );

  const indexValuesToUpdate: SubstitutionIndex = {};

  Object.entries(calculatedSkills).forEach(([skillUniqueId, skill]) => {
    if (skill.type === "parent") {
      skill.subSkills.forEach((subskill) => {
        indexValuesToUpdate[valueIndexKeys.SKILL_SCORE(subskill.uniqueId)] =
          subskill.totalBonus;
        indexValuesToUpdate[valueIndexKeys.SKILL_RANKS(subskill.uniqueId)] =
          getTotalRanks(subskill.skillData);

      });
      return;
    }
    indexValuesToUpdate[valueIndexKeys.SKILL_SCORE(skillUniqueId)] =
      skill.totalBonus;
    indexValuesToUpdate[valueIndexKeys.SKILL_RANKS(skillUniqueId)] =
      getTotalRanks(skill.skillData);
  });

  return {
    characterSheetFields: {
      skills: calculatedSkills,
    },
    indexValues: indexValuesToUpdate,
  };
};

const getCharacterClassSkills = (baseData: CharacterBaseData) => {
  return baseData.classes.flatMap((characterClass) => {
    const classSkills = characterClass.classSkills;
    if (classSkills) {
      return classSkills;
    }
    return [];
  });
}

const calculateSkills = (
  baseData: CharacterBaseData,
  skillChanges: SkillChange[],
  index: SubstitutionIndex,
  classSkills: string[],
  effects?: CompiledEffects
): CalculatedSkills => {
  const abilitySkillChanges = skillChanges.filter(
    (change) => change.type === 'ABILITY_SKILLS'
  ) as ContextualizedChange<AbilitySkillsChange>[];

  const singleSkillChanges = skillChanges.filter(
    (change) => change.type === 'SKILL'
  ) as ContextualizedChange<SingleSkillChange>[];

  const calculatedSkills: CalculatedSkills = {};

  Object.entries(defaultBaseSkills).forEach(([skillUniqueId, skill]) => {
    const uniqueSkillChanges = singleSkillChanges.filter(
      (change) => change.skillUniqueId === skillUniqueId
    );

    const abilitySkillChangesForSkill = abilitySkillChanges.filter(
      (change) => change.abilityUniqueId === skill.abilityModifierUniqueId
    );

    const changesToApply = [
      ...uniqueSkillChanges,
      ...abilitySkillChangesForSkill,
    ];

    if (skill.type === "parent") {
      const subSkillChanges = skill.subSkills.flatMap((subSkill) => {
        return singleSkillChanges.filter(
          (change) => change.skillUniqueId === subSkill.uniqueId
        );
      });

      const result = getCalculatedParentSkill(
        skill,
        index,
        baseData,
        changesToApply,
        subSkillChanges,
        classSkills,
        effects
      );
      calculatedSkills[skillUniqueId] = result;
      return;
    }

    const result = getCalculatedSimpleSkill(
      skill,
      index,
      baseData,
      skillUniqueId,
      changesToApply,
      classSkills.includes(skillUniqueId),
      effects
    );
    calculatedSkills[skillUniqueId] = result;
  });

  return calculatedSkills;
};

const getCalculatedParentSkill = (
  skill: ParentSkill,
  index: SubstitutionIndex,
  baseData: CharacterBaseData,
  changesToApplyToAll: ContextualizedChange<
    SingleSkillChange | AbilitySkillsChange
  >[],
  subSkillChanges: ContextualizedChange<SingleSkillChange>[],
  classSkills: string[],
  effects?: CompiledEffects
): CalculatedSkill => {
  const result: CalculatedParentSkill = {
    ...skill,
    isClassSkill: classSkills.includes(skill.uniqueId),
    subSkills: skill.subSkills.map((subskill) => {
      const changesToApply = [
        ...changesToApplyToAll,
        ...subSkillChanges.filter(
          (change) => change.skillUniqueId === subskill.uniqueId
        ),
      ];

      return getCalculatedSimpleSkill(
        subskill,
        index,
        baseData,
        subskill.uniqueId,
        changesToApply,
        classSkills.includes(skill.uniqueId) || classSkills.includes(subskill.uniqueId),
        effects
      );
    }),
  };
  return result;
};

const getCalculatedSimpleSkill = (
  skill: SimpleSkill,
  index: SubstitutionIndex,
  baseData: CharacterBaseData,
  skillUniqueId: string,
  changesToApply: ContextualizedChange<
    SingleSkillChange | AbilitySkillsChange
  >[],
  isClassSkill: boolean,
  effects?: CompiledEffects
) => {
  const abilitySource = getAbilitySkillSource(skill, index);
  const skillData: SkillData = baseData.skillData[skillUniqueId] ?? {
    ranks: 0,
    halfRanks: 0,
    isClassAbility: false,
  };

  const ranksSource = getSkillRanksSource(skill, skillData);

  const allChanges = [...changesToApply, ranksSource];

  const changeSources = allChanges.map((change) =>
    calculateSource(change, index)
  );

  const skillSources = [abilitySource, ...changeSources];
  const { total: changesTotal, sourceValues: changesSourceValues } = getCalculatedSourceValues(skillSources);
  
  // Apply effects to skill
  let totalBonus = changesTotal;
  let finalSourceValues = changesSourceValues;
  
  if (effects) {
    const skillEffects = getEffectsByTarget(effects, `skills.${skillUniqueId}.total`);
    if (skillEffects.length > 0) {
      const calculatedEffects = skillEffects.map((effect) =>
        calculateEffect(effect, index)
      );
      const effectsSourceValues = effectsToSourceValues(calculatedEffects);
      const merged = mergeEffectsWithSources(
        { total: totalBonus, sourceValues: changesSourceValues },
        effectsSourceValues
      );
      totalBonus = merged.total;
      finalSourceValues = merged.sourceValues;
    }
  }

  const result: CalculatedSingleSkill = {
    ...skill,
    totalBonus,
    sources: changeSources,
    sourceValues: finalSourceValues,
    abilityModifierUniqueId: skill.abilityModifierUniqueId,
    skillData,
    isClassSkill,
  };
  return result;
};

const getTotalRanks = (skillData: SkillData) => {
  return Math.floor(skillData.ranks + skillData.halfRanks / 2);
}

const getSkillRanksSource = (
  skill: Skill,
  skillData: SkillData,
): Source<SkillChange> => {
  const ranksTotal = getTotalRanks(skillData);

  return {
    type: 'SKILL',
    bonusTypeId: "BASE",
    formula: {
      expression: `${ranksTotal}`,
    },
    name: "Ranks",
    originId: skill.uniqueId,
    originType: "base",
    skillUniqueId: skill.uniqueId,
    totalValue: skillData.ranks,
  };
};

const getAbilitySkillSource = (
  skill: Skill,
  index: SubstitutionIndex
): Source<SkillChange> => {
  return {
    type: 'SKILL',
    bonusTypeId: "BASE",
    formula: {
      expression: `${index[
        valueIndexKeys.ABILITY_SCORE_MODIFIER(skill.abilityModifierUniqueId)
        ]
        }`,
    },
    name: `${skill.abilityModifierUniqueId} modifier`,
    originId: skill.abilityModifierUniqueId,
    originType: "base",
    skillUniqueId: skill.uniqueId,
    totalValue:
      index[
      valueIndexKeys.ABILITY_SCORE_MODIFIER(skill.abilityModifierUniqueId)
      ],
  };
};
