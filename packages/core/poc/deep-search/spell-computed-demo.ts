/**
 * Demo: Computed Fields for Spell Entities
 * 
 * This demonstrates how to use JMESPath-based computed fields to derive
 * properties from spell entities without storing them in the raw data.
 */

import { applyComputedFields, applyComputedFieldsToMany } from './computed-fields';
import { spellComputedFieldsConfig } from './spell-computed-fields';

// Sample spell data for demo
const sampleSpells = [
  {
    id: 'magic-missile',
    name: 'Magic Missile',
    type: 'spell',
    levels: [
      { class: 'wizard', level: 1 },
      { class: 'sorcerer', level: 1 }
    ]
  },
  {
    id: 'cure-light-wounds',
    name: 'Cure Light Wounds',
    type: 'spell',
    levels: [
      { class: 'cleric', level: 1 },
      { class: 'druid', level: 1 },
      { class: 'paladin', level: 1 },
      { class: 'ranger', level: 2 }
    ]
  },
  {
    id: 'fireball',
    name: 'Fireball',
    type: 'spell',
    levels: [
      { class: 'wizard', level: 3 },
      { class: 'sorcerer', level: 3 }
    ]
  }
];

console.log('=== Spell Computed Fields Demo ===\n');

// Example 1: Apply computed fields to a single spell
console.log('1. Single Spell with Computed Fields:\n');
const magicMissile = sampleSpells[0];
const enrichedMagicMissile = applyComputedFields(magicMissile, spellComputedFieldsConfig);

console.log(`Spell: ${enrichedMagicMissile.name}`);
console.log(`  Raw data - levels:`, enrichedMagicMissile.levels);
console.log(`  Computed - classes:`, enrichedMagicMissile.classes);
console.log(`  Computed - classesWithLevels:`, enrichedMagicMissile.classesWithLevels);
console.log(`  Computed - levels:`, enrichedMagicMissile.levels_computed ?? enrichedMagicMissile.levels);
console.log('');

// Example 2: Apply computed fields to all spells
console.log('2. All Spells with Computed Fields:\n');
const enrichedSpells = applyComputedFieldsToMany(sampleSpells, spellComputedFieldsConfig);

enrichedSpells.forEach((spell) => {
  console.log(`${spell.name}:`);
  console.log(`  Classes: ${spell.classes.join(', ')}`);
  console.log(`  Classes with Levels: ${spell.classesWithLevels.join(', ')}`);
  console.log(`  Levels only: [${spell.levels.join(', ')}]`);
  console.log('');
});

// Example 3: Filter using computed fields
console.log('3. Filtering Using Computed Fields:\n');

// Find spells available to wizard
const wizardSpells = enrichedSpells.filter((spell) => 
  spell.classes.includes('wizard')
);
console.log(`Wizard spells (${wizardSpells.length}):`);
wizardSpells.forEach((spell) => {
  console.log(`  - ${spell.name}`);
});
console.log('');

// Find spells available to multiple classes (3+)
const multiClassSpells = enrichedSpells.filter((spell) => 
  spell.classes.length >= 3
);
console.log(`Multi-class spells (3+ classes) (${multiClassSpells.length}):`);
multiClassSpells.forEach((spell) => {
  console.log(`  - ${spell.name}: ${spell.classesWithLevels.join(', ')}`);
});
console.log('');

// Find level 1 spells
const level1Spells = enrichedSpells.filter((spell) => {
  const computedLevels = spell.levels as unknown as number[];
  return computedLevels.includes(1);
});
console.log(`Level 1 spells (${level1Spells.length}):`);
level1Spells.forEach((spell) => {
  console.log(`  - ${spell.name}`);
});
console.log('');

// Example 4: Demonstrate performance with computed fields
console.log('4. Performance Demo:\n');

const startTime = performance.now();
const largeSet = applyComputedFieldsToMany(
  Array(100).fill(sampleSpells).flat(),
  spellComputedFieldsConfig
);
const endTime = performance.now();

console.log(`Processed ${largeSet.length} spells in ${(endTime - startTime).toFixed(2)}ms`);
console.log(`Average per spell: ${((endTime - startTime) / largeSet.length).toFixed(3)}ms`);
console.log('');

// Example 5: Show the difference between raw and computed
console.log('5. Raw vs Computed Data:\n');
const cureLight = sampleSpells[1];
const enrichedCure = applyComputedFields(cureLight, spellComputedFieldsConfig);

console.log('Raw spell data (stored):');
console.log(JSON.stringify({
  name: cureLight.name,
  levels: cureLight.levels
}, null, 2));

console.log('\nWith computed fields (derived):');
console.log(JSON.stringify({
  name: enrichedCure.name,
  levels: enrichedCure.levels,
  classes: enrichedCure.classes,
  classesWithLevels: enrichedCure.classesWithLevels
}, null, 2));

