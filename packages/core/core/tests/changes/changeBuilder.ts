import { AbilityKey } from "../../domain/character/baseData/abilities";
import { BaseAttackBonusChange } from "../../domain/character/baseData/attacks";
import {
  AbilityScoreChange,
  Change,
  ChangeTypes,
  BonusTypes, InitiativeChange, ArmorClassChange
} from "../../domain/character/baseData/changes";
import { SavingThrowId } from "../../domain/class/saves";

export function buildAbilityChange(
  ability: AbilityKey,
  formula: string,
  bonusType: BonusTypes = "ENHANCEMENT"
): AbilityScoreChange {
  return {
    type: 'ABILITY_SCORE',
    abilityUniqueId: ability,
    bonusTypeId: bonusType,
    formula: {
      expression: formula,
    },
  };
}

export function buildInitiativeChange(
  formula: string,
  bonusType: BonusTypes = "ENHANCEMENT"
): InitiativeChange {
  return {
    type: 'INITIATIVE',
    bonusTypeId: bonusType,
    formula: {
      expression: formula,
    },
  };
}

export function buildBaseAttackBonusChange(
  formula: string,
  bonusType: BonusTypes = "ENHANCEMENT"
): BaseAttackBonusChange {
  return {
    type: 'BAB',
    bonusTypeId: bonusType,
    formula: {
      expression: formula,
    },
  };
}

export function buildSavingThrowChange(
  savingThrowId: SavingThrowId,
  formula: string,
  bonusType: BonusTypes = "ENHANCEMENT"
): Change {
  return {
    type: 'SAVING_THROW',
    savingThrowUniqueId: savingThrowId,
    bonusTypeId: bonusType,
    formula: {
      expression: formula,
    },
  };
}

export function buildACChange(
  formula: string,
  bonusType: BonusTypes = "ENHANCEMENT"
): ArmorClassChange {
  return {
    type: 'AC',
    bonusTypeId: bonusType,
    formula: {
      expression: formula,
    },
  };
}

export function buildSkillChange(
  skillId: string,
  formula: string,
  bonusType: BonusTypes = "ENHANCEMENT"
): Change {
  return {
    type: 'SKILL',
    skillUniqueId: skillId,
    bonusTypeId: bonusType,
    formula: {
      expression: formula,
    },
  };
}

export function buildAbilitySkillChange(
  abilityId: AbilityKey,
  formula: string,
  bonusType: BonusTypes = "ENHANCEMENT"
): Change {
  return {
    type: 'ABILITY_SKILLS',
    abilityUniqueId: abilityId,
    bonusTypeId: bonusType,
    formula: {
      expression: formula,
    },
  };
}
