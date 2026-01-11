# 🔍 Búsqueda Semántica Integrada con CLIP

Este documento explica cómo usar la búsqueda semántica de imágenes en el Visual Playground.

## 🏗️ Arquitectura

```
┌──────────────────────┐
│  React Frontend      │
│  (ImagePickerModal)  │
│  Puerto: 5173        │
└──────────┬───────────┘
           │ GET /api/images/search?q=text
           ↓
┌──────────────────────┐
│  Bun Server          │ ← Maneja entidades + proxy a CLIP
│  Puerto: 3001        │
└──────────┬───────────┘
           │ GET /search?q=text
           ↓
┌──────────────────────┐
│  Python CLIP Server  │ ← Búsqueda semántica con CLIP
│  Puerto: 8000        │
│  FastAPI + FAISS     │
└──────────────────────┘
```

## 🚀 Inicio Rápido

### 1. Instalar Dependencias Python

```bash
cd icon-search
pip3 install -r requirements.txt
```

Esto instalará:
- `fastapi` - Framework web async
- `uvicorn` - Servidor ASGI
- `torch`, `transformers` - CLIP model
- `faiss-cpu` - Búsqueda vectorial
- `pydantic` - Validación de datos

### 2. Iniciar Servidor Python CLIP

```bash
cd icon-search
python3 clip_server.py
```

Verás:
```
🚀 Starting CLIP Image Search Server
Model: openai/clip-vit-base-patch32
Server will be available at: http://localhost:8000
API docs at: http://localhost:8000/docs
```

**El servidor tarda ~10-15 segundos en iniciar** (carga CLIP + FAISS).

### 3. Iniciar Servidor Bun

```bash
cd visualPlayground
bun run server
```

### 4. Iniciar Frontend

```bash
cd visualPlayground
bun dev
```

### 5. Usar Búsqueda Semántica

1. Abre el **Image Picker** en cualquier entidad
2. Selecciona una categoría (ej: "SkillsIcons")
3. **Activa el toggle** "🪄 Búsqueda semántica con IA"
4. Escribe una descripción visual en inglés:
   - `"fire explosion"` 
   - `"blue lightning strike"`
   - `"healing magic green"`
   - `"dark skull death"`

¡Los resultados aparecen ordenados por relevancia con % de similitud!

---

## 📖 API Reference

### Python CLIP Server

#### `GET /health`
Health check del servidor.

**Response:**
```json
{
  "status": "ok",
  "model": "openai/clip-vit-base-patch32",
  "device": "mps",
  "index_size": 6293
}
```

#### `GET /search?q=<query>&top_k=<N>&category=<cat>`
Búsqueda semántica de imágenes.

**Parameters:**
- `q` (required): Query de búsqueda (ej: "fire explosion")
- `top_k` (optional, default 10): Número de resultados
- `category` (optional): Filtrar por categoría

**Example:**
```bash
curl "http://localhost:8000/search?q=blue%20lightning&top_k=5"
```

**Response:**
```json
{
  "query": "blue lightning",
  "top_k": 5,
  "results": [
    {
      "path": "SkillsIcons/Storm_nobg.png",
      "score": 0.3106,
      "category": "SkillsIcons"
    },
    ...
  ]
}
```

#### `POST /search`
Mismo que GET pero con body JSON.

**Request:**
```json
{
  "query": "fire explosion",
  "top_k": 10,
  "category_filter": "SkillsIcons"
}
```

---

### Bun Server

#### `GET /api/images/search?q=<query>&top_k=<N>&category=<cat>`
Proxy a la búsqueda CLIP.

**Example:**
```bash
curl "http://localhost:3001/api/images/search?q=fire%20explosion&top_k=10"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "fire explosion",
    "top_k": 10,
    "results": [...]
  }
}
```

**Error si CLIP server no está corriendo:**
```json
{
  "success": false,
  "error": "CLIP search server is not running. Start it with: cd icon-search && python3 clip_server.py"
}
```

---

## 🎯 Mejores Prácticas de Búsqueda

### ✅ Queries que Funcionan Bien

Basado en testing con 6293 iconos de fantasía:

| Pattern | Example | Avg Score |
|---------|---------|-----------|
| [color] [element] [type] | `"blue lightning strike"` | 0.3221 |
| [adjective] [element] | `"green healing light"` | 0.3131 |
| [adjective] [concept] | `"dark death magic"` | 0.2882 |
| [descriptor] [object] | `"glowing magic shield"` | 0.3210 |

### ❌ Queries que Funcionan Peor

- ❌ Artículos: `"the fire explosion"` 
- ❌ Verbos: `"casting fire spell"`
- ❌ Frases largas: `"a wizard casting a powerful fire spell"`
- ❌ Castellano: `"explosión de fuego"` (funciona pero peor que inglés)

### 💡 Tips

1. **Inglés siempre**: Los embeddings de CLIP funcionan +36% mejor en inglés
2. **3-4 palabras**: Longitud óptima según testing
3. **Visual keywords**: Usa colores, elementos, objetos concretos
4. **Sin contexto narrativo**: Describe lo que ves, no lo que hace

---

## 🛠️ Troubleshooting

### Error: "CLIP search server is not running"

**Solución:**
```bash
cd icon-search
python3 clip_server.py
```

Espera a que veas:
```
✓ CLIP Search Engine ready! (6293 images indexed)
```

### Error: "ModuleNotFoundError: No module named 'fastapi'"

**Solución:**
```bash
cd icon-search
pip3 install -r requirements.txt
```

### Error: "Index file not found: data/faiss.index"

**Solución:** Genera el índice FAISS:
```bash
cd icon-search
python3 index_build.py \
  --assets_root "/Users/cilveti/Downloads/5000_fantasy_icons" \
  --out_dir "data"
```

### Resultados no relevantes

**Posibles causas:**
1. Query en castellano → Cambia a inglés
2. Query muy larga → Usa 2-4 palabras
3. Query muy abstracta → Usa elementos visuales concretos

**Ejemplos de mejora:**
- ❌ `"un conjuro que cura heridas"` → ✅ `"green healing magic"`
- ❌ `"the powerful magic shield that protects"` → ✅ `"glowing shield"`
- ❌ `"necromancia oscura muerte"` → ✅ `"dark necromancy"`

### Servidor CLIP muy lento

**Optimizaciones:**
1. Usa GPU si está disponible (detectado automáticamente)
2. Reduce `top_k` en las queries
3. Filtra por categoría cuando sea posible

---

## 📊 Performance

| Operación | Tiempo | Hardware |
|-----------|--------|----------|
| Startup (cargar modelo) | ~10-15s | Apple M1 |
| Search query | ~50-200ms | Apple M1 (MPS) |
| Search query | ~100-400ms | CPU Intel i7 |
| Index build (6293 imgs) | ~27s | Apple M1 (MPS) |

---

## 🔧 Desarrollo

### Ejecutar con Hot Reload

```bash
# Python server con auto-reload
cd icon-search
uvicorn clip_server:app --reload --port 8000
```

### Ver API Docs

Mientras el servidor Python corre:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Logs

El servidor Python muestra logs detallados:
```
INFO:     127.0.0.1:52904 - "GET /search?q=fire+explosion HTTP/1.1" 200 OK
```

---

## 🚀 Próximas Mejoras

- [ ] Cache de queries comunes
- [ ] Búsqueda híbrida (semántica + metadata)
- [ ] Filtros avanzados (color dominante, estilo)
- [ ] Sugerencias de queries
- [ ] Historial de búsquedas
- [ ] Export de resultados

---

## 📝 Notas Técnicas

### ¿Por qué Python para CLIP?

1. **CLIP en PyTorch**: Modelo original en Python
2. **Performance**: PyTorch GPU es mucho más rápido que alternativas JS
3. **FAISS**: No tiene binding estable en Node.js
4. **Ecosistema**: Transformers, torch, numpy están optimizados en Python

### ¿Por qué FastAPI?

1. **Async nativo**: Maneja múltiples requests sin bloquear
2. **Rápido**: Similar a Node.js en benchmarks
3. **Type hints**: Validación automática con Pydantic
4. **OpenAPI**: Docs automáticas

### ¿Por qué no Transformers.js?

Transformers.js es una opción, pero:
- ❌ CLIP no está bien soportado aún
- ❌ Performance inferior a PyTorch
- ❌ No tiene binding de FAISS
- ❌ Mayor tamaño de bundle

---

## 📄 Licencia

Interno del proyecto cilvet-dice.


