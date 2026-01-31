/**
 * Schema definition for D&D 3.5 Armor/Shield Properties
 *
 * Properties that can be applied to armor or shields.
 * They use the effectful addon to apply effects to the parent item.
 * Examples: Fortification, Shadow, Slick, Spell Resistance, etc.
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const armorPropertySchema: EntitySchemaDefinition = {
  typeName: 'armorProperty',
  description: 'D&D 3.5 Armor/Shield Magic Property',
  version: '1.0.0',
  addons: ['searchable', 'effectful'],
  fields: [
    // Cost information
    {
      name: 'costType',
      type: 'string',
      description: 'How the property is priced: "bonus" (adds to enhancement bonus) or "flat" (fixed gold cost)',
    },
    {
      name: 'costBonus',
      type: 'integer',
      optional: true,
      description: 'Enhancement bonus equivalent (+1 to +5) for costType="bonus"',
    },
    {
      name: 'costGold',
      type: 'integer',
      optional: true,
      description: 'Fixed gold cost for costType="flat"',
    },

    // Magic requirements
    {
      name: 'casterLevel',
      type: 'integer',
      description: 'Minimum caster level to create this property',
    },
    {
      name: 'aura',
      type: 'string',
      description: 'Magic aura school and strength (e.g., "Abjuration (moderate)")',
    },

    // Applicability
    {
      name: 'appliesTo',
      type: 'string_array',
      optional: true,
      description: 'Item types this can be applied to: ["armor"], ["shield"], or ["armor", "shield"]',
    },
    {
      name: 'requiresArmorType',
      type: 'string_array',
      optional: true,
      description: 'Required armor types (e.g., ["light", "medium"] for some properties)',
    },
    {
      name: 'requiresEnhancement',
      type: 'integer',
      optional: true,
      description: 'Minimum enhancement bonus required on the armor/shield',
    },

    // Crafting
    {
      name: 'craftingPrerequisites',
      type: 'string_array',
      optional: true,
      description: 'Spells or feats required to craft this property',
    },
  ],
};

/**
 * Shield properties use the same schema as armor properties.
 * This alias provides semantic clarity when working specifically with shields.
 */
export const shieldPropertySchema = armorPropertySchema;
