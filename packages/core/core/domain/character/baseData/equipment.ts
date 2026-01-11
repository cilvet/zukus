import { ItemEnhancement } from "../../items/enhancements/itemEnhancements";
import { Weapon } from "../../weapons/weapon";
import { WeaponEnhancement } from "../../weapons/weaponEnhancements";
import { Change } from "./changes";
import { AttackContextualChange, ContextualChange } from "./contextualChange";
import { SpecialChange } from "./specialChanges";
import { Resource } from "../../spells/resources";

export const itemTypeArray = [
  "ARMOR",
  "WEAPON",
  "SHIELD",
  "BELT",
  "BOOTS",
  "BRACERS",
  "CLOAK",
  "GLOVES",
  "HEADGEAR",
  "NECKGEAR",
  "RING",
  "ROD",
  "STAFF",
  "WAND",
  "MISC"
] as const;

export type ItemTypes = typeof itemTypeArray[number];

export type BodySlots = {
  head: Headgear | null;
  neck: NeckGear | null;
  shoulders: Bracers | null;
  chest: Armor | null;
  hands: Gloves | null;
  waist: Belt | null;
  legs: Armor | null;
  feet: Boots | null;
  ring1: Ring | null;
  ring2: Ring | null;
};

export type Equipment = {
  items: Item[];
  money: number;
};

export type BaseItemFields = {
  uniqueId: string;
  name: string;
  description: string;
  weight: number;
  changes?: Change[];
  specialChanges?: SpecialChange[];
  itemType: ItemTypes;
  cost?: number;
  equipped?: boolean;
  contextualChanges?: ContextualChange[];
  resources?: Resource[];
}

export type BaseUnequipableItem = BaseItemFields & {
  equipable: false;
};

export type EquipableItem = BaseItemFields & {
  equipable: true;
  equipped: boolean;
  equippedChanges?: Change[];
  equippedContextChanges?: AttackContextualChange[];
};

export type BaseItem = BaseUnequipableItem | EquipableItem;

export type Armor = BaseItem & {
  itemType: "ARMOR";
  enhancements: ItemEnhancement[];
  baseArmorBonus: number;
  enhancementBonus: number;
  maxDexBonus: number;
  armorCheckPenalty: number;
  arcaneSpellFailureChance: number;
  speed30: number;
  speed20: number;
};

export type Shield = BaseItem & {
  itemType: "SHIELD";
  enhancements: ItemEnhancement[];
  baseShieldBonus: number;
  enhancementBonus: number;
  maxDexBonus?: number;
  armorCheckPenalty: number;
  arcaneSpellFailureChance: number;
};

export type Misc = BaseItem & {
  itemType: "MISC";
};

export type Belt = BaseItem & {
  itemType: "BELT";
};

export type Boots = BaseItem & {
  itemType: "BOOTS";
};

export type Bracers = BaseItem & {
  itemType: "BRACERS";
};

export type Cloak = BaseItem & {
  itemType: "CLOAK";
};

export type Gloves = BaseItem & {
  itemType: "GLOVES";
};

export type Headgear = BaseItem & {
  itemType: "HEADGEAR";
};

export type Ring = BaseItem & {
  itemType: "RING";
};

export type Rod = BaseItem & {
  itemType: "ROD";
};

export type Staff = BaseItem & {
  itemType: "STAFF";
};

export type Wand = BaseItem & {
  itemType: "WAND";
};

export type NeckGear = BaseItem & {
  itemType: "NECKGEAR";
};

export type Item =
  | Armor
  | Shield
  | Weapon
  | Misc
  | Belt
  | Boots
  | Bracers
  | Cloak
  | Gloves
  | Headgear
  | Ring
  | Rod
  | Staff
  | Wand
  | NeckGear;
