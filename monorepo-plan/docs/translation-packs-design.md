# Translation Packs: Diseño del Sistema de Traducciones

## Contexto

El sistema de entidades de Zukus necesita soportar múltiples idiomas para el contenido de los compendios (conjuros, dotes, clases, etc.). Este documento define la arquitectura de traducciones siguiendo los principios del proyecto.

### Decisiones Clave

1. **Los compendios son compendios** - Colecciones de contenido de dominio, no mezclados con metadatos de traducción
2. **Translation Packs son un concepto de primer nivel** - No son compendios ni entidades normales
3. **Local-first** - Todo se resuelve localmente sin depender del servidor
4. **Dependencias explícitas** - Los packs declaran de qué compendio dependen con versionado semántico

---

## Modelo de Datos

### Compendium

Un compendio es una colección de contenido de dominio en un idioma base.

```typescript
type Compendium = {
  id: string                    // "srd-35"
  name: string                  // "SRD 3.5"
  version: string               // "1.0.0" (semver)
  locale: string                // "en" (idioma base del contenido)

  // Dependencias de otros compendios (para referencias cruzadas)
  dependencies?: CompendiumDependency[]

  // El contenido
  entities: Entity[]
}

type CompendiumDependency = {
  compendiumId: string
  versionRange: string          // Semver: "^1.0.0", ">=2.0.0"
  type: "required" | "optional"
}
```

### TranslationPack

Un Translation Pack contiene traducciones para un compendio específico. No es un compendio.

```typescript
type TranslationPack = {
  id: string                    // "srd-35-es-official"
  name: string                  // "SRD 3.5 - Español Oficial"
  description?: string          // "Traducción oficial del SRD..."

  // Dependencia del compendio objetivo
  targetCompendiumId: string    // "srd-35"
  targetVersionRange: string    // "^1.0.0"

  // Metadatos del pack
  locale: string                // "es"
  source: TranslationSource     // "official" | "community"
  version: string               // "1.0.0" (versión del pack)
  author?: string               // "Comunidad D&D España"

  // Las traducciones por entidad
  translations: Record<EntityId, TranslatedFields>
}

type TranslationSource = "official" | "community"

type EntityId = string          // ID de la entidad en el compendio

type TranslatedFields = {
  name?: string
  description?: string
  shortDescription?: string
  // Solo campos marcados como translatable en el schema
  [field: string]: string | undefined
}
```

### Entity con soporte de traducción

Las entidades pueden tener traducciones embebidas (oficiales del autor) además de las que vienen de packs externos.

```typescript
type Entity = {
  id: string
  entityType: string

  // Campos traducibles en idioma base
  name: string
  description?: string

  // Traducciones embebidas (opcionales, del autor del compendio)
  translations?: {
    [locale: string]: TranslatedFields
  }

  // Resto de campos...
}
```

### EntityFieldDefinition (extensión)

El schema de entidades se extiende con un flag para marcar campos traducibles.

```typescript
type EntityFieldDefinition = {
  name: string
  type: EntityFieldType
  optional?: boolean
  // ...campos existentes

  // Nuevo: marca el campo como traducible
  translatable?: boolean
}
```

---

## Storage y Sincronización

### Estructura de almacenamiento

```
storage/
├── compendiums/                    # Compendios (contenido)
│   ├── srd-35/
│   │   ├── manifest.json           # Metadatos del compendio
│   │   └── entities/
│   │       ├── spell/
│   │       │   ├── fireball.json
│   │       │   └── magic-missile.json
│   │       └── feat/
│   │           └── power-attack.json
│   └── book-of-vile-darkness/
│       ├── manifest.json
│       └── entities/...
│
└── translationPacks/               # Packs de traducción (separados)
    ├── srd-35-es-official/
    │   ├── manifest.json           # Metadatos del pack
    │   └── translations.json       # Las traducciones
    ├── srd-35-es-community/
    │   ├── manifest.json
    │   └── translations.json
    └── srd-35-fr-official/
        ├── manifest.json
        └── translations.json
```

### Sincronización Local-First

Los Translation Packs se sincronizan independientemente de los compendios:

1. **Compendios**: Sync normal de contenido
2. **Translation Packs**: Sync separado, el usuario elige cuáles instalar/activar

```typescript
type UserTranslationSettings = {
  // Packs instalados localmente
  installedPacks: string[]          // IDs de packs

  // Packs activos por compendio
  activePackByCompendium: {
    [compendiumId: string]: string  // Pack ID activo
  }

  // Locale preferido (fallback global)
  preferredLocale: string
}
```

---

## Flujo de Resolución

### Prioridad de resolución

Cuando se solicita una entidad en un locale específico:

```
1. Translation Pack activo para ese compendio + locale
   ↓ (si no existe)
2. Traducción embebida en la entidad
   ↓ (si no existe)
3. Idioma base del compendio (sin traducir)
```

### Implementación

```typescript
type LocalizationContext = {
  compendiumId: string
  installedPacks: TranslationPack[]
  activePackId?: string
}

function getLocalizedEntity<T extends Entity>(
  entity: T,
  locale: string,
  context: LocalizationContext
): T {
  // 1. Buscar pack activo para este compendio + locale
  const activePack = context.installedPacks.find(p =>
    p.id === context.activePackId &&
    p.targetCompendiumId === context.compendiumId &&
    p.locale === locale
  )

  if (activePack?.translations[entity.id]) {
    return mergeTranslation(entity, activePack.translations[entity.id])
  }

  // 2. Buscar traducción embebida
  if (entity.translations?.[locale]) {
    return mergeTranslation(entity, entity.translations[locale])
  }

  // 3. Devolver entidad sin traducir
  return entity
}

function mergeTranslation<T extends Entity>(
  entity: T,
  translation: TranslatedFields
): T {
  const result = { ...entity }

  for (const [field, value] of Object.entries(translation)) {
    if (value !== undefined && field in entity) {
      (result as Record<string, unknown>)[field] = value
    }
  }

  return result
}
```

### Hook para React

```typescript
function useLocalizedEntity<T extends Entity>(
  entity: T,
  options?: { locale?: string }
): T {
  const { preferredLocale, installedPacks, getActivePackForCompendium } = useTranslationStore()
  const locale = options?.locale ?? preferredLocale

  const compendiumId = entity.compendiumId // Asumiendo que la entidad sabe de dónde viene
  const activePackId = getActivePackForCompendium(compendiumId)

  return useMemo(() => {
    return getLocalizedEntity(entity, locale, {
      compendiumId,
      installedPacks,
      activePackId
    })
  }, [entity, locale, compendiumId, installedPacks, activePackId])
}

// Uso
function SpellCard({ spell }: { spell: Spell }) {
  const localizedSpell = useLocalizedEntity(spell)

  return (
    <Card>
      <Text>{localizedSpell.name}</Text>
      <Text>{localizedSpell.description}</Text>
    </Card>
  )
}
```

---

## Objetivos y Requisitos Cumplidos

### Objetivos Principales

| Objetivo | Cumplido | Cómo |
|----------|----------|------|
| Separación de conceptos | Si | Compendios son contenido, Translation Packs son metadatos |
| Local-first | Si | Todo se resuelve localmente, sin servidor |
| Múltiples fuentes de traducción | Si | Oficiales (embebidas) + packs externos |
| Contribuciones comunitarias | Si | Cualquiera puede crear un Translation Pack |
| Control del usuario | Si | El usuario elige qué packs instalar/activar |
| Versionado independiente | Si | Packs tienen su propia versión, declaran compatibilidad |

### Requisitos Técnicos

| Requisito | Cumplido | Cómo |
|-----------|----------|------|
| No duplicar contenido | Si | El pack solo tiene strings traducidos, no entidades completas |
| Fallback graceful | Si | Pack > Embebida > Original |
| Sync eficiente | Si | Packs se sincronizan independientemente |
| Schema-aware | Si | Solo campos marcados `translatable` se traducen |
| Compatibilidad de versiones | Si | targetVersionRange con semver |

### Requisitos de UX

| Requisito | Cumplido | Cómo |
|-----------|----------|------|
| Cambio de idioma sin recargar | Si | Resolución en runtime |
| Ver idioma original | Si | El original siempre está disponible |
| Mezclar packs | Si | Un pack por compendio activo, pero múltiples instalados |
| Traducciones parciales | Si | Solo se traducen los campos que el pack incluye |

---

## Casos de Uso

### 1. Usuario quiere SRD en español

```
1. Instala compendio "SRD 3.5" (en inglés)
2. Busca Translation Packs disponibles para "srd-35" + locale "es"
3. Encuentra "srd-35-es-official" y "srd-35-es-community"
4. Instala "srd-35-es-official"
5. Lo activa como pack predeterminado para ese compendio
6. Las entidades del SRD ahora se muestran en español
```

### 2. Autor de compendio incluye traducciones

```typescript
// El autor embebe traducciones en sus entidades
const mySpell: Spell = {
  id: "rayo-oscuro",
  name: "Dark Ray",
  description: "A ray of darkness...",
  translations: {
    es: {
      name: "Rayo Oscuro",
      description: "Un rayo de oscuridad..."
    }
  }
}
```

### 3. Traductor comunitario crea un pack

```typescript
const communityPack: TranslationPack = {
  id: "homebrew-compendium-es-community",
  name: "Homebrew - Español Comunidad",
  targetCompendiumId: "some-homebrew",
  targetVersionRange: "^1.0.0",
  locale: "es",
  source: "community",
  version: "1.0.0",
  author: "Traductor Anónimo",
  translations: {
    "spell-1": { name: "Conjuro Uno", description: "..." },
    "spell-2": { name: "Conjuro Dos", description: "..." }
  }
}
```

### 4. Compendio se actualiza, pack queda desactualizado

```
1. Compendio "srd-35" se actualiza de 1.0.0 a 2.0.0
2. Translation Pack "srd-35-es-official" tiene targetVersionRange: "^1.0.0"
3. El sistema detecta incompatibilidad
4. Opciones:
   a) Seguir usando el pack (puede faltar contenido nuevo)
   b) Desactivar el pack hasta que se actualice
   c) Mostrar warning al usuario
```

---

## Consideraciones de Implementación

### Fase 1: Infraestructura Base

1. Extender `EntityFieldDefinition` con `translatable?: boolean`
2. Crear tipo `TranslationPack`
3. Crear store de traducciones (Zustand)
4. Implementar `getLocalizedEntity()`
5. Crear hook `useLocalizedEntity()`

### Fase 2: Storage y Sync

1. Definir estructura de storage para Translation Packs
2. Implementar CRUD para packs
3. Sincronización con Supabase (si aplica)

### Fase 3: UI

1. Pantalla de gestión de Translation Packs instalados
2. Selector de idioma/pack por compendio
3. Indicador visual de traducciones parciales
4. Integrar en Visual Playground

### Fase 4: Ecosistema

1. Repositorio público de Translation Packs
2. Herramienta para crear packs (en Visual Playground)
3. Validación de compatibilidad de versiones

---

## Alternativas Consideradas

### Translation Pack como Compendio

**Rechazada** porque mezcla conceptos. Un compendio es contenido de dominio (conjuros, dotes), un pack de traducciones es metadata que se aplica sobre otro compendio.

### Traducciones Solo Embebidas

**Rechazada** porque no permite contribuciones comunitarias ni actualizaciones independientes de las traducciones.

### Tabla Separada de Traducciones (por campo)

```typescript
// Alternativa rechazada
type Translation = {
  entityType: string
  entityId: string
  locale: string
  field: string       // "name", "description", etc.
  value: string
}
```

**Rechazada** por excesiva granularidad y complejidad de queries.

---

## Referencias

- [Entity System PRD](/packages/core/core/domain/entities/EntityManagement.prd.md)
- [Addons Documentation](/packages/core/core/domain/entities/ADDONS.md)
- [Design Notes](/packages/core/core/domain/entities/DESIGN_NOTES.md)
- [Discusión sobre estrategia híbrida](/Users/cilveti/Downloads/cursor_estrategia_h_brida_de_traducci_n.md)
