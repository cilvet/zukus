/**
 * SRD Magic Item Verification Script
 *
 * Cross-references our D35E raw magic item data against a known SRD magic item
 * reference list to verify completeness and identify gaps.
 *
 * Magic items have many variants in D35E (e.g. "Ring of Protection +1" through +5),
 * while the SRD lists base names only. This script handles that normalization.
 *
 * Usage: bun run scripts/srd-research/verify-srd-magic-items.ts
 */

import { readFileSync } from "fs";
import { join } from "path";

// --- Types ---

interface D35EMagicItem {
  id: string;
  name: string;
  type: string;
  data: {
    equipmentType?: string;
    equipmentSubtype?: string;
    slot?: string;
    description?: { value?: string };
  };
}

interface SrdReference {
  metadata: Record<string, unknown>;
  specificArmors: string[];
  specificShields: string[];
  specificWeapons: string[];
  rings: string[];
  rods: string[];
  staffs: string[];
  wondrousItems: string[];
  cursedItems: string[];
  artifacts: { minor: string[]; major: string[] };
}

interface MatchResult {
  ourName: string;
  srdName: string;
  subType: string;
  variant?: boolean;
}

// --- Helpers ---

function normalize(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"');
}

/**
 * Strip D35E variant suffixes to get the base item name.
 * Examples:
 *   "Ring of Protection +4" -> "ring of protection"
 *   "Cloak of Charisma +2" -> "cloak of charisma"
 *   "Pearl of Power (4th)" -> "pearl of power"
 *   "Rod of Metamagic, Empower, Greater" -> "rod of metamagic (empower)"
 *   "Ring of Wizardry III" -> "ring of wizardry"
 *   "Bag of Tricks, Rust" -> "bag of tricks"
 *   "Ring of Energy Resistance, Minor" -> "ring of energy resistance"
 *   "Ring of Jumping, Improved" -> "ring of jumping (improved)"
 *   "Manual of Bodily Health +3" -> "manual of bodily health"
 */
function normalizeToBase(name: string): string {
  let n = normalize(name);

  // Strip "+N" suffixes
  n = n.replace(/\s*\+\d+$/, "");

  // Strip "(Nth)" level indicators like "(4th)", "(1st)", "(2nd)"
  n = n.replace(/\s*\(\d+(?:st|nd|rd|th)\)$/, "");

  // Strip Roman numeral suffixes (I through IX)
  n = n.replace(/\s+(?:i{1,3}|iv|vi{0,3}|ix)$/i, "");

  // Handle comma-separated qualifiers
  // "Rod of Metamagic, Empower, Greater" -> try "rod of metamagic (empower)"
  // "Ring of Energy Resistance, Minor" -> "ring of energy resistance"
  // "Bag of Tricks, Rust" -> "bag of tricks"
  // "Ring of Jumping, Improved" -> "ring of jumping (improved)"
  const commaMatch = n.match(/^(.+?),\s*(.+?)(?:,\s*(.+))?$/);
  if (commaMatch) {
    const [, base, qual1, qual2] = commaMatch;
    const qualLower = qual1.toLowerCase();
    // If qualifier is a size (minor/major/greater/lesser/normal), strip it
    if (
      ["minor", "major", "greater", "lesser", "normal"].includes(qualLower)
    ) {
      n = base;
    } else if (qual2) {
      // Three parts: base, type, size -> "base (type)"
      n = `${base} (${qual1})`;
    } else if (qualLower === "improved") {
      n = `${base} (${qual1})`;
    } else {
      // Two parts: base, variant -> just base
      n = base;
    }
  }

  return n.trim();
}

function loadJson<T>(path: string): T {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as T;
}

function classifyItem(item: D35EMagicItem): string {
  const desc = (item.data.description?.value ?? "").toLowerCase();
  const name = item.name.toLowerCase();

  if (name.includes("epic") || desc.slice(0, 100).includes("epic"))
    return "epic";
  if (
    desc.includes("psionic") ||
    desc.includes("power point") ||
    name.includes("psicrystal") ||
    name.includes("psionatrix") ||
    name.includes("cognizance")
  )
    return "psionic";
  return "standard";
}

// --- Main ---

const scriptDir = import.meta.dir;
const rootDir = join(scriptDir, "../..");

const d35eItemsPath = join(
  rootDir,
  "packages/core/data/d35e-raw/magic-items.json"
);
const srdReferencePath = join(scriptDir, "reference-data/srd-magic-items.json");

console.log("=== SRD Magic Item Verification ===\n");

// Load data
const d35eItems = loadJson<D35EMagicItem[]>(d35eItemsPath);
const srdRef = loadJson<SrdReference>(srdReferencePath);

// Build flat SRD reference with sub-type tags
const srdEntries: { name: string; subType: string }[] = [];
for (const name of srdRef.specificArmors)
  srdEntries.push({ name, subType: "specificArmor" });
for (const name of srdRef.specificShields)
  srdEntries.push({ name, subType: "specificShield" });
for (const name of srdRef.specificWeapons)
  srdEntries.push({ name, subType: "specificWeapon" });
for (const name of srdRef.rings) srdEntries.push({ name, subType: "ring" });
for (const name of srdRef.rods) srdEntries.push({ name, subType: "rod" });
for (const name of srdRef.staffs) srdEntries.push({ name, subType: "staff" });
for (const name of srdRef.wondrousItems)
  srdEntries.push({ name, subType: "wondrousItem" });
for (const name of srdRef.cursedItems)
  srdEntries.push({ name, subType: "cursedItem" });
for (const name of srdRef.artifacts.minor)
  srdEntries.push({ name, subType: "artifact (minor)" });
for (const name of srdRef.artifacts.major)
  srdEntries.push({ name, subType: "artifact (major)" });

// Build SRD lookup by normalized name
const srdMap = new Map<string, { name: string; subType: string }>();
for (const entry of srdEntries) {
  srdMap.set(normalize(entry.name), entry);
}

// Build our item lookup
const ourItemMap = new Map<string, D35EMagicItem>();
for (const item of d35eItems) {
  ourItemMap.set(normalize(item.name), item);
}

// Also build base-name lookup for variant matching
const ourBaseMap = new Map<string, D35EMagicItem[]>();
for (const item of d35eItems) {
  const base = normalizeToBase(item.name);
  if (!ourBaseMap.has(base)) ourBaseMap.set(base, []);
  ourBaseMap.get(base)!.push(item);
}

// --- Comparison ---

const matched: MatchResult[] = [];
const missingSrd: { name: string; subType: string }[] = [];

for (const [normalizedSrd, srdEntry] of srdMap) {
  // Try exact match first
  if (ourItemMap.has(normalizedSrd)) {
    matched.push({
      ourName: ourItemMap.get(normalizedSrd)!.name,
      srdName: srdEntry.name,
      subType: srdEntry.subType,
    });
  } else {
    // Try base-name matching (strip variants from SRD name too)
    const srdBase = normalizeToBase(srdEntry.name);
    if (ourBaseMap.has(srdBase)) {
      const variants = ourBaseMap.get(srdBase)!;
      matched.push({
        ourName: variants[0].name + (variants.length > 1 ? ` (${variants.length} variants)` : ""),
        srdName: srdEntry.name,
        subType: srdEntry.subType,
        variant: true,
      });
    } else {
      // Try stripping parenthetical from SRD name
      const srdStripped = normalizedSrd.replace(/\s*\(.*?\)\s*/g, " ").trim();
      if (ourBaseMap.has(srdStripped)) {
        const variants = ourBaseMap.get(srdStripped)!;
        matched.push({
          ourName: variants[0].name,
          srdName: srdEntry.name,
          subType: srdEntry.subType,
          variant: true,
        });
      } else {
        // Try plural/singular variations
        const pluralSrd = normalizedSrd + "s";
        const singularSrd = normalizedSrd.replace(/s$/, "");
        const pluralBase = srdBase + "s";
        const singularBase = srdBase.replace(/s$/, "");

        const fuzzyKeys = [pluralSrd, singularSrd, pluralBase, singularBase];
        let fuzzyFound = false;
        for (const key of fuzzyKeys) {
          if (ourItemMap.has(key) || ourBaseMap.has(key)) {
            const item = ourItemMap.get(key) ?? ourBaseMap.get(key)?.[0];
            if (item) {
              matched.push({
                ourName: item.name,
                srdName: srdEntry.name,
                subType: srdEntry.subType,
                variant: true,
              });
              fuzzyFound = true;
              break;
            }
          }
        }
        if (!fuzzyFound) {
          missingSrd.push(srdEntry);
        }
      }
    }
  }
}

// Find our items not in SRD
const matchedSrdNorms = new Set(matched.map((m) => normalize(m.srdName)));
const matchedBases = new Set(
  matched.filter((m) => m.variant).map((m) => normalizeToBase(m.srdName))
);

const extraOurs: D35EMagicItem[] = [];
for (const item of d35eItems) {
  const norm = normalize(item.name);
  const base = normalizeToBase(item.name);
  if (!matchedSrdNorms.has(norm) && !matchedBases.has(base)) {
    // Check if this is a variant of a matched base
    let isVariant = false;
    for (const mb of matchedBases) {
      if (base.startsWith(mb) || mb.startsWith(base)) {
        isVariant = true;
        break;
      }
    }
    if (!isVariant) {
      extraOurs.push(item);
    }
  }
}

// --- Report ---

console.log("--- Data Summary ---");
console.log(`Our magic items (magic-items.json): ${d35eItems.length}`);
console.log(`SRD reference items:                ${srdEntries.length}`);

const srdByType = new Map<string, number>();
for (const e of srdEntries) {
  srdByType.set(e.subType, (srdByType.get(e.subType) ?? 0) + 1);
}
for (const [t, c] of [...srdByType.entries()].sort()) {
  console.log(`  ${t}: ${c}`);
}
console.log();

console.log("--- Comparison Results ---");
console.log(`Matched (in SRD + we have):     ${matched.length}`);
console.log(
  `  Exact: ${matched.filter((m) => !m.variant).length}, Variant: ${matched.filter((m) => m.variant).length}`
);
console.log(`Missing (in SRD, we don't):     ${missingSrd.length}`);
console.log(`Extra (we have, not in SRD ref): ${extraOurs.length}`);
console.log();

if (missingSrd.length > 0) {
  console.log("--- SRD Magic Items We Are MISSING ---");
  const byType = new Map<string, string[]>();
  for (const entry of missingSrd) {
    if (!byType.has(entry.subType)) byType.set(entry.subType, []);
    byType.get(entry.subType)!.push(entry.name);
  }
  for (const [t, names] of [...byType.entries()].sort()) {
    console.log(`\n  [${t}] (${names.length}):`);
    for (const name of names.sort()) {
      console.log(`    - ${name}`);
    }
  }
  console.log();
}

if (extraOurs.length > 0) {
  console.log("--- Our Items NOT in SRD Reference ---");
  console.log(
    "(May be SRD items the reference missed, epic/psionic items, or variants)\n"
  );

  const byClass = new Map<string, string[]>();
  for (const item of extraOurs) {
    const cls = classifyItem(item);
    if (!byClass.has(cls)) byClass.set(cls, []);
    byClass.get(cls)!.push(item.name);
  }

  for (const [cls, names] of [...byClass.entries()].sort()) {
    console.log(`  [${cls}] (${names.length}):`);
    for (const n of names.sort()) console.log(`    - ${n}`);
    console.log();
  }
}

// --- Coverage ---
const coveragePercent = (
  (matched.length / srdEntries.length) *
  100
).toFixed(1);
console.log("--- Coverage ---");
console.log(
  `SRD coverage: ${matched.length}/${srdEntries.length} (${coveragePercent}%)`
);

const matchedByType = new Map<string, number>();
for (const m of matched) {
  matchedByType.set(m.subType, (matchedByType.get(m.subType) ?? 0) + 1);
}
for (const [t, count] of [...matchedByType.entries()].sort()) {
  const total = srdByType.get(t) ?? 0;
  console.log(`  ${t}: ${count}/${total}`);
}
