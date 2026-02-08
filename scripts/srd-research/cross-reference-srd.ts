/**
 * SRD Cross-Reference Script
 *
 * Cross-references ALL D&D 3.5 SRD entity types against d35e-raw data.
 * For each type: reports matched, missing from our data, and extra (non-SRD) in our data.
 *
 * Usage: bun run scripts/srd-research/cross-reference-srd.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// --- Types ---

interface D35ERawEntity {
  id: string;
  name: string;
  type?: string;
  data?: Record<string, unknown>;
}

interface CrossRefResult {
  entityType: string;
  srdCount: number;
  d35eCount: number;
  matchedCount: number;
  missingFromD35e: string[];
  extraInD35e: string[];
  nameVariations: { srd: string; d35e: string }[];
}

interface FullReport {
  metadata: {
    generatedDate: string;
    description: string;
  };
  summary: {
    totalSrdEntities: number;
    totalD35eEntities: number;
    totalMatched: number;
    totalMissing: number;
    totalExtra: number;
    coveragePercent: string;
  };
  results: CrossRefResult[];
}

// --- Helpers ---

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

/**
 * Normalize a name for fuzzy matching:
 * - lowercase
 * - trim whitespace
 * - normalize unicode quotes/dashes
 * - remove trailing parenthetical qualifiers like "(NPC)" or "(No Weapon Selected)"
 * - collapse multiple spaces
 */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"')
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, "-")
    .replace(/\s+/g, " ");
}

/**
 * Build a normalized lookup set from an array of names.
 * Returns Map<normalizedName, originalName>
 */
function buildLookup(names: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const name of names) {
    map.set(normalize(name), name);
  }
  return map;
}

/**
 * Cross-reference SRD list against d35e-raw data.
 * Uses exact normalized match first, then tries alternate forms.
 */
function crossReference(
  entityType: string,
  srdNames: string[],
  d35eNames: string[],
  alternateMatchFn?: (srdNorm: string, d35eMap: Map<string, string>) => string | undefined
): CrossRefResult {
  const srdLookup = buildLookup(srdNames);
  const d35eLookup = buildLookup(d35eNames);

  const matched: { srd: string; d35e: string }[] = [];
  const missingFromD35e: string[] = [];
  const nameVariations: { srd: string; d35e: string }[] = [];

  // Track which d35e entries got matched
  const matchedD35eNorms = new Set<string>();

  for (const [srdNorm, srdOriginal] of srdLookup) {
    if (d35eLookup.has(srdNorm)) {
      const d35eOriginal = d35eLookup.get(srdNorm)!;
      matched.push({ srd: srdOriginal, d35e: d35eOriginal });
      matchedD35eNorms.add(srdNorm);
      if (srdOriginal !== d35eOriginal) {
        nameVariations.push({ srd: srdOriginal, d35e: d35eOriginal });
      }
    } else if (alternateMatchFn) {
      const altMatch = alternateMatchFn(srdNorm, d35eLookup);
      if (altMatch) {
        const altNorm = normalize(altMatch);
        matched.push({ srd: srdOriginal, d35e: altMatch });
        matchedD35eNorms.add(altNorm);
        nameVariations.push({ srd: srdOriginal, d35e: altMatch });
      } else {
        missingFromD35e.push(srdOriginal);
      }
    } else {
      missingFromD35e.push(srdOriginal);
    }
  }

  // Extra in d35e = not matched to any SRD entry
  const extraInD35e: string[] = [];
  for (const [d35eNorm, d35eOriginal] of d35eLookup) {
    if (!matchedD35eNorms.has(d35eNorm)) {
      extraInD35e.push(d35eOriginal);
    }
  }

  return {
    entityType,
    srdCount: srdNames.length,
    d35eCount: d35eNames.length,
    matchedCount: matched.length,
    missingFromD35e: missingFromD35e.sort(),
    extraInD35e: extraInD35e.sort(),
    nameVariations: nameVariations.sort((a, b) => a.srd.localeCompare(b.srd)),
  };
}

// --- Alternate matchers for fuzzy matching ---

/**
 * For classes: d35e uses "Warrior (NPC)" format, SRD uses "Warrior"
 */
function classAlternateMatch(srdNorm: string, d35eMap: Map<string, string>): string | undefined {
  // Try with (NPC) suffix
  const withNpc = srdNorm + " (npc)";
  if (d35eMap.has(withNpc)) return d35eMap.get(withNpc)!;

  // Try Psion variants: SRD "Psion" -> d35e "Psion (Egoist)" etc.
  if (srdNorm === "psion") {
    for (const [norm, orig] of d35eMap) {
      if (norm.startsWith("psion (")) return orig;
    }
  }
  return undefined;
}

/**
 * For magic items: d35e often has +N variants and comma-separated sub-types.
 * SRD "Amulet of Health" -> d35e "Amulet of Health +2", "Amulet of Health +4", etc.
 * SRD "Feather Token (Swan Boat)" -> d35e "Feather Token, Swan Boat"
 * SRD "Boat (Folding)" -> d35e "Boat, Folding"
 */
function magicItemAlternateMatch(srdNorm: string, d35eMap: Map<string, string>): string | undefined {
  for (const [norm, orig] of d35eMap) {
    // Match base name followed by optional +N or (Type) variants
    if (norm === srdNorm) return orig;
    if (norm.startsWith(srdNorm + " +")) return orig;
    if (norm.startsWith(srdNorm + " (")) return orig;
    // Handle "Ring of Protection" matching "Ring of Protection +1"
    if (norm.replace(/ \+\d+$/, "") === srdNorm) return orig;
  }

  // Convert SRD parenthetical to comma format: "Feather Token (Swan Boat)" -> "feather token, swan boat"
  const commaForm = srdNorm.replace(/\s*\(([^)]+)\)$/, ", $1");
  if (commaForm !== srdNorm && d35eMap.has(commaForm)) return d35eMap.get(commaForm)!;

  // Try matching base name without parenthetical (e.g., "Figurines of Wondrous Power")
  const baseName = srdNorm.replace(/\s*\(.*?\)\s*$/, "").trim();
  if (baseName !== srdNorm) {
    if (d35eMap.has(baseName)) return d35eMap.get(baseName)!;
    // Also try plural: "Figurine" -> "Figurines"
    if (d35eMap.has(baseName + "s")) return d35eMap.get(baseName + "s")!;
    const plural = baseName + "s";
    for (const [norm, orig] of d35eMap) {
      if (norm === plural || norm.startsWith(baseName + ",") || norm.startsWith(baseName + " ")) return orig;
    }
  }

  // Try with +N variants for comma-form too
  for (const [norm, orig] of d35eMap) {
    if (commaForm !== srdNorm && norm.startsWith(commaForm + " +")) return orig;
    // Handle "Ring of Wizardry" -> "Ring of Wizardry I" etc.
    if (norm.startsWith(srdNorm + " i") || norm.startsWith(srdNorm + " ii")) return orig;
  }

  return undefined;
}

/**
 * For monsters: handle parenthetical variants, size/age prefixes, comma forms.
 * SRD "Barbed Devil" -> d35e "Barbed Devil" (exact)
 * SRD "Air Elemental" -> d35e "Air Elemental, Greater" (comma + size)
 * SRD "Black Dragon" -> d35e "Black Dragon, Wyrmling" (comma + age)
 * SRD "Bear (Black)" -> d35e "Bear, Black" (parenthetical -> comma)
 * SRD "Angel" -> d35e "Angel, Planetar" (generic category)
 * SRD "Arrowhawk" -> d35e "Adult Arrowhawk" (age prefix)
 */
function monsterAlternateMatch(srdNorm: string, d35eMap: Map<string, string>): string | undefined {
  // Try SRD parenthetical -> comma: "Bear (Black)" -> "bear, black"
  const commaForm = srdNorm.replace(/\s*\(([^)]+)\)$/, ", $1");
  if (commaForm !== srdNorm && d35eMap.has(commaForm)) return d35eMap.get(commaForm)!;

  // SRD base without parenthetical
  const srdBase = srdNorm.replace(/\s*\(.*?\)\s*$/, "").trim();

  for (const [norm, orig] of d35eMap) {
    // d35e name with extra parenthetical stripped
    const d35eBase = norm.replace(/\s*\(.*?\)\s*$/, "").trim();
    if (d35eBase === srdNorm) return orig;
    if (srdBase !== srdNorm && (srdBase === norm || srdBase === d35eBase)) return orig;

    // d35e comma-variant: "Black Dragon, Mature adult" starts with "black dragon"
    if (norm.startsWith(srdNorm + ",")) return orig;
    if (srdBase !== srdNorm && norm.startsWith(srdBase + ",")) return orig;

    // d35e prefix-variant: "Adult Arrowhawk" ends with "arrowhawk"
    if (norm.endsWith(" " + srdNorm)) return orig;

    // d35e "Angel, Planetar" -> SRD "Angel" (generic category match)
    const d35eCommaBase = norm.split(",")[0].trim();
    if (d35eCommaBase === srdNorm) return orig;

    // SRD "Formian Myrmarch" -> d35e "Myrmarch" or vice versa
    if (norm.includes(srdNorm) || srdNorm.includes(norm)) {
      if (Math.abs(norm.length - srdNorm.length) < 15) return orig;
    }
  }
  return undefined;
}

/**
 * For feats: handle "(No Weapon Selected)" variants and case differences
 */
function featAlternateMatch(srdNorm: string, d35eMap: Map<string, string>): string | undefined {
  // Try with "(No Weapon Selected)" suffix
  const withNoWeapon = srdNorm + " (no weapon selected)";
  if (d35eMap.has(withNoWeapon)) return d35eMap.get(withNoWeapon)!;

  // Try matching base without parenthetical
  for (const [norm, orig] of d35eMap) {
    const d35eBase = norm.replace(/\s*\(.*?\)\s*$/, "").trim();
    if (d35eBase === srdNorm) return orig;
  }
  return undefined;
}

/**
 * For psionic powers: d35e stores them with different naming conventions
 * SRD "Banishment, Psionic" -> d35e might be "Psionic Banishment" or "Banishment"
 */
function psionicAlternateMatch(srdNorm: string, d35eMap: Map<string, string>): string | undefined {
  // Handle "Spell, Psionic" -> "Psionic Spell" conversion
  const psionicSuffix = srdNorm.replace(/, psionic$/, "");
  if (psionicSuffix !== srdNorm) {
    const altName = "psionic " + psionicSuffix;
    if (d35eMap.has(altName)) return d35eMap.get(altName)!;
    // Also try just the base name without "Psionic"
    if (d35eMap.has(psionicSuffix)) return d35eMap.get(psionicSuffix)!;
  }

  // Handle ", Greater/Mass" variants -> "Greater/Mass X"
  const commaMatch = srdNorm.match(/^(.+),\s*(greater|mass|psionic greater)$/);
  if (commaMatch) {
    const [, base, suffix] = commaMatch;
    const altName = suffix + " " + base;
    if (d35eMap.has(altName)) return d35eMap.get(altName)!;
  }

  // Try without comma-suffix entirely
  const baseOnly = srdNorm.replace(/,\s*.*$/, "").trim();
  if (baseOnly !== srdNorm && d35eMap.has(baseOnly)) {
    return d35eMap.get(baseOnly)!;
  }

  return undefined;
}

// --- Main ---

const scriptDir = import.meta.dir;
const rootDir = join(scriptDir, "../..");
const refDir = join(scriptDir, "reference-data");
const d35eDir = join(rootDir, "packages/core/data/d35e-raw");

console.log("=== SRD Cross-Reference Analysis ===\n");

const results: CrossRefResult[] = [];

// --- 1. Spells ---
console.log("Processing: Spells...");
const srdSpellsRef = loadJson<{ spells: { name: string }[] }>(join(refDir, "srd-spells.json"));
const srdSpellNames = srdSpellsRef.spells.map((s) => s.name);
const d35eSpells = loadJson<D35ERawEntity[]>(join(d35eDir, "spells.json"));
const d35eSpellNames = d35eSpells.map((s) => s.name);
results.push(crossReference("spells", srdSpellNames, d35eSpellNames));

// --- 2. Feats ---
console.log("Processing: Feats...");
const srdFeatsRef = loadJson<{
  feats?: { name: string; category: string }[];
  standard?: string[];
  epic?: string[];
  psionic?: string[];
}>(join(refDir, "srd-feats.json"));
const srdFeatNames = srdFeatsRef.feats
  ? srdFeatsRef.feats.map((f) => f.name)
  : [...(srdFeatsRef.standard ?? []), ...(srdFeatsRef.epic ?? []), ...(srdFeatsRef.psionic ?? [])];
const d35eFeats = loadJson<D35ERawEntity[]>(join(d35eDir, "feats.json"));
const d35eFeatNames = d35eFeats.map((f) => f.name);
results.push(crossReference("feats", srdFeatNames, d35eFeatNames, featAlternateMatch));

// --- 3. Monsters/Bestiary ---
console.log("Processing: Monsters...");
const srdMonstersRef = loadJson<{ monsters: string[] }>(join(refDir, "srd-monsters.json"));
const d35eMonsters = loadJson<D35ERawEntity[]>(join(d35eDir, "bestiary.json"));
const d35eMonsterNames = d35eMonsters.map((m) => m.name);
results.push(
  crossReference("monsters", srdMonstersRef.monsters, d35eMonsterNames, monsterAlternateMatch)
);

// --- 4. Classes ---
console.log("Processing: Classes...");
const srdClassesRef = loadJson<{
  base: string[];
  prestige: string[];
  npc: string[];
  psionic: string[];
  psionicPrestige: string[];
}>(join(refDir, "srd-classes.json"));
const srdClassNames = [
  ...srdClassesRef.base,
  ...srdClassesRef.prestige,
  ...srdClassesRef.npc,
  ...srdClassesRef.psionic,
  ...srdClassesRef.psionicPrestige,
];
const d35eClasses = loadJson<D35ERawEntity[]>(join(d35eDir, "classes.json"));
const d35eClassNames = d35eClasses.map((c) => c.name);
results.push(crossReference("classes", srdClassNames, d35eClassNames, classAlternateMatch));

// --- 5. Conditions ---
console.log("Processing: Conditions...");
const srdConditionsRef = loadJson<{ conditions: string[] }>(join(refDir, "srd-conditions.json"));
const d35eConditions = loadJson<{ id: string; name: string }[]>(join(d35eDir, "conditions.json"));
const d35eConditionNames = d35eConditions.map((c) => c.name);
results.push(crossReference("conditions", srdConditionsRef.conditions, d35eConditionNames));

// --- 6. Psionic Powers ---
console.log("Processing: Psionic Powers...");
const srdPsionicRef = loadJson<{ powers: string[] }>(join(refDir, "srd-psionic-powers.json"));
const d35ePowers = loadJson<D35ERawEntity[]>(join(d35eDir, "powers.json"));
const d35ePowerNames = d35ePowers.map((p) => p.name);
results.push(
  crossReference("psionic_powers", srdPsionicRef.powers, d35ePowerNames, psionicAlternateMatch)
);

// --- 7. Magic Items (combined) ---
console.log("Processing: Magic Items...");
const srdMagicRef = loadJson<{
  specificArmors: string[];
  specificShields: string[];
  specificWeapons: string[];
  rings: string[];
  rods: string[];
  staffs: string[];
  wondrousItems: string[];
  cursedItems: string[];
  artifacts: { minor: string[]; major: string[] };
}>(join(refDir, "srd-magic-items.json"));

const allSrdMagicItems = [
  ...srdMagicRef.specificArmors,
  ...srdMagicRef.specificShields,
  ...srdMagicRef.specificWeapons,
  ...srdMagicRef.rings,
  ...srdMagicRef.rods,
  ...srdMagicRef.staffs,
  ...srdMagicRef.wondrousItems,
  ...srdMagicRef.cursedItems,
  ...srdMagicRef.artifacts.minor,
  ...srdMagicRef.artifacts.major,
];
const d35eMagicItems = loadJson<D35ERawEntity[]>(join(d35eDir, "magic-items.json"));
const d35eMagicItemNames = d35eMagicItems.map((i) => i.name);
results.push(
  crossReference("magic_items", allSrdMagicItems, d35eMagicItemNames, magicItemAlternateMatch)
);

// --- 8. Also cross-ref magic item sub-files from reference-data ---
// Check individual split files if they exist
for (const subType of [
  "ring",
  "rod",
  "staff",
  "specificWeapon",
  "specificArmor",
  "specificShield",
  "wondrousItem",
  "cursedItem",
  "artifact",
]) {
  try {
    const subFile = loadJson<D35ERawEntity[]>(join(refDir, `${subType}.json`));
    if (Array.isArray(subFile) && subFile.length > 0 && subFile[0].name) {
      const subNames = subFile.map((i) => i.name);
      const srdSubNames =
        subType === "ring"
          ? srdMagicRef.rings
          : subType === "rod"
            ? srdMagicRef.rods
            : subType === "staff"
              ? srdMagicRef.staffs
              : subType === "specificWeapon"
                ? srdMagicRef.specificWeapons
                : subType === "specificArmor"
                  ? srdMagicRef.specificArmors
                  : subType === "specificShield"
                    ? srdMagicRef.specificShields
                    : subType === "wondrousItem"
                      ? srdMagicRef.wondrousItems
                      : subType === "cursedItem"
                        ? srdMagicRef.cursedItems
                        : [...srdMagicRef.artifacts.minor, ...srdMagicRef.artifacts.major];

      if (srdSubNames.length > 0) {
        results.push(
          crossReference(`magic_items_${subType}`, srdSubNames, subNames, magicItemAlternateMatch)
        );
      }
    }
  } catch {
    // Sub-file doesn't exist, skip
  }
}

// --- Build Summary ---

let totalSrd = 0;
let totalD35e = 0;
let totalMatched = 0;
let totalMissing = 0;
let totalExtra = 0;

// Only count primary types (not sub-types) for summary
const primaryTypes = [
  "spells",
  "feats",
  "monsters",
  "classes",
  "conditions",
  "psionic_powers",
  "magic_items",
];
for (const r of results) {
  if (primaryTypes.includes(r.entityType)) {
    totalSrd += r.srdCount;
    totalD35e += r.d35eCount;
    totalMatched += r.matchedCount;
    totalMissing += r.missingFromD35e.length;
    totalExtra += r.extraInD35e.length;
  }
}

const report: FullReport = {
  metadata: {
    generatedDate: new Date().toISOString().split("T")[0],
    description:
      "Cross-reference of D&D 3.5 SRD content lists vs d35e-raw Foundry VTT data",
  },
  summary: {
    totalSrdEntities: totalSrd,
    totalD35eEntities: totalD35e,
    totalMatched: totalMatched,
    totalMissing: totalMissing,
    totalExtra: totalExtra,
    coveragePercent: ((totalMatched / totalSrd) * 100).toFixed(1),
  },
  results,
};

// --- Output ---

const outputPath = join(refDir, "srd-cross-reference.json");
writeFileSync(outputPath, JSON.stringify(report, null, 2));

// Console report
console.log("\n=== SUMMARY ===\n");
console.log(`Total SRD entities:      ${totalSrd}`);
console.log(`Total d35e-raw entities: ${totalD35e}`);
console.log(`Matched:                 ${totalMatched}`);
console.log(`Missing from d35e:       ${totalMissing}`);
console.log(`Extra in d35e:           ${totalExtra}`);
console.log(`Overall SRD coverage:    ${report.summary.coveragePercent}%`);

console.log("\n=== BY TYPE ===\n");
for (const r of results) {
  const coverage = r.srdCount > 0 ? ((r.matchedCount / r.srdCount) * 100).toFixed(1) : "N/A";
  const prefix = primaryTypes.includes(r.entityType) ? "" : "  ";
  console.log(
    `${prefix}${r.entityType}: ${r.matchedCount}/${r.srdCount} SRD matched (${coverage}%), ` +
      `${r.missingFromD35e.length} missing, ${r.extraInD35e.length} extra in d35e`
  );

  if (r.missingFromD35e.length > 0 && r.missingFromD35e.length <= 30) {
    console.log(`${prefix}  Missing: ${r.missingFromD35e.join(", ")}`);
  } else if (r.missingFromD35e.length > 30) {
    console.log(
      `${prefix}  Missing (first 30): ${r.missingFromD35e.slice(0, 30).join(", ")}...`
    );
  }

  if (r.nameVariations.length > 0) {
    console.log(`${prefix}  Name variations: ${r.nameVariations.length}`);
  }
}

console.log(`\nFull report saved to: ${outputPath}`);
