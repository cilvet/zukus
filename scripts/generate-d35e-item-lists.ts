/**
 * Script to generate markdown files listing all D35E items with primitive indicators
 *
 * Usage: bun scripts/generate-d35e-item-lists.ts
 *        bun scripts/generate-d35e-item-lists.ts --details
 *
 * Output: packages/core/data/d35e-raw/lists/*.md
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Configuration
// =============================================================================

const DATA_DIR = './packages/core/data/d35e-raw';
const OUTPUT_DIR = './packages/core/data/d35e-raw/lists';

// Show detailed primitive values under each item name
const SHOW_DETAILS = process.argv.includes('--details');

// =============================================================================
// Primitive Icons (text-based for markdown compatibility)
// =============================================================================

const PRIMITIVES = {
  // === CORE MODIFIERS ===
  changes: {
    icon: '[Changes]',
    name: 'Changes',
    description: 'Stat modifiers (ability, AC, attack, damage, saves, skills, speed)',
  },
  contextNotes: {
    icon: '[Context Notes]',
    name: 'Context Notes',
    description: 'Situational bonuses or conditional notes',
  },
  conditionalModifiers: {
    icon: '[Conditional Modifiers]',
    name: 'Conditional Modifiers',
    description: 'Conditional stat modifiers',
  },

  // === COMBAT ===
  attackBonus: {
    icon: '[Attack Bonus]',
    name: 'Attack Bonus',
    description: 'Direct attack roll modifier',
  },
  critConfirmBonus: {
    icon: '[Crit Confirm]',
    name: 'Crit Confirm Bonus',
    description: 'Critical hit confirmation bonus',
  },
  attackParts: {
    icon: '[Attack Parts]',
    name: 'Attack Parts',
    description: 'Damage components/dice',
  },
  attackNotes: {
    icon: '[Attack Notes]',
    name: 'Attack Notes',
    description: 'Attack modifier notes',
  },
  effectNotes: {
    icon: '[Effect Notes]',
    name: 'Effect Notes',
    description: 'Effect description text',
  },

  // === DEFENSES ===
  resistances: {
    icon: '[Resistances]',
    name: 'Resistances',
    description: 'Energy resistances (fire, cold, acid, electric)',
  },
  damageReduction: {
    icon: '[Damage Reduction]',
    name: 'Damage Reduction',
    description: 'DR X/type',
  },
  save: {
    icon: '[Saving Throw]',
    name: 'Saving Throw',
    description: 'Requires a saving throw',
  },

  // === FORMULAS ===
  formula: {
    icon: '[Formula]',
    name: 'Formula',
    description: 'Dynamic calculation formula',
  },
  damageFormula: {
    icon: '[Damage Formula]',
    name: 'Damage Formula',
    description: 'Damage calculation formula',
  },
  attackFormula: {
    icon: '[Attack Formula]',
    name: 'Attack Formula',
    description: 'Attack calculation formula',
  },

  // === ACTIONS & ACTIVATION ===
  specialActions: {
    icon: '[Special Actions]',
    name: 'Special Actions',
    description: 'Activatable abilities with conditions/scripts',
  },
  activation: {
    icon: '[Activation]',
    name: 'Activation',
    description: 'Has activation cost/type',
  },
  uses: {
    icon: '[Uses]',
    name: 'Uses',
    description: 'Limited uses per day/encounter',
  },
  recharge: {
    icon: '[Recharge]',
    name: 'Recharge',
    description: 'Recharges over time',
  },

  // === CRAFTING & REQUIREMENTS ===
  requirements: {
    icon: '[Requirements]',
    name: 'Requirements',
    description: 'Prerequisites or crafting requirements',
  },
  enhIncreaseFormula: {
    icon: '[Enhancement]',
    name: 'Enhancement',
    description: 'Enhancement bonus formula/cost',
  },

  // === SPELLCASTING ===
  learnedAt: {
    icon: '[Class Levels]',
    name: 'Class Levels',
    description: 'Available to specific classes at specific levels',
  },
  abilityModifiers: {
    icon: '[Ability Modifiers]',
    name: 'Ability Modifiers',
    description: 'Uses ability modifier for attack/damage',
  },
} as const;

type PrimitiveKey = keyof typeof PRIMITIVES;

// =============================================================================
// Primitive Detection
// =============================================================================

type ItemData = {
  // Core modifiers
  changes?: unknown[];
  contextNotes?: unknown[];
  conditionalModifiers?: unknown[];

  // Combat
  attackBonus?: string;
  critConfirmBonus?: string;
  attackParts?: unknown[];
  attackNotes?: string;
  effectNotes?: string;

  // Defenses
  resistances?: unknown[];
  damageReduction?: unknown[];
  save?: { type?: string; description?: string; dc?: string };

  // Formulas
  formula?: string;
  damageFormula?: string;
  attackFormula?: string;

  // Actions & Activation
  specialActions?: unknown[];
  activation?: { type?: string; cost?: number };
  uses?: { value?: number; max?: number; maxFormula?: string; per?: string };
  recharge?: { enabled?: boolean; formula?: string };

  // Crafting & Requirements
  requirements?: string;
  enhIncreaseFormula?: string;

  // Spellcasting
  learnedAt?: { class?: unknown[]; domain?: unknown[] };
  ability?: { attack?: string; damage?: string };
};

type DetectedPrimitive = {
  key: PrimitiveKey;
  icon: string;
  details?: string;
};

function detectPrimitives(data: ItemData): DetectedPrimitive[] {
  const detected: DetectedPrimitive[] = [];

  // Changes
  if (data.changes && Array.isArray(data.changes) && data.changes.length > 0) {
    const details = data.changes
      .map((c) => {
        if (Array.isArray(c)) {
          // [value, target, subTarget, modifier]
          return `${c[0]} ${c[1]}.${c[2]} (${c[3]})`;
        }
        return JSON.stringify(c);
      })
      .join('; ');
    detected.push({ key: 'changes', icon: PRIMITIVES.changes.icon, details });
  }

  // Context Notes
  if (
    data.contextNotes &&
    Array.isArray(data.contextNotes) &&
    data.contextNotes.length > 0
  ) {
    const details = data.contextNotes
      .map((n) => {
        if (Array.isArray(n)) return n[0];
        return String(n);
      })
      .join('; ');
    detected.push({
      key: 'contextNotes',
      icon: PRIMITIVES.contextNotes.icon,
      details,
    });
  }

  // Resistances
  if (
    data.resistances &&
    Array.isArray(data.resistances) &&
    data.resistances.length > 0
  ) {
    const details = data.resistances
      .map((r) => {
        if (Array.isArray(r)) return `${r[1]?.replace('energy-', '')} ${r[0]}`;
        return String(r);
      })
      .join('; ');
    detected.push({
      key: 'resistances',
      icon: PRIMITIVES.resistances.icon,
      details,
    });
  }

  // Damage Reduction
  if (
    data.damageReduction &&
    Array.isArray(data.damageReduction) &&
    data.damageReduction.length > 0
  ) {
    const details = data.damageReduction
      .map((dr) => {
        if (Array.isArray(dr)) return `${dr[0]}/${dr[1]}`;
        return String(dr);
      })
      .join('; ');
    detected.push({
      key: 'damageReduction',
      icon: PRIMITIVES.damageReduction.icon,
      details,
    });
  }

  // Special Actions
  if (
    data.specialActions &&
    Array.isArray(data.specialActions) &&
    data.specialActions.length > 0
  ) {
    const details = data.specialActions
      .map((a) => (a as { name?: string }).name || 'action')
      .join('; ');
    detected.push({
      key: 'specialActions',
      icon: PRIMITIVES.specialActions.icon,
      details,
    });
  }

  // Effect Notes
  if (data.effectNotes && data.effectNotes.trim()) {
    detected.push({
      key: 'effectNotes',
      icon: PRIMITIVES.effectNotes.icon,
      details: data.effectNotes.trim().slice(0, 100),
    });
  }

  // Attack Notes
  if (data.attackNotes && data.attackNotes.trim()) {
    detected.push({
      key: 'attackNotes',
      icon: PRIMITIVES.attackNotes.icon,
      details: data.attackNotes.trim().slice(0, 100),
    });
  }

  // Requirements
  if (data.requirements && typeof data.requirements === 'string' && data.requirements.trim()) {
    detected.push({
      key: 'requirements',
      icon: PRIMITIVES.requirements.icon,
      details: data.requirements.trim().slice(0, 100),
    });
  }

  // Enhancement Formula
  if (data.enhIncreaseFormula) {
    detected.push({
      key: 'enhIncreaseFormula',
      icon: PRIMITIVES.enhIncreaseFormula.icon,
      details: `+${data.enhIncreaseFormula}`,
    });
  }

  // Save
  if (data.save && (data.save.type || data.save.description)) {
    const details =
      data.save.description?.trim() || data.save.type || 'has save';
    detected.push({
      key: 'save',
      icon: PRIMITIVES.save.icon,
      details: details.slice(0, 50),
    });
  }

  // Learned At (for spells)
  if (data.learnedAt) {
    const classes: string[] = [];
    if (data.learnedAt.class) {
      data.learnedAt.class.forEach((c) => {
        if (Array.isArray(c)) classes.push(`${c[0]} ${c[1]}`);
      });
    }
    if (data.learnedAt.domain) {
      data.learnedAt.domain.forEach((d) => {
        if (Array.isArray(d)) classes.push(`${d[0]} ${d[1]}`);
      });
    }
    if (classes.length > 0) {
      detected.push({
        key: 'learnedAt',
        icon: PRIMITIVES.learnedAt.icon,
        details: classes.join(', '),
      });
    }
  }

  // Conditional Modifiers
  if (
    data.conditionalModifiers &&
    Array.isArray(data.conditionalModifiers) &&
    data.conditionalModifiers.length > 0
  ) {
    detected.push({
      key: 'conditionalModifiers',
      icon: PRIMITIVES.conditionalModifiers.icon,
      details: `${data.conditionalModifiers.length} conditional modifiers`,
    });
  }

  // Attack Parts
  if (
    data.attackParts &&
    Array.isArray(data.attackParts) &&
    data.attackParts.length > 0
  ) {
    detected.push({
      key: 'attackParts',
      icon: PRIMITIVES.attackParts.icon,
      details: `${data.attackParts.length} damage parts`,
    });
  }

  // Ability Modifiers
  if (data.ability && (data.ability.attack || data.ability.damage)) {
    const parts = [];
    if (data.ability.attack) parts.push(`atk: ${data.ability.attack}`);
    if (data.ability.damage) parts.push(`dmg: ${data.ability.damage}`);
    detected.push({
      key: 'abilityModifiers',
      icon: PRIMITIVES.abilityModifiers.icon,
      details: parts.join(', '),
    });
  }

  // === NEW PRIMITIVES ===

  // Attack Bonus
  if (data.attackBonus && data.attackBonus.trim()) {
    detected.push({
      key: 'attackBonus',
      icon: PRIMITIVES.attackBonus.icon,
      details: data.attackBonus.trim(),
    });
  }

  // Crit Confirm Bonus
  if (data.critConfirmBonus && data.critConfirmBonus.trim()) {
    detected.push({
      key: 'critConfirmBonus',
      icon: PRIMITIVES.critConfirmBonus.icon,
      details: data.critConfirmBonus.trim(),
    });
  }

  // Formula (generic)
  if (data.formula && data.formula.trim()) {
    detected.push({
      key: 'formula',
      icon: PRIMITIVES.formula.icon,
      details: data.formula.trim().slice(0, 80),
    });
  }

  // Damage Formula
  if (data.damageFormula && data.damageFormula.trim()) {
    detected.push({
      key: 'damageFormula',
      icon: PRIMITIVES.damageFormula.icon,
      details: data.damageFormula.trim(),
    });
  }

  // Attack Formula
  if (data.attackFormula && data.attackFormula.trim()) {
    detected.push({
      key: 'attackFormula',
      icon: PRIMITIVES.attackFormula.icon,
      details: data.attackFormula.trim(),
    });
  }

  // Activation
  if (data.activation && data.activation.type && data.activation.type !== 'none') {
    const cost = data.activation.cost ? ` (${data.activation.cost})` : '';
    detected.push({
      key: 'activation',
      icon: PRIMITIVES.activation.icon,
      details: `${data.activation.type}${cost}`,
    });
  }

  // Uses
  if (data.uses && (data.uses.max || data.uses.maxFormula)) {
    const maxVal = data.uses.maxFormula || String(data.uses.max);
    const per = data.uses.per ? `/${data.uses.per}` : '';
    detected.push({
      key: 'uses',
      icon: PRIMITIVES.uses.icon,
      details: `${maxVal}${per}`,
    });
  }

  // Recharge
  if (data.recharge && data.recharge.enabled) {
    detected.push({
      key: 'recharge',
      icon: PRIMITIVES.recharge.icon,
      details: data.recharge.formula || 'enabled',
    });
  }

  return detected;
}

// =============================================================================
// Markdown Generation
// =============================================================================

type Item = {
  id: string;
  name: string;
  data?: ItemData;
};

function generateMarkdown(
  compendiumName: string,
  items: Item[],
  showDetails: boolean
): string {
  const title = compendiumName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  // Count primitives
  const primitiveCounts: Record<string, number> = {};
  for (const item of items) {
    const primitives = detectPrimitives(item.data || {});
    for (const p of primitives) {
      primitiveCounts[p.key] = (primitiveCounts[p.key] || 0) + 1;
    }
  }

  let md = `# ${title}\n\n`;
  md += `**Total:** ${items.length} items\n\n`;

  // Legend
  md += `## Legend\n\n`;
  md += `| Icon | Name | Count | Description |\n`;
  md += `|------|------|-------|-------------|\n`;
  for (const [key, info] of Object.entries(PRIMITIVES)) {
    const count = primitiveCounts[key] || 0;
    if (count > 0) {
      md += `| ${info.icon} | ${info.name} | ${count} | ${info.description} |\n`;
    }
  }
  md += `\n---\n\n`;

  // Items
  md += `## Items\n\n`;

  const sortedItems = [...items].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );

  for (const item of sortedItems) {
    const primitives = detectPrimitives(item.data || {});
    const tags = primitives.map((p) => p.icon);

    md += `- **${item.name || 'Unnamed'}**`;
    if (tags.length > 0) {
      md += ` ${tags.join(' ')}`;
    }
    md += `\n`;

    // Show details if enabled
    if (showDetails && primitives.length > 0) {
      for (const p of primitives) {
        if (p.details) {
          md += `  - ${PRIMITIVES[p.key].name}: ${p.details}\n`;
        }
      }
    }
  }

  return md;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('D35E Item List Generator');
  console.log('========================\n');
  console.log(`Details mode: ${SHOW_DETAILS ? 'ON' : 'OFF'}`);
  console.log(`(use --details flag to show primitive values)\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get all JSON files
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f: string) => f.endsWith('.json'));

  for (const file of files) {
    const compendiumName = file.replace('.json', '');
    const filePath = path.join(DATA_DIR, file);
    const items: Item[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (items.length === 0) continue;

    const markdown = generateMarkdown(compendiumName, items, SHOW_DETAILS);
    const outputPath = path.join(OUTPUT_DIR, `${compendiumName}.md`);

    fs.writeFileSync(outputPath, markdown, 'utf-8');
    console.log(`Created: ${compendiumName}.md (${items.length} items)`);
  }

  // Generate index
  const indexMd = generateIndex(files);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'INDEX.md'), indexMd, 'utf-8');
  console.log(`\nCreated: INDEX.md`);

  console.log(`\nOutput directory: ${OUTPUT_DIR}`);
}

function generateIndex(files: string[]): string {
  let md = `# D35E Compendium Index\n\n`;
  md += `**Generated:** ${new Date().toISOString().split('T')[0]}\n\n`;
  md += `## Legend\n\n`;
  md += `| Icon | Name | Description |\n`;
  md += `|------|------|-------------|\n`;
  for (const [, info] of Object.entries(PRIMITIVES)) {
    md += `| ${info.icon} | ${info.name} | ${info.description} |\n`;
  }
  md += `\n---\n\n`;
  md += `## Compendiums\n\n`;

  for (const file of files.sort()) {
    const name = file.replace('.json', '');
    const title = name
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    md += `- [${title}](./${name}.md)\n`;
  }

  return md;
}

main().catch(console.error);
