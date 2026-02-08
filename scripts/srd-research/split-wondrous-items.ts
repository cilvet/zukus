/**
 * Split Magic Items into Sub-Types
 *
 * Reads d35e-raw/magic-items.json and classifies each item into:
 * - ring, rod, staff, specificWeapon, specificArmor, specificShield,
 *   artifact, cursedItem, wondrousItem
 *
 * Outputs separate JSON files to scripts/srd-research/reference-data/
 *
 * Usage: bun run scripts/srd-research/split-wondrous-items.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = join(import.meta.dir, "../..");
const RAW_PATH = join(ROOT, "packages/core/data/d35e-raw/magic-items.json");
const OUT_DIR = join(import.meta.dir, "reference-data");

mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RawItem {
  id: string;
  name: string;
  img?: string;
  type?: string;
  data?: Record<string, unknown>;
}

type SubType =
  | "ring"
  | "rod"
  | "staff"
  | "specificWeapon"
  | "specificArmor"
  | "specificShield"
  | "artifact"
  | "cursedItem"
  | "wondrousItem";

// ---------------------------------------------------------------------------
// Classification helpers
// ---------------------------------------------------------------------------

function getDescription(item: RawItem): string {
  const desc = item.data?.description;
  if (typeof desc === "string") return desc;
  if (desc && typeof desc === "object" && "value" in desc) {
    return String((desc as { value: string }).value);
  }
  return "";
}

/** Known specific magic weapons from the SRD and d35e data */
const SPECIFIC_WEAPON_NAMES = new Set([
  "Adamantine Battleaxe",
  "Adamantine Dagger",
  "Arrow of Death",
  "Assassin's Dagger",
  "Axe of the Dwarvish Lords",
  "Backstabber",
  "Chaosbringer",
  "Dagger of Venom",
  "Dwarven Thrower",
  "Elven Greatbow",
  "Everwhirling Chain",
  "Finaldeath",
  "Flame Tongue",
  "Frost Brand",
  "Gripsoul",
  "Hammer of Thunderbolts",
  "Holy Avenger",
  "Holy Devastator",
  "Javelin of Lightning",
  "Life-Drinker",
  "Luck Blade",
  "Mace of Blood",
  "Mace of Ruin",
  "Mace of Smiting",
  "Mace of Terror",
  "Masterwork Cold Iron Longsword",
  "Mattock of the Titans",
  "Maul of the Titans",
  "Nine Lives Stealer",
  "Oathbow",
  "Quarterstaff of Alacrity",
  "Rapier of Puncturing",
  "Screaming Bolt",
  "Shatterspike",
  "Shifter's Sorrow",
  "Silver Dagger, Masterwork",
  "Slaying Arrow, Greater",
  "Sleep Arrow",
  "Souldrinker",
  "Spear, Cursed Backbiter",
  "Stormbrand",
  "Sun Blade",
  "Sword of Life Stealing",
  "Sword of Subtlety",
  "Sword of the Planes",
  "Sword, Berserking",
  "Sylvan Scimitar",
  "The Saint's Mace",
  "Trident of Fish Command",
  "Trident of Warning",
  "Unholy Despoiler",
]);

/** Items that are wondrous despite having no equipmentType (containers, etc.) */
const WONDROUS_OVERRIDES = new Set([
  "Bag of Holding (Type I)",
  "Bag of Holding (Type II)",
  "Bag of Holding (Type III)",
  "Bag of Holding (Type IV)",
  "Efficient Quiver",
]);

/** Known artifact names from the SRD */
const ARTIFACT_NAMES = new Set([
  // Minor artifacts
  "Book of Infinite Spells",
  "Deck of Many Things",
  "Sphere of Annihilation",
  "Talisman of Pure Good",
  "Talisman of the Sphere",
  "Talisman of Ultimate Evil",
  "Talisman of Reluctant Wishes",
  // Major artifacts
  "The Moaning Diamond",
  "The Shadowstaff",
  "Codex of the Infinite Planes",
  "Cup and Talisman of Al'Akbar",
  "Jacinth of Inestimable Beauty",
  "The Orbs of Dragonkind",
  // Psionic artifacts
  "Annulus",
  "Crystal Hypnosis Ball",
  "Psicrown of the Crystal Mind",
  // Others detected by description
  "Staff of the Magi",
  "Axe of the Dwarvish Lords",
]);

/** Known cursed items from the SRD */
const CURSED_ITEM_KEYWORDS = [
  "cursed",
  "curse",
  "-2 sword",
  "backbiter",
  "berserking",
  "arrow attraction",
  "poisonousness",
  "opposite alignment",
];

/** Items explicitly known to be cursed */
const CURSED_ITEM_NAMES = new Set([
  "Armor of Arrow Attraction",
  "Sword, Berserking",
  "Spear, Cursed Backbiter",
  "Cloak of Poisonousness",
  "Potion of Poison",
  "Ring of Clumsiness",
  "Scarab of Death",
  "Necklace of Strangulation",
  "Amulet of Inescapable Location",
  "Stone of Weight (Loadstone)",
  "Broom of Animated Attack",
  "Robe of Powerlessness",
  "Robe of Vermin",
  "Periapt of Foul Rotting",
  "Gauntlets of Fumbling",
  "Medallion of Thought Projection",
  "Flask of Curses",
  "Dust of Sneezing and Choking",
  "Helm of Opposite Alignment",
  "Incense of Obsession",
  "Bag of Devouring",
  "Boots of Dancing",
  "Crystal Hypnosis Ball",
  "Bracers of Defenselessness",
  "Net of Snaring",
  "Robe of Powerlessness",
  "Vacuous Grimoire",
]);

function classify(item: RawItem): SubType {
  const name = item.name ?? "";
  const data = item.data ?? {};
  const equipmentType = data.equipmentType as string | undefined;
  const slot = data.slot as string | undefined;
  const desc = getDescription(item);

  // 1. Artifacts (check first, since artifacts can also be weapons/staves)
  if (ARTIFACT_NAMES.has(name)) return "artifact";
  if (/\bartifact\b/i.test(desc) && !/against\s+artifact/i.test(desc)) {
    return "artifact";
  }

  // 2. Specific magic armor (has equipmentType == armor)
  if (equipmentType === "armor") return "specificArmor";

  // 3. Specific magic shields (has equipmentType == shield)
  if (equipmentType === "shield") return "specificShield";

  // 4. Rings (slot == ring OR name starts with "Ring")
  if (slot === "ring" || /^Ring\b/i.test(name)) return "ring";

  // 5. Rods (name starts with "Rod")
  if (/^Rod\b/i.test(name)) return "rod";

  // 6. Staves (name starts with "Staff")
  if (/^Staff\b/i.test(name)) return "staff";

  // 7. Specific magic weapons (from curated list, or missing equipmentType + weapon-like)
  if (SPECIFIC_WEAPON_NAMES.has(name)) return "specificWeapon";

  // 8. Wondrous overrides (containers and such that have no equipmentType)
  if (WONDROUS_OVERRIDES.has(name)) return "wondrousItem";

  // 9. Check for items without equipmentType that might be weapons we missed
  if (!equipmentType && !slot) {
    // If the name contains a weapon keyword, classify as specific weapon
    const weaponRe =
      /\b(sword|axe|bow|mace|hammer|dagger|spear|lance|flail|trident|crossbow|sling|javelin|rapier|scimitar|glaive|halberd|blade|arrow|bolt|sickle|whip|club|warhammer|pick|net|longbow|shortbow|shuriken)\b/i;
    if (weaponRe.test(name)) return "specificWeapon";
  }

  // 10. Everything else is a wondrous item
  return "wondrousItem";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const raw: RawItem[] = JSON.parse(readFileSync(RAW_PATH, "utf-8"));

console.log(`Loaded ${raw.length} items from magic-items.json\n`);

// Classify all items
const buckets: Record<SubType, RawItem[]> = {
  ring: [],
  rod: [],
  staff: [],
  specificWeapon: [],
  specificArmor: [],
  specificShield: [],
  artifact: [],
  cursedItem: [],
  wondrousItem: [],
};

// Also track cursed items separately (they may overlap with other categories)
const cursedItems: string[] = [];

for (const item of raw) {
  const subType = classify(item);
  buckets[subType].push(item);

  // Check if also cursed
  const desc = getDescription(item);
  const isCursed =
    CURSED_ITEM_NAMES.has(item.name) ||
    CURSED_ITEM_KEYWORDS.some((kw) => desc.toLowerCase().includes(kw));
  if (isCursed) {
    cursedItems.push(`${item.name} [classified as: ${subType}]`);
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

console.log("=== Classification Results ===\n");

const totalClassified = Object.values(buckets).reduce(
  (sum, arr) => sum + arr.length,
  0,
);

for (const [subType, items] of Object.entries(buckets)) {
  console.log(`${subType}: ${items.length} items`);

  // Write JSON file
  const outputItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    img: item.img,
    equipmentType: (item.data as Record<string, unknown>)?.equipmentType,
    equipmentSubtype: (item.data as Record<string, unknown>)?.equipmentSubtype,
    slot: (item.data as Record<string, unknown>)?.slot,
    price: (item.data as Record<string, unknown>)?.price,
    weight: (item.data as Record<string, unknown>)?.weight,
    description: getDescription(item),
  }));

  const filePath = join(OUT_DIR, `${subType}.json`);
  writeFileSync(filePath, JSON.stringify(outputItems, null, 2));
}

console.log(`\nTotal classified: ${totalClassified} / ${raw.length}`);

if (totalClassified !== raw.length) {
  console.log(
    `WARNING: ${raw.length - totalClassified} items were not classified!`,
  );
}

// Print detailed listing for smaller categories
console.log("\n=== Artifacts ===");
for (const item of buckets.artifact) {
  console.log(`  - ${item.name}`);
}

console.log("\n=== Specific Weapons ===");
for (const item of buckets.specificWeapon.sort((a, b) =>
  a.name.localeCompare(b.name),
)) {
  console.log(`  - ${item.name}`);
}

console.log("\n=== Specific Armor ===");
for (const item of buckets.specificArmor.sort((a, b) =>
  a.name.localeCompare(b.name),
)) {
  console.log(`  - ${item.name}`);
}

console.log("\n=== Specific Shields ===");
for (const item of buckets.specificShield.sort((a, b) =>
  a.name.localeCompare(b.name),
)) {
  console.log(`  - ${item.name}`);
}

console.log("\n=== Cursed Items (cross-category) ===");
for (const entry of cursedItems.sort()) {
  console.log(`  - ${entry}`);
}

// Print wondrous items by slot
console.log("\n=== Wondrous Items by Slot ===");
const bySlot: Record<string, string[]> = {};
for (const item of buckets.wondrousItem) {
  const slot = ((item.data as Record<string, unknown>)?.slot as string) || "unknown";
  if (!bySlot[slot]) bySlot[slot] = [];
  bySlot[slot].push(item.name);
}
for (const [slot, names] of Object.entries(bySlot).sort()) {
  console.log(`  ${slot}: ${names.length} items`);
}

console.log("\n=== Output Files ===");
for (const subType of Object.keys(buckets)) {
  console.log(
    `  reference-data/${subType}.json (${buckets[subType as SubType].length} items)`,
  );
}
