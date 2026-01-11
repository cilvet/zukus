import { AbilityKey, defaultAbilityIds } from "./abilities";

const abilityIds = {
  STR: "strength",
  DEX: "dexterity",
  CON: "constitution",
  INT: "intelligence",
  WIS: "wisdom",
  CHA: "charisma",
} as const;


const { STR, CON, DEX, CHA, INT, WIS } = abilityIds;

export type ArmorPenaltyType = "none" | "single" | "double";

export type BaseSkill = {
  name: string;
  uniqueId: string;
  abilityModifierUniqueId: AbilityKey;
  trainedOnly: boolean;
  armorCheckPenalty: ArmorPenaltyType;
};

export type SimpleSkill = BaseSkill & {
  type: "simple";
};

export type ParentSkill = BaseSkill & {
  type: "parent";
  subSkills: SimpleSkill[];
};

export type Skill = SimpleSkill | ParentSkill;

export type CharacterSkillData = {
  [key: string]: SkillData;
}

export type SkillData = {
  halfRanks: number;
  ranks: number;
  isClassAbility: boolean;
};

export const defaultSkills = [
  'appraise',
  'autohypnosis',
  'balance',
  'bluff',
  'climb',
  'concentration',
  'craft',
  'decipherScript',
  'diplomacy',
  'disableDevice',
  'disguise',
  'escapeArtist',
  'forgery',
  'gatherInformation',
  'handleAnimal',
  'heal',
  'hide',
  'intimidate',
  'jump',
  'knowledgeArcana',
  'knowledgeArchitecture',
  'knowledgeDungeoneering',
  'knowledgeGeography',
  'knowledgeHistory',
  'knowledgeLocal',
  'knowledgeNature',
  'knowledgeNobility',
  'knowledgeReligion',
  'knowledgeThePlanes',
  'listen',
  'moveSilently',
  'openLock',
  'perform',
  'psicraft',
  'profession',
  'ride',
  'search',
  'senseMotive',
  'sleightOfHand',
  'spellCraft',
  'spot',
  'survival',
  'swim',
  'tumble',
  'useMagicDevice',
  'usePisonicDevice',
  'useRope'
] as const;

export type Skills = Record<typeof defaultSkills[number] | (string & {}), Skill>;

export type SkillsData = Record<typeof defaultSkills[number], SkillData>;

export const defaultBaseSkills: Skills = {
  appraise: {
    name: "Appraise",
    type: "simple",
    uniqueId: "appraise",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  autohypnosis: {
    name: "Autohypnosis",
    type: "simple",
    uniqueId: "autohypnosis",
    abilityModifierUniqueId: WIS,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  balance: {
    name: "Balance",
    type: "simple",
    uniqueId: "balance",
    abilityModifierUniqueId: DEX,
    armorCheckPenalty: "single",
    trainedOnly: false,
  },
  bluff: {
    name: "Bluff",
    type: "simple",
    uniqueId: "bluff",
    abilityModifierUniqueId: DEX,
    armorCheckPenalty: "single",
    trainedOnly: false,
  },
  climb: {
    name: "Climb",
    type: "simple",
    uniqueId: "climb",
    abilityModifierUniqueId: STR,
    armorCheckPenalty: "single",
    trainedOnly: false,
  },
  concentration: {
    name: "Concentration",
    type: "simple",
    uniqueId: "concentration",
    abilityModifierUniqueId: CON,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  craft: {
    name: "Craft",
    type: "parent",
    uniqueId: "craft",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: false,
    subSkills: [],
  },
  decipherScript: {
    name: "Decipher Script",
    type: "simple",
    uniqueId: "decipherScript",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  diplomacy: {
    name: "Diplomacy",
    type: "simple",
    uniqueId: "diplomacy",
    abilityModifierUniqueId: CHA,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  disableDevice: {
    name: "Disable Device",
    type: "simple",
    uniqueId: "disableDevice",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  disguise: {
    name: "Disguise",
    type: "simple",
    uniqueId: "disguise",
    abilityModifierUniqueId: CHA,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  escapeArtist: {
    name: "Escape Artist",
    type: "simple",
    uniqueId: "escapeArtist",
    abilityModifierUniqueId: DEX,
    armorCheckPenalty: "single",
    trainedOnly: false,
  },
  forgery: {
    name: "Forgery",
    type: "simple",
    uniqueId: "forgery",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  gatherInformation: {
    name: "Gather Information",
    type: "simple",
    uniqueId: "gatherInformation",
    abilityModifierUniqueId: CHA,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  handleAnimal: {
    name: "Handle Animal",
    type: "simple",
    uniqueId: "handleAnimal",
    abilityModifierUniqueId: CHA,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  heal: {
    name: "Heal",
    type: "simple",
    uniqueId: "heal",
    abilityModifierUniqueId: WIS,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  hide: {
    name: "Hide",
    type: "simple",
    uniqueId: "hide",
    abilityModifierUniqueId: DEX,
    armorCheckPenalty: "single",
    trainedOnly: false,
  },
  intimidate: {
    name: "Intimidate",
    type: "simple",
    uniqueId: "intimidate",
    abilityModifierUniqueId: CHA,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  jump: {
    name: "Jump",
    type: "simple",
    uniqueId: "jump",
    abilityModifierUniqueId: STR,
    armorCheckPenalty: "single",
    trainedOnly: false,
  },
  knowledgeArcana: {
    name: "Knowledge (Arcana)",
    type: "simple",
    uniqueId: "knowledgeArcana",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  knowledgeArchitecture: {
    name: "Knowledge (Architecture)",
    type: "simple",
    uniqueId: "knowledgeArchitecture",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  knowledgeDungeoneering: {
    name: "Knowledge (Dungeoneering)",
    type: "simple",
    uniqueId: "knowledgeDungeoneering",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  knowledgeGeography: {
    name: "Knowledge (Geography)",
    type: "simple",
    uniqueId: "knowledgeGeography",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  knowledgeHistory: {
    name: "Knowledge (History)",
    type: "simple",
    uniqueId: "knowledgeHistory",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  knowledgeLocal: {
    name: "Knowledge (Local)",
    type: "simple",
    uniqueId: "knowledgeLocal",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  knowledgeNature: {
    name: "Knowledge (Nature)",
    type: "simple",
    uniqueId: "knowledgeNature",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  knowledgeNobility: {
    name: "Knowledge (Nobility)",
    type: "simple",
    uniqueId: "knowledgeNobility",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  knowledgeReligion: {
    name: "Knowledge (Religion)",
    type: "simple",
    uniqueId: "knowledgeReligion",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  knowledgeThePlanes: {
    name: "Knowledge (The Planes)",
    type: "simple",
    uniqueId: "knowledgeThePlanes",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  listen: {
    name: "Listen",
    type: "simple",
    uniqueId: "listen",
    abilityModifierUniqueId: WIS,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  moveSilently: {
    name: "Move Silently",
    type: "simple",
    uniqueId: "moveSilently",
    abilityModifierUniqueId: DEX,
    armorCheckPenalty: "single",
    trainedOnly: false,
  },
  openLock: {
    name: "Open Lock",
    type: "simple",
    uniqueId: "openLock",
    abilityModifierUniqueId: DEX,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  perform: {
    name: "Perform",
    type: "parent",
    uniqueId: "perform",
    abilityModifierUniqueId: CHA,
    armorCheckPenalty: "none",
    subSkills: [],
    trainedOnly: true,
  },
  profession: {
    name: "Profession",
    type: "parent",
    uniqueId: "profession",
    abilityModifierUniqueId: WIS,
    armorCheckPenalty: "none",
    subSkills: [],
    trainedOnly: true,
  },
  psicraft: {
    name: "Psicraft",
    type: "simple",
    uniqueId: "psicraft",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  ride: {
    name: "Ride",
    type: "simple",
    uniqueId: "ride",
    abilityModifierUniqueId: DEX,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  search: {
    name: "Search",
    type: "simple",
    uniqueId: "search",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  senseMotive: {
    name: "Sense Motive",
    type: "simple",
    uniqueId: "senseMotive",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  sleightOfHand: {
    name: "Sleight of Hand",
    type: "simple",
    uniqueId: "sleightOfHand",
    abilityModifierUniqueId: DEX,
    armorCheckPenalty: "single",
    trainedOnly: true,
  },
  spellCraft: {
    name: "Spellcraft",
    type: "simple",
    uniqueId: "spellCraft",
    abilityModifierUniqueId: INT,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  spot: {
    name: "Spot",
    type: "simple",
    uniqueId: "spot",
    abilityModifierUniqueId: WIS,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  survival: {
    name: "Survival",
    type: "simple",
    uniqueId: "survival",
    abilityModifierUniqueId: WIS,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
  swim: {
    name: "Swim",
    type: "simple",
    uniqueId: "swim",
    abilityModifierUniqueId: STR,
    armorCheckPenalty: "double",
    trainedOnly: false,
  },
  tumble: {
    name: "Tumble",
    type: "simple",
    uniqueId: "tumble",
    abilityModifierUniqueId: DEX,
    armorCheckPenalty: "single",
    trainedOnly: true,
  },
  useMagicDevice: {
    name: "Use Magic Device",
    type: "simple",
    uniqueId: "useMagicDevice",
    abilityModifierUniqueId: CHA,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  usePisonicDevice: {
    name: "Use Psionic Device",
    type: "simple",
    uniqueId: "usePisonicDevice",
    abilityModifierUniqueId: CHA,
    armorCheckPenalty: "none",
    trainedOnly: true,
  },
  useRope: {
    name: "Use Rope",
    type: "simple",
    uniqueId: "useRope",
    abilityModifierUniqueId: DEX,
    armorCheckPenalty: "none",
    trainedOnly: false,
  },
};
