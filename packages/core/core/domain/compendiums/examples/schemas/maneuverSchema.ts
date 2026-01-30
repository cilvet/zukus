/**
 * Maneuver Schema Definition
 *
 * For Tome of Battle martial maneuvers (Warblade, Crusader, Swordsage).
 * TEST SCHEMA - Not D&D 3.5 SRD
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const maneuverSchema: EntitySchemaDefinition = {
  typeName: 'maneuver',
  description: 'Tome of Battle martial maneuver',
  version: '1.0.0',
  addons: ['searchable', 'taggable'],

  fields: [
    {
      name: 'level',
      type: 'integer',
      description: 'Maneuver level (1-9)',
    },
    {
      name: 'discipline',
      type: 'enum',
      options: [
        { value: 'diamond-mind', name: 'Diamond Mind' },
        { value: 'iron-heart', name: 'Iron Heart' },
        { value: 'stone-dragon', name: 'Stone Dragon' },
        { value: 'tiger-claw', name: 'Tiger Claw' },
        { value: 'white-raven', name: 'White Raven' },
        { value: 'desert-wind', name: 'Desert Wind' },
        { value: 'devoted-spirit', name: 'Devoted Spirit' },
        { value: 'setting-sun', name: 'Setting Sun' },
        { value: 'shadow-hand', name: 'Shadow Hand' },
      ],
    },
    {
      name: 'type',
      type: 'enum',
      options: [
        { value: 'strike', name: 'Strike' },
        { value: 'boost', name: 'Boost' },
        { value: 'counter', name: 'Counter' },
        { value: 'stance', name: 'Stance' },
        { value: 'rush', name: 'Rush' },
      ],
    },
    {
      name: 'initiationAction',
      type: 'enum',
      optional: true,
      options: [
        { value: 'standard', name: 'Standard Action' },
        { value: 'full-round', name: 'Full-Round Action' },
        { value: 'swift', name: 'Swift Action' },
        { value: 'immediate', name: 'Immediate Action' },
      ],
    },
    {
      name: 'prerequisite',
      type: 'string',
      optional: true,
      description: 'Required maneuvers or conditions',
    },
  ],
};
