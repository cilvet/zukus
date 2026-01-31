/**
 * Schema definition for Currency entities
 *
 * Currencies define the monetary system for a game.
 * Each currency has a conversion ratio to a base currency and a weight per unit.
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const currencySchema: EntitySchemaDefinition = {
  typeName: 'currency',
  description: 'Currency definition for monetary systems',
  version: '1.0.0',
  addons: ['searchable'],
  fields: [
    {
      name: 'abbreviation',
      type: 'string',
      description: 'Short abbreviation (e.g., gp, sp, cp)',
    },
    {
      name: 'conversionToBase',
      type: 'number',
      description: 'Conversion ratio to base currency (1 = base currency)',
    },
    {
      name: 'weightPerUnit',
      type: 'number',
      description: 'Weight per unit in pounds (D&D: 50 coins = 1 lb)',
    },
  ],
};
