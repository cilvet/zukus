import { Change } from "../../domain/character/baseData/changes";
import { BaseItem, Item, ItemTypes } from "../../domain/character/baseData/equipment";

export function buildItem() {
  const item: Item = {
    itemType: "MISC",
    uniqueId: "itemUniqueId",
    name: "item name",
    description: "item description",
    weight: 0,
    changes: [],
    specialChanges: [],
    equippedChanges: [],
    equipable: true,
    contextualChanges: [],
    equipped: true,
  };

  return {
    withChange: function (change: Change) {
      item.changes!.push(change);
      return this;
    },
    withEquippedChange: function (change: Change) {
      item.equippedChanges!.push(change);
      return this;
    },
    equipped: function (equipped: boolean = true) {
      item.equipped = equipped;
      return this;
    },
    build: function () {
      return item;
    },
  };
}
