#!/usr/bin/env bun
/**
 * Generate visual descriptions for all spells using OpenAI API.
 * Ultra short, visual-focused descriptions for image search.
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
const BATCH_SIZE = 300
const DELAY_MS = 2000
const MODEL = 'gpt-4o-mini'

interface Spell {
  id: string
  name: string
  originalName?: string
  description: string
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
  const prompt = `Generate a SIMPLE visual description (max 50 characters) for icon search.

Spell: ${spell.originalName || spell.name}

Rules:
- Use SIMPLE words: colors, shapes, elements
- Examples: "Fire explosion", "Blue ice wall", "Lightning bolt", "Dark shadow", "Green healing light"
- NO artistic language, NO poetry
- Just: COLOR + ELEMENT/SHAPE
- Max 50 characters

Description:`

  try {
    const { text } = await generateText({
      model: openai(MODEL),
      prompt,
      maxTokens: 20,
      temperature: 0.3,
    })
    
    let cleaned = text.trim()
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1)
    }
    return cleaned.substring(0, 50).trim()
  } catch {
    return ''
  }
}

async function processBatch(spells: Spell[], startIdx: number): Promise<void> {
  const batch = spells.slice(startIdx, startIdx + BATCH_SIZE)
  
  await Promise.all(batch.map(async (spell, idx) => {
    if (spell.visualdescription) return
    
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
  const toProcess = spells.filter(s => !s.visualdescription)
  console.log(`Processing ${toProcess.length}/${spells.length} spells`)
  
  if (toProcess.length === 0) return
  
  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    await processBatch(toProcess, i)
    if (i + BATCH_SIZE < toProcess.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
  }
  
  console.log('Complete!')
}

main().catch(console.error)

