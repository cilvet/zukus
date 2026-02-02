/**
 * Schema definition for D&D 3.5 General Items
 *
 * Generic items that don't fit into other categories (weapons, armor, etc.)
 * Uses dnd35item addon for common item properties.
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const itemSchema: EntitySchemaDefinition = {
  typeName: 'item',
  description: 'D&D 3.5 General Item',
  version: '1.0.0',
  addons: ['searchable', 'imageable', 'taggable', 'dnd35item', 'stackable'],
  fields: [
    // No additional fields beyond the addons
    // Items are simple objects with weight, cost, etc. from dnd35item
  ],
};
