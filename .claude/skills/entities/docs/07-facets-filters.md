# Facetado y Filtros

Sistema para generar opciones de filtrado desde schemas y configurar la UI de filtros.

## Dos Capas

1. **Facets**: Datos brutos generados automaticamente desde schema
2. **FilterConfig**: Configuracion de UI para mostrar filtros al usuario

```
EntitySchemaDefinition
    |
    v
generateFacets() -> EntityFacet[] (datos brutos)
    |
    v
EntityFilterConfig (configuracion manual de UI)
    |
    v
UI Components -> FilterState -> filterEntities()
```

## Capa 1: Facets (Automatico)

**Ubicacion**: `packages/core/core/domain/entities/filtering/facets.ts`

```typescript
import { generateFacets } from '@zukus/core';

const facets = generateFacets(spellSchema, allSpells);
// [
//   { fieldName: 'name', type: 'text' },
//   { fieldName: 'level', type: 'number' },
//   { fieldName: 'school', type: 'select', options: ['Abjuration', 'Evocation', ...] },
//   { fieldName: 'components', type: 'multiselect', options: ['V', 'S', 'M', ...] }
// ]
```

### Mapeo de Tipos

| Tipo de Campo | Tipo de Facet |
|---------------|---------------|
| `string` | `text` (o `select` si tiene allowedValues) |
| `integer` | `number` (o `select` si tiene allowedValues) |
| `boolean` | `boolean` |
| `string_array` | `multiselect` |
| `integer_array` | `multiselect` |
| `reference` | `multiselect` |
| `enum` | `select` (con EnumOption[]) |

### EntityFacet

```typescript
type EntityFacet = {
  fieldName: string;
  displayName: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'boolean';
  options?: string[] | number[] | EnumOption[];
};
```

## Capa 2: FilterConfig (Manual)

**Ubicacion**: `packages/core/core/domain/entities/filtering/filterConfig.ts`

Configuracion que define como se muestran los filtros al usuario.

### Tipos de Filtros

#### 1. FacetFilterDef

Filtro simple basado en un campo:

```typescript
{
  kind: 'facet',
  id: 'school',
  label: 'Escuela',
  facetField: 'school',      // Campo en la entidad
  multiSelect: true,          // Permite varios (OR)
  ui: { placeholder: 'Todas las escuelas' }
}
```

#### 2. RelationFilterDef

Filtro dual dependiente (clase -> nivel):

```typescript
{
  kind: 'relation',
  id: 'classLevel',
  label: 'Clase y Nivel',
  relationMapPath: 'classData.classLevels',
  primary: {
    id: 'class',
    label: 'Clase',
    options: [
      { value: 'wizard', label: 'Mago' },
      { value: 'cleric', label: 'Clerigo' },
    ],
  },
  secondary: {
    id: 'level',
    label: 'Nivel',
    labelFormat: 'Nivel {value}',
  },
}
```

#### 3. FilterGroupDef

Agrupa filtros visualmente:

```typescript
{
  kind: 'group',
  id: 'spellInfo',
  label: 'Informacion',
  layout: 'row',  // 'row' | 'column'
  children: [
    { kind: 'facet', id: 'school', ... },
    { kind: 'facet', id: 'subschool', ... },
  ],
}
```

### EntityFilterConfig

```typescript
type EntityFilterConfig = {
  entityType: string;        // 'spell', 'maneuver'
  label: string;             // 'Conjuros'
  filters: FilterDef[];      // Mix de facets, relations, groups
  defaults?: Record<string, unknown>;
};
```

## Registro de FilterConfigs

```typescript
import {
  registerFilterConfig,
  getFilterConfig
} from '@zukus/core';

// Registrar
registerFilterConfig(spellFilterConfig);
registerFilterConfig(maneuverFilterConfig);

// Obtener
const config = getFilterConfig('spell');
```

## FilterState

```typescript
type FilterValue = string | number | boolean | string[] | number[] | null;
type FilterState = Record<string, FilterValue>;

// Ejemplo
{
  class: 'wizard',
  level: 3,
  school: ['Evocation', 'Abjuration'],
  components: null
}
```

### Crear Estado Inicial

```typescript
import { createInitialFilterState } from '@zukus/core';

const state = createInitialFilterState(spellFilterConfig);
// { class: null, level: null, school: null, ... }
```

## Funciones de Filtrado

### filterEntities

```typescript
import { filterEntities } from '@zukus/core';

const filtered = filterEntities(allSpells, {
  school: 'Evocation',
  components: ['V', 'S'],  // AND: debe tener ambos
  sort_by: 'level',
  sort_order: 'desc'
});
```

### Relation Filter Helpers

```typescript
import {
  getRelationSecondaryOptions,
  applyRelationFilter,
  getRelationFilterChipLabel
} from '@zukus/core';

// Opciones secundarias dinamicas
const levels = getRelationSecondaryOptions(spells, filter, 'wizard');
// [{ value: 1, label: 'Nivel 1' }, { value: 3, label: 'Nivel 3' }, ...]

// Verificar match
const matches = applyRelationFilter(spell, filter, 'wizard', 3);

// Label para chip
const label = getRelationFilterChipLabel(filter, 'wizard', 3);
// 'Mago 3'
```

## Configs Predefinidos

### spellFilterConfig

```typescript
// filtering/configs/spellFilterConfig.ts
{
  entityType: 'spell',
  label: 'Conjuros',
  filters: [
    classLevelFilter,      // Relation
    schoolFilter,          // Facet
    componentsFilter,      // Facet multiselect
    ...
  ]
}
```

### maneuverFilterConfig

```typescript
// filtering/configs/maneuverFilterConfig.ts
{
  entityType: 'maneuver',
  label: 'Maniobras',
  filters: [
    classLevelFilter,
    disciplineFilter,
    maneuverTypeFilter,
    ...
  ]
}
```

## Ejemplo Completo de Uso

```typescript
// En componente React
function SpellBrowser({ spells }: { spells: Spell[] }) {
  const filterConfig = getFilterConfig('spell');
  const [filterState, setFilterState] = useState(
    createInitialFilterState(filterConfig)
  );

  const filtered = useMemo(() => {
    const criteria = {
      school: filterState.school,
      level: filterState.level,
      sort_by: 'name',
    };
    return filterEntities(spells, criteria);
  }, [spells, filterState]);

  return (
    <FilterBar config={filterConfig} state={filterState} onChange={setFilterState} />
    <SpellList spells={filtered} />
  );
}
```

## Componente UI

**Ubicacion**: `apps/zukus/ui/components/filters/ClassLevelFilter.tsx`

```typescript
<ClassLevelFilter
  availableClasses={SPELLCASTING_CLASS_OPTIONS}
  selectedClassId={filterState.class}
  selectedLevel={filterState.level}
  onClassChange={(classId) => setFilterState({ ...state, class: classId })}
  onLevelChange={(level) => setFilterState({ ...state, level })}
  availableLevels={getAvailableLevels(spells, filterState.class)}
/>
```

## Diferencia: Facets vs FilterConfig

| Aspecto | Facets | FilterConfig |
|---------|--------|--------------|
| Generacion | Automatica desde schema | Manual |
| Contenido | Datos brutos | Labels, UI hints, agrupacion |
| Uso | Programatico | Renderizar UI |
| Ejemplo | `{ fieldName: 'school', options: [...] }` | `{ id: 'school', label: 'Escuela', ... }` |

## Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `filtering/facets.ts` | generateFacets |
| `filtering/filters.ts` | filterEntities |
| `filtering/filterConfig.ts` | Tipos y helpers |
| `filtering/filterConfigRegistry.ts` | Registro global |
| `filtering/configs/*.ts` | Configs predefinidos |
| `ui/components/filters/` | Componentes UI |
