/**
 * D&D 3.5 Example Compendium Context
 * 
 * This file composes the D&D 3.5 example compendium from modular sources.
 * 
 * Structure:
 * - Schemas: ./schemas/
 * - Entities: ./entities/
 * - Classes: srd/fighter/, srd/rogue/
 */

import { resolveCompendiumContext } from '../resolve';
import type { 
  Compendium, 
  CalculationContext, 
  CompendiumRegistry 
} from '../types';

// Schemas
import {
  spellSchema,
  featSchema,
  classFeatureSchema,
  classSchema,
  buffSchema,
  maneuverSchema,
  powerSchema,
  weaponSchema,
  armorSchema,
  shieldSchema,
  itemSchema,
  wondrousItemSchema,
  weaponPropertySchema,
  armorPropertySchema,
} from './schemas';
import { 
  systemLevelsSchemaDefinition, 
  characterAbilityIncreaseSchemaDefinition,
} from '../../levels/classSchemas/systemLevelsSchemas';

// Entities
import { allSpells, allFeats, allBuffs, allManeuvers, allPowers } from './entities';

// SRD Equipment from D35E Foundry data
import {
  srdWeapons,
  srdArmors,
  srdShields,
  srdItems,
  srdWondrousItems,
  srdWeaponProperties,
  srdArmorProperties,
} from '../../../../srd/equipment/d35e';

// Classes from SRD
import { fighterClass } from '../../../../srd/fighter/fighterClass';
import { rogueClass, rogueClassFeatures } from '../../../../srd/rogue';
import { clericClass, clericClassFeatures } from '../../../../srd/cleric';
import { druidClass, druidClassFeatures } from '../../../../srd/druid';
import { sorcererClass, sorcererClassFeatures } from '../../../../srd/sorcerer';
import { wizardClass, wizardClassFeatures } from '../../../../srd/wizard';

// Test Classes (for CGE visual testing - NOT D&D 3.5 SRD)
import { warbladeClass, warbladeClassFeatures } from '../../../../testClasses/warblade';
import { psionClass, psionClassFeatures } from '../../../../testClasses/psion';
import { warlockClass, warlockClassFeatures } from '../../../../testClasses/warlock';
import { spiritShamanClass, spiritShamanClassFeatures } from '../../../../testClasses/spiritShaman';
import { arcanistClass, arcanistClassFeatures } from '../../../../testClasses/arcanist';
import { wizard5eClass, wizard5eClassFeatures } from '../../../../testClasses/wizard5e';

// System levels from SRD
import { dnd35SystemLevels, allAbilityIncreases } from '../../../../srd/systemLevels';

// =============================================================================
// Compendium Definition
// =============================================================================

/**
 * D&D 3.5 Example Compendium
 *
 * Contains:
 * - Spells: 2,789 spells with class-level relations
 * - Feats: ~40 fighter bonus feats
 * - Classes: Fighter, Rogue, Cleric, Druid, Sorcerer, Wizard + Test Classes
 * - Class Features: Various class abilities
 * - Buffs: ~15 classic buff spells
 * - System Levels: D&D 3.5 feat/ability progression
 * - Ability Increases: 6 entities for +1 to each ability
 *
 * Equipment (from D35E Foundry data):
 * - Weapons: 80 weapons (simple, martial, exotic)
 * - Armors: 12 armors (light, medium, heavy)
 * - Shields: 6 shields (buckler, light, heavy, tower)
 * - Items: 124 generic items (adventuring gear)
 * - Wondrous Items: 581 magic items (rings, cloaks, belts, etc.)
 * - Weapon Properties: 47 (Flaming, Keen, Vorpal, etc.)
 * - Armor Properties: 31 (Fortification, Shadow, etc.)
 *
 * Test Classes (for CGE visual testing):
 * - Warblade: maneuvers with LIST GLOBAL + consumeOnUse
 * - Psion: powers with POOL resource
 * - Warlock: invocations at-will (NONE + NONE)
 * - Spirit Shaman: LIST PER_LEVEL preparation
 * - Arcanist: UNLIMITED + LIST PER_LEVEL
 * - Wizard5e: UNLIMITED + LIST GLOBAL
 */
const dnd35ExampleCompendium: Compendium = {
  id: 'dnd35-example',
  name: 'D&D 3.5 Example Compendium',
  version: '1.0.0',
  description: 'Example compendium for D&D 3.5 with spells, feats, buffs, classes, class features, and system-level progressions',
  dependencies: [],
  schemas: [
    spellSchema,
    featSchema,
    classSchema,
    classFeatureSchema,
    buffSchema,
    maneuverSchema,
    powerSchema,
    weaponSchema,
    armorSchema,
    shieldSchema,
    itemSchema,
    wondrousItemSchema,
    weaponPropertySchema,
    armorPropertySchema,
    systemLevelsSchemaDefinition,
    characterAbilityIncreaseSchemaDefinition,
  ],
  entities: {
    spell: allSpells,
    feat: allFeats,
    buff: allBuffs,
    maneuver: allManeuvers,
    power: allPowers,
    weapon: srdWeapons,
    armor: srdArmors,
    shield: srdShields,
    item: srdItems,
    wondrousItem: srdWondrousItems,
    weaponProperty: srdWeaponProperties,
    armorProperty: srdArmorProperties,
    class: [
      // D&D 3.5 SRD Classes
      fighterClass,
      rogueClass,
      clericClass,
      druidClass,
      sorcererClass,
      wizardClass,
      // Test Classes (for CGE visual testing)
      warbladeClass,
      psionClass,
      warlockClass,
      spiritShamanClass,
      arcanistClass,
      wizard5eClass,
    ],
    classFeature: [
      ...rogueClassFeatures,
      ...clericClassFeatures,
      ...druidClassFeatures,
      ...sorcererClassFeatures,
      ...wizardClassFeatures,
      // Test class features
      ...warbladeClassFeatures,
      ...psionClassFeatures,
      ...warlockClassFeatures,
      ...spiritShamanClassFeatures,
      ...arcanistClassFeatures,
      ...wizard5eClassFeatures,
    ],
    system_levels: [dnd35SystemLevels],
    character_ability_increase: allAbilityIncreases,
  },
};

// =============================================================================
// Context Creation
// =============================================================================

/**
 * Creates and resolves the example compendium context
 */
function createExampleCompendiumContext(): CalculationContext {
  const registry: CompendiumRegistry = {
    available: [
      { id: 'dnd35-example', name: 'D&D 3.5 Example Compendium' },
    ],
    active: ['dnd35-example'],
  };

  const loadCompendium = (id: string): Compendium | undefined => {
    if (id === 'dnd35-example') {
      return dnd35ExampleCompendium;
    }
    return undefined;
  };

  const resolvedContext = resolveCompendiumContext(registry, loadCompendium);

  return {
    compendiumContext: resolvedContext,
  };
}

// =============================================================================
// Exports
// =============================================================================

/**
 * Pre-resolved calculation context for D&D 3.5 example content
 * Use this in your applications for testing the custom entities system
 */
export const dnd35ExampleCalculationContext: CalculationContext = createExampleCompendiumContext();

/**
 * Export the compendium for reference
 */
export { dnd35ExampleCompendium };

/**
 * Re-export schemas for convenience
 */
export { spellSchema, featSchema, classSchema, classFeatureSchema, buffSchema };

/**
 * Re-export entities for convenience
 */
export { allSpells, allFeats, allBuffs };

// Keep legacy export for backwards compatibility
export { exampleSpells } from './entities';

/**
 * Re-export classes for convenience
 */
export { fighterClass, rogueClass, rogueClassFeatures };
export { clericClass, clericClassFeatures };
export { druidClass, druidClassFeatures };
export { sorcererClass, sorcererClassFeatures };
export { wizardClass, wizardClassFeatures };

/**
 * Re-export test classes for CGE visual testing
 */
export { warbladeClass, warbladeClassFeatures };
export { psionClass, psionClassFeatures };
export { warlockClass, warlockClassFeatures };
export { spiritShamanClass, spiritShamanClassFeatures };
export { arcanistClass, arcanistClassFeatures };
export { wizard5eClass, wizard5eClassFeatures };

/**
 * Re-export system levels for convenience
 */
export { dnd35SystemLevels, allAbilityIncreases };
