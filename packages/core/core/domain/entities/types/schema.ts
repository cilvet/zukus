import { EntityFieldDefinition } from './fields';

// Schema definition for a custom entity type
export type EntitySchemaDefinition = {
  typeName: string;
  description?: string;
  fields: EntityFieldDefinition[];
  /** IDs of addons to include (resolved from AddonRegistry) */
  addons?: string[];
  /** Version of the schema (semver format, e.g. "1.0.0") */
  version?: string;
};
