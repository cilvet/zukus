/**
 * D&D 3.5 Spells Loader
 *
 * Loads the full spell database (2,789 spells) and enriches them
 * with class-level relations using the relation system.
 *
 * The spells are pre-enriched at load time, so filtering by class+level
 * is fast and uses the standard filtering system.
 */

import {
  buildRelationIndex,
  enrichEntitiesWithRelations,
  type RelationEntity,
  type RelationFieldDef,
} from '../../../../entities/relations/compiler'
import type { RelationFieldConfig } from '../../../../entities/types/base'
import type { StandardEntity } from '../../../../entities/types/base'

// Import raw data
import rawSpells from '../../../../entities/relations/__testdata__/spells.json'
import rawRelations from '../../../../entities/relations/__testdata__/spell-class-relations.json'

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configuration for spell-class relation field
 */
const SPELL_CLASS_FIELD_CONFIG: RelationFieldConfig = {
  relationType: 'spell-class-relation',
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
  config: SPELL_CLASS_FIELD_CONFIG,
}

// ============================================================================
// Types
// ============================================================================

/**
 * Enriched spell with class-level data
 */
export type EnrichedSpell = StandardEntity & {
  school: string
  subschool?: string
  descriptors?: string[]
  components: string[]
  castingTime: string
  range: string
  duration: string
  target?: string
  area?: string
  effect?: string
  savingThrow?: string
  spellResistance: string
  source?: string
  originalName?: string
  classData: {
    relations: Array<{ targetId: string; metadata: { level: number } }>
    classLevelKeys: string[]
    classLevels: Record<string, number>
  }
}

// ============================================================================
// Loader
// ============================================================================

/**
 * Load and enrich all spells with class-level relations.
 *
 * This function:
 * 1. Builds a relation index for O(1) lookups
 * 2. Enriches each spell with classData containing:
 *    - relations: raw relation data
 *    - classLevelKeys: ['wizard:3', 'sorcerer:3'] for filtering
 *    - classLevels: { wizard: 3, sorcerer: 3 } for O(1) access
 */
function loadEnrichedSpells(): EnrichedSpell[] {
  const totalStart = performance.now()

  const spells = rawSpells as StandardEntity[]
  const relations = rawRelations as RelationEntity[]

  // Build index
  const indexStart = performance.now()
  const index = buildRelationIndex(relations)
  const indexElapsed = performance.now() - indexStart

  // Enrich entities
  const enrichStart = performance.now()
  const enriched = enrichEntitiesWithRelations(spells, [RELATION_FIELD_DEF], index)
  const enrichElapsed = performance.now() - enrichStart

  const totalElapsed = performance.now() - totalStart
  console.log(
    `[Perf] Spell loader: ${totalElapsed.toFixed(1)}ms total ` +
      `(index: ${indexElapsed.toFixed(1)}ms, enrich ${spells.length} spells: ${enrichElapsed.toFixed(1)}ms, ` +
      `${relations.length} relations)`
  )

  return enriched as EnrichedSpell[]
}

// ============================================================================
// Exports
// ============================================================================

/**
 * All D&D 3.5 spells, enriched with class-level data.
 *
 * Each spell has a `classData` field with:
 * - `classLevelKeys`: Array of 'classId:level' strings for filtering
 * - `classLevels`: Map of classId -> level for O(1) access
 *
 * Example usage:
 * ```typescript
 * // Filter spells for Wizard level 3
 * const wizardL3 = allSpells.filter(spell =>
 *   spell.classData.classLevelKeys.includes('wizard:3')
 * )
 *
 * // Check if spell is available to Cleric
 * const isClericSpell = spell.classData.classLevels['cleric'] !== undefined
 *
 * // Get spell level for a specific class
 * const clericLevel = spell.classData.classLevels['cleric']
 * ```
 */
export const allSpells: EnrichedSpell[] = loadEnrichedSpells()

/**
 * Get all unique class IDs that have spells
 */
export function getSpellcastingClasses(): string[] {
  const classes = new Set<string>()
  for (const spell of allSpells) {
    for (const targetId of Object.keys(spell.classData.classLevels)) {
      classes.add(targetId)
    }
  }
  return Array.from(classes).sort()
}

/**
 * Get all spell levels available for a specific class
 */
export function getSpellLevelsForClass(classId: string): number[] {
  const levels = new Set<number>()
  for (const spell of allSpells) {
    const level = spell.classData.classLevels[classId]
    if (level !== undefined) {
      levels.add(level)
    }
  }
  return Array.from(levels).sort((a, b) => a - b)
}

/**
 * Filter spells by class and optionally level
 */
export function filterSpells(classId: string, level?: number): EnrichedSpell[] {
  return allSpells.filter((spell) => {
    if (level !== undefined) {
      return spell.classData.classLevelKeys.includes(`${classId}:${level}`)
    }
    return spell.classData.classLevels[classId] !== undefined
  })
}

/**
 * Re-export relation types for external use
 */
export { SPELL_CLASS_FIELD_CONFIG }
