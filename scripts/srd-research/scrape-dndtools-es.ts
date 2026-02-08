/**
 * Scrapes Spanish D&D 3.5 SRD data from srd.dndtools.org/es/
 *
 * Extracts spell names (Spanish + English slug), brief descriptions,
 * and feat data. Saves to reference-data/ as JSON.
 *
 * Usage: bun run scripts/srd-research/scrape-dndtools-es.ts
 */

const BASE_URL = 'https://srd.dndtools.org/es/srd'

const SPELL_LIST_PAGES = [
  { url: `${BASE_URL}/magic/spells/classSpellLists/wizardSpells.html`, className: 'wizard' },
  { url: `${BASE_URL}/magic/spells/classSpellLists/clericSpells.html`, className: 'cleric' },
  { url: `${BASE_URL}/magic/spells/classSpellLists/druidSpells.html`, className: 'druid' },
  { url: `${BASE_URL}/magic/spells/classSpellLists/bardSpells.html`, className: 'bard' },
  { url: `${BASE_URL}/magic/spells/classSpellLists/paladinSpells.html`, className: 'paladin' },
  { url: `${BASE_URL}/magic/spells/classSpellLists/rangerSpells.html`, className: 'ranger' },
]

const FEAT_PAGE_URL = `${BASE_URL}/feats/featsAll.html`

const OUTPUT_DIR = new URL('./reference-data/', import.meta.url).pathname

// --- Types ---

type SpellEntry = {
  spanishName: string
  englishSlug: string
  spanishDescription: string
  level: number
  classes: string[]
  source: string
}

type FeatEntry = {
  spanishName: string
  englishSlug: string
  type: string
  spanishPrerequisites: string
  spanishBenefit: string
}

// --- Helpers ---

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetch a page with retry and rate limiting.
 */
async function fetchPage(url: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ZukusSRDScraper/1.0 (educational use; rate-limited)',
          Accept: 'text/html',
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`)
      }
      return await response.text()
    } catch (err) {
      console.error(`  Attempt ${attempt}/${retries} failed for ${url}: ${err}`)
      if (attempt < retries) {
        await sleep(2000 * attempt)
      } else {
        throw err
      }
    }
  }
  throw new Error('Unreachable')
}

// --- Spell Parsing ---

/**
 * Parse a spell list page (e.g. wizardSpells.html) from the Spanish SRD.
 *
 * The page structure is:
 * - Level headings (e.g. "Trucos de hechicero/mago (nivel 0)")
 * - Spell entries as links: <a href="../spells/spellsAllCore.html#acid-splash">Salpicadura de ácido</a>: brief description
 *
 * We extract:
 * - Spanish name from the link text
 * - English slug from the anchor in the href
 * - Brief Spanish description from the text after the colon
 * - Level from the current heading context
 */
function parseSpellListPage(html: string, className: string): SpellEntry[] {
  const spells: SpellEntry[] = []
  let currentLevel = -1

  // Process full HTML (not line-by-line) because spell entries span multiple lines:
  //   <td>School</td>
  //   <td><a href="...#slug">Spanish Name</a>:</td>
  //   <td>Spanish description.</td>

  // First, find all level headings and their positions to assign levels
  const levelPositions: { pos: number; level: number }[] = []
  const levelRe =
    /(\d+)(?:st|nd|rd|th)?[\s-]+[Ll]evel|[Nn]ivel\s+(\d+)|(\d+)(?:er|do|to|vo)?[\s-]+[Nn]ivel|(?:Cantrip|Orisons?|Trucos).*?(?:Level|Nivel)/gi
  let levelMatch: RegExpExecArray | null
  while ((levelMatch = levelRe.exec(html)) !== null) {
    const levelNum = parseInt(
      levelMatch[1] || levelMatch[2] || levelMatch[3] || '0',
      10
    )
    levelPositions.push({ pos: levelMatch.index, level: levelNum })
  }

  function getLevelAtPos(pos: number): number {
    let level = 0
    for (const lp of levelPositions) {
      if (lp.pos < pos) level = lp.level
      else break
    }
    return level
  }

  // Match spell entries: <a href="...#slug">Name</a> followed by description in next <td>
  // The pattern across the table is:
  //   <td><a href="...spells....html#slug" ...>Name</a>:</td>\n<td>Description</td>
  // Or sometimes the school td comes first, but we just need the link + next td
  const spellPattern =
    /<a[^>]+href="[^"]*?(spells\w*)\.html#([^"]+)"[^>]*>([^<]+)<\/a>\s*:?\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/gi
  let match: RegExpExecArray | null
  while ((match = spellPattern.exec(html)) !== null) {
    const source = match[1] || 'spellsAllCore'
    const englishSlug = decodeURIComponent(match[2]).trim()
    const spanishName = decodeHTMLEntities(match[3]).trim()
    let spanishDescription = decodeHTMLEntities(
      match[4].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ')
    ).trim()

    // Remove trailing period
    if (spanishDescription.endsWith('.')) {
      spanishDescription = spanishDescription.slice(0, -1).trim()
    }

    // Skip non-spell anchors
    if (!englishSlug || englishSlug.startsWith('table') || englishSlug.startsWith('fn')) {
      continue
    }

    spells.push({
      spanishName,
      englishSlug,
      spanishDescription,
      level: getLevelAtPos(match.index),
      classes: [className],
      source,
    })
  }

  return spells
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&ndash;/g, '\u2013')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&nbsp;/g, ' ')
    .replace(/&eacute;/g, '\u00e9')
    .replace(/&iacute;/g, '\u00ed')
    .replace(/&oacute;/g, '\u00f3')
    .replace(/&uacute;/g, '\u00fa')
    .replace(/&ntilde;/g, '\u00f1')
    .replace(/&aacute;/g, '\u00e1')
    .replace(/&uuml;/g, '\u00fc')
}

// --- Feat Parsing ---

/**
 * Parse the feats page. Two sections exist:
 *
 * 1. Summary table (lines ~19-576): <tr> rows with:
 *    <td><a href="#slug">SPANISH NAME</a></td>
 *    <td>prerequisites</td>
 *    <td>benefit summary</td>
 *
 * 2. Detail section (lines 577+): <h5> entries with:
 *    <h5><a id="slug" name="slug"></a>SPANISH NAME [TYPE]</h5>
 *    followed by prerequisite/benefit paragraphs
 *
 * We parse the summary table for the quick data, then enrich
 * with type info from the detail headings.
 */
function parseFeatsPage(html: string): FeatEntry[] {
  const feats: FeatEntry[] = []

  // --- Parse summary table rows ---
  // Pattern: <tr...><td>...<a href="#slug">NAME</a></td><td>prereqs</td><td>benefit</td></tr>
  const rowPattern =
    /<tr[^>]*>\s*<td[^>]*>(?:\u2014*)?\s*<a\s+href="#([^"]+)"[^>]*>([^<]+)<\/a>\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/gi
  let match: RegExpExecArray | null
  while ((match = rowPattern.exec(html)) !== null) {
    const slug = match[1].trim()
    const name = decodeHTMLEntities(match[2]).trim()
    const prereqs = decodeHTMLEntities(match[3].replace(/<[^>]*>/g, '')).trim()
    const benefit = decodeHTMLEntities(match[4].replace(/<[^>]*>/g, '')).trim()

    if (!slug || !name) continue

    feats.push({
      spanishName: titleCase(name),
      englishSlug: slug,
      type: 'General',
      spanishPrerequisites: prereqs === '-' ? '' : prereqs,
      spanishBenefit: benefit,
    })
  }

  // --- Enrich with type from detail headings ---
  // Pattern: <h5><a id="slug" name="slug"></a>NAME [TYPE]</h5>
  const headingPattern =
    /<h5[^>]*>\s*(?:<[^>]*>)*\s*<a\s+id="([^"]+)"[^>]*><\/a>\s*(?:<\/[^>]*>\s*)*([\s\S]*?)<\/h5>/gi
  const typeMap = new Map<string, string>()
  while ((match = headingPattern.exec(html)) !== null) {
    const slug = match[1].trim()
    const headingText = match[2].replace(/<[^>]*>/g, '').trim()
    const typeMatch = headingText.match(/\[([^\]]+)\]/i)
    if (typeMatch) {
      typeMap.set(slug, typeMatch[1].trim())
    }
  }

  // Apply types from detail section
  for (const feat of feats) {
    const type = typeMap.get(feat.englishSlug)
    if (type) {
      feat.type = type
    }
  }

  return feats
}

// --- Normalization ---

/**
 * Normalize a slug to lowercase-hyphenated format.
 * "ABOLETH CURSE" -> "aboleth-curse"
 * "acid-splash" -> "acid-splash" (unchanged)
 * "Arcane Fusion, Greater" -> "arcane-fusion,-greater"
 */
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/['']/g, '')
    .replace(/%e2%80%99/g, '') // url-encoded right single quotation mark
}

/**
 * Title-case a Spanish name that may be ALL CAPS.
 * "MISIL MÁGICO" -> "Misil Mágico"
 * "Misil mágico" -> "Misil mágico" (unchanged if not all-caps)
 *
 * Only transforms if the entire string is uppercase.
 */
function titleCase(text: string): string {
  // Check if entirely uppercase (ignoring non-letters)
  const letters = text.replace(/[^a-záéíóúñü]/gi, '')
  if (letters !== letters.toUpperCase()) {
    return text // Already mixed case, leave as-is
  }

  return text
    .toLowerCase()
    .replace(/(^|\s)(\S)/g, (_, space, char) => space + char.toUpperCase())
}

// --- Merge Logic ---

/**
 * Merge spell entries from multiple class lists.
 * The same spell may appear on multiple class lists (e.g. "Detectar magia" on both wizard and cleric).
 * We merge by normalized englishSlug, combining the classes arrays.
 */
function mergeSpells(allSpells: SpellEntry[]): SpellEntry[] {
  const bySlug = new Map<string, SpellEntry>()

  for (const spell of allSpells) {
    const normalized = normalizeSlug(spell.englishSlug)
    const existing = bySlug.get(normalized)
    if (existing) {
      for (const cls of spell.classes) {
        if (!existing.classes.includes(cls)) {
          existing.classes.push(cls)
        }
      }
    } else {
      bySlug.set(normalized, {
        ...spell,
        englishSlug: normalized,
        classes: [...spell.classes],
      })
    }
  }

  return Array.from(bySlug.values()).sort((a, b) =>
    a.englishSlug.localeCompare(b.englishSlug)
  )
}

// --- Main ---

async function main() {
  console.log('=== srd.dndtools.org/es/ Scraper ===\n')

  // --- Scrape Spells ---
  console.log('--- Scraping Spell Lists ---')
  const allSpells: SpellEntry[] = []

  for (const page of SPELL_LIST_PAGES) {
    console.log(`\nFetching ${page.className} spells: ${page.url}`)
    try {
      const html = await fetchPage(page.url)
      const spells = parseSpellListPage(html, page.className)
      console.log(`  Found ${spells.length} spell entries for ${page.className}`)
      allSpells.push(...spells)
    } catch (err) {
      console.error(`  FAILED to fetch ${page.className} spells: ${err}`)
    }
    // Rate limit: 1.5s between requests
    await sleep(1500)
  }

  const mergedSpells = mergeSpells(allSpells)
  console.log(`\nTotal unique spells after merge: ${mergedSpells.length}`)

  // Show a sample
  console.log('\nSample spells:')
  for (const spell of mergedSpells.slice(0, 5)) {
    console.log(
      `  ${spell.englishSlug} -> "${spell.spanishName}" (L${spell.level}, ${spell.classes.join('/')}): ${spell.spanishDescription.slice(0, 60)}...`
    )
  }

  // Save spells
  const spellsPath = `${OUTPUT_DIR}/dndtools-spells-es.json`
  await Bun.write(spellsPath, JSON.stringify(mergedSpells, null, 2))
  console.log(`\nSaved ${mergedSpells.length} spells to ${spellsPath}`)

  // --- Scrape Feats ---
  console.log('\n--- Scraping Feats ---')
  await sleep(1500)

  console.log(`Fetching feats: ${FEAT_PAGE_URL}`)
  try {
    const html = await fetchPage(FEAT_PAGE_URL)
    const feats = parseFeatsPage(html)
    console.log(`Found ${feats.length} feat entries`)

    // Show a sample
    console.log('\nSample feats:')
    for (const feat of feats.slice(0, 5)) {
      console.log(
        `  ${feat.englishSlug} -> "${feat.spanishName}" [${feat.type}]: ${feat.spanishBenefit.slice(0, 60)}...`
      )
    }

    // Save feats
    const featsPath = `${OUTPUT_DIR}/dndtools-feats-es.json`
    await Bun.write(featsPath, JSON.stringify(feats, null, 2))
    console.log(`\nSaved ${feats.length} feats to ${featsPath}`)
  } catch (err) {
    console.error(`FAILED to fetch feats: ${err}`)
  }

  console.log('\n=== Done ===')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
