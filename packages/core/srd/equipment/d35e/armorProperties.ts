/**
 * D&D 3.5 SRD Armor Properties
 * Auto-generated from D35E Foundry VTT data
 * Source: https://github.com/Rughalt/D35E
 */

import type { StandardEntity } from '@zukus/core';

/**
 * Extended entity type with dynamic fields.
 * The fields are defined by the schema addons (dnd35item, effectful, etc.)
 */
type ExtendedEntity = StandardEntity & Record<string, unknown>;

export const srdArmorProperties: ExtendedEntity[] = [
  {
    "id": "1-armor-enhancement",
    "entityType": "armorProperty",
    "name": "+1 Armor Enhancement",
    "description": "Magic weapons have enhancement bonuses ranging from +1 to +5. They apply these bonuses to both attack and damage rolls when used in combat. All magic weapons are also masterwork weapons, but their masterwork bonus on attack rolls does not stack with their enhancement bonus on attack rolls.",
    "costType": "flat",
    "craftingPrerequisites": [
      ""
    ],
    "casterLevel": 0,
    "aura": ""
  },
  {
    "id": "acid-resistance",
    "entityType": "armorProperty",
    "name": "Acid Resistance",
    "description": "A suit of armor or a shield with this property normally has a dull gray appearance. The armor absorbs the first 10 points of acid damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 3rd; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 3,
    "aura": ""
  },
  {
    "id": "acid-resistance-greater",
    "entityType": "armorProperty",
    "name": "Acid Resistance, Greater",
    "description": "A suit of armor or a shield with this property normally has a dull gray appearance. The armor absorbs the first 30 points of acid damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 11th; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 11,
    "aura": ""
  },
  {
    "id": "acid-resistance-improved",
    "entityType": "armorProperty",
    "name": "Acid Resistance, Improved",
    "description": "A suit of armor or a shield with this property normally has a dull gray appearance. The armor absorbs the first 20 points of acid damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 7th; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 7,
    "aura": ""
  },
  {
    "id": "animated",
    "entityType": "armorProperty",
    "name": "Animated",
    "description": "Upon command, an animated shield floats within 2 feet of the wielder, protecting her as if she were using it herself but freeing up both her hands. Only one shield can protect a character at a time. A character with an animated shield still takes any penalties associated with shield use, such as armor check penalty, arcane spell failure chance, and nonproficiency.",
    "costType": "bonus",
    "costBonus": 2,
    "craftingPrerequisites": [
      "CL 12th; Craft Magic Arms and Armor, animate objects"
    ],
    "casterLevel": 12,
    "aura": ""
  },
  {
    "id": "arrow-catching",
    "entityType": "armorProperty",
    "name": "Arrow Catching",
    "description": "A shield with this ability attracts ranged weapons to it. It has a deflection bonus of +1 against ranged weapons because projectiles and thrown weapons veer toward it. Additionally, any projectile or thrown weapon aimed at a target within 5 feet of the shield’s wearer diverts from its original target and targets the shield’s bearer instead. (If the wielder has total cover relative to the attacker, the projectile or thrown weapon is not diverted.) Additionally, those attacking the wearer with ranged weapons ignore any miss chances that would normally apply. Projectiles and thrown weapons that have an enhancement bonus higher than the shield’s base AC bonus are not diverted to the wearer (but the shield’s increased AC bonus still applies against these weapons). The wielder can activate or deactivate this ability with a command word.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, entropic shield"
    ],
    "casterLevel": 8,
    "aura": ""
  },
  {
    "id": "arrow-deflection",
    "entityType": "armorProperty",
    "name": "Arrow Deflection",
    "description": "A shield with this ability protects the wielder from ranged attacks. Once per round when he would normally be struck by a ranged weapon, he can make a DC 20 Reflex save. If the ranged weapon has an enhancement bonus, the DC increases by that amount. If he succeeds, the shield deflects the weapon. He must be aware of the attack and not flat-footed. Attempting to deflect a ranged weapon doesn’t count as an action. Exceptional ranged weapons, such as boulders hurled by giants or acid arrows, can’t be deflected.",
    "costType": "bonus",
    "costBonus": 2,
    "craftingPrerequisites": [
      "CL 5th; Craft Magic Arms and Armor, shield"
    ],
    "casterLevel": 5,
    "aura": ""
  },
  {
    "id": "bashing",
    "entityType": "armorProperty",
    "name": "Bashing",
    "description": "A shield with this special ability is designed to perform a shield bash. A bashing shield deals damage as if it were a weapon of two size categories larger (a Medium light shield thus deals 1d6 points of damage and a Medium heavy shield deals 1d8 points of damage). The shield acts as a +1 weapon when used to bash. (Only light and heavy shields can have this ability.)",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, bull’s strength;"
    ],
    "casterLevel": 8,
    "aura": ""
  },
  {
    "id": "blinding",
    "entityType": "armorProperty",
    "name": "Blinding",
    "description": "A shield with this ability flashes with a brilliant light up to twice per day upon command of the wielder. Anyone within 20 feet except the wielder must make a DC 14 Reflex save or be blinded for 1d4 rounds.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 7th; Craft Magic Arms and Armor, searing light;"
    ],
    "casterLevel": 7,
    "aura": ""
  },
  {
    "id": "cold-resistance",
    "entityType": "armorProperty",
    "name": "Cold Resistance",
    "description": "A suit of armor or a shield with this property normally has a bluish, icy hue or is adorned with furs and shaggy pelts. The armor absorbs the first 10 points of cold damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 3rd; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 3,
    "aura": ""
  },
  {
    "id": "cold-resistance-greater",
    "entityType": "armorProperty",
    "name": "Cold Resistance, Greater",
    "description": "A suit of armor or a shield with this property normally has a bluish, icy hue or is adorned with furs and shaggy pelts. The armor absorbs the first 30 points of cold damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 11th; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 11,
    "aura": ""
  },
  {
    "id": "cold-resistance-improved",
    "entityType": "armorProperty",
    "name": "Cold Resistance, Improved",
    "description": "A suit of armor or a shield with this property normally has a bluish, icy hue or is adorned with furs and shaggy pelts. The armor absorbs the first 20 points of cold damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 7th; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 7,
    "aura": ""
  },
  {
    "id": "electricity-resistance",
    "entityType": "armorProperty",
    "name": "Electricity Resistance",
    "description": "A suit of armor or a shield with this property normally has a bluish hue and often bears a storm or lightning motif. The armor absorbs the first 10 points of electricity damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 3rd; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 3,
    "aura": ""
  },
  {
    "id": "electricity-resistance-greater",
    "entityType": "armorProperty",
    "name": "Electricity Resistance, Greater",
    "description": "A suit of armor or a shield with this property normally has a bluish hue and often bears a storm or lightning motif. The armor absorbs the first 30 points of electricity damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 11th; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 11,
    "aura": ""
  },
  {
    "id": "electricity-resistance-improved",
    "entityType": "armorProperty",
    "name": "Electricity Resistance, Improved",
    "description": "A suit of armor or a shield with this property normally has a bluish hue and often bears a storm or lightning motif. The armor absorbs the first 20 points of electricity damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 7th; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 7,
    "aura": ""
  },
  {
    "id": "etherealness",
    "entityType": "armorProperty",
    "name": "Etherealness",
    "description": "On command, this ability allows the wearer of the armor to become ethereal (as the ethereal jaunt spell) once per day. The character can remain ethereal for as long as desired, but once he returns to normal, he cannot become ethereal again that day.",
    "costType": "flat",
    "casterLevel": 0,
    "aura": ""
  },
  {
    "id": "fire-resistance",
    "entityType": "armorProperty",
    "name": "Fire Resistance",
    "description": "A suit of armor with this ability normally has a reddish hue and often is decorated with a draconic motif. The armor absorbs the first 10 points of fire damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 3rd; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 3,
    "aura": ""
  },
  {
    "id": "fire-resistance-greater",
    "entityType": "armorProperty",
    "name": "Fire Resistance, Greater",
    "description": "A suit of armor with this ability normally has a reddish hue and often is decorated with a draconic motif. The armor absorbs the first 30 points of fire damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 11th; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 11,
    "aura": ""
  },
  {
    "id": "fire-resistance-improved",
    "entityType": "armorProperty",
    "name": "Fire Resistance, Improved",
    "description": "A suit of armor with this ability normally has a reddish hue and often is decorated with a draconic motif. The armor absorbs the first 20 points of fire damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 7th; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 7,
    "aura": ""
  },
  {
    "id": "fortification",
    "entityType": "armorProperty",
    "name": "Fortification",
    "description": "This suit of armor or shield produces a magical force that protects vital areas of the wearer more effectively. When a critical hit or sneak attack is scored on the wearer, there is a chance that the critical hit or sneak attack is negated and damage is instead rolled normally. Enhancement Fortification Type Chance for normal Damage Base Price Mod 1 Light 25% +1 bonus 2 Moderate 75% +3 bonus 3 Heavy 100% +5 bonus",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 13th; Craft Magic Arms and Armor, limited wish or miracle"
    ],
    "casterLevel": 13,
    "aura": ""
  },
  {
    "id": "glamered",
    "entityType": "armorProperty",
    "name": "Glamered",
    "description": "A suit of armor with this ability appears normal. Upon command, the armor changes shape and form to assume the appearance of a normal set of clothing. The armor retains all its properties (including weight) when glamered. Only a true seeing spell or similar magic reveals the true nature of the armor when disguised.",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 10th; Craft Magic Arms and Armor, disguise self;"
    ],
    "casterLevel": 10,
    "aura": ""
  },
  {
    "id": "invulnerability",
    "entityType": "armorProperty",
    "name": "Invulnerability",
    "description": "This suit of armor grants the wearer damage reduction of 5/magic.",
    "costType": "bonus",
    "costBonus": 3,
    "craftingPrerequisites": [
      "CL 18th; Craft Magic Arms and Armor, stoneskin, wish or miracle"
    ],
    "casterLevel": 18,
    "aura": ""
  },
  {
    "id": "reflecting",
    "entityType": "armorProperty",
    "name": "Reflecting",
    "description": "This shield seems like a mirror. Its surface is completely reflective. Once per day, it can be called on to reflect a spell back at its caster exactly like the Spell Turning spell",
    "costType": "bonus",
    "costBonus": 5,
    "craftingPrerequisites": [
      "CL 14th; Craft Magic Arms and Armor, spell turning"
    ],
    "casterLevel": 14,
    "aura": ""
  },
  {
    "id": "shadow",
    "entityType": "armorProperty",
    "name": "Shadow",
    "description": "This armor is jet black and blurs the wearer whenever she tries to hide, granting a +5 competence bonus on Hide checks. (The armor's armor check penalty still applies normally.) Set Enhancement level from 1 to 3 to set enhancement strength: Standard Improved Greater",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 5th/10th/15th; Craft Magic Arms and Armor, invisibility"
    ],
    "casterLevel": 5,
    "aura": ""
  },
  {
    "id": "silent-moves",
    "entityType": "armorProperty",
    "name": "Silent Moves",
    "description": "This armor is well oiled and magically constructed so that it not only makes little sound, but it dampens sound around it, granting a +5/+10/+15 competence bonus on Move Silently checks. (The armor’s armor check penalty still applies normally.) Set Enhancement level from 1 to 3 to set enhancement strength: Standard (+5) Improved (+10) Greater (+15)",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 5th/10th/15th; Craft Magic Arms and Armor, silence"
    ],
    "casterLevel": 5,
    "aura": ""
  },
  {
    "id": "slick",
    "entityType": "armorProperty",
    "name": "Slick",
    "description": "Slick armor seems coated at all times with a slightly greasy oil, granting a +5/+10/+15 competence bonus on Escape Artist checks. (The armor's armor check penalty still applies normally.) Set Enhancement level from 1 to 3 to set enhancement strength: Standard (+5) Improved (+10) Greater (+15)",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 5th/10th/15th; Craft Magic Arms and Armor, silence"
    ],
    "casterLevel": 5,
    "aura": ""
  },
  {
    "id": "sonic-resistance",
    "entityType": "armorProperty",
    "name": "Sonic Resistance",
    "description": "A suit of armor or a shield with this property normally has a glistening appearance. The armor absorbs the first 10 points of sonic damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 3rd; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 3,
    "aura": ""
  },
  {
    "id": "sonic-resistance-greater",
    "entityType": "armorProperty",
    "name": "Sonic Resistance, Greater",
    "description": "A suit of armor or a shield with this property normally has a glistening appearance. The armor absorbs the first 30 points of sonic damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 11th; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 11,
    "aura": ""
  },
  {
    "id": "sonic-resistance-improved",
    "entityType": "armorProperty",
    "name": "Sonic Resistance, Improved",
    "description": "A suit of armor or a shield with this property normally has a glistening appearance. The armor absorbs the first 20 points of sonic damage per attack that the wearer would normally take (similar to the resist energy spell).",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 7th; Craft Magic Arms and Armor, resist energy"
    ],
    "casterLevel": 7,
    "aura": ""
  },
  {
    "id": "undead-controlling",
    "entityType": "armorProperty",
    "name": "Undead Controlling",
    "description": "The wearer of a suit of armor or a shield with this property may control up to 26 HD of undead per day, as the Control Undead spell. At dawn each day, the wearer loses control of any undead still under his sway. Armor or a shield with this ability appears to be made of bone; this feature is entirely decorative and has no other effect on the armor.",
    "costType": "flat",
    "craftingPrerequisites": [
      "CL 13th; Craft Magic Arms and Armor, control undead"
    ],
    "casterLevel": 13,
    "aura": ""
  },
  {
    "id": "wild",
    "entityType": "armorProperty",
    "name": "Wild",
    "description": "The wearer of a suit of armor or a shield with this ability preserves his armor bonus (and any enhancement bonus) while in a wild shape. Armor and shields with this ability usually appear to be made covered in leaf patterns. While the wearer is in a wild shape, the armor cannot be seen.",
    "costType": "bonus",
    "costBonus": 3,
    "craftingPrerequisites": [
      "CL 9th; Craft Magic Arms and Armor, baleful polymorph;"
    ],
    "casterLevel": 9,
    "aura": ""
  }
];
