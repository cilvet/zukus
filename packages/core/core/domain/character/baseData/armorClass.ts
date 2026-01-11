import { z } from "zod";
import { BonusType } from "./changes";

export function bonusTypeToACBonusType(
  bonusType: BonusType
): ArmorClassBonusType {
  return {
    ...bonusType,
    countsForTouchAC: true,
    countsForFlatFootedAC: true,
  };
}

export type ArmorClassBonusType = BonusType & {
  countsForTouchAC: boolean;
  countsForFlatFootedAC: boolean;
};

export const ACBonusTypesSchema = z.enum([
  "BASE",
  "ARMOR", 
  "SHIELD",
  "DEXTERITY",
  "SIZE",
  "DEFLECTION",
  "MISC",
  "DODGE", 
  "NATURAL_ARMOR",
  "NATURAL_ARMOR_ENHANCEMENT"
]);

export type ACBonusTypes = z.infer<typeof ACBonusTypesSchema>;

export const ACBonusTypesValues: {
  [key in ACBonusTypes]: ArmorClassBonusType;
} = {
  BASE: {
    name: "Base",
    uniqueId: "base",
    stacksWithSelf: true,
    countsForTouchAC: true,
    countsForFlatFootedAC: true,
  },
  ARMOR: {
    name: "Armor",
    uniqueId: "armor",
    stacksWithSelf: false,
    countsForTouchAC: false,
    countsForFlatFootedAC: true,
  },
  SHIELD: {
    name: "Shield",
    uniqueId: "shield",
    stacksWithSelf: false,
    countsForTouchAC: false,
    countsForFlatFootedAC: true,
  },
  DEFLECTION: {
    name: "Deflection",
    uniqueId: "deflection",
    stacksWithSelf: false,
    countsForTouchAC: true,
    countsForFlatFootedAC: true,
  },
  DODGE: {
    name: "Dodge",
    uniqueId: "dodge",
    stacksWithSelf: true,
    countsForTouchAC: true,
    countsForFlatFootedAC: false,
  },
  SIZE: {
    name: "Size",
    uniqueId: "size",
    stacksWithSelf: false,
    countsForTouchAC: true,
    countsForFlatFootedAC: false,
  },
  MISC: {
    name: "Misc",
    uniqueId: "misc",
    stacksWithSelf: false,
    countsForTouchAC: true,
    countsForFlatFootedAC: true,
  },
  DEXTERITY: {
    name: "Dexterity",
    uniqueId: "dexterity",
    stacksWithSelf: false,
    countsForTouchAC: true,
    countsForFlatFootedAC: false,
  },
  NATURAL_ARMOR: {
    name: "Natural Armor",
    uniqueId: "naturalArmor",
    stacksWithSelf: false,
    countsForTouchAC: false,
    countsForFlatFootedAC: true,
  },
  NATURAL_ARMOR_ENHANCEMENT: {
    name: "Natural Armor Enhancement",
    uniqueId: "naturalArmorEnhancement",
    stacksWithSelf: false,
    countsForTouchAC: false,
    countsForFlatFootedAC: true,
  },
};
