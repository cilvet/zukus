/**
 * Schema definition for D&D 3.5 Weapons
 *
 * Weapons are items that can be used for attack.
 * Uses dnd35item addon for common item properties.
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const weaponSchema: EntitySchemaDefinition = {
  typeName: 'weapon',
  description: 'D&D 3.5 Weapon',
  version: '1.0.0',
  addons: ['searchable', 'imageable', 'dnd35item', 'effectful'],
  fields: [
    // Combat stats
    {
      name: 'damageDice',
      type: 'string',
      description: 'Damage dice notation (e.g., "1d8", "2d6")',
    },
    {
      name: 'damageType',
      type: 'string',
      description: 'Damage type (slashing, piercing, bludgeoning)',
    },
    {
      name: 'critRange',
      type: 'integer',
      description: 'Critical threat range (e.g., 19 for 19-20)',
    },
    {
      name: 'critMultiplier',
      type: 'integer',
      description: 'Critical multiplier (e.g., 2 for x2)',
    },

    // Classification
    {
      name: 'weaponCategory',
      type: 'string',
      description: 'Category (simple, martial, exotic)',
    },
    {
      name: 'weaponType',
      type: 'string',
      description: 'Type (melee, ranged, thrown)',
    },
    {
      name: 'weightClass',
      type: 'string',
      optional: true,
      description: 'Weight class (light, one-handed, two-handed)',
    },

    // Special properties
    {
      name: 'finesse',
      type: 'boolean',
      optional: true,
      description: 'Can use Dex instead of Str for attack',
    },
    {
      name: 'reach',
      type: 'integer',
      optional: true,
      description: 'Reach in feet (if different from standard)',
    },
    {
      name: 'rangeIncrement',
      type: 'integer',
      optional: true,
      description: 'Range increment in feet for ranged/thrown weapons',
    },

    // Enhancement
    {
      name: 'enhancementBonus',
      type: 'integer',
      optional: true,
      description: 'Magic enhancement bonus (+1 to +5)',
    },
    {
      name: 'isMasterwork',
      type: 'boolean',
      optional: true,
      description: 'Whether the weapon is masterwork quality',
    },

    // Properties reference (e.g., keen, flaming)
    {
      name: 'properties',
      type: 'reference_array',
      optional: true,
      referenceType: 'weaponProperty',
      applyEffectsToParent: true,
      description: 'Magic properties applied to this weapon',
    },
  ],
};
