import { Buff } from "../../domain/character/baseData/buffs";
import { buildACChange } from "../changes/changeBuilder";

export const mageArmor: Buff = {
    active: true,
    description: "mage armor description",
    name: "mage armor",
    originName: "mage armor",
    originType: "spell",
    originUniqueId: "mage armor",
    uniqueId: "mage armor",
    changes: [
        buildACChange("4", "ARMOR")
    ],
    specialChanges: [],
};
