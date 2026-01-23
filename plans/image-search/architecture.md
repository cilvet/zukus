# Arquitectura

## Diagrama general

```
┌─────────────────────────────────────────────────────────────┐
│                         APP                                  │
│                                                              │
│  expo-image con cachePolicy="memory-disk"                   │
│  (una vez descargada, no vuelve a pedirla)                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ IconSearchService                                    │    │
│  │                                                      │    │
│  │ searchIcons({ query, category, tags, limit })       │    │
│  │ → supabase.from('icons').select()...                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                                │
│                                                              │
│  ┌─────────────────────┐    ┌─────────────────────────┐     │
│  │ Storage (CDN)       │    │ Database                │     │
│  │                     │    │                         │     │
│  │ bucket: icons       │    │ icons                   │     │
│  │ └── 6293 WebPs      │    │ ├── id                  │     │
│  │                     │    │ ├── storage_path        │     │
│  │ Publico             │    │ ├── name                │     │
│  │ CDN global          │    │ ├── category            │     │
│  │                     │    │ ├── subcategory         │     │
│  │                     │    │ ├── tags[]              │     │
│  │                     │    │ └── fts (tsvector)      │     │
│  └─────────────────────┘    └─────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Componentes

### 1. Supabase Storage

**Bucket**: `icons`
- Publico (sin auth requerida para leer)
- CDN global incluido (285+ edge nodes)
- Estructura de carpetas por categoria

**URL de acceso**:
```
https://<project>.supabase.co/storage/v1/object/public/icons/<path>
```

### 2. Tabla `icons`

```sql
create table icons (
  id bigint primary key generated always as identity,

  -- Referencia al archivo en Storage
  storage_path text not null unique,  -- ej: "armor/helm_02.webp"

  -- Metadata para busqueda
  name text not null,                 -- "Helm 02"
  category text not null,             -- "armor"
  subcategory text,                   -- "basic", "medieval", etc.
  tags text[] default '{}',           -- ["helmet", "metal", "protection"]

  -- Full-text search
  fts tsvector generated always as (
    setweight(to_tsvector('english', name), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'B')
  ) stored,

  created_at timestamptz default now()
);

-- Indices
create index icons_fts_idx on icons using gin(fts);
create index icons_category_idx on icons(category);
create index icons_subcategory_idx on icons(subcategory);
```

### 3. IconSearchService

```typescript
// services/iconSearch.ts

type IconSearchOptions = {
  query?: string
  category?: string
  subcategory?: string
  tags?: string[]
  limit?: number
}

type IconResult = {
  id: number
  storagePath: string
  name: string
  category: string
  subcategory: string | null
  tags: string[]
  imageUrl: string
}

async function searchIcons(options: IconSearchOptions): Promise<IconResult[]> {
  const { query, category, subcategory, tags, limit = 50 } = options

  let queryBuilder = supabase
    .from('icons')
    .select('*')
    .limit(limit)

  // Busqueda full-text
  if (query) {
    queryBuilder = queryBuilder.textSearch('fts', query)
  }

  // Filtros
  if (category) {
    queryBuilder = queryBuilder.eq('category', category)
  }

  if (subcategory) {
    queryBuilder = queryBuilder.eq('subcategory', subcategory)
  }

  if (tags?.length) {
    queryBuilder = queryBuilder.overlaps('tags', tags)
  }

  const { data, error } = await queryBuilder

  if (error) throw error

  return data.map(icon => ({
    ...icon,
    imageUrl: getIconUrl(icon.storage_path)
  }))
}

function getIconUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/icons/${storagePath}`
}
```

### 4. Cache en la app

```typescript
// Usando expo-image
import { Image } from 'expo-image'

<Image
  source={{ uri: icon.imageUrl }}
  cachePolicy="memory-disk"  // Cache agresivo
  contentFit="contain"
  style={{ width: 64, height: 64 }}
/>
```

## Flujo de datos

### Busqueda de iconos

```
1. Usuario abre selector de iconos
2. Usuario escribe "sword" o selecciona categoria "weapons"
3. App llama searchIcons({ query: "sword", category: "weapons" })
4. Supabase ejecuta query con full-text search + filtros
5. App recibe lista de iconos con URLs
6. expo-image carga imagenes (de cache si ya las tiene)
7. Usuario selecciona un icono
8. Se guarda storage_path en la entidad
```

### Mostrar icono guardado

```
1. Entidad tiene campo image_path = "weapons/sword_01.webp"
2. App construye URL: getIconUrl(image_path)
3. expo-image carga desde cache o CDN
```
