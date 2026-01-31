/**
 * Schema definition for D&D 3.5 Weapon Properties
 *
 * Weapon properties are magic enhancements that can be applied to weapons.
 * They use the effectful addon to apply effects to the parent weapon.
 * Examples: Keen, Flaming, Frost, Vorpal, Holy, etc.
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const weaponPropertySchema: EntitySchemaDefinition = {
  typeName: 'weaponProperty',
  description: 'D&D 3.5 Weapon Magic Property',
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
      description: 'Magic aura school and strength (e.g., "Transmutation (moderate)")',
    },

    // Requirements
    {
      name: 'requiresDamageType',
      type: 'string_array',
      optional: true,
      description: 'Damage types required (e.g., ["slashing", "piercing"] for Keen)',
    },
    {
      name: 'requiresEnhancement',
      type: 'integer',
      optional: true,
      description: 'Minimum enhancement bonus required on the weapon',
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
