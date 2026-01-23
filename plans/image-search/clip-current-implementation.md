# Implementacion CLIP Actual

Documentacion del sistema CLIP existente en el repositorio.

## Ubicacion

```
packages/core/icon-search/
├── clip_server.py           # Servidor FastAPI
├── index_build.py           # Constructor de indice
├── search.py                # CLI de busqueda
├── apply_images_to_spells.py # Asignador automatico
├── test_*.py                # Scripts de testing
├── requirements.txt         # Dependencias Python
├── README.md                # Documentacion
└── data/
    ├── faiss.index          # Indice vectorial (12 MB)
    └── metadata.jsonl       # Metadata de 6293 imagenes
```

## Tecnologias

- **Modelo**: openai/clip-vit-base-patch32
- **Vector DB**: FAISS IndexFlatIP
- **Framework**: FastAPI + Uvicorn
- **Procesamiento**: PyTorch + Transformers

## Dependencias

```
torch
transformers
pillow
faiss-cpu
numpy
fastapi
uvicorn[standard]
pydantic
```

## clip_server.py

Servidor HTTP para busqueda semantica.

### Endpoints

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/search` | GET | Busqueda por query string |
| `/search` | POST | Busqueda por JSON body |
| `/` | GET | Info del servicio |

### Parametros de busqueda

```typescript
{
  query: string       // Texto a buscar
  top_k?: number      // Cantidad de resultados (default: 10)
  category?: string   // Filtro por categoria
}
```

### Respuesta

```typescript
{
  query: string
  top_k: number
  results: Array<{
    path: string      // Ruta de la imagen
    score: number     // Similitud (0-1)
    category: string  // Categoria
  }>
}
```

### Uso

```bash
# Iniciar servidor
cd packages/core/icon-search
python3 clip_server.py

# El servidor escucha en http://localhost:8000
```

## index_build.py

Constructor del indice FAISS.

### Uso

```bash
python3 index_build.py \
  --assets_root "/path/to/images" \
  --out_dir "data" \
  --batch_size 32
```

### Proceso

1. Escanea recursivamente directorio de imagenes
2. Carga modelo CLIP
3. Procesa imagenes en batches de 32
4. Genera embeddings con `model.get_image_features()`
5. Normaliza L2 embeddings
6. Crea indice FAISS (IndexFlatIP)
7. Guarda `faiss.index` + `metadata.jsonl`

### Salida

**faiss.index**: Indice vectorial binario (~12 MB para 6293 imagenes)

**metadata.jsonl**: Una linea JSON por imagen
```json
{"id": 0, "path": "SkillsIcons/skill_001.png", "category": "SkillsIcons"}
{"id": 1, "path": "SkillsIcons/skill_002.png", "category": "SkillsIcons"}
```

## apply_images_to_spells.py

Asigna automaticamente imagenes a conjuros usando busqueda semantica.

### Uso

```bash
python3 apply_images_to_spells.py \
  --spells_dir "../path/to/spells" \
  --index "data/faiss.index" \
  --metadata "data/metadata.jsonl" \
  --dry-run  # Opcional: no modifica archivos
```

### Logica

1. Lee cada conjuro JSON
2. Construye query: `visualdescription` > `originalName` > `name`
3. Procesa en batches de 64 queries
4. Busca imagen mas relevante
5. Actualiza JSON con campo `image`

### Rendimiento

- 2790 conjuros en ~5 segundos
- 36x mas rapido con batch processing

## Rendimiento general

| Operacion | Cantidad | Tiempo | Hardware |
|-----------|----------|--------|----------|
| Indexar imagenes | 6293 | ~27s | Apple M1 MPS |
| Query individual | 1 | 50-200ms | Apple M1 MPS |
| Query individual | 1 | 100-400ms | CPU Intel i7 |
| Batch 64 queries | 64 | ~200ms | Apple M1 MPS |
| Startup servidor | - | ~15s | Apple M1 |

## Integracion con TypeScript

El sistema esta integrado en `visualPlayground`:

```
visualPlayground/
├── src/components/entity-editor/ImagePickerModal.tsx
│   └── Toggle "Busqueda semantica con IA"
├── src/lib/api.ts
│   └── semanticSearch(query, topK, category?)
└── server/index.ts
    └── Proxy /api/images/search → localhost:8000/search
```

## Notas tecnicas

### Limite de tokens CLIP

CLIP trunca texto a 77 tokens. Por eso las `visualdescription` son cortas (~25 chars).

### Patrones de query efectivos

```
[color/visual-adj] [element/concept] [optional-type]

Ejemplos:
- "fire explosion"
- "blue lightning"
- "green healing light"
- "dark necromancy skull"
```

### Device detection

```python
if torch.cuda.is_available():
    device = "cuda"
elif torch.backends.mps.is_available():
    device = "mps"
else:
    device = "cpu"
```
