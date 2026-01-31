/**
 * Schema definition for D&D 3.5 Shields
 *
 * Shields provide protection and can be used as weapons.
 * Uses dnd35item addon for common item properties.
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const shieldSchema: EntitySchemaDefinition = {
  typeName: 'shield',
  description: 'D&D 3.5 Shield',
  version: '1.0.0',
  addons: ['searchable', 'imageable', 'dnd35item', 'effectful'],
  fields: [
    // Protection stats
    {
      name: 'shieldBonus',
      type: 'integer',
      description: 'Shield bonus to AC',
    },
    {
      name: 'maxDexBonus',
      type: 'integer',
      optional: true,
      description: 'Maximum Dexterity bonus allowed (if any)',
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

    // Classification
    {
      name: 'shieldType',
      type: 'string',
      description: 'Type (buckler, light, heavy, tower)',
    },

    // Shield bash stats (when used as weapon)
    {
      name: 'bashDamage',
      type: 'string',
      optional: true,
      description: 'Damage when used as weapon (e.g., "1d4")',
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
      description: 'Whether the shield is masterwork quality',
    },

    // Properties reference (e.g., bashing, animated)
    {
      name: 'properties',
      type: 'reference_array',
      optional: true,
      referenceType: 'shieldProperty',
      applyEffectsToParent: true,
      description: 'Magic properties applied to this shield',
    },
  ],
};
