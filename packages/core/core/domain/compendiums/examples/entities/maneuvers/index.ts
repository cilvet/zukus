/**
 * Example Maneuvers for Tome of Battle
 *
 * TEST ENTITIES - Not D&D 3.5 SRD
 *
 * Disciplines available to Warblade:
 * - Diamond Mind: Focus and precision
 * - Iron Heart: Weapon mastery
 * - Stone Dragon: Strength and earth
 * - Tiger Claw: Savage ferocity
 * - White Raven: Leadership and tactics
 */

import type { StandardEntity, RelationFieldConfig } from '../../../../entities/types/base'
import {
  buildRelationIndex,
  enrichEntitiesWithRelations,
  type RelationEntity,
  type RelationFieldDef,
} from '../../../../entities/relations/compiler'

// Import raw relations
import rawRelations from '../../../../entities/relations/__testdata__/maneuver-class-relations.json'

// =============================================================================
// Types
// =============================================================================

/**
 * Raw maneuver entity in the compendium (before enrichment)
 */
type ManeuverEntity = StandardEntity & {
  level: number
  discipline: string
  type: string
  initiationAction?: string
  prerequisite?: string
}

/**
 * Enriched maneuver with class-level data (after enrichment)
 */
export type EnrichedManeuver = ManeuverEntity & {
  classData: {
    relations: Array<{ targetId: string; metadata: { level: number } }>
    classLevelKeys: string[]
    classLevels: Record<string, number>
  }
}

// =============================================================================
// Configuration
// =============================================================================

/**
 * Configuration for maneuver-class relation field
 */
const MANEUVER_CLASS_FIELD_CONFIG: RelationFieldConfig = {
  relationType: 'maneuver-class-relation',
  targetEntityType: 'class',
  metadataFields: [{ name: 'level', type: 'integer', required: true }],
  compile: {
    keyFormat: '{targetId}:{metadata.level}',
    keysFieldName: 'classLevelKeys',
    mapFieldName: 'classLevels',
    mapValueField: 'level',
  },
}

const RELATION_FIELD_DEF: RelationFieldDef = {
  fieldName: 'classData',
  config: MANEUVER_CLASS_FIELD_CONFIG,
}

// =============================================================================
// DIAMOND MIND - Focus and Precision
// =============================================================================

const sapphireNightmareBlade: ManeuverEntity = {
  id: 'sapphire-nightmare-blade',
  entityType: 'maneuver',
  name: 'Sapphire Nightmare Blade',
  description: 'You make a Concentration check as part of this strike. If the result exceeds the target\'s AC, the attack is treated as a touch attack.',
  level: 1,
  discipline: 'diamond-mind',
  type: 'strike',
  initiationAction: 'standard',
};

const momentOfPerfectMind: ManeuverEntity = {
  id: 'moment-of-perfect-mind',
  entityType: 'maneuver',
  name: 'Moment of Perfect Mind',
  description: 'You use your Concentration check in place of a Will save.',
  level: 1,
  discipline: 'diamond-mind',
  type: 'counter',
  initiationAction: 'immediate',
};

const mindOverBody: ManeuverEntity = {
  id: 'mind-over-body',
  entityType: 'maneuver',
  name: 'Mind Over Body',
  description: 'You use your Concentration check in place of a Fortitude save.',
  level: 3,
  discipline: 'diamond-mind',
  type: 'counter',
  initiationAction: 'immediate',
  prerequisite: 'One Diamond Mind maneuver',
};

const rubyNightmareBlade: ManeuverEntity = {
  id: 'ruby-nightmare-blade',
  entityType: 'maneuver',
  name: 'Ruby Nightmare Blade',
  description: 'Make a Concentration check. If it exceeds the target\'s AC, you deal an extra 2d6 damage.',
  level: 4,
  discipline: 'diamond-mind',
  type: 'strike',
  initiationAction: 'standard',
  prerequisite: 'Two Diamond Mind maneuvers',
};

const diamondDefense: ManeuverEntity = {
  id: 'diamond-defense',
  entityType: 'maneuver',
  name: 'Diamond Defense',
  description: 'Use Concentration check in place of any save.',
  level: 8,
  discipline: 'diamond-mind',
  type: 'counter',
  initiationAction: 'immediate',
  prerequisite: 'Three Diamond Mind maneuvers',
};

// =============================================================================
// IRON HEART - Weapon Mastery
// =============================================================================

const steelWind: ManeuverEntity = {
  id: 'steel-wind',
  entityType: 'maneuver',
  name: 'Steel Wind',
  description: 'Make two melee attacks, each against a different opponent.',
  level: 1,
  discipline: 'iron-heart',
  type: 'strike',
  initiationAction: 'standard',
};

const punishingStance: ManeuverEntity = {
  id: 'punishing-stance',
  entityType: 'maneuver',
  name: 'Punishing Stance',
  description: 'You deal an extra 1d6 points of damage with all melee attacks while in this stance, but take a -2 penalty to AC.',
  level: 1,
  discipline: 'iron-heart',
  type: 'stance',
  initiationAction: 'swift',
};

const wallOfBlades: ManeuverEntity = {
  id: 'wall-of-blades',
  entityType: 'maneuver',
  name: 'Wall of Blades',
  description: 'Use an attack roll in place of your AC against one attack.',
  level: 2,
  discipline: 'iron-heart',
  type: 'counter',
  initiationAction: 'immediate',
  prerequisite: 'One Iron Heart maneuver',
};

const ironHeartSurge: ManeuverEntity = {
  id: 'iron-heart-surge',
  entityType: 'maneuver',
  name: 'Iron Heart Surge',
  description: 'End one spell, effect, or condition currently affecting you.',
  level: 3,
  discipline: 'iron-heart',
  type: 'boost',
  initiationAction: 'standard',
  prerequisite: 'One Iron Heart maneuver',
};

const lightningRecovery: ManeuverEntity = {
  id: 'lightning-recovery',
  entityType: 'maneuver',
  name: 'Lightning Recovery',
  description: 'If you miss with a melee attack, you can reroll it.',
  level: 4,
  discipline: 'iron-heart',
  type: 'counter',
  initiationAction: 'immediate',
  prerequisite: 'Two Iron Heart maneuvers',
};

const adamantineHurricane: ManeuverEntity = {
  id: 'adamantine-hurricane',
  entityType: 'maneuver',
  name: 'Adamantine Hurricane',
  description: 'Make one melee attack against each opponent within reach.',
  level: 8,
  discipline: 'iron-heart',
  type: 'strike',
  initiationAction: 'full-round',
  prerequisite: 'Three Iron Heart maneuvers',
};

// =============================================================================
// STONE DRAGON - Strength and Earth
// =============================================================================

const stoneBones: ManeuverEntity = {
  id: 'stone-bones',
  entityType: 'maneuver',
  name: 'Stone Bones',
  description: 'Gain DR 5/adamantine until the start of your next turn.',
  level: 1,
  discipline: 'stone-dragon',
  type: 'strike',
  initiationAction: 'standard',
};

const stonefoot: ManeuverEntity = {
  id: 'stonefoot-stance',
  entityType: 'maneuver',
  name: 'Stonefoot Stance',
  description: 'Gain +2 bonus on Strength checks and +2 to AC against larger opponents.',
  level: 1,
  discipline: 'stone-dragon',
  type: 'stance',
  initiationAction: 'swift',
};

const mountainHammer: ManeuverEntity = {
  id: 'mountain-hammer',
  entityType: 'maneuver',
  name: 'Mountain Hammer',
  description: 'Deal +2d6 damage and overcome damage reduction and hardness.',
  level: 2,
  discipline: 'stone-dragon',
  type: 'strike',
  initiationAction: 'standard',
  prerequisite: 'One Stone Dragon maneuver',
};

const bonesplittingStrike: ManeuverEntity = {
  id: 'bonesplitting-strike',
  entityType: 'maneuver',
  name: 'Bonesplitting Strike',
  description: 'Deal +4d6 damage and impose -4 penalty to target\'s Strength and Constitution.',
  level: 4,
  discipline: 'stone-dragon',
  type: 'strike',
  initiationAction: 'standard',
  prerequisite: 'Two Stone Dragon maneuvers',
};

const earthstrikeQuake: ManeuverEntity = {
  id: 'earthstrike-quake',
  entityType: 'maneuver',
  name: 'Earthstrike Quake',
  description: 'All creatures within 20 feet must make Reflex saves or fall prone.',
  level: 8,
  discipline: 'stone-dragon',
  type: 'strike',
  initiationAction: 'standard',
  prerequisite: 'Three Stone Dragon maneuvers',
};

// =============================================================================
// TIGER CLAW - Savage Ferocity
// =============================================================================

const suddenLeap: ManeuverEntity = {
  id: 'sudden-leap',
  entityType: 'maneuver',
  name: 'Sudden Leap',
  description: 'Make a Jump check as a swift action and move that distance.',
  level: 1,
  discipline: 'tiger-claw',
  type: 'boost',
  initiationAction: 'swift',
};

const huntersSense: ManeuverEntity = {
  id: 'hunters-sense',
  entityType: 'maneuver',
  name: 'Hunter\'s Sense',
  description: 'Gain scent ability while in this stance.',
  level: 1,
  discipline: 'tiger-claw',
  type: 'stance',
  initiationAction: 'swift',
};

const clawAtTheMoon: ManeuverEntity = {
  id: 'claw-at-the-moon',
  entityType: 'maneuver',
  name: 'Claw at the Moon',
  description: 'Make a Jump check and attack an opponent at the apex of your jump.',
  level: 2,
  discipline: 'tiger-claw',
  type: 'strike',
  initiationAction: 'standard',
  prerequisite: 'One Tiger Claw maneuver',
};

const rabidWolfStrike: ManeuverEntity = {
  id: 'rabid-wolf-strike',
  entityType: 'maneuver',
  name: 'Rabid Wolf Strike',
  description: 'Deal +4d6 damage but provoke attacks of opportunity.',
  level: 4,
  discipline: 'tiger-claw',
  type: 'strike',
  initiationAction: 'standard',
  prerequisite: 'Two Tiger Claw maneuvers',
};

const wolfpackTactics: ManeuverEntity = {
  id: 'wolfpack-tactics',
  entityType: 'maneuver',
  name: 'Wolfpack Tactics',
  description: 'Move up to your speed without provoking attacks of opportunity. Allies gain +4 to attack.',
  level: 7,
  discipline: 'tiger-claw',
  type: 'strike',
  initiationAction: 'standard',
  prerequisite: 'Three Tiger Claw maneuvers',
};

// =============================================================================
// WHITE RAVEN - Leadership and Tactics
// =============================================================================

const leadingTheAttack: ManeuverEntity = {
  id: 'leading-the-attack',
  entityType: 'maneuver',
  name: 'Leading the Attack',
  description: 'If you hit, all allies gain +4 bonus on attack rolls against that opponent until your next turn.',
  level: 1,
  discipline: 'white-raven',
  type: 'strike',
  initiationAction: 'standard',
};

const bolsteringVoice: ManeuverEntity = {
  id: 'bolstering-voice',
  entityType: 'maneuver',
  name: 'Bolstering Voice',
  description: 'Allies within 60 feet gain +2 morale bonus on Will saves while in this stance.',
  level: 1,
  discipline: 'white-raven',
  type: 'stance',
  initiationAction: 'swift',
};

const battleLeaderCharge: ManeuverEntity = {
  id: 'battle-leader-charge',
  entityType: 'maneuver',
  name: 'Battle Leader\'s Charge',
  description: 'Charge and allow all allies to charge as immediate actions.',
  level: 2,
  discipline: 'white-raven',
  type: 'strike',
  initiationAction: 'full-round',
  prerequisite: 'One White Raven maneuver',
};

const tacticalStrike: ManeuverEntity = {
  id: 'tactical-strike',
  entityType: 'maneuver',
  name: 'Tactical Strike',
  description: 'On hit, one ally can immediately make a 5-foot step.',
  level: 2,
  discipline: 'white-raven',
  type: 'strike',
  initiationAction: 'standard',
  prerequisite: 'One White Raven maneuver',
};

const whiteRavenTactics: ManeuverEntity = {
  id: 'white-raven-tactics',
  entityType: 'maneuver',
  name: 'White Raven Tactics',
  description: 'One ally can take an immediate action to make a melee attack.',
  level: 3,
  discipline: 'white-raven',
  type: 'boost',
  initiationAction: 'swift',
  prerequisite: 'One White Raven maneuver',
};

const warMastersCharge: ManeuverEntity = {
  id: 'war-masters-charge',
  entityType: 'maneuver',
  name: 'War Master\'s Charge',
  description: 'Charge and deal +50 points of damage.',
  level: 9,
  discipline: 'white-raven',
  type: 'strike',
  initiationAction: 'full-round',
  prerequisite: 'Four White Raven maneuvers',
};

// =============================================================================
// Raw Maneuvers Array
// =============================================================================

const rawManeuvers: ManeuverEntity[] = [
  // Diamond Mind
  sapphireNightmareBlade,
  momentOfPerfectMind,
  mindOverBody,
  rubyNightmareBlade,
  diamondDefense,
  // Iron Heart
  steelWind,
  punishingStance,
  wallOfBlades,
  ironHeartSurge,
  lightningRecovery,
  adamantineHurricane,
  // Stone Dragon
  stoneBones,
  stonefoot,
  mountainHammer,
  bonesplittingStrike,
  earthstrikeQuake,
  // Tiger Claw
  suddenLeap,
  huntersSense,
  clawAtTheMoon,
  rabidWolfStrike,
  wolfpackTactics,
  // White Raven
  leadingTheAttack,
  bolsteringVoice,
  battleLeaderCharge,
  tacticalStrike,
  whiteRavenTactics,
  warMastersCharge,
];

// =============================================================================
// Loader
// =============================================================================

/**
 * Load and enrich all maneuvers with class-level relations.
 *
 * This function:
 * 1. Builds a relation index for O(1) lookups
 * 2. Enriches each maneuver with classData containing:
 *    - relations: raw relation data
 *    - classLevelKeys: ['warblade:1', 'crusader:1'] for filtering
 *    - classLevels: { warblade: 1, crusader: 1 } for O(1) access
 */
function loadEnrichedManeuvers(): EnrichedManeuver[] {
  const relations = rawRelations as RelationEntity[]

  // Build index
  const index = buildRelationIndex(relations)

  // Enrich entities
  const enriched = enrichEntitiesWithRelations(rawManeuvers, [RELATION_FIELD_DEF], index)

  return enriched as EnrichedManeuver[]
}

// =============================================================================
// Exports
// =============================================================================

/**
 * All maneuvers, enriched with class-level data.
 *
 * Each maneuver has a `classData` field with:
 * - `classLevelKeys`: Array of 'classId:level' strings for filtering
 * - `classLevels`: Map of classId -> level for O(1) access
 *
 * Example usage:
 * ```typescript
 * // Filter maneuvers for Warblade level 1
 * const warbladeL1 = allManeuvers.filter(m =>
 *   m.classData.classLevelKeys.includes('warblade:1')
 * )
 *
 * // Check if maneuver is available to Crusader
 * const isCrusaderManeuver = m.classData.classLevels['crusader'] !== undefined
 *
 * // Get maneuver level for a specific class
 * const warbladeLevel = m.classData.classLevels['warblade']
 * ```
 */
export const allManeuvers: EnrichedManeuver[] = loadEnrichedManeuvers()

/**
 * Get all unique class IDs that have maneuvers
 */
export function getManeuverClasses(): string[] {
  const classes = new Set<string>()
  for (const maneuver of allManeuvers) {
    for (const targetId of Object.keys(maneuver.classData.classLevels)) {
      classes.add(targetId)
    }
  }
  return Array.from(classes).sort()
}

/**
 * Get all maneuver levels available for a specific class
 */
export function getManeuverLevelsForClass(classId: string): number[] {
  const levels = new Set<number>()
  for (const maneuver of allManeuvers) {
    const level = maneuver.classData.classLevels[classId]
    if (level !== undefined) {
      levels.add(level)
    }
  }
  return Array.from(levels).sort((a, b) => a - b)
}

/**
 * Filter maneuvers by class and optionally level
 */
export function filterManeuvers(classId: string, level?: number): EnrichedManeuver[] {
  return allManeuvers.filter((maneuver) => {
    if (level !== undefined) {
      return maneuver.classData.classLevelKeys.includes(`${classId}:${level}`)
    }
    return maneuver.classData.classLevels[classId] !== undefined
  })
}

/**
 * Re-export relation types for external use
 */
export { MANEUVER_CLASS_FIELD_CONFIG }

// Named exports for individual use (raw, without enrichment)
export {
  // Diamond Mind
  sapphireNightmareBlade,
  momentOfPerfectMind,
  mindOverBody,
  rubyNightmareBlade,
  diamondDefense,
  // Iron Heart
  steelWind,
  punishingStance,
  wallOfBlades,
  ironHeartSurge,
  lightningRecovery,
  adamantineHurricane,
  // Stone Dragon
  stoneBones,
  stonefoot,
  mountainHammer,
  bonesplittingStrike,
  earthstrikeQuake,
  // Tiger Claw
  suddenLeap,
  huntersSense,
  clawAtTheMoon,
  rabidWolfStrike,
  wolfpackTactics,
  // White Raven
  leadingTheAttack,
  bolsteringVoice,
  battleLeaderCharge,
  tacticalStrike,
  whiteRavenTactics,
  warMastersCharge,
};
