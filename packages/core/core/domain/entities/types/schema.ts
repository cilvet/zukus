import { EntityFieldDefinition } from './fields';
import type { Effect } from '../../character/baseData/effects';

// Schema definition for a custom entity type
export type EntitySchemaDefinition = {
  typeName: string;
  description?: string;
  fields: EntityFieldDefinition[];
  /** IDs of addons to include (resolved from AddonRegistry) */
  addons?: string[];
  /** Version of the schema (semver format, e.g. "1.0.0") */
  version?: string;
  /**
   * Effects that are automatically added to all entities of this type.
   * These effects can use @entity.X placeholders to reference entity properties.
   * The CMS will copy these to the entity's `effects` field when creating instances.
   *
   * @example
   * // For a "buff" type with casterLevel field:
   * autoEffects: [{
   *   target: 'ac.naturalArmor',
   *   formula: 'min(2 + floor(@entity.casterLevel / 3), 5)',
   *   bonusType: 'ENHANCEMENT',
   * }]
   */
  autoEffects?: Effect[];
};
