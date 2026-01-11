import { Buff } from "../../core/domain/character/baseData/buffs";
import { ChangeTypes } from "../../core/domain/character/baseData/changes";
import { MeleeWeapon } from "../../core/domain/weapons/weapon";
import { buildCharacter } from "../../core/tests/character/buildCharacter";
import { fighter } from "../../srd/classes";

export const bendiciOnDeGorum: Buff = {
  name: "Bendición de Gorum",
  description: "",
  originName: "Bendición de Gorum",
  originType: "other",
  originUniqueId: "bendicion-de-gorum",
  uniqueId: "bendicion-de-gorum",
  active: true,
  changes: [
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: "strength",
      bonusTypeId: "UNTYPED",
      formula: {
        expression: "2",
      },
    },
  ],
};

export const mordiscoDeHombreLobo: Buff = {
  active: true,
  name: "Mordisco de hombre lobo",
  description: "",
  originName: "Mordisco de hombre lobo",
  originType: "other",
  originUniqueId: "mordisco-de-hombre-lobo",
  uniqueId: "mordisco-de-hombre-lobo",
  changes: [
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: "strength",
      bonusTypeId: "ENHANCEMENT",
      formula: {
        expression: "2",
      },
    },
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: "constitution",
      bonusTypeId: "ENHANCEMENT",
      formula: {
        expression: "4",
      },
    },
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: "dexterity",
      bonusTypeId: "ENHANCEMENT",
      formula: {
        expression: "4",
      },
    },
    {
      type: 'NATURAL_AC',
      bonusTypeId: "NATURAL_ARMOR",
      formula: {
        expression: "4",
      },
    },
  ],
};

export const hachaDeSigmar: MeleeWeapon = {
  name: "Hacha del centauro",
  itemType: "WEAPON",
  equipable: true,
  equipped: true,
  wielded: true,
  uniqueId: "greataxe",
  damageDice: "3d6",
  isMasterwork: true,
  enhancementBonus: 2,
  baseCritRange: 20,
  baseCritMultiplier: 3,
  size: "LARGE",
  weaponAttackType: "melee",
  proficiencyType: "martial",
  defaultWieldType: "twoHanded",
  damageType: {
    type: "basic",
    damageType: "slashing",
  },
  changes: [],
  description: "",
  specialChanges: [],
  twoHanded: true,
  weightType: "HEAVY",
  weight: 6,
  enhancements: [],
  finesse: false,
  reachRange: undefined,
  thrown: false,
  thrownRange: undefined,
  equippedChanges: [],
  equippedContextChanges: [],
  wieldedChanges: [],
  wieldedContextChanges: [],
};

export const sigmar = buildCharacter()
  .withClassLevels(fighter, 15)
  .withBuff(bendiciOnDeGorum)
  .withBuff(mordiscoDeHombreLobo)
  .withBaseAbilityScore("strength", 16)
  .withItemEquipped(hachaDeSigmar)
  .build();
