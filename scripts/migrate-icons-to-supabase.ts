/**
 * Script para migrar iconos a Supabase Storage
 *
 * Pasos:
 * 1. Convierte PNG a WebP (si no existe)
 * 2. Sube los WebP a Supabase Storage
 *
 * Uso:
 *   bun scripts/migrate-icons-to-supabase.ts
 *
 * Prerequisitos:
 *   - cwebp instalado (brew install webp)
 *   - Bucket "icons" creado en Supabase (público)
 *   - Variables de entorno configuradas
 */

import { createClient } from "@supabase/supabase-js"
import { readdir, readFile, mkdir, access, stat } from "fs/promises"
import { join, relative, basename, dirname } from "path"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// Configuración
const ICONS_SOURCE =
  "/Users/cilveti/personal/zukus/packages/core/visualPlayground/server/assets/icons"
const WEBP_OUTPUT = "/tmp/zukus-icons-webp"
const BUCKET_NAME = "icons"
const WEBP_QUALITY = 90
const BATCH_SIZE = 50 // Archivos por batch para subida

// Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Faltan variables de entorno")
  console.error("  EXPO_PUBLIC_SUPABASE_URL")
  console.error("  SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Utilidades
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function getAllPngFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await getAllPngFiles(fullPath)))
    } else if (entry.name.toLowerCase().endsWith(".png")) {
      files.push(fullPath)
    }
  }

  return files
}

async function convertToWebp(
  pngPath: string,
  webpPath: string
): Promise<boolean> {
  // Crear directorio de destino si no existe
  await mkdir(dirname(webpPath), { recursive: true })

  // Si ya existe el webp, saltar
  if (await fileExists(webpPath)) {
    return true
  }

  try {
    await execAsync(`cwebp -q ${WEBP_QUALITY} "${pngPath}" -o "${webpPath}"`)
    return true
  } catch (error) {
    console.error(`Error convirtiendo ${pngPath}:`, error)
    return false
  }
}

async function uploadFile(
  localPath: string,
  storagePath: string
): Promise<boolean> {
  try {
    const fileBuffer = await readFile(localPath)

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: "image/webp",
        upsert: true,
      })

    if (error) {
      // Si el error es que ya existe, no es un error real
      if (error.message?.includes("already exists")) {
        return true
      }
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error subiendo ${storagePath}:`, error)
    return false
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

async function getDirectorySize(dir: string): Promise<number> {
  let totalSize = 0
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      totalSize += await getDirectorySize(fullPath)
    } else {
      const stats = await stat(fullPath)
      totalSize += stats.size
    }
  }

  return totalSize
}

// Main
async function main() {
  console.log("=== Migración de Iconos a Supabase Storage ===\n")

  // Paso 1: Escanear archivos PNG
  console.log("1. Escaneando archivos PNG...")
  const pngFiles = await getAllPngFiles(ICONS_SOURCE)
  console.log(`   Encontrados: ${pngFiles.length} archivos PNG\n`)

  // Paso 2: Convertir a WebP
  console.log("2. Convirtiendo a WebP...")
  await mkdir(WEBP_OUTPUT, { recursive: true })

  let converted = 0
  let skipped = 0
  let conversionErrors = 0

  for (const pngPath of pngFiles) {
    const relativePath = relative(ICONS_SOURCE, pngPath)
    const webpPath = join(WEBP_OUTPUT, relativePath.replace(/\.png$/i, ".webp"))

    if (await fileExists(webpPath)) {
      skipped++
    } else {
      const success = await convertToWebp(pngPath, webpPath)
      if (success) {
        converted++
      } else {
        conversionErrors++
      }
    }

    const total = converted + skipped + conversionErrors
    if (total % 100 === 0) {
      process.stdout.write(
        `\r   Progreso: ${total}/${pngFiles.length} (${converted} nuevos, ${skipped} existentes)`
      )
    }
  }

  console.log(
    `\n   Completado: ${converted} convertidos, ${skipped} ya existían, ${conversionErrors} errores\n`
  )

  // Mostrar tamaño
  const webpSize = await getDirectorySize(WEBP_OUTPUT)
  console.log(`   Tamaño total WebP: ${formatBytes(webpSize)}\n`)

  // Paso 3: Verificar bucket existe
  console.log("3. Verificando bucket en Supabase...")
  const { data: buckets, error: bucketsError } =
    await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error("   Error listando buckets:", bucketsError)
    console.error("\n   Por favor, crea el bucket 'icons' manualmente:")
    console.error("   1. Ve a Supabase Dashboard > Storage")
    console.error("   2. Click 'New bucket'")
    console.error("   3. Nombre: icons")
    console.error("   4. Public bucket: Yes")
    process.exit(1)
  }

  const iconsBucket = buckets?.find((b) => b.name === BUCKET_NAME)
  if (!iconsBucket) {
    console.error(`   Bucket '${BUCKET_NAME}' no existe.`)
    console.error("\n   Por favor, créalo manualmente:")
    console.error("   1. Ve a Supabase Dashboard > Storage")
    console.error("   2. Click 'New bucket'")
    console.error("   3. Nombre: icons")
    console.error("   4. Public bucket: Yes")
    process.exit(1)
  }

  console.log(`   Bucket '${BUCKET_NAME}' encontrado (public: ${iconsBucket.public})\n`)

  // Paso 4: Subir archivos
  console.log("4. Subiendo archivos a Supabase Storage...")

  const webpFiles = await getAllWebpFiles(WEBP_OUTPUT)
  console.log(`   Total archivos WebP: ${webpFiles.length}\n`)

  let uploaded = 0
  let uploadSkipped = 0
  let uploadErrors = 0

  // Procesar en batches
  for (let i = 0; i < webpFiles.length; i += BATCH_SIZE) {
    const batch = webpFiles.slice(i, i + BATCH_SIZE)

    const results = await Promise.all(
      batch.map(async (webpPath) => {
        const relativePath = relative(WEBP_OUTPUT, webpPath)
        return uploadFile(webpPath, relativePath)
      })
    )

    for (const success of results) {
      if (success) {
        uploaded++
      } else {
        uploadErrors++
      }
    }

    const progress = Math.min(i + BATCH_SIZE, webpFiles.length)
    process.stdout.write(
      `\r   Progreso: ${progress}/${webpFiles.length} (${uploaded} subidos, ${uploadErrors} errores)`
    )
  }

  console.log("\n")

  // Resumen final
  console.log("=== Resumen ===")
  console.log(`PNG encontrados:    ${pngFiles.length}`)
  console.log(`WebP convertidos:   ${converted} (${skipped} ya existían)`)
  console.log(`Subidos a Storage:  ${uploaded}`)
  console.log(`Errores:            ${conversionErrors + uploadErrors}`)
  console.log(`\nTamaño total WebP:  ${formatBytes(webpSize)}`)

  // URL de ejemplo
  const exampleFile = webpFiles[0]
  if (exampleFile) {
    const examplePath = relative(WEBP_OUTPUT, exampleFile)
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${examplePath}`
    console.log(`\nURL de ejemplo:`)
    console.log(`  ${publicUrl}`)
  }

  console.log("\n=== Migración completada ===")
}

async function getAllWebpFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await getAllWebpFiles(fullPath)))
    } else if (entry.name.toLowerCase().endsWith(".webp")) {
      files.push(fullPath)
    }
  }

  return files
}

main().catch(console.error)
