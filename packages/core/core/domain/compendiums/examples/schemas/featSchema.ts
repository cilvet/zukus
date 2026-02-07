/**
 * Schema definition for D&D 3.5 Feats
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const featSchema: EntitySchemaDefinition = {
  typeName: 'feat',
  description: 'D&D 3.5 Feat',
  version: '1.0.0',
  addons: ['searchable', 'taggable'],
  fields: [
    {
      name: 'category',
      type: 'string',
      optional: true,
      translatable: true,
      description: 'Feat category (General, Combat, Metamagic, etc)',
    },
    {
      name: 'prerequisites',
      type: 'reference',
      optional: true,
      description: 'Required feats (references to other feats)',
      referenceType: 'feat',
    },
    {
      name: 'benefit',
      type: 'string',
      translatable: true,
      description: 'What the feat provides',
    },
    {
      name: 'normal',
      type: 'string',
      optional: true,
      translatable: true,
      description: 'Normal behavior without this feat',
    },
    {
      name: 'special',
      type: 'string',
      optional: true,
      translatable: true,
      description: 'Special notes about the feat',
    },
  ],
};

