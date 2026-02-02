/**
 * D&D 3.5 SRD Armors
 * Auto-generated from D35E Foundry VTT data
 * Source: https://github.com/Rughalt/D35E
 */

import type { StandardEntity } from '@zukus/core';

/**
 * Extended entity type with dynamic fields.
 * The fields are defined by the schema addons (dnd35item, effectful, etc.)
 */
type ExtendedEntity = StandardEntity & Record<string, unknown>;

export const srdArmors: ExtendedEntity[] = [
  {
    "id": "banded-mail",
    "entityType": "armor",
    "name": "Banded Mail",
    "description": "This armor is made of overlapping strips of metal sewn to a backing of leather and chainmail. The strips cover vulnerable areas, while the chain and leather protect the joints and provide freedom of movement. Straps and buckles distribute the weight evenly. The suit includes gauntlets.",
    "image": "ArmorIcons/BasicArmor_Icons/Chest_13.webp",
    "weight": 35,
    "cost": {
      "amount": 250,
      "currency": "gp"
    },
    "armorBonus": 6,
    "maxDexBonus": 1,
    "armorCheckPenalty": -6,
    "arcaneSpellFailure": 35,
    "speed30": 20,
    "speed20": 15,
    "armorType": "heavy",
    "isMasterwork": false
  },
  {
    "id": "breastplate",
    "entityType": "armor",
    "name": "Breastplate",
    "description": "A breastplate covers your front and your back. It comes with a helmet and greaves (plates to cover your lower legs). A light suit or skirt of studded leather beneath the breastplate protects your limbs without restricting movement much.",
    "image": "ArmorIcons/BasicArmor_Icons/Chest_13.webp",
    "weight": 30,
    "cost": {
      "amount": 200,
      "currency": "gp"
    },
    "armorBonus": 5,
    "maxDexBonus": 3,
    "armorCheckPenalty": -4,
    "arcaneSpellFailure": 25,
    "speed30": 30,
    "speed20": 20,
    "armorType": "medium",
    "isMasterwork": false
  },
  {
    "id": "chain-shirt",
    "entityType": "armor",
    "name": "Chain Shirt",
    "description": "A chain shirt protects your torso while leaving your limbs free and mobile. It includes a layer of quilted fabric worn underneath to prevent chafing and to cushion the impact of blows. A chain shirt comes with a steel cap.",
    "image": "ArmorIcons/BasicArmor_Icons/Chest_13.webp",
    "weight": 25,
    "cost": {
      "amount": 100,
      "currency": "gp"
    },
    "armorBonus": 4,
    "maxDexBonus": 4,
    "armorCheckPenalty": -2,
    "arcaneSpellFailure": 20,
    "speed30": 30,
    "speed20": 20,
    "armorType": "light",
    "isMasterwork": false
  },
  {
    "id": "chainmail",
    "entityType": "armor",
    "name": "Chainmail",
    "description": "This armor is made of interlocking metal rings. It includes a layer of quilted fabric worn underneath to prevent chafing and to cushion the impact of blows. Several layers of mail are hung over vital areas. Most of the armor’s weight hangs from the shoulders, making chainmail uncomfortable to wear for long periods of time. The suit includes gauntlets.",
    "image": "ArmorIcons/BasicArmor_Icons/Chest_13.webp",
    "weight": 40,
    "cost": {
      "amount": 150,
      "currency": "gp"
    },
    "armorBonus": 5,
    "maxDexBonus": 2,
    "armorCheckPenalty": -5,
    "arcaneSpellFailure": 30,
    "speed30": 30,
    "speed20": 20,
    "armorType": "medium",
    "isMasterwork": false
  },
  {
    "id": "full-plate",
    "entityType": "armor",
    "name": "Full Plate",
    "description": "This armor consists of shaped and fitted metal plates riveted and interlocked to cover the entire body. The suit includes gauntlets, heavy leather boots, a visored helmet, and a thick layer of padding that is worn underneath the armor. Buckles and straps distribute the weight over the body, so full plate hampers movement less than splint mail even though splint is lighter. Each suit of full plate must be individually fitted to its owner by a master armorsmith, although a captured suit can be resized to fit a new owner at a cost of 200 to 800 (2d4 x 100) gold pieces. Full plate is also known as field plate.",
    "image": "ArmorIcons/BasicArmor_Icons/Chest_13.webp",
    "weight": 50,
    "cost": {
      "amount": 1500,
      "currency": "gp"
    },
    "armorBonus": 8,
    "maxDexBonus": 1,
    "armorCheckPenalty": -6,
    "arcaneSpellFailure": 35,
    "speed30": 20,
    "speed20": 15,
    "armorType": "heavy",
    "isMasterwork": false
  },
  {
    "id": "half-plate",
    "entityType": "armor",
    "name": "Half-Plate",
    "description": "This armor is a combination of chainmail with metal plates (breastplate, epaulettes, elbow guards, gauntlets, tasses, and greaves) covering vital areas. Buckles and straps hold the whole suit together and distribute the weight, but the armor still hangs more loosely than full plate. The suit includes gauntlets.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 50,
    "cost": {
      "amount": 600,
      "currency": "gp"
    },
    "armorBonus": 7,
    "maxDexBonus": 0,
    "armorCheckPenalty": -7,
    "arcaneSpellFailure": 40,
    "speed30": 20,
    "speed20": 15,
    "armorType": "heavy",
    "isMasterwork": false
  },
  {
    "id": "hide-armor",
    "entityType": "armor",
    "name": "Hide Armor",
    "description": "This armor is prepared from multiple layers of leather and animal hides. It is stiff and hard to move in. Druids, who wear only nonmetallic armor, favor hide.",
    "image": "ArmorIcons/BasicArmor_Icons/Chest_13.webp",
    "weight": 25,
    "cost": {
      "amount": 15,
      "currency": "gp"
    },
    "armorBonus": 3,
    "maxDexBonus": 4,
    "armorCheckPenalty": -3,
    "arcaneSpellFailure": 20,
    "speed30": 30,
    "speed20": 20,
    "armorType": "medium",
    "isMasterwork": false
  },
  {
    "id": "leather-armor",
    "entityType": "armor",
    "name": "Leather Armor",
    "description": "The breastplate and shoulder protectors of this armor are made of leather that has been stiffened by boiling in oil. The rest of the armor is made of softer and more flexible leather.",
    "image": "ArmorIcons/BasicArmor_Icons/Chest_13.webp",
    "weight": 15,
    "cost": {
      "amount": 10,
      "currency": "gp"
    },
    "armorBonus": 2,
    "maxDexBonus": 6,
    "armorCheckPenalty": 0,
    "arcaneSpellFailure": 10,
    "speed30": 30,
    "speed20": 20,
    "armorType": "light",
    "isMasterwork": false
  },
  {
    "id": "padded-armor",
    "entityType": "armor",
    "name": "Padded Armor",
    "description": "Padded armor features quilted layers of cloth and batting. It gets hot quickly and can become foul with sweat, grime, lice, and fleas.",
    "image": "ArmorIcons/BasicArmor_Icons/Chest_13.webp",
    "weight": 10,
    "cost": {
      "amount": 5,
      "currency": "gp"
    },
    "armorBonus": 1,
    "maxDexBonus": 8,
    "armorCheckPenalty": 0,
    "arcaneSpellFailure": 5,
    "speed30": 30,
    "speed20": 20,
    "armorType": "light",
    "isMasterwork": false
  },
  {
    "id": "scale-mail",
    "entityType": "armor",
    "name": "Scale Mail",
    "description": "This armor consists of a coat and leggings (and perhaps a separate skirt) of leather covered with overlapping pieces of metal, much like the scales of a fish. The suit includes gauntlets.",
    "image": "ArmorIcons/BasicArmor_Icons/Chest_13.webp",
    "weight": 30,
    "cost": {
      "amount": 50,
      "currency": "gp"
    },
    "armorBonus": 4,
    "maxDexBonus": 3,
    "armorCheckPenalty": -4,
    "arcaneSpellFailure": 25,
    "speed30": 30,
    "speed20": 20,
    "armorType": "medium",
    "isMasterwork": false
  },
  {
    "id": "splint-mail",
    "entityType": "armor",
    "name": "Splint Mail",
    "description": "This armor is made of narrow vertical strips of metal riveted to a backing of leather that is worn over cloth padding. Flexible chainmail protects the joints. The suit includes gauntlets.",
    "image": "ArmorIcons/BasicArmor_Icons/Chest_13.webp",
    "weight": 45,
    "cost": {
      "amount": 200,
      "currency": "gp"
    },
    "armorBonus": 6,
    "maxDexBonus": 0,
    "armorCheckPenalty": -7,
    "arcaneSpellFailure": 40,
    "speed30": 20,
    "speed20": 15,
    "armorType": "heavy",
    "isMasterwork": false
  },
  {
    "id": "studded-leather-armor",
    "entityType": "armor",
    "name": "Studded Leather Armor",
    "description": "This armor is made from tough but flexible leather (not hardened leather as with normal leather armor) reinforced with close-set metal rivets.",
    "image": "ArmorIcons/BasicArmor_Icons/Chest_13.webp",
    "weight": 20,
    "cost": {
      "amount": 25,
      "currency": "gp"
    },
    "armorBonus": 3,
    "maxDexBonus": 5,
    "armorCheckPenalty": -1,
    "arcaneSpellFailure": 15,
    "speed30": 30,
    "speed20": 20,
    "armorType": "light",
    "isMasterwork": false
  }
];
