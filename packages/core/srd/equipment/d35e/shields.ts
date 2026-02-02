/**
 * D&D 3.5 SRD Shields
 * Auto-generated from D35E Foundry VTT data
 * Source: https://github.com/Rughalt/D35E
 */

import type { StandardEntity } from '@zukus/core';

/**
 * Extended entity type with dynamic fields.
 * The fields are defined by the schema addons (dnd35item, effectful, etc.)
 */
type ExtendedEntity = StandardEntity & Record<string, unknown>;

export const srdShields: ExtendedEntity[] = [
  {
    "id": "buckler",
    "entityType": "shield",
    "name": "Buckler",
    "description": "This small metal shield is worn strapped to your forearm. You can use a bow or crossbow without penalty while carrying it. You can also use your shield arm to wield a weapon (whether you are using an off-hand weapon or using your off hand to help wield a two-handed weapon), but you take a –1 penalty on attack rolls while doing so because of the extra weight on your arm. This penalty stacks with those that may apply for fighting with your off hand and for fighting with two weapons. In any case, if you use a weapon in your off hand, you don’t get the buckler’s AC bonus for the rest of the round.",
    "image": "WeaponIcons/WeaponIconsVol1/shield_07.webp",
    "weight": 5,
    "cost": {
      "amount": 15,
      "currency": "gp"
    },
    "shieldBonus": 1,
    "armorCheckPenalty": -1,
    "arcaneSpellFailure": 5,
    "shieldType": "light",
    "isMasterwork": false
  },
  {
    "id": "heavy-steel-shield",
    "entityType": "shield",
    "name": "Heavy Steel Shield",
    "description": "You strap a shield to your forearm and grip it with your hand. A heavy shield is so heavy that you can’t use your shield hand for anything else. Wooden or Steel: Wooden and steel shields offer the same basic protection, though they respond differently to special attacks (such as warp wood and heat metal). Shield Bash Attacks: You can bash an opponent with a heavy shield, using it as an off-hand weapon. See Table 7–5: Weapons for the damage dealt by a shield bash. Used this way, a heavy shield is a martial bludgeoning weapon. For the purpose of penalties on attack rolls, treat a heavy shield as a one-handed weapon. If you use your shield as a weapon, you lose its AC bonus until your next action (usually until the next round). An enhancement bonus on a shield does not improve the effectiveness of a shield bash made with it, but the shield can be made into a magic weapon in its own right.",
    "image": "WeaponIcons/WeaponIconsVol1/shield_07.webp",
    "weight": 15,
    "cost": {
      "amount": 20,
      "currency": "gp"
    },
    "shieldBonus": 2,
    "armorCheckPenalty": -2,
    "arcaneSpellFailure": 15,
    "shieldType": "heavy",
    "isMasterwork": false
  },
  {
    "id": "heavy-wooden-shield",
    "entityType": "shield",
    "name": "Heavy Wooden Shield",
    "description": "You strap a shield to your forearm and grip it with your hand. A heavy shield is so heavy that you can’t use your shield hand for anything else. Wooden or Steel: Wooden and steel shields offer the same basic protection, though they respond differently to special attacks (such as warp wood and heat metal). Shield Bash Attacks: You can bash an opponent with a heavy shield, using it as an off-hand weapon. See Table 7–5: Weapons for the damage dealt by a shield bash. Used this way, a heavy shield is a martial bludgeoning weapon. For the purpose of penalties on attack rolls, treat a heavy shield as a one-handed weapon. If you use your shield as a weapon, you lose its AC bonus until your next action (usually until the next round). An enhancement bonus on a shield does not improve the effectiveness of a shield bash made with it, but the shield can be made into a magic weapon in its own right.",
    "image": "WeaponIcons/WeaponIconsVol1/shield_07.webp",
    "weight": 10,
    "cost": {
      "amount": 7,
      "currency": "gp"
    },
    "shieldBonus": 2,
    "armorCheckPenalty": -2,
    "arcaneSpellFailure": 15,
    "shieldType": "heavy",
    "isMasterwork": false
  },
  {
    "id": "light-steel-shield",
    "entityType": "shield",
    "name": "Light Steel Shield",
    "description": "You strap a shield to your forearm and grip it with your hand. A light shield’s weight lets you carry other items in that hand, although you cannot use weapons with it. Wooden or Steel: Wooden and steel shields offer the same basic protection, though they respond differently to special attacks (such as warp wood and heat metal). Shield Bash Attacks: You can bash an opponent with a light shield, using it as an off-hand weapon. See Table 7–5: Weapons for the damage dealt by a shield bash. Used this way, a light shield is a martial bludgeoning weapon. For the purpose of penalties on attack rolls, treat a light shield as a light weapon. If you use your shield as a weapon, you lose its AC bonus until your next action (usually until the next round). An enhancement bonus on a shield does not improve the effectiveness of a shield bash made with it, but theshield can be made into a magic weapon in its own right.",
    "image": "WeaponIcons/WeaponIconsVol1/shield_07.webp",
    "weight": 6,
    "cost": {
      "amount": 9,
      "currency": "gp"
    },
    "shieldBonus": 1,
    "armorCheckPenalty": -1,
    "arcaneSpellFailure": 5,
    "shieldType": "light",
    "isMasterwork": false
  },
  {
    "id": "light-wooden-shield",
    "entityType": "shield",
    "name": "Light Wooden Shield",
    "description": "You strap a shield to your forearm and grip it with your hand. A light shield’s weight lets you carry other items in that hand, although you cannot use weapons with it. Wooden or Steel: Wooden and steel shields offer the same basic protection, though they respond differently to special attacks (such as warp wood and heat metal). Shield Bash Attacks: You can bash an opponent with a light shield, using it as an off-hand weapon. See Table 7–5: Weapons for the damage dealt by a shield bash. Used this way, a light shield is a martial bludgeoning weapon. For the purpose of penalties on attack rolls, treat a light shield as a light weapon. If you use your shield as a weapon, you lose its AC bonus until your next action (usually until the next round). An enhancement bonus on a shield does not improve the effectiveness of a shield bash made with it, but theshield can be made into a magic weapon in its own right.",
    "image": "WeaponIcons/WeaponIconsVol1/shield_07.webp",
    "weight": 5,
    "cost": {
      "amount": 3,
      "currency": "gp"
    },
    "shieldBonus": 1,
    "armorCheckPenalty": -1,
    "arcaneSpellFailure": 5,
    "shieldType": "light",
    "isMasterwork": false
  },
  {
    "id": "tower-shield",
    "entityType": "shield",
    "name": "Tower Shield",
    "description": "This massive wooden shield is nearly as tall as you are. In most situations, it provides the indicated shield bonus to your AC. However, you can instead use it as total cover, though you must give up your attacks to do so. The shield does not, however, provide cover against targeted spells; a spellcaster can cast a spell on you by targeting the shield you are holding. You cannot bash with a tower shield, nor can you use your shield hand for anything else. When employing a tower shield in combat, you take a -2 penalty on attack rolls because of the shield's encumbrance.",
    "image": "WeaponIcons/WeaponIconsVol1/shield_07.webp",
    "weight": 45,
    "cost": {
      "amount": 30,
      "currency": "gp"
    },
    "shieldBonus": 4,
    "armorCheckPenalty": -10,
    "arcaneSpellFailure": 50,
    "shieldType": "tower",
    "isMasterwork": false
  }
];
