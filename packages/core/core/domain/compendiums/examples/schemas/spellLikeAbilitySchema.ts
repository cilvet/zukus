/**
 * Schema definition for D&D 3.5 Spell-Like Abilities (SLAs)
 *
 * Spell-like abilities are supernatural powers that mimic spells.
 * Races, monsters, and some class features grant SLAs.
 *
 * Key differences from spells:
 * - No components (usually)
 * - Uses per day tracked per-entity (not spell slots)
 * - Caster level is often based on HD or ECL, not class level
 * - Save DC is based on a specific ability (usually Charisma)
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const spellLikeAbilitySchema: EntitySchemaDefinition = {
  typeName: 'spellLikeAbility',
  description: 'D&D 3.5 Spell-Like Ability (racial, monster, or granted)',
  version: '1.0.0',
  addons: ['searchable', 'imageable', 'effectful'],
  fields: [
    {
      name: 'spellReference',
      type: 'reference',
      optional: true,
      referenceType: 'spell',
      description: 'Reference to the spell this SLA mimics (if any)',
    },
    {
      name: 'casterLevel',
      type: 'string',
      isFormula: true,
      description:
        'Caster level formula (e.g., "@totalHD", "@ecl", "5"). Determines duration, range, etc.',
    },
    {
      name: 'saveDCAbility',
      type: 'enum',
      optional: true,
      options: [
        { value: 'strength', name: 'Strength' },
        { value: 'dexterity', name: 'Dexterity' },
        { value: 'constitution', name: 'Constitution' },
        { value: 'intelligence', name: 'Intelligence' },
        { value: 'wisdom', name: 'Wisdom' },
        { value: 'charisma', name: 'Charisma' },
      ],
      description:
        'Ability score used for save DC calculation (10 + spell level + ability mod)',
    },
    {
      name: 'usesPerDay',
      type: 'integer',
      description: 'Uses per day. 0 = at-will',
    },
    {
      name: 'spellLevel',
      type: 'integer',
      optional: true,
      description: 'Equivalent spell level (for save DC calculation and dispel checks)',
    },
    {
      name: 'activation',
      type: 'enum',
      optional: true,
      options: [
        { value: 'standard', name: 'Standard Action' },
        { value: 'swift', name: 'Swift Action' },
        { value: 'move', name: 'Move Action' },
        { value: 'full-round', name: 'Full-Round Action' },
        { value: 'free', name: 'Free Action' },
        { value: 'immediate', name: 'Immediate Action' },
      ],
      description: 'Action required to activate (default: standard)',
    },
    {
      name: 'source',
      type: 'string',
      optional: true,
      description: 'Source of the SLA (e.g., "racial", "class", "template")',
    },
  ],
};
