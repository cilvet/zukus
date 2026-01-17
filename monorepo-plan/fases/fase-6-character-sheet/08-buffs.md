# 08: Buffs

**Prioridad:** Alta  
**Complejidad:** Alta  
**Dependencias:** `ChangeForm`, `ContextualChangeForm`, `SpecialChangeForm`

---

## ⚠️ DISCLAIMER IMPORTANTE PARA EL AGENTE

**ANTES de implementar CUALQUIER componente:**

1. **PREGUNTA AL USUARIO sobre el diseño visual del componente**
2. **NO asumas** que el diseño debe ser igual a zukusnextmicon
3. **La referencia de zukusnextmicon es VIEJA** - solo úsala para entender la funcionalidad, NO para el diseño
4. **Muestra propuestas** o mockups de cómo podría verse
5. **Espera confirmación** del usuario antes de escribir código

**NUNCA implementes sin preguntar primero sobre el diseño.**

---

## Contexto

Los **Buffs** son modificadores activables/desactivables que pueden contener changes, contextualChanges y specialChanges. Son fundamentales porque afectan a todas las estadísticas del personaje.

### Estructura de un Buff
```typescript
type Buff = {
  uniqueId: string;
  name: string;
  description: string;
  active: boolean;              // Si está activo o no
  originType?: string;          // 'spell', 'item', 'ability', etc.
  originName?: string;          // Nombre de la fuente
  originUniqueId?: string;      // ID de la fuente
  changes: Change[];            // Modificadores normales
  contextualChanges?: AttackContextualChange[];  // Modificadores contextuales
  specialChanges?: SpecialChange[];              // Definiciones de recursos/variables
}
```

### Ejemplo: Haste
```
Name: Haste
Description: +1 to attack rolls, AC, Reflex saves, +1 extra attack
Active: true
Origin: Spell

Changes:
  - Attack: +1 (bonus type: morale)
  - AC: +1 (dodge)
  - Reflex Save: +1 (morale)

Contextual Changes:
  - Extra Attack: +1 attack at full BAB
```

### Referencia en zukusnextmicon
- `src/components/Character/Buffs/BuffsSection.tsx`
- `src/components/Character/Buffs/BuffsList.tsx`
- `src/components/Character/Buffs/BuffForm.tsx`
- `src/components/Character/detail/BuffDetail/BuffDetail.tsx`

---

## 1. Visualización

### Componentes a crear

#### `BuffCard.tsx`
**Ubicación:** `packages/ui/src/components/character/buffs/BuffCard.tsx`

**Props:**
```typescript
type BuffCardProps = {
  buff: Buff;
  onToggle: (buffId: string) => void;
  onPress: () => void;        // Navegar a detalle
  onEdit?: () => void;        // Modo edición
  onDelete?: () => void;      // Modo edición
}
```

**UI:**
```
┌────────────────────────────────┐
│ [✓] Haste                      │
│     +1 attack, AC, Reflex      │  ← Resumen de efectos
│     Origin: Spell              │
└────────────────────────────────┘
```

**Interactividad:**
- **Checkbox:** Toggle activo/inactivo
- **Click en el card:** Navega a detalle
- **Botones edit/delete:** Solo visibles en modo edición

---

#### `BuffsList.tsx`
**Ubicación:** `packages/ui/src/components/character/buffs/BuffsList.tsx`

**Props:**
```typescript
type BuffsListProps = {
  buffs: Buff[];
  onToggleBuff: (buffId: string) => void;
  onEditBuff?: (buffId: string) => void;
  onDeleteBuff?: (buffId: string) => void;
  onNavigateToDetail: (buffId: string) => void;
  isEditMode?: boolean;
}
```

**Responsabilidad:**
- Lista scrolleable de buffs
- Separar activos de inactivos (opcional)
- Maneja las interacciones con los buffs

---

#### `BuffsSection.tsx`
**Ubicación:** `packages/ui/src/components/character/buffs/BuffsSection.tsx`

**Responsabilidad:**
- Contiene `BuffsList`
- Botón "Add Buff" (navega a formulario)
- Toggle modo edición
- Integración con `useCharacterStore`

**UI:**
```
┌─────────────────────────────────┐
│ Buffs                    [+]    │  ← Header con botón add
│ ─────────────────────────────── │
│ Active:                         │
│ [✓] Haste                       │
│ [✓] Bull's Strength             │
│                                 │
│ Inactive:                       │
│ [ ] Bless                       │
└─────────────────────────────────┘
```

---

## 2. Navegación a Detalle

### Componente de detalle

#### `BuffDetailPage.tsx`
**Ubicación:** `packages/ui/src/components/character/detail/BuffDetailPage.tsx`

**Ruta:** `/character/[id]/buff/[buffId]`

**Contenido:**
1. **Header**
   - Nombre del buff
   - Toggle activo/inactivo
   - Botón "Edit"

2. **Descripción**
   - Texto del buff

3. **Origin** (si existe)
   - "From: Haste (Spell)"

4. **Changes** (si existen)
   - Lista de cambios normales
   - Para cada change: tipo, bonus type, fórmula

5. **Contextual Changes** (si existen)
   - Lista de cambios contextuales
   - Para cada: nombre, applies to, changes

6. **Special Changes** (si existen)
   - Recursos definidos
   - Variables definidas

**Referencia:**
- `zukusnextmicon/src/components/Character/detail/BuffDetail/BuffDetail.tsx`

---

## 3. Edición

### Formulario de Buff

#### `BuffForm.tsx`
**Ubicación:** `packages/ui/src/components/character/buffs/BuffForm.tsx`

**Ruta:** `/character/[id]/buff/new` o `/character/[id]/buff/[buffId]/edit`

**Props:**
```typescript
type BuffFormProps = {
  buff?: Buff;              // Undefined si es nuevo
  onSave: (buff: Buff) => void;
  onCancel: () => void;
}
```

**Secciones del formulario:**

### 3.1 Información Básica
```
Name: _______________
Description: _________
             _________
Active: [x]

Origin Type: [Spell ▼]
Origin Name: Haste
```

### 3.2 Changes (Modificadores Normales)
```
Changes:
┌──────────────────────────────┐
│ + Add Change                 │
└──────────────────────────────┘

[Usa ChangeForm para cada change]
```

### 3.3 Contextual Changes (Modificadores Contextuales)
```
Contextual Changes:
┌──────────────────────────────┐
│ + Add Contextual Change      │
└──────────────────────────────┘

[Usa ContextualChangeForm para cada]
```

### 3.4 Special Changes (Recursos/Variables)
```
Special Changes:
┌──────────────────────────────┐
│ + Add Special Change         │
└──────────────────────────────┘

[Usa SpecialChangeForm para cada]
```

### 3.5 Generación con IA (Opcional)

**Feature avanzada:** Generar changes automáticamente desde la descripción.

```
Description: "Haste: +1 to attack rolls, AC, and Reflex saves"

[Generate Changes with AI]

→ Crea automáticamente los changes correspondientes
```

**Referencia:**
- `zukusnextmicon/src/components/Character/Buffs/BuffForm.tsx`
- La generación con IA usa un endpoint `/api/generateChanges`

**Estado:** Implementar en fase posterior (opcional).

---

## 4. Gestión de Estado

### Hook de buffs

#### `useBuffsManagement.ts`
**Ubicación:** `packages/ui/src/hooks/character/useBuffsManagement.ts`

**Responsabilidad:**
- CRUD de buffs en el store
- Validación de buffs
- Recálculo del personaje al modificar

```typescript
export function useBuffsManagement() {
  const { character, updateCharacter } = useCharacterStore()
  
  const addBuff = (buff: Buff) => {
    // Genera uniqueId
    // Añade al array de buffs
    // Recalcula character sheet
  }
  
  const updateBuff = (buffId: string, updates: Partial<Buff>) => {
    // Actualiza el buff
    // Recalcula character sheet
  }
  
  const toggleBuff = (buffId: string) => {
    // Cambia active: true/false
    // Recalcula character sheet
  }
  
  const deleteBuff = (buffId: string) => {
    // Elimina el buff
    // Recalcula character sheet
  }
  
  return { addBuff, updateBuff, toggleBuff, deleteBuff }
}
```

**Referencia:**
- `zukusnextmicon/src/components/Character/useCharacter/useBuffs.ts`

---

## 5. Integración en CharacterSheet

### Ubicación en el layout

**Desktop:**
- Columna 3 (junto con Custom Entities)
- Posición superior

**Mobile:**
- Tab "Buffs" (sección 3)
- Toda la sección

---

## 6. Dependencias

### Componentes compartidos necesarios
- [x] `ChangeForm` - Para editar changes normales
- [x] `ContextualChangeForm` - Para editar contextual changes
- [x] `SpecialChangeForm` - Para editar special changes

### Datos del core
```typescript
import type { Buff, Change, AttackContextualChange, SpecialChange } from '@zukus/core'
```

Verificar que estos tipos están exportados desde el core.

---

## 7. Flujo Completo

### Crear un buff nuevo

1. User clicks "Add Buff" en `BuffsSection`
2. Navega a `/character/[id]/buff/new`
3. `BuffForm` se muestra vacío
4. User completa:
   - Name, description
   - Añade changes con `ChangeForm`
   - Añade contextual changes (opcional)
   - Añade special changes (opcional)
5. Click "Save"
6. `useBuffsManagement().addBuff()` guarda en el store
7. Character sheet se recalcula automáticamente
8. Navega de vuelta a `BuffsSection`
9. El nuevo buff aparece en la lista

### Editar un buff existente

1. User clicks en un buff en modo edición
2. Navega a `/character/[id]/buff/[buffId]/edit`
3. `BuffForm` se muestra pre-llenado
4. User modifica lo que quiera
5. Click "Save"
6. `useBuffsManagement().updateBuff()` actualiza en el store
7. Character sheet se recalcula
8. Navega de vuelta

### Toggle un buff

1. User hace click en el checkbox del `BuffCard`
2. `useBuffsManagement().toggleBuff()` cambia `active`
3. Character sheet se recalcula (los values cambian)
4. UI se actualiza con los nuevos valores

---

## 8. Consideraciones Técnicas

### Recálculo del Character Sheet

Cada vez que se modifica un buff, el character sheet debe recalcularse:

```typescript
const toggleBuff = (buffId: string) => {
  const updatedBaseData = {
    ...character.baseData,
    buffs: character.baseData.buffs.map(b =>
      b.uniqueId === buffId ? { ...b, active: !b.active } : b
    ),
  }
  
  // Recalcular con buildCharacter
  const newSheet = buildCharacter(updatedBaseData).buildCharacterSheet()
  
  updateCharacter(updatedBaseData, newSheet)
}
```

### Validación de Changes

Antes de guardar un buff, validar:
- Nombre no vacío
- Los changes tienen todos los campos requeridos
- Los bonus types son válidos
- Las fórmulas son válidas

### UX durante recálculo

Si el recálculo es costoso (muchos buffs, personaje complejo):
- Mostrar loading indicator
- Hacer el cálculo en un worker (futuro)
- Debounce los toggles rápidos

---

## 9. Verificación

Antes de considerar esta sección completa:

### Visualización
- [ ] La lista de buffs se muestra correctamente
- [ ] Se separan activos de inactivos (o se marcan visualmente)
- [ ] El checkbox refleja el estado active
- [ ] El resumen de efectos es legible

### Navegación
- [ ] Click en buff navega a detalle
- [ ] El detalle muestra toda la información del buff
- [ ] El botón "Edit" navega al formulario
- [ ] El botón back funciona en todas las páginas

### Toggle
- [ ] Click en checkbox cambia el estado active
- [ ] El character sheet se recalcula correctamente
- [ ] Los valores en otras secciones se actualizan
- [ ] No hay lag perceptible

### Formulario - Crear
- [ ] Botón "Add Buff" navega al formulario
- [ ] Se puede completar toda la información
- [ ] ChangeForm funciona para añadir changes
- [ ] ContextualChangeForm funciona (si aplica)
- [ ] SpecialChangeForm funciona (si aplica)
- [ ] "Save" guarda el buff y navega atrás
- [ ] "Cancel" descarta cambios y navega atrás

### Formulario - Editar
- [ ] El formulario se pre-llena con los datos del buff
- [ ] Se pueden modificar los campos
- [ ] "Save" actualiza el buff
- [ ] Los changes existentes se pueden editar/eliminar
- [ ] Se pueden añadir nuevos changes

### Eliminar
- [ ] En modo edición, aparece botón de eliminar
- [ ] Confirma antes de eliminar (modal de confirmación)
- [ ] Al eliminar, el buff desaparece de la lista
- [ ] El character sheet se recalcula

### Integración
- [ ] Los buffs activos afectan todas las secciones relevantes
- [ ] Los sourceValues muestran correctamente los buffs
- [ ] No hay errores en consola

---

## 10. Archivos Creados

Checklist de archivos:

```
packages/ui/src/components/character/
├── buffs/
│   ├── BuffCard.tsx                     [ ]
│   ├── BuffsList.tsx                    [ ]
│   ├── BuffsSection.tsx                 [ ]
│   ├── BuffForm.tsx                     [ ]
│   └── index.ts                         [ ]
├── detail/
│   ├── BuffDetailPage.tsx               [ ]
│   └── index.ts (actualizar)            [ ]
└── hooks/
    └── useBuffsManagement.ts            [ ]

apps/zukus/app/character/[id]/
├── buff/
│   ├── new.tsx                          [ ]
│   ├── [buffId].tsx                     [ ] (detalle)
│   └── [buffId]/
│       └── edit.tsx                     [ ]
```

---

## Siguiente Paso

Los buffs son fundamentales. Una vez completados, muchas otras secciones se benefician:
- Hit Points usa buffs para temporary HP
- Attacks usa buffs con contextual changes
- Resources se definen vía special changes en buffs

Continuar con las secciones que dependen menos de buffs, como [07-skills.md](./07-skills.md) o [09-equipment.md](./09-equipment.md).
