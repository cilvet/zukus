# Fase A: Estructura ViewPager + Columna 1 Basica

## Objetivo

Crear la estructura base de `EditCharacterScreen` con ViewPager (mobile) y columnas (desktop), incluyendo los campos basicos de la Columna 1.

## Entregables

1. Pantalla con ViewPager/columnas funcionando
2. Columna 1 con: Nombre, Descripcion, Alineamiento, Abilities
3. Columna 2 vacia (placeholder)

## Pasos de Implementacion

### Paso 1: Crear estructura de pantallas

**Archivos a crear:**

```
screens/edit/
  EditCharacterScreen.native.tsx   # ViewPager mobile
  EditCharacterScreen.web.tsx      # Re-exporta native (igual que CharacterScreen)
  EditCharacterScreenDesktop.tsx   # Columnas desktop
  index.ts                         # Exportaciones
```

**Logica de deteccion de plataforma:**
- Reutilizar el patron de `CharacterScreen`
- Breakpoint desktop: 768px
- Mobile usa `CharacterPager` (o crear `EditorPager` similar)
- Desktop usa `ColumnsContainer` + `VerticalSection`

### Paso 2: Crear EditorPager

**Archivo:** `components/character/editor/EditorPager.tsx`

Similar a `CharacterPager` pero para el editor:
- 2 paginas (Columna 1: Info, Columna 2: Niveles)
- Props: `onPageChange`, `onPageSettled`
- Ref imperativo: `setPage(index)`

Alternativamente, reutilizar `CharacterPager` directamente si es suficientemente generico.

### Paso 3: Anadir campos al CharacterBaseData

**Archivo:** `packages/core/core/domain/character/baseData/character.ts`

Anadir nuevos campos:

```typescript
type CharacterBaseData = {
  // ... existentes ...

  // Nuevos campos de ficha
  description?: string;
  alignment?: Alignment | null;  // null = sin alineamiento

  // Campos fisicos
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  eyes?: string;
  hair?: string;
  skin?: string;

  // Trasfondo
  deity?: string;
  background?: string;  // Historia, multilinea
};

type Alignment = {
  lawChaos: 'lawful' | 'neutral' | 'chaotic';
  goodEvil: 'good' | 'neutral' | 'evil';
};
```

### Paso 4: Crear operaciones de actualizacion

**Archivo:** `packages/core/core/domain/character/updater/operations/characterPropertyOperations.ts`

Anadir funciones siguiendo el patron existente:

```typescript
export function setDescription(character: CharacterBaseData, description: string): OperationResult
export function setAlignment(character: CharacterBaseData, alignment: Alignment | null): OperationResult
export function setAge(character: CharacterBaseData, age: string): OperationResult
// ... resto de campos
```

### Paso 5: Anadir metodos al CharacterUpdater

**Archivo:** `packages/core/core/domain/character/update/characterUpdater/characterUpdater.ts`

```typescript
updateDescription(description: string): UpdateResult
updateAlignment(alignment: Alignment | null): UpdateResult
updateAge(age: string): UpdateResult
// ... resto
```

### Paso 6: Anadir acciones al characterStore

**Archivo:** `apps/zukus/ui/stores/characterStore.ts`

```typescript
updateDescription: (description: string) => UpdateResult,
updateAlignment: (alignment: Alignment | null) => UpdateResult,
// ... resto
```

### Paso 7: Crear CharacterInfoSection

**Archivo:** `components/character/editor/CharacterInfoSection.tsx`

Componente para la Columna 1 con:
- Input para Nombre (reutilizar estilo existente)
- TextArea para Descripcion
- AlignmentGrid (ver paso 8)

### Paso 8: Crear AlignmentGrid

**Archivo:** `components/character/editor/AlignmentGrid.tsx`

Grid 3x3 interactivo:

```
[CB] [NB] [LB]    Caotico Bueno  | Neutral Bueno  | Legal Bueno
[CN] [NN] [LN]    Caotico Neutral| Neutral        | Legal Neutral
[CM] [NM] [LM]    Caotico Malvado| Neutral Malvado| Legal Malvado

[ Sin Alineamiento ]   <- Boton adicional debajo
```

**Comportamiento:**
- Tap en celda = seleccionar ese alineamiento
- Celda seleccionada resaltada (borde, color)
- Boton "Sin Alineamiento" deselecciona todo
- Props: `value: Alignment | null`, `onChange: (alignment: Alignment | null) => void`

### Paso 9: Integrar AbilityScoresEditor

Reutilizar el componente existente `AbilityScoresEditor` en la Columna 1.

### Paso 10: Crear placeholder Columna 2

Componente simple que muestra "Niveles (proximamente)" o similar, para validar que el ViewPager funciona.

## Verificacion

- [ ] Mobile: Se puede hacer swipe entre Columna 1 y Columna 2
- [ ] Desktop: Ambas columnas visibles lado a lado
- [ ] Nombre se guarda correctamente
- [ ] Descripcion se guarda correctamente
- [ ] Alineamiento se guarda correctamente (incluyendo null)
- [ ] Abilities funcionan igual que antes
- [ ] No hay regresiones en otras pantallas

## Archivos Afectados

### Nuevos
- `screens/edit/EditCharacterScreen.native.tsx`
- `screens/edit/EditCharacterScreen.web.tsx`
- `screens/edit/EditCharacterScreenDesktop.tsx`
- `components/character/editor/CharacterInfoSection.tsx`
- `components/character/editor/AlignmentGrid.tsx`

### Modificados
- `packages/core/core/domain/character/baseData/character.ts`
- `packages/core/core/domain/character/updater/operations/characterPropertyOperations.ts`
- `packages/core/core/domain/character/update/characterUpdater/characterUpdater.ts`
- `apps/zukus/ui/stores/characterStore.ts`
- Rutas de navegacion (si es necesario)

## Dependencias

- Ninguna fase previa (esta es la primera)

## Estimacion de Complejidad

- Core: Baja (anadir campos y operaciones simples)
- UI: Media (ViewPager + grid de alineamiento)
