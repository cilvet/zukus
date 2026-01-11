#!/usr/bin/env bun
/**
 * Generate optimized English visual descriptions for spells.
 * Based on CLIP testing, uses patterns like:
 * - [color/visual-adj] [element/concept] [optional-type]
 * - Examples: "fire explosion", "blue lightning", "dark necromancy"
 */

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import * as fs from 'fs'
import * as path from 'path'

// Load .env
try {
  const envPath = path.join(__dirname, '../.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim()
        }
      }
    }
  }
} catch {}

const SPELLS_DIR = path.join(__dirname, '../server/data/entities/spell')
const BATCH_SIZE = 100
const DELAY_MS = 2000
const MODEL = 'gpt-4o-mini'

interface Spell {
  id: string
  name: string
  originalName?: string
  description: string
  school?: string
  descriptors?: string[]
  level?: number
  shortdescription?: string
  visualdescription?: string
  [key: string]: any
}

function loadSpells(): Spell[] {
  return fs.readdirSync(SPELLS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(SPELLS_DIR, f), 'utf-8')))
}

function saveSpell(spell: Spell): void {
  fs.writeFileSync(
    path.join(SPELLS_DIR, `${spell.id}.json`),
    JSON.stringify(spell, null, 2) + '\n'
  )
}

async function generateVisualDescription(spell: Spell): Promise<string> {
  const prompt = `Generate a SHORT English visual description for icon search (MAXIMUM 20 characters).

Spell: ${spell.originalName || spell.name}
Level: ${spell.level || 'N/A'}
School: ${spell.school || 'N/A'}
Descriptors: ${spell.descriptors?.join(', ') || 'none'}

RULES:
1. MAXIMUM 20 characters
2. English only
3. Use patterns like:
   - "[color] [element]" → "blue lightning"
   - "[element] [type]" → "fire explosion"
   - "[adjective] [concept]" → "dark necromancy"
4. NO articles (no "a", "the")
5. Focus on VISUAL elements: colors, shapes, elements
6. Prefer 2-3 words maximum

GOOD EXAMPLES:
- "fire explosion"
- "blue lightning"
- "green healing"
- "dark necromancy"
- "magic shield"
- "skeleton hand"

BAD EXAMPLES:
- "a ball of fire"
- "healing magic spell"
- "the finger of death"

Visual description:`

  try {
    const { text } = await generateText({
      model: openai(MODEL),
      prompt,
      maxTokens: 15,
      temperature: 0.3,
    })
    
    let cleaned = text.trim()
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1)
    }
    
    // Remove common articles if present
    cleaned = cleaned.replace(/^(a|an|the)\s+/i, '')
    
    return cleaned.substring(0, 20).trim().toLowerCase()
  } catch (error) {
    console.error(`    ERROR generating for ${spell.name}:`, error)
    return ''
  }
}

async function processBatch(spells: Spell[], startIdx: number): Promise<void> {
  const batch = spells.slice(startIdx, startIdx + BATCH_SIZE)
  
  await Promise.all(batch.map(async (spell, idx) => {
    const visualDesc = await generateVisualDescription(spell)
    if (visualDesc) {
      spell.visualdescription = visualDesc
      saveSpell(spell)
      console.log(`  [${startIdx + idx + 1}/${spells.length}] ✓ ${spell.name}: "${visualDesc}"`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 100))
  }))
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY not found!')
    process.exit(1)
  }
  
  const spells = loadSpells()
  console.log(`Total spells: ${spells.length}`)
  console.log(`Processing ALL spells (will overwrite existing visualdescription)\n`)
  
  for (let i = 0; i < spells.length; i += BATCH_SIZE) {
    console.log(`\nBatch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(spells.length / BATCH_SIZE)}`)
    await processBatch(spells, i)
    
    if (i + BATCH_SIZE < spells.length) {
      console.log(`  Waiting ${DELAY_MS}ms before next batch...`)
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
  }
  
  console.log('\n✅ Complete! All spells now have English visual descriptions.')
  console.log('\nNext step: Run apply_images_to_spells.py to assign images.')
}

main().catch(console.error)


