import { Change } from "../../character/baseData/changes";
import { AttackContextualChange } from "../../character/baseData/contextualChange";

export type ItemEnhancementBonusCost = {
  type: "bonus";
  bonus: number;
};

export type ItemEnhancementStaticCost = {
  type: "static";
  cost: number;
};

export type ItemEnhancementCost =
  | ItemEnhancementBonusCost
  | ItemEnhancementStaticCost;

export type ItemEnhancement = {
  uniqueId: string;
  name: string;
  description: string;
  cost: ItemEnhancementCost;
  casterLevel: number;
  equippedChanges?: Change[];
  equippedContextChanges?: AttackContextualChange[];
  wieldedChanges?: Change[];
  wieldedContextChanges?: AttackContextualChange[];
  weaponOnlyChanges?: Change[];
  weaponOnlyContextualChanges?: AttackContextualChange[];
};
