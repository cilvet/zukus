/**
 * Schema definition for D&D 3.5 Spells
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const spellSchema: EntitySchemaDefinition = {
  typeName: 'spell',
  description: 'D&D 3.5 Spell',
  version: '1.0.0',
  addons: ['searchable', 'taggable'],
  fields: [
    {
      name: 'level',
      type: 'integer',
      description: 'Spell level (0-9)',
    },
    {
      name: 'school',
      type: 'string',
      description: 'Magic school (Escuela)',
    },
    {
      name: 'subschool',
      type: 'string',
      optional: true,
      description: 'Magic subschool (SubEscuela)',
    },
    {
      name: 'descriptors',
      type: 'string_array',
      optional: true,
      description: 'Spell descriptors (descriptores)',
    },
    {
      name: 'components',
      type: 'string_array',
      description: 'Spell components (V, S, M, F, FD, PX, etc)',
    },
    {
      name: 'castingTime',
      type: 'string',
      description: 'Casting time (tiempoLanzamiento)',
    },
    {
      name: 'range',
      type: 'string',
      description: 'Spell range (alcance)',
    },
    {
      name: 'duration',
      type: 'string',
      description: 'Spell duration (duracion)',
    },
    {
      name: 'area',
      type: 'string',
      optional: true,
      description: 'Area of effect (area)',
    },
    {
      name: 'target',
      type: 'string',
      optional: true,
      description: 'Target (objetivo)',
    },
    {
      name: 'effect',
      type: 'string',
      optional: true,
      description: 'Effect (efecto)',
    },
    {
      name: 'savingThrow',
      type: 'string',
      optional: true,
      description: 'Saving throw type (tiradaSalvacion)',
    },
    {
      name: 'spellResistance',
      type: 'boolean',
      description: 'Whether spell allows spell resistance (resistenciaConjuros)',
    },
    {
      name: 'classes',
      type: 'string_array',
      description: 'Classes that can cast this spell',
    },
    {
      name: 'manual',
      type: 'string',
      optional: true,
      description: 'Source book (manual)',
    },
    {
      name: 'originalName',
      type: 'string',
      optional: true,
      description: 'Original English name',
    },
    {
      name: 'shortdescription',
      type: 'string',
      optional: true,
      description: 'Short description',
    },
    {
      name: 'visualdescription',
      type: 'string',
      optional: true,
      description: 'Visual description',
    },
  ],
};

