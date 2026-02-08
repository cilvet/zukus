/**
 * Generate TranslationPack .ts files from scraped dndtools.org/es/ data.
 *
 * Matches scraped Spanish translations to d35e-raw entities using
 * normalized name slugs, then outputs TranslationPack TypeScript files.
 *
 * Usage: bun run scripts/srd-research/generate-translation-packs.ts
 */

const RAW_DATA_DIR = 'packages/core/data/d35e-raw'
const SCRAPED_DIR = 'scripts/srd-research/reference-data'
const OUTPUT_DIR = 'scripts/srd-research/output'

// --- Types ---

type D35ERawEntity = {
  id: string // Foundry VTT ID (alphanumeric)
  _id?: string
  name: string
  type: string
  data: {
    description?: { value?: string }
    shortDescription?: string
    [key: string]: unknown
  }
}

type ScrapedSpell = {
  spanishName: string
  englishSlug: string
  spanishDescription: string
  level: number
  classes: string[]
  source: string
}

type ScrapedFeat = {
  spanishName: string
  englishSlug: string
  type: string
  spanishPrerequisites: string
  spanishBenefit: string
}

type MatchResult<T> = {
  entityId: string    // slugified entity ID for the TranslationPack
  entityName: string  // original English name
  scraped: T
  matchMethod: 'exact' | 'normalized' | 'fuzzy'
}

// --- Utilities ---

/** Same slugify as convert-d35e-to-entities.ts */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Normalize for looser matching: remove parentheticals, articles, etc. */
function normalizeForMatching(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*/g, '') // remove (parentheticals)
    .replace(/,\s*(?:greater|lesser|mass)\s*$/i, '') // remove ", Greater" suffix
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Handle the apostrophe slug mismatch:
 * slugify("Eagle's Splendor") -> "eagle-s-splendor"
 * but dndtools slug             -> "eagles-splendor"
 *
 * Convert "eagle-s-splendor" -> "eagles-splendor" for matching.
 */
function fixApostropheSlug(slug: string): string {
  // "-s-" in the middle of a slug often means "'s " was slugified
  return slug.replace(/-s-/g, 's-')
}

// --- Matching Logic ---

function matchSpells(
  rawSpells: D35ERawEntity[],
  scrapedSpells: ScrapedSpell[]
): {
  matched: MatchResult<ScrapedSpell>[]
  unmatchedEntities: D35ERawEntity[]
  unmatchedScraped: ScrapedSpell[]
} {
  const matched: MatchResult<ScrapedSpell>[] = []
  const matchedEntityIds = new Set<string>()
  const matchedScrapedSlugs = new Set<string>()

  // Build lookup maps from scraped data
  const scrapedBySlug = new Map<string, ScrapedSpell>()
  const scrapedByNormalized = new Map<string, ScrapedSpell>()
  for (const s of scrapedSpells) {
    scrapedBySlug.set(s.englishSlug, s)
    scrapedByNormalized.set(normalizeForMatching(s.englishSlug.replace(/-/g, ' ')), s)
  }

  for (const entity of rawSpells) {
    const entitySlug = slugify(entity.name)

    // Try exact slug match first
    let scraped = scrapedBySlug.get(entitySlug)
    let method: 'exact' | 'normalized' | 'fuzzy' = 'exact'

    // Try with apostrophe fix: "eagle-s-splendor" -> "eagles-splendor"
    if (!scraped) {
      const fixedSlug = fixApostropheSlug(entitySlug)
      scraped = scrapedBySlug.get(fixedSlug)
      method = 'normalized'
    }

    // Try normalized match
    if (!scraped) {
      const normalized = normalizeForMatching(entity.name)
      scraped = scrapedByNormalized.get(normalized)
      method = 'normalized'
    }

    // Try without trailing qualifiers like "(No Subschool)"
    if (!scraped) {
      const baseName = entity.name.replace(/\s*\([^)]*\)\s*$/, '')
      const baseSlug = slugify(baseName)
      scraped = scrapedBySlug.get(baseSlug)
      if (!scraped) scraped = scrapedBySlug.get(fixApostropheSlug(baseSlug))
      method = 'fuzzy'
    }

    // Try "X, Mass" -> "mass-x" or "mass x" pattern
    if (!scraped && /,\s*Mass$/i.test(entity.name)) {
      const base = entity.name.replace(/,\s*Mass$/i, '').trim()
      const altSlug = 'mass-' + slugify(base)
      scraped = scrapedBySlug.get(altSlug)
      if (!scraped) scraped = scrapedBySlug.get(fixApostropheSlug(altSlug))
      method = 'fuzzy'
    }

    // Try "Greater X" -> "x,-greater" pattern
    if (!scraped && /^Greater /i.test(entity.name)) {
      const base = entity.name.replace(/^Greater /i, '')
      const altSlug = slugify(base) + ',-greater'
      scraped = scrapedBySlug.get(altSlug)
      if (!scraped) {
        const altSlug2 = slugify('greater ' + base)
        scraped = scrapedBySlug.get(altSlug2)
      }
      if (!scraped) scraped = scrapedBySlug.get(fixApostropheSlug(slugify(base) + ',-greater'))
      method = 'fuzzy'
    }

    // Try "Mass X" -> "x,-mass" or "mass-x" pattern
    if (!scraped && /^Mass /i.test(entity.name)) {
      const base = entity.name.replace(/^Mass /i, '')
      const altSlug = slugify(base) + ',-mass'
      scraped = scrapedBySlug.get(altSlug)
      if (!scraped) {
        const altSlug2 = slugify('mass ' + base)
        scraped = scrapedBySlug.get(altSlug2)
      }
      if (!scraped) scraped = scrapedBySlug.get(fixApostropheSlug(altSlug))
      if (!scraped) scraped = scrapedBySlug.get('mass-' + fixApostropheSlug(slugify(base)))
      method = 'fuzzy'
    }

    // Try split combined entries like "protection-from-chaos/evil/good/law"
    // Match "Protection from Good" against "protection-from-chaos/evil/good/law"
    if (!scraped) {
      const slug = entitySlug
      for (const s of scrapedSpells) {
        if (s.englishSlug.includes('/') && s.englishSlug.split('/').some(part => {
          const fullSlug = s.englishSlug.split('/')[0]
            .replace(/\/.*$/, '')
          // Build possible slugs from the combined entry
          const basePart = s.englishSlug.substring(0, s.englishSlug.indexOf('/'))
          // e.g. "protection-from-chaos" + "/evil" -> check if our slug is "protection-from-evil"
          return part === slug.split('-').pop() &&
            slug.startsWith(basePart.substring(0, basePart.lastIndexOf('-') + 1))
        })) {
          scraped = s
          method = 'fuzzy'
          break
        }
      }
    }

    if (scraped) {
      matched.push({
        entityId: entitySlug,
        entityName: entity.name,
        scraped,
        matchMethod: method,
      })
      matchedEntityIds.add(entity.name)
      matchedScrapedSlugs.add(scraped.englishSlug)
    }
  }

  const unmatchedEntities = rawSpells.filter(e => !matchedEntityIds.has(e.name))
  const unmatchedScraped = scrapedSpells.filter(s => !matchedScrapedSlugs.has(s.englishSlug))

  return { matched, unmatchedEntities, unmatchedScraped }
}

function matchFeats(
  rawFeats: D35ERawEntity[],
  scrapedFeats: ScrapedFeat[]
): {
  matched: MatchResult<ScrapedFeat>[]
  unmatchedEntities: D35ERawEntity[]
  unmatchedScraped: ScrapedFeat[]
} {
  const matched: MatchResult<ScrapedFeat>[] = []
  const matchedEntityIds = new Set<string>()
  const matchedScrapedSlugs = new Set<string>()

  // Build lookup from scraped data
  const scrapedBySlug = new Map<string, ScrapedFeat>()
  const scrapedByNormalized = new Map<string, ScrapedFeat>()
  for (const f of scrapedFeats) {
    scrapedBySlug.set(f.englishSlug, f)
    scrapedByNormalized.set(normalizeForMatching(f.englishSlug.replace(/-/g, ' ')), f)
  }

  for (const entity of rawFeats) {
    const entitySlug = slugify(entity.name)

    let scraped = scrapedBySlug.get(entitySlug)
    let method: 'exact' | 'normalized' | 'fuzzy' = 'exact'

    // Apostrophe fix
    if (!scraped) {
      scraped = scrapedBySlug.get(fixApostropheSlug(entitySlug))
      method = 'normalized'
    }

    if (!scraped) {
      const normalized = normalizeForMatching(entity.name)
      scraped = scrapedByNormalized.get(normalized)
      method = 'normalized'
    }

    // Try without parentheticals
    if (!scraped) {
      const baseName = entity.name.replace(/\s*\([^)]*\)\s*$/, '')
      const baseSlug = slugify(baseName)
      scraped = scrapedBySlug.get(baseSlug)
      method = 'fuzzy'
    }

    if (scraped) {
      matched.push({
        entityId: entitySlug,
        entityName: entity.name,
        scraped,
        matchMethod: method,
      })
      matchedEntityIds.add(entity.name)
      matchedScrapedSlugs.add(scraped.englishSlug)
    }
  }

  const unmatchedEntities = rawFeats.filter(e => !matchedEntityIds.has(e.name))
  const unmatchedScraped = scrapedFeats.filter(f => !matchedScrapedSlugs.has(f.englishSlug))

  return { matched, unmatchedEntities, unmatchedScraped }
}

// --- Output Formatting ---

/**
 * Format a translations object as a TypeScript object literal string
 * with proper escaping. Uses single quotes for keys and values.
 */
function formatTranslationsObject(translations: Record<string, Record<string, string>>): string {
  const lines: string[] = ['{']
  const keys = Object.keys(translations)
  for (let i = 0; i < keys.length; i++) {
    const entityId = keys[i]
    const fields = translations[entityId]
    const fieldKeys = Object.keys(fields)

    lines.push(`    '${entityId}': {`)
    for (let j = 0; j < fieldKeys.length; j++) {
      const fieldKey = fieldKeys[j]
      const value = fields[fieldKey]
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '')
      const comma = j < fieldKeys.length - 1 ? ',' : ','
      lines.push(`      ${fieldKey}: '${value}'${comma}`)
    }
    const outerComma = i < keys.length - 1 ? ',' : ','
    lines.push(`    }${outerComma}`)
  }
  lines.push('  }')
  return lines.join('\n')
}

// --- TranslationPack Generation ---

function generateSpellPack(matches: MatchResult<ScrapedSpell>[]): string {
  const translations: Record<string, Record<string, string>> = {}
  let emptyNameCount = 0
  let emptyDescCount = 0

  for (const m of matches) {
    const fields: Record<string, string> = {}

    if (m.scraped.spanishName) {
      fields.name = m.scraped.spanishName
    } else {
      emptyNameCount++
    }

    if (m.scraped.spanishDescription) {
      fields.shortDescription = m.scraped.spanishDescription
    } else {
      emptyDescCount++
    }

    if (Object.keys(fields).length > 0) {
      translations[m.entityId] = fields
    }
  }

  if (emptyNameCount > 0) console.log(`  Warning: ${emptyNameCount} spells with empty Spanish name`)
  if (emptyDescCount > 0) console.log(`  Warning: ${emptyDescCount} spells with empty Spanish description`)

  const sortedKeys = Object.keys(translations).sort()
  const sortedTranslations: Record<string, Record<string, string>> = {}
  for (const key of sortedKeys) {
    sortedTranslations[key] = translations[key]
  }

  return `/**
 * Spanish Translation Pack for D&D 3.5 SRD Spells
 *
 * Auto-generated from srd.dndtools.org/es/ scraped data.
 * ${Object.keys(sortedTranslations).length} spells translated.
 *
 * Generated: ${new Date().toISOString().split('T')[0]}
 */

import type { TranslationPack } from '../../packages/core/core/domain/translations/types';

export const dnd35SpellsSpanishPack: TranslationPack = {
  id: 'dnd35-spells-es',
  name: 'D&D 3.5 Spells - Spanish',
  targetCompendiumId: 'srd-3.5',
  targetVersionRange: '^1.0.0',
  locale: 'es',
  source: 'community',
  version: '1.0.0',
  author: 'srd.dndtools.org community translation',
  translations: ${formatTranslationsObject(sortedTranslations)},
};
`
}

function generateFeatPack(matches: MatchResult<ScrapedFeat>[]): string {
  const translations: Record<string, Record<string, string>> = {}
  let emptyBenefitCount = 0

  for (const m of matches) {
    const fields: Record<string, string> = {}

    if (m.scraped.spanishName) {
      fields.name = m.scraped.spanishName
    }

    if (m.scraped.spanishBenefit) {
      fields.benefit = m.scraped.spanishBenefit
    } else {
      emptyBenefitCount++
    }

    if (m.scraped.spanishPrerequisites) {
      fields.prerequisites = m.scraped.spanishPrerequisites
    }

    if (m.scraped.type) {
      fields.type = m.scraped.type
    }

    if (Object.keys(fields).length > 0) {
      translations[m.entityId] = fields
    }
  }

  if (emptyBenefitCount > 0) console.log(`  Warning: ${emptyBenefitCount} feats with empty Spanish benefit`)

  const sortedKeys = Object.keys(translations).sort()
  const sortedTranslations: Record<string, Record<string, string>> = {}
  for (const key of sortedKeys) {
    sortedTranslations[key] = translations[key]
  }

  return `/**
 * Spanish Translation Pack for D&D 3.5 SRD Feats
 *
 * Auto-generated from srd.dndtools.org/es/ scraped data.
 * ${Object.keys(sortedTranslations).length} feats translated.
 *
 * Generated: ${new Date().toISOString().split('T')[0]}
 */

import type { TranslationPack } from '../../packages/core/core/domain/translations/types';

export const dnd35FeatsSpanishPack: TranslationPack = {
  id: 'dnd35-feats-es',
  name: 'D&D 3.5 Feats - Spanish',
  targetCompendiumId: 'srd-3.5',
  targetVersionRange: '^1.0.0',
  locale: 'es',
  source: 'community',
  version: '1.0.0',
  author: 'srd.dndtools.org community translation',
  translations: ${formatTranslationsObject(sortedTranslations)},
};
`
}

// --- Main ---

async function main() {
  console.log('=== Translation Pack Generator ===\n')

  // Load raw entity data
  const rawSpells: D35ERawEntity[] = JSON.parse(
    await Bun.file(`${RAW_DATA_DIR}/spells.json`).text()
  )
  const rawFeats: D35ERawEntity[] = JSON.parse(
    await Bun.file(`${RAW_DATA_DIR}/feats.json`).text()
  )
  console.log(`Loaded ${rawSpells.length} raw spells, ${rawFeats.length} raw feats`)

  // Load scraped data
  const allScrapedSpells: ScrapedSpell[] = JSON.parse(
    await Bun.file(`${SCRAPED_DIR}/dndtools-spells-es.json`).text()
  )
  const scrapedFeats: ScrapedFeat[] = JSON.parse(
    await Bun.file(`${SCRAPED_DIR}/dndtools-feats-es.json`).text()
  )

  // Filter scraped spells to SRD core only
  const srdSpells = allScrapedSpells.filter(s => s.source === 'spellsAllCore')
  console.log(`Loaded ${allScrapedSpells.length} scraped spells (${srdSpells.length} SRD core), ${scrapedFeats.length} scraped feats`)
  console.log()

  // --- Match Spells ---
  console.log('--- Spell Matching ---')
  const spellResult = matchSpells(rawSpells, srdSpells)
  console.log(`Matched: ${spellResult.matched.length} / ${rawSpells.length} entities`)
  console.log(`  By method: exact=${spellResult.matched.filter(m => m.matchMethod === 'exact').length}, normalized=${spellResult.matched.filter(m => m.matchMethod === 'normalized').length}, fuzzy=${spellResult.matched.filter(m => m.matchMethod === 'fuzzy').length}`)
  console.log(`Unmatched entities (no Spanish found): ${spellResult.unmatchedEntities.length}`)
  console.log(`Unmatched scraped (no entity): ${spellResult.unmatchedScraped.length}`)

  if (spellResult.unmatchedEntities.length > 0) {
    console.log('\nSample unmatched entities:')
    for (const e of spellResult.unmatchedEntities.slice(0, 15)) {
      console.log(`  ${slugify(e.name)} | ${e.name}`)
    }
  }

  if (spellResult.unmatchedScraped.length > 0 && spellResult.unmatchedScraped.length <= 30) {
    console.log('\nUnmatched scraped spells:')
    for (const s of spellResult.unmatchedScraped.slice(0, 15)) {
      console.log(`  ${s.englishSlug} | ${s.spanishName}`)
    }
  }

  // Generate spell pack
  console.log('\nGenerating spell translation pack...')
  const spellPackTs = generateSpellPack(spellResult.matched)
  const spellOutPath = `${OUTPUT_DIR}/dnd35-spells-es.ts`
  await Bun.write(spellOutPath, spellPackTs)
  console.log(`  Saved to ${spellOutPath}`)

  // --- Match Feats ---
  console.log('\n--- Feat Matching ---')
  const featResult = matchFeats(rawFeats, scrapedFeats)
  console.log(`Matched: ${featResult.matched.length} / ${rawFeats.length} entities`)
  console.log(`  By method: exact=${featResult.matched.filter(m => m.matchMethod === 'exact').length}, normalized=${featResult.matched.filter(m => m.matchMethod === 'normalized').length}, fuzzy=${featResult.matched.filter(m => m.matchMethod === 'fuzzy').length}`)
  console.log(`Unmatched entities (no Spanish found): ${featResult.unmatchedEntities.length}`)
  console.log(`Unmatched scraped (no entity): ${featResult.unmatchedScraped.length}`)

  if (featResult.unmatchedEntities.length > 0) {
    console.log('\nSample unmatched feat entities:')
    for (const e of featResult.unmatchedEntities.slice(0, 15)) {
      console.log(`  ${slugify(e.name)} | ${e.name}`)
    }
  }

  if (featResult.unmatchedScraped.length > 0) {
    console.log('\nUnmatched scraped feats:')
    for (const s of featResult.unmatchedScraped.slice(0, 15)) {
      console.log(`  ${s.englishSlug} | ${s.spanishName}`)
    }
  }

  // Generate feat pack
  console.log('\nGenerating feat translation pack...')
  const featPackTs = generateFeatPack(featResult.matched)
  const featOutPath = `${OUTPUT_DIR}/dnd35-feats-es.ts`
  await Bun.write(featOutPath, featPackTs)
  console.log(`  Saved to ${featOutPath}`)

  // --- Also try matching against ALL scraped spells (not just SRD core) ---
  console.log('\n--- Bonus: Matching against ALL scraped spells (including supplements) ---')
  const allSpellResult = matchSpells(rawSpells, allScrapedSpells)
  console.log(`Matched: ${allSpellResult.matched.length} / ${rawSpells.length} entities (was ${spellResult.matched.length} with SRD-only)`)
  console.log(`Additional matches from supplements: ${allSpellResult.matched.length - spellResult.matched.length}`)
  console.log(`Still unmatched: ${allSpellResult.unmatchedEntities.length}`)

  console.log('\n=== Done ===')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
