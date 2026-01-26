# Plan: Sistema de Navegacion Unificado

## Prompt para Claude

```
Implementa el sistema de navegacion unificado descrito en este documento.

IMPORTANTE:
1. Lee primero los "Archivos de Referencia" para entender el sistema actual
2. Sigue el "Orden de Ejecucion" - no saltes fases
3. Verifica que la app funciona despues de cada fase
4. No modifiques archivos que no esten listados sin preguntar

El objetivo es:
- Eliminar rutas duplicadas (una URL = un destino)
- Crear un sistema de paneles generico basado en paths (no tipos)
- Que cada pantalla defina sus propias rutas de panel
- Sincronizar estado de paneles con URL params en web
```

---

## Archivos de Referencia (leer antes de implementar)

### Sistema de paneles actual
- `ui/stores/panelStore.ts` - Store de paneles para CharacterScreen
- `ui/stores/editPanelStore.ts` - Store duplicado para EditCharacterScreen
- `hooks/usePanelNavigation.web.ts` - Hook con sync URL para CharacterScreen
- `hooks/useEditPanelNavigation.web.ts` - Hook duplicado para EditCharacterScreen

### Screens actuales
- `screens/character/CharacterScreenDesktop.tsx` - Ver como usa usePanelNavigation y renderiza paneles (switch por tipo)
- `screens/character/CharacterScreen.native.tsx` - Layout mobile con ViewPager
- `screens/character/EditCharacterScreenDesktop.tsx` - Ver como usa useEditPanelNavigation

### Deteccion de plataforma
- `navigation/useIsDesktop.ts` - Hook que detecta si es desktop (width >= 768)

### Sistema de rutas actual
- `app/characters/` - Rutas que vamos a mantener
- `app/(tabs)/(character)/` - Rutas duplicadas que vamos a eliminar

---

## Problema Actual

### Rutas duplicadas
```
/characters/123          → app/characters/[id].tsx
/(tabs)/(character)/123  → app/(tabs)/(character)/[id].tsx
```
Dos URLs diferentes para la misma pantalla. Confuso y propenso a errores.

### Sistema de paneles acoplado a tipos
```typescript
// Actual - acoplado a tipos especificos
type PanelEntry = { type: 'ability' | 'skill' | 'buff' | ..., id: string }
openPanel('ability', 'strength', 'Fuerza')

// Switch gigante en el render
{currentPanel?.type === 'ability' && <AbilityDetailPanel />}
{currentPanel?.type === 'skill' && <SkillDetailPanel />}
// ... muchos mas
```

### Stores y hooks duplicados
- `panelStore` + `usePanelNavigation` para CharacterScreen
- `editPanelStore` + `useEditPanelNavigation` para EditCharacterScreen
- Codigo casi identico duplicado

---

## Solucion: Sistema Basado en Paths

### Concepto
El sistema de paneles es **agnostico**. Solo maneja un stack de paths. Cada pantalla define que paths soporta y que componente renderizar.

### Estructura de un panel
```typescript
type PanelEntry = {
  path: string      // 'ability/strength' o 'level/3'
  title?: string    // Opcional, para el header del panel
}
```

### Convencion de paths
```
{screen}/{id}
```
Ejemplos:
- `ability/strength` → Panel de habilidad Strength
- `skill/perception` → Panel de skill Perception
- `level/3` → Panel del nivel 4 (index 3)
- `class-selector/3` → Selector de clase para nivel 4

### URL sync
```
/characters/123                        → Sin panel
/characters/123?panel=ability/strength → Panel abierto
```

### Render en cada pantalla
```typescript
// CharacterScreenDesktop define sus rutas
const PANEL_ROUTES: Record<string, ComponentType<{ id: string }>> = {
  'ability': AbilityDetailPanel,
  'skill': SkillDetailPanel,
  'buff': BuffDetailPanel,
  'attack': AttackDetailPanel,
}

// Render generico
function renderPanel(path: string) {
  const [screen, id] = path.split('/')
  const Component = PANEL_ROUTES[screen]
  if (!Component) return null
  return <Component id={id} />
}
```

---

## Fase 1: Crear Sistema de Paneles Unificado

### 1.1 Crear `ui/stores/panelStore.ts` (reemplazar el actual)

```typescript
import { create } from 'zustand'

type PanelEntry = {
  path: string
  title?: string
}

type PanelScope = string // 'character' | 'edit' | cualquier otro

type PanelState = {
  stacks: Record<PanelScope, PanelEntry[]>
  push: (scope: PanelScope, entry: PanelEntry) => void
  pop: (scope: PanelScope) => void
  clear: (scope: PanelScope) => void
  replace: (scope: PanelScope, entries: PanelEntry[]) => void
}

export const usePanelStore = create<PanelState>((set) => ({
  stacks: {},

  push: (scope, entry) => set((state) => ({
    stacks: {
      ...state.stacks,
      [scope]: [...(state.stacks[scope] || []), entry],
    },
  })),

  pop: (scope) => set((state) => ({
    stacks: {
      ...state.stacks,
      [scope]: (state.stacks[scope] || []).slice(0, -1),
    },
  })),

  clear: (scope) => set((state) => ({
    stacks: {
      ...state.stacks,
      [scope]: [],
    },
  })),

  replace: (scope, entries) => set((state) => ({
    stacks: {
      ...state.stacks,
      [scope]: entries,
    },
  })),
}))
```

### 1.2 Crear `hooks/usePanelNavigation.ts` (unico archivo, no .web/.native)

```typescript
import { useCallback, useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import { usePathname, useRouter } from 'expo-router'
import { usePanelStore } from '../ui/stores'

type PanelEntry = {
  path: string
  title?: string
}

export function usePanelNavigation(scope: string) {
  const router = useRouter()
  const pathname = usePathname()
  const store = usePanelStore()
  const stack = store.stacks[scope] || []
  const currentPanel = stack[stack.length - 1] || null
  const isPanelOpen = stack.length > 0
  const canGoBack = stack.length > 1
  const initialized = useRef(false)

  // Web: restaurar desde URL al montar
  useEffect(() => {
    if (Platform.OS !== 'web' || initialized.current) return
    initialized.current = true

    const params = new URLSearchParams(window.location.search)
    const panelPath = params.get('panel')
    const panelTitle = params.get('panelTitle')

    if (panelPath && stack.length === 0) {
      store.replace(scope, [{ path: panelPath, title: panelTitle || undefined }])
    }
  }, [scope])

  // Web: sincronizar URL cuando cambia el panel
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const params = new URLSearchParams()
    if (currentPanel) {
      params.set('panel', currentPanel.path)
      if (currentPanel.title) {
        params.set('panelTitle', currentPanel.title)
      }
    }

    const search = params.toString()
    const newUrl = search ? `${pathname}?${search}` : pathname
    window.history.replaceState(null, '', newUrl)
  }, [currentPanel, pathname])

  const openPanel = useCallback((path: string, title?: string) => {
    store.push(scope, { path, title })
  }, [scope, store])

  const closePanel = useCallback(() => {
    store.clear(scope)
  }, [scope, store])

  const goBack = useCallback(() => {
    if (stack.length > 1) {
      store.pop(scope)
    } else {
      store.clear(scope)
    }
  }, [scope, store, stack.length])

  return {
    currentPanel,
    isPanelOpen,
    canGoBack,
    openPanel,
    closePanel,
    goBack,
  }
}
```

### 1.3 Eliminar archivos obsoletos

Eliminar:
- `ui/stores/editPanelStore.ts`
- `hooks/usePanelNavigation.web.ts`
- `hooks/usePanelNavigation.native.ts`
- `hooks/useEditPanelNavigation.ts`
- `hooks/useEditPanelNavigation.web.ts`
- `hooks/useEditPanelNavigation.native.ts`

---

## Fase 2: Unificar Screens

### 2.1 Renombrar archivos

```bash
mv screens/character/CharacterScreen.native.tsx screens/character/CharacterScreenMobile.tsx
mv screens/character/EditCharacterScreen.native.tsx screens/character/EditCharacterScreenMobile.tsx
```

### 2.2 Crear `screens/character/CharacterScreen.tsx` (nuevo)

```typescript
import { useIsDesktop } from '../../navigation'
import { CharacterScreenDesktop } from './CharacterScreenDesktop'
import { CharacterScreenMobile } from './CharacterScreenMobile'

export function CharacterScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <CharacterScreenDesktop /> : <CharacterScreenMobile />
}
```

### 2.3 Crear `screens/character/EditCharacterScreen.tsx` (nuevo)

```typescript
import { useIsDesktop } from '../../navigation'
import { EditCharacterScreenDesktop } from './EditCharacterScreenDesktop'
import { EditCharacterScreenMobile } from './EditCharacterScreenMobile'

export function EditCharacterScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <EditCharacterScreenDesktop /> : <EditCharacterScreenMobile />
}
```

### 2.4 Eliminar archivos .web.tsx

Eliminar:
- `screens/character/CharacterScreen.web.tsx`
- `screens/character/EditCharacterScreen.web.tsx`
- `screens/character/index.web.ts`
- `screens/character/index.native.ts`

### 2.5 Actualizar `screens/character/index.ts`

```typescript
export { CharacterScreen } from './CharacterScreen'
export { CharacterScreenDesktop } from './CharacterScreenDesktop'
export { CharacterScreenMobile } from './CharacterScreenMobile'
export { CharacterListScreen } from './CharacterListScreen'
export { EditCharacterScreen } from './EditCharacterScreen'
export { EditCharacterScreenDesktop } from './EditCharacterScreenDesktop'
export { EditCharacterScreenMobile } from './EditCharacterScreenMobile'
```

---

## Fase 3: Migrar CharacterScreenDesktop al nuevo sistema

### 3.1 Definir rutas de panel

Añadir al inicio del archivo:

```typescript
import { usePanelNavigation } from '../../hooks'

// Rutas de panel soportadas por esta pantalla
const PANEL_ROUTES: Record<string, ComponentType<{ id: string }>> = {
  'ability': AbilityDetailPanel,
  'skill': SkillDetailPanel,
  'buff': BuffDetailPanel,
  'attack': AttackDetailPanel,
  'saving-throw': SavingThrowDetailPanel,
  'hit-points': HitPointsDetailPanel,
  // ... otros paneles que soporte CharacterScreen
}

function renderPanelContent(path: string | undefined) {
  if (!path) return null
  const [screen, id] = path.split('/')
  const Component = PANEL_ROUTES[screen]
  if (!Component) return null
  return <Component id={id} />
}
```

### 3.2 Cambiar el hook

```typescript
// Antes
const { currentPanel, isPanelOpen, ... } = usePanelNavigation()

// Despues
const { currentPanel, isPanelOpen, openPanel, closePanel, goBack, canGoBack } = usePanelNavigation('character')
```

### 3.3 Cambiar llamadas a openPanel

```typescript
// Antes
openPanel('strength', 'ability', 'Fuerza')

// Despues
openPanel('ability/strength', 'Fuerza')
```

### 3.4 Cambiar el render del panel

```typescript
// Antes (switch gigante)
<SidePanel isOpen={isPanelOpen} onClose={closePanel} title={currentPanel?.name}>
  {currentPanel?.type === 'ability' && <AbilityDetailPanel abilityKey={currentPanel.id} />}
  {currentPanel?.type === 'skill' && <SkillDetailPanel skillId={currentPanel.id} />}
  {/* ... muchos mas */}
</SidePanel>

// Despues (generico)
<SidePanel isOpen={isPanelOpen} onClose={closePanel} onBack={goBack} canGoBack={canGoBack} title={currentPanel?.title}>
  {renderPanelContent(currentPanel?.path)}
</SidePanel>
```

---

## Fase 4: Migrar EditCharacterScreenDesktop al nuevo sistema

Mismo proceso que Fase 3, pero con scope 'edit' y sus propias rutas:

```typescript
const PANEL_ROUTES: Record<string, ComponentType<{ id: string }>> = {
  'level': LevelDetailPanel,
  'class-selector': ClassSelectorDetailPanel,
  'entity-selector': EntitySelectorDetailPanel,
}

// Hook con scope 'edit'
const { currentPanel, ... } = usePanelNavigation('edit')
```

---

## Fase 5: Eliminar Rutas Duplicadas

### 5.1 Eliminar todo el directorio `app/(tabs)/(character)/`

```bash
rm -rf app/(tabs)/(character)/
```

Archivos eliminados:
- `app/(tabs)/(character)/_layout.tsx`
- `app/(tabs)/(character)/index.tsx`
- `app/(tabs)/(character)/index.web.tsx`
- `app/(tabs)/(character)/[id].tsx`
- `app/(tabs)/(character)/[id].web.tsx`
- `app/(tabs)/(character)/edit/[id].tsx`
- `app/(tabs)/(character)/detail/[...slug].tsx`
- `app/(tabs)/(character)/formula-playground.tsx`
- `app/(tabs)/(character)/ability/[id].tsx`
- `app/(tabs)/(character)/server-list.tsx`

### 5.2 Eliminar archivo .web.tsx de edit

```bash
rm app/characters/edit/[id].web.tsx
```

### 5.3 Verificar rutas restantes

Solo deben quedar:
```
app/characters/
  _layout.tsx
  index.tsx
  [id].tsx
  edit/[id].tsx
  detail/[...slug].tsx
  formula-playground.tsx
```

---

## Fase 6: Limpieza Final

### 6.1 Actualizar `hooks/index.ts`

Quitar exports de hooks eliminados, asegurar que exporta:
```typescript
export { usePanelNavigation } from './usePanelNavigation'
```

### 6.2 Actualizar `ui/stores/index.ts`

Quitar export de `editPanelStore`, asegurar que exporta:
```typescript
export { usePanelStore } from './panelStore'
```

### 6.3 Eliminar `navigation/detailRegistry.tsx` si ya no se usa

Revisar si algo lo importa. Si no, eliminar.

---

## Orden de Ejecucion

1. **Fase 1**: Crear sistema de paneles unificado
   - Verificar: imports funcionan, no hay errores de TS

2. **Fase 2**: Unificar screens
   - Verificar: `bun run dev` arranca sin errores

3. **Fase 3**: Migrar CharacterScreenDesktop
   - Verificar: paneles se abren/cierran en desktop, URL sync funciona

4. **Fase 4**: Migrar EditCharacterScreenDesktop
   - Verificar: paneles de edicion funcionan

5. **Fase 5**: Eliminar rutas duplicadas
   - Verificar: navegacion a `/characters/[id]` funciona en todas las plataformas

6. **Fase 6**: Limpieza
   - Verificar: no hay imports rotos, TS compila

---

## Checklist de Verificacion Final

- [ ] Una sola ruta por pantalla (no duplicados)
- [ ] `/characters/[id]` funciona en desktop (columnas + panel)
- [ ] `/characters/[id]` funciona en mobile web (ViewPager)
- [ ] `/characters/[id]` funciona en native (ViewPager)
- [ ] `/characters/edit/[id]` funciona en todas las plataformas
- [ ] Paneles se abren con `openPanel('ability/strength', 'Fuerza')`
- [ ] URL muestra `?panel=ability/strength` cuando hay panel abierto
- [ ] Deep link `?panel=ability/strength` restaura el panel
- [ ] Back navigation funciona (goBack cierra o va al panel anterior)
- [ ] No hay archivos .web.tsx ni .native.tsx en screens/character/
