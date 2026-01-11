#!/usr/bin/env bun
/**
 * Generate optimized English visual descriptions for spells.
 * 
 * GOAL: Create queries optimized for CLIP image search
 * 
 * Based on extensive CLIP testing with 6293 fantasy icons:
 * - SHORT (2 words): avg score 0.2965
 * - MEDIUM (3-4 words): avg score 0.3040 ⭐ OPTIMAL BALANCE
 * - LONG (5+ words): avg score 0.3057 (marginal +0.0017)
 * 
 * Target: 3-4 words, 25-35 characters max
 * Pattern: [visual-adjective] [element/concept] [type]
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
const BATCH_SIZE = 200
const DELAY_MS = 500
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
  const prompt = `You are an expert at creating search queries for CLIP to find fantasy RPG game icons.

CONTEXT: Imagine you're searching for an ICON that would appear in a video game's spell menu for this spell. Think about what simple, recognizable visual would represent this spell at a glance.

SPELL: ${spell.originalName || spell.name}
Level: ${spell.level || '?'}
School: ${spell.school || 'Unknown'}
Descriptors: ${spell.descriptors?.join(', ') || 'none'}

REQUIREMENTS:
1. EXACTLY 3-4 words (25-35 characters max)
2. English only, lowercase
3. NO articles ("a", "an", "the")
4. Describe the ICON, not the spell effect
5. Think: "What would this look like as a video game ability icon?"

ICON DESCRIPTION PATTERNS (tested, high-scoring):
- "blue lightning strike" → Lightning Bolt spell
- "green healing light" → Cure Wounds spell
- "bright fire explosion" → Fireball spell
- "dark skull death" → Finger of Death spell
- "glowing magic shield" → Shield spell
- "fast feet icon" → Haste spell
- "transparent fade" → Invisibility spell
- "sticky spider web" → Web spell
- "purple swirl portal" → Teleport spell

MORE ICON EXAMPLES:
✓ Fly spell → "wings magic flight"
✓ Stoneskin → "gray stone armor"
✓ Mage Armor → "blue force field"
✓ Magic Missile → "purple magic darts"
✓ Slow → "chains clock slow"
✓ Confusion → "swirling mind chaos"
✓ Polymorph → "beast transformation"
✓ Mirror Image → "multiple duplicates"

THINK LIKE A GAME UI DESIGNER:
- What symbol represents this spell?
- What would players recognize instantly?
- What colors/shapes define it?
- What's the core visual metaphor?

VISUAL KEYWORDS FOR ICONS:
- Speed/Time: fast, slow, clock, hourglass, wings
- Protection: shield, armor, barrier, aura
- Damage: fire, ice, lightning, explosion, blast
- Status: chains, stars, skull, eye, hand
- Movement: wings, feet, portal, wind
- Mind: brain, eye, spiral, confusion
- Transformation: beast, form, morph, shape

YOUR ICON DESCRIPTION (3-4 words, lowercase):`

  try {
    const { text } = await generateText({
      model: openai(MODEL),
      prompt,
      maxTokens: 20,
      temperature: 0.2, // Lower temperature for more consistent results
    })
    
    let cleaned = text.trim()
    
    // Remove quotes if present
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1)
    }
    
    // Remove articles aggressively
    cleaned = cleaned.replace(/^(a|an|the)\s+/gi, '')
    cleaned = cleaned.replace(/\s+(a|an|the)\s+/gi, ' ')
    
    // Remove common filler words
    cleaned = cleaned.replace(/\s+(with|of|and|or)\s+/gi, ' ')
    
    // Lowercase and clean up spaces
    cleaned = cleaned.toLowerCase().replace(/\s+/g, ' ').trim()
    
    // Limit to 35 chars
    if (cleaned.length > 35) {
      // Try to cut at word boundary
      const words = cleaned.split(' ')
      cleaned = words.slice(0, 4).join(' ')
      if (cleaned.length > 35) {
        cleaned = cleaned.substring(0, 35).trim()
      }
    }
    
    return cleaned
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
      
      const charCount = visualDesc.length
      const wordCount = visualDesc.split(' ').length
      const indicator = wordCount >= 3 && wordCount <= 4 && charCount <= 35 ? '✓' : '⚠'
      console.log(`  [${startIdx + idx + 1}] ${indicator} ${spell.name}`)
      console.log(`    → "${visualDesc}" (${charCount}ch, ${wordCount}w)`)
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
  console.log(`\n${'='.repeat(80)}`)
  console.log('🎯 OPTIMIZED VISUAL DESCRIPTION GENERATOR FOR CLIP SEARCH')
  console.log('='.repeat(80))
  console.log(`\n📊 Statistics:`)
  console.log(`   Total spells: ${spells.length}`)
  console.log(`   Target format: 3-4 words, 25-35 characters`)
  console.log(`   Language: English (lowercase)`)
  console.log(`   Model: ${MODEL}`)
  console.log(`\n🎨 Based on testing with 6293 fantasy icons:`)
  console.log(`   - Medium length queries scored 0.3040 avg (optimal)`)
  console.log(`   - English queries scored 36% higher than Spanish`)
  console.log(`   - Visual adjectives + element pattern works best`)
  console.log(`\n⚠️  WARNING: This will OVERWRITE existing visualdescription fields`)
  
  const readline = await import('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  const answer = await new Promise<string>((resolve) => {
    rl.question('\nContinue? (y/N): ', resolve)
  })
  rl.close()
  
  if (answer.toLowerCase() !== 'y') {
    console.log('Cancelled.')
    return
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('Starting generation...')
  console.log('='.repeat(80))
  
  const startTime = Date.now()
  
  for (let i = 0; i < spells.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(spells.length / BATCH_SIZE)
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (spells ${i + 1}-${Math.min(i + BATCH_SIZE, spells.length)})`)
    console.log('-'.repeat(80))
    
    await processBatch(spells, i)
    
    if (i + BATCH_SIZE < spells.length) {
      console.log(`\n⏳ Waiting ${DELAY_MS}ms before next batch...`)
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
  }
  
  const elapsed = Math.round((Date.now() - startTime) / 1000)
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ COMPLETE!')
  console.log('='.repeat(80))
  console.log(`\n⏱️  Time elapsed: ${elapsed}s`)
  console.log(`📝 Generated descriptions for ${spells.length} spells`)
  console.log(`\n📋 Next steps:`)
  console.log(`   1. Review a sample of descriptions for quality`)
  console.log(`   2. Run image assignment:`)
  console.log(`      cd ../icon-search`)
  console.log(`      python3 apply_images_to_spells.py`)
  console.log(`   3. Check results in the UI`)
  console.log(`\n💡 Tip: If results aren't good, you can regenerate specific spells`)
  console.log(`   by deleting their 'visualdescription' field and re-running.`)
}

main().catch(console.error)
