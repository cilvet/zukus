/**
 * Script para transformar conjuros.json en:
 * 1. Entidades de tipo spell (sin classLevels embebido)
 * 2. Entidades de tipo relación spell-class
 *
 * Uso: bun packages/core/scripts/transformSpellsToRelations.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// ============================================================================
// Tipos
// ============================================================================

type RawSpell = {
  nombre: string
  descripcion: string[]
  escuela: string
  subEscuela?: string
  descriptores?: string[]
  componentes: string[]
  tiempoLanzamiento: string
  alcance: string
  duracion: string[]
  area?: string
  objetivo?: string
  efecto?: string
  tiradaSalvacion?: string
  resistenciaConjuros?: string
  clases: string[]
  nivelesNumeros: string[]
  nivel: string[]
  manual?: string
  originalName?: string
  _id: string
}

type SpellEntity = {
  id: string
  entityType: 'spell'
  name: string
  originalName?: string
  description: string
  school: string
  subschool?: string
  descriptors: string[]
  components: string[]
  castingTime: string
  range: string
  duration: string
  area?: string
  target?: string
  effect?: string
  savingThrow?: string
  spellResistance: string
  source?: string
}

type SpellClassRelation = {
  id: string
  entityType: 'spell-class-relation'
  fromEntityId: string
  toEntityId: string
  metadata: {
    level: number
  }
}

// ============================================================================
// Normalización de nombres de clase
// ============================================================================

const CLASS_NORMALIZATION: Record<string, string> = {
  'hech / mago': 'wizard',
  'hech. / mago': 'wizard',
  'hechicero / mago': 'wizard',
  'mago': 'wizard',
  'hechicero': 'sorcerer',
  'clérigo': 'cleric',
  'clerigo': 'cleric',
  'druida': 'druid',
  'paladín': 'paladin',
  'paladin': 'paladin',
  'explorador': 'ranger',
  'bardo': 'bard',
  'asesino': 'assassin',
  'g negro': 'blackguard',
  'g. negro': 'blackguard',
  'guardián negro': 'blackguard',
  // Clases especiales
  'iniciado de helm': 'initiate-of-helm',
  'aguanegra': 'blackwater',
  'wu jen': 'wu-jen',
  'archivista': 'archivist',
  'adepto': 'adept',
  'brujo': 'warlock',
  // Dominios (los dejamos como están por ahora)
}

function normalizeClassName(rawName: string): string {
  const lower = rawName.toLowerCase().trim()
  return CLASS_NORMALIZATION[lower] || lower.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function generateSpellId(nombre: string | undefined, originalId: string): string {
  if (!nombre) return originalId

  // Usar el nombre normalizado como ID, con fallback al _id original
  const normalized = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s]/g, '') // Solo alfanuméricos y espacios
    .trim()
    .replace(/\s+/g, '-')

  return normalized || originalId
}

// ============================================================================
// Transformación
// ============================================================================

function transformSpells(rawSpells: RawSpell[]): {
  spells: SpellEntity[]
  relations: SpellClassRelation[]
  stats: {
    totalSpells: number
    totalRelations: number
    uniqueClasses: string[]
    levelDistribution: Record<number, number>
  }
} {
  const spells: SpellEntity[] = []
  const relations: SpellClassRelation[] = []
  const classSet = new Set<string>()
  const levelDistribution: Record<number, number> = {}

  const seenSpellIds = new Set<string>()

  for (const raw of rawSpells) {
    // Saltar entradas sin nombre
    if (!raw.nombre) {
      console.warn(`Saltando entrada sin nombre: ${raw._id}`)
      continue
    }

    // Generar ID único para el spell
    let spellId = generateSpellId(raw.nombre, raw._id)

    // Evitar duplicados
    let suffix = 1
    const baseId = spellId
    while (seenSpellIds.has(spellId)) {
      spellId = `${baseId}-${suffix}`
      suffix++
    }
    seenSpellIds.add(spellId)

    // Crear entidad de spell
    const spell: SpellEntity = {
      id: spellId,
      entityType: 'spell',
      name: raw.nombre,
      originalName: raw.originalName,
      description: raw.descripcion.join('\n\n'),
      school: raw.escuela.toLowerCase(),
      subschool: raw.subEscuela ? raw.subEscuela.toLowerCase() : undefined,
      descriptors: (raw.descriptores || []).map((d) => d.trim().toLowerCase()),
      components: raw.componentes,
      castingTime: raw.tiempoLanzamiento,
      range: raw.alcance,
      duration: raw.duracion.join(', '),
      area: raw.area,
      target: raw.objetivo,
      effect: raw.efecto,
      savingThrow: raw.tiradaSalvacion,
      spellResistance: raw.resistenciaConjuros || 'No',
      source: raw.manual
    }

    // Limpiar campos undefined
    Object.keys(spell).forEach((key) => {
      if ((spell as Record<string, unknown>)[key] === undefined) {
        delete (spell as Record<string, unknown>)[key]
      }
    })

    spells.push(spell)

    // Crear relaciones spell-class
    const classes = raw.clases || []
    const levels = raw.nivelesNumeros || []

    for (let i = 0; i < classes.length; i++) {
      const className = classes[i]
      const levelStr = levels[i] || '0'
      const level = parseInt(levelStr, 10)

      if (isNaN(level)) continue

      const normalizedClass = normalizeClassName(className)
      classSet.add(normalizedClass)

      // Estadísticas
      levelDistribution[level] = (levelDistribution[level] || 0) + 1

      const relation: SpellClassRelation = {
        id: `${spellId}--${normalizedClass}`,
        entityType: 'spell-class-relation',
        fromEntityId: spellId,
        toEntityId: normalizedClass,
        metadata: { level }
      }

      relations.push(relation)
    }
  }

  return {
    spells,
    relations,
    stats: {
      totalSpells: spells.length,
      totalRelations: relations.length,
      uniqueClasses: Array.from(classSet).sort(),
      levelDistribution
    }
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('Leyendo conjuros.json...')

  const inputPath = path.join(__dirname, '..', 'conjuros.json')
  const rawContent = fs.readFileSync(inputPath, 'utf-8')
  const rawSpells: RawSpell[] = JSON.parse(rawContent)

  console.log(`Encontrados ${rawSpells.length} conjuros`)

  console.log('Transformando...')
  const { spells, relations, stats } = transformSpells(rawSpells)

  // Crear directorio de salida
  const outputDir = path.join(__dirname, '..', 'core', 'domain', 'entities', 'relations', '__testdata__')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Guardar spells
  const spellsPath = path.join(outputDir, 'spells.json')
  fs.writeFileSync(spellsPath, JSON.stringify(spells, null, 2))
  console.log(`Guardados ${spells.length} spells en ${spellsPath}`)

  // Guardar relations
  const relationsPath = path.join(outputDir, 'spell-class-relations.json')
  fs.writeFileSync(relationsPath, JSON.stringify(relations, null, 2))
  console.log(`Guardadas ${relations.length} relaciones en ${relationsPath}`)

  // Mostrar estadísticas
  console.log('\n=== Estadísticas ===')
  console.log(`Total spells: ${stats.totalSpells}`)
  console.log(`Total relations: ${stats.totalRelations}`)
  console.log(`Clases únicas (${stats.uniqueClasses.length}):`)
  console.log(stats.uniqueClasses.join(', '))
  console.log('\nDistribución por nivel:')
  Object.entries(stats.levelDistribution)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([level, count]) => {
      console.log(`  Nivel ${level}: ${count} relaciones`)
    })
}

main().catch(console.error)
