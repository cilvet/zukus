import {
  AbilityKey,
  BaseAbilitiesData,
} from "../../domain/character/baseData/abilities";
import { Buff } from "../../domain/character/baseData/buffs";
import {
  CharacterBaseData,
  CharacterLevel,
  SpecialFeature,
} from "../../domain/character/baseData/character";
import { Equipment, Item } from "../../domain/character/baseData/equipment";
import { Feat } from "../../domain/character/baseData/features/feats/feat";
import { Race } from "../../domain/character/baseData/race";
import {
  Skills,
  SkillData,
  CharacterSkillData,
  SimpleSkill,
  ParentSkill,
  defaultSkills,
} from "../../domain/character/baseData/skills";
import { CharacterSheet } from "../../domain/character/calculatedSheet/sheet";
import { ProvisionalSpells } from "../../domain/character/calculatedSheet/spells/provisionalSpells";
import { getAbilityModifier } from "../../domain/character/calculation/abilityScores/calculateAbilityScores";
import { calculateCharacterSheet } from "../../domain/character/calculation/calculateCharacterSheet";
import { advanceClassLevels } from "../../domain/character/update/updateLevel/advanceClassLevels";
import { CharacterClass } from "../../domain/class/class";
import { getDefaultCharacterData } from "./defaultCharacter";
import { SystemLevelsEntity } from "../../domain/levels/storage/types";
import { dnd35SystemLevels } from "../../../srd/systemLevels/dnd35SystemLevels";

export type CharacterBuilder = {
  withName: (name: string) => CharacterBuilder;
  withClassLevels: (
    characterClass: CharacterClass,
    levels: number,
    averageRoll?: boolean
  ) => CharacterBuilder;
  withBaseAbilityScore: (
    ability: AbilityKey,
    score: number
  ) => CharacterBuilder;
  withBaseAbilityScores: (
    abilityScores: Record<AbilityKey, number>
  ) => CharacterBuilder;
  withMaxHp: (maxHp: number) => CharacterBuilder;
  withAbilityDrain: (ability: AbilityKey, drain: number) => CharacterBuilder;
  withAbilityDamage: (ability: AbilityKey, damage: number) => CharacterBuilder;
  withAbilityPenalty: (
    ability: AbilityKey,
    penalty: number
  ) => CharacterBuilder;
  withItem: (item: Item) => CharacterBuilder;
  withItemEquipped: (item: Item) => CharacterBuilder;
  withCurrentDamage: (damage: number) => CharacterBuilder;
  withBuff: (buff: Buff) => CharacterBuilder;
  withBuffs: (buffs: Buff[]) => CharacterBuilder;
  withRace: (race: Race) => CharacterBuilder;
  withSubSkills: (skill: string, subSkills: SimpleSkill[]) => CharacterBuilder;
  withSkillRanks: (
    skill: (typeof defaultSkills[number] | string & {}),
    ranks: number,
    areHalfRanks?: boolean
  ) => CharacterBuilder;
  withTemporaryHp: (temporaryHp: number) => CharacterBuilder;
  withCurrentTemporalHp: (currentTemporalHp: number) => CharacterBuilder;
  withBaseAbilityData: (baseAbilityData: BaseAbilitiesData) => CharacterBuilder;
  withSkills: (skills: Skills) => CharacterBuilder;
  withSkillData: (skillData: CharacterSkillData) => CharacterBuilder;
  withClasses: (classes: CharacterClass[]) => CharacterBuilder;
  withLevel: (level: CharacterLevel) => CharacterBuilder;
  withCurrentLevel: (level: number) => CharacterBuilder;
  withEquipment: (equipment: Equipment) => CharacterBuilder;
  withFeats: (feats: Feat[]) => CharacterBuilder;
  withSpecialFeatures: (specialFeatures: SpecialFeature[]) => CharacterBuilder;
  withAbsorbedItems: () => CharacterBuilder;
  withSystemLevels: (systemLevels?: SystemLevelsEntity) => CharacterBuilder;
  withoutSystemLevels: () => CharacterBuilder;
  build: () => CharacterBaseData;
  buildCharacterSheet: () => CharacterSheet;
  withSpells: (spells: ProvisionalSpells) => CharacterBuilder;
};

export function buildCharacter() {
  const character: CharacterBaseData = getDefaultCharacterData();
  
  // By default, assign the D&D 3.5 system levels
  character.systemLevelsEntity = dnd35SystemLevels;

  const builder: CharacterBuilder = {
    withName: function (name: string) {
      character.name = name;
      return this;
    },
    withSpells: function (spells: ProvisionalSpells) {
      character.spells = spells;
      return this;
    },
    withClassLevels: function (characterClass: CharacterClass, levels: number, averageRoll = false) {
      let hitDieRolls = Array(levels).fill(1);
      if (averageRoll) {
        hitDieRolls = [];
        for (let i = 0; i < levels; i++) {
          const averageRollValue = Math.floor(characterClass.hitDie / 2) + (i % 2);
          hitDieRolls.push(averageRollValue);
        }
      }
      advanceClassLevels(
        character,
        characterClass,
        levels,
        hitDieRolls
      );
      return this;
    },
    withBaseAbilityScore: function (ability: AbilityKey, score: number) {
      character.baseAbilityData[ability].baseScore = score;
      return this;
    },
    withBaseAbilityScores: function (
      abilityScores: Record<AbilityKey, number>
    ) {
      Object.entries(abilityScores).forEach(([ability, score]) => {
        character.baseAbilityData[ability as AbilityKey].baseScore = score;
      });
      return this;
    },
    withMaxHp: function (maxHp: number) {
      const level = character.level.level;
      const calculatedCharacter = calculateCharacterSheet(character);

      const extraHpFromCon =
        level * calculatedCharacter.abilityScores.constitution.totalModifier;
      const firstDiceHp = character.classes[0].hitDie;
      const totalHpToPutIntoDice = maxHp - extraHpFromCon - firstDiceHp;
      const averageHpPerDice = Math.floor(totalHpToPutIntoDice / (level - 1));
      for (let i = 1; i < level; i++) {
        character.level.levelsData[i].hitDieRoll = averageHpPerDice;
        const isLastLevel = i === level - 1;
        if (isLastLevel) {
          const totalHpPut = averageHpPerDice * i;
          const remainingHp = totalHpToPutIntoDice - totalHpPut;
          character.level.levelsData[i].hitDieRoll += remainingHp;
        }
      }
      return this;
    },
    withAbilityDrain: function (ability: AbilityKey, drain: number) {
      character.baseAbilityData[ability].drain = drain;
      return this;
    },
    withAbilityDamage: function (ability: AbilityKey, damage: number) {
      character.baseAbilityData[ability].damage = damage;
      return this;
    },
    withAbilityPenalty: function (ability: AbilityKey, penalty: number) {
      character.baseAbilityData[ability].penalty = penalty;
      return this;
    },
    withItem: function (item: Item) {
      character.equipment.items.push(item);
      return this;
    },
    withItemEquipped: function (item: Item) {
      character.equipment.items.push({ ...item, equipped: true });
      return this;
    },
    withCurrentDamage: function (damage: number) {
      character.currentDamage = damage;
      return this;
    },
    withBuff: function (buff: Buff) {
      character.buffs.push(buff);
      return this;
    },
    withBuffs: function (buffs: Buff[]) {
      buffs.forEach((buff) => character.buffs.push(buff));
      return this;
    },
    withRace: function (race: Race) {
      character.race = race;
      return this;
    },
    withSubSkills: function (skill: string, subSkills: SimpleSkill[]) {
      character.skills[skill] = {
        ...(character.skills[skill] as ParentSkill),
        subSkills,
      };
      return this;
    },
    withSkillRanks: function (
      skill: (typeof defaultSkills[number] | string & {}),
      ranks: number,
      areHalfRanks?: boolean
    ) {
      const currentSkillData = character.skillData[skill] ?? {
        ranks: 0,
        halfRanks: 0,
        isClassAbility: false,
      };
      character.skillData[skill] = {
        ...currentSkillData,
        ranks,
      };
      return this;
    },
    withTemporaryHp: function (temporaryHp: number) {
      character.temporaryHp = temporaryHp;
      return this;
    },
    withCurrentTemporalHp: function (currentTemporalHp: number) {
      character.currentTemporalHp = currentTemporalHp;
      return this;
    },
    withBaseAbilityData: function (baseAbilityData: BaseAbilitiesData) {
      character.baseAbilityData = baseAbilityData;
      return this;
    },
    withSkills: function (skills: Skills) {
      character.skills = skills;
      return this;
    },
    withSkillData: function (skillData: CharacterSkillData) {
      character.skillData = skillData;
      return this;
    },
    withClasses: function (classes: CharacterClass[]) {
      character.classes = classes;
      return this;
    },
    withLevel: function (level: CharacterLevel) {
      character.level = level;
      return this;
    },
    withCurrentLevel: function (level: number) {
      character.level.level = level;
      return this;
    },
    withEquipment: function (equipment: Equipment) {
      character.equipment = equipment;
      return this;
    },
    withFeats: function (feats: Feat[]) {
      character.feats.push(...feats);
      return this;
    },
    withSpecialFeatures: function (specialFeatures: SpecialFeature[]) {
      if (!character.specialFeatures) {
        character.specialFeatures = [];
      }
      character.specialFeatures.push(...specialFeatures);
      return this;
    },
    withAbsorbedItems: function () {
      const newItemArray = character.equipment.items.map((item) => ({
        ...item,
        equipped: false,
      }));
      character.equipment.items = newItemArray;
      return this;
    },
    withSystemLevels: function (systemLevels?: SystemLevelsEntity) {
      character.systemLevelsEntity = systemLevels;
      return this;
    },
    withoutSystemLevels: function () {
      delete character.systemLevelsEntity;
      return this;
    },
    build: function () {
      return character;
    },
    buildCharacterSheet: function (): CharacterSheet {
      return calculateCharacterSheet(character);
    },
  } as const;
  return builder;
}
