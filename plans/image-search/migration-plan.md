# Plan de Migracion

## Overview

Migrar 6293 iconos PNG a Supabase Storage como WebP.

## Pasos

### 1. Convertir PNG a WebP

```bash
# Instalar cwebp
brew install webp

# Crear directorio de salida
mkdir -p /tmp/icons-webp

# Convertir todos los PNGs
cd /path/to/5000_fantasy_icons
find . -name "*.png" -exec sh -c '
  mkdir -p "/tmp/icons-webp/$(dirname "$1")"
  cwebp -q 90 "$1" -o "/tmp/icons-webp/${1%.png}.webp"
' _ {} \;
```

**Resultado esperado**:
- Input: ~100-150 MB (PNG)
- Output: ~30-50 MB (WebP)

### 2. Crear bucket en Supabase

```sql
-- Via SQL o Dashboard
insert into storage.buckets (id, name, public)
values ('icons', 'icons', true);
```

O via Dashboard:
1. Storage → New Bucket
2. Name: `icons`
3. Public: Yes

### 3. Crear tabla de metadata

```sql
create table icons (
  id bigint primary key generated always as identity,
  storage_path text not null unique,
  name text not null,
  category text not null,
  subcategory text,
  tags text[] default '{}',
  fts tsvector generated always as (
    setweight(to_tsvector('english', name), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'B')
  ) stored,
  created_at timestamptz default now()
);

create index icons_fts_idx on icons using gin(fts);
create index icons_category_idx on icons(category);
create index icons_subcategory_idx on icons(subcategory);
```

### 4. Script de migracion

```typescript
// scripts/migrate-icons.ts
import { createClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'fs/promises'
import { join, relative, parse, basename } from 'path'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ICONS_ROOT = '/tmp/icons-webp'

// Mapeo de carpetas a categorias
const CATEGORY_MAP: Record<string, { category: string; subcategory?: string }> = {
  'ArmorIcons/BasicArmor_Icons': { category: 'armor', subcategory: 'basic' },
  'ArmorIcons/ArmorSet_Icons': { category: 'armor', subcategory: 'sets' },
  'ArmorIcons/RingAndNeck_Icons': { category: 'armor', subcategory: 'accessories' },
  'WeaponIcons/WeaponIconsVol1': { category: 'weapons', subcategory: 'vol1' },
  'WeaponIcons/WeaponIconsVol2': { category: 'weapons', subcategory: 'vol2' },
  'SkillsIcons': { category: 'skills' },
  'MedievalIcons': { category: 'medieval' },
  'ProfessionIcons': { category: 'professions' },
}

async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath))
    } else if (entry.name.endsWith('.webp')) {
      files.push(fullPath)
    }
  }

  return files
}

function humanizeName(filename: string): string {
  return basename(filename, '.webp')
    .replace(/_/g, ' ')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

function getCategoryInfo(relativePath: string) {
  for (const [prefix, info] of Object.entries(CATEGORY_MAP)) {
    if (relativePath.startsWith(prefix)) {
      return info
    }
  }
  // Default: usar primer directorio como categoria
  const category = relativePath.split('/')[0].replace('Icons', '').toLowerCase()
  return { category }
}

function extractTags(name: string, category: string): string[] {
  const tags: string[] = [category]

  // Extraer palabras del nombre
  const words = name.toLowerCase().split(/[\s_-]+/)
  tags.push(...words.filter(w => w.length > 2))

  return [...new Set(tags)]
}

async function migrate() {
  console.log('Scanning files...')
  const files = await getAllFiles(ICONS_ROOT)
  console.log(`Found ${files.length} files`)

  let uploaded = 0
  let errors = 0

  for (const filePath of files) {
    const relativePath = relative(ICONS_ROOT, filePath)
    const name = humanizeName(basename(filePath))
    const { category, subcategory } = getCategoryInfo(relativePath)
    const tags = extractTags(name, category)

    try {
      // 1. Subir a Storage
      const fileBuffer = await readFile(filePath)
      const { error: uploadError } = await supabase.storage
        .from('icons')
        .upload(relativePath, fileBuffer, {
          contentType: 'image/webp',
          upsert: true
        })

      if (uploadError) throw uploadError

      // 2. Insertar metadata
      const { error: insertError } = await supabase
        .from('icons')
        .upsert({
          storage_path: relativePath,
          name,
          category,
          subcategory,
          tags
        }, {
          onConflict: 'storage_path'
        })

      if (insertError) throw insertError

      uploaded++
      if (uploaded % 100 === 0) {
        console.log(`Uploaded ${uploaded}/${files.length}`)
      }
    } catch (err) {
      console.error(`Error with ${relativePath}:`, err)
      errors++
    }
  }

  console.log(`Done! Uploaded: ${uploaded}, Errors: ${errors}`)
}

migrate()
```

### 5. Ejecutar migracion

```bash
cd scripts
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ... \
bun run migrate-icons.ts
```

### 6. Verificar

```sql
-- Contar iconos
select count(*) from icons;
-- Esperado: 6293

-- Verificar categorias
select category, count(*)
from icons
group by category
order by count(*) desc;

-- Probar busqueda
select * from icons
where fts @@ to_tsquery('english', 'sword')
limit 10;
```

## Estimacion de tiempo

| Paso | Tiempo estimado |
|------|-----------------|
| Conversion PNG → WebP | ~5-10 min |
| Crear bucket + tabla | ~2 min |
| Subir 6293 archivos | ~15-30 min |
| Verificacion | ~5 min |
| **Total** | **~30-50 min** |

## Rollback

```sql
-- Eliminar datos
delete from icons;
drop table icons;

-- Eliminar bucket (via Dashboard o API)
-- Storage → icons → Delete bucket
```
