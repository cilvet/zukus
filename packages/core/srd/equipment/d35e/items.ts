/**
 * D&D 3.5 SRD Items
 * Auto-generated from D35E Foundry VTT data
 * Source: https://github.com/Rughalt/D35E
 */

import type { StandardEntity } from '@zukus/core';

/**
 * Extended entity type with dynamic fields.
 * The fields are defined by the schema addons (dnd35item, effectful, etc.)
 */
type ExtendedEntity = StandardEntity & Record<string, unknown>;

export const srdItems: ExtendedEntity[] = [
  {
    "id": "acid",
    "entityType": "item",
    "name": "Acid",
    "description": "You can throw a flask of acid as a splash weapon (see Throw Splash Weapon, page 158). Treat this attack as a ranged touch attack with a range increment of 10 feet. A direct hit deals 1d6 points of acid damage. Every creature within 5 feet of the point where the acid hits takes 1 point of acid damage from the splash.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 10,
      "currency": "gp"
    }
  },
  {
    "id": "alchemist-s-fire",
    "entityType": "item",
    "name": "Alchemist’s fire",
    "description": "Alchemist's fire is sticky, adhesive substance that ignites when exposed to air. You can throw a flask of alchemist's fire as a splash weapon (see Throw Splash Weapon, page 158). Treat this attack as a ranged touch attack with a range increment of 10 feet. A direct hit deals 1d6 points of fire damage. Every creature within 5 feet of the point where the flask hits takes 1 point of fire damage from the splash. On the round following a direct hit, the target takes an additional 1d6 points of damage. If desired, the target can use a full-round action to attempt to extinguish the flames before taking this additional damage. Extinguishing the flames requires a DC 15 Reflex save. Rolling on the ground provides the target a +2 bonus on the save. Leaping into a lake or magically extinguishing the flames automatically smothers the fire.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 20,
      "currency": "gp"
    }
  },
  {
    "id": "alchemist-s-lab",
    "entityType": "item",
    "name": "Alchemist’s lab",
    "description": "This set of equipment includes beakers, bottles, mixing and measuring containers, and a miscellany of chemicals and substances. An alchemist’s lab always has the perfect tool for making alchemical items, so it provides a +2 circumstance bonus on Craft (alchemy) checks. It has no bearing on the costs related to the Craft (alchemy) skill (page 70). Without this lab, a character with the Craft (alchemy) skill is assumed to have enough tools to use the skill but not enough to get the +2 bonus that the lab provides.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 40,
    "cost": {
      "amount": 500,
      "currency": "gp"
    }
  },
  {
    "id": "antitoxin",
    "entityType": "item",
    "name": "Antitoxin",
    "description": "If you drink antitoxin, you get a +5 alchemical bonus on Fortitude saving throws against poison for 1 hour.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 50,
      "currency": "gp"
    }
  },
  {
    "id": "artisan-s-outfit",
    "entityType": "item",
    "name": "Artisan’s outfit",
    "description": "This outfit includes a shirt with buttons, a skirt or pants with a drawstring, shoes, and perhaps a cap or hat. It may also include a belt or a leather or cloth apron for carrying tools.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 4,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "artisan-s-tools",
    "entityType": "item",
    "name": "Artisan’s tools",
    "description": "These special tools include the items needed to pursue any craft. Without them, you have to use improvised tools (- 2 penalty on Craft checks), if you can do the job at all.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 5,
    "cost": {
      "amount": 5,
      "currency": "gp"
    }
  },
  {
    "id": "artisan-s-tools-masterworked",
    "entityType": "item",
    "name": "Artisan’s tools, masterworked",
    "description": "These tools serve the same purpose as artisan’s tools (above), but masterwork artisan’s tools are the perfect tools for the job, so you get a +2 circumstance bonus on Craft checks made with them.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 5,
    "cost": {
      "amount": 55,
      "currency": "gp"
    }
  },
  {
    "id": "backpack-common",
    "entityType": "item",
    "name": "Backpack, Common",
    "description": "A backpack is a leather pack carried on the back, typically with straps to secure it.",
    "image": "ProfessionIcons/LootIcons/Loot_101_chest.webp",
    "weight": 2,
    "cost": {
      "amount": 2,
      "currency": "gp"
    }
  },
  {
    "id": "backpack-masterwork",
    "entityType": "item",
    "name": "Backpack, Masterwork",
    "description": "A backpack is a leather pack carried on the back, typically with straps to secure it. The masterworked backpack makes the players strength score count as if it was one higher.",
    "image": "ProfessionIcons/LootIcons/Loot_101_chest.webp",
    "weight": 4,
    "cost": {
      "amount": 50,
      "currency": "gp"
    }
  },
  {
    "id": "barding-large-creature",
    "entityType": "item",
    "name": "Barding, Large creature",
    "description": "Weight: x2 Price: x4 Barding is a type of armor that covers the head, neck, chest, body, and possibly legs of a horse or other mount. Barding made of medium or heavy armor provides better protection than light barding, but at the expense of speed. Barding can be made of any of the armor types found on Table 7-6: Armor and Shields. Armor for a horse (a Large nonhumanoid creature) costs four times as much as armor for a human (a Medium humanoid creature) and also weighs twice as much as the armor found on Table 7-6 (see Armor for Unusual Creatures, page 123). If the barding is for a pony or other Medium mount, the cost is only double, and the weight is the same as for Medium armor worn by a humanoid. Medium or heavy barding slows a mount that wears it, as shown on the table below. -----------Base Speed----------- Barding 40ft. 50ft. 60ft. Medium 30ft. 35ft. 40ft. Heavy 30ft.&sup1; 30ft.&sup1; 40ft.&sup1; &sup1;A mount wearing heavy armor moves at only triple its normal speed when running instead of quadruple.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 0,
      "currency": "gp"
    }
  },
  {
    "id": "barding-medium-creature",
    "entityType": "item",
    "name": "Barding, Medium creature",
    "description": "Weight: x1 Price: x2 Barding is a type of armor that covers the head, neck, chest, body, and possibly legs of a horse or other mount. Barding made of medium or heavy armor provides better protection than light barding, but at the expense of speed. Barding can be made of any of the armor types found on Table 7-6: Armor and Shields. Armor for a horse (a Large nonhumanoid creature) costs four times as much as armor for a human (a Medium humanoid creature) and also weighs twice as much as the armor found on Table 7-6 (see Armor for Unusual Creatures, page 123). If the barding is for a pony or other Medium mount, the cost is only double, and the weight is the same as for Medium armor worn by a humanoid. Medium or heavy barding slows a mount that wears it, as shown on the table below. -----------Base Speed----------- Barding 40ft. 50ft. 60ft. Medium 30ft. 35ft. 40ft. Heavy 30ft.&sup1; 30ft.&sup1; 40ft.&sup1; &sup1;A mount wearing heavy armor moves at only triple its normal speed when running instead of quadruple.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 0,
      "currency": "gp"
    }
  },
  {
    "id": "barrel",
    "entityType": "item",
    "name": "Barrel",
    "description": "Comes empty",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 30,
    "cost": {
      "amount": 2,
      "currency": "gp"
    }
  },
  {
    "id": "basket",
    "entityType": "item",
    "name": "Basket",
    "description": "Comes empty",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 0.4,
      "currency": "gp"
    }
  },
  {
    "id": "bedroll",
    "entityType": "item",
    "name": "Bedroll",
    "description": "You never know where you’re going to sleep, and a bedroll helps you get better sleep in a hayloft or on the cold ground. A bedroll consists of bedding and a blanket thin enough to be rolled up and tied. In an emergency, it can double as a stretcher.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 5,
    "cost": {
      "amount": 0.1,
      "currency": "gp"
    }
  },
  {
    "id": "bell",
    "entityType": "item",
    "name": "Bell",
    "description": "A small brass bell",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "bit-and-bridle",
    "entityType": "item",
    "name": "Bit and bridle",
    "description": "The face gear for a horse to aid the rider in controlling the mount",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 2,
      "currency": "gp"
    }
  },
  {
    "id": "blanket-winter",
    "entityType": "item",
    "name": "Blanket, winter",
    "description": "A thick, quilted, wool blanket made to keep you warm in cold weather.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 3,
    "cost": {
      "amount": 0.5,
      "currency": "gp"
    }
  },
  {
    "id": "block-and-tackle",
    "entityType": "item",
    "name": "Block and tackle",
    "description": "A Block and tackle used for gaining a massive mechanical bonus in strength. Commonly used to lift or tension objects between one another.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 5,
    "cost": {
      "amount": 5,
      "currency": "gp"
    }
  },
  {
    "id": "bottle-wine-glass",
    "entityType": "item",
    "name": "Bottle, wine, glass",
    "description": "A simple wine glass bottle, comes with a cork, and without content.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 2,
      "currency": "gp"
    }
  },
  {
    "id": "bucket",
    "entityType": "item",
    "name": "Bucket",
    "description": "Comes empty",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 2,
    "cost": {
      "amount": 0.5,
      "currency": "gp"
    }
  },
  {
    "id": "caltrops",
    "entityType": "item",
    "name": "Caltrops",
    "description": "A caltrop is a four-pronged iron spike crafted so that one prong faces up no matter how the caltrop comes to rest. You scatter caltrops on the ground in the hope that your enemies step on them or are at least forced to slow down to avoid them. One 2- pound bag of caltrops covers an area 5 feet square. Each time a creature moves into an area covered by caltrops (or spends a round fighting while standing in such an area), it might step on one. The caltrops make an attack roll (base attack bonus +0) against the creature. For this attack, the creature's shield, armor, and deflection bonuses do not count. (Deflection averts blows as they approach, but it does not prevent a creature from touching something dangerous.) If the creature is wearing shoes or other footwear, it gets a +2 armor bonus to AC. If the caltrops succeed on the attack, the creature has stepped on one. The caltrop deals 1 point of damage, and the creature's speed is reduced by one-half because its foot is wounded. This movement penalty lasts for 24 hours, or until the creature is successfully treated with a DC 15 Heal check, or until it receives at least 1 point of magical curing. A charging or running creature must immediately stop if it steps on a caltrop. Any creature moving at half speed or slower can pick its way through a bed of caltrops with no trouble. The GM judges the effectiveness of caltrops against unusual opponents. A Small monstrous centipede, for example, can slither through an area containing caltrops with no chance of hurting itself, and a fire giant wearing fire giant-sized boots is immune to normal size caltrops. (They just get stuck in the soles of his boots.)",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 2,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "candle",
    "entityType": "item",
    "name": "Candle",
    "description": "A candle dimly illuminates a 5-foot radius and burns for 1 hour. See page 164 for more rules on illumination.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 0.01,
      "currency": "gp"
    }
  },
  {
    "id": "canvas",
    "entityType": "item",
    "name": "Canvas",
    "description": "A square yard of canvas fabric. Can potentially be made into an improvised sack or gurney",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 0.1,
      "currency": "gp"
    }
  },
  {
    "id": "case-map-or-scroll",
    "entityType": "item",
    "name": "Case, map or scroll",
    "description": "This capped leather or tin rube holds rolled pieces of parchment or paper.",
    "image": "WeaponIcons/WeaponIconsVol1/Book_11.webp",
    "weight": 0.5,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "chain-10-ft",
    "entityType": "item",
    "name": "Chain, 10 ft.",
    "description": "Chain has hardness 10 and 5 hit points. It can be burst with a DC 26 Strength check.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 2,
    "cost": {
      "amount": 30,
      "currency": "gp"
    }
  },
  {
    "id": "chalk",
    "entityType": "item",
    "name": "Chalk",
    "description": "A single piece of chalk used for scribing on surfaces such as rock or wood",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 0.01,
      "currency": "gp"
    }
  },
  {
    "id": "chest",
    "entityType": "item",
    "name": "Chest",
    "description": "A sturdy chest for safekeeping of belongings, does not come with a lock.",
    "image": "ProfessionIcons/LootIcons/Loot_101_chest.webp",
    "weight": 25,
    "cost": {
      "amount": 2,
      "currency": "gp"
    }
  },
  {
    "id": "cleric-s-vestments",
    "entityType": "item",
    "name": "Cleric’s vestments",
    "description": "These ecclesiastical clothes are for performing priestly functions, not for adventuring.",
    "image": "ArmorIcons/ArmorSet_Icons/Cloak/cloak_01.webp",
    "weight": 6,
    "cost": {
      "amount": 5,
      "currency": "gp"
    }
  },
  {
    "id": "climber-s-kit",
    "entityType": "item",
    "name": "Climber’s kit",
    "description": "A climber’s kit includes special pitons, boot tips, gloves, and a harness that aids in all sorts of climbing. This is the perfect tool for climbing and gives you a +2 circumstance bonus on Climb checks.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 5,
    "cost": {
      "amount": 80,
      "currency": "gp"
    }
  },
  {
    "id": "cold-weather-outfit",
    "entityType": "item",
    "name": "Cold weather outfit",
    "description": "A cold weather outfit includes a wool coat, linen shirt, wool cap, heavy cloak, thick pants or skirt, and boots. This outfit grants a +5 circumstance bonus on Fortitude saving throws against exposure to cold weather (see the Dungeon Master’s Guide for information on cold dangers).",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 7,
    "cost": {
      "amount": 8,
      "currency": "gp"
    }
  },
  {
    "id": "courtier-s-outfit",
    "entityType": "item",
    "name": "Courtier’s outfit",
    "description": "This outfit includes fancy, tailored clothes in whatever fashion happens to be the current style in the courts of the nobles. Anyone trying to influence nobles or courtiers while wearing street dress will have a hard time of it (–2 penalty on Charisma-based skill checks to influence such individuals). If you wear this outfit without jewelry (costing an additional 50 gp), you look like an out-of-place commoner.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 6,
    "cost": {
      "amount": 30,
      "currency": "gp"
    }
  },
  {
    "id": "crowbar",
    "entityType": "item",
    "name": "Crowbar",
    "description": "This iron bar is made for levering closed items open. A crowbar is the perfect tool for prying open doors or chests, shattering chains, and the like, and it grants a +2 circumstance bonus on Strength checks made for such purposes. If used in combat, treat a crowbar as a one-handed improvised weapon (see page 113) that deals bludgeoning damage equal to that of a club of its size.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 5,
    "cost": {
      "amount": 2,
      "currency": "gp"
    }
  },
  {
    "id": "disguise-kit",
    "entityType": "item",
    "name": "Disguise kit",
    "description": "This bag contains cosmetics, hair dye, and small physical props. The kit is the perfect tool for disguise and provides a +2 circumstance bonus on Disguise checks. A disguise kit is exhausted after ten uses.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 8,
    "cost": {
      "amount": 50,
      "currency": "gp"
    }
  },
  {
    "id": "dog-guard",
    "entityType": "item",
    "name": "Dog, guard",
    "description": "A dog trained for guarding its owner and scare of strangers.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 25,
      "currency": "gp"
    }
  },
  {
    "id": "dog-riding",
    "entityType": "item",
    "name": "Dog, riding",
    "description": "This Medium dog is specially trained to carry a Small humanoid rider. It is brave in combat like a warhorse. You take no damage when you fall from a riding dog.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 150,
      "currency": "gp"
    }
  },
  {
    "id": "donkey-or-mule",
    "entityType": "item",
    "name": "Donkey or mule",
    "description": "The best kinds of pack animals around, donkeys and mules are stolid in the face of danger, hardy, surefooted, and capable of carrying heavy loads over vast distances. Unlike a horse, a donkey or a mule is willing (though not eager) to enter dungeons and other strange or threatening places.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 8,
      "currency": "gp"
    }
  },
  {
    "id": "entertainer-s-outfit",
    "entityType": "item",
    "name": "Entertainer’s outfit",
    "description": "This set of flashy, perhaps even gaudy, clothes is for entertaining. While the outfit looks whimsical, its practical design lets you tumble, dance, walk a tightrope, or just run (if the audience turns ugly)",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 4,
    "cost": {
      "amount": 3,
      "currency": "gp"
    }
  },
  {
    "id": "exotic-saddle-military",
    "entityType": "item",
    "name": "Exotic Saddle, Military",
    "description": "An exotic saddle is like a normal saddle of the same sort except that it is designed for an unusual mount, such as a hippogriff. Exotic saddles come in military, pack, and riding styles. A military saddle braces the rider, providing a +2 circumstance bonus on Ride checks related to staying in the saddle. If you’re knocked unconscious while in a military saddle, you have a 75% chance to stay in the saddle (compared to 50% for a riding saddle).",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 40,
    "cost": {
      "amount": 60,
      "currency": "gp"
    }
  },
  {
    "id": "exotic-saddle-pack",
    "entityType": "item",
    "name": "Exotic Saddle, Pack",
    "description": "An exotic saddle is like a normal saddle of the same sort except that it is designed for an unusual mount, such as a hippogriff. Exotic saddles come in military, pack, and riding styles. A pack saddle holds gear and supplies, but not a rider. It holds as much gear as the mount can carry.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 20,
    "cost": {
      "amount": 15,
      "currency": "gp"
    }
  },
  {
    "id": "exotic-saddle-riding",
    "entityType": "item",
    "name": "Exotic Saddle, Riding",
    "description": "An exotic saddle is like a normal saddle of the same sort except that it is designed for an unusual mount, such as a hippogriff. Exotic saddles come in military, pack, and riding styles.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 30,
    "cost": {
      "amount": 30,
      "currency": "gp"
    }
  },
  {
    "id": "explorer-s-outfit",
    "entityType": "item",
    "name": "Explorer’s outfit",
    "description": "This is a full set of clothes for someone who never knows what to expect. It includes sturdy boots, leather breeches or a skirt, a belt, a shirt (perhaps with a vest or jacket), gloves, and a cloak. Rather than a leather skirt, a leather overtunic may be worn over a cloth skirt. The clothes have plenty of pockets (especially the cloak). The outfit also includes any extra items you might need, such as a scarf or a wide-brimmed hat.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 8,
    "cost": {
      "amount": 10,
      "currency": "gp"
    }
  },
  {
    "id": "feed",
    "entityType": "item",
    "name": "Feed",
    "description": "Horses, donkeys, mules, and ponies can graze to sustain themselves, but providing feed for them(such as oats) is much better because it provides a more concentrated form of energy, especially if the animal is exerting itself. If you have a riding dog, you have to feed it at least some meat, which may cost more or less than the given amount.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 10,
    "cost": {
      "amount": 0.05,
      "currency": "gp"
    }
  },
  {
    "id": "firewood",
    "entityType": "item",
    "name": "Firewood",
    "description": "Firewood for mantaining a small campfire for a single night.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 20,
    "cost": {
      "amount": 0.01,
      "currency": "gp"
    }
  },
  {
    "id": "fishhook",
    "entityType": "item",
    "name": "Fishhook",
    "description": "A fishing hook to tie after a line to aid in catching fish",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 0.1,
      "currency": "gp"
    }
  },
  {
    "id": "fishing-net-25-sq-ft",
    "entityType": "item",
    "name": "Fishing net, 25 sq. ft.",
    "description": "A Fishing net that can aid the adventurer in catching larger amount of fish than a fishhook could in the same time.",
    "image": "WeaponIcons/WeaponIconsVol2/Axe_v2_46.webp",
    "weight": 5,
    "cost": {
      "amount": 4,
      "currency": "gp"
    }
  },
  {
    "id": "flask",
    "entityType": "item",
    "name": "Flask",
    "description": "This ceramic, glass, or metal container is fitted with a tight stopper and holds 1 pint of liquid.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1.5,
    "cost": {
      "amount": 0.03,
      "currency": "gp"
    }
  },
  {
    "id": "flint-and-steel",
    "entityType": "item",
    "name": "Flint and steel",
    "description": "Striking steel and flint together creates sparks. By knocking sparks into tinder, you can create a small flame. Lighting a torch with flint and steel is a full-round action, and lighting any other fire with them takes at least that long.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "hammer",
    "entityType": "item",
    "name": "Hammer",
    "description": "This one-handed hammer with an iron head is useful for pounding pitons into a wall. If a hammer is used in combat, treat it as a one-handed improvised weapon (see page 113) that deals bludgeoning damage equal to that of a spiked gauntlet of its size.",
    "image": "WeaponIcons/WeaponIconsVol1/Hammer_30.webp",
    "weight": 2,
    "cost": {
      "amount": 0.5,
      "currency": "gp"
    }
  },
  {
    "id": "healer-s-kit",
    "entityType": "item",
    "name": "Healer’s kit",
    "description": "This kit is full of herbs, salves, bandages and other useful materials. It is the perfect tool for healing and provides a +2 circumstance bonus on Heal checks. A healer’s kit is exhausted after ten uses.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 50,
      "currency": "gp"
    }
  },
  {
    "id": "holly-and-mistletoe",
    "entityType": "item",
    "name": "Holly and mistletoe",
    "description": "Sprigs of holly and mistletoe are used by druids as the default divine focus for druid spells. Druids can easily find these plants in wooded areas and then harvest sprigs from them essentially for free.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 0,
      "currency": "gp"
    }
  },
  {
    "id": "holy-symbol-silver",
    "entityType": "item",
    "name": "Holy symbol, silver",
    "description": "A holy symbol focuses positive energy. A cleric or paladin uses it as the focus for his spells and as a tool for turning undead. Each religion has its own holy symbol, and a sun symbol is the default holy symbol for clerics not associated with any particular religion. A silver holy symbol works no better than a wooden one, but it serves as a mark of status for the wielder. Unholy Symbols: An unholy symbol is like a holy symbol except that it focuses negative energy and is used by evil clerics (or by neutral clerics who want to cast evil spells or command undead). A skull is the default unholy symbol for clerics not associated with any particular religion.",
    "image": "ProfessionIcons/LootIcons/Loot_51.webp",
    "weight": 1,
    "cost": {
      "amount": 25,
      "currency": "gp"
    }
  },
  {
    "id": "holy-symbol-wooden",
    "entityType": "item",
    "name": "Holy symbol, wooden",
    "description": "A holy symbol focuses positive energy. A cleric or paladin uses it as the focus for his spells and as a tool for turning undead. Each religion has its own holy symbol, and a sun symbol is the default holy symbol for clerics not associated with any particular religion. A silver holy symbol works no better than a wooden one, but it serves as a mark of status for the wielder. Unholy Symbols: An unholy symbol is like a holy symbol except that it focuses negative energy and is used by evil clerics (or by neutral clerics who want to cast evil spells or command undead). A skull is the default unholy symbol for clerics not associated with any particular religion.",
    "image": "ProfessionIcons/LootIcons/Loot_51.webp",
    "weight": 0,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "holy-water",
    "entityType": "item",
    "name": "Holy water",
    "description": "Holy water damages undead creatures and evil outsiders almost as if it were acid. A flask of holy water can be thrown as a splash weapon (see Throw Splash Weapon, page 158). Treat this attack as a ranged touch attack with a range increment of 10 feet. A flask breaks if thrown against the body of a corporeal creature, but to use it against an incorporeal creature, you must open the flask and pour the holy water out onto the target. Thus, you can douse an incorporeal creature with holy water only if you are adjacent to it. Doing so is a ranged touch attack that does not provoke attacks of opportunity. A direct hit by a flask of holy water deals 2d4 points of damage to an undead creature or an evil outsider. Each such creature within 5 feet of the point where the flask hits takes 1 point of damage from the splash. Temples to good deities sell holy water at cost (making no profit) because the clerics are happy to supply people with what they need to battle evil.",
    "image": "ProfessionIcons/LootIcons/Fruit.webp",
    "weight": 1,
    "cost": {
      "amount": 25,
      "currency": "gp"
    }
  },
  {
    "id": "horse-heavy",
    "entityType": "item",
    "name": "Horse, heavy",
    "description": "Phb Table 9-6 Mounts and Vehicles. Page 164",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 200,
      "currency": "gp"
    }
  },
  {
    "id": "horse-light",
    "entityType": "item",
    "name": "Horse, light",
    "description": "Phb Table 9-6 Mounts and Vehicles. Page 164",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 75,
      "currency": "gp"
    }
  },
  {
    "id": "hourglass",
    "entityType": "item",
    "name": "Hourglass",
    "description": "Comes in diffrent time tracking sizes 1min, 2min, 5min, 10min and 1hour",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 25,
      "currency": "gp"
    }
  },
  {
    "id": "ink-1-oz-vial",
    "entityType": "item",
    "name": "Ink, 1 oz. vial",
    "description": "A vial of 1oz. quality writing ink",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 8,
      "currency": "gp"
    }
  },
  {
    "id": "inkpen",
    "entityType": "item",
    "name": "Inkpen",
    "description": "An inkpen is a wooden stick with a special tip on the end. The tip draws ink in when dipped in a vial and leaves an ink trail when drawn across a surface.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 0.1,
      "currency": "gp"
    }
  },
  {
    "id": "jug-clay",
    "entityType": "item",
    "name": "Jug, clay",
    "description": "This basic ceramic jug is fitted with a stopper and holds 1 gallon of liquid.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 9,
    "cost": {
      "amount": 0.03,
      "currency": "gp"
    }
  },
  {
    "id": "ladder-10-foot",
    "entityType": "item",
    "name": "Ladder, 10-foot",
    "description": "This item is a straight, simple wooden ladder.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 20,
    "cost": {
      "amount": 0.5,
      "currency": "gp"
    }
  },
  {
    "id": "lamp-common",
    "entityType": "item",
    "name": "Lamp, common",
    "description": "A lamp clearly illuminates a 15-foot radius, provides shadowy illumination out to a 30-foot radius, and burns for 6 hours on a pint of oil. It burns with a more even flame than a torch, but, unlike a lantern, it uses an open flame and it can spill easily, a fact that makes it too dangerous for most adventuring. You can carry a lamp in one hand. See page 164 for more rules on illumination.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 0.1,
      "currency": "gp"
    }
  },
  {
    "id": "lantern-bullseye",
    "entityType": "item",
    "name": "Lantern, bullseye",
    "description": "A bullseye lantern has only a single shutter. Its other sides are highly polished inside to reflect the light in a single direction. A bullseye lantern provides clear illumination in a 60-foot cone and shadowy illumination in a 120-foot cone. It burns for 6 hours on a pint of oil. You can carry a bullseye lantern in one hand. See page 164 for more rules on illumination.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 3,
    "cost": {
      "amount": 12,
      "currency": "gp"
    }
  },
  {
    "id": "lock-amazing",
    "entityType": "item",
    "name": "Lock, Amazing",
    "description": "A lock is worded with a large, bulky key. The DC to open a lock with the Open Lock skill depends on the lock's quality: very simple (DC 20), average (DC 25), good (DC 30), or amazing (DC 40).",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 150,
      "currency": "gp"
    }
  },
  {
    "id": "lock-average",
    "entityType": "item",
    "name": "Lock, Average",
    "description": "A lock is worded with a large, bulky key. The DC to open a lock with the Open Lock skill depends on the lock's quality: very simple (DC 20), average (DC 25), good (DC 30), or amazing (DC 40).",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 40,
      "currency": "gp"
    }
  },
  {
    "id": "lock-good",
    "entityType": "item",
    "name": "Lock, Good",
    "description": "A lock is worded with a large, bulky key. The DC to open a lock with the Open Lock skill depends on the lock's quality: very simple (DC 20), average (DC 25), good (DC 30), or amazing (DC 40).",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 80,
      "currency": "gp"
    }
  },
  {
    "id": "lock-very-simple",
    "entityType": "item",
    "name": "Lock, Very simple",
    "description": "A lock is worded with a large, bulky key. The DC to open a lock with the Open Lock skill depends on the lock’s quality: very simple (DC 20), average (DC 25), good (DC 30), or amazing (DC 40).",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 20,
      "currency": "gp"
    }
  },
  {
    "id": "magnifying-glass",
    "entityType": "item",
    "name": "Magnifying glass",
    "description": "This simple lens allows a closer look at small objects. It is also useful as a substitute for flint and steel when starting fires. Lighting a fire with a magnifying glass requires light as bright as sunlight to focus, tinder to ignite, and at least a full-round action. A magnifying glass grants a +2 circumstance bonus on Appraise checks involving any item that is small or highly detailed, such as a gem.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 100,
      "currency": "gp"
    }
  },
  {
    "id": "manacles",
    "entityType": "item",
    "name": "Manacles",
    "description": "Manacles and Manacles, Masterwork: The manacles detailed on Table 7–8: Goods and Services can bind a Medium creature. A manacled creature can use the Escape Artist skill to slip free (DC 30, or DC 35 for masterwork manacles). Breaking the manacles requires a Strength check (DC 26, or DC 28 for masterwork manacles). Manacles have hardness 10 and 10 hit points. Most manacles have locks; add the cost of the lock you want to the cost of the manacles. For the same cost, you can buy manacles for a Small creature. For a Large creature, manacles cost ten times the indicated amount, and for a Huge creature, one hundred times this amount. Gargantuan, Colossal, Tiny, Diminutive, and Fine creatures can be held only by specially made manacles.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 2,
    "cost": {
      "amount": 15,
      "currency": "gp"
    }
  },
  {
    "id": "manacles-masterworked",
    "entityType": "item",
    "name": "Manacles, Masterworked",
    "description": "Manacles and Manacles, Masterwork: The manacles detailed on Table 7-8: Goods and Services can bind a Medium creature. A manacled creature can use the Escape Artist skill to slip free (DC 30, or DC 35 for masterwork manacles). Breaking the manacles requires a Strength check (DC 26, or DC 28 for masterwork manacles). Manacles have hardness 10 and 10 hit points. Most manacles have locks; add the cost of the lock you want to the cost of the manacles. For the same cost, you can buy manacles for a Small creature. For a Large creature, manacles cost ten times the indicated amount, and for a Huge creature, one hundred times this amount. Gargantuan, Colossal, Tiny, Diminutive, and Fine creatures can be held only by specially made manacles.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 2,
    "cost": {
      "amount": 50,
      "currency": "gp"
    }
  },
  {
    "id": "mirror-small-steel",
    "entityType": "item",
    "name": "Mirror, small steel",
    "description": "A polished steel mirror is handy when you want to look around corners, signal friends with reflected sunlight, keep an eye on a medusa, make sure that you look good enough to present yourself to the queen, or examine wounds that you've received on hard-to-see parts of your body.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0.5,
    "cost": {
      "amount": 10,
      "currency": "gp"
    }
  },
  {
    "id": "monk-s-outfit",
    "entityType": "item",
    "name": "Monk’s outfit",
    "description": "This simple outfit includes sandals, loose breeches, and a loose shirt, and is all bound together with sashes. The outfit is designed to give you maximum mobility, and it’s made of high-quality fabric. You can hide small weapons in pockets hidden in the folds, and the sashes are strong enough to serve as short ropes.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 2,
    "cost": {
      "amount": 5,
      "currency": "gp"
    }
  },
  {
    "id": "mug-tankard-clay",
    "entityType": "item",
    "name": "Mug/Tankard, clay",
    "description": "A quaint little drinking utensil formed from baked clay",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 0.02,
      "currency": "gp"
    }
  },
  {
    "id": "musical-instrument-common",
    "entityType": "item",
    "name": "Musical instrument, common",
    "description": "Popular instruments include the fife, recorder, lute, mandolin, and shawm. A masterwork instrument grants a +2 circumstance bonus on Perform checks involving its use.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 3,
    "cost": {
      "amount": 5,
      "currency": "gp"
    }
  },
  {
    "id": "musical-instrument-masterworked",
    "entityType": "item",
    "name": "Musical instrument, masterworked",
    "description": "Popular instruments include the fife, recorder, lute, mandolin, and shawm. A masterwork instrument grants a +2 circumstance bonus on Perform checks involving its use.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 3,
    "cost": {
      "amount": 100,
      "currency": "gp"
    }
  },
  {
    "id": "noble-s-outfit",
    "entityType": "item",
    "name": "Noble’s outfit",
    "description": "This set of clothes is designed specifically to be expensive and to show it. Precious metals and gems are worked into the clothing. To fit into the noble crowd, every would-be noble also needs a signet ring (see Adventuring Gear, above) and jewelry (worth at least 100 gp).",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 10,
    "cost": {
      "amount": 75,
      "currency": "gp"
    }
  },
  {
    "id": "oil-1-pint-flask",
    "entityType": "item",
    "name": "Oil, 1-pint flask",
    "description": "A pint of oil burns for 6 hours in a lantern. You can use a flask of oil as a splash weapon (see Throw Splash Weapon, page 158). Use the rules for alchemist’s fire, except that it takes a full-round action to prepare a flask with a fuse. Once it is thrown, there is a 50% chance of the flask igniting successfully. You can pour a pint of oil on the ground to cover an area 5 feet square, provided that the surface is smooth. If lit, the oil burns for 2 rounds and deals 1d3 points of fire damage to each creature in the area.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 0.1,
      "currency": "gp"
    }
  },
  {
    "id": "paper",
    "entityType": "item",
    "name": "Paper",
    "description": "A sheet of standard paper is made from cloth fibers.",
    "image": "WeaponIcons/WeaponIconsVol1/Book_11.webp",
    "weight": 0,
    "cost": {
      "amount": 0.4,
      "currency": "gp"
    }
  },
  {
    "id": "parchment",
    "entityType": "item",
    "name": "Parchment",
    "description": "A sheet of parchment is a piece of goat hide or sheepskin that has been prepared for writing on.",
    "image": "WeaponIcons/WeaponIconsVol1/Book_11.webp",
    "weight": 0,
    "cost": {
      "amount": 0.2,
      "currency": "gp"
    }
  },
  {
    "id": "peasant-s-outfit",
    "entityType": "item",
    "name": "Peasant’s outfit",
    "description": "This set of clothes consists of a loose shirt and baggy breeches, or a loose shirt and skirt or overdress. Cloth wrappings are used for shoes.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 2,
    "cost": {
      "amount": 0.1,
      "currency": "gp"
    }
  },
  {
    "id": "pick-miner-s",
    "entityType": "item",
    "name": "Pick, miner’s",
    "description": "A mining pick, used for excavating ore out of the earth",
    "image": "WeaponIcons/WeaponIconsVol2/Axe_v2_48.webp",
    "weight": 10,
    "cost": {
      "amount": 3,
      "currency": "gp"
    }
  },
  {
    "id": "pitcher-clay",
    "entityType": "item",
    "name": "Pitcher, clay",
    "description": "A pitcher made of clay, usefull for pouring water for multiple people",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 5,
    "cost": {
      "amount": 0.02,
      "currency": "gp"
    }
  },
  {
    "id": "piton",
    "entityType": "item",
    "name": "Piton",
    "description": "When a wall doesn't offer handholds and footholds, you can make your own. A piton is a steel spike with an eye through which you can loop a rope. (See the Climb skill, page 69).",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0.5,
    "cost": {
      "amount": 0.1,
      "currency": "gp"
    }
  },
  {
    "id": "pole-10-foot",
    "entityType": "item",
    "name": "Pole, 10-foot",
    "description": "When you suspect a trap, you can put the end of your 10-foot pole through that hole in the wall instead of reaching in with your hand.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 8,
    "cost": {
      "amount": 0.2,
      "currency": "gp"
    }
  },
  {
    "id": "pony",
    "entityType": "item",
    "name": "Pony",
    "description": "Phb Table 9-6 Mounts and Vehicles. Page 164",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 30,
      "currency": "gp"
    }
  },
  {
    "id": "pot-iron",
    "entityType": "item",
    "name": "Pot, iron",
    "description": "A sturdy iron pot used for cooking soups and stews",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 10,
    "cost": {
      "amount": 0.5,
      "currency": "gp"
    }
  },
  {
    "id": "pouch-belt",
    "entityType": "item",
    "name": "Pouch, belt",
    "description": "This leather pouch straps to your belt. It’s good for holding small items.",
    "image": "ArmorIcons/ArmorSet_Icons/Cloth/Cloth10_Belt.webp",
    "weight": 0.5,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "pouch-spell-component",
    "entityType": "item",
    "name": "Pouch, Spell Component",
    "description": "This small, watertight leather belt pouch has many compartments. A spellcaster with a spell component pouch is assumed to have all the material components and focuses needed for spellcasting, except for those components that have a specific cost, divine focuses, and focuses that wouldn’t fit in a pouch (such as the natural pool that a druid needs to look into to cast scrying).",
    "image": "ProfessionIcons/LootIcons/Loot_101_chest.webp",
    "weight": 2,
    "cost": {
      "amount": 5,
      "currency": "gp"
    }
  },
  {
    "id": "ram-portable",
    "entityType": "item",
    "name": "Ram, portable",
    "description": "This iron-shod wooden beam is the perfect tool for battering down a door. Not only does it gives you a +2 circumstance bonus on Strength checks made to break open a door and it allows a second person to help you without having to roll, increasing your bonus by 2 (see Breaking Items, page 167).",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 20,
    "cost": {
      "amount": 10,
      "currency": "gp"
    }
  },
  {
    "id": "rations-trail",
    "entityType": "item",
    "name": "Rations, Trail",
    "description": "Trail rations are compact, dry, high-energy foods suitable for travel, such as jerky, dried fruit, hardtack, and nuts.",
    "image": "ProfessionIcons/LootIcons/Fruit.webp",
    "weight": 1,
    "cost": {
      "amount": 0.5,
      "currency": "gp"
    }
  },
  {
    "id": "rope-hempen-1m",
    "entityType": "item",
    "name": "Rope, hempen, 1m.",
    "description": "This rope has 2 hit points and can be burst with a DC 23 Strength check.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0.6,
    "cost": {
      "amount": 0.06,
      "currency": "gp"
    }
  },
  {
    "id": "rope-silk-1m",
    "entityType": "item",
    "name": "Rope, silk, 1m.",
    "description": "This rope has 4 hit points and can be burst with a DC 24 Strength check. It is so supple that it provides a +2 circumstance bonus on Use Rope checks.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0.3,
    "cost": {
      "amount": 0.6,
      "currency": "gp"
    }
  },
  {
    "id": "royal-outfit",
    "entityType": "item",
    "name": "Royal outfit",
    "description": "This is just the clothing, not the royal scepter, crown, ring, and other accoutrements. Royal clothes are ostentatious, with gems, gold, silk, and fur in abundance.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 15,
    "cost": {
      "amount": 200,
      "currency": "gp"
    }
  },
  {
    "id": "sack",
    "entityType": "item",
    "name": "Sack",
    "description": "This item is made of burlap or a similar material and has a drawstring so it can be closed.",
    "image": "ProfessionIcons/LootIcons/Loot_101_chest.webp",
    "weight": 0.5,
    "cost": {
      "amount": 0.1,
      "currency": "gp"
    }
  },
  {
    "id": "saddle-military",
    "entityType": "item",
    "name": "Saddle, Military ",
    "description": "A military saddle braces the rider, providing a +2 circumstance bonus on Ride checks related to staying in the saddle. If you're knocked unconscious while in a military saddle, you have a 75% chance to stay in the saddle (compared to 50% for a riding saddle).",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 30,
    "cost": {
      "amount": 20,
      "currency": "gp"
    }
  },
  {
    "id": "saddle-pack",
    "entityType": "item",
    "name": "Saddle, Pack",
    "description": "A pack saddle holds gear and supplies, but not a rider. It holds as much gear as the mount can carry.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 15,
    "cost": {
      "amount": 5,
      "currency": "gp"
    }
  },
  {
    "id": "saddle-riding",
    "entityType": "item",
    "name": "Saddle, Riding",
    "description": "The standard riding saddle supports a rider.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 25,
    "cost": {
      "amount": 10,
      "currency": "gp"
    }
  },
  {
    "id": "saddlebags",
    "entityType": "item",
    "name": "Saddlebags",
    "description": "Holds about the same as backpacks as the size of the rider.",
    "image": "ProfessionIcons/LootIcons/Loot_101_chest.webp",
    "weight": 8,
    "cost": {
      "amount": 4,
      "currency": "gp"
    }
  },
  {
    "id": "scale-merchant-s",
    "entityType": "item",
    "name": "Scale, merchant’s",
    "description": "This scale includes a small balance and pans, plus a suitable assortment of weights. A scale grants a +2 circumstance bonus on Appraise checks involving items that are valued by weight, including anything made of precious metals.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 2,
      "currency": "gp"
    }
  },
  {
    "id": "scholar-s-outfit",
    "entityType": "item",
    "name": "Scholar’s outfit",
    "description": "Perfect for a scholar, this outfit includes a robe, a belt, a cap, soft shoes, and possibly a cloak.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 6,
    "cost": {
      "amount": 5,
      "currency": "gp"
    }
  },
  {
    "id": "sealing-wax",
    "entityType": "item",
    "name": "Sealing wax",
    "description": "Used together with a signet ring to seal letters or mark objects with said signet.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "sewing-needle",
    "entityType": "item",
    "name": "Sewing needle",
    "description": "Used to stitch fabric together or even skin in dire situations.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 0.5,
      "currency": "gp"
    }
  },
  {
    "id": "signal-whistle",
    "entityType": "item",
    "name": "Signal whistle",
    "description": "A whistle with a specefic audible tune, can be such as an animal call or bird sounds depending on the complexity of the craftsmans ability. Commonly used by adventures to secretly call out to one another without being noticed",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 0.8,
      "currency": "gp"
    }
  },
  {
    "id": "signet-ring",
    "entityType": "item",
    "name": "Signet ring",
    "description": "Each signet ring has a distinctive design carved into it. When you press this ring into warm sealing wax, you leave an identifying mark.",
    "image": "WeaponIcons/WeaponIconsVol2/Axe_v2_46.webp",
    "weight": 0,
    "cost": {
      "amount": 5,
      "currency": "gp"
    }
  },
  {
    "id": "sledge",
    "entityType": "item",
    "name": "Sledge",
    "description": "This two-handed, iron-headed hammer is good for smashing open treasure chests.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 10,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "smokestick",
    "entityType": "item",
    "name": "Smokestick",
    "description": "This alchemically treated wooden stick instantly creates thick, opaque smoke when ignited. The smoke fills a 10- foot cube (treat the effect as a fog cloud spell, except that a moderate or stronger wind dissipates the smoke in 1 round). The stick is consumed after 1 round, and the smoke dissipates naturally.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0.5,
    "cost": {
      "amount": 20,
      "currency": "gp"
    }
  },
  {
    "id": "spade-or-shovel",
    "entityType": "item",
    "name": "Spade or shovel",
    "description": "The go-to tool for making people dig their own grave, or generally for moving dirt like material.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 8,
    "cost": {
      "amount": 2,
      "currency": "gp"
    }
  },
  {
    "id": "spellbook",
    "entityType": "item",
    "name": "Spellbook",
    "description": "This large, leatherbound book serves as a wizard’s reference. A spellbook has 100 pages of parchment, and each spell takes up one page per spell level (one page each for 0-level spells). See Space in the Spellbook, page 179.",
    "image": "WeaponIcons/WeaponIconsVol1/Book_11.webp",
    "weight": 3,
    "cost": {
      "amount": 15,
      "currency": "gp"
    }
  },
  {
    "id": "spellbook-traveling",
    "entityType": "item",
    "name": "Spellbook, Traveling",
    "description": "A traveling spellbook is lighter and less cumbersome than its full-size counterpart. It has 50 pages.",
    "image": "WeaponIcons/WeaponIconsVol1/Book_11.webp",
    "weight": 1,
    "cost": {
      "amount": 10,
      "currency": "gp"
    }
  },
  {
    "id": "spyglass",
    "entityType": "item",
    "name": "Spyglass",
    "description": "Objects viewed through a spyglass are magnified to twice their size.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 1000,
      "currency": "gp"
    }
  },
  {
    "id": "stabling",
    "entityType": "item",
    "name": "Stabling",
    "description": "Includes a stable, feed, and grooming.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 0.5,
      "currency": "gp"
    }
  },
  {
    "id": "sunrod",
    "entityType": "item",
    "name": "Sunrod",
    "description": "This 1-foot-long, gold-tipped, iron rod glows brightly when struck. It clearly illuminates a 30-foot radius and provides shadowy illumination in a 60-foot radius. It glows for 6 hours, after which the gold tip is burned out and worthless. See pages 164 for more rules on illumination.",
    "image": "WeaponIcons/WeaponIconsVol2/Staff_v2_04.webp",
    "weight": 1,
    "cost": {
      "amount": 2,
      "currency": "gp"
    }
  },
  {
    "id": "tent",
    "entityType": "item",
    "name": "Tent",
    "description": "Tents come in a variety of sizes and accommodate between one and 10 people. Two Small creatures count as a Medium creature, and one Large creature counts as two Medium creatures. Packing up a tent takes half as long as assembling it. Medium : A medium tent holds two creatures and takes 30 minutes to assemble.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 30,
    "cost": {
      "amount": 15,
      "currency": "gp"
    }
  },
  {
    "id": "thieves-tools",
    "entityType": "item",
    "name": "Thieves’ tools",
    "description": "This kit contains the tools you need to use the Disable Device and Open Lock skills. The kit includes one or more skeleton keys, long metal picks and pries, a long-nosed clamp, a small hand saw, and a small wedge and hammer. Without these tools, you must improvise tools, and you take a –2 circumstance penalty on Disable Device and Open Locks checks.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 30,
      "currency": "gp"
    }
  },
  {
    "id": "thieves-tools-masterworked",
    "entityType": "item",
    "name": "Thieves’ tools masterworked",
    "description": "This kit contains extra tools and tools of better make, which grant a +2 circumstance bonus on Disable Device and Open Lock checks.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 2,
    "cost": {
      "amount": 100,
      "currency": "gp"
    }
  },
  {
    "id": "tindertwig",
    "entityType": "item",
    "name": "Tindertwig",
    "description": "The alchemical substance on the end of this small, wooden stick ignites when struck against a rough surface. Creating a flame with a tindertwig is much faster than creating a flame with flint and steel (or a magnifying glass) and tinder. Lighting a torch with a tindertwig is a standard action (rather than a full-round action), and lighting any other fire with one is at least a standard action.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "tools-masterworked",
    "entityType": "item",
    "name": "Tools, masterworked",
    "description": "This well-made item is the perfect tool for the job. It grants a +2 circumstance bonus on a related skill check (if any). Some examples of this sort of item from Table 7-8 include masterwork artisan's tools, masterwork thieves' tools, disguise kit, climber's kit, healer's kit, and masterwork musical instrument. This entry covers just about anything else. Bonuses provided by multiple masterwork items used toward the same skill check do not stack, so masterwork pitons and a masterwork climber's kit do not provide a +4 bonus if used together on a Climb check.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 50,
      "currency": "gp"
    }
  },
  {
    "id": "traveler-s-outfit",
    "entityType": "item",
    "name": "Traveler’s outfit",
    "description": "This set of clothes consists of boots, a wool skirt or breeches, a sturdy belt, a shirt (perhaps with a vest or jacket), and an ample cloak with a hood.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 5,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "vial-ink-or-potion",
    "entityType": "item",
    "name": "Vial, ink or potion",
    "description": "A simple glass container with a firm stopper at the top in eaither Vial, Ink or Potion shape. holds about 1oz. of liquid",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0.1,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "warhorse-heavy",
    "entityType": "item",
    "name": "Warhorse, heavy",
    "description": "Phb Table 9-6 Mounts and Vehicles. Page 164",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 400,
      "currency": "gp"
    }
  },
  {
    "id": "warhorse-light",
    "entityType": "item",
    "name": "Warhorse, light",
    "description": "Phb Table 9-6 Mounts and Vehicles. Page 164",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 150,
      "currency": "gp"
    }
  },
  {
    "id": "warpony",
    "entityType": "item",
    "name": "Warpony",
    "description": "Phb Table 9-6 Mounts and Vehicles. Page 164",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 0,
    "cost": {
      "amount": 100,
      "currency": "gp"
    }
  },
  {
    "id": "water-clock",
    "entityType": "item",
    "name": "Water clock",
    "description": "This large, bulky contrivance gives the time accurate to within half an hour per day since it was last set. It requires a source of water, and it must be kept still because it marks time by the regulated flow of droplets of water. It is primarily an amusement for the wealthy and a tool for the student of arcane lore. Most people have no way to tell exact time, and there’s little point in knowing that it is 2:30 p.m. if nobody else does.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 200,
    "cost": {
      "amount": 1000,
      "currency": "gp"
    }
  },
  {
    "id": "waterskin",
    "entityType": "item",
    "name": "Waterskin",
    "description": "A water or wineskin holds 1/2 gallon of liquid and weighs 4 lb when full.",
    "image": "ProfessionIcons/LootIcons/Fruit.webp",
    "weight": 4,
    "cost": {
      "amount": 1,
      "currency": "gp"
    }
  },
  {
    "id": "whetstone",
    "entityType": "item",
    "name": "Whetstone",
    "description": "Used to maintain the edge of bladed weapon, servere lack of weapon maintainance can result in loss of damage or even damage to the blade of the weapon.",
    "image": "ProfessionIcons/LootIcons/Loot_06.webp",
    "weight": 1,
    "cost": {
      "amount": 0.02,
      "currency": "gp"
    }
  }
];
