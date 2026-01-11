# Sistema de Búsqueda y Asignación Automática de Imágenes para Conjuros

Este documento describe el sistema completo desarrollado para asignar automáticamente imágenes a ~2790 conjuros de D&D 3.5 usando búsqueda semántica con CLIP y generación de descripciones con IA.

## 📋 Tabla de Contenidos

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Componentes](#componentes)
3. [Flujo de Trabajo Completo](#flujo-de-trabajo-completo)
4. [Uso Individual de Cada Script](#uso-individual-de-cada-script)
5. [Estructura de Datos](#estructura-de-datos)
6. [Rendimiento](#rendimiento)

---

## Resumen del Sistema

El sistema consta de **dos partes principales**:

### Parte 1: Búsqueda Semántica de Imágenes (Python + CLIP)
- **Ubicación**: `/icon-search/`
- **Tecnología**: CLIP (OpenAI), FAISS, PyTorch
- **Propósito**: Indexar y buscar en ~6293 iconos de fantasía usando búsqueda semántica

### Parte 2: Generación de Descripciones (TypeScript + OpenAI)
- **Ubicación**: `/visualPlayground/scripts/`
- **Tecnología**: Vercel AI SDK, OpenAI GPT-4o-mini
- **Propósito**: Generar descripciones cortas y visuales para mejorar la búsqueda

---

## Componentes

### 📁 `/icon-search/` - Sistema de Búsqueda con CLIP

#### 1. `index_build.py`
**Propósito**: Indexar todos los iconos usando CLIP.

```bash
python3 index_build.py \
  --assets_root "/Users/cilveti/Downloads/5000_fantasy_icons" \
  --out_dir "data" \
  --batch_size 32
```

**Salida**:
- `data/faiss.index` - Índice vectorial FAISS
- `data/metadata.jsonl` - Metadata de cada imagen (path, categoría)

**Tiempo**: ~27 segundos para 6293 imágenes (GPU Apple MPS)

---

#### 2. `search.py`
**Propósito**: Buscar imágenes por texto.

```bash
python3 search.py \
  --index "data/faiss.index" \
  --metadata "data/metadata.jsonl" \
  --query "Explosión de fuego" \
  --top_k 5
```

**Salida**: JSON con los top K resultados más relevantes.

---

#### 3. `apply_images_to_spells.py`
**Propósito**: Asignar automáticamente imágenes a todos los conjuros.

```bash
python3 apply_images_to_spells.py \
  --spells_dir "../visualPlayground/server/data/entities/spell" \
  --index "data/faiss.index" \
  --metadata "data/metadata.jsonl"
```

**Funcionamiento**:
1. Carga todos los conjuros desde la carpeta
2. Para cada conjuro, construye una query de búsqueda
3. Procesa queries en batches de 64 (optimización)
4. Busca la imagen más relevante en el índice FAISS
5. Actualiza el JSON del conjuro con el campo `image`

**Lógica de búsqueda actual**:
```python
def build_search_query(spell: dict) -> str:
    # Prioridad 1: visualdescription (ultra corta, visual)
    visual_desc = spell.get('visualdescription', '')
    if visual_desc:
        return visual_desc
    
    # Prioridad 2: originalName (inglés)
    original_name = spell.get('originalName', '')
    if original_name:
        return original_name
    
    # Prioridad 3: name (castellano)
    return spell.get('name', '')
```

**Tiempo**: ~5 segundos para 2790 conjuros

---

### 📁 `/visualPlayground/scripts/` - Generación de Descripciones con IA

#### 1. `generateShortDescriptions.ts`
**Propósito**: Generar descripciones cortas legibles para UI.

```bash
cd visualPlayground
bun run scripts/generateShortDescriptions.ts
# O usando el script npm:
bun run generate:short-descriptions
```

**Características**:
- Máximo 60 caracteres
- En castellano
- Descriptiva del efecto del conjuro
- Ejemplo: `"Lanzas una pequeña bola de fuego que explota en un radio de 20'"`

**Modelo**: `gpt-4o-mini` (económico)

**Procesamiento**:
- Batches de 100 conjuros
- Delay de 2s entre batches
- Procesa en paralelo dentro de cada batch

---

#### 2. `generateVisualDescriptions.ts`
**Propósito**: Generar descripciones ultra cortas optimizadas para búsqueda de imágenes.

```bash
cd visualPlayground
bun run scripts/generateVisualDescriptions.ts
```

**Características**:
- Máximo 25 caracteres
- Solo aspectos visuales: colores, elementos, formas
- Sin artículos innecesarios
- Ejemplo: `"Explosión de fuego"`

**Modelo**: `gpt-4o-mini`

**Procesamiento**: Similar a `generateShortDescriptions.ts`

---

## Flujo de Trabajo Completo

### Setup Inicial (Una sola vez)

#### 1. Instalar dependencias Python
```bash
cd icon-search
pip3 install -r requirements.txt
```

#### 2. Construir índice FAISS
```bash
cd icon-search
python3 index_build.py \
  --assets_root "/Users/cilveti/Downloads/5000_fantasy_icons" \
  --out_dir "data" \
  --batch_size 32
```

Esto genera:
- `data/faiss.index` (índice vectorial)
- `data/metadata.jsonl` (metadata de imágenes)

#### 3. Instalar dependencias TypeScript
```bash
cd visualPlayground
bun install
```

#### 4. Configurar `.env`
Crear `visualPlayground/.env` con:
```
OPENAI_API_KEY=tu-api-key
```

---

### Proceso de Asignación de Imágenes

#### Opción A: Usando Nombres Originales (Más Rápido)
```bash
cd icon-search
python3 apply_images_to_spells.py \
  --spells_dir "../visualPlayground/server/data/entities/spell" \
  --index "data/faiss.index" \
  --metadata "data/metadata.jsonl"
```

⏱️ Tiempo: ~5 segundos

---

#### Opción B: Usando Descripciones Visuales IA (Mejor Precisión)

**Paso 1**: Generar descripciones visuales
```bash
cd visualPlayground
bun run scripts/generateVisualDescriptions.ts
```

⏱️ Tiempo: ~5-10 minutos para 2790 conjuros

**Paso 2**: Asignar imágenes usando las descripciones
```bash
cd icon-search
python3 apply_images_to_spells.py \
  --spells_dir "../visualPlayground/server/data/entities/spell" \
  --index "data/faiss.index" \
  --metadata "data/metadata.jsonl"
```

⏱️ Tiempo: ~5 segundos

---

## Estructura de Datos

### Conjuro (Spell Entity)

```json
{
  "id": "04c2c21c-e141-4159-b5b6-6de53ea3a2cf",
  "name": "Bola de fuego",
  "originalName": "Fireball",
  "level": 3,
  "school": "Evocación",
  "descriptors": ["fuego"],
  "description": "Este conjuro crea una explosión de llamas...",
  
  "shortdescription": "Lanzas una pequeña bola de fuego que explota en un radio de 20'",
  "visualdescription": "Explosión de fuego",
  "image": "SkillsIcons/SkilliconsVol2/Skill_nobg/skill_386_noBG.png",
  
  "entityType": "spell",
  "tags": ["Evocación", "fuego"]
}
```

### Campos Generados Automáticamente

| Campo | Generado por | Propósito | Ejemplo |
|-------|-------------|-----------|---------|
| `shortdescription` | `generateShortDescriptions.ts` | UI legible (60 chars) | "Lanzas una pequeña bola de fuego..." |
| `visualdescription` | `generateVisualDescriptions.ts` | Búsqueda de imágenes (25 chars) | "Explosión de fuego" |
| `image` | `apply_images_to_spells.py` | Path al icono | "SkillsIcons/.../skill_386.png" |

---

## Rendimiento

### Tiempos de Ejecución

| Operación | Cantidad | Tiempo | Hardware |
|-----------|----------|--------|----------|
| Indexar imágenes | 6293 iconos | ~27s | Apple M1 (MPS) |
| Generar shortdescriptions | 2790 conjuros | ~8-10min | OpenAI API |
| Generar visualdescriptions | 2790 conjuros | ~5-8min | OpenAI API |
| Asignar imágenes | 2790 conjuros | ~5s | Apple M1 (MPS) |

### Optimizaciones Implementadas

1. **Batch processing** en embeddings CLIP:
   - Antes: ~3 minutos (1 query a la vez)
   - Después: ~5 segundos (batches de 64)
   - Mejora: **36x más rápido**

2. **GPU Apple MPS** para inferencia:
   - CLIP usa Metal Performance Shaders
   - ~3x más rápido que CPU

3. **Paralelización** en generación IA:
   - 100 requests en paralelo por batch
   - Delay de 2s entre batches para evitar rate limits

---

## Decisiones de Diseño

### ¿Por qué visualdescription en lugar de description completa?

1. **CLIP tiene límite de 77 tokens**: Descripciones largas se truncan
2. **Mejor precisión**: Descripciones ultra cortas y visuales funcionan mejor
3. **Velocidad**: Queries más cortas = embeddings más rápidos

### ¿Por qué CLIP en lugar de otras alternativas?

1. **Búsqueda semántica**: Entiende conceptos, no solo texto exacto
2. **Multimodal**: Entrenado en imagen+texto simultáneamente
3. **Sin entrenamiento adicional**: Funciona out-of-the-box
4. **Rápido**: Inferencia en milisegundos

### ¿Por qué FAISS?

1. **Escalable**: Maneja millones de vectores
2. **Rápido**: Búsqueda kNN optimizada
3. **Múltiples índices**: IndexFlatIP (exacto) para N=6K es suficiente

---

## Troubleshooting

### Error: "OMP: Error #15: Initializing libomp.dylib"

**Solución**: Ya está arreglado en el código. El script establece `KMP_DUPLICATE_LIB_OK=TRUE` automáticamente.

### Imágenes no relevantes

**Solución**: Regenerar `visualdescription` con prompts más específicos:
```typescript
// En generateVisualDescriptions.ts
// Ajustar el prompt para ser más específico
const prompt = `... (modificar según necesidad)`
```

Luego re-ejecutar la asignación de imágenes.

### Faltan algunas imágenes

**Solución**: Verificar que el índice FAISS esté actualizado:
```bash
cd icon-search
python3 index_build.py --assets_root "..." --out_dir "data"
```

---

## Archivos Clave

```
icon-search/
├── README.md                      # Este archivo
├── requirements.txt               # Dependencias Python
├── index_build.py                 # Indexar imágenes con CLIP
├── search.py                      # Buscar imágenes
├── apply_images_to_spells.py     # Asignar imágenes automáticamente
└── data/
    ├── faiss.index               # Índice vectorial (generado)
    └── metadata.jsonl            # Metadata de imágenes (generado)

visualPlayground/
├── scripts/
│   ├── generateShortDescriptions.ts   # Descripciones UI (60 chars)
│   └── generateVisualDescriptions.ts  # Descripciones búsqueda (25 chars)
└── server/data/entities/spell/
    └── *.json                    # 2790 conjuros con imágenes asignadas
```

---

## Extensiones Futuras

### Fase 2: Mejoras Posibles

1. **Auto-captioning de iconos**: Usar BLIP/LLaVA para generar descripciones de cada icono
2. **Tags automáticos**: Clasificar iconos por colores, elementos, tipo
3. **Ranking híbrido**: Combinar CLIP con metadata (categoría, tags) para mejor precisión
4. **UI de revisión**: Interfaz para revisar y corregir asignaciones manualmente
5. **Índice Qdrant**: Migrar a base de datos vectorial con filtros más avanzados

---

## Créditos

- **CLIP**: OpenAI (modelo pre-entrenado)
- **FAISS**: Facebook Research (búsqueda vectorial)
- **GPT-4o-mini**: OpenAI (generación de descripciones)
- **Iconos**: Librería de ~6293 iconos de fantasía

---

## Licencia

Interno del proyecto cilvet-dice.
