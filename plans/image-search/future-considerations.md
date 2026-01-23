# Consideraciones Futuras

Funcionalidades postponidas que se pueden implementar mas adelante.

## 1. Busqueda semantica

### Cuando implementar
- Cuando la busqueda clasica no sea suficiente
- Cuando usuarios pidan "buscar por descripcion"

### Como implementar
Ver [semantic-search-analysis.md](./semantic-search-analysis.md)

**Resumen**: Usar Jina AI para embeddings + pgvector en Supabase.

### Cambios necesarios
1. Anadir columna `embedding vector(768)` a tabla `icons`
2. Generar embeddings con Jina AI (one-time)
3. Crear endpoint/funcion para busqueda semantica
4. Actualizar UI con toggle "busqueda inteligente"

---

## 2. Modo offline

### Cuando implementar
- Cuando usuarios necesiten usar la app sin conexion
- Cuando el cache no sea suficiente

### Opciones de implementacion

#### Opcion A: ZIP descargable

```
Usuario descarga ZIP → Extrae a FileSystem → Busqueda local
```

**Consideraciones de licencia**:
- NO publicar ZIP en GitHub Releases (licencia)
- Servir desde Supabase Storage (privado con signed URL)
- O desde servidor propio

**Estructura del ZIP**:
```
icons-v1.0.0.zip (~30-50 MB)
├── metadata.json      # Para busqueda local
└── icons/
    ├── armor/
    ├── weapons/
    └── ...
```

#### Opcion B: Descarga progresiva

```
App descarga iconos conforme se usan → Cache persistente
```

Menos control pero mas simple. Ya funciona parcialmente con `expo-image`.

### Busqueda offline

Solo busqueda clasica (sin semantica):

```typescript
// Cargar metadata.json
const metadata = await loadLocalMetadata()

// Busqueda en memoria
const results = metadata.filter(icon =>
  icon.name.toLowerCase().includes(query) ||
  icon.tags.some(t => t.includes(query))
)
```

---

## 3. Subida de imagenes por usuarios

### Cuando implementar
- Cuando usuarios quieran personalizar iconos
- Cuando se implemente contenido generado por usuarios

### Opciones

#### Opcion A: Solo URLs externas
- Usuario pega URL de imagen
- App la muestra directamente
- Sin almacenamiento propio

**Ya soportado**: Solo guardar URL string en la entidad.

#### Opcion B: Upload a Supabase Storage

```typescript
// Subir imagen
const { data, error } = await supabase.storage
  .from('user-uploads')
  .upload(`${userId}/${filename}`, file)

// Guardar path en entidad
entity.customImagePath = data.path
```

**Consideraciones**:
- Bucket separado: `user-uploads` (privado con RLS)
- Limites de tamano
- Validacion de tipo de archivo
- Compresion/resize automatico

---

## 4. Optimizaciones de CDN

### Smart CDN de Supabase

Supabase tiene Smart CDN que invalida cache automaticamente al actualizar archivos.

**Config actual recomendada**:
```typescript
// Cache muy largo (iconos no cambian)
const cacheControl = 'public, max-age=31536000' // 1 year
```

### Image transformations

Supabase Storage soporta transformaciones on-the-fly:

```
/storage/v1/object/public/icons/path.webp?width=64&height=64
```

**Util para**:
- Thumbnails en listas
- Diferentes resoluciones por dispositivo

---

## 5. Versionado de biblioteca

### Cuando implementar
- Cuando se anadan nuevos iconos
- Cuando se necesite actualizar iconos existentes

### Estrategia

1. **Metadata en tabla**: Version en tabla `icons`
2. **Manifest**: Archivo `manifest.json` con version + checksums
3. **Sync**: App compara version local vs remota

```typescript
// Verificar actualizaciones
const { data: manifest } = await supabase.storage
  .from('icons')
  .download('manifest.json')

if (manifest.version > localVersion) {
  // Hay actualizaciones disponibles
}
```

---

## 6. Analytics de uso

### Metricas utiles

- Iconos mas buscados
- Iconos mas usados
- Busquedas sin resultados (para mejorar tags)

### Implementacion simple

```sql
-- Tabla de eventos
create table icon_events (
  id bigint primary key generated always as identity,
  event_type text not null,  -- 'search', 'select', 'view'
  icon_id bigint references icons(id),
  query text,
  created_at timestamptz default now()
);

-- No indexar todo, solo lo necesario
create index icon_events_type_idx on icon_events(event_type);
create index icon_events_created_idx on icon_events(created_at);
```

---

## Prioridades sugeridas

| Funcionalidad | Prioridad | Esfuerzo | Valor |
|---------------|-----------|----------|-------|
| Busqueda semantica | Media | Medio | Alto |
| Modo offline (ZIP) | Baja | Alto | Medio |
| Subida usuarios (URL) | Alta | Bajo | Medio |
| Subida usuarios (upload) | Baja | Medio | Bajo |
| Image transformations | Baja | Bajo | Bajo |
| Versionado | Baja | Medio | Bajo |
| Analytics | Baja | Bajo | Bajo |
