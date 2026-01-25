/**
 * D&D 3.5 Example Entities
 *
 * Exports all entities for the D&D 3.5 compendium.
 */

// Spells
export { exampleSpells } from './spells';

// Feats
export {
  allFeats,
  generalFeats,
  weaponFeats,
  rangedFeats,
  twoWeaponFeats,
  maneuverFeats,
  unarmedFeats,
  mountedFeats,
  magicFeats,
} from './feats';

// Buffs
export {
  allBuffs,
  abilityBuffs,
  defenseBuffs,
  combatEnhancementBuffs,
  movementBuffs,
  saveBuffs,
} from './buffs';

// Classes are imported from srd/
// - Fighter: srd/fighter/fighterClass.ts
// - Rogue: srd/rogue/rogueClass.ts

// Class Features are imported from srd/
// - Rogue features: srd/rogue/rogueClassFeatures.ts

