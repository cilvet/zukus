/**
 * Schema definition for D&D 3.5 Buffs
 *
 * Buffs are temporary effects that can be applied to characters,
 * typically from spells, potions, or other magical effects.
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const buffSchema: EntitySchemaDefinition = {
  typeName: 'buff',
  description: 'D&D 3.5 Buff (temporary effect from spells, potions, etc.)',
  version: '1.0.0',
  addons: ['searchable', 'taggable', 'effectful'],
  fields: [
    {
      name: 'category',
      type: 'string',
      optional: true,
      description: 'Buff category (Transmutation, Abjuration, etc.)',
    },
    {
      name: 'spellLevel',
      type: 'integer',
      optional: true,
      description: 'Spell level if this buff comes from a spell',
    },
    {
      name: 'duration',
      type: 'string',
      optional: true,
      description: 'Duration of the buff (e.g., "1 min/level")',
    },
  ],
};
