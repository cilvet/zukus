# Sub-componentes

## Componentes de entitySelection/

### SearchBar

Input de busqueda con boton clear (X).

```typescript
type SearchBarProps = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  textColor: string
  placeholderColor: string
}
```

**TestIDs**: `search-input`, `search-clear`

### SelectionHeader

Label + badge de progreso. Badge verde (`$green9`) si `current >= min`, amarillo (`$yellow9`) si no.

```typescript
type SelectionHeaderProps = {
  label: string       // "Dote de Combate Bonus"
  current: number     // Seleccionadas actualmente
  max: number         // Maximo permitido
  min: number         // Minimo requerido
}
```

**TestID**: `selection-badge`

### SelectionRow

Fila con checkbox inline. Altura fija 72px (SELECTION_ROW_HEIGHT). Usada en selection mode con <=15 entidades.

```typescript
type SelectionRowProps = {
  id: string
  name: string
  description?: string
  badge?: string | null
  isSelected: boolean
  disabled: boolean
  showEligibilityBadge: boolean    // Muestra badge "No elegible" rojo
  onToggle: (entityId: string, checked: boolean) => void
  onInfoPress?: (entityId: string) => void
}
```

Click en la fila entera toggle la seleccion (si no disabled). Usa `Checkbox` de `ui/atoms`.

### SelectedChips

Pills removibles de entidades seleccionadas. Usada en selection mode con >15 entidades. Retorna `null` si `selectedEntities.length === 0`.

```typescript
type SelectedChipsProps = {
  selectedEntities: EntityInstance[]
  onDeselect: (instanceId: string) => void
  placeholderColor: string
}
```

**TestIDs**: `selected-chips`, `chip-remove-{entityId}`

---

## Componentes de entityBrowser/ (reutilizados)

### EntityRowWithMenu

Fila de entidad con boton de accion integrado. Altura fija 72px (ENTITY_ROW_HEIGHT).

**Adaptacion por plataforma**:
- Desktop web + dropdown: Popover inline con acciones
- Mobile o counter: Pressable simple

```typescript
type EntityRowWithMenuProps = {
  id: string
  name: string
  description?: string
  metaLine?: string                  // "Arma | 3 lb | 15 gp"
  badge?: string | null              // "Nv 3"
  image?: string
  color: string
  placeholderColor: string
  accentColor: string
  buttonConfig: ButtonConfig
  buttonDisabled?: boolean
  onPress: (id: string) => void              // Navegar al detalle
  onOpenDropdown?: (id: string) => void      // Mobile: abrir bottom sheet
  onExecuteAction?: (actionId: string, entityId: string) => void
  getActionState?: (actionId: string, entityId: string) => ActionState
}
```

**En EntitySelectionView**:
- Dropdown mode: `buildButtonConfig` genera `DropdownButtonConfig`
- Counter mode: `buildButtonConfig` genera `CounterButtonConfig`
- Selection mode (large): Genera `CounterButtonConfig` con label "Seleccionar"

### CounterBar

Barra de progreso fija en la parte inferior. Altura 56px (COUNTER_BAR_HEIGHT).

```typescript
type CounterBarProps = {
  current: number
  max: number
  label: string           // "3 de 5 preparados"
  accentColor: string
  onComplete?: () => void  // Aparece boton OK cuando current >= max
}
```

Barra visual de progreso: verde cuando completo, accentColor cuando en progreso.

### ActionDropdownSheet

Bottom sheet mobile para acciones dropdown. Compartido (una sola instancia para toda la lista).

Muestra: nombre de entidad como titulo, acciones agrupadas con iconos, subtext y estado disabled.

### ActionButton

Boton individual en cada fila. Dropdown: label + chevron. Counter: label del action.

---

## Componentes de filters/ (reutilizados)

### EntityFilterView

Vista fullscreen de controles de filtro. Reemplaza temporalmente la lista cuando el usuario pulsa "Filtros".

```typescript
type EntityFilterViewProps = {
  config: EntityFilterConfig
  entities: unknown[]                   // Para calcular opciones dinamicas
  filterState: FilterState
  onFilterChange: (filterId: string, value: FilterValue) => void
  onApply: () => void
  onCancel: () => void
  contextContent?: ReactNode
}
```

### ActiveFilterChips

Chips removibles sobre la lista para filtros activos. Cada chip: label del filtro + valor, boton X para limpiar. Boton "Limpiar todos" si hay multiples filtros activos.

```typescript
type ActiveFilterChipsProps = {
  config: EntityFilterConfig
  filterState: FilterState
  onClearFilter: (filterId: string) => void
  onClearAll: () => void
}
```
