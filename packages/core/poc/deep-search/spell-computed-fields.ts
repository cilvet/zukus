/**
 * Computed Fields Configuration for Spell Entities
 * 
 * Defines the computed fields that are calculated from spell data using JMESPath
 */

import { ComputedFieldsConfig } from './computed-fields';

/**
 * Computed fields for spell entities
 * 
 * These fields are calculated from the raw spell data and are not stored directly.
 * All computations are done using pure JMESPath expressions.
 * 
 * - classes: Array of class names (e.g., ["wizard", "sorcerer"])
 * - classesWithLevels: Array of formatted strings (e.g., ["wizard 1", "sorcerer 1"])
 * - levels: Array of spell levels for each class (e.g., [1, 1])
 */
export const spellComputedFieldsConfig: ComputedFieldsConfig = {
  fields: [
    {
      name: 'classes',
      jmespathExpression: 'levels[*].class',
      description: 'List of class names that can cast this spell'
    },
    {
      name: 'classesWithLevels',
      jmespathExpression: 'levels[*].join(\' \', [class, to_string(level)])',
      description: 'List of classes with their spell levels (e.g., "wizard 1")'
    },
    {
      name: 'levels',
      jmespathExpression: 'levels[*].level',
      description: 'List of spell levels for each class'
    }
  ]
};

/**
 * Extended spell entity type with computed fields
 */
export type SpellWithComputedFields = {
  classes: string[];
  classesWithLevels: string[];
  levels: number[];
};

