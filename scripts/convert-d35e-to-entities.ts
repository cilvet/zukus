/**
 * Script to convert D35E Foundry VTT data to Zukus StandardEntity format
 *
 * Usage: bun scripts/convert-d35e-to-entities.ts
 *
 * Prerequisites: Clone D35E repo to /Users/cilveti/personal/d35e-data
 *   git clone --depth 1 https://github.com/Rughalt/D35E.git /Users/cilveti/personal/d35e-data
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Types
// =============================================================================

type D35EItem = {
  _id: string;
  name: string;
  type: 'weapon' | 'equipment' | 'loot' | 'enhancement';
  img?: string;
  data: {
    description?: { value?: string };
    price?: number;
    weight?: number;
    masterwork?: boolean;

    // Weapon specific
    weaponType?: string; // simple, martial, exotic
    weaponSubtype?: string; // light, one-handed, two-handed
    weaponData?: {
      damageRoll?: string;
      damageType?: string; // P, S, B, P and S, etc.
      critRange?: string; // "20", "19-20", "18-20"
      critMult?: string; // "2", "3", "4"
      range?: number | null;
    };
    properties?: Record<string, boolean>; // fin, thr, rch, mnk, etc.

    // Armor/Shield specific
    equipmentType?: string; // armor, shield, misc
    equipmentSubtype?: string; // lightArmor, mediumArmor, heavyArmor, lightShield, heavyShield, etc.
    armor?: {
      value?: number; // armor/shield bonus
      dex?: string | number | null; // max dex bonus
      acp?: number; // armor check penalty
      enh?: number; // enhancement bonus
    };
    spellFailure?: number;
    slot?: string;

    // Enhancement specific
    enhancementType?: string; // weapon, armor, misc
    enhIncreaseFormula?: string; // "1", "2", etc.
    nameExtension?: { prefix?: string; suffix?: string };
    requirements?: string;
    allowedTypes?: string[][];

    // Loot/Generic items
    subType?: string; // gear, ammo, etc.

    // Magic item changes (effects)
    changes?: Array<[string, string, string, string]>; // [value, target, subTarget, type]
  };
};

type StandardEntity = {
  id: string;
  entityType: string;
  name: string;
  description?: string;
  image?: string;
  weight?: number;
  cost?: { amount: number; currency: string };
  [key: string]: unknown;
};

// =============================================================================
// Utilities
// =============================================================================

function readNeDB(filePath: string): D35EItem[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as D35EItem);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function stripHtml(html: string | undefined): string | undefined {
  if (!html) return undefined;
  return html
    // Remove Foundry compendium links like @Compendium[D35E.spells.abc123]{Spell Name}
    .replace(/@Compendium\[[^\]]+\]\{([^}]+)\}/g, '$1')
    // Remove Foundry links like @UUID[...]
    .replace(/@UUID\[[^\]]+\]/g, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&times;/g, 'x')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// =============================================================================
// Image Assignment (using itemImageService rules)
// =============================================================================

// Icon rules copied from itemImageService.ts to avoid import issues in script
const iconRules = [
  // Exotic weapons con "chain" en el nombre
  { icon: "WeaponIcons/WeaponIconsVol2/Axe_v2_46.webp", keywords: ["spiked chain", "chain, spiked", "whip", "nunchaku", "bolas", "net"] },
  // Armor
  { icon: "ArmorIcons/BasicArmor_Icons/Chest_13.webp", keywords: ["chain shirt", "chainmail", "chain mail", "scale mail", "splint mail", "banded mail", "half plate", "full plate", "breastplate", "armor", "armour", "padded", "leather", "studded", "hide"] },
  // Shields
  { icon: "WeaponIcons/WeaponIconsVol1/shield_07.webp", keywords: ["shield", "buckler", "targe", "tower shield"] },
  // Swords - especificos
  { icon: "WeaponIcons/WeaponIconsVol1/Sword_55.webp", keywords: ["greatsword", "great sword", "bastard sword", "two-bladed sword"] },
  { icon: "WeaponIcons/WeaponIconsVol1/Sword_64.webp", keywords: ["katana", "scimitar", "falchion", "kukri"] },
  { icon: "WeaponIcons/WeaponIconsVol1/Sword_16.webp", keywords: ["short sword", "shortsword"] },
  { icon: "WeaponIcons/WeaponIconsVol1/Sword_05.webp", keywords: ["sword", "blade", "saber", "rapier", "longsword", "broadsword"] },
  // Daggers
  { icon: "WeaponIcons/WeaponIconsVol1/Dagger_15.webp", keywords: ["dagger", "knife", "dirk", "stiletto", "kris", "punching"] },
  // Axes
  { icon: "WeaponIcons/WeaponIconsVol2/Axe_v2_21.webp", keywords: ["axe", "hatchet", "battleaxe", "greataxe", "handaxe", "waraxe", "orc double axe"] },
  // Hammers & Maces
  { icon: "WeaponIcons/WeaponIconsVol1/Hammer_30.webp", keywords: ["hammer", "mace", "warhammer", "morningstar", "flail", "light hammer", "gnome hooked hammer"] },
  // Polearms
  { icon: "WeaponIcons/WeaponIconsVol1/Spear_12.webp", keywords: ["spear", "lance", "pike", "halberd", "glaive", "longspear", "shortspear", "trident", "ranseur", "guisarme", "partisan", "javelin"] },
  // Crossbows
  { icon: "WeaponIcons/WeaponIconsVol1/Bow_04.webp", keywords: ["crossbow", "hand crossbow", "heavy crossbow", "light crossbow", "repeating crossbow"] },
  // Bows
  { icon: "WeaponIcons/WeaponIconsVol2/Bow_v2_05.webp", keywords: ["bow", "longbow", "shortbow", "composite"] },
  // Clubs & Staves
  { icon: "WeaponIcons/WeaponIconsVol1/staff_17.webp", keywords: ["club", "staff", "quarterstaff", "greatclub"] },
  // Exotic oriental
  { icon: "WeaponIcons/WeaponIconsVol1/Dagger_29.webp", keywords: ["shuriken", "kama", "sai", "siangham", "nunchaku"] },
  // Pick & Sickle
  { icon: "WeaponIcons/WeaponIconsVol2/Axe_v2_48.webp", keywords: ["pick", "sickle"] },
  // Ammunition
  { icon: "WeaponIcons/WeaponIconsVol1/Arrow_36.webp", keywords: ["arrow", "bolt", "dart", "sling bullet"] },
  // Helmets
  { icon: "ArmorIcons/ArmorSet_Icons/Mail/Mail13_head.webp", keywords: ["helmet", "helm", "headgear", "crown", "circlet", "headband"] },
  // Boots
  { icon: "ArmorIcons/ArmorSet_Icons/Cloth/Cloth10_Boots.webp", keywords: ["boots", "footwear", "greaves", "slippers", "sandals"] },
  // Gloves
  { icon: "ArmorIcons/BasicArmor_Icons/Gloves_19.webp", keywords: ["gloves", "gauntlet", "bracers", "bracer"] },
  // Rings
  { icon: "ArmorIcons/RingAndNeck_Icons/Ring_07.webp", keywords: ["ring", "signet"] },
  // Necklaces & Amulets
  { icon: "ArmorIcons/RingAndNeck_Icons/Necklace_01.webp", keywords: ["amulet", "necklace", "pendant", "periapt", "medallion", "brooch", "scarab", "talisman"] },
  // Belts
  { icon: "ArmorIcons/ArmorSet_Icons/Cloth/Cloth10_Belt.webp", keywords: ["belt", "girdle", "sash"] },
  // Cloaks
  { icon: "ArmorIcons/ArmorSet_Icons/Cloak/cloak_01.webp", keywords: ["cape", "cloak", "mantle", "robe", "shroud", "vest"] },
  // Eyes
  { icon: "ArmorIcons/RingAndNeck_Icons/Ring_07.webp", keywords: ["goggles", "lenses", "eyes", "mask", "monocle", "spectacles"] },
  // Potions
  { icon: "ProfessionIcons/LootIcons/Loot_06.webp", keywords: ["potion", "elixir", "vial", "oil", "salve", "unguent"] },
  // Wands & Rods
  { icon: "WeaponIcons/WeaponIconsVol2/Staff_v2_04.webp", keywords: ["wand", "rod", "scepter"] },
  // Books & Scrolls
  { icon: "WeaponIcons/WeaponIconsVol1/Book_11.webp", keywords: ["book", "tome", "manual", "scroll", "paper", "parchment", "map", "spellbook"] },
  // Bags & Containers
  { icon: "ProfessionIcons/LootIcons/Loot_101_chest.webp", keywords: ["backpack", "bag", "sack", "pouch", "chest", "case", "quiver", "haversack", "portable hole"] },
  // Ioun stones
  { icon: "ProfessionIcons/LootIcons/Loot_06.webp", keywords: ["ioun stone", "ioun"] },
  // Instruments
  { icon: "ProfessionIcons/LootIcons/Loot_06.webp", keywords: ["horn", "drum", "lyre", "flute", "instrument", "harp", "chime"] },
  // Figurines
  { icon: "ProfessionIcons/LootIcons/Loot_06.webp", keywords: ["figurine", "statuette", "statue"] },
  // Feather tokens
  { icon: "ProfessionIcons/LootIcons/Loot_06.webp", keywords: ["feather token", "token"] },
  // Carpet
  { icon: "ProfessionIcons/LootIcons/Loot_06.webp", keywords: ["carpet", "rug"] },
  // Tools
  { icon: "ProfessionIcons/LootIcons/Loot_06.webp", keywords: ["crowbar", "sledge", "shovel", "lock", "thieves", "tool", "kit"] },
  // Holy symbols
  { icon: "ProfessionIcons/LootIcons/Loot_51.webp", keywords: ["holy symbol", "unholy symbol", "symbol"] },
  // Light
  { icon: "ProfessionIcons/LootIcons/Loot_06.webp", keywords: ["torch", "lantern", "lamp", "candle", "sunrod"] },
  // Rope
  { icon: "ProfessionIcons/LootIcons/Loot_06.webp", keywords: ["rope", "grappling", "piton", "chain"] },
  // Food
  { icon: "ProfessionIcons/LootIcons/Fruit.webp", keywords: ["rations", "food", "water", "waterskin"] },
  // Camping
  { icon: "ProfessionIcons/LootIcons/Loot_06.webp", keywords: ["tent", "bedroll", "blanket"] },
];

const DEFAULT_ITEM_ICON = "ProfessionIcons/LootIcons/Loot_06.webp";

function getImageForItem(itemName: string): string {
  const nameLower = itemName.toLowerCase();
  for (const rule of iconRules) {
    for (const keyword of rule.keywords) {
      if (nameLower.includes(keyword)) {
        return rule.icon;
      }
    }
  }
  return DEFAULT_ITEM_ICON;
}

function parseDamageType(d35eType: string | undefined): string {
  if (!d35eType) return 'bludgeoning';
  const t = d35eType.toUpperCase();
  if (t.includes('S') && t.includes('P')) return 'slashing/piercing';
  if (t.includes('P') && t.includes('B')) return 'piercing/bludgeoning';
  if (t.includes('S') && t.includes('B')) return 'slashing/bludgeoning';
  if (t === 'S') return 'slashing';
  if (t === 'P') return 'piercing';
  if (t === 'B') return 'bludgeoning';
  return 'bludgeoning';
}

function parseCritRange(critRange: string | undefined): number {
  if (!critRange) return 20;
  // "19-20" -> 19, "18-20" -> 18, "20" -> 20
  const match = critRange.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 20;
}

function parseCritMult(critMult: string | undefined): number {
  if (!critMult) return 2;
  const num = parseInt(critMult, 10);
  return isNaN(num) ? 2 : num;
}

function parseWeaponCategory(weaponType: string | undefined): string {
  if (!weaponType) return 'simple';
  const t = weaponType.toLowerCase();
  if (t === 'martial') return 'martial';
  if (t === 'exotic') return 'exotic';
  return 'simple';
}

function parseWeightClass(weaponSubtype: string | undefined): string {
  if (!weaponSubtype) return 'one-handed';
  const t = weaponSubtype.toLowerCase();
  if (t === 'light') return 'light';
  if (t.includes('two') || t === 'ranged') return 'two-handed';
  return 'one-handed';
}

function parseWeaponType(
  weaponSubtype: string | undefined,
  range: number | null | undefined
): string {
  if (!weaponSubtype) return 'melee';
  const t = weaponSubtype.toLowerCase();
  if (t === 'ranged' || (range && range > 0)) return 'ranged';
  return 'melee';
}

function parseArmorType(equipmentSubtype: string | undefined): string {
  if (!equipmentSubtype) return 'medium';
  const t = equipmentSubtype.toLowerCase();
  if (t.includes('light')) return 'light';
  if (t.includes('heavy')) return 'heavy';
  return 'medium';
}

function parseShieldType(equipmentSubtype: string | undefined): string {
  if (!equipmentSubtype) return 'light';
  const t = equipmentSubtype.toLowerCase();
  if (t.includes('tower')) return 'tower';
  if (t.includes('heavy')) return 'heavy';
  if (t.includes('buckler')) return 'buckler';
  return 'light';
}

function parseItemSlot(slot: string | undefined): string | undefined {
  if (!slot) return undefined;
  const slotMap: Record<string, string> = {
    head: 'head',
    headband: 'headband',
    eyes: 'eyes',
    shoulders: 'shoulders',
    neck: 'neck',
    chest: 'chest',
    body: 'body',
    armor: 'armor',
    belt: 'belt',
    wrists: 'wrists',
    hands: 'hands',
    ring: 'ring',
    feet: 'feet',
    shield: 'shield',
    slotless: 'slotless',
  };
  return slotMap[slot.toLowerCase()] || slot;
}

// =============================================================================
// Converters
// =============================================================================

function convertWeapon(item: D35EItem): StandardEntity {
  const weapon: StandardEntity = {
    id: slugify(item.name),
    entityType: 'weapon',
    name: item.name,
    description: stripHtml(item.data.description?.value),
    image: getImageForItem(item.name),
    weight: item.data.weight || 0,
    cost: { amount: item.data.price || 0, currency: 'gp' },

    // Combat stats
    damageDice: item.data.weaponData?.damageRoll || '1d4',
    damageType: parseDamageType(item.data.weaponData?.damageType),
    critRange: parseCritRange(item.data.weaponData?.critRange),
    critMultiplier: parseCritMult(item.data.weaponData?.critMult),

    // Classification
    weaponCategory: parseWeaponCategory(item.data.weaponType),
    weaponType: parseWeaponType(
      item.data.weaponSubtype,
      item.data.weaponData?.range
    ),
    weightClass: parseWeightClass(item.data.weaponSubtype),

    // Special properties
    finesse: item.data.properties?.fin || false,
    isMasterwork: item.data.masterwork || false,
  };

  // Optional: reach
  if (item.data.properties?.rch) {
    weapon.reach = 10;
  }

  // Optional: range increment
  if (item.data.weaponData?.range) {
    weapon.rangeIncrement = item.data.weaponData.range;
  }

  return weapon;
}

function convertArmor(item: D35EItem): StandardEntity {
  // Calculate speed based on armor type
  const armorType = parseArmorType(item.data.equipmentSubtype);
  const speed30 = armorType === 'heavy' ? 20 : 30;
  const speed20 = armorType === 'heavy' ? 15 : 20;

  const armor: StandardEntity = {
    id: slugify(item.name),
    entityType: 'armor',
    name: item.name,
    description: stripHtml(item.data.description?.value),
    image: getImageForItem(item.name),
    weight: item.data.weight || 0,
    cost: { amount: item.data.price || 0, currency: 'gp' },

    // Protection stats
    armorBonus: item.data.armor?.value || 0,
    maxDexBonus:
      item.data.armor?.dex !== null && item.data.armor?.dex !== undefined
        ? typeof item.data.armor.dex === 'string'
          ? parseInt(item.data.armor.dex, 10)
          : item.data.armor.dex
        : 99,
    armorCheckPenalty: -(item.data.armor?.acp || 0), // D35E stores as positive, we use negative
    arcaneSpellFailure: item.data.spellFailure || 0,

    // Movement
    speed30,
    speed20,

    // Classification
    armorType,

    // Enhancement
    isMasterwork: item.data.masterwork || false,
  };

  return armor;
}

function convertShield(item: D35EItem): StandardEntity {
  const shield: StandardEntity = {
    id: slugify(item.name),
    entityType: 'shield',
    name: item.name,
    description: stripHtml(item.data.description?.value),
    image: getImageForItem(item.name),
    weight: item.data.weight || 0,
    cost: { amount: item.data.price || 0, currency: 'gp' },

    // Protection stats
    shieldBonus: item.data.armor?.value || 0,
    armorCheckPenalty: -(item.data.armor?.acp || 0),
    arcaneSpellFailure: item.data.spellFailure || 0,

    // Classification
    shieldType: parseShieldType(item.data.equipmentSubtype),

    // Enhancement
    isMasterwork: item.data.masterwork || false,
  };

  return shield;
}

function convertGenericItem(item: D35EItem): StandardEntity {
  return {
    id: slugify(item.name),
    entityType: 'item',
    name: item.name,
    description: stripHtml(item.data.description?.value),
    image: getImageForItem(item.name),
    weight: item.data.weight || 0,
    cost: { amount: item.data.price || 0, currency: 'gp' },
  };
}

function convertWondrousItem(item: D35EItem): StandardEntity {
  const wondrous: StandardEntity = {
    id: slugify(item.name),
    entityType: 'wondrousItem',
    name: item.name,
    description: stripHtml(item.data.description?.value),
    image: getImageForItem(item.name),
    weight: item.data.weight || 0,
    cost: { amount: item.data.price || 0, currency: 'gp' },
    itemSlot: parseItemSlot(item.data.slot),
  };

  // Parse aura from description if available
  const auraMatch = item.data.description?.value?.match(
    /(?:Faint|Moderate|Strong|Overwhelming)\s+\w+/i
  );
  if (auraMatch) {
    wondrous.aura = auraMatch[0];
  }

  // Parse caster level from description
  const clMatch = item.data.description?.value?.match(/(?:CL|ML)\s*(\d+)/i);
  if (clMatch) {
    wondrous.casterLevel = parseInt(clMatch[1], 10);
  }

  return wondrous;
}

function convertWeaponProperty(item: D35EItem): StandardEntity {
  const enhIncrease = item.data.enhIncreaseFormula
    ? parseInt(item.data.enhIncreaseFormula, 10)
    : 0;

  const property: StandardEntity = {
    id: slugify(item.name),
    entityType: 'weaponProperty',
    name: item.name,
    description: stripHtml(item.data.description?.value),

    // Cost
    costType: enhIncrease > 0 ? 'bonus' : 'flat',
    costBonus: enhIncrease > 0 ? enhIncrease : undefined,

    // Crafting
    craftingPrerequisites: typeof item.data.requirements === 'string'
      ? [item.data.requirements]
      : undefined,

    // Aura - extract from description or requirements
    casterLevel: 0, // Would need to parse from requirements
    aura: '',
  };

  // Parse CL from requirements
  const reqStr = typeof item.data.requirements === 'string' ? item.data.requirements : '';
  const clMatch = reqStr.match(/CL\s*(\d+)/i);
  if (clMatch) {
    property.casterLevel = parseInt(clMatch[1], 10);
  }

  // Parse damage info for effects
  if (item.data.weaponData?.damageRoll) {
    property.bonusDamage = item.data.weaponData.damageRoll;
    property.bonusDamageType = item.data.weaponData.damageType || undefined;
  }

  return property;
}

function convertArmorProperty(item: D35EItem): StandardEntity {
  const enhIncrease = item.data.enhIncreaseFormula
    ? parseInt(item.data.enhIncreaseFormula, 10)
    : 0;

  const property: StandardEntity = {
    id: slugify(item.name),
    entityType: 'armorProperty',
    name: item.name,
    description: stripHtml(item.data.description?.value),

    // Cost
    costType: enhIncrease > 0 ? 'bonus' : 'flat',
    costBonus: enhIncrease > 0 ? enhIncrease : undefined,

    // Crafting
    craftingPrerequisites: typeof item.data.requirements === 'string'
      ? [item.data.requirements]
      : undefined,

    casterLevel: 0,
    aura: '',
  };

  // Parse CL from requirements
  const reqStr = typeof item.data.requirements === 'string' ? item.data.requirements : '';
  const clMatch = reqStr.match(/CL\s*(\d+)/i);
  if (clMatch) {
    property.casterLevel = parseInt(clMatch[1], 10);
  }

  return property;
}

// =============================================================================
// Main Processing
// =============================================================================

function processWeapons(items: D35EItem[]): StandardEntity[] {
  return items
    .filter((item) => item.type === 'weapon')
    .map(convertWeapon)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function processArmorsAndShields(
  items: D35EItem[]
): { armors: StandardEntity[]; shields: StandardEntity[] } {
  const armors: StandardEntity[] = [];
  const shields: StandardEntity[] = [];

  for (const item of items) {
    if (item.type !== 'equipment') continue;

    const equipType = item.data.equipmentType?.toLowerCase();
    const subType = item.data.equipmentSubtype?.toLowerCase();

    if (equipType === 'shield' || subType?.includes('shield')) {
      shields.push(convertShield(item));
    } else if (
      equipType === 'armor' ||
      subType?.includes('armor') ||
      subType?.includes('chain') ||
      subType?.includes('plate') ||
      subType?.includes('hide') ||
      subType?.includes('leather')
    ) {
      armors.push(convertArmor(item));
    }
  }

  return {
    armors: armors.sort((a, b) => a.name.localeCompare(b.name)),
    shields: shields.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function processGenericItems(items: D35EItem[]): StandardEntity[] {
  return items
    .filter((item) => item.type === 'loot')
    .map(convertGenericItem)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function processMagicItems(items: D35EItem[]): StandardEntity[] {
  return items
    .filter((item) => {
      if (item.type !== 'equipment') return false;
      const subType = item.data.equipmentSubtype?.toLowerCase();
      return subType === 'wondrous' || item.data.slot !== undefined;
    })
    .map(convertWondrousItem)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function processEnhancements(
  items: D35EItem[]
): { weaponProperties: StandardEntity[]; armorProperties: StandardEntity[] } {
  const weaponProperties: StandardEntity[] = [];
  const armorProperties: StandardEntity[] = [];

  for (const item of items) {
    if (item.type !== 'enhancement') continue;

    const enhType = item.data.enhancementType?.toLowerCase();

    if (enhType === 'weapon') {
      weaponProperties.push(convertWeaponProperty(item));
    } else if (enhType === 'armor') {
      armorProperties.push(convertArmorProperty(item));
    }
  }

  return {
    weaponProperties: weaponProperties.sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    armorProperties: armorProperties.sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
  };
}

// =============================================================================
// Output Generation
// =============================================================================

function generateTypeScriptFile(
  entities: StandardEntity[],
  typeName: string,
  variableName: string
): string {
  // Use a generic record type to allow additional fields beyond StandardEntity
  const imports = `import type { StandardEntity } from '@zukus/core';

/**
 * Extended entity type with dynamic fields.
 * The fields are defined by the schema addons (dnd35item, effectful, etc.)
 */
type ExtendedEntity = StandardEntity & Record<string, unknown>;`;

  const jsonData = JSON.stringify(entities, null, 2);

  return `/**
 * D&D 3.5 SRD ${typeName}
 * Auto-generated from D35E Foundry VTT data
 * Source: https://github.com/Rughalt/D35E
 */

${imports}

export const ${variableName}: ExtendedEntity[] = ${jsonData};
`;
}

function writeOutput(
  outputDir: string,
  filename: string,
  content: string
): void {
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  Written: ${filename}`);
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const D35E_PATH = '/Users/cilveti/personal/d35e-data/packs';
  const OUTPUT_DIR =
    '/Users/cilveti/personal/zukus/packages/core/srd/equipment/d35e';

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Reading D35E packs...');

  // Read all pack files
  const weaponsData = readNeDB(path.join(D35E_PATH, 'weapons-and-ammo.db'));
  const armorData = readNeDB(path.join(D35E_PATH, 'armors-and-shields.db'));
  const itemsData = readNeDB(path.join(D35E_PATH, 'items.db'));
  const magicItemsData = readNeDB(path.join(D35E_PATH, 'magic-items.db'));
  const enhancementsData = readNeDB(path.join(D35E_PATH, 'enhancements.db'));

  console.log(`  Weapons/Ammo: ${weaponsData.length} items`);
  console.log(`  Armor/Shields: ${armorData.length} items`);
  console.log(`  Generic Items: ${itemsData.length} items`);
  console.log(`  Magic Items: ${magicItemsData.length} items`);
  console.log(`  Enhancements: ${enhancementsData.length} items`);

  console.log('\nConverting...');

  // Process each category
  const weapons = processWeapons(weaponsData);
  console.log(`  Weapons: ${weapons.length}`);

  const { armors, shields } = processArmorsAndShields(armorData);
  console.log(`  Armors: ${armors.length}`);
  console.log(`  Shields: ${shields.length}`);

  const genericItems = processGenericItems(itemsData);
  console.log(`  Generic Items: ${genericItems.length}`);

  const wondrousItems = processMagicItems(magicItemsData);
  console.log(`  Wondrous Items: ${wondrousItems.length}`);

  const { weaponProperties, armorProperties } =
    processEnhancements(enhancementsData);
  console.log(`  Weapon Properties: ${weaponProperties.length}`);
  console.log(`  Armor Properties: ${armorProperties.length}`);

  console.log('\nWriting output files...');

  // Generate TypeScript files
  writeOutput(
    OUTPUT_DIR,
    'weapons.ts',
    generateTypeScriptFile(weapons, 'Weapons', 'srdWeapons')
  );

  writeOutput(
    OUTPUT_DIR,
    'armors.ts',
    generateTypeScriptFile(armors, 'Armors', 'srdArmors')
  );

  writeOutput(
    OUTPUT_DIR,
    'shields.ts',
    generateTypeScriptFile(shields, 'Shields', 'srdShields')
  );

  writeOutput(
    OUTPUT_DIR,
    'items.ts',
    generateTypeScriptFile(genericItems, 'Items', 'srdItems')
  );

  writeOutput(
    OUTPUT_DIR,
    'wondrousItems.ts',
    generateTypeScriptFile(wondrousItems, 'Wondrous Items', 'srdWondrousItems')
  );

  writeOutput(
    OUTPUT_DIR,
    'weaponProperties.ts',
    generateTypeScriptFile(
      weaponProperties,
      'Weapon Properties',
      'srdWeaponProperties'
    )
  );

  writeOutput(
    OUTPUT_DIR,
    'armorProperties.ts',
    generateTypeScriptFile(
      armorProperties,
      'Armor Properties',
      'srdArmorProperties'
    )
  );

  // Generate index file
  const indexContent = `/**
 * D&D 3.5 SRD Equipment Index
 * Auto-generated from D35E Foundry VTT data
 */

export { srdWeapons } from './weapons';
export { srdArmors } from './armors';
export { srdShields } from './shields';
export { srdItems } from './items';
export { srdWondrousItems } from './wondrousItems';
export { srdWeaponProperties } from './weaponProperties';
export { srdArmorProperties } from './armorProperties';
`;

  writeOutput(OUTPUT_DIR, 'index.ts', indexContent);

  console.log('\nDone!');
  console.log(`\nTotal items converted:`);
  console.log(
    `  ${weapons.length + armors.length + shields.length + genericItems.length + wondrousItems.length} equipment items`
  );
  console.log(
    `  ${weaponProperties.length + armorProperties.length} magic properties`
  );
}

main().catch(console.error);
