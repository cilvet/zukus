/**
 * D&D 3.5 Schema Definitions
 *
 * Export all schemas used in the D&D 3.5 compendium.
 */

export { spellSchema } from './spellSchema';
export { featSchema } from './featSchema';
export { classFeatureSchema } from './classFeatureSchema';
export { buffSchema } from './buffSchema';

// Class schema is defined in srd/fighter/fighterClass.ts
// and re-exported here for convenience
export { classSchema } from '../../../../../srd/fighter/fighterClass';

