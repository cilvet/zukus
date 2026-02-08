/**
 * Schema definition for D&D 3.5 Races
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const raceSchema: EntitySchemaDefinition = {
  typeName: 'race',
  description: 'D&D 3.5 Race',
  version: '1.0.0',
  addons: ['searchable', 'imageable', 'taggable', 'effectful'],
  fields: [
    {
      name: 'size',
      type: 'enum',
      description: 'Creature size category',
      options: [
        { value: 'FINE', name: 'Fine' },
        { value: 'DIMINUTIVE', name: 'Diminutive' },
        { value: 'TINY', name: 'Tiny' },
        { value: 'SMALL', name: 'Small' },
        { value: 'MEDIUM', name: 'Medium' },
        { value: 'LARGE', name: 'Large' },
        { value: 'HUGE', name: 'Huge' },
        { value: 'GARGANTUAN', name: 'Gargantuan' },
        { value: 'COLOSSAL', name: 'Colossal' },
      ],
    },
    {
      name: 'baseLandSpeed',
      type: 'integer',
      description: 'Base land speed in feet',
    },
    {
      name: 'baseSwimSpeed',
      type: 'integer',
      optional: true,
      description: 'Base swim speed in feet',
    },
    {
      name: 'baseFlySpeed',
      type: 'integer',
      optional: true,
      description: 'Base fly speed in feet',
    },
    {
      name: 'baseClimbSpeed',
      type: 'integer',
      optional: true,
      description: 'Base climb speed in feet',
    },
    {
      name: 'baseBurrowSpeed',
      type: 'integer',
      optional: true,
      description: 'Base burrow speed in feet',
    },
    {
      name: 'languages',
      type: 'string_array',
      description: 'Automatic languages',
    },
    {
      name: 'bonusLanguages',
      type: 'string_array',
      optional: true,
      description: 'Available bonus languages',
    },
    {
      name: 'levelAdjustment',
      type: 'integer',
      description: 'Level adjustment for ECL calculation (default 0)',
    },
    {
      name: 'racialHitDice',
      type: 'object',
      optional: true,
      description: 'Racial hit dice (for non-standard races)',
      objectFields: [
        { name: 'count', type: 'integer', description: 'Number of racial hit dice' },
        { name: 'hitDie', type: 'integer', description: 'Hit die size (d4, d6, d8, d10, d12)' },
        { name: 'type', type: 'string', description: 'Creature type for the hit dice (e.g., "outsider")' },
      ],
    },
    {
      name: 'favoredClass',
      type: 'string',
      optional: true,
      description: 'Favored class ID (or "any" for humans)',
    },
    {
      name: 'racialType',
      type: 'string',
      description: 'Creature type (e.g., "humanoid", "monstrous humanoid")',
    },
    {
      name: 'racialSubtypes',
      type: 'string_array',
      optional: true,
      description: 'Creature subtypes (e.g., ["elf", "human"])',
    },
    {
      name: 'levels',
      type: 'dataTable',
      description: 'Race levels data with providers (racial features, bonus feats, SLAs)',
      rowKey: {
        name: 'Level',
        startingNumber: 1,
        incremental: true,
      },
      columns: [
        {
          id: 'providers',
          name: 'Providers',
          type: 'entityProvider',
          allowMultiple: true,
          optional: true,
        },
      ],
    },
  ],
};
