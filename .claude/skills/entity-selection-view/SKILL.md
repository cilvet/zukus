---
name: entity-selection-view
description: Vista de seleccion de entidades reutilizable. Consultar cuando se necesite navegar, filtrar o seleccionar entidades del compendio (items, conjuros, dotes, habilidades de clase, atributos) en cualquier contexto de la aplicacion.
---

# EntitySelectionView

Componente unificado para navegar, filtrar y seleccionar entidades. Reemplaza los antiguos `EntityBrowserPanel` (deprecated) y el renderizado directo de `EntitySelectorDetail`.

> Referencia completa de la API: `docs/01-component-api.md`

---

## Tres modos

El componente se configura via `modeConfig: ModeConfig` (union discriminada por `mode`).

### dropdown - Inventario y listas con acciones agrupadas
Menu de acciones agrupadas (ej: "Anadir gratis", "Comprar"). Cada fila tiene un boton que abre un popover (desktop) o bottom sheet (mobile). Soporta `getActionState` para subtext, disabled y hidden por accion.

**Consumidor**: `ItemBrowserPanel.tsx`

### counter - CGE (preparar/aprender conjuros y maniobras)
Accion directa con barra de progreso. Cada fila tiene un boton que ejecuta la accion. `CounterBar` fija abajo muestra progreso y boton OK al completar.

**Consumidor**: `CGEEntitySelectPanel.tsx`

> Para entender las dimensiones del CGE (Known, Resource, Preparation, Tracks) consultar la skill `cge`.

### selection - Providers de nivel (dotes, habilidades, ASI)
Seleccion con min/max. Comportamiento adaptativo segun tamano de lista:
- **<=15 entidades**: Checkboxes inline (`SelectionRow`), sin search bar
- **>15 entidades**: Boton "Seleccionar" por fila + chips removibles de seleccionados (`SelectedChips`)

**Consumidor**: `EntitySelectorDetail.tsx` (via `useProviderSelection` hook)

> Detalle de cada modo con ejemplos reales: `docs/02-modes-and-consumers.md`

---

## Filtrado

Dos capas de filtrado independientes:

### applyFilterConfig() - Core
Funcion pura en `packages/core` que aplica un `EntityFilterConfig` sobre un array de entidades. Soporta 4 tipos de filtro (`facet`, `relation`, `entityType`, `group`) con logica AND entre filtros y OR dentro de multi-select.

### filterBySearch() - App
Filtra por texto en `name` y `description`. Se aplica despues de `applyFilterConfig`.

### customFilter - Alternativa
Prop opcional que reemplaza `applyFilterConfig` con logica custom del consumidor.

> Detalle del sistema de filtros: `docs/03-filter-system.md`

---

## Sub-componentes

| Componente | Proposito | Ubicacion |
|------------|-----------|-----------|
| `SearchBar` | Input de busqueda con boton clear | `entitySelection/SearchBar.tsx` |
| `SelectionHeader` | Label + badge progreso (0/1, verde/amarillo) | `entitySelection/SelectionHeader.tsx` |
| `SelectionRow` | Fila con checkbox para listas pequenas (72px) | `entitySelection/SelectionRow.tsx` |
| `SelectedChips` | Pills removibles de entidades seleccionadas | `entitySelection/SelectedChips.tsx` |
| `EntityRowWithMenu` | Fila con boton de accion (popover desktop, simple mobile) | `entityBrowser/EntityRowWithMenu.tsx` |
| `ActionDropdownSheet` | Bottom sheet mobile para acciones dropdown | `entityBrowser/actions/ActionDropdownSheet.tsx` |
| `CounterBar` | Barra de progreso fija abajo (56px) | `entityBrowser/actions/CounterBar.tsx` |
| `EntityFilterView` | Vista fullscreen de controles de filtro | `filters/EntityFilterView.tsx` |
| `ActiveFilterChips` | Chips removibles de filtros activos | `filters/ActiveFilterChips.tsx` |

> Detalle de sub-componentes: `docs/04-subcomponents.md`

---

## Testing

- Framework: `vitest` con `happy-dom`, se ejecuta con `cd apps/zukus && bunx vitest run`
- Tests en `components/entitySelection/__tests__/EntitySelectionView.test.tsx` (32 tests)
- Tests de core en `packages/core/.../filtering/__tests__/applyFilterConfig.test.ts` (31 tests)
- ThemeProvider wrapper requerido para todos los renders
- Mocks necesarios: tamagui, flash-list, reanimated, expo-vector-icons, safe-area-context
- Platform.OS = 'web' en tests, por lo que EntityRowWithMenu usa la rama Popover (desktop)

> Detalle del entorno de tests, mocks y patrones: `docs/05-testing.md`

---

## Cuadro de decision

| Necesitas... | Modo | Ejemplo |
|--------------|------|---------|
| Navegar lista grande + ejecutar acciones con menu | `dropdown` | Inventario: agregar/comprar items |
| Ejecutar accion unica con progreso | `counter` | CGE: preparar conjuros nivel 3 |
| Elegir de conjunto acotado con min/max y checkboxes | `selection` | Dote bonus de Fighter nivel 1 |
| Definir filtros para nuevo tipo de entidad | No es modo, es `filterConfig` | Crear `EntityFilterConfig` |
| Pre-filtrar al abrir | No es modo, es `initialFilterOverrides` | Pre-seleccionar clase wizard |

---

## Archivos clave

| Area | Ubicacion |
|------|-----------|
| **Componente principal** | `apps/zukus/components/entitySelection/EntitySelectionView.tsx` |
| **Tipos y ModeConfig** | `apps/zukus/components/entitySelection/types.ts` |
| **Barrel export** | `apps/zukus/components/entitySelection/index.ts` |
| **Tests** | `apps/zukus/components/entitySelection/__tests__/EntitySelectionView.test.tsx` |
| **Consumidor inventario** | `apps/zukus/components/character/panels/ItemBrowserPanel.tsx` |
| **Consumidor CGE** | `apps/zukus/components/character/panels/CGEEntitySelectPanel.tsx` |
| **Consumidor providers** | `apps/zukus/ui/components/EntityProvider/EntitySelectorDetail.tsx` |
| **Hook de seleccion** | `apps/zukus/ui/components/EntityProvider/useProviderSelection.ts` |
| **applyFilterConfig** | `packages/core/core/domain/entities/filtering/applyFilterConfig.ts` |
| **FilterConfig types** | `packages/core/core/domain/entities/filtering/filterConfig.ts` |
| **Filter configs** | `packages/core/core/domain/entities/filtering/configs/` |
| **Filter registry** | `packages/core/core/domain/entities/filtering/filterConfigRegistry.ts` |
| **EntityBrowserPanel** (deprecated) | `apps/zukus/components/entityBrowser/EntityBrowserPanel.tsx` |
| **Action types** | `apps/zukus/components/entityBrowser/types.ts` |
| **Utils (search, helpers)** | `apps/zukus/components/entityBrowser/utils.ts` |
