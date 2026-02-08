/**
 * SRD Spell Verification Script
 *
 * Cross-references our D35E raw spell data against a known SRD spell reference list
 * to verify completeness and identify gaps.
 *
 * Usage: bun run scripts/srd-research/verify-srd-spells.ts
 */

import { readFileSync } from "fs";
import { join } from "path";

// --- Types ---

interface D35ESpell {
  id: string;
  name: string;
  type: string;
  data: {
    isPower: boolean;
    school: string;
    learnedAt?: {
      class?: [string, number][];
      domain?: [string, number][];
    };
    description?: { value?: string };
  };
}

interface SrdSpellEntry {
  name: string;
  verifiedSource: string;
  category: "core" | "epic" | "domain";
}

interface SrdReference {
  metadata: {
    counts: { total: number; core: number; epic: number; domain: number };
  };
  spells: SrdSpellEntry[];
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

function loadJson<T>(path: string): T {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as T;
}

// --- Main ---

const scriptDir = import.meta.dir;
const rootDir = join(scriptDir, "../..");

const d35eSpellsPath = join(
  rootDir,
  "packages/core/data/d35e-raw/spells.json"
);
const d35ePowersPath = join(
  rootDir,
  "packages/core/data/d35e-raw/powers.json"
);
const srdReferencePath = join(scriptDir, "reference-data/srd-spells.json");

console.log("=== SRD Spell Verification ===\n");

// Load data
const d35eSpells = loadJson<D35ESpell[]>(d35eSpellsPath);
const d35ePowers = loadJson<D35ESpell[]>(d35ePowersPath);
const srdReference = loadJson<SrdReference>(srdReferencePath);

// Build lookup maps
const ourSpellMap = new Map<string, D35ESpell>();
for (const spell of d35eSpells) {
  ourSpellMap.set(normalize(spell.name), spell);
}

const ourPowerMap = new Map<string, D35ESpell>();
for (const power of d35ePowers) {
  ourPowerMap.set(normalize(power.name), power);
}

const srdMap = new Map<string, SrdSpellEntry>();
for (const entry of srdReference.spells) {
  srdMap.set(normalize(entry.name), entry);
}

// --- Comparison ---

// 1. SRD spells we have
const matched: { ourName: string; srdName: string; category: string }[] = [];
// 2. SRD spells we're missing
const missingSrd: SrdSpellEntry[] = [];
// 3. Our spells not in SRD reference
const extraOurs: D35ESpell[] = [];

for (const [normalizedSrd, srdEntry] of srdMap) {
  if (ourSpellMap.has(normalizedSrd)) {
    matched.push({
      ourName: ourSpellMap.get(normalizedSrd)!.name,
      srdName: srdEntry.name,
      category: srdEntry.category,
    });
  } else if (ourPowerMap.has(normalizedSrd)) {
    // It's in powers.json instead of spells.json (epic psionic powers)
    matched.push({
      ourName: ourPowerMap.get(normalizedSrd)!.name,
      srdName: srdEntry.name,
      category: srdEntry.category + " (in powers.json)",
    });
  } else {
    missingSrd.push(srdEntry);
  }
}

for (const [normalizedOur, spell] of ourSpellMap) {
  if (!srdMap.has(normalizedOur)) {
    extraOurs.push(spell);
  }
}

// --- Report ---

console.log("--- Data Summary ---");
console.log(`Our spells (spells.json):  ${d35eSpells.length}`);
console.log(`Our powers (powers.json):  ${d35ePowers.length}`);
console.log(`SRD reference spells:      ${srdReference.spells.length}`);
console.log(
  `  Core: ${srdReference.metadata.counts.core}, Epic: ${srdReference.metadata.counts.epic}, Domain: ${srdReference.metadata.counts.domain}`
);
console.log();

console.log("--- Comparison Results ---");
console.log(`Matched (in SRD + we have):     ${matched.length}`);
console.log(`Missing (in SRD, we don't):     ${missingSrd.length}`);
console.log(`Extra (we have, not in SRD ref): ${extraOurs.length}`);
console.log();

if (missingSrd.length > 0) {
  console.log("--- SRD Spells We Are MISSING ---");
  const byCategory = new Map<string, string[]>();
  for (const entry of missingSrd) {
    const cat = entry.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(entry.name);
  }
  for (const [cat, names] of byCategory) {
    console.log(`\n  [${cat}] (${names.length}):`);
    for (const name of names.sort()) {
      console.log(`    - ${name}`);
    }
  }
  console.log();
}

if (extraOurs.length > 0) {
  console.log("--- Our Spells NOT in SRD Reference ---");
  console.log(
    "(These may be SRD spells the reference missed, or non-SRD content)\n"
  );

  // Categorize by likely source
  const psionic: string[] = [];
  const domainSpells: string[] = [];
  const epicSpells: string[] = [];
  const standard: string[] = [];
  const unknown: string[] = [];

  for (const spell of extraOurs) {
    const desc = spell.data.description?.value ?? "";
    const school = spell.data.school;
    const classes = spell.data.learnedAt?.class ?? [];
    const domains = spell.data.learnedAt?.domain ?? [];
    const psionicSchools = ["tel", "bol", "cla", "por", "kin", "met"];

    if (psionicSchools.includes(school) || desc.includes("Psionic")) {
      psionic.push(spell.name);
    } else if (
      domains.length > 0 &&
      classes.length === 0
    ) {
      domainSpells.push(spell.name);
    } else if (
      desc.includes("Epic") ||
      spell.name.toUpperCase() === spell.name
    ) {
      epicSpells.push(spell.name);
    } else if (classes.length > 0) {
      standard.push(spell.name);
    } else {
      unknown.push(spell.name);
    }
  }

  if (psionic.length > 0) {
    console.log(`  [Psionic-related spells] (${psionic.length}):`);
    for (const n of psionic.sort()) console.log(`    - ${n}`);
    console.log();
  }
  if (domainSpells.length > 0) {
    console.log(`  [Domain-only spells] (${domainSpells.length}):`);
    for (const n of domainSpells.sort()) console.log(`    - ${n}`);
    console.log();
  }
  if (epicSpells.length > 0) {
    console.log(`  [Possibly epic] (${epicSpells.length}):`);
    for (const n of epicSpells.sort()) console.log(`    - ${n}`);
    console.log();
  }
  if (standard.length > 0) {
    console.log(`  [Standard spells (likely SRD reference gap)] (${standard.length}):`);
    for (const n of standard.sort()) console.log(`    - ${n}`);
    console.log();
  }
  if (unknown.length > 0) {
    console.log(`  [Unknown/unclassified] (${unknown.length}):`);
    for (const n of unknown.sort()) console.log(`    - ${n}`);
    console.log();
  }
}

// --- Name Differences ---
const nameDiffs = matched.filter((m) => m.ourName !== m.srdName);
if (nameDiffs.length > 0) {
  console.log("--- Name Differences (Unicode/formatting) ---");
  console.log(
    "(Same spell, different character encoding)\n"
  );
  for (const d of nameDiffs.sort((a, b) => a.ourName.localeCompare(b.ourName))) {
    console.log(`  Ours: ${JSON.stringify(d.ourName)}`);
    console.log(`  SRD:  ${JSON.stringify(d.srdName)}`);
    console.log();
  }
}

// --- Coverage Percentage ---
const coveragePercent = (
  (matched.length / srdReference.spells.length) *
  100
).toFixed(1);
console.log("--- Coverage ---");
console.log(
  `SRD coverage: ${matched.length}/${srdReference.spells.length} (${coveragePercent}%)`
);

// Category breakdown
const matchedByCategory = new Map<string, number>();
for (const m of matched) {
  const baseCat = m.category.replace(" (in powers.json)", "");
  matchedByCategory.set(baseCat, (matchedByCategory.get(baseCat) ?? 0) + 1);
}
for (const [cat, count] of matchedByCategory) {
  const total =
    cat === "core"
      ? srdReference.metadata.counts.core
      : cat === "epic"
        ? srdReference.metadata.counts.epic
        : srdReference.metadata.counts.domain;
  console.log(`  ${cat}: ${count}/${total}`);
}
