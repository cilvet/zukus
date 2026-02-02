/**
 * Item Image Service
 *
 * Este servicio asigna iconos apropiados a items del inventario
 * basandose en keywords en sus nombres.
 *
 * Las imagenes deben existir en Supabase Storage bucket "icons".
 * Los paths son relativos a ese bucket.
 *
 * IMPORTANTE: El orden de las reglas importa. Las reglas mas especificas
 * deben ir antes que las mas generales para evitar falsos positivos.
 *
 * NOTA: Las rutas han sido verificadas contra las imagenes disponibles
 * en el bucket de Supabase (extraidas de spells.json).
 */

// =============================================================================
// Reglas de asignacion de iconos (orden = prioridad)
// =============================================================================

type IconRule = {
  icon: string;
  keywords: string[];
};

const iconRules: IconRule[] = [
  // === REGLAS ESPECIFICAS PRIMERO ===

  // Exotic weapons con "chain" en el nombre (antes que armor "chain shirt")
  {
    icon: "WeaponIcons/WeaponIconsVol2/Axe_v2_46.webp",
    keywords: ["spiked chain", "chain, spiked", "whip", "nunchaku", "bolas", "net"],
  },

  // Armor (antes de otros items genericos)
  {
    icon: "ArmorIcons/BasicArmor_Icons/Chest_13.webp",
    keywords: [
      "chain shirt",
      "chainmail",
      "chain mail",
      "scale mail",
      "splint mail",
      "banded mail",
      "half plate",
      "full plate",
      "breastplate",
      "armor",
      "armour",
      "padded",
      "leather",
      "studded",
      "hide",
    ],
  },

  // Shields (antes de items genericos)
  {
    icon: "WeaponIcons/WeaponIconsVol1/shield_07.webp",
    keywords: ["shield", "buckler", "targe", "escudo", "tower shield"],
  },

  // === ARMAS ===

  // Swords - especificos primero
  {
    icon: "WeaponIcons/WeaponIconsVol1/Sword_55.webp",
    keywords: ["greatsword", "great sword", "bastard sword", "two-bladed sword"],
  },
  {
    icon: "WeaponIcons/WeaponIconsVol1/Sword_64.webp",
    keywords: ["katana", "scimitar", "falchion", "kukri"],
  },
  {
    icon: "WeaponIcons/WeaponIconsVol1/Sword_16.webp",
    keywords: ["short sword", "shortsword"],
  },
  {
    icon: "WeaponIcons/WeaponIconsVol1/Sword_05.webp",
    keywords: ["sword", "blade", "saber", "rapier", "longsword", "broadsword"],
  },

  // Daggers
  {
    icon: "WeaponIcons/WeaponIconsVol1/Dagger_15.webp",
    keywords: ["dagger", "knife", "dirk", "stiletto", "kris"],
  },

  // Axes
  {
    icon: "WeaponIcons/WeaponIconsVol2/Axe_v2_21.webp",
    keywords: ["axe", "hatchet", "battleaxe", "greataxe", "handaxe", "waraxe", "orc double axe"],
  },

  // Hammers & Maces
  {
    icon: "WeaponIcons/WeaponIconsVol1/Hammer_30.webp",
    keywords: ["hammer", "mace", "warhammer", "morningstar", "flail", "light hammer", "gnome hooked hammer"],
  },

  // Polearms
  {
    icon: "WeaponIcons/WeaponIconsVol1/Spear_12.webp",
    keywords: [
      "spear",
      "lance",
      "pike",
      "halberd",
      "glaive",
      "longspear",
      "shortspear",
      "trident",
      "ranseur",
      "guisarme",
      "partisan",
    ],
  },

  // Crossbows (antes de "bow")
  {
    icon: "WeaponIcons/WeaponIconsVol1/Bow_04.webp",
    keywords: ["crossbow", "hand crossbow", "heavy crossbow", "light crossbow", "repeating crossbow"],
  },

  // Bows
  {
    icon: "WeaponIcons/WeaponIconsVol2/Bow_v2_05.webp",
    keywords: ["bow", "longbow", "shortbow", "composite"],
  },

  // Clubs & Staves
  {
    icon: "WeaponIcons/WeaponIconsVol1/staff_17.webp",
    keywords: ["club", "staff", "quarterstaff", "greatclub"],
  },

  // Exotic oriental weapons
  {
    icon: "WeaponIcons/WeaponIconsVol1/Dagger_29.webp",
    keywords: ["shuriken", "kama", "sai", "siangham", "nunchaku"],
  },

  // Pick & Sickle
  {
    icon: "WeaponIcons/WeaponIconsVol2/Axe_v2_48.webp",
    keywords: ["pick", "sickle", "heavy pick", "light pick"],
  },

  // Ammunition (antes de items genericos con "dart")
  {
    icon: "WeaponIcons/WeaponIconsVol1/Arrow_36.webp",
    keywords: ["arrow", "arrows", "bolt", "bolts", "dart", "javelin", "sling bullet", "shuriken"],
  },

  // === EQUIPO PROTECTOR ===

  // Helmets
  {
    icon: "ArmorIcons/ArmorSet_Icons/Mail/Mail13_head.webp",
    keywords: ["helmet", "helm", "headgear"],
  },

  // Boots
  {
    icon: "ArmorIcons/ArmorSet_Icons/Cloth/Cloth10_Boots.webp",
    keywords: ["boots", "footwear", "greaves"],
  },

  // Gloves & Gauntlets
  {
    icon: "ArmorIcons/BasicArmor_Icons/Gloves_19.webp",
    keywords: ["gloves", "gauntlet"],
  },

  // Rings
  {
    icon: "ArmorIcons/RingAndNeck_Icons/Ring_07.webp",
    keywords: ["ring", "signet"],
  },

  // Cloaks & Capes
  {
    icon: "ArmorIcons/ArmorSet_Icons/Cloak/cloak_01.webp",
    keywords: ["cape", "cloak", "mantle", "robe", "shroud"],
  },

  // === ITEMS CONSUMIBLES ===

  // Potions & Alchemy
  {
    icon: "ProfessionIcons/LootIcons/Loot_06.webp",
    keywords: ["potion", "elixir", "vial", "acid", "antitoxin", "holy water", "alchemist", "flask"],
  },

  // Explosives & Special items
  {
    icon: "ProfessionIcons/LootIcons/Loot_06.webp",
    keywords: ["smokestick", "thunderstone", "tanglefoot", "tindertwig"],
  },

  // === ITEMS MAGICOS ===

  // Wands & Rods
  {
    icon: "WeaponIcons/WeaponIconsVol2/Staff_v2_04.webp",
    keywords: ["wand", "rod", "scepter"],
  },

  // === EQUIPO DE AVENTURA ===

  // Light sources
  {
    icon: "ProfessionIcons/LootIcons/Loot_06.webp",
    keywords: ["torch", "lantern", "lamp", "candle", "sunrod", "everburning"],
  },

  // Rope & Climbing
  {
    icon: "ProfessionIcons/LootIcons/Loot_06.webp",
    keywords: ["rope", "grappling hook", "piton", "ladder"],
  },

  // Bags & Containers
  {
    icon: "ProfessionIcons/LootIcons/Loot_101_chest.webp",
    keywords: ["backpack", "bag", "sack", "pouch", "chest", "barrel", "basket", "bucket", "case"],
  },

  // Tools
  {
    icon: "ProfessionIcons/LootIcons/Loot_06.webp",
    keywords: ["crowbar", "sledge", "shovel", "spade", "block and tackle", "fishhook"],
  },

  // Writing
  {
    icon: "WeaponIcons/WeaponIconsVol1/Book_11.webp",
    keywords: ["paper", "parchment", "ink", "inkpen", "scroll", "map", "chalk"],
  },

  // Food & Supplies
  {
    icon: "ProfessionIcons/LootIcons/Fruit.webp",
    keywords: ["rations", "food", "water", "waterskin", "firewood"],
  },

  // Camping
  {
    icon: "ProfessionIcons/LootIcons/Loot_06.webp",
    keywords: ["tent", "bedroll", "blanket"],
  },

  // Misc items
  {
    icon: "ProfessionIcons/LootIcons/Loot_06.webp",
    keywords: ["mirror", "spyglass"],
  },
  {
    icon: "ProfessionIcons/LootIcons/Loot_06.webp",
    keywords: ["bell", "whistle", "signal"],
  },
  {
    icon: "ProfessionIcons/LootIcons/Loot_06.webp",
    keywords: ["lock", "manacles"],
  },
  {
    icon: "ProfessionIcons/LootIcons/Loot_06.webp",
    keywords: ["caltrops"],
  },
];

// Default icon for items that don't match any keywords
export const DEFAULT_ITEM_ICON = "ProfessionIcons/LootIcons/Loot_06.webp";

// =============================================================================
// Service Functions
// =============================================================================

/**
 * Gets the appropriate icon image for an item based on its name.
 *
 * @param itemName - The name of the item
 * @returns The path to the most appropriate icon image (relative to icons bucket)
 */
export function getItemIconByName(itemName: string): string {
  const itemNameLowerCase = itemName.toLowerCase();

  for (const rule of iconRules) {
    for (const keyword of rule.keywords) {
      if (itemNameLowerCase.includes(keyword)) {
        return rule.icon;
      }
    }
  }

  return DEFAULT_ITEM_ICON;
}

/**
 * Gets the full Supabase Storage URL for an item icon.
 *
 * @param itemName - The name of the item
 * @param supabaseUrl - The Supabase project URL
 * @returns The full public URL for the icon
 */
export function getItemIconUrl(itemName: string, supabaseUrl: string): string {
  const iconPath = getItemIconByName(itemName);
  return `${supabaseUrl}/storage/v1/object/public/icons/${iconPath}`;
}

/**
 * Assigns icons to an array of items.
 *
 * @param items - Array of items with a 'name' property
 * @returns Items with an 'icon' property added
 */
export function assignIconsToItems<T extends { name: string }>(
  items: T[]
): (T & { icon: string })[] {
  return items.map((item) => ({
    ...item,
    icon: getItemIconByName(item.name),
  }));
}
