# Marketplace de Contenido - Consideraciones

Análisis de cómo implementar un marketplace de compendios compatible con PowerSync.

## Requisitos del Marketplace

### Funcionales
- Usuarios pueden publicar compendios (sources + items)
- Otros usuarios pueden comprar/descargar
- Modelos: gratuito, pago único, suscripción
- Actualizaciones del autor llegan a compradores
- Preview antes de comprar

### Técnicos
- Compatible con PowerSync (sync rules manejables)
- No sincronizar todo el catálogo a todos los usuarios
- Permisos verificables offline

## Opciones de Arquitectura

### Opción A: Licencias en Servidor, Contenido Bajo Demanda

```
marketplace_sources (catálogo, NO se sincroniza a todos)
  id, name, description, price, author_id, preview_data

user_licenses (se sincroniza al usuario)
  id, user_id, source_id, license_type, status, purchased_at

user_downloaded_sources (trigger para sync rules)
  id, user_id, source_id, downloaded_at
```

**Flujo:**
1. Usuario navega marketplace (fetch del servidor, no sync)
2. Usuario compra → se crea `user_licenses`
3. Usuario "descarga" → se crea `user_downloaded_sources`
4. Sync rules incluyen sources donde `user_downloaded_sources.user_id = :user_id`

**Pros:**
- Catálogo no infla SQLite local
- Usuario controla qué descargar
- Licencias verificables offline

**Contras:**
- Dos pasos: comprar + descargar
- Gestión de "descargas" por usuario

### Opción B: Clonar Contenido al Comprar

```
Al comprar:
  1. Clonar source con owner_id = comprador
  2. Clonar compendium_items con owner_id = comprador
  3. Marcar como "purchased_from: original_source_id"
```

**Pros:**
- Modelo de propiedad simple (owner_id funciona)
- Sync rules sin cambios
- Funciona 100% offline

**Contras:**
- Duplicación masiva de datos
- Actualizaciones del autor NO llegan automáticamente
- Espacio en servidor se multiplica

### Opción C: Hybrid - Referencias con Cache Local

```
source_subscriptions (ligera, se sincroniza)
  id, user_id, source_id, status

-- Sync rules para sources:
WHERE owner_id = :user_id
   OR id IN (SELECT source_id FROM source_subscriptions WHERE user_id = :user_id)
```

**Pros:**
- Sin duplicación
- Actualizaciones llegan automáticamente
- Tabla de suscripciones es pequeña

**Contras:**
- Todo el contenido suscrito se sincroniza siempre
- Usuario con muchas suscripciones = SQLite grande

## Recomendación

**Opción A (Licencias + Descarga Explícita)** parece la más equilibrada:

1. Escala mejor (no sincronizas lo que no usas)
2. Usuario tiene control
3. Licencias pequeñas, contenido bajo demanda
4. Compatible con suscripciones (verificar `status` y `expires_at`)

### Modelo de Datos Propuesto

```sql
-- Catálogo público (NO sincronizado, solo API)
marketplace_listings (
  id UUID PRIMARY KEY,
  source_id UUID REFERENCES sources(id),

  -- Pricing
  price_type TEXT,  -- 'free', 'paid', 'subscription'
  price_cents INTEGER,
  currency TEXT DEFAULT 'EUR',

  -- Metadata para búsqueda
  title TEXT,
  description TEXT,
  tags TEXT[],
  preview_items JSONB,  -- algunos items de muestra

  -- Stats
  downloads INTEGER DEFAULT 0,
  rating DECIMAL,

  -- Estado
  status TEXT,  -- 'draft', 'published', 'removed'
  published_at TIMESTAMPTZ
)

-- Licencias del usuario (sincronizado)
user_licenses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  source_id UUID REFERENCES sources(id),

  license_type TEXT,  -- 'purchase', 'subscription', 'gift'
  status TEXT,  -- 'active', 'expired', 'refunded'

  purchased_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,  -- NULL para compra permanente

  -- Para suscripciones
  stripe_subscription_id TEXT
)

-- Control de descarga (sincronizado, trigger para sync rules)
user_content_downloads (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  source_id UUID REFERENCES sources(id),

  downloaded_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,

  -- Usuario puede "pausar" sync de contenido que no usa
  sync_enabled BOOLEAN DEFAULT true
)
```

### Sync Rules

```yaml
sources:
  # Propios
  - WHERE owner_id = :user_id
  # Públicos gratuitos (¿o solo bajo demanda?)
  - WHERE is_private = false AND id IN (SELECT source_id FROM user_content_downloads WHERE user_id = :user_id AND sync_enabled = true)
  # Comprados/suscritos y descargados
  - WHERE id IN (
      SELECT source_id FROM user_content_downloads
      WHERE user_id = :user_id
        AND sync_enabled = true
        AND source_id IN (
          SELECT source_id FROM user_licenses
          WHERE user_id = :user_id AND status = 'active'
        )
    )
```

## Verificación Offline

Con contenido descargado, verificar permisos offline:

```typescript
function canUseSource(sourceId: string): boolean {
  // Si está en SQLite local, ya pasó las sync rules
  const downloaded = db.get('user_content_downloads', { source_id: sourceId })
  if (!downloaded) return false

  // Verificar licencia (también en SQLite)
  const license = db.get('user_licenses', { source_id: sourceId })
  if (!license) {
    // Es gratuito o propio
    const source = db.get('sources', { id: sourceId })
    return source?.is_private === false || source?.owner_id === currentUserId
  }

  // Verificar estado y expiración
  if (license.status !== 'active') return false
  if (license.expires_at && new Date(license.expires_at) < new Date()) return false

  return true
}
```

## Actualizaciones del Autor

Cuando el autor actualiza su compendio:

1. Cambios se guardan en `sources` / `compendium_items` originales
2. PowerSync propaga cambios a todos los que tengan descargado
3. `user_content_downloads.last_synced_at` se actualiza

El usuario siempre tiene la última versión si tiene conexión.

## Preguntas Abiertas

1. **Contenido gratuito**: ¿Se sincroniza automáticamente o requiere "descarga"?
2. **Límite de descargas**: ¿Máximo de compendios descargados por usuario?
3. **Versionado de compendios**: ¿Usuario puede quedarse en versión anterior?
4. **Refunds**: ¿Qué pasa con contenido ya descargado?
5. **Dependencias**: ¿Cómo manejar "este suplemento requiere el libro base"?
