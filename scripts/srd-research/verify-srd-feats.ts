/**
 * SRD Feat Verification Script
 *
 * Cross-references our D35E raw feat data against a known SRD feat reference list
 * to verify completeness and identify gaps.
 *
 * Usage: bun run scripts/srd-research/verify-srd-feats.ts
 */

import { readFileSync } from "fs";
import { join } from "path";

// --- Types ---

interface D35EFeat {
  id: string;
  name: string;
  type: string;
  data: {
    featType?: string;
    requiresPsionicFocus?: boolean;
    tags?: string[][];
    description?: { value?: string };
  };
}

interface SrdFeatEntry {
  name: string;
  category: "core" | "epic" | "psionic" | "monster";
}

interface SrdReference {
  metadata: {
    counts: {
      total: number;
      core: number;
      epic: number;
      psionic: number;
      monster: number;
    };
  };
  feats: SrdFeatEntry[];
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

/** Strip D35E parameterized suffixes like "(No Weapon Selected)", "(Not Set)", "(All)", "(None)" */
function normalizeParameterized(name: string): string {
  return normalize(name)
    .replace(
      /\s*\((no weapon selected|no spell school selected|no spell set|not set|none|all|no weapon set)\)$/,
      ""
    );
}

function loadJson<T>(path: string): T {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as T;
}

function categorizeFeat(feat: D35EFeat): string {
  const desc = feat.data.description?.value ?? "";
  const tags = (feat.data.tags ?? []).flat();
  const rpf = feat.data.requiresPsionicFocus ?? false;

  if (rpf || desc.toLowerCase().includes("psionic focus")) return "psionic";
  if (tags.includes("Epic") || desc.match(/^.*?epic/i)) return "epic";
  return "general";
}

// --- Main ---

const scriptDir = import.meta.dir;
const rootDir = join(scriptDir, "../..");

const d35eFeatsPath = join(rootDir, "packages/core/data/d35e-raw/feats.json");
const srdReferencePath = join(scriptDir, "reference-data/srd-feats.json");

console.log("=== SRD Feat Verification ===\n");

// Load data
const d35eFeats = loadJson<D35EFeat[]>(d35eFeatsPath);
const srdReference = loadJson<SrdReference>(srdReferencePath);

// Build lookup maps
const ourFeatMap = new Map<string, D35EFeat>();
for (const feat of d35eFeats) {
  ourFeatMap.set(normalize(feat.name), feat);
}

// Also build a parameterized lookup (strips D35E suffixes like "(No Weapon Selected)")
const ourFeatParamMap = new Map<string, D35EFeat>();
for (const feat of d35eFeats) {
  const paramNorm = normalizeParameterized(feat.name);
  if (paramNorm !== normalize(feat.name)) {
    ourFeatParamMap.set(paramNorm, feat);
  }
}

const srdMap = new Map<string, SrdFeatEntry>();
for (const entry of srdReference.feats) {
  srdMap.set(normalize(entry.name), entry);
}

// --- Comparison ---

const matched: {
  ourName: string;
  srdName: string;
  category: string;
  parameterized?: boolean;
}[] = [];
const missingSrd: SrdFeatEntry[] = [];
const extraOurs: D35EFeat[] = [];

for (const [normalizedSrd, srdEntry] of srdMap) {
  if (ourFeatMap.has(normalizedSrd)) {
    matched.push({
      ourName: ourFeatMap.get(normalizedSrd)!.name,
      srdName: srdEntry.name,
      category: srdEntry.category,
    });
  } else if (ourFeatParamMap.has(normalizedSrd)) {
    // Matched via parameterized name stripping
    matched.push({
      ourName: ourFeatParamMap.get(normalizedSrd)!.name,
      srdName: srdEntry.name,
      category: srdEntry.category,
      parameterized: true,
    });
  } else {
    missingSrd.push(srdEntry);
  }
}

// Build set of all matched normalized names (including parameterized)
const matchedSrdNorms = new Set(
  matched.map((m) => normalize(m.srdName))
);
for (const [normalizedOur, feat] of ourFeatMap) {
  const paramNorm = normalizeParameterized(feat.name);
  if (!srdMap.has(normalizedOur) && !matchedSrdNorms.has(paramNorm)) {
    extraOurs.push(feat);
  }
}

// --- Report ---

console.log("--- Data Summary ---");
console.log(`Our feats (feats.json):   ${d35eFeats.length}`);
console.log(`SRD reference feats:      ${srdReference.feats.length}`);
console.log(
  `  Core: ${srdReference.metadata.counts.core}, Epic: ${srdReference.metadata.counts.epic}, Psionic: ${srdReference.metadata.counts.psionic}, Monster: ${srdReference.metadata.counts.monster}`
);
console.log();

console.log("--- Comparison Results ---");
console.log(`Matched (in SRD + we have):     ${matched.length}`);
console.log(`Missing (in SRD, we don't):     ${missingSrd.length}`);
console.log(`Extra (we have, not in SRD ref): ${extraOurs.length}`);
console.log();

if (missingSrd.length > 0) {
  console.log("--- SRD Feats We Are MISSING ---");
  const byCategory = new Map<string, string[]>();
  for (const entry of missingSrd) {
    const cat = entry.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(entry.name);
  }
  for (const [cat, names] of [...byCategory.entries()].sort()) {
    console.log(`\n  [${cat}] (${names.length}):`);
    for (const name of names.sort()) {
      console.log(`    - ${name}`);
    }
  }
  console.log();
}

if (extraOurs.length > 0) {
  console.log("--- Our Feats NOT in SRD Reference ---");
  console.log(
    "(These may be SRD feats the reference missed, or non-SRD content)\n"
  );

  const byGuessedCategory = new Map<string, string[]>();
  for (const feat of extraOurs) {
    const cat = categorizeFeat(feat);
    if (!byGuessedCategory.has(cat)) byGuessedCategory.set(cat, []);
    byGuessedCategory.get(cat)!.push(feat.name);
  }

  for (const [cat, names] of [...byGuessedCategory.entries()].sort()) {
    console.log(`  [${cat}] (${names.length}):`);
    for (const n of names.sort()) console.log(`    - ${n}`);
    console.log();
  }
}

// --- Parameterized Matches ---
const paramMatches = matched.filter((m) => m.parameterized);
if (paramMatches.length > 0) {
  console.log("--- Parameterized Feat Matches ---");
  console.log(
    "(D35E uses suffixes like '(No Weapon Selected)' for parameterized feats)\n"
  );
  for (const d of paramMatches.sort((a, b) =>
    a.ourName.localeCompare(b.ourName)
  )) {
    console.log(`  Ours: ${d.ourName}`);
    console.log(`  SRD:  ${d.srdName}`);
    console.log();
  }
}

// --- Name Differences ---
const nameDiffs = matched.filter(
  (m) => !m.parameterized && m.ourName !== m.srdName
);
if (nameDiffs.length > 0) {
  console.log("--- Name Differences (Unicode/formatting) ---");
  for (const d of nameDiffs.sort((a, b) =>
    a.ourName.localeCompare(b.ourName)
  )) {
    console.log(`  Ours: ${JSON.stringify(d.ourName)}`);
    console.log(`  SRD:  ${JSON.stringify(d.srdName)}`);
    console.log();
  }
}

// --- Coverage ---
const coveragePercent = (
  (matched.length / srdReference.feats.length) *
  100
).toFixed(1);
console.log("--- Coverage ---");
console.log(
  `SRD coverage: ${matched.length}/${srdReference.feats.length} (${coveragePercent}%)`
);

const matchedByCategory = new Map<string, number>();
for (const m of matched) {
  matchedByCategory.set(
    m.category,
    (matchedByCategory.get(m.category) ?? 0) + 1
  );
}
const counts = srdReference.metadata.counts as Record<string, number>;
for (const [cat, count] of [...matchedByCategory.entries()].sort()) {
  const total = counts[cat] ?? 0;
  console.log(`  ${cat}: ${count}/${total}`);
}
