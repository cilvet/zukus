# Analisis de Busqueda Semantica

Este documento analiza las opciones para implementar busqueda semantica (tipo CLIP) en el futuro.

## Que es busqueda semantica

La busqueda semantica permite buscar imagenes por significado, no solo por palabras clave:

- **Busqueda clasica**: "sword" encuentra iconos que tienen "sword" en el nombre/tags
- **Busqueda semantica**: "arma de caballero medieval" encuentra espadas, lanzas, escudos aunque no tengan esas palabras

## Sistema CLIP existente

Ya tenemos un sistema CLIP implementado en `packages/core/icon-search/`:

### Arquitectura actual

```
clip_server.py (FastAPI)
├── Modelo: openai/clip-vit-base-patch32 (~400MB RAM)
├── Indice: FAISS IndexFlatIP (en memoria)
├── 6293 imagenes indexadas
└── Endpoints: GET/POST /search
```

### Rendimiento

| Operacion | Tiempo | Hardware |
|-----------|--------|----------|
| Startup (cargar modelo + indice) | ~15-20s | Apple M1 |
| Query individual | 50-200ms | Apple M1 |
| Indexar 6293 imagenes | ~27s | Apple M1 |

### Archivos clave

- `clip_server.py` - Servidor FastAPI
- `index_build.py` - Constructor del indice FAISS
- `search.py` - CLI de busqueda
- `data/faiss.index` - Indice vectorial (12 MB)
- `data/metadata.jsonl` - Metadata de imagenes

## Opciones para produccion

### Opcion 1: CLIP en Fly.io (servidor dedicado)

```
App → Fly.io (clip_server.py) → Respuesta
```

**Costos**:
- shared-cpu-2x (1GB RAM): ~$7/mes
- shared-cpu-2x (2GB RAM): ~$10/mes
- Con auto-stop: $0 cuando no se usa, pero cold start de ~20s

**Pros**:
- Ya tenemos el codigo funcionando
- Control total

**Contras**:
- Costo fijo o cold start largo
- Servidor Python adicional que mantener

### Opcion 2: pgvector + Jina AI (recomendada para futuro)

```
Setup (una vez):
  Imagenes → Jina API (embedding) → pgvector (Supabase)

Runtime:
  Query texto → Jina API (embedding) → pgvector search → Resultados
```

**Costos**:
- Jina AI: 10M tokens gratis, luego ~$0.02/1M tokens
- pgvector: Incluido en Supabase

**Pros**:
- Sin servidor adicional
- Escala a cero (solo pagas por uso)
- Aprovecha Supabase existente

**Contras**:
- Dependencia de API externa para queries
- Latencia de API (~100-200ms por query)

### Opcion 3: MobileCLIP (modelo mas ligero)

Usar MobileCLIP-S0 en vez de CLIP ViT-B/32:

| Modelo | Tamano | RAM | Velocidad |
|--------|--------|-----|-----------|
| CLIP ViT-B/32 | ~400MB | ~1GB | Baseline |
| MobileCLIP-S0 | ~50MB | ~256MB | 4.8x mas rapido |

**Pros**:
- Podria caber en free tier de Fly.io (256MB)
- Mucho mas rapido

**Contras**:
- Requiere cambiar el codigo
- Menos preciso (aunque similar para casos comunes)

### Opcion 4: Servicios SaaS

| Servicio | Free Tier | Precio | Notas |
|----------|-----------|--------|-------|
| **Jina AI** | 10M tokens | $0.02/1M | Solo embeddings, necesita DB |
| **Nyckel** | 1000 busq/mes | $0+ | Todo integrado |
| **Roboflow** | Limitado | $49+/mes | CLIP automatico |
| **Qdrant Cloud** | 1GB | $0.014/hora+ | Solo vector DB |
| **Pinecone** | 2GB | $50+/mes | Solo vector DB |

## Recomendacion

### Ahora: No implementar

La busqueda clasica (full-text + filtros) es suficiente para el MVP.

### Futuro: pgvector + Jina AI

Cuando se necesite busqueda semantica:

1. Anadir columna `embedding vector(768)` a tabla `icons`
2. Generar embeddings con Jina AI (jina-clip-v2)
3. Crear funcion de busqueda hibrida (fts + vector)

```sql
-- Anadir columna
alter table icons add column embedding vector(768);

-- Funcion de busqueda semantica
create function search_icons_semantic(
  query_embedding vector(768),
  match_count int default 20
)
returns table (id bigint, storage_path text, name text, similarity float)
language sql as $$
  select
    id,
    storage_path,
    name,
    1 - (embedding <=> query_embedding) as similarity
  from icons
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

Esta arquitectura permite:
- Anadir semantica sin cambiar la estructura existente
- Combinar busqueda clasica y semantica (hibrida)
- Escalar sin servidores adicionales
