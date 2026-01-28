/**
 * Script para migrar las imágenes de spells desde visualPlayground al compendio
 *
 * El matching se hace por originalName (nombre en inglés)
 * Las imágenes se convierten de .png a .webp (ya están subidas a Supabase)
 *
 * Uso:
 *   bun scripts/migrate-spell-images.ts
 */

import { readdir, readFile, writeFile } from "fs/promises"
import { join } from "path"

// Rutas
const VISUAL_PLAYGROUND_SPELLS =
  "/Users/cilveti/personal/zukus/packages/core/visualPlayground/server/data/entities/spell"
const COMPENDIUM_SPELLS =
  "/Users/cilveti/personal/zukus/packages/core/core/domain/entities/relations/__testdata__/spells.json"

type VisualPlaygroundSpell = {
  id: string
  name: string
  originalName?: string
  image?: string
}

type CompendiumSpell = {
  id: string
  name: string
  originalName?: string
  image?: string
  [key: string]: unknown
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "") // Remove non-alphanumeric
}

async function main() {
  console.log("=== Migración de Imágenes de Spells ===\n")

  // 1. Cargar spells del visualPlayground
  console.log("1. Cargando spells del visualPlayground...")
  const vpFiles = await readdir(VISUAL_PLAYGROUND_SPELLS)
  const jsonFiles = vpFiles.filter((f) => f.endsWith(".json"))
  console.log(`   Encontrados: ${jsonFiles.length} archivos\n`)

  // Crear mapa de imágenes por originalName y name
  const imageByOriginalName = new Map<string, string>()
  const imageByName = new Map<string, string>()

  let withImage = 0
  let withoutImage = 0

  for (const file of jsonFiles) {
    const content = await readFile(join(VISUAL_PLAYGROUND_SPELLS, file), "utf-8")
    const spell: VisualPlaygroundSpell = JSON.parse(content)

    if (spell.image) {
      withImage++
      // Convertir .png a .webp
      const webpImage = spell.image.replace(/\.png$/i, ".webp")

      if (spell.originalName) {
        const key = normalizeString(spell.originalName)
        imageByOriginalName.set(key, webpImage)
      }
      if (spell.name) {
        const key = normalizeString(spell.name)
        imageByName.set(key, webpImage)
      }
    } else {
      withoutImage++
    }
  }

  console.log(`   Con imagen: ${withImage}`)
  console.log(`   Sin imagen: ${withoutImage}\n`)

  // 2. Cargar spells del compendio
  console.log("2. Cargando spells del compendio...")
  const compendiumContent = await readFile(COMPENDIUM_SPELLS, "utf-8")
  const compendiumSpells: CompendiumSpell[] = JSON.parse(compendiumContent)
  console.log(`   Total: ${compendiumSpells.length} spells\n`)

  // 3. Hacer matching y añadir imágenes
  console.log("3. Haciendo matching de imágenes...")

  let matched = 0
  let notMatched = 0
  const notMatchedNames: string[] = []

  for (const spell of compendiumSpells) {
    let image: string | undefined

    // Intentar match por originalName primero
    if (spell.originalName) {
      const key = normalizeString(spell.originalName)
      image = imageByOriginalName.get(key)
    }

    // Fallback: match por name
    if (!image && spell.name) {
      const key = normalizeString(spell.name)
      image = imageByName.get(key)
    }

    if (image) {
      spell.image = image
      matched++
    } else {
      notMatched++
      if (notMatchedNames.length < 20) {
        notMatchedNames.push(spell.name)
      }
    }
  }

  console.log(`   Matched: ${matched}`)
  console.log(`   Sin match: ${notMatched}`)
  if (notMatchedNames.length > 0) {
    console.log(`   Ejemplos sin match: ${notMatchedNames.slice(0, 5).join(", ")}...\n`)
  }

  // 4. Guardar el resultado
  console.log("4. Guardando resultado...")
  await writeFile(COMPENDIUM_SPELLS, JSON.stringify(compendiumSpells, null, 2), "utf-8")
  console.log(`   Guardado en: ${COMPENDIUM_SPELLS}\n`)

  // Resumen
  console.log("=== Resumen ===")
  console.log(`Spells en visualPlayground: ${jsonFiles.length}`)
  console.log(`Spells con imagen: ${withImage}`)
  console.log(`Spells en compendio: ${compendiumSpells.length}`)
  console.log(`Spells con imagen asignada: ${matched}`)
  console.log(`Spells sin imagen: ${notMatched}`)

  // Ejemplo de URL final
  const exampleSpell = compendiumSpells.find((s) => s.image)
  if (exampleSpell) {
    console.log(`\nEjemplo de URL final:`)
    console.log(
      `  https://utimatychnwjuxogjfwc.supabase.co/storage/v1/object/public/icons/${exampleSpell.image}`
    )
  }

  console.log("\n=== Migración completada ===")
}

main().catch(console.error)
