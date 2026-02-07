# EntityBrowserPanel - Documentacion Detallada

## Estructura del Componente

```
EntityBrowserPanel
├── FlashList (lista virtualizada)
│   ├── ListHeaderComponent
│   │   ├── SearchBar (TextInput + icono)
│   │   ├── Boton "Filtros" (abre EntityFilterView)
│   │   ├── ActiveFilterChips (chips removibles)
│   │   └── Conteo de resultados
│   ├── EntityRowWithMenu (por cada entidad)
│   │   ├── Info: nombre, descripcion, metaLine, badge, imagen
│   │   └── ActionButton (dropdown icon o counter action)
│   └── ListEmptyComponent
├── ActionDropdownSheet (BottomSheet mobile compartido)
├── CounterBar (barra de progreso fija, solo counter mode)
└── EntityFilterView (fullscreen, cuando showFilters=true)
```

## Flujo de Estado Interno

1. **Filtros**: Doble estado (`appliedFilterState` + `pendingFilterState`). Al abrir filtros se clona applied -> pending. Al aplicar se copia pending -> applied. Al cancelar se descarta pending.
2. **Busqueda**: `searchQuery` filtra por `filterBySearch()` (nombre + descripcion).
3. **Dropdown**: `dropdownEntityId` controla que entidad tiene el menu abierto. El sheet es compartido (una sola instancia para toda la lista).

## Patron 'use no memo'

El componente usa la directiva `'use no memo'` de React Compiler. Esto significa:
- No se usan `useMemo` ni `useCallback`
- Los handlers son funciones planas
- Los objetos se recrean cada render (el compiler optimiza)

## Ejemplo Completo: Consumidor Custom

```typescript
import { EntityBrowserPanel } from '../../components/entityBrowser'
import { getFilterConfig, registerFilterConfig } from '@zukus/core'
import type { ActionHandlers, ButtonConfig, ActionResult } from '../../components/entityBrowser'

// 1. Filter config (si no existe, crear y registrar)
const featFilterConfig = {
  entityType: 'feat',
  label: 'Dotes',
  filters: [
    { kind: 'facet', id: 'featType', label: 'Tipo', facetField: 'featType', multiSelect: true },
  ],
}

// 2. Button config
const buttonConfig: ButtonConfig = {
  type: 'dropdown',
  label: 'Seleccionar',
  icon: 'plus',
  groups: [
    { actions: [{ id: 'select', label: 'Seleccionar dote', icon: 'check' }] },
  ],
}

// 3. Handlers
const handlers: ActionHandlers = {
  onExecute: (actionId, entityId): ActionResult => {
    if (actionId === 'select') {
      // logica de seleccion
      return { success: true, toastMessage: 'Dote seleccionada' }
    }
    return { success: false }
  },
}

// 4. Render
<EntityBrowserPanel
  entities={allFeats}
  filterConfig={featFilterConfig}
  buttonConfig={buttonConfig}
  handlers={handlers}
  onEntityPress={handleFeatPress}
  searchPlaceholder="Buscar dotes..."
  resultLabelSingular="dote"
  resultLabelPlural="dotes"
/>
```

## Ejemplo: ItemBrowserPanel (Dropdown)

Referencia real en `apps/zukus/components/character/panels/ItemBrowserPanel.tsx`:

- **Entidades**: Agrega multiples tipos de item (`weapon`, `armor`, `shield`, etc.) en una sola lista con `getAllItems()`
- **FilterConfig**: Usa `itemFilterConfig` con filtro `entityType` (chips de tipo) + filtros facet (`slot`, `tags`)
- **ButtonConfig**: Dropdown con dos grupos: "Gratis" (`add`) y "Comercio" (`buy`)
- **Handlers**: `add` agrega al inventario directo; `buy` verifica dinero, gasta monedas y agrega
- **getActionState**: Para `buy` devuelve `subtext` con precio y `disabled` si no puede pagar
- **customFilter**: `applyItemFilters()` maneja el filtro entityType + facets manualmente
- **initialFilterOverrides**: Opcional `defaultEntityTypes` para pre-filtrar por tipos

## Ejemplo: CGEEntitySelectPanel (Counter)

Referencia real en `apps/zukus/components/character/panels/CGEEntitySelectPanel.tsx`:

- **Entidades**: Todos los spells/maneuvers del compendio (`compendium.getAllEntities(entityType)`)
- **FilterConfig**: Usa `getFilterConfig(entityType)` del registry (spellFilterConfig o maneuverFilterConfig)
- **ButtonConfig**: Counter con accion "Preparar" o "Aprender" segun modo
- **Handlers (CounterHandlers)**:
  - `onExecute`: Prepara en slot (`prepareEntityForCGE`) o agrega known (`addKnownForCGE`)
  - `getProgress`: Calcula slots ocupados vs totales para ese nivel
  - `getProgressLabel`: "3 de 5 preparados" o "2 aprendidos"
  - `onComplete`: Cierra el panel
- **initialFilterOverrides**: Pre-selecciona clase del CGE y nivel del slot
- **getBadge**: Muestra nivel del conjuro para la clase seleccionada
- **filterContextContent**: Info box indicando nivel del slot/aprendizaje
- **customFilter**: Aplica filtros de relacion y facet manualmente

## Adaptacion Desktop vs Mobile

- **Desktop**: `EntityRowWithMenu` renderiza un `Popover` inline al pulsar el boton de accion
- **Mobile**: Delega al `ActionDropdownSheet` compartido del panel (un solo BottomSheet para toda la lista, controlado por `dropdownEntityId`)
- La decision se toma dentro de `EntityRowWithMenu` basandose en la plataforma
- El `CounterBar` se muestra fijo en la parte inferior en ambas plataformas

## Integracion con Navegacion

El `EntityBrowserPanel` se muestra en:
- **Desktop**: Como panel lateral via `SidePanelContent` (detailRegistry types: `itemBrowser`, `cgeEntitySelect`)
- **Mobile**: Como pantalla completa via expo-router (`characters/cge/select.tsx`, etc.)

Los consumidores acceden via `usePanelNavigation()` (desktop) o `router.push()` (mobile).
