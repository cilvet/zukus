/**
 * Script to import ALL D35E Foundry VTT compendiums as raw JSON
 *
 * Usage: bun scripts/import-d35e-compendiums.ts
 *
 * Prerequisites: Clone D35E repo to /Users/cilveti/personal/d35e-data
 *   git clone --depth 1 https://github.com/Rughalt/D35E.git /Users/cilveti/personal/d35e-data
 *
 * Output: packages/core/data/d35e-raw/*.json
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Configuration
// =============================================================================

const D35E_PACKS_PATH = '/Users/cilveti/personal/d35e-data/packs';
const OUTPUT_DIR = '/Users/cilveti/personal/zukus/packages/core/data/d35e-raw';

// Compendiums to import (all of them)
const COMPENDIUMS = [
  // Equipment (already converted to entities, but keep raw for reference)
  'armors-and-shields',
  'enhancements',
  'items',
  'magic-items',
  'weapons-and-ammo',

  // Spells & Powers
  'spells',
  'powers',
  'spell-like-abilities',
  'spell-school-domain',

  // Classes & Features
  'classes',
  'class-abilities',
  'racial-abilities',
  'racialfeatures',
  'racial-hd',

  // Feats
  'feats',

  // Creatures
  'bestiary',
  'minions',
  'minion-classes',
  'templates',

  // Buffs & Conditions
  'commonbuffs',
  'commonauras',
  'conditions',
  'itembuffs',

  // Rules & Reference
  'damage-types',
  'materials',
  'natural-attacks',
  'srd-rules',
  'traps',

  // Tables
  'roll-tables',
  'item-roll-tables',

  // Misc (skip empty/irrelevant)
  // 'sample-chars', // empty
  // 'sample-macros', // not useful
  // 'scenes', // not useful
  // 'documentation', // internal
];

// =============================================================================
// Utilities
// =============================================================================

/**
 * Read a NeDB file (newline-delimited JSON) and parse it
 */
function readNeDB(filePath: string): unknown[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

/**
 * Strip HTML tags and clean up text
 */
function stripHtml(html: string | undefined | null): string | undefined {
  if (!html) return undefined;
  return (
    html
      // Remove Foundry compendium links like @Compendium[D35E.spells.abc123]{Spell Name}
      .replace(/@Compendium\[[^\]]+\]\{([^}]+)\}/g, '$1')
      // Remove Foundry UUID links
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
      .trim()
  );
}

/**
 * Recursively clean an object:
 * - Strip HTML from string values that look like HTML
 * - Remove internal Foundry fields (_id prefix becomes id)
 * - Remove empty objects/arrays
 */
function cleanObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (typeof obj === 'string') {
    // Strip HTML if it looks like HTML
    if (obj.includes('<') || obj.includes('&')) {
      return stripHtml(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    const cleaned = obj.map(cleanObject).filter((x) => x !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Skip internal Foundry fields
      if (key.startsWith('_') && key !== '_id') continue;
      if (key === 'flags') continue;
      if (key === 'effects' && Array.isArray(value) && value.length === 0)
        continue;
      if (key === 'folder') continue;
      if (key === 'sort') continue;
      if (key === 'ownership') continue;
      if (key === 'permission') continue;

      // Rename _id to id
      const newKey = key === '_id' ? 'id' : key;

      const cleaned = cleanObject(value);
      if (cleaned !== undefined) {
        result[newKey] = cleaned;
      }
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  return obj;
}

/**
 * Process a compendium and return cleaned entries
 */
function processCompendium(name: string): unknown[] {
  const filePath = path.join(D35E_PACKS_PATH, `${name}.db`);

  if (!fs.existsSync(filePath)) {
    console.warn(`  Warning: ${name}.db not found, skipping`);
    return [];
  }

  const raw = readNeDB(filePath);
  const cleaned = raw.map(cleanObject).filter((x) => x !== undefined);

  return cleaned;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('D35E Compendium Importer');
  console.log('========================\n');

  // Verify D35E path exists
  if (!fs.existsSync(D35E_PACKS_PATH)) {
    console.error(`Error: D35E packs not found at ${D35E_PACKS_PATH}`);
    console.error(
      'Clone the repo first: git clone --depth 1 https://github.com/Rughalt/D35E.git /Users/cilveti/personal/d35e-data'
    );
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Source: ${D35E_PACKS_PATH}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  const stats: { name: string; count: number; sizeKB: number }[] = [];

  for (const compendium of COMPENDIUMS) {
    process.stdout.write(`Processing ${compendium}...`);

    const entries = processCompendium(compendium);

    if (entries.length === 0) {
      console.log(' (empty or not found)');
      continue;
    }

    // Write to JSON file
    const outputPath = path.join(OUTPUT_DIR, `${compendium}.json`);
    const json = JSON.stringify(entries, null, 2);
    fs.writeFileSync(outputPath, json, 'utf-8');

    const sizeKB = Math.round(json.length / 1024);
    stats.push({ name: compendium, count: entries.length, sizeKB });

    console.log(` ${entries.length} entries (${sizeKB} KB)`);
  }

  // Write README
  const readme = `# D35E Raw Data

Raw JSON exports from [D35E Foundry VTT system](https://github.com/Rughalt/D35E).

**Generated**: ${new Date().toISOString().split('T')[0]}

## Contents

| File | Entries | Size |
|------|---------|------|
${stats.map((s) => `| ${s.name}.json | ${s.count} | ${s.sizeKB} KB |`).join('\n')}

## Usage

These are raw data files for reference. They are NOT imported into the application directly.

To use this data:
1. Create a conversion script (like \`convert-d35e-to-entities.ts\`)
2. Transform to StandardEntity format
3. Output to the appropriate \`srd/\` folder

## License

D35E content is licensed under OGL 1.0a.
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readme, 'utf-8');

  // Summary
  console.log('\n========================');
  console.log('Summary');
  console.log('========================\n');

  const totalEntries = stats.reduce((sum, s) => sum + s.count, 0);
  const totalSizeKB = stats.reduce((sum, s) => sum + s.sizeKB, 0);

  console.log(`Total compendiums: ${stats.length}`);
  console.log(`Total entries: ${totalEntries.toLocaleString()}`);
  console.log(`Total size: ${(totalSizeKB / 1024).toFixed(1)} MB`);
  console.log(`\nOutput: ${OUTPUT_DIR}`);
}

main().catch(console.error);
