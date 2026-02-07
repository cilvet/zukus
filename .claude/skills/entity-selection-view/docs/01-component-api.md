# EntitySelectionView - API Completa

## Props (`EntitySelectionViewProps<T extends StandardEntity>`)

```typescript
type EntitySelectionViewProps<T extends StandardEntity> = {
  entities: T[]                        // Todas las entidades a mostrar
  modeConfig: ModeConfig               // Configuracion de modo (dropdown | counter | selection)
  onEntityPress: (entity: T) => void   // Navegacion al detalle
  filterConfig?: EntityFilterConfig    // Habilita filtros (search bar + chips + vista de filtros)
  initialFilterOverrides?: Partial<FilterState>  // Valores iniciales de filtros
  customFilter?: (entities: T[], filterState: FilterState) => T[]  // Reemplaza applyFilterConfig
  getMetaLine?: (entity: T) => string | undefined   // Linea de metadata (ej: "Arma | 3 lb | 15 gp")
  getBadge?: (entity: T) => string | null            // Badge por entidad (ej: "Nv 3")
  searchPlaceholder?: string           // Default: "Buscar..."
  emptyText?: string                   // Default: "No hay elementos disponibles."
  emptySearchText?: string             // Default: "No se encontraron resultados."
  resultLabelSingular?: string         // Default: "resultado"
  resultLabelPlural?: string           // Default: "resultados"
  filterContextContent?: ReactNode     // Contenido extra en la vista de filtros
}
```

## ModeConfig - Union Discriminada

### DropdownModeConfig

```typescript
type DropdownModeConfig = {
  mode: 'dropdown'
  buttonLabel: string          // Texto del boton (ej: "Anadir")
  buttonIcon?: string          // Icono FontAwesome6 (ej: "plus")
  groups: ActionGroup[]        // Grupos de acciones para el menu
  handlers: ActionHandlers     // Logica de ejecucion
}

type ActionGroup = {
  label?: string               // Titulo del grupo (ej: "Comercio")
  actions: ActionDefinition[]  // Acciones del grupo
}

type ActionDefinition = {
  id: string                   // Identificador (ej: "buy")
  label: string                // Texto visible (ej: "Comprar")
  icon?: string                // Icono FontAwesome6
}

type ActionHandlers = {
  onExecute: (actionId: string, entityId: string) => ActionResult
  getActionState?: (actionId: string, entityId: string) => ActionState
}

type ActionResult = { success: boolean, shouldClose?: boolean, toastMessage?: string }
type ActionState = { subtext?: string | null, disabled?: boolean, hidden?: boolean }
```

### CounterModeConfig

```typescript
type CounterModeConfig = {
  mode: 'counter'
  action: ActionDefinition          // Accion unica (ej: { id: 'prepare', label: 'Preparar' })
  handlers: CounterHandlers         // Logica + progreso
  closeOnComplete?: boolean         // Cerrar al completar
}

type CounterHandlers = ActionHandlers & {
  getProgress: () => { current: number, max: number }
  getProgressLabel: () => string    // Ej: "3 de 5 preparados"
  onComplete?: () => void           // Llamado al pulsar OK tras completar
}
```

### SelectionModeConfig

```typescript
type SelectionModeConfig = {
  mode: 'selection'
  selectedEntities: EntityInstance[]               // Ya seleccionadas
  eligibleEntities: FilterResult<StandardEntity>[] // Todas las opciones con elegibilidad
  onSelect: (entityId: string) => void             // Seleccionar entidad
  onDeselect: (instanceId: string) => void         // Deseleccionar (por instanceId)
  min: number                                      // Selecciones minimas
  max: number                                      // Selecciones maximas
  selectionLabel?: string                          // Label en el header (ej: "Dote de Combate Bonus")
}
```

**Tipos usados por selection**:

```typescript
type EntityInstance = {
  instanceId: string         // "{entityId}@{origin}"
  entity: StandardEntity
  applicable: boolean        // Activa en el nivel actual
  origin: string             // De donde viene
}

type FilterResult<T> = {
  entity: T
  matches: boolean           // Pasa el filtro de elegibilidad
  evaluatedConditions: ConditionEvaluationResult[]
}
```

## Type Guards

```typescript
import { isDropdownMode, isCounterMode, isSelectionMode } from './types'

if (isDropdownMode(modeConfig)) { /* modeConfig es DropdownModeConfig */ }
```

## Comportamiento Adaptativo

El componente adapta su UI automaticamente:

| Condicion | Resultado |
|-----------|-----------|
| `entities.length > 15 \|\| !!filterConfig` | Muestra search bar |
| `mode === 'selection' && entities.length <= 15` | Usa `SelectionRow` (checkboxes) |
| `mode === 'selection' && entities.length > 15` | Usa `EntityRowWithMenu` con boton "Seleccionar" + `SelectedChips` |
| `mode === 'counter'` | Muestra `CounterBar` fija abajo |
| `mode === 'dropdown' && Platform.OS === 'web'` | Popover inline por fila |
| `mode === 'dropdown' && Platform.OS !== 'web'` | Bottom sheet compartido |

## Estructura Visual

```
EntitySelectionView
├── [showFilters] EntityFilterView (fullscreen, reemplaza la lista)
└── [else]
    ├── FlashList
    │   ├── ListHeader:
    │   │   ├── [selection] SelectionHeader (label + badge progreso)
    │   │   ├── [showSearchBar] SearchBar + boton Filtros
    │   │   ├── [filterConfig] ActiveFilterChips
    │   │   ├── [selection && large] SelectedChips
    │   │   └── ResultCount ("3 resultados")
    │   ├── renderItem:
    │   │   ├── [selection && small] SelectionRow (checkbox inline)
    │   │   └── [else] EntityRowWithMenu (con boton de accion)
    │   └── ListEmptyComponent
    ├── [dropdown] ActionDropdownSheet (mobile only)
    └── [counter] CounterBar (barra de progreso fija)
```

## Estado Interno

- `appliedFilterState` / `pendingFilterState`: Doble estado de filtros (pending mientras edita, applied al confirmar)
- `searchQuery`: Texto de busqueda
- `showFilters`: Muestra EntityFilterView (fullscreen)
- `dropdownEntityId`: Entidad con menu abierto (solo dropdown mode mobile)

## Pipeline de Filtrado

```
entities (prop)
  → applyFilterConfig(entities, filterConfig, appliedFilterState)  [si filterConfig]
  → customFilter(entities, appliedFilterState)                     [si customFilter, en vez de applyFilterConfig]
  → filterBySearch(result, searchQuery)                            [siempre]
  → filteredEntities (para renderizar)
```
