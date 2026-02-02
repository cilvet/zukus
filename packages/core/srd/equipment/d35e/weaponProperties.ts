/**
 * D&D 3.5 SRD Weapon Properties
 * Auto-generated from D35E Foundry VTT data
 * Source: https://github.com/Rughalt/D35E
 */

import type { StandardEntity } from '@zukus/core';

/**
 * Extended entity type with dynamic fields.
 * The fields are defined by the schema addons (dnd35item, effectful, etc.)
 */
type ExtendedEntity = StandardEntity & Record<string, unknown>;

export const srdWeaponProperties: ExtendedEntity[] = [
  {
    "id": "1-weapon-enhancement",
    "entityType": "weaponProperty",
    "name": "+1 Weapon Enhancement",
    "description": "Magic weapons have enhancement bonuses ranging from +1 to +5. They apply these bonuses to both attack and damage rolls when used in combat. All magic weapons are also masterwork weapons, but their masterwork bonus on attack rolls does not stack with their enhancement bonus on attack rolls.",
    "costType": "flat",
    "craftingPrerequisites": [
      ""
    ],
    "casterLevel": 0,
    "aura": ""
  },
  {
    "id": "anarchic",
    "entityType": "weaponProperty",
    "name": "Anarchic",
    "description": "An anarchic weapon is chaotically aligned and infused with the power of chaos. It makes the weapon chaos-aligned and thus bypasses the corresponding damage reduction. It deals an extra 2d6 points of damage against all of lawful alignment. It bestows one negative level on any lawful creature attempting to wield it. The negative level remains as long as the weapon is in hand and disappears when the weapon is no longer wielded. This negative level never results in actual level loss, but it cannot be overcome in any way (including restoration spells) while the weapon is wielded. Bows, crossbows, and slings so crafted bestow the chaotic power upon their ammunition.",
    "costType": "bonus",
    "costBonus": 2,
    "craftingPrerequisites": [
      "CL 7th; Craft Magic Arms and Armor, chaos hammer, creator must be chaotic"
    ],
    "casterLevel": 7,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "axiomatic",
    "entityType": "weaponProperty",
    "name": "Axiomatic",
    "description": "An axiomatic weapon is lawfully aligned and infused with the power of law. It makes the weapon law-aligned and thus bypasses the corresponding damage reduction. It deals an extra 2d6 points of damage against all of chaotic alignment. It bestows one negative level on any chaotic creature attempting to wield it. The negative level remains as long as the weapon is in hand and disappears when the weapon is no longer wielded. This negative level never results in actual level loss, but it cannot be overcome in any way (including restoration spells) while the weapon is wielded. Bows, crossbows, and slings so crafted bestow the lawful power upon their ammunition.",
    "costType": "bonus",
    "costBonus": 2,
    "craftingPrerequisites": [
      "CL 7th; Craft Magic Arms and Armor, order’s wrath, creator must be lawful;"
    ],
    "casterLevel": 7,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-aberrations",
    "entityType": "weaponProperty",
    "name": "Bane of Aberrations",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-animals",
    "entityType": "weaponProperty",
    "name": "Bane of Animals",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-constructs",
    "entityType": "weaponProperty",
    "name": "Bane of Constructs",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-dragons",
    "entityType": "weaponProperty",
    "name": "Bane of Dragons",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-elementals",
    "entityType": "weaponProperty",
    "name": "Bane of Elementals",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-fey",
    "entityType": "weaponProperty",
    "name": "Bane of Fey",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-giants",
    "entityType": "weaponProperty",
    "name": "Bane of Giants",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-humanoids",
    "entityType": "weaponProperty",
    "name": "Bane of Humanoids",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-magical-beasts",
    "entityType": "weaponProperty",
    "name": "Bane of Magical Beasts",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-monstrous-humanoids",
    "entityType": "weaponProperty",
    "name": "Bane of Monstrous Humanoids",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-oozes",
    "entityType": "weaponProperty",
    "name": "Bane of Oozes",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-outsiders",
    "entityType": "weaponProperty",
    "name": "Bane of Outsiders",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-plants",
    "entityType": "weaponProperty",
    "name": "Bane of Plants",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-undead",
    "entityType": "weaponProperty",
    "name": "Bane of Undead",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "bane-of-vermin",
    "entityType": "weaponProperty",
    "name": "Bane of Vermin",
    "description": "A bane weapon excels at attacking one type or subtype of creature. Against its designated foe, its effective enhancement bonus is +2 better than its normal enhancement bonus. It deals an extra 2d6 points of damage against the foe. Bows, crossbows, and slings so crafted bestow the bane quality upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, summon monster I"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "brilliant-energy",
    "entityType": "weaponProperty",
    "name": "Brilliant Energy",
    "description": "A brilliant energy weapon has its significant portion transformed into light, although this does not modify the item's weight. It always gives off light as a torch (20-foot radius). A brilliant energy weapon ignores nonliving matter. Armor and shield bonuses to AC (including any enhancement bonuses to that armor) do not count against it because the weapon passes through armor. (Dexterity, deflection, dodge, natural armor, and other such bonuses still apply.) A brilliant energy weapon cannot harm undead, constructs, and objects. This property can only be applied to melee weapons, thrown weapons, and ammunition.",
    "costType": "bonus",
    "costBonus": 4,
    "craftingPrerequisites": [
      "CL 16th; Craft Magic Arms and Armor, gaseous form, continual flame"
    ],
    "casterLevel": 16,
    "aura": ""
  },
  {
    "id": "dancing",
    "entityType": "weaponProperty",
    "name": "Dancing",
    "description": "As a standard action, a dancing weapon can be loosed to attack on its own. It fights for 4 rounds using the base attack bonus of the one who loosed it and then drops. While dancing, it cannot make attacks of opportunity, and the person who activated it is not considered armed with the weapon. In all other respects, it is considered wielded or attended by the creature for all maneuvers and effects that target items. While dancing, it takes up the same space as the activating character and can attack adjacent foes (weapons with reach can attack opponents up to 10 feet away). The dancing weapon accompanies the person who activated it everywhere, whether she moves by physical or magical means. If the wielder who loosed it has an unoccupied hand, she can grasp it while it is attacking on its own as a free action; when so retrieved the weapon can’t dance (attack on its own) again for 4 rounds.",
    "costType": "bonus",
    "costBonus": 4,
    "craftingPrerequisites": [
      "CL 15th; Craft Magic Arms and Armor, animate objects"
    ],
    "casterLevel": 15,
    "aura": ""
  },
  {
    "id": "defending",
    "entityType": "weaponProperty",
    "name": "Defending",
    "description": "A defending weapon allows the wielder to transfer some or all of the sword’s enhancement bonus to his AC as a bonus that stacks with all others. As a free action, the wielder chooses how to allocate the weapon’s enhancement bonus at the start of his turn before using the weapon, and the effect to AC lasts until his next turn.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, shield or shield of faith"
    ],
    "casterLevel": 8,
    "aura": ""
  },
  {
    "id": "disruption",
    "entityType": "weaponProperty",
    "name": "Disruption",
    "description": "A weapon of disruption is the bane of all undead. Any undead creature struck in combat must succeed on a DC 14 Will save or be destroyed. A weapon of disruption must be a bludgeoning weapon. (If you roll this property randomly for a piercing or slashing weapon, reroll.)",
    "costType": "bonus",
    "costBonus": 2,
    "craftingPrerequisites": [
      "CL 14th; Craft Magic Arms and Armor, heal"
    ],
    "casterLevel": 14,
    "aura": ""
  },
  {
    "id": "distance",
    "entityType": "weaponProperty",
    "name": "Distance",
    "description": "This property can only be placed on a ranged weapon. A weapon of distance has double the range increment of other weapons of its kind.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 6th; Craft Magic Arms and Armor, clairaudience/clairvoyance"
    ],
    "casterLevel": 6,
    "aura": ""
  },
  {
    "id": "dread-of-undead",
    "entityType": "weaponProperty",
    "name": "Dread of Undead",
    "description": "A dread weapon excels at attacking one type of creature. Against its designated foe, its effective enhancement bonus is +4 better than its normal enhancement bonus. Further, it deals +4d6 points of bonus damage against the foe, and if it scores a successful critical hit against the foe, that creature must make a Fortitude save (DC 27) or be destroyed instantly and turned to dust. (This even affects creatures immune to critical hits or death magic.)",
    "costType": "bonus",
    "costBonus": 7,
    "craftingPrerequisites": [
      "Caster Level: 22nd; Prerequisites: Craft Magic Arms and Armor, Craft Epic Magic Arms and Armor, summon monster IX"
    ],
    "casterLevel": 0,
    "aura": ""
  },
  {
    "id": "everdancing",
    "entityType": "weaponProperty",
    "name": "Everdancing",
    "description": "An everdancing weapon is much like a dancing weapon, though it can be loosed with a free action and will fight as long as desired. It can move up to 60 feet away from its owner. Its owner can instruct it to move to a different target as a move-equivalent action. If its owner is rendered unconscious or otherwise unable to direct it, it will fight the same opponent as long as that opponent is conscious and within range. The owner of an everdancing weapon can grasp it again as a free action (assuming it is within reach).",
    "costType": "bonus",
    "costBonus": 8,
    "craftingPrerequisites": [
      "Caster Level: 23rd; Prerequisites: Craft Magic Arms and Armor, Craft Epic Magic Arms and Armor, animate objects"
    ],
    "casterLevel": 0,
    "aura": ""
  },
  {
    "id": "flaming",
    "entityType": "weaponProperty",
    "name": "Flaming",
    "description": "Upon command, a flaming weapon is sheathed in fire. The fire does not harm the wielder. The effect remains until another command is given. A flaming weapon deals an extra 1d6 points of fire damage on a successful hit. Bows, crossbows, and slings so crafted bestow the fire energy upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 10th; Craft Magic Arms and Armor and flame blade, flame strike, or fireball;"
    ],
    "casterLevel": 10,
    "aura": "",
    "bonusDamage": "1d6",
    "bonusDamageType": "Fire"
  },
  {
    "id": "flaming-burst",
    "entityType": "weaponProperty",
    "name": "Flaming Burst",
    "description": "A flaming burst weapon functions as a flaming weapon that also explodes with flame upon striking a successful critical hit. The fire does not harm the wielder. In addition to the extra fire damage from the flaming ability (see above), a flaming burst weapon deals an extra 1d10 points of fire damage on a successful critical hit. If the weapon’s critical multiplier is ×3, add an extra 2d10 points of fire damage instead, and if the multiplier is ×4, add an extra 3d10 points of fire damage. Bows, crossbows, and slings so crafted bestow the fire energy upon their ammunition. Even if the flaming ability is not active, the weapon still deals its extra fire damage on a successful critical hit.",
    "costType": "bonus",
    "costBonus": 2,
    "craftingPrerequisites": [
      "CL 12th; Craft Magic Arms and Armor and flame blade, flame strike, or fireball"
    ],
    "casterLevel": 12,
    "aura": "",
    "bonusDamage": "1d6+(((@critMult))-(1))d10",
    "bonusDamageType": "Fire"
  },
  {
    "id": "frost",
    "entityType": "weaponProperty",
    "name": "Frost",
    "description": "Upon command, a frost weapon is sheathed in icy cold. The cold does not harm the wielder. The effect remains until another command is given. A frost weapon deals an extra 1d6 points of cold damage on a successful hit. Bows, crossbows, and slings so crafted bestow the cold energy upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 10th; Craft Magic Arms and Armor and chill metal or ice storm;"
    ],
    "casterLevel": 10,
    "aura": "",
    "bonusDamage": "1d6",
    "bonusDamageType": "Cold"
  },
  {
    "id": "ghost-touch-weapon",
    "entityType": "weaponProperty",
    "name": "Ghost Touch, Weapon",
    "description": "A ghost touch weapon deals damage normally against incorporeal creatures, regardless of its bonus. (An incorporeal creature's 50% chance to avoid damage does not apply to attacks with ghost touch weapons.) The weapon can be picked up and moved by an incorporeal creature at any time. A manifesting ghost can wield the weapon against corporeal foes. Essentially, a ghost touch weapon counts as either corporeal or incorporeal at any given time, whichever is more beneficial to the wielder.",
    "costType": "bonus",
    "costBonus": 1,
    "casterLevel": 0,
    "aura": ""
  },
  {
    "id": "holy",
    "entityType": "weaponProperty",
    "name": "Holy",
    "description": "A holy weapon is imbued with holy power. This power makes the weapon good-aligned and thus bypasses the corresponding damage reduction. It deals an extra 2d6 points of damage against all of evil alignment. It bestows one negative level on any evil creature attempting to wield it. The negative level remains as long as the weapon is in hand and disappears when the weapon is no longer wielded. This negative level never results in actual level loss, but it cannot be overcome in any way (including restoration spells) while the weapon is wielded. Bows, crossbows, and slings so crafted bestow the holy power upon their ammunition.",
    "costType": "bonus",
    "costBonus": 2,
    "craftingPrerequisites": [
      "CL 7th; Craft Magic Arms and Armor, holy smite, creator must be good"
    ],
    "casterLevel": 7,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "icy-burst",
    "entityType": "weaponProperty",
    "name": "Icy Burst",
    "description": "An icy burst weapon functions as a frost weapon that also explodes with frost upon striking a successful critical hit. The frost does not harm the wielder. In addition to the extra damage from the frost ability, an icy burst weapon deals an extra 1d10 points of cold damage on a successful critical hit. If the weapon’s critical multiplier is ×3, add an extra 2d10 points of cold damage instead, and if the multiplier is ×4, add an extra 3d10 points. Bows, crossbows, and slings so crafted bestow the cold energy upon their ammunition. Even if the frost ability is not active, the weapon still deals its extra cold damage on a successful critical hit.",
    "costType": "bonus",
    "costBonus": 2,
    "craftingPrerequisites": [
      "CL 10th; Craft Magic Arms and Armor, chill metal or ice storm"
    ],
    "casterLevel": 10,
    "aura": "",
    "bonusDamage": "1d6+(((@critMult))-(1))d10",
    "bonusDamageType": "Cold"
  },
  {
    "id": "keen",
    "entityType": "weaponProperty",
    "name": "Keen",
    "description": "This ability doubles the threat range of a weapon. Only piercing or slashing weapons can be keen. (If you roll this property randomly for an inappropriate weapon, reroll.) This benefit doesn’t stack with any other effect that expands the threat range of a weapon (such as the keen edge spell or the Improved Critical feat).",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 10th; Craft Magical Arms and Armor, keen edge"
    ],
    "casterLevel": 10,
    "aura": ""
  },
  {
    "id": "ki-focus",
    "entityType": "weaponProperty",
    "name": "Ki Focus",
    "description": "The magic weapon serves as a channel for the wielder’s ki, allowing her to use her special ki attacks through the weapon as if they were unarmed attacks. These attacks include the monk’s stunning attack, ki strike, and quivering palm, as well as the Stunning Fist feat. Only melee weapons can have the ki focus ability.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, creator must be a monk"
    ],
    "casterLevel": 8,
    "aura": ""
  },
  {
    "id": "merciful",
    "entityType": "weaponProperty",
    "name": "Merciful",
    "description": "The weapon deals an extra 1d6 points of damage, and all damage it deals is nonlethal damage. On command, the weapon suppresses this ability until commanded to resume it. Bows, crossbows, and slings so crafted bestow the merciful effect upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 5th; Craft Magic Arms and Armor, cure light wounds"
    ],
    "casterLevel": 5,
    "aura": "",
    "bonusDamage": "1d6",
    "bonusDamageType": "Nonlethal"
  },
  {
    "id": "mighty-cleaving",
    "entityType": "weaponProperty",
    "name": "Mighty Cleaving",
    "description": "A mighty cleaving weapon allows a wielder with the Cleave feat to make one additional cleave attempt in a round.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, divine power"
    ],
    "casterLevel": 8,
    "aura": ""
  },
  {
    "id": "returning",
    "entityType": "weaponProperty",
    "name": "Returning",
    "description": "This special ability can only be placed on a weapon that can be thrown. A returning weapon flies through the air back to the creature that threw it. It returns to the thrower just before the creature’s next turn (and is therefore ready to use again in that turn). Catching a returning weapon when it comes back is a free action. If the character can’t catch it, or if the character has moved since throwing it, the weapon drops to the ground in the square from which it was thrown.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 7th; Craft Magic Arms and Armor, telekinesis"
    ],
    "casterLevel": 7,
    "aura": ""
  },
  {
    "id": "seeking",
    "entityType": "weaponProperty",
    "name": "Seeking",
    "description": "Only ranged weapons can have the seeking ability. The weapon veers toward its target, negating any miss chances that would otherwise apply, such as from concealment. (The wielder still has to aim the weapon at the right square. Arrows mistakenly shot into an empty space, for example, do not veer and hit invisible enemies, even if they are nearby.)",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 12th; Craft Magic Arms and Armor, true seeing"
    ],
    "casterLevel": 12,
    "aura": ""
  },
  {
    "id": "shock",
    "entityType": "weaponProperty",
    "name": "Shock",
    "description": "Upon command, a shock weapon is sheathed in crackling electricity. The electricity does not harm the wielder. The effect remains until another command is given. A shock weapon deals an extra 1d6 points of electricity damage on a successful hit. Bows, crossbows, and slings so crafted bestow the electricity energy upon their ammunition.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 8th; Craft Magic Arms and Armor, call lightning or lightning bolt"
    ],
    "casterLevel": 8,
    "aura": "",
    "bonusDamage": "1d6",
    "bonusDamageType": "Electricity"
  },
  {
    "id": "shocking-burst",
    "entityType": "weaponProperty",
    "name": "Shocking Burst",
    "description": "A shocking burst weapon functions as a shock weapon that also explodes with electricity upon striking a successful critical hit. The electricity does not harm the wielder. In addition to the extra electricity damage from the shock ability, a shocking burst weapon deals an extra 1d10 points of electricity damage on a successful critical hit. If the weapon’s critical multiplier is ×3, add an extra 2d10 points of electricity damage instead, and if the multiplier is ×4, add an extra 3d10 points. Bows, crossbows, and slings so crafted bestow the electricity energy upon their ammunition. Even if the shock ability is not active, the weapon still deals its extra electricity damage on a successful critical hit.",
    "costType": "bonus",
    "costBonus": 2,
    "craftingPrerequisites": [
      "CL 10th; Craft Magic Arms and Armor, call lightning or lightning bolt"
    ],
    "casterLevel": 10,
    "aura": "",
    "bonusDamage": "1d6+(((@critMult))-(1))d10",
    "bonusDamageType": "Electricity"
  },
  {
    "id": "speed",
    "entityType": "weaponProperty",
    "name": "Speed",
    "description": "When making a full attack action, the wielder of a speed weapon may make one extra attack with it. The attack uses the wielder's full base attack bonus, plus any modifiers appropriate to the situation. (This benefit is not cumulative with similar effects, such as a haste spell.)",
    "costType": "bonus",
    "costBonus": 3,
    "craftingPrerequisites": [
      "CL 7th; Craft Magic Arms and Armor, haste"
    ],
    "casterLevel": 7,
    "aura": ""
  },
  {
    "id": "spell-storing",
    "entityType": "weaponProperty",
    "name": "Spell Storing",
    "description": "A spell storing weapon allows a spellcaster to store a single targeted spell of up to 3rd level in the weapon. (The spell must have a casting time of 1 standard action.) Any time the weapon strikes a creature and the creature takes damage from it, the weapon can immediately cast the spell on that creature as a free action if the wielder desires. (This special ability is an exception to the general rule that casting a spell from an item takes at least as long as casting that spell normally.) Once the spell has been cast from the weapon, a spellcaster can cast any other targeted spell of up to 3rd level into it. The weapon magically imparts to the wielder the name of the spell currently stored within it. A randomly rolled spell storing weapon has a 50% chance to have a spell stored in it already.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 12th; Craft Magic Arms and Armor, creator must be a caster of at least 12th level;"
    ],
    "casterLevel": 12,
    "aura": ""
  },
  {
    "id": "throwing",
    "entityType": "weaponProperty",
    "name": "Throwing",
    "description": "This ability can only be placed on a melee weapon. A melee weapon crafted with this ability gains a range increment of 10 feet and can be thrown by a wielder proficient in its normal use.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 5th; Craft Magic Arms and Armor, magic stone"
    ],
    "casterLevel": 5,
    "aura": ""
  },
  {
    "id": "thundering",
    "entityType": "weaponProperty",
    "name": "Thundering",
    "description": "A thundering weapon creates a cacophonous roar like thunder upon striking a successful critical hit. The sonic energy does not harm the wielder. A thundering weapon deals an extra 1d8 points of sonic damage on a successful critical hit. If the weapon’s critical multiplier is ×3, add an extra 2d8 points of sonic damage instead, and if the multiplier is ×4, add an extra 3d8 points of sonic damage. Bows, crossbows, and slings so crafted bestow the sonic energy upon their ammunition. Subjects dealt a critical hit by a thundering weapon must make a DC 14 Fortitude save or be deafened permanently.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 5th; Craft Magic Arms and Armor, blindness/deafness"
    ],
    "casterLevel": 5,
    "aura": "",
    "bonusDamage": "(((@critMult))-(1))d10",
    "bonusDamageType": "Sonic"
  },
  {
    "id": "unholy",
    "entityType": "weaponProperty",
    "name": "Unholy",
    "description": "An unholy weapon is imbued with unholy power. This power makes the weapon evil-aligned and thus bypasses the corresponding damage reduction. It deals an extra 2d6 points of damage against all of good alignment. It bestows one negative level on any good creature attempting to wield it. The negative level remains as long as the weapon is in hand and disappears when the weapon is no longer wielded. This negative level never results in actual level loss, but it cannot be overcome in any way (including restoration spells) while the weapon is wielded. Bows, crossbows, and slings so crafted bestow the unholy power upon their ammunition.",
    "costType": "bonus",
    "costBonus": 2,
    "craftingPrerequisites": [
      "CL 7th; Craft Magic Arms and Armor, unholy blight, creator must be evil"
    ],
    "casterLevel": 7,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "vicious",
    "entityType": "weaponProperty",
    "name": "Vicious",
    "description": "When a vicious weapon strikes an opponent, it creates a flash of disruptive energy that resonates between the opponent and the wielder. This energy deals an extra 2d6 points of damage to the opponent and 1d6 points of damage to the wielder. Only melee weapons can be vicious.",
    "costType": "bonus",
    "costBonus": 1,
    "craftingPrerequisites": [
      "CL 9th; Craft Magic Arms and Armor, enervation"
    ],
    "casterLevel": 9,
    "aura": "",
    "bonusDamage": "2d6"
  },
  {
    "id": "vorpal",
    "entityType": "weaponProperty",
    "name": "Vorpal",
    "costType": "bonus",
    "costBonus": 5,
    "craftingPrerequisites": [
      "CL 18th; Craft Magic Arms and Armor, circle of death, keen edge"
    ],
    "casterLevel": 18,
    "aura": ""
  },
  {
    "id": "wounding",
    "entityType": "weaponProperty",
    "name": "Wounding",
    "description": "A wounding weapon deals 1 point of Constitution damage from blood loss when it hits a creature. A critical hit does not multiply the Constitution damage. Creatures immune to critical hits (such as plants and constructs) are immune to the Constitution damage dealt by this weapon.",
    "costType": "bonus",
    "costBonus": 2,
    "craftingPrerequisites": [
      "CL 10th; Craft Magic Arms and Armor, mage’s sword"
    ],
    "casterLevel": 10,
    "aura": ""
  }
];
