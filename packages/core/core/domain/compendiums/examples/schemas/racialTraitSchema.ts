/**
 * Schema definition for D&D 3.5 Racial Traits
 *
 * Racial traits are the granted features of a race, such as
 * Darkvision, Stonecunning, Weapon Familiarity, etc.
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const racialTraitSchema: EntitySchemaDefinition = {
  typeName: 'racialTrait',
  description: 'D&D 3.5 Racial Trait',
  version: '1.0.0',
  addons: ['searchable', 'taggable', 'effectful', 'suppressing'],
  fields: [],
};
