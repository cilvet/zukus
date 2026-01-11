import { Change } from "../../domain/character/baseData/changes";
import {
  Armor,
  BaseItem,
  ItemTypes,
} from "../../domain/character/baseData/equipment";

export function buildArmor(providedArmor?: Partial<Armor>) {
  const armor: Armor = {
    uniqueId: "itemUniqueId",
    name: "item name",
    description: "item description",
    weight: 0,
    changes: [],
    specialChanges: [],
    itemType: "ARMOR",
    baseArmorBonus: 0,
    enhancementBonus: 0,
    maxDexBonus: 0,
    armorCheckPenalty: 0,
    arcaneSpellFailureChance: 0,
    speed30: 0,
    speed20: 0,
    enhancements: [],
    equipable: true,
    equipped: true,
    ...providedArmor,
  };

  return {
    withChange: function (change: Change) {
      armor.changes!.push(change);
      return this;
    },
    withEnhancementBonus: function (enhancementBonus: number) {
      armor.enhancementBonus = enhancementBonus;
      return this;
    },
    withMaxDexBonus: function (maxDexBonus: number) {
      armor.maxDexBonus = maxDexBonus;
      return this;
    },
    build: function () {
      return armor;
    },
  };
}
