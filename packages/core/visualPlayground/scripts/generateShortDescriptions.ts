#!/usr/bin/env bun
/**
 * Generate short descriptions for all spells using OpenAI API.
 * 
 * Processes spells in batches of 100 with delays between batches.
 * Uses gpt-4o-mini (cheap model) to generate concise Spanish descriptions.
 * 
 * Usage:
 *   bun run scripts/generateShortDescriptions.ts
 * 
 * Make sure OPENAI_API_KEY is set in .env file
 */

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import * as fs from 'fs'
import * as path from 'path'

// Load .env file if it exists
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
} catch (error) {
  console.warn('Could not load .env file:', error)
}

const SPELLS_DIR = path.join(__dirname, '../server/data/entities/spell')
const BATCH_SIZE = 100
const DELAY_BETWEEN_BATCHES_MS = 2000 // 2 seconds
const MODEL = 'gpt-4o-mini' // Cheap model

interface Spell {
  id: string
  name: string
  originalName?: string
  description: string
  level: number
  school: string
  descriptors?: string[]
  shortdescription?: string
  [key: string]: any
}

function loadSpells(): Spell[] {
  const files = fs.readdirSync(SPELLS_DIR)
  const spells: Spell[] = []
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    
    const filePath = path.join(SPELLS_DIR, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const spell = JSON.parse(content) as Spell
    spells.push(spell)
  }
  
  return spells
}

function saveSpell(spell: Spell): void {
  const filePath = path.join(SPELLS_DIR, `${spell.id}.json`)
  fs.writeFileSync(filePath, JSON.stringify(spell, null, 2) + '\n', 'utf-8')
}

async function generateShortDescription(spell: Spell): Promise<string> {
  const prompt = `Eres un experto en D&D 3.5. Genera una descripción MUY CORTA (máximo 60 caracteres) en castellano para el siguiente conjuro.

Conjuro: ${spell.name}${spell.originalName ? ` (${spell.originalName})` : ''}
Nivel: ${spell.level}
Escuela: ${spell.school}
${spell.descriptors && spell.descriptors.length > 0 ? `Descriptores: ${spell.descriptors.join(', ')}` : ''}

Descripción completa:
${spell.description.substring(0, 500)}${spell.description.length > 500 ? '...' : ''}

Instrucciones:
- Máximo 60 caracteres
- Una sola línea
- Descriptivo y conciso
- En castellano
- Describe qué hace el conjuro de forma clara

Descripción corta:`

  try {
    const { text } = await generateText({
      model: openai(MODEL),
      prompt,
      maxTokens: 50,
      temperature: 0.7,
    })
    
    // Clean up the response (remove quotes, trim, limit length)
    let cleaned = text.trim()
    // Remove surrounding quotes if present
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1)
    }
    // Limit to 60 characters
    cleaned = cleaned.substring(0, 60).trim()
    
    return cleaned
  } catch (error) {
    console.error(`Error generating description for ${spell.name}:`, error)
    return ''
  }
}

async function processBatch(spells: Spell[], startIdx: number): Promise<void> {
  const endIdx = Math.min(startIdx + BATCH_SIZE, spells.length)
  const batch = spells.slice(startIdx, endIdx)
  
  console.log(`\nProcessing batch ${Math.floor(startIdx / BATCH_SIZE) + 1}: spells ${startIdx + 1}-${endIdx} of ${spells.length}`)
  
  const promises = batch.map(async (spell, idx) => {
    // Skip if already has shortdescription
    if (spell.shortdescription) {
      console.log(`  [${startIdx + idx + 1}/${spells.length}] Skipping ${spell.name} (already has shortdescription)`)
      return
    }
    
    try {
      const shortDesc = await generateShortDescription(spell)
      
      if (shortDesc) {
        spell.shortdescription = shortDesc
        saveSpell(spell)
        console.log(`  [${startIdx + idx + 1}/${spells.length}] ✓ ${spell.name}: "${shortDesc}"`)
      } else {
        console.log(`  [${startIdx + idx + 1}/${spells.length}] ✗ ${spell.name}: Failed to generate`)
      }
      
      // Small delay between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`  [${startIdx + idx + 1}/${spells.length}] ✗ ${spell.name}: Error`, error)
    }
  })
  
  await Promise.all(promises)
}

async function main() {
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY not found in environment variables!')
    console.error('Please create a .env file with OPENAI_API_KEY=your-key')
    process.exit(1)
  }
  
  console.log('Loading spells...')
  const spells = loadSpells()
  console.log(`Found ${spells.length} spells`)
  
  // Filter spells that need processing
  const spellsToProcess = spells.filter(s => !s.shortdescription)
  console.log(`${spellsToProcess.length} spells need short descriptions`)
  
  if (spellsToProcess.length === 0) {
    console.log('All spells already have short descriptions!')
    return
  }
  
  // Process in batches
  const totalBatches = Math.ceil(spellsToProcess.length / BATCH_SIZE)
  
  for (let i = 0; i < spellsToProcess.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Batch ${batchNum}/${totalBatches}`)
    console.log(`${'='.repeat(60)}`)
    
    await processBatch(spellsToProcess, i)
    
    // Delay between batches (except for the last one)
    if (i + BATCH_SIZE < spellsToProcess.length) {
      console.log(`\nWaiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch...`)
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS))
    }
  }
  
  console.log(`\n${'='.repeat(60)}`)
  console.log('Processing complete!')
  console.log(`${'='.repeat(60)}`)
}

main().catch(console.error)

