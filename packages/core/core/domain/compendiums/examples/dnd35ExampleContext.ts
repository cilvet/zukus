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
} from './schemas';
import { 
  systemLevelsSchemaDefinition, 
  characterAbilityIncreaseSchemaDefinition,
} from '../../levels/classSchemas/systemLevelsSchemas';

// Entities
import { exampleSpells, allFeats, allBuffs } from './entities';

// Classes from SRD
import { fighterClass } from '../../../../srd/fighter/fighterClass';
import { rogueClass, rogueClassFeatures } from '../../../../srd/rogue';
import { clericClass, clericClassFeatures } from '../../../../srd/cleric';
import { druidClass, druidClassFeatures } from '../../../../srd/druid';

// System levels from SRD
import { dnd35SystemLevels, allAbilityIncreases } from '../../../../srd/systemLevels';

// =============================================================================
// Compendium Definition
// =============================================================================

/**
 * D&D 3.5 Example Compendium
 *
 * Contains:
 * - Spells: 10 example spells
 * - Feats: ~40 fighter bonus feats
 * - Classes: Fighter, Rogue, Cleric, Druid
 * - Class Features: Rogue, Cleric, and Druid abilities
 * - Buffs: ~15 classic buff spells
 * - System Levels: D&D 3.5 feat/ability progression
 * - Ability Increases: 6 entities for +1 to each ability
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
    systemLevelsSchemaDefinition,
    characterAbilityIncreaseSchemaDefinition,
  ],
  entities: {
    spell: exampleSpells,
    feat: allFeats,
    buff: allBuffs,
    class: [fighterClass, rogueClass, clericClass, druidClass],
    classFeature: [...rogueClassFeatures, ...clericClassFeatures, ...druidClassFeatures],
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
export { exampleSpells, allFeats, allBuffs };

/**
 * Re-export classes for convenience
 */
export { fighterClass, rogueClass, rogueClassFeatures };
export { clericClass, clericClassFeatures };
export { druidClass, druidClassFeatures };

/**
 * Re-export system levels for convenience
 */
export { dnd35SystemLevels, allAbilityIncreases };
