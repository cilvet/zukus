/**
 * Test Classes for CGE Visual Testing
 *
 * These classes are NOT part of the D&D 3.5 SRD.
 * They exist to test different CGE configurations and visual representations.
 *
 * Each class demonstrates a different CGE pattern:
 *
 * - Warblade (Tome of Battle): LIMITED_TOTAL + NONE + LIST GLOBAL (consume)
 *   Martial maneuvers that are readied and expended when used.
 *
 * - Psion (Expanded Psionics): LIMITED_TOTAL + POOL + NONE
 *   Power points pool where each power costs its level.
 *
 * - Warlock (Complete Arcane): LIMITED_TOTAL + NONE + NONE
 *   At-will invocations with no resource cost.
 *
 * - Spirit Shaman (Complete Divine): (no known) + SLOTS + LIST PER_LEVEL
 *   Retrieve spells per level, cast spontaneously within each level.
 *
 * - Arcanist (Pathfinder 1e): UNLIMITED + SLOTS + LIST PER_LEVEL
 *   Spellbook with per-level preparation, spontaneous within level.
 *
 * - Wizard5e (D&D 5e): UNLIMITED + SLOTS + LIST GLOBAL
 *   Spellbook with global preparation, any prepared spell with any slot.
 */

// Warblade - Martial maneuvers with readied/expended pattern
export { warbladeClass } from './warblade';
export {
  warbladeClassFeatures,
  warbladeManeuvers,
  warbladeBattleClarity,
} from './warblade';

// Psion - Power points pool
export { psionClass } from './psion';
export {
  psionClassFeatures,
  psionPowers,
  psionDiscipline,
} from './psion';

// Warlock - At-will invocations
export { warlockClass } from './warlock';
export {
  warlockClassFeatures,
  warlockInvocations,
  warlockEldritchBlast,
} from './warlock';

// Spirit Shaman - Retrieve per level, spontaneous within level
export { spiritShamanClass } from './spiritShaman';
export {
  spiritShamanClassFeatures,
  spiritShamanSpellcasting,
  spiritShamanSpiritGuide,
} from './spiritShaman';

// Arcanist - Spellbook + per-level preparation
export { arcanistClass } from './arcanist';
export {
  arcanistClassFeatures,
  arcanistSpellcasting,
  arcanistArcaneReservoir,
} from './arcanist';

// Wizard 5e - Spellbook + global preparation
export { wizard5eClass } from './wizard5e';
export {
  wizard5eClassFeatures,
  wizard5eSpellcasting,
  wizard5eArcaneRecovery,
} from './wizard5e';

// All test classes grouped
export const allTestClasses = [
  // Imports would need to be resolved at runtime
];

// All test class features grouped
export const allTestClassFeatures = [
  // Imports would need to be resolved at runtime
];
