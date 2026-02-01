/**
 * D&D 3.5 Example Entities
 *
 * Exports all entities for the D&D 3.5 compendium.
 */

// Spells (legacy example spells)
export { exampleSpells } from './spells';

// Spells (full database with relation enrichment)
export {
  allSpells,
  getSpellcastingClasses,
  getSpellLevelsForClass,
  filterSpells,
  type EnrichedSpell,
} from './spells/index';

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

// Maneuvers (Tome of Battle - for Warblade CGE testing)
export {
  allManeuvers,
  getManeuverClasses,
  getManeuverLevelsForClass,
  filterManeuvers,
  type EnrichedManeuver,
  MANEUVER_CLASS_FIELD_CONFIG,
} from './maneuvers';

// Powers (Expanded Psionics Handbook - for Psion CGE testing)
export {
  allPowers,
  getPowerClasses,
  getPowerLevelsForClass,
  filterPowers,
  type EnrichedPower,
  POWER_CLASS_FIELD_CONFIG,
} from './powers';

// Classes are imported from srd/
// - Fighter: srd/fighter/fighterClass.ts
// - Rogue: srd/rogue/rogueClass.ts

// Class Features are imported from srd/
// - Rogue features: srd/rogue/rogueClassFeatures.ts

