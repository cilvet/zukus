import { ChangeTypes, BonusTypes } from "../../../../domain/character/baseData/changes";
import { BaseItem, Belt, Gloves, Item } from "../../../../domain/character/baseData/equipment";

export const beltOfPhysicalPerfection: Belt = {
  itemType: "BELT",
  uniqueId: "beltOfPhysicalPerfection",
  name: "Belt of Physical Perfection +2",
  equipable: true,
  equipped: true,
  description: "Belt of Physical Perfection +2",
  weight: 0,
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
      abilityUniqueId: "dexterity",
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
        expression: "2",
      },
    },
  ],
};

export const glovesOfDexterity: Gloves = {
  itemType: "GLOVES",
  equipable: true,
  equipped: true,
  uniqueId: "glovesOfDexterity",
  name: "Gloves of Dexterity +2",
  description: `Gloves of Dexterity: These thin leather gloves are very flexible and allow for delicate manipulation. They add to the wearer’s Dexterity score in the form of an enhancement bonus of +2, +4, or +6. Both gloves must be worn for the magic to be effective.

  Moderate transmutation; CL 8th; Craft Wondrous Item, cat’s grace; Price 4,000 gp (+2), 16,000 gp (+4), 36,000 gp (+6).`,
  weight: 0,
  changes: [
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: "dexterity",
      bonusTypeId: "ENHANCEMENT",
      formula: {
        expression: '2'
      }
    },
  ],
};

export const beltOfGiantStrength: Belt = {
  itemType: "BELT",
  equipable: true,
  equipped: true,
  uniqueId: "beltOfGiantStrength",
  name: "Belt of Giant Strength +4",
  description: `Belt of Giant Strength: This wide belt is made of thick leather and studded with iron. The belt adds to the wearer's Strength score in the form of an enhancement bonus of +4 or +6.

  Moderate transmutation; CL 10th; Craft Wondrous Item, bull's strength; Price 16,000 gp (+4), 36,000 gp (+6);Weight 1 lb.`,
  weight: 0,
  changes: [
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: "strength",
      bonusTypeId: "ENHANCEMENT",
      formula: {
        expression: '4'
      }
    },
  ],
};
