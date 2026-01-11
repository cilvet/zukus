/**
 * Script para importar los conjuros a la carpeta de datos del servidor
 * Ejecutar con: bun run scripts/importSpells.ts
 */

import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { allSpells } from '../src/data/allSpells'
import { spellSchemaDefinition } from '../src/data/spellSchema'

const DATA_DIR = join(import.meta.dir, '../server/data')
const SCHEMAS_DIR = join(DATA_DIR, 'schemas')
const ENTITIES_DIR = join(DATA_DIR, 'entities')
const SPELL_ENTITIES_DIR = join(ENTITIES_DIR, 'spell')

async function main() {
  console.log('🔮 Importando conjuros...\n')

  // Crear directorios
  await mkdir(SCHEMAS_DIR, { recursive: true })
  await mkdir(SPELL_ENTITIES_DIR, { recursive: true })

  // Guardar el schema de spell
  const schemaPath = join(SCHEMAS_DIR, 'spell.json')
  await writeFile(schemaPath, JSON.stringify(spellSchemaDefinition, null, 2))
  console.log(`✅ Schema guardado: ${schemaPath}`)

  // Guardar cada conjuro como entidad individual
  let count = 0
  let skipped = 0
  for (const spell of allSpells) {
    // Sanitizar ID para usarlo como nombre de archivo
    const safeId = spell.id.replace(/[/\\:*?"<>|]/g, '_')
    
    // Saltar IDs problemáticos
    if (safeId.includes('_design') || safeId.length > 100) {
      skipped++
      continue
    }
    
    const entity = {
      ...spell,
      entityType: 'spell',
    }
    
    const entityPath = join(SPELL_ENTITIES_DIR, `${safeId}.json`)
    await writeFile(entityPath, JSON.stringify(entity, null, 2))
    count++
    
    // Mostrar progreso cada 500 conjuros
    if (count % 500 === 0) {
      console.log(`   Procesados ${count} / ${allSpells.length} conjuros...`)
    }
  }
  
  if (skipped > 0) {
    console.log(`   ⚠️  Saltados ${skipped} conjuros con IDs problemáticos`)
  }

  console.log(`\n✅ Importación completada!`)
  console.log(`   - Schema: 1`)
  console.log(`   - Conjuros: ${count}`)
  console.log(`\n📁 Datos guardados en: ${DATA_DIR}`)
}

main().catch(console.error)

