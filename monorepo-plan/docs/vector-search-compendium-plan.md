# Busqueda Vectorial en Compendios

Plan para implementar busqueda semantica sobre items de compendio respetando el sistema de permisos existente.

## Contexto

### Estructura actual de datos

**`sources`** (compendios/libros fuente):
- `id`, `name`, `description`, `publisher`
- `owner_id` - usuario dueno del source
- `campaign_id` - opcional, si pertenece a una campana
- `is_private` - si es publico o privado

**`compendium_items`** (items dentro de los compendios):
- `id`, `name`, `item_type`, `data` (jsonb)
- `owner_id` - usuario dueno del item
- `source_book_id` - FK a sources

### Politicas RLS actuales en `compendium_items`

Un usuario puede ver items si:

1. **Es dueno**: `owner_id = auth.uid()`
2. **Source publico**: `source_book_id` en sources donde `is_private = false`
3. **Source de campana**: El source pertenece a una campana donde el usuario es DM o tiene un personaje

La politica 3 implica JOINs complejos: `sources -> campaigns -> campaign_characters -> characters -> user`

## Escenarios de uso reales

El usuario **nunca** buscara sobre todos los items de todas las campanas a las que pertenece. Los escenarios reales son:

| Escenario | Filtro |
|-----------|--------|
| Items de **una campana especifica** | `WHERE source_book_id IN (SELECT id FROM sources WHERE campaign_id = $campaign_id)` |
| Items de **mis sources personales** | `WHERE owner_id = auth.uid() OR source_book_id IN (SELECT id FROM sources WHERE owner_id = auth.uid())` |

Esto simplifica el problema porque el filtro es simple e indexable.

## Solucion propuesta

### 1. Habilitar pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

pgvector esta disponible en Supabase (v0.8.0) pero no instalado actualmente.

### 2. Anadir columnas de embedding

```sql
ALTER TABLE compendium_items
ADD COLUMN embedding vector(1536),           -- 1536 para text-embedding-3-small
ADD COLUMN embedding_updated_at timestamptz; -- para tracking de indexacion
```

La columna `embedding_updated_at` permite detectar items pendientes de indexar comparando con `modified`.

### 3. Crear indice HNSW

```sql
CREATE INDEX compendium_items_embedding_idx
ON compendium_items
USING hnsw (embedding vector_cosine_ops);
```

### 4. Funciones de busqueda en Postgres

El SDK de Supabase no soporta el operador `<->` (distancia vectorial), asi que la busqueda debe estar en funciones almacenadas.

#### Busqueda en una campana

```sql
CREATE OR REPLACE FUNCTION search_campaign_items(
  p_campaign_id uuid,
  query_embedding vector(1536),
  limit_n int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  item_type text,
  data jsonb,
  source_book_id uuid,
  similarity float
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    ci.id,
    ci.name,
    ci.item_type,
    ci.data,
    ci.source_book_id,
    1 - (ci.embedding <=> query_embedding) as similarity
  FROM compendium_items ci
  JOIN sources s ON ci.source_book_id = s.id
  WHERE s.campaign_id = p_campaign_id
    AND ci.embedding IS NOT NULL  -- solo items indexados
    AND can_access_campaign(p_campaign_id, auth.uid())
  ORDER BY ci.embedding <=> query_embedding
  LIMIT limit_n;
$$;
```

#### Busqueda en mis sources personales

```sql
CREATE OR REPLACE FUNCTION search_my_items(
  query_embedding vector(1536),
  limit_n int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  item_type text,
  data jsonb,
  source_book_id uuid,
  similarity float
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    ci.id,
    ci.name,
    ci.item_type,
    ci.data,
    ci.source_book_id,
    1 - (ci.embedding <=> query_embedding) as similarity
  FROM compendium_items ci
  LEFT JOIN sources s ON ci.source_book_id = s.id
  WHERE ci.embedding IS NOT NULL  -- solo items indexados
    AND (ci.owner_id = auth.uid() OR s.owner_id = auth.uid())
  ORDER BY ci.embedding <=> query_embedding
  LIMIT limit_n;
$$;
```

### 5. Integracion con el servidor

El servidor actual (`apps/server/`) usa Supabase con `service_role_key` y hace queries via SDK.

```typescript
// apps/server/src/compendiumSearch.ts

import { supabase } from './supabaseClient'

export async function searchCampaignItems(
  campaignId: string,
  queryText: string,
  limit: number = 10
) {
  // 1. Generar embedding del texto de busqueda
  const embedding = await generateEmbedding(queryText)  // OpenAI/Anthropic/etc

  // 2. Llamar a la funcion de Postgres
  const { data, error } = await supabase.rpc('search_campaign_items', {
    p_campaign_id: campaignId,
    query_embedding: embedding,
    limit_n: limit
  })

  if (error) throw error
  return data
}

export async function searchMyItems(
  queryText: string,
  limit: number = 10
) {
  const embedding = await generateEmbedding(queryText)

  const { data, error } = await supabase.rpc('search_my_items', {
    query_embedding: embedding,
    limit_n: limit
  })

  if (error) throw error
  return data
}
```

## Flujo de insercion de embeddings

### Contexto de uso

Las busquedas vectoriales las realizara la IA del chat, no el usuario directamente. Esto significa:
- La IA puede formular queries especificas y relevantes
- No hay problema de "queries pobres" del usuario
- La IA tiene conocimiento de D&D para hacer busquedas inteligentes

### Estrategia: Insercion sincrona

Dado el volumen bajo (~184 items) y que los items no se crean/editan constantemente, usamos insercion sincrona (embedding generado en el momento del guardado).

```typescript
// apps/server/src/embeddings.ts

import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  })
  return response.data[0].embedding
}

export function prepareTextForEmbedding(item: {
  name: string
  item_type: string
  data: Record<string, unknown>
}): string {
  // Incluir metadata estructurada + contenido
  return `
TIPO: ${item.item_type}
NOMBRE: ${item.name}
CONTENIDO: ${JSON.stringify(item.data)}
  `.trim()
}
```

### Guardado con embedding

```typescript
// apps/server/src/compendiumItems.ts

import { supabase } from './supabaseClient'
import { generateEmbedding, prepareTextForEmbedding } from './embeddings'

export async function saveCompendiumItem(item: CompendiumItem) {
  // 1. Preparar texto para embedding
  const textToEmbed = prepareTextForEmbedding(item)

  // 2. Generar embedding via OpenAI (~200-500ms)
  const embedding = await generateEmbedding(textToEmbed)

  // 3. Guardar item + embedding en una sola operacion
  const { data, error } = await supabase
    .from('compendium_items')
    .upsert({
      id: item.id,
      name: item.name,
      item_type: item.item_type,
      data: item.data,
      owner_id: item.owner_id,
      source_book_id: item.source_book_id,
      embedding,
      embedding_updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Columnas adicionales para tracking

```sql
ALTER TABLE compendium_items
ADD COLUMN embedding vector(1536),
ADD COLUMN embedding_updated_at timestamptz;
```

La columna `embedding_updated_at` permite:
- Saber si un item tiene embedding (`IS NOT NULL`)
- Detectar items con embeddings desactualizados (`embedding_updated_at < modified`)
- Re-indexar items que cambiaron despues de su ultimo embedding

### Query para items pendientes de indexar

```sql
-- Items sin embedding o con embedding desactualizado
SELECT id, name
FROM compendium_items
WHERE embedding IS NULL
   OR embedding_updated_at < modified;
```

### Script de re-indexacion masiva

Para indexar items existentes o re-indexar despues de cambios en el modelo:

```typescript
// apps/server/src/scripts/reindexEmbeddings.ts

import { supabase } from '../supabaseClient'
import { generateEmbedding, prepareTextForEmbedding } from '../embeddings'

async function reindexAllItems() {
  // Obtener items pendientes
  const { data: items } = await supabase
    .from('compendium_items')
    .select('id, name, item_type, data, modified, embedding_updated_at')
    .or('embedding.is.null,embedding_updated_at.lt.modified')

  if (!items) return

  console.log(`Re-indexando ${items.length} items...`)

  for (const item of items) {
    const text = prepareTextForEmbedding(item)
    const embedding = await generateEmbedding(text)

    await supabase
      .from('compendium_items')
      .update({
        embedding,
        embedding_updated_at: new Date().toISOString()
      })
      .eq('id', item.id)

    console.log(`Indexado: ${item.name}`)
  }

  console.log('Re-indexacion completada')
}

reindexAllItems()
```

Ejecutar con: `bun run apps/server/src/scripts/reindexEmbeddings.ts`

## Por que funciones en Postgres vs queries en servidor

| Aspecto | Funcion en Postgres | Query en servidor |
|---------|---------------------|-------------------|
| Operador `<->` | Funciona nativamente | SDK no lo soporta |
| Rendimiento | Optimo (planificador ve query completa) | Similar con raw SQL |
| Mantenibilidad | Migraciones versionadas | Codigo junto al servidor |
| Testing | Mas dificil | Mas facil (jest/vitest) |

**Decision**: Funciones en Postgres porque el SDK de Supabase no soporta operadores vectoriales directamente.

## Pasos de implementacion

### Fase 1: Base de datos

1. [ ] Habilitar extension pgvector
2. [ ] Crear migracion para columnas `embedding` y `embedding_updated_at`
3. [ ] Crear migracion para indice HNSW
4. [ ] Crear migracion para funciones `search_campaign_items` y `search_my_items`

### Fase 2: Servidor (Bun)

5. [ ] Anadir dependencia `openai` al servidor
6. [ ] Implementar `generateEmbedding()` y `prepareTextForEmbedding()`
7. [ ] Implementar `saveCompendiumItem()` con generacion de embedding
8. [ ] Crear endpoints de busqueda (`/search/campaign/:id`, `/search/my-items`)
9. [ ] Crear script de re-indexacion masiva

### Fase 3: Indexacion inicial

10. [ ] Ejecutar script de re-indexacion para items existentes
11. [ ] Verificar que las busquedas funcionan correctamente

## Notas sobre rendimiento

- Con datasets pequenos (~184 items actuales), RLS nativo funcionaria bien
- Los filtros propuestos (`campaign_id` o `owner_id`) son simples e indexables
- La verificacion de permisos (`can_access_campaign`) se hace una vez, no por cada fila
- El indice HNSW es eficiente para busquedas aproximadas de vecinos cercanos

## Stack tecnologico

- **Runtime**: Bun (no Deno)
- **Servidor**: `apps/server/` - HTTP server con Bun.serve()
- **Base de datos**: Supabase (Postgres)
- **Embeddings**: OpenAI `text-embedding-3-small` (1536 dimensiones)
- **Busqueda vectorial**: pgvector con indice HNSW

## Referencias

- Funciones helper existentes: `can_access_campaign()`, `can_access_character()` en `public` schema
- Servidor actual: `apps/server/src/`
- Cliente Supabase: `apps/server/src/supabaseClient.ts`
- pgvector disponible en Supabase: v0.8.0
