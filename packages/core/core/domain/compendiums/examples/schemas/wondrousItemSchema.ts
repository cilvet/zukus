/**
 * Schema definition for D&D 3.5 Wondrous Items
 *
 * Wondrous items are magical items that don't fit into other categories.
 * They provide various magical effects when worn or activated.
 * Uses dnd35item addon for common item properties.
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const wondrousItemSchema: EntitySchemaDefinition = {
  typeName: 'wondrousItem',
  description: 'D&D 3.5 Wondrous Item',
  version: '1.0.0',
  addons: ['searchable', 'imageable', 'dnd35item', 'effectful'],
  fields: [
    // Slot
    {
      name: 'itemSlot',
      type: 'string',
      description:
        'Body slot (head, eyes, neck, shoulders, chest, body, belt, wrists, hands, ring, feet, slotless)',
    },

    // Magic properties
    {
      name: 'aura',
      type: 'string',
      optional: true,
      description: 'Magic aura school and strength (e.g., "Moderate transmutation")',
    },
    {
      name: 'casterLevel',
      type: 'integer',
      optional: true,
      description: 'Caster level of the item',
    },

    // Activation
    {
      name: 'activationType',
      type: 'string',
      optional: true,
      description: 'How the item is activated (command, use, continuous)',
    },
    {
      name: 'charges',
      type: 'integer',
      optional: true,
      description: 'Number of charges if applicable',
    },
    {
      name: 'usesPerDay',
      type: 'integer',
      optional: true,
      description: 'Number of uses per day if limited',
    },
  ],
};
