/**
 * Script para migrar items del SRD D&D 3.5 desde zukusnextmicon
 *
 * Este script:
 * 1. Lee los datos JSON de weapons, armor y goods_and_services
 * 2. Transforma los datos al formato de tipos de zukus
 * 3. Genera archivos TypeScript con todas las entidades
 *
 * Uso:
 *   bun scripts/migrate-srd-items.ts
 *
 * Fuente de datos:
 *   /Users/cilveti/personal/zukusnextmicon/scripts/tmp/scrape_dnd_equipment/data/
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

// =============================================================================
// Tipos de entrada (formato JSON de zukusnextmicon)
// =============================================================================

type CostInput = {
  value: number;
  unit: string;
} | null;

type WeightInput = {
  value: number;
  unit: string;
} | null;

type WeaponInput = {
  category: string;
  name: string;
  cost: CostInput;
  damage_small: string | null;
  damage_medium: string | null;
  critical: string | null;
  range_increment: { value: number; unit: string } | null;
  weight: WeightInput;
  damage_type: string[];
  description: string | null;
  properties: string[];
};

type ArmorInput = {
  category: string;
  name: string;
  cost: CostInput;
  armor_shield_bonus: number | null;
  max_dex_bonus: number | null;
  armor_check_penalty: number | null;
  arcane_spell_failure_chance: number | null;
  speed: { base_30ft: number; base_20ft: number } | null;
  weight: WeightInput;
  description: string | null;
};

type GoodsInput = {
  category: string;
  name: string;
  cost: CostInput;
  weight: WeightInput;
  description: string | null;
};

// =============================================================================
// Utilidades
// =============================================================================

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

function camelCase(name: string): string {
  const slug = slugify(name);
  // Convert to camelCase
  let result = slug.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
  // Ensure it starts with a letter (prefix with underscore if starts with number)
  if (/^[0-9]/.test(result)) {
    result = "_" + result;
  }
  // Replace any remaining invalid characters
  result = result.replace(/-/g, "");
  return result;
}

function parseCritical(critical: string | null): { range: number; multiplier: number } {
  if (!critical) {
    return { range: 20, multiplier: 2 };
  }

  // Formato: "19-20/x2" o "x3" o "18-20/x2"
  const match = critical.match(/(?:(\d+)-(\d+)\/)?x(\d+)/);
  if (match) {
    const rangeStart = match[1] ? parseInt(match[1]) : 20;
    const multiplier = parseInt(match[3]);
    return { range: rangeStart, multiplier };
  }

  return { range: 20, multiplier: 2 };
}

function costToGp(cost: CostInput): number {
  if (!cost) return 0;
  const { value, unit } = cost;
  switch (unit) {
    case "gp":
      return value;
    case "sp":
      return value / 10;
    case "cp":
      return value / 100;
    default:
      return value;
  }
}

function determineProficiencyType(category: string): "simple" | "martial" | "exotic" {
  const lower = category.toLowerCase();
  if (lower.includes("simple")) return "simple";
  if (lower.includes("martial")) return "martial";
  if (lower.includes("exotic")) return "exotic";
  return "simple";
}

function determineWeaponHandedness(category: string): {
  twoHanded: boolean;
  weightType: "LIGHT" | "MEDIUM" | "HEAVY";
  defaultWieldType: "primary" | "offHand" | "twoHanded";
} {
  const lower = category.toLowerCase();
  if (lower.includes("two-handed")) {
    return { twoHanded: true, weightType: "HEAVY", defaultWieldType: "twoHanded" };
  }
  if (lower.includes("one-handed")) {
    return { twoHanded: false, weightType: "MEDIUM", defaultWieldType: "primary" };
  }
  if (lower.includes("light")) {
    return { twoHanded: false, weightType: "LIGHT", defaultWieldType: "primary" };
  }
  return { twoHanded: false, weightType: "MEDIUM", defaultWieldType: "primary" };
}

function mapDamageType(
  damageTypes: string[]
): "slashing" | "piercing" | "bludgeoning" {
  const lower = damageTypes.map((d) => d.toLowerCase());
  if (lower.includes("slashing")) return "slashing";
  if (lower.includes("piercing")) return "piercing";
  if (lower.includes("bludgeoning")) return "bludgeoning";
  return "bludgeoning";
}

function isRangedCategory(category: string): boolean {
  return category.toLowerCase().includes("ranged");
}

function getAmmunitionType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("crossbow")) return "BOLT";
  if (lower.includes("bow")) return "ARROW";
  if (lower.includes("sling")) return "SLING_BULLET";
  return "ARROW";
}

function hasProperty(properties: string[], prop: string): boolean {
  return properties.some((p) => p.toLowerCase().includes(prop.toLowerCase()));
}

// =============================================================================
// Transformaciones
// =============================================================================

function transformWeapon(weapon: WeaponInput): string {
  const uniqueId = slugify(weapon.name);
  const varName = camelCase(weapon.name);
  const { range, multiplier } = parseCritical(weapon.critical);
  const isRanged = isRangedCategory(weapon.category);
  const handedness = determineWeaponHandedness(weapon.category);
  const proficiency = determineProficiencyType(weapon.category);
  const damageType = mapDamageType(weapon.damage_type);
  const weight = weapon.weight?.value ?? 0;
  const damageDice = weapon.damage_medium ?? "1d4";
  const cost = costToGp(weapon.cost);
  const hasFinesse =
    weapon.name.toLowerCase().includes("rapier") ||
    weapon.name.toLowerCase().includes("whip");
  const isThrown = hasProperty(weapon.properties, "thrown");
  const thrownRange = isThrown && weapon.range_increment?.value ? weapon.range_increment.value : undefined;

  if (isRanged) {
    const rangeIncrement = weapon.range_increment?.value ?? 20;
    const ammunitonType = getAmmunitionType(weapon.name);
    const requiresLoading = weapon.name.toLowerCase().includes("crossbow");

    return `export const ${varName}: RangedWeapon = {
  name: "${weapon.name}",
  itemType: "WEAPON",
  uniqueId: "${uniqueId}",
  damageDice: "${damageDice}",
  weaponAttackType: "ranged",
  proficiencyType: "${proficiency}",
  defaultWieldType: "${handedness.twoHanded ? "twoHanded" : "primary"}",
  damageType: {
    type: "basic",
    damageType: "${damageType}",
  },
  size: "MEDIUM",
  isMasterwork: false,
  baseCritRange: ${range},
  baseCritMultiplier: ${multiplier},
  changes: [],
  description: ${weapon.description ? JSON.stringify(weapon.description) : '""'},
  specialChanges: [],
  rangeIncrement: ${rangeIncrement},
  ammunitionType: "${ammunitonType}",
  requiresLoading: ${requiresLoading},
  twoHanded: ${handedness.twoHanded},
  weight: ${weight},
  enhancements: [],
  equippedChanges: [],
  equippedContextChanges: [],
  wieldedChanges: [],
  wieldedContextChanges: [],
  equipable: true,
  equipped: false,
  wielded: false,
};`;
  }

  return `export const ${varName}: MeleeWeapon = {
  name: "${weapon.name}",
  itemType: "WEAPON",
  uniqueId: "${uniqueId}",
  damageDice: "${damageDice}",
  weaponAttackType: "melee",
  proficiencyType: "${proficiency}",
  defaultWieldType: "${handedness.defaultWieldType}",
  damageType: {
    type: "basic",
    damageType: "${damageType}",
  },
  size: "MEDIUM",
  isMasterwork: false,
  baseCritRange: ${range},
  baseCritMultiplier: ${multiplier},
  changes: [],
  description: ${weapon.description ? JSON.stringify(weapon.description) : '""'},
  specialChanges: [],
  twoHanded: ${handedness.twoHanded},
  weightType: "${handedness.weightType}",
  weight: ${weight},
  enhancements: [],
  finesse: ${hasFinesse},
  reachRange: ${hasProperty(weapon.properties, "reach") ? 10 : "undefined"},
  thrown: ${isThrown},
  thrownRange: ${thrownRange ?? "undefined"},
  equippedChanges: [],
  equippedContextChanges: [],
  wieldedChanges: [],
  wieldedContextChanges: [],
  equipable: true,
  equipped: false,
  wielded: false,
};`;
}

function transformArmor(armor: ArmorInput): string | null {
  const category = armor.category.toLowerCase();

  // Skip "Extra" category items (armor spikes, locked gauntlet, etc.)
  if (category === "extra") {
    return null;
  }

  const uniqueId = slugify(armor.name);
  const varName = camelCase(armor.name);
  const cost = costToGp(armor.cost);
  const weight = armor.weight?.value ?? 0;

  if (category === "shield") {
    return `export const ${varName}: Shield = {
  uniqueId: "${uniqueId}",
  name: "${armor.name}",
  arcaneSpellFailureChance: ${armor.arcane_spell_failure_chance ?? 0},
  armorCheckPenalty: ${armor.armor_check_penalty ?? 0},
  baseShieldBonus: ${armor.armor_shield_bonus ?? 0},
  enhancementBonus: 0,
  ${armor.max_dex_bonus !== null ? `maxDexBonus: ${armor.max_dex_bonus},` : ""}
  itemType: "SHIELD",
  weight: ${weight},
  description: ${armor.description ? JSON.stringify(armor.description) : `"${armor.name}"`},
  cost: ${cost},
  equipped: false,
  equipable: true,
  enhancements: [],
};`;
  }

  // Regular armor
  const speed30 = armor.speed?.base_30ft ?? 30;
  const speed20 = armor.speed?.base_20ft ?? 20;

  return `export const ${varName}: Armor = {
  uniqueId: "${uniqueId}",
  name: "${armor.name}",
  arcaneSpellFailureChance: ${armor.arcane_spell_failure_chance ?? 0},
  armorCheckPenalty: ${armor.armor_check_penalty ?? 0},
  baseArmorBonus: ${armor.armor_shield_bonus ?? 0},
  enhancementBonus: 0,
  maxDexBonus: ${armor.max_dex_bonus ?? 10},
  speed20: ${speed20},
  speed30: ${speed30},
  itemType: "ARMOR",
  weight: ${weight},
  description: ${armor.description ? JSON.stringify(armor.description) : `"${armor.name}"`},
  cost: ${cost},
  equipped: false,
  equipable: true,
  enhancements: [],
};`;
}

function transformGoodsItem(item: GoodsInput): string {
  const uniqueId = slugify(item.name);
  const varName = camelCase(item.name);
  const cost = costToGp(item.cost);
  const weight = item.weight?.value ?? 0;

  return `export const ${varName}: Misc = {
  uniqueId: "${uniqueId}",
  name: "${item.name}",
  itemType: "MISC",
  weight: ${weight},
  description: ${item.description ? JSON.stringify(item.description) : `"${item.name}"`},
  cost: ${cost},
  equipable: false,
};`;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log("=== Migracion de Items SRD D&D 3.5 ===\n");

  const SOURCE_DIR = "/Users/cilveti/personal/zukusnextmicon/scripts/tmp/scrape_dnd_equipment/data";
  const OUTPUT_DIR = "/Users/cilveti/personal/zukus/packages/core/srd/equipment/generated";

  // Crear directorio de salida
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Leer archivos JSON
  console.log("1. Leyendo archivos fuente...");

  const weaponsJson = await readFile(join(SOURCE_DIR, "weapons.json"), "utf-8");
  const armorJson = await readFile(join(SOURCE_DIR, "armor.json"), "utf-8");
  const goodsJson = await readFile(join(SOURCE_DIR, "goods_and_services.json"), "utf-8");

  const weapons: WeaponInput[] = JSON.parse(weaponsJson);
  const armors: ArmorInput[] = JSON.parse(armorJson);
  const goods: GoodsInput[] = JSON.parse(goodsJson);

  console.log(`   Weapons: ${weapons.length}`);
  console.log(`   Armors: ${armors.length}`);
  console.log(`   Goods: ${goods.length}`);

  // Transformar weapons
  console.log("\n2. Transformando weapons...");
  const meleeWeapons: string[] = [];
  const rangedWeapons: string[] = [];
  const weaponVarNames: string[] = [];

  for (const weapon of weapons) {
    const transformed = transformWeapon(weapon);
    const varName = camelCase(weapon.name);
    weaponVarNames.push(varName);

    if (isRangedCategory(weapon.category)) {
      rangedWeapons.push(transformed);
    } else {
      meleeWeapons.push(transformed);
    }
  }

  const weaponsFile = `/**
 * SRD Weapons - Generado automaticamente por migrate-srd-items.ts
 * NO EDITAR MANUALMENTE
 */

import type { MeleeWeapon, RangedWeapon } from "../../../core/domain/weapons/weapon";

// =============================================================================
// Melee Weapons (${meleeWeapons.length})
// =============================================================================

${meleeWeapons.join("\n\n")}

// =============================================================================
// Ranged Weapons (${rangedWeapons.length})
// =============================================================================

${rangedWeapons.join("\n\n")}

// =============================================================================
// All Weapons Array
// =============================================================================

export const allSrdWeapons = [
  ${weaponVarNames.join(",\n  ")},
];
`;

  await writeFile(join(OUTPUT_DIR, "srdWeapons.ts"), weaponsFile);
  console.log(`   Generado: ${OUTPUT_DIR}/srdWeapons.ts`);
  console.log(`   - ${meleeWeapons.length} melee weapons`);
  console.log(`   - ${rangedWeapons.length} ranged weapons`);

  // Transformar armor
  console.log("\n3. Transformando armor...");
  const armorEntries: string[] = [];
  const shieldEntries: string[] = [];
  const armorVarNames: string[] = [];
  const shieldVarNames: string[] = [];

  for (const armor of armors) {
    const transformed = transformArmor(armor);
    if (!transformed) continue;

    const varName = camelCase(armor.name);

    if (armor.category.toLowerCase() === "shield") {
      shieldEntries.push(transformed);
      shieldVarNames.push(varName);
    } else {
      armorEntries.push(transformed);
      armorVarNames.push(varName);
    }
  }

  const armorFile = `/**
 * SRD Armor & Shields - Generado automaticamente por migrate-srd-items.ts
 * NO EDITAR MANUALMENTE
 */

import type { Armor, Shield } from "../../../core/domain/character/baseData/equipment";

// =============================================================================
// Armor (${armorEntries.length})
// =============================================================================

${armorEntries.join("\n\n")}

// =============================================================================
// Shields (${shieldEntries.length})
// =============================================================================

${shieldEntries.join("\n\n")}

// =============================================================================
// All Armor & Shields Arrays
// =============================================================================

export const allSrdArmor = [
  ${armorVarNames.join(",\n  ")},
];

export const allSrdShields = [
  ${shieldVarNames.join(",\n  ")},
];
`;

  await writeFile(join(OUTPUT_DIR, "srdArmor.ts"), armorFile);
  console.log(`   Generado: ${OUTPUT_DIR}/srdArmor.ts`);
  console.log(`   - ${armorEntries.length} armors`);
  console.log(`   - ${shieldEntries.length} shields`);

  // Transformar goods
  console.log("\n4. Transformando goods & services...");
  const goodsEntries: string[] = [];
  const goodsVarNames: string[] = [];

  for (const item of goods) {
    const transformed = transformGoodsItem(item);
    const varName = camelCase(item.name);
    goodsEntries.push(transformed);
    goodsVarNames.push(varName);
  }

  const goodsFile = `/**
 * SRD Goods & Services - Generado automaticamente por migrate-srd-items.ts
 * NO EDITAR MANUALMENTE
 */

import type { Misc } from "../../../core/domain/character/baseData/equipment";

// =============================================================================
// Goods & Services (${goodsEntries.length})
// =============================================================================

${goodsEntries.join("\n\n")}

// =============================================================================
// All Goods Array
// =============================================================================

export const allSrdGoods = [
  ${goodsVarNames.join(",\n  ")},
];
`;

  await writeFile(join(OUTPUT_DIR, "srdGoods.ts"), goodsFile);
  console.log(`   Generado: ${OUTPUT_DIR}/srdGoods.ts`);
  console.log(`   - ${goodsEntries.length} items`);

  // Crear index.ts
  const indexFile = `/**
 * SRD Equipment - Generado automaticamente
 */

export * from "./srdWeapons";
export * from "./srdArmor";
export * from "./srdGoods";

import { allSrdWeapons } from "./srdWeapons";
import { allSrdArmor, allSrdShields } from "./srdArmor";
import { allSrdGoods } from "./srdGoods";

export const allSrdEquipment = [
  ...allSrdWeapons,
  ...allSrdArmor,
  ...allSrdShields,
  ...allSrdGoods,
];
`;

  await writeFile(join(OUTPUT_DIR, "index.ts"), indexFile);
  console.log(`   Generado: ${OUTPUT_DIR}/index.ts`);

  // Resumen
  console.log("\n=== Resumen ===");
  console.log(`Total weapons:  ${weapons.length}`);
  console.log(`Total armors:   ${armorEntries.length + shieldEntries.length}`);
  console.log(`Total goods:    ${goods.length}`);
  console.log(`Total items:    ${weapons.length + armorEntries.length + shieldEntries.length + goods.length}`);
  console.log(`\nArchivos generados en: ${OUTPUT_DIR}/`);
  console.log("\n=== Migracion completada ===");
}

main().catch(console.error);
