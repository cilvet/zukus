import { ChangeTypes } from "../../core/domain/character/baseData/changes";
import { WeaponEnhancement } from "../../core/domain/weapons/weaponEnhancements";

export const flaming: WeaponEnhancement = {
  name: "Flaming",
  description: "",
  casterLevel: 0,
  cost: {
    type: "bonus",
    bonus: 1,
  },
  uniqueId: "enhancement-flaming",
  wieldedChanges: [
    {
      type: 'DAMAGE',
      bonusTypeId: "UNTYPED",
      damageType: {
        damageType: "fire",
        type: "basic",
      },
      formula: {
        expression: "1d6",
      },
    },
  ],
};

export const holy: WeaponEnhancement = {
  name: "Holy",
  description: "",
  casterLevel: 0,
  cost: {
    type: "bonus",
    bonus: 2,
  },
  uniqueId: "enhancement-holy",
  wieldedContextChanges: [
    {
      name: "Holy",
      optional: true,
      type: "attack",
      variables: [],
      appliesTo: "all",
      available: true,
      changes: [
        {
          type: 'DAMAGE',
          bonusTypeId: "SACRED",
          damageType: {
            damageType: "sacred",
            type: "basic",
          },
          formula: {
            expression: "2d6",
          },
          name: "Holy",
          originId: "enhancement-holy",
          originType: "item",
        },
      ],
    },
  ],
};