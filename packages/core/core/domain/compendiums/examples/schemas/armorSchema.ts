/**
 * Schema definition for D&D 3.5 Armor
 *
 * Armor provides protection and affects movement.
 * Uses dnd35item addon for common item properties.
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const armorSchema: EntitySchemaDefinition = {
  typeName: 'armor',
  description: 'D&D 3.5 Armor',
  version: '1.0.0',
  addons: ['searchable', 'imageable', 'dnd35item', 'effectful'],
  fields: [
    // Protection stats
    {
      name: 'armorBonus',
      type: 'integer',
      description: 'Base armor bonus to AC',
    },
    {
      name: 'maxDexBonus',
      type: 'integer',
      description: 'Maximum Dexterity bonus allowed',
    },
    {
      name: 'armorCheckPenalty',
      type: 'integer',
      description: 'Armor check penalty (usually negative)',
    },
    {
      name: 'arcaneSpellFailure',
      type: 'integer',
      description: 'Arcane spell failure chance percentage',
    },

    // Movement
    {
      name: 'speed30',
      type: 'integer',
      description: 'Speed when base is 30 ft',
    },
    {
      name: 'speed20',
      type: 'integer',
      description: 'Speed when base is 20 ft',
    },

    // Classification
    {
      name: 'armorType',
      type: 'string',
      description: 'Type (light, medium, heavy)',
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
      description: 'Whether the armor is masterwork quality',
    },

    // Properties reference (e.g., fortification, shadow)
    {
      name: 'properties',
      type: 'reference_array',
      optional: true,
      referenceType: 'armorProperty',
      applyEffectsToParent: true,
      description: 'Magic properties applied to this armor',
    },
  ],
};
