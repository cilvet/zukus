/**
 * D&D 3.5 Schema Definitions
 *
 * Export all schemas used in the D&D 3.5 compendium.
 */

export { spellSchema } from './spellSchema';
export { featSchema } from './featSchema';
export { classFeatureSchema } from './classFeatureSchema';
export { buffSchema } from './buffSchema';
export { maneuverSchema } from './maneuverSchema';
export { powerSchema } from './powerSchema';

// Equipment schemas
export { weaponSchema } from './weaponSchema';
export { armorSchema } from './armorSchema';
export { shieldSchema } from './shieldSchema';
export { itemSchema } from './itemSchema';
export { wondrousItemSchema } from './wondrousItemSchema';

// Magic property schemas
export { weaponPropertySchema } from './weaponPropertySchema';
export { armorPropertySchema } from './armorPropertySchema';

// Race schemas
export { raceSchema } from './raceSchema';
export { racialTraitSchema } from './racialTraitSchema';

// Spell-like ability schema
export { spellLikeAbilitySchema } from './spellLikeAbilitySchema';

// Class schema is defined in srd/fighter/fighterClass.ts
// and re-exported here for convenience
export { classSchema } from '../../../../../srd/fighter/fighterClass';

