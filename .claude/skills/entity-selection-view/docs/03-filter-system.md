# Sistema de Filtros

## Arquitectura

```
EntityFilterConfig (declarativo, estatico)
    ↓
FilterState (runtime, estado actual de filtros)
    ↓
applyFilterConfig() (aplica state sobre entidades, en packages/core)
```

## EntityFilterConfig

```typescript
type EntityFilterConfig = {
  entityType: string       // 'spell', 'item', 'feat'...
  label: string            // 'Conjuros', 'Items'...
  filters: FilterDef[]     // Definiciones de filtros
}
```

## FilterDef - Tipos de Filtro

### FacetFilterDef

Campo de la entidad con opciones derivadas de los valores existentes.

```typescript
{
  kind: 'facet',
  id: 'school',
  label: 'Escuela',
  facetField: 'school',        // Path en la entidad (soporta dot notation: "data.type")
  multiSelect: true,           // true: OR logic entre seleccionados; false: single select
  ui: { size: 'compact' },     // Hints de renderizado opcionales
}
```

### RelationFilterDef

Selector dual dependiente (primary -> secondary). Usa datos de relacion compilados en la entidad.

```typescript
{
  kind: 'relation',
  id: 'classLevel',
  label: 'Clase y Nivel',
  relationMapPath: 'classData.classLevels',   // Path al mapa de relacion
  primary: {
    id: 'class',
    label: 'Clase',
    options: [{ value: 'wizard', label: 'Mago' }, ...],
  },
  secondary: {
    id: 'level',
    label: 'Nivel',
    labelFormat: 'Nivel {value}',   // Template para labels del secondary
  },
}
```

El secondary calcula opciones dinamicamente con `getRelationSecondaryOptions()`.

### EntityTypeFilterDef

Para browsers multi-tipo (ej: inventario que mezcla weapon, armor, shield...).

```typescript
{
  kind: 'entityType',
  id: 'entityType',
  label: 'Tipo',
  entityTypes: ['weapon', 'armor', 'shield', 'item'],
  multiSelect: true,
  typeLabels: { weapon: 'Arma', armor: 'Armadura', ... },
}
```

### FilterGroupDef

Agrupacion visual. Los children se aplican como filtros normales.

```typescript
{
  kind: 'group',
  id: 'spellDetails',
  layout: 'column',   // 'row' o 'column'
  children: [
    { kind: 'facet', id: 'castingTime', ... },
    { kind: 'facet', id: 'range', ... },
  ],
}
```

## applyFilterConfig()

**Ubicacion**: `packages/core/core/domain/entities/filtering/applyFilterConfig.ts`

```typescript
import { applyFilterConfig, matchesFacetFilter } from '@zukus/core'

// Aplica todos los filtros de un config sobre las entidades
const filtered = applyFilterConfig(entities, filterConfig, filterState)

// Utilidad publica para match de facet individual
const matches = matchesFacetFilter(entity, 'school', ['evocation', 'abjuration'])
```

**Logica**:
- Itera cada `FilterDef` del config y aplica en secuencia (AND entre filtros)
- Dentro de multi-select: OR (la entidad pasa si matchea cualquiera de los valores seleccionados)
- `null` o array vacio como valor de filtro = no filtrar (passthrough)
- Groups se aplanan recursivamente

## FilterState

```typescript
type FilterValue = string | number | boolean | string[] | number[] | null
type FilterState = Record<string, FilterValue>   // Keys = filter IDs

// Ejemplo para spellFilterConfig:
{
  class: 'wizard',          // primary del relation filter
  level: 3,                 // secondary del relation filter
  school: ['evocation'],    // facet multiselect
  components: null,         // sin filtro activo
}
```

## FilterConfig Registry

```typescript
import { registerFilterConfig, getFilterConfig, hasFilterConfig } from '@zukus/core'

// Registrados por defecto:
getFilterConfig('spell')      // spellFilterConfig
getFilterConfig('maneuver')   // maneuverFilterConfig
getFilterConfig('item')       // itemFilterConfig

// Registrar nuevo:
registerFilterConfig(myFeatFilterConfig)
```

**Ubicacion**: `packages/core/core/domain/entities/filtering/filterConfigRegistry.ts`

## Configs Pre-construidas

| Config | Filtros |
|--------|---------|
| `spellFilterConfig` | relation (clase+nivel), facet (escuela, componentes, tiempo de lanzamiento, rango, resistencia a conjuros) |
| `maneuverFilterConfig` | relation (clase+nivel), facet (disciplina, tipo, accion de iniciativa) |
| `itemFilterConfig` | entityType (weapon/armor/shield/...), facet (slot, tags) |

**Ubicacion**: `packages/core/core/domain/entities/filtering/configs/`

## Crear un Nuevo FilterConfig

1. Identificar campos filtrables del schema de la entidad
2. Crear `EntityFilterConfig` con los `FilterDef` apropiados
3. Para relaciones: necesitas datos compilados en la entidad (via relation entities del SRD)
4. Registrar con `registerFilterConfig(config)` si debe estar globalmente disponible
5. Pasar como `filterConfig` prop a `EntitySelectionView`

```typescript
const featFilterConfig: EntityFilterConfig = {
  entityType: 'feat',
  label: 'Dotes',
  filters: [
    { kind: 'facet', id: 'featType', label: 'Tipo', facetField: 'featType', multiSelect: true },
    { kind: 'facet', id: 'source', label: 'Fuente', facetField: 'source' },
  ],
}
```

## initialFilterOverrides

Pre-selecciona valores de filtro al abrir el componente. Las keys son los IDs de los filtros.

```typescript
// Pre-seleccionar clase wizard y nivel 3 en un relation filter:
initialFilterOverrides={{ class: 'wizard', level: 3 }}

// Pre-seleccionar tipos weapon y armor en un entityType filter:
initialFilterOverrides={{ entityType: ['weapon', 'armor'] }}
```

## UI de Filtros

### EntityFilterView
Vista fullscreen que renderiza controles de filtro segun el tipo de cada FilterDef. Se muestra cuando el usuario pulsa el boton "Filtros".

**Ubicacion**: `apps/zukus/components/filters/EntityFilterView.tsx`

### ActiveFilterChips
Chips removibles sobre la lista para filtros activos. Boton "Limpiar todos" si hay multiples.

**Ubicacion**: `apps/zukus/components/filters/ActiveFilterChips.tsx`
