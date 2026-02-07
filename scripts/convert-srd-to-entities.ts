#!/usr/bin/env bun
/**
 * Script para convertir los items SRD legacy al formato StandardEntity
 * y asignarles imágenes estáticamente.
 *
 * Uso: bun scripts/convert-srd-to-entities.ts
 */

import { getItemIconByName } from '../packages/core/srd/equipment/itemImageService';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Returns the relative image path for an item.
 * EntityImage will prepend the base URL at render time.
 */
function getImagePath(itemName: string): string {
  return getItemIconByName(itemName);
}

// =============================================================================
// Import legacy data
// =============================================================================

import {
  allSrdWeapons,
  allSrdArmor,
  allSrdShields,
  allSrdGoods,
} from '../packages/core/srd/equipment/generated';

// =============================================================================
// Conversion functions
// =============================================================================

type StandardEntity = {
  id: string;
  entityType: string;
  name: string;
  description?: string;
  image?: string;
  weight?: number;
  cost?: { amount: number; currency: string };
  [key: string]: unknown;
};

function convertWeapon(weapon: any): StandardEntity {
  return {
    id: weapon.uniqueId,
    entityType: 'weapon',
    name: weapon.name,
    description: weapon.description || undefined,
    image: getImagePath(weapon.name),
    weight: weapon.weight,
    cost: weapon.cost ? { amount: weapon.cost, currency: 'gp' } : undefined,
    // Weapon-specific fields
    damageDice: weapon.damageDice,
    damageType: weapon.damageType?.damageType || 'bludgeoning',
    critRange: weapon.baseCritRange || 20,
    critMultiplier: weapon.baseCritMultiplier || 2,
    weaponCategory: weapon.proficiencyType || 'simple',
    weaponType: weapon.weaponAttackType || 'melee',
    weightClass: weapon.twoHanded ? 'two-handed' : 'one-handed',
    finesse: weapon.finesse || false,
    rangeIncrement: weapon.thrownRange || weapon.rangeIncrement,
    isMasterwork: weapon.isMasterwork || false,
  };
}

function convertArmor(armor: any): StandardEntity {
  // Determine armor type based on max dex bonus
  let armorType = 'light';
  if (armor.maxDexBonus <= 2) {
    armorType = 'heavy';
  } else if (armor.maxDexBonus <= 4) {
    armorType = 'medium';
  }

  return {
    id: armor.uniqueId,
    entityType: 'armor',
    name: armor.name,
    description: armor.description !== armor.name ? armor.description : undefined,
    image: getImagePath(armor.name),
    weight: armor.weight,
    cost: armor.cost ? { amount: armor.cost, currency: 'gp' } : undefined,
    // Armor-specific fields
    armorBonus: armor.baseArmorBonus,
    maxDexBonus: armor.maxDexBonus,
    armorCheckPenalty: armor.armorCheckPenalty,
    arcaneSpellFailure: armor.arcaneSpellFailureChance,
    speed30: armor.speed30,
    speed20: armor.speed20,
    armorType,
    enhancementBonus: armor.enhancementBonus || undefined,
    isMasterwork: armor.isMasterwork || false,
  };
}

function convertShield(shield: any): StandardEntity {
  // Determine shield type
  let shieldType = 'light';
  if (shield.name.toLowerCase().includes('tower')) {
    shieldType = 'tower';
  } else if (shield.name.toLowerCase().includes('heavy')) {
    shieldType = 'heavy';
  } else if (shield.name.toLowerCase().includes('buckler')) {
    shieldType = 'buckler';
  }

  return {
    id: shield.uniqueId,
    entityType: 'shield',
    name: shield.name,
    description: shield.description !== shield.name ? shield.description : undefined,
    image: getImagePath(shield.name),
    weight: shield.weight,
    cost: shield.cost ? { amount: shield.cost, currency: 'gp' } : undefined,
    // Shield-specific fields
    shieldBonus: shield.baseShieldBonus,
    armorCheckPenalty: shield.armorCheckPenalty,
    arcaneSpellFailure: shield.arcaneSpellFailureChance,
    shieldType,
    enhancementBonus: shield.enhancementBonus || undefined,
    isMasterwork: shield.isMasterwork || false,
  };
}

function convertGood(good: any): StandardEntity {
  return {
    id: good.uniqueId,
    entityType: 'item',
    name: good.name,
    description: good.description || undefined,
    image: getImagePath(good.name),
    weight: good.weight,
    cost: good.cost ? { amount: good.cost, currency: 'gp' } : undefined,
  };
}

// =============================================================================
// Generate output
// =============================================================================

function generateEntityFile(
  entities: StandardEntity[],
  entityType: string,
  variableName: string
): string {
  const header = `/**
 * SRD ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}s as StandardEntity
 *
 * Generado automaticamente por convert-srd-to-entities.ts
 * Las imagenes estan asignadas estaticamente.
 */

import type { StandardEntity } from '../../../core/domain/entities/types/base';

export const ${variableName}: StandardEntity[] = `;

  const json = JSON.stringify(entities, null, 2)
    // Clean up undefined values
    .replace(/: undefined,?\n/g, '')
    .replace(/,\n(\s*)\}/g, '\n$1}');

  return header + json + ';\n';
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('Converting SRD items to StandardEntity format...\n');

  // Convert all items
  const weapons = allSrdWeapons.map(convertWeapon);
  const armors = allSrdArmor.map(convertArmor);
  const shields = allSrdShields.map(convertShield);
  const goods = allSrdGoods.map(convertGood);

  console.log(`Converted ${weapons.length} weapons`);
  console.log(`Converted ${armors.length} armors`);
  console.log(`Converted ${shields.length} shields`);
  console.log(`Converted ${goods.length} goods`);

  // Output directory
  const outputDir = path.join(__dirname, '../packages/core/srd/equipment/entities');

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write files
  fs.writeFileSync(
    path.join(outputDir, 'srdWeapons.ts'),
    generateEntityFile(weapons, 'weapon', 'srdWeapons')
  );
  console.log('Wrote srdWeapons.ts');

  fs.writeFileSync(
    path.join(outputDir, 'srdArmor.ts'),
    generateEntityFile(armors, 'armor', 'srdArmor')
  );
  console.log('Wrote srdArmor.ts');

  fs.writeFileSync(
    path.join(outputDir, 'srdShields.ts'),
    generateEntityFile(shields, 'shield', 'srdShields')
  );
  console.log('Wrote srdShields.ts');

  fs.writeFileSync(
    path.join(outputDir, 'srdItems.ts'),
    generateEntityFile(goods, 'item', 'srdItems')
  );
  console.log('Wrote srdItems.ts');

  // Write index file
  const indexContent = `/**
 * SRD Equipment as StandardEntity
 *
 * Generado automaticamente por convert-srd-to-entities.ts
 */

export { srdWeapons } from './srdWeapons';
export { srdArmor } from './srdArmor';
export { srdShields } from './srdShields';
export { srdItems } from './srdItems';

import { srdWeapons } from './srdWeapons';
import { srdArmor } from './srdArmor';
import { srdShields } from './srdShields';
import { srdItems } from './srdItems';

export const allSrdEntities = [
  ...srdWeapons,
  ...srdArmor,
  ...srdShields,
  ...srdItems,
];
`;

  fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent);
  console.log('Wrote index.ts');

  console.log(`\nDone! Output written to ${outputDir}`);
  console.log('\nNext steps:');
  console.log('1. Import these entities in dnd35ExampleContext.ts');
  console.log('2. Replace the manual items.ts with these SRD entities');
}

main().catch(console.error);
