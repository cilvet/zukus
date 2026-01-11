import { Buff } from "../../core/domain/character/baseData/buffs";
import { ChangeTypes } from "../../core/domain/character/baseData/changes";
import { valueIndexKeys } from "../../core/domain/character/calculation/valuesIndex/valuesIndex";

export const bullStrength: Buff = {
  active: true,
  name: "Bull's Strength",
  description: "",
  originName: "Bull's Strength",
  originType: "other",
  originUniqueId: "bulls-strength",
  uniqueId: "bulls-strength",
  changes: [
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: "strength",
      bonusTypeId: "ENHANCEMENT",
      formula: {
        expression: "4",
      },
    },
  ],
};

export const foxsCunning: Buff = {
  active: true,
  name: "Fox's Cunning",
  description: "",
  originName: "Fox's Cunning",
  originType: "other",
  originUniqueId: "foxs-cunning",
  uniqueId: "foxs-cunning",
  changes: [
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: "intelligence",
      bonusTypeId: "ENHANCEMENT",
      formula: {
        expression: "4",
      },
    },
  ],
};

export const bardicInspiration1: Buff = {
  active: true,
  name: "Bardic Inspiration",
  description: "",
  originName: "Bardic Inspiration",
  originType: "other",
  originUniqueId: "bardic-inspiration",
  uniqueId: "bardic-inspiration",
  changes: [
    {
      type: 'ATTACK_ROLLS',
      bonusTypeId: "MORALE",
      attackType: "all",
      formula: {
        expression: "1",
      },
    },
    {
      type: 'DAMAGE',
      bonusTypeId: "MORALE",
      formula: {
        expression: "1",
      },
    },
  ],
};

export const addDexToDamage: Buff = {
  active: true,
  name: "Dex to damage",
  description: "",
  originName: "Dex to damage",
  originType: "other",
  originUniqueId: "dex-to-damage",
  uniqueId: "dex-to-damage",
  changes: [
    {
      type: 'DAMAGE',
      bonusTypeId: "UNTYPED",
      formula: {
        expression: `@${valueIndexKeys.ABILITY_SCORE_MODIFIER("dexterity")}`,
      },
    },
  ],
};

export const addIntToDamage: Buff = {
  active: true,
  name: "Int to damage",
  description: "",
  originName: "Int to damage",
  originType: "other",
  originUniqueId: "int-to-damage",
  uniqueId: "int-to-damage",
  changes: [
    {
      type: 'DAMAGE',
      bonusTypeId: "UNTYPED",
      formula: {
        expression: `@${valueIndexKeys.ABILITY_SCORE_MODIFIER("intelligence")}`,
      },
    },
  ],
};
