import { Buff } from "../../core/domain/character/baseData/buffs";
import { ChangeTypes } from "../../core/domain/character/baseData/changes";
import { valueIndexKeys } from "../../core/domain/character/calculation/valuesIndex/valuesIndex";

export const bullStrength: Buff = {
  active: true,
  name: "Bull's Strength",
  description: "Fuerza de Toro - El sujeto gana +4 de bonificador de mejora a Fuerza.",
  originName: "Bull's Strength",
  originType: "spell",
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

export const catsGrace: Buff = {
  active: true,
  name: "Cat's Grace",
  description: "Gracia Felina - El sujeto gana +4 de bonificador de mejora a Destreza.",
  originName: "Cat's Grace",
  originType: "spell",
  originUniqueId: "cats-grace",
  uniqueId: "cats-grace",
  changes: [
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: "dexterity",
      bonusTypeId: "ENHANCEMENT",
      formula: {
        expression: "4",
      },
    },
  ],
};

export const bearsEndurance: Buff = {
  active: true,
  name: "Bear's Endurance",
  description: "Resistencia del Oso - El sujeto gana +4 de bonificador de mejora a Constitución.",
  originName: "Bear's Endurance",
  originType: "spell",
  originUniqueId: "bears-endurance",
  uniqueId: "bears-endurance",
  changes: [
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: "constitution",
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
  description: "Astucia del Zorro - El sujeto gana +4 de bonificador de mejora a Inteligencia.",
  originName: "Fox's Cunning",
  originType: "spell",
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

export const owlsWisdom: Buff = {
  active: true,
  name: "Owl's Wisdom",
  description: "Sabiduría del Búho - El sujeto gana +4 de bonificador de mejora a Sabiduría.",
  originName: "Owl's Wisdom",
  originType: "spell",
  originUniqueId: "owls-wisdom",
  uniqueId: "owls-wisdom",
  changes: [
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: "wisdom",
      bonusTypeId: "ENHANCEMENT",
      formula: {
        expression: "4",
      },
    },
  ],
};

export const eaglesSplendor: Buff = {
  active: true,
  name: "Eagle's Splendor",
  description: "Esplendor del Águila - El sujeto gana +4 de bonificador de mejora a Carisma.",
  originName: "Eagle's Splendor",
  originType: "spell",
  originUniqueId: "eagles-splendor",
  uniqueId: "eagles-splendor",
  changes: [
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: "charisma",
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
