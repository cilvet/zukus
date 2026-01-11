import { Change } from "../../domain/character/baseData/changes";
import {
  Armor,
  BaseItem,
  ItemTypes,
  Shield,
} from "../../domain/character/baseData/equipment";

export function buildShield(providedShield?: Partial<Shield>) {
  const armor: Shield = {
    uniqueId: "itemUniqueId",
    name: "item name",
    description: "item description",
    weight: 0,
    changes: [],
    specialChanges: [],
    itemType: "SHIELD",
    baseShieldBonus: 0,
    enhancementBonus: 0,
    maxDexBonus: 0,
    armorCheckPenalty: 0,
    arcaneSpellFailureChance: 0,
    enhancements: [],
    equipable: true,
    equipped: true,
    
    ...providedShield,
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
