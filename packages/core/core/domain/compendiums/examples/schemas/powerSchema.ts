/**
 * Power Schema Definition
 *
 * For D&D 3.5 psionic powers (Psion, Wilder, Psychic Warrior).
 * TEST SCHEMA - Not D&D 3.5 SRD
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const powerSchema: EntitySchemaDefinition = {
  typeName: 'power',
  description: 'Psionic power from the Expanded Psionics Handbook',
  version: '1.0.0',
  addons: ['searchable', 'imageable'],

  fields: [
    {
      name: 'level',
      type: 'integer',
      description: 'Power level (1-9)',
    },
    {
      name: 'discipline',
      type: 'enum',
      options: [
        { value: 'clairsentience', name: 'Clairsentience' },
        { value: 'metacreativity', name: 'Metacreativity' },
        { value: 'psychokinesis', name: 'Psychokinesis' },
        { value: 'psychometabolism', name: 'Psychometabolism' },
        { value: 'psychoportation', name: 'Psychoportation' },
        { value: 'telepathy', name: 'Telepathy' },
      ],
    },
    {
      name: 'subdiscipline',
      type: 'string',
      optional: true,
      description: 'Power subdiscipline (e.g., Charm, Compulsion)',
    },
    {
      name: 'descriptors',
      type: 'string_array',
      optional: true,
      description: 'Power descriptors (e.g., Mind-Affecting, Fire)',
    },
    {
      name: 'display',
      type: 'string_array',
      optional: true,
      description: 'Manifestation displays (Auditory, Material, Mental, Olfactory, Visual)',
    },
    {
      name: 'manifestingTime',
      type: 'string',
      optional: true,
      description: 'Time to manifest (e.g., 1 standard action)',
    },
    {
      name: 'range',
      type: 'string',
      optional: true,
      description: 'Power range (e.g., Close, Medium, Long)',
    },
    {
      name: 'target',
      type: 'string',
      optional: true,
      description: 'Power target',
    },
    {
      name: 'area',
      type: 'string',
      optional: true,
      description: 'Area of effect',
    },
    {
      name: 'effect',
      type: 'string',
      optional: true,
      description: 'Power effect',
    },
    {
      name: 'duration',
      type: 'string',
      optional: true,
      description: 'Power duration',
    },
    {
      name: 'savingThrow',
      type: 'string',
      optional: true,
      description: 'Saving throw allowed',
    },
    {
      name: 'powerResistance',
      type: 'string',
      optional: true,
      description: 'Power resistance applies (Yes/No)',
    },
    {
      name: 'powerPoints',
      type: 'integer',
      optional: true,
      description: 'Base power point cost',
    },
    {
      name: 'augment',
      type: 'string',
      optional: true,
      description: 'Augmentation options',
    },
  ],
};
