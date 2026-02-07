# Testing de EntitySelectionView

## Entorno

- **Framework**: vitest con happy-dom
- **Ejecucion**: `cd apps/zukus && bunx vitest run`
- **Config**: `apps/zukus/vitest.config.ts`
- **Setup**: `apps/zukus/test/setup.ts` (patches de CSSStyleDeclaration + supresion de warnings)
- **Tests de core** (applyFilterConfig): `cd packages/core && bun test`

## Archivos de Tests

| Archivo | Tests | Que cubre |
|---------|-------|-----------|
| `entitySelection/__tests__/EntitySelectionView.test.tsx` | 32 | Renderizado + interacciones de los 3 modos |
| `packages/core/.../filtering/__tests__/applyFilterConfig.test.ts` | 31 | Funcion pura de filtrado |

## Mocks Necesarios

Configurados como aliases en `vitest.config.ts`:

| Modulo | Mock | Notas |
|--------|------|-------|
| `tamagui` / `@tamagui/core` | `test/mocks/tamagui.tsx` | Componentes como divs/spans. Popover con sub-componentes (Trigger, Content, Arrow) |
| `@shopify/flash-list` | `test/mocks/flash-list.tsx` | Renderiza todos los items en un div (sin virtualizacion) |
| `react-native-reanimated` | `test/mocks/react-native-reanimated.ts` | Valores compartidos, animaciones como no-ops |
| `@expo/vector-icons` | `test/mocks/expo-vector-icons.tsx` | Renderiza spans vacios |
| `react-native-safe-area-context` | `test/mocks/safe-area-context.tsx` | Insets a cero |
| `react-native` | `react-native-web` | Alias directo |

### Mock de Tamagui - Puntos Clave

- `createMockComponent(name, element)`: Genera componentes que renderizan el elemento HTML basico. Filtra props de Tamagui, pasa solo `data-*`, `aria-*`, `id`, `className`, `style`, `role`, `onClick`, `testID`.
- `onPress` se mapea a `onClick` automaticamente.
- `testID` se mapea a `data-testid`.
- `useTheme()` devuelve un Proxy que retorna `{ val: 'mock-X', get: () => 'mock-X' }` para cualquier key.
- `Popover` mock renderiza todo siempre (no tiene concepto de open/closed).

### Mock de FlashList - Puntos Clave

```typescript
// Renderiza TODOS los items (sin virtualizacion)
// Incluye ListHeaderComponent, ListEmptyComponent, ListFooterComponent
// data-testid="flash-list"
```

## Wrapper Requerido

Todos los renders necesitan `ThemeProvider` porque los componentes usan `useTheme()`:

```typescript
import { ThemeProvider } from '../../../ui/contexts/ThemeContext'

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

render(<EntitySelectionView ... />, { wrapper })
```

Helper disponible en `test/helpers/renderWithTheme.tsx` (alternativa al wrapper inline).

## Helpers del Test File

```typescript
// Crear entidad de prueba
function entity(id: string, name: string, overrides?: Partial<TestEntity>): TestEntity

// Crear EntityInstance (para selectedEntities)
function entityInstance(entityData: StandardEntity, origin = 'test'): EntityInstance
// Genera instanceId: "{entityId}@{origin}"

// Crear FilterResult (para eligibleEntities)
function filterResult(entityData: StandardEntity, matches = true): FilterResult<StandardEntity>
```

## Patrones de Interaccion

### Click en boton de accion (counter mode)
```typescript
// El boton "Preparar" existe en cada fila de EntityRowWithMenu
const buttons = screen.getAllByText('Preparar')
fireEvent.click(buttons[0]!)
expect(onExecute).toHaveBeenCalledWith('prepare', 'entity-id')
```

### Click en accion del popover (dropdown mode, desktop)
```typescript
// El mock de Popover renderiza todo siempre, las acciones estan en el DOM
fireEvent.click(screen.getByText('Anadir gratis'))
expect(onExecute).toHaveBeenCalledWith('add', 'entity-id')
```

### Click en fila para navegar
```typescript
fireEvent.click(screen.getByText('Magic Missile'))
expect(onEntityPress).toHaveBeenCalled()
```

### Toggle seleccion (selection mode small)
```typescript
// Click en el nombre de la entidad propaga al Pressable del SelectionRow
fireEvent.click(screen.getByText('Power Attack'))
expect(onSelect).toHaveBeenCalledWith('power-attack')

// Deseleccionar: la entidad ya esta seleccionada
fireEvent.click(screen.getByText('Power Attack'))
expect(onDeselect).toHaveBeenCalledWith('power-attack@test')
```

### Verificar disabled
```typescript
// Con max=1 y 1 seleccionada, las no seleccionadas estan disabled
fireEvent.click(screen.getByText('Cleave'))
expect(onSelect).not.toHaveBeenCalled()
```

### Search
```typescript
const searchInput = screen.getByTestId('search-input')
fireEvent.change(searchInput, { target: { value: 'Shield' } })
expect(screen.getByText('Shield')).toBeInTheDocument()
expect(screen.queryByText('Fireball')).not.toBeInTheDocument()
```

### Remove chip (selection mode large)
```typescript
fireEvent.click(screen.getByTestId('chip-remove-feat-0'))
expect(onDeselect).toHaveBeenCalledWith('feat-0@test')
```

## Consideraciones

1. **Platform.OS = 'web'** en happy-dom. EntityRowWithMenu usa la rama Popover (desktop) para dropdown, y Pressable simple para counter/selection.

2. **Popover siempre renderizado** en el mock. No hay concepto de open/closed, asi que las acciones del popover estan siempre en el DOM.

3. **FlashList sin virtualizacion** en el mock. Todos los items se renderizan, util para verificar filtrado.

4. **`'use no memo'` NO se usa en tests** - es una directiva de React Compiler para componentes, no para archivos de test.

5. **CSSStyleDeclaration patch**: react-dom v19 usa `element.style[index] = value` que happy-dom no soporta. El patch en `setup.ts` define setters no-op para indices 0-99.

6. **onPress -> onClick**: El mock de Tamagui mapea `onPress` a `onClick`, por lo que `fireEvent.click()` funciona para handlers de Tamagui.
