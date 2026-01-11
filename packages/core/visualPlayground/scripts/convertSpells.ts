/**
 * Script para convertir los conjuros del compendio al formato de entidad
 * 
 * Uso:
 * bun run scripts/convertSpells.ts
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { Entity } from '@root/core/domain/entities'

interface SourceSpell {
  nombre: string
  descripcion?: string[]
  escuela: string
  subEscuela?: string
  descriptores?: string[]
  componentes?: string[]
  tiempoLanzamiento?: string
  alcance?: string
  duracion?: string[]
  area?: string
  objetivo?: string
  efecto?: string
  tiradaSalvacion?: string
  resistenciaConjuros?: string
  clases?: string[]
  nivel?: string[]
  nivelesNumeros?: string[]
  manual?: string
  originalName?: string
  _id: string
}

interface ConvertedSpell extends Entity {
  name: string
  level: number
  school: string
  subschool?: string
  descriptors?: string[]
  components: string[]
  castingTime: string
  range: string
  duration: string
  area?: string
  target?: string
  effect?: string
  savingThrow?: string
  spellResistance: boolean
  classes: string[]
  manual?: string
  originalName?: string
  description: string
  tags?: string[]
}

function parseSpellResistance(rc: string | undefined): boolean {
  if (!rc) return false
  const rcLower = rc.toLowerCase()
  return rcLower.includes('si') || rcLower.includes('sí') || rcLower.includes('yes')
}

function getMainLevel(nivelesNumeros: string[]): number {
  if (!nivelesNumeros || nivelesNumeros.length === 0) return 0
  
  const numeros = nivelesNumeros
    .map(n => parseInt(n))
    .filter(n => !isNaN(n))
  
  if (numeros.length === 0) return 0
  
  return Math.min(...numeros)
}

function cleanClassName(clase: string): string {
  return clase
    .replace(/\d+/g, '') // Remove numbers
    .replace(/\//g, ',') // Replace / with ,
    .trim()
}

function joinDescription(descripcion: string[]): string {
  if (!descripcion) return ''
  return descripcion.join('\n\n')
}

function convertSpell(source: SourceSpell): ConvertedSpell {
  const description = joinDescription(source.descripcion || [])
  
  return {
    id: source._id,
    name: source.nombre || 'Sin nombre',
    level: getMainLevel(source.nivelesNumeros || []),
    school: source.escuela || 'Desconocida',
    subschool: source.subEscuela || undefined,
    descriptors: source.descriptores || undefined,
    components: source.componentes || [],
    castingTime: source.tiempoLanzamiento || 'Desconocido',
    range: source.alcance || 'Desconocido',
    duration: (source.duracion || []).join(', ') || 'Desconocido',
    area: source.area || undefined,
    target: source.objetivo || undefined,
    effect: source.efecto || undefined,
    savingThrow: source.tiradaSalvacion || undefined,
    spellResistance: parseSpellResistance(source.resistenciaConjuros),
    classes: (source.clases || []).map(cleanClassName),
    manual: source.manual || undefined,
    originalName: source.originalName || undefined,
    description,
    tags: [
      source.escuela,
      ...(source.descriptores || []),
      ...(source.subEscuela ? [source.subEscuela] : []),
    ].filter(Boolean),
  }
}

function main() {
  console.log('🔮 Converting spells from compendium...')
  
  const sourcePath = join(import.meta.dir, '../../conjuros.json')
  const targetPath = join(import.meta.dir, '../src/data/allSpells.ts')
  
  console.log(`📖 Reading from: ${sourcePath}`)
  
  const sourceData = readFileSync(sourcePath, 'utf-8')
  const sourceSpells: SourceSpell[] = JSON.parse(sourceData)
  
  console.log(`✨ Found ${sourceSpells.length} spells`)
  
  const convertedSpells = sourceSpells.map(convertSpell)
  
  console.log(`✅ Converted ${convertedSpells.length} spells`)
  
  const output = `/**
 * All D&D 3.5 spells from the compendium
 * Auto-generated from convertSpells.ts
 * Total: ${convertedSpells.length} spells
 */

export const allSpells = ${JSON.stringify(convertedSpells, null, 2)} as const
`
  
  writeFileSync(targetPath, output, 'utf-8')
  
  console.log(`💾 Saved to: ${targetPath}`)
  console.log('🎉 Done!')
  
  // Stats
  const schoolCounts: Record<string, number> = {}
  const levelCounts: Record<number, number> = {}
  
  convertedSpells.forEach(spell => {
    schoolCounts[spell.school] = (schoolCounts[spell.school] || 0) + 1
    levelCounts[spell.level] = (levelCounts[spell.level] || 0) + 1
  })
  
  console.log('\n📊 Stats:')
  console.log('By School:', schoolCounts)
  console.log('By Level:', levelCounts)
}

main()

