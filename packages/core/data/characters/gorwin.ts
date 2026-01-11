import { Buff } from "../../core/domain/character/baseData/buffs";
import { ChangeTypes } from "../../core/domain/character/baseData/changes";
import { AttackContextualChange } from "../../core/domain/character/baseData/contextualChange";
import { Feat } from "../../core/domain/character/baseData/features/feats/feat";
import { featureTypes } from "../../core/domain/character/baseData/features/feature";
import { valueIndexKeys } from "../../core/domain/character/calculation/valuesIndex/valuesIndex";
import { RangedWeapon } from "../../core/domain/weapons/weapon";
import { WeaponEnhancement } from "../../core/domain/weapons/weaponEnhancements";
import { buildCharacter } from "../../core/tests/character";
import { fighter } from "../../srd/classes";
import { arqueroPsionico } from "../classes/arqueroPsionico";

export const mageBane: AttackContextualChange = {
  type: "attack",
  appliesTo: "all",
  available: true,
  name: "Mage bane",
  optional: true,
  variables: [],
  changes: [
    {
      type: 'DAMAGE',
      bonusTypeId: "UNTYPED",
      formula: {
        expression: "2d6",
      },
      name: "Mage bane",
      originId: "",
      originType: "item",
    },
    {
      type: 'DAMAGE',
      bonusTypeId: "UNTYPED",
      formula: {
        expression: "2",
      },
      name: "Mage bane",
      originId: "",
      originType: "item",
    },
    {
      type: 'ATTACK_ROLLS',
      attackType: "all",
      bonusTypeId: "UNTYPED",
      formula: {
        expression: "2",
      },
      name: "Mage bane",
      originId: "",
      originType: "item",
    },
  ],
};

const mageBaneEnhancement: WeaponEnhancement = {
  casterLevel: 0,
  cost: {
    type: "bonus",
    bonus: 2,
  },
  description: "",
  name: "Mage bane",
  uniqueId: "mage-bane",
  weaponOnlyContextualChanges: [mageBane],
};

export const arcoDeGorwin: RangedWeapon = {
  equipable: true,
  equipped: true,
  wielded: true,
  name: "Longbow",
  itemType: "WEAPON",
  uniqueId: "longbow",
  damageDice: "1d8",
  isMasterwork: true,
  enhancementBonus: 1,
  enhancements: [mageBaneEnhancement],
  baseCritRange: 20,
  baseCritMultiplier: 3,
  size: "MEDIUM",
  weaponAttackType: "ranged",
  proficiencyType: "simple",
  defaultWieldType: "twoHanded",
  damageType: {
    type: "basic",
    damageType: "piercing",
  },
  changes: [{
    type: 'DAMAGE',
    bonusTypeId: "UNTYPED",
    formula: {
      expression: `@${valueIndexKeys.STR_MODIFIER}`,
    },
  }],
  description: "",
  specialChanges: [],
  twoHanded: true,
  weight: 2,
  equippedChanges: [],
  equippedContextChanges: [],
  wieldedChanges: [],
  wieldedContextChanges: [],
  ammunitionType: "ARROW",
  rangeIncrement: 100,
  requiresLoading: false,
};

const initiativeBuff: Buff = {
  active: true,
  description: "",
  originName: "",
  originType: "item",
  originUniqueId: "",
  uniqueId: "initiative-buff",
  name: "Initiative buff",
  changes: [
    {
      type: 'INITIATIVE',
      bonusTypeId: "UNTYPED",
      formula: {
        expression: "2",
      },
    },
    {
      type: 'ATTACK_ROLLS',
      attackType: "all",
      bonusTypeId: "COMPETENCE",
      formula: {
        expression: "1",
      },
    },
  ],
};

const flechaEnergizadaBuff: Buff = {
  active: true,
  description: "",
  originName: "",
  originType: "item",
  originUniqueId: "",
  uniqueId: "flecha-energizada-buff",
  name: "Flecha energizada buff",
  changes: [],
  contextualChanges: [],
};

const solturaConArcoFeat: Feat = {
  name: "Soltura con el arco",
  description: "Adds dex to damage",
  featureType: featureTypes.FEAT,
  uniqueId: "soltura-con-el-arco",
  changes: [
    {
      type: 'ATTACK_ROLLS',
      attackType: "all",
      bonusTypeId: "COMPETENCE",
      formula: {
        expression: "1",
      },
    },
    {
      type: 'ATTACK_ROLLS',
      attackType: "all",
      bonusTypeId: "COMPETENCE",
      formula: {
        expression: "1",
      },
    },
  ],
};

export const gorwin = buildCharacter()
  .withClassLevels(arqueroPsionico, 14)
  .withItem(arcoDeGorwin)
  .withBuff(initiativeBuff)
  .withFeats([solturaConArcoFeat])
  .buildCharacterSheet();

gorwin.attackData.attackChanges
gorwin.attackData.attacks[0].attackBonus.sourceValues