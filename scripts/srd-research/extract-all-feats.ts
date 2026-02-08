/**
 * Extract and Structure All Feats
 *
 * Reads d35e-raw/feats.json and converts each feat into a structured format
 * compatible with the featSchema (category, prerequisites, benefit, normal, special, tags).
 *
 * Outputs to scripts/srd-research/reference-data/all-feats-structured.json
 *
 * Usage: bun run scripts/srd-research/extract-all-feats.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = join(import.meta.dir, "../..");
const RAW_PATH = join(ROOT, "packages/core/data/d35e-raw/feats.json");
const OUT_DIR = join(import.meta.dir, "reference-data");
const OUT_PATH = join(OUT_DIR, "all-feats-structured.json");

mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RawFeat {
  id: string;
  name: string;
  img?: string;
  type?: string;
  data?: Record<string, unknown>;
}

interface StructuredFeat {
  id: string;
  entityType: "feat";
  name: string;
  description: string;
  category: string;
  benefit: string;
  prerequisitesText: string;
  normal: string;
  special: string;
  tags: string[];
  image?: string;
}

type FeatCategory =
  | "General"
  | "Combat"
  | "Metamagic"
  | "Item Creation"
  | "Epic"
  | "Psionic"
  | "Divine"
  | "Monster";

// ---------------------------------------------------------------------------
// Description Parsing
// ---------------------------------------------------------------------------

function getDescription(feat: RawFeat): string {
  const desc = feat.data?.description;
  if (typeof desc === "string") return desc;
  if (desc && typeof desc === "object" && "value" in desc) {
    return String((desc as { value: string }).value);
  }
  return "";
}

/**
 * Strip any residual HTML tags (shouldn't be any, but just in case)
 */
function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

/**
 * Parse a feat description into structured sections.
 *
 * D35E feat descriptions follow a loose pattern:
 *   [flavor text]
 *   Prerequisite(s) ...
 *   Benefit ...
 *   Normal ...
 *   Special ...
 */
function parseDescription(rawDesc: string): {
  description: string;
  prerequisitesText: string;
  benefit: string;
  normal: string;
  special: string;
} {
  const text = stripHtml(rawDesc).replace(/\s+/g, " ").trim();

  // Split on section headers. We match "Prerequisite(s)", "Benefit(s)",
  // "Normal", "Special" when they appear as standalone section labels.
  // The tricky case is "whose prerequisites you meet" mid-sentence -- we
  // avoid this by requiring the keyword to be either at the start of the
  // string OR preceded by a space (not preceded by "whose ").
  // We do a two-pass approach: first find all candidates, then filter out
  // false positives.
  const sectionRe = /\b(Prerequisites?|Benefits?|Normal|Special)\s*:?\s*/gi;

  const sections: { header: string; start: number; end: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = sectionRe.exec(text)) !== null) {
    // Filter out false positives: "whose prerequisites you meet" mid-sentence
    const preceding = text.slice(Math.max(0, match.index - 6), match.index);
    if (/whose\s$/i.test(preceding)) continue;

    sections.push({
      header: match[1].toLowerCase().replace(/s$/, ""),
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  // Extract text for each section
  let description = "";
  let prerequisitesText = "";
  let benefit = "";
  let normal = "";
  let special = "";

  if (sections.length === 0) {
    // No recognizable sections -- put everything in benefit
    benefit = text;
  } else {
    // Text before first section is the flavor description
    description = text.slice(0, sections[0].start).trim();

    for (let i = 0; i < sections.length; i++) {
      const nextStart =
        i + 1 < sections.length ? sections[i + 1].start : text.length;
      const content = text.slice(sections[i].end, nextStart).trim();
      const header = sections[i].header;

      if (header === "prerequisite") {
        prerequisitesText = content;
      } else if (header === "benefit") {
        benefit = content;
      } else if (header === "normal") {
        normal = content;
      } else if (header === "special") {
        special = content;
      }
    }
  }

  // If no description was extracted, use first sentence of benefit
  if (!description && benefit) {
    const firstSentence = benefit.match(/^[^.!]+[.!]/);
    if (firstSentence) {
      description = firstSentence[0];
    } else {
      description = benefit.slice(0, 120) + (benefit.length > 120 ? "..." : "");
    }
  }

  return { description, prerequisitesText, benefit, normal, special };
}

// ---------------------------------------------------------------------------
// Category Classification
// ---------------------------------------------------------------------------

/** Known metamagic feat names */
const METAMAGIC_FEATS = new Set([
  "Empower Spell",
  "Enlarge Spell",
  "Extend Spell",
  "Heighten Spell",
  "Maximize Spell",
  "Quicken Spell",
  "Silent Spell",
  "Still Spell",
  "Widen Spell",
  // Epic metamagic
  "Enhance Spell",
  "Intensify Spell",
  "Multispell",
  "Improved Heighten Spell",
  "Automatic Quicken Spell",
  "Automatic Silent Spell",
  "Automatic Still Spell",
  // Psionic metamagic-equivalents
  "Empower Power",
  "Enlarge Power",
  "Extend Power",
  "Maximize Power",
  "Quicken Power",
  "Widen Power",
  "Twin Power",
  "Chain Power",
  "Burrowing Power",
  "Delay Power",
  "Opportunity Power",
]);

/** Known item creation feat names */
const ITEM_CREATION_FEATS = new Set([
  "Brew Potion",
  "Craft Magic Arms and Armor",
  "Craft Rod",
  "Craft Staff",
  "Craft Wand",
  "Craft Wondrous Item",
  "Forge Ring",
  "Scribe Scroll",
  // Epic
  "Craft Epic Magic Arms and Armor",
  "Craft Epic Rod",
  "Craft Epic Staff",
  "Craft Epic Wondrous Item",
  // Psionic
  "Craft Cognizance Crystal",
  "Craft Dorje",
  "Craft Psicrown",
  "Craft Psionic Arms and Armor",
  "Craft Psionic Construct",
  "Craft Universal Item",
  "Imprint Stone",
]);

/** Feats that are fighter bonus feats (can be selected by fighters as bonus feats) */
const FIGHTER_BONUS_KEYWORDS = [
  "fighter bonus feat",
  "fighter may select",
  "as one of his fighter bonus feats",
  "as a fighter bonus feat",
];

/** Known divine feats */
const DIVINE_FEAT_NAMES = new Set([
  "Extra Turning",
  "Improved Turning",
  "Divine Might",
  "Divine Shield",
  "Divine Vengeance",
  "Sacred Vengeance",
]);

/** Monster feats */
const MONSTER_FEAT_NAMES = new Set([
  "Multiattack",
  "Improved Multiattack",
  "Flyby Attack",
  "Hover",
  "Wingover",
  "Snatch",
  "Awesome Blow",
  "Improved Natural Attack",
  "Improved Natural Armor",
  "Multiweapon Fighting",
  "Improved Multiweapon Fighting",
  "Greater Multiweapon Fighting",
]);

function classifyFeat(
  name: string,
  fullText: string,
  data: Record<string, unknown>,
): { category: FeatCategory; tags: string[] } {
  const tags: string[] = [];
  const lowerText = fullText.toLowerCase();
  const lowerName = name.toLowerCase();

  // Check metamagic (explicit set or data flag)
  const metamagic = data.metamagic as { enabled?: boolean } | undefined;
  if (METAMAGIC_FEATS.has(name) || metamagic?.enabled) {
    tags.push("metamagic");
    // Psionic metamagic equivalents
    if (/power$/i.test(name)) {
      tags.push("psionic");
      return { category: "Psionic", tags };
    }
    return { category: "Metamagic", tags };
  }

  // Check item creation
  if (ITEM_CREATION_FEATS.has(name)) {
    tags.push("itemCreation");
    if (/psionic|cognizance|dorje|psicrown|imprint|universal item/i.test(name)) {
      tags.push("psionic");
      return { category: "Psionic", tags };
    }
    if (/epic/i.test(name)) {
      tags.push("epic");
      return { category: "Epic", tags };
    }
    return { category: "Item Creation", tags };
  }

  // Check epic (by name prefix or keywords in description)
  const rawTags = data.tags as unknown[][] | undefined;
  const hasEpicTag = rawTags?.some(
    (t) => Array.isArray(t) && t[0] === "Epic",
  );
  if (
    hasEpicTag ||
    lowerName.startsWith("epic ") ||
    /\bepic\b/.test(lowerText.slice(0, 200))
  ) {
    tags.push("epic");
    if (/psionic|power point|manifester/i.test(lowerText)) {
      tags.push("psionic");
    }
    return { category: "Epic", tags };
  }

  // Check psionic (by name or description keywords)
  if (
    /psionic|psi-like|power point|manifester|psicrystal|psion/i.test(name) ||
    data.requiresPsionicFocus ||
    /psionic focus|power point|manifester level|psionic/i.test(
      lowerText.slice(0, 300),
    )
  ) {
    tags.push("psionic");
    return { category: "Psionic", tags };
  }

  // Check divine
  if (
    DIVINE_FEAT_NAMES.has(name) ||
    /turn\s+undead|rebuke\s+undead|turning\s+check/i.test(lowerText)
  ) {
    tags.push("divine");
    return { category: "Divine", tags };
  }

  // Check monster feats (only by explicit name set -- description-based
  // matching causes false positives like Power Attack)
  if (MONSTER_FEAT_NAMES.has(name)) {
    tags.push("monster");
    return { category: "Monster", tags };
  }

  // Check fighter bonus feat eligibility
  const isFighterBonus = FIGHTER_BONUS_KEYWORDS.some((kw) =>
    lowerText.includes(kw),
  );
  if (isFighterBonus) {
    tags.push("fighterBonusFeat");
  }

  // Classify remaining into Combat vs General
  const combatKeywords =
    /\b(attack|weapon|armor|shield|melee|ranged|damage|critical|grapple|initiative|two-weapon|mounted|combat|unarmed|strike|trip|disarm|sunder|overrun|charge|bull rush|thrown|archery)\b/i;
  if (combatKeywords.test(lowerText) || isFighterBonus) {
    tags.push("combat");
    return { category: "Combat", tags };
  }

  return { category: "General", tags };
}

// ---------------------------------------------------------------------------
// ID Generation
// ---------------------------------------------------------------------------

function toId(name: string): string {
  return (
    "feat-" +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const raw: RawFeat[] = JSON.parse(readFileSync(RAW_PATH, "utf-8"));

console.log(`Loaded ${raw.length} feats from feats.json\n`);

const structured: StructuredFeat[] = [];
const categoryStats: Record<string, number> = {};
const tagStats: Record<string, number> = {};

for (const feat of raw) {
  const data = feat.data ?? {};
  const rawText = getDescription(feat);
  const { description, prerequisitesText, benefit, normal, special } =
    parseDescription(rawText);
  const { category, tags } = classifyFeat(feat.name, rawText, data);

  // Track stats
  categoryStats[category] = (categoryStats[category] ?? 0) + 1;
  for (const tag of tags) {
    tagStats[tag] = (tagStats[tag] ?? 0) + 1;
  }

  structured.push({
    id: toId(feat.name),
    entityType: "feat",
    name: feat.name,
    description,
    category,
    benefit,
    prerequisitesText,
    normal,
    special,
    tags,
    image: feat.img,
  });
}

// Sort by category then name
structured.sort((a, b) => {
  const catCmp = a.category.localeCompare(b.category);
  if (catCmp !== 0) return catCmp;
  return a.name.localeCompare(b.name);
});

// Write output
writeFileSync(OUT_PATH, JSON.stringify(structured, null, 2));

// ---------------------------------------------------------------------------
// Print Stats
// ---------------------------------------------------------------------------

console.log("=== Feats by Category ===\n");
const categoryOrder: FeatCategory[] = [
  "General",
  "Combat",
  "Metamagic",
  "Item Creation",
  "Epic",
  "Psionic",
  "Divine",
  "Monster",
];
for (const cat of categoryOrder) {
  const count = categoryStats[cat] ?? 0;
  if (count > 0) {
    console.log(`  ${cat}: ${count}`);
  }
}
console.log(`\n  TOTAL: ${structured.length}`);

console.log("\n=== Tag Distribution ===\n");
for (const [tag, count] of Object.entries(tagStats).sort(
  (a, b) => b[1] - a[1],
)) {
  console.log(`  ${tag}: ${count}`);
}

// Print sample from each category
console.log("\n=== Samples by Category ===\n");
for (const cat of categoryOrder) {
  const feats = structured.filter((f) => f.category === cat);
  if (feats.length === 0) continue;
  console.log(`--- ${cat} (${feats.length}) ---`);
  for (const f of feats.slice(0, 3)) {
    const prereq = f.prerequisitesText
      ? ` [Prereq: ${f.prerequisitesText.slice(0, 80)}]`
      : "";
    console.log(`  ${f.name}${prereq}`);
  }
  if (feats.length > 3) console.log(`  ... and ${feats.length - 3} more`);
  console.log();
}

// Show any feats with no benefit text (potential parsing issues)
const noBenefit = structured.filter((f) => !f.benefit);
if (noBenefit.length > 0) {
  console.log(`\n=== WARNING: ${noBenefit.length} feats with no benefit text ===\n`);
  for (const f of noBenefit.slice(0, 10)) {
    console.log(`  ${f.name} (${f.category})`);
  }
}

console.log(`\nOutput written to: ${OUT_PATH}`);
