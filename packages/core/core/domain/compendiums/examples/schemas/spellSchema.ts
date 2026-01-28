/**
 * Schema definition for D&D 3.5 Spells
 *
 * This schema matches the structure of the enriched spells loaded from
 * the external data source (spells.json) and enriched with class-level
 * relations via the relation system.
 *
 * Key differences from a "simple" spell schema:
 * - No `level` field: levels are per-class and stored in classData.classLevels
 * - `spellResistance` is a string (e.g., "Si", "No", "Si (inofensivo)")
 * - `classData` contains the enriched relation data
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const spellSchema: EntitySchemaDefinition = {
  typeName: 'spell',
  description: 'D&D 3.5 Spell (enriched with class-level relations)',
  version: '2.0.0',
  addons: ['searchable', 'imageable'],
  fields: [
    {
      name: 'school',
      type: 'string',
      description: 'Magic school (e.g., "abjuración", "evocación")',
    },
    {
      name: 'subschool',
      type: 'string',
      optional: true,
      description: 'Magic subschool',
    },
    {
      name: 'descriptors',
      type: 'string_array',
      optional: true,
      description: 'Spell descriptors (e.g., "fuerza", "fuego")',
    },
    {
      name: 'components',
      type: 'string_array',
      description: 'Spell components (V, S, M, F, FD, etc.)',
    },
    {
      name: 'castingTime',
      type: 'string',
      optional: true,
      description: 'Casting time (e.g., "1 acción estándar")',
    },
    {
      name: 'range',
      type: 'string',
      optional: true,
      description: 'Spell range (e.g., "Corto", "Medio", "0\'")',
    },
    {
      name: 'duration',
      type: 'string',
      optional: true,
      description: 'Spell duration (e.g., "1 minuto / NL")',
    },
    {
      name: 'area',
      type: 'string',
      optional: true,
      description: 'Area of effect',
    },
    {
      name: 'target',
      type: 'string',
      optional: true,
      description: 'Spell target',
    },
    {
      name: 'effect',
      type: 'string',
      optional: true,
      description: 'Spell effect description',
    },
    {
      name: 'savingThrow',
      type: 'string',
      optional: true,
      description: 'Saving throw (e.g., "Voluntad niega")',
    },
    {
      name: 'spellResistance',
      type: 'string',
      description: 'Spell resistance (e.g., "Si", "No", "Si (inofensivo)")',
    },
    {
      name: 'source',
      type: 'string',
      optional: true,
      description: 'Source book',
    },
    {
      name: 'originalName',
      type: 'string',
      optional: true,
      description: 'Original English name',
    },
    // Note: classData is added at runtime by the relation enrichment process
    // and is not part of the raw entity schema
  ],
};
