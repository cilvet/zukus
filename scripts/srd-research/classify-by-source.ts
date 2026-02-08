/**
 * Classify Spells by Source Book
 *
 * Matches dndtools scraped data (with source field) against our d35e-raw spells
 * to tag each spell with its source book.
 *
 * Key challenge: dndtools uses slug format ("greater-arcane-sight") while d35e
 * uses "Arcane Sight, Greater" (comma-suffix for Greater/Lesser/Mass variants).
 * Also handles apostrophe differences (bears-endurance vs Bear's Endurance).
 *
 * Usage: bun run scripts/srd-research/classify-by-source.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = join(import.meta.dir, "../..");
const DNDTOOLS_PATH = join(
  import.meta.dir,
  "reference-data/dndtools-spells-es.json",
);
const D35E_PATH = join(ROOT, "packages/core/data/d35e-raw/spells.json");
const OUT_DIR = join(import.meta.dir, "reference-data");
const OUT_PATH = join(OUT_DIR, "spell-source-mapping.json");

mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DndtoolsSpell {
  spanishName: string;
  englishSlug: string;
  spanishDescription: string;
  level: number;
  classes: string[];
  source: string;
}

interface D35eSpell {
  id: string;
  name: string;
  img?: string;
  type?: string;
  data?: Record<string, unknown>;
}

interface SpellSourceEntry {
  d35eName: string;
  d35eId: string;
  sourceCode: string;
  sourceBook: string;
  dndtoolsSlug: string;
  spanishName: string;
}

// ---------------------------------------------------------------------------
// Source code -> Book name mapping
// ---------------------------------------------------------------------------

const SOURCE_BOOK_MAP: Record<string, string> = {
  spellsAllCore: "Player's Handbook (SRD)",
  spellsCA: "Complete Arcane",
  spellsCDiv: "Complete Divine",
  spellsCMage: "Complete Mage",
  spellsCAdv: "Complete Adventurer",
  spellsCScou: "Complete Scoundrel",
  spellsCWar: "Complete Warrior",
  spellsCC: "Complete Champion",
  spellsphb2: "Player's Handbook II",
  spellsfrost: "Frostburn",
  spellsboed: "Book of Exalted Deeds",
  spellsph: "Planar Handbook",
  spellssand: "Sandstorm",
  spellsdrac: "Draconomicon",
  spellsmh: "Miniatures Handbook",
  spellslm: "Libris Mortis",
  spellsstorm: "Stormwrack",
  spellsdragonmagic: "Dragon Magic",
  spellsmoi: "Magic of Incarnum",
  spellsrotd: "Races of the Dragon",
  spellshob: "Heroes of Battle",
  spellstom: "Tome of Magic",
  spellshoh: "Heroes of Horror",
  spellsFC2: "Fiendish Codex II",
  spellsFC1: "Fiendish Codex I",
  spellsrod: "Races of Destiny",
  spellsdotu: "Drow of the Underdark",
  spellslom: "Lords of Madness",
  spellscity: "Cityscape",
  spellsrotw: "Races of the Wild",
  spellsros: "Races of Stone",
  spellswol: "Weapons of Legacy",
};

function getBookName(sourceCode: string): string {
  return SOURCE_BOOK_MAP[sourceCode] ?? sourceCode;
}

// ---------------------------------------------------------------------------
// Name normalization & matching
// ---------------------------------------------------------------------------

/**
 * Convert a dndtools slug to a normalized name for matching.
 * "greater-arcane-sight" -> "arcane sight, greater"
 * "bears-endurance" -> "bear's endurance"
 * "mass-cure-light-wounds" -> "cure light wounds, mass"
 */
function slugToNormalizedName(slug: string): string {
  let name = slug.replace(/-/g, " ").toLowerCase().trim();

  // Handle Greater/Lesser/Mass prefix -> comma suffix
  // "greater arcane sight" -> "arcane sight, greater"
  const prefixMatch = name.match(
    /^(greater|lesser|mass)\s+(.+)$/,
  );
  if (prefixMatch) {
    const [, prefix, rest] = prefixMatch;
    name = `${rest}, ${prefix}`;
  }

  return name;
}

/**
 * Normalize a d35e spell name for matching.
 * "Bear's Endurance" -> "bear's endurance"
 * "Arcane Sight, Greater" -> "arcane sight, greater"
 */
function normalizeD35eName(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Generate multiple match candidates for a slug to handle edge cases.
 */
function generateMatchCandidates(slug: string): string[] {
  const candidates: string[] = [];
  const base = slugToNormalizedName(slug);
  candidates.push(base);

  // Try adding apostrophe for possessive forms
  // "bears endurance" -> "bear's endurance"
  const possessiveMatch = base.match(/^(\w+)s\s/);
  if (possessiveMatch) {
    candidates.push(base.replace(/^(\w+)s\s/, "$1's "));
  }

  // "heroes feast" -> "heroes' feast"
  const pluralPossMatch = base.match(/^(\w+es)\s/);
  if (pluralPossMatch) {
    candidates.push(base.replace(/^(\w+es)\s/, "$1' "));
  }

  // "mages disjunction" -> "mage's disjunction"
  const midPossMatch = base.match(/(\w+)s\s/g);
  if (midPossMatch) {
    for (const match of midPossMatch) {
      const word = match.trim();
      const withApostrophe = word.replace(/s$/, "'s");
      candidates.push(base.replace(word, withApostrophe));
    }
  }

  // Also try without the comma suffix transformation
  // (in case d35e doesn't use comma format for some)
  const raw = slug.replace(/-/g, " ").toLowerCase().trim();
  if (raw !== base) {
    candidates.push(raw);
  }

  // Handle "Nystul's" vs "Nystuls" etc (known possessives mid-name)
  const allPossessives = base.replace(/(\w)s\s/g, "$1's ");
  if (allPossessives !== base) {
    candidates.push(allPossessives);
  }

  // For comma-suffix names, also try "Greater Spell Name" format (no comma)
  const commaMatch = base.match(/^(.+),\s*(greater|lesser|mass)$/);
  if (commaMatch) {
    candidates.push(`${commaMatch[2]} ${commaMatch[1]}`);
  }

  // Handle "open-close" -> "open/close"
  candidates.push(base.replace(/\s/g, "/"));

  // Handle alignment variant slugs like "protection-from-chaos/evil/good/law"
  // These are combined entries that represent 4 separate spells in d35e
  if (slug.includes("/")) {
    const parts = slug.split("/");
    // The first part is the base slug, rest are variant suffixes
    // e.g. "protection-from-chaos/evil/good/law" -> base="protection-from-chaos", variants=["evil","good","law"]
    const baseSlug = parts[0];
    const baseName = baseSlug.replace(/-/g, " ").toLowerCase();
    // The last word of baseName contains the first variant
    // "protection from chaos" with variants ["evil", "good", "law"]
    candidates.push(baseName);
    for (const variant of parts.slice(1)) {
      // Replace the last word with the variant
      const words = baseName.split(" ");
      words[words.length - 1] = variant.toLowerCase();
      candidates.push(words.join(" "));
    }
  }

  return [...new Set(candidates)];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const dndtools: DndtoolsSpell[] = JSON.parse(
  readFileSync(DNDTOOLS_PATH, "utf-8"),
);
const d35e: D35eSpell[] = JSON.parse(readFileSync(D35E_PATH, "utf-8"));

console.log(`Loaded ${dndtools.length} dndtools spells`);
console.log(`Loaded ${d35e.length} d35e spells\n`);

// Build d35e lookup: normalized name -> spell
const d35eLookup = new Map<string, D35eSpell>();
for (const spell of d35e) {
  const normalized = normalizeD35eName(spell.name);
  d35eLookup.set(normalized, spell);
}

// Match dndtools -> d35e
const mapping: SpellSourceEntry[] = [];
const unmatchedDndtools: { slug: string; source: string }[] = [];
const matchedD35eIds = new Set<string>();
const mappingKeys = new Set<string>();

// Stats
const bookStats: Record<string, { total: number; matched: number }> = {};

for (const dtSpell of dndtools) {
  const sourceCode = dtSpell.source;
  const bookName = getBookName(sourceCode);

  if (!bookStats[bookName]) {
    bookStats[bookName] = { total: 0, matched: 0 };
  }
  bookStats[bookName].total++;

  // Try all match candidates -- for variant slugs (with /), match all variants
  const candidates = generateMatchCandidates(dtSpell.englishSlug);
  let matched = false;

  for (const candidate of candidates) {
    const d35eSpell = d35eLookup.get(candidate);
    if (d35eSpell) {
      // Only add to mapping if this exact d35e+source combo doesn't exist yet
      const key = `${d35eSpell.id}:${sourceCode}`;
      if (!mappingKeys.has(key)) {
        mappingKeys.add(key);
        mapping.push({
          d35eName: d35eSpell.name,
          d35eId: d35eSpell.id,
          sourceCode,
          sourceBook: bookName,
          dndtoolsSlug: dtSpell.englishSlug,
          spanishName: dtSpell.spanishName,
        });
        matchedD35eIds.add(d35eSpell.id);
      }
      if (!matched) {
        bookStats[bookName].matched++;
        matched = true;
      }
    }
  }

  if (!matched) {
    unmatchedDndtools.push({ slug: dtSpell.englishSlug, source: sourceCode });
  }
}

// Find d35e spells not matched by any dndtools entry
const unmatchedD35e = d35e.filter((s) => !matchedD35eIds.has(s.id));

// Write output
writeFileSync(OUT_PATH, JSON.stringify(mapping, null, 2));

// ---------------------------------------------------------------------------
// Print Stats
// ---------------------------------------------------------------------------

console.log("=== Match Results ===\n");
console.log(`Matched: ${mapping.length} / ${dndtools.length} dndtools spells`);
console.log(`Unmatched dndtools: ${unmatchedDndtools.length}`);
console.log(`D35e spells not in dndtools: ${unmatchedD35e.length}`);

console.log("\n=== Spells by Source Book ===\n");

// Sort by total descending
const sortedBooks = Object.entries(bookStats).sort(
  (a, b) => b[1].total - a[1].total,
);
for (const [book, stats] of sortedBooks) {
  const pct = ((stats.matched / stats.total) * 100).toFixed(0);
  console.log(
    `  ${book}: ${stats.total} total, ${stats.matched} matched to d35e (${pct}%)`,
  );
}

// SRD-specific stats
const srdMatched = mapping.filter(
  (m) => m.sourceBook === "Player's Handbook (SRD)",
);
console.log(`\n=== SRD/PHB Spells ===`);
console.log(`  Total in dndtools: ${bookStats["Player's Handbook (SRD)"]?.total ?? 0}`);
console.log(`  Matched to d35e: ${srdMatched.length}`);

// Show some unmatched dndtools SRD spells
const unmatchedSrd = unmatchedDndtools.filter(
  (u) => u.source === "spellsAllCore",
);
if (unmatchedSrd.length > 0) {
  console.log(`  Unmatched SRD spells: ${unmatchedSrd.length}`);
  for (const u of unmatchedSrd.slice(0, 20)) {
    const candidates = generateMatchCandidates(u.slug);
    console.log(`    ${u.slug} -> tried: ${candidates.slice(0, 3).join(", ")}`);
  }
}

// Show unmatched d35e spells (spells we have but dndtools doesn't)
if (unmatchedD35e.length > 0) {
  console.log(`\n=== D35e Spells Not in Dndtools (${unmatchedD35e.length}) ===`);
  for (const s of unmatchedD35e.slice(0, 20)) {
    console.log(`  ${s.name}`);
  }
  if (unmatchedD35e.length > 20) {
    console.log(`  ... and ${unmatchedD35e.length - 20} more`);
  }
}

console.log(`\nOutput written to: ${OUT_PATH}`);
