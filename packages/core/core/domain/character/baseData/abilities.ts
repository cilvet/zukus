import { LocatedString } from "../../language/locatedString";

export const defaultAbilityIds = {
  DEX: "dex",
  STR: "str",
  CON: "con",
  INT: "int",
  WIS: "wis",
  CHA: "cha",
} as const;

const { DEX, STR, CON, INT, WIS, CHA } = defaultAbilityIds;

export const defaultAbilityKeys = ["dexterity", "strength", "constitution", "intelligence", "wisdom", "charisma"];
export type AbilityKey = typeof defaultAbilityKeys[number] | (string & {});

export interface BaseAbilitiesData {
  dexterity: BaseAbilityData;
  strength: BaseAbilityData;
  constitution: BaseAbilityData;
  intelligence: BaseAbilityData;
  wisdom: BaseAbilityData;
  charisma: BaseAbilityData;
  [key: string]: BaseAbilityData;
}

export type BaseAbilityData = {
  baseScore: number;
  drain?: number;
  damage?: number;
  penalty?: number;
};

interface Ability {
  uniqueId: string;
  name: LocatedString;
  shortName: LocatedString;
  description?: LocatedString;
}

interface AbilityScore {
  ability: Ability;
  baseScore: number;
}

interface Abilities {
  dexterity: Ability;
  strength: Ability;
  constitution: Ability;
  intelligence: Ability;
  wisdom: Ability;
  charisma: Ability;
  [key: string]: Ability;
}

interface AbilityScores {
  dexterity: AbilityScore;
  strength: AbilityScore;
  constitution: AbilityScore;
  intelligence: AbilityScore;
  wisdom: AbilityScore;
  charisma: AbilityScore;
  [key: string]: AbilityScore;
}

const defaultAbilities: Abilities = {
  dexterity: {
    uniqueId: DEX,
    name: {
      es_ES: "Destreza",
      en_US: "Dexterity",
    },
    shortName: {
      es_ES: "DES",
      en_US: "DEX",
    },
  },
  strength: {
    uniqueId: STR,
    name: {
      es_ES: "Fuerza",
      en_US: "Strength",
    },
    shortName: {
      es_ES: "FUE",
      en_US: "STR",
    },
  },
  constitution: {
    uniqueId: CON,
    name: {
      es_ES: "Constitución",
      en_US: "Constitution",
    },
    shortName: {
      es_ES: "CON",
      en_US: "CON",
    },
  },
  intelligence: {
    uniqueId: INT,
    name: {
      es_ES: "Inteligencia",
      en_US: "Intelligence",
    },
    shortName: {
      es_ES: "INT",
      en_US: "INT",
    },
  },
  wisdom: {
    uniqueId: WIS,
    name: {
      es_ES: "Sabiduría",
      en_US: "Wisdom",
    },
    shortName: {
      es_ES: "SAB",
      en_US: "WIS",
    },
  },
  charisma: {
    uniqueId: CHA,
    name: {
      es_ES: "Carisma",
      en_US: "Charisma",
    },
    shortName: {
      es_ES: "CAR",
      en_US: "CHA",
    },
  },
};
