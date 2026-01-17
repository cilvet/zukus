# 06: Attacks

**Prioridad:** Alta  
**Complejidad:** Media  
**Dependencias:** `SourceValuesView`, Buffs (contextual changes)

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

Los **Ataques** del personaje calculados automáticamente desde las armas equipadas y los modificadores aplicados. Incluyen **Contextual Changes** que permiten modificar el ataque dinámicamente (ej: Power Attack).

### Estructura de un Attack
```typescript
type Attack = {
  uniqueId: string;
  name: string;
  attackBonus: {
    totalValue: number;
    sourceValues: SourceValue[];
  };
  damage: {
    formula: string;          // "1d8+4"
    sourceValues: SourceValue[];
  };
  criticalRange?: string;     // "19-20/x2"
  range?: string;             // "100 ft" para ranged
  type: 'melee' | 'ranged';
}
```

### Ejemplo: Longbow +1
```
Name: Longbow +1
Type: ranged
Attack Bonus: +12
  - BAB: +6
  - Dexterity: +4
  - Enhancement: +1
  - Weapon Focus: +1
  
Damage: 1d8+5
  - Base: 1d8
  - Enhancement: +1
  - Deadly Aim: +4 (contextual)
  
Critical: 20/x3
Range: 100 ft
```

### Referencia en zukusnextmicon
- `src/components/Character/combat/attacks/Attacks.tsx`
- `src/components/Character/combat/attacks/AttackCard.tsx`
- `src/components/Character/AttackContext/AttackContextContent.tsx`
- `src/components/Character/detail/AttackDetail/AttackDetailPage.tsx`

---

## 1. Visualización

### Componentes a crear

#### `AttackCard.tsx`
**Ubicación:** `packages/ui/src/components/character/attacks/AttackCard.tsx`

**Props:**
```typescript
type AttackCardProps = {
  attack: Attack;
  onPress: () => void;
}
```

**UI:**
```
┌────────────────────────────────┐
│ Longbow +1            🏹       │
│ +12 / 1d8+5                    │
│ Critical: 20/x3                │
└────────────────────────────────┘
```

**Interactividad:**
- Click navega al detalle con contextual changes

---

#### `AttacksList.tsx`
**Ubicación:** `packages/ui/src/components/character/attacks/AttacksList.tsx`

**Props:**
```typescript
type AttacksListProps = {
  attacks: Attack[];
  onNavigateToDetail: (attackId: string) => void;
}
```

**Responsabilidad:**
- Lista scrolleable de ataques
- Puede separar melee de ranged (opcional)

---

#### `AttacksSection.tsx`
**Ubicación:** `packages/ui/src/components/character/attacks/AttacksSection.tsx`

**Responsabilidad:**
- Contiene `AttacksList`
- Obtiene datos del characterSheet
- No tiene botón "Add Attack" (los ataques vienen de armas equipadas)

**UI:**
```
┌─────────────────────────────────┐
│ Attacks                         │
│ ─────────────────────────────── │
│ Melee:                          │
│ Longsword +1        +10/1d8+5   │
│                                 │
│ Ranged:                         │
│ Longbow +1          +12/1d8+5   │
└─────────────────────────────────┘
```

---

## 2. Navegación a Detalle con Contextual Changes

### Componente de detalle

#### `AttackDetailPage.tsx`
**Ubicación:** `packages/ui/src/components/character/detail/AttackDetailPage.tsx`

**Ruta:** `/character/[id]/attack/[attackId]`

**Contenido:**

### 2.1 Header
- Nombre del ataque
- Icono según el tipo (melee/ranged)

### 2.2 Attack Bonus (Expandible)
```
Attack Bonus: +12     [▼]

━━━━━━━━━━━━━━━━━━━━━━━━
BAB:                  +6
Dexterity:            +4
Enhancement:          +1
Weapon Focus:         +1
━━━━━━━━━━━━━━━━━━━━━━━━
```

Usa `SourceValuesView` para mostrar el desglose.

### 2.3 Damage (Expandible)
```
Damage: 1d8+5         [▼]

━━━━━━━━━━━━━━━━━━━━━━━━
Base Weapon:       1d8
Enhancement:        +1
Deadly Aim:         +4
━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2.4 Contextual Changes (Seleccionables)

**Clave de esta sección:** Los contextual changes modifican dinámicamente el ataque.

```
Modifiers:

[ ] Power Attack           [i]
    -1 attack / +2 damage

[x] Deadly Aim             [i]
    -2 attack / +4 damage

[ ] Rapid Shot             [i]
    +1 extra attack / -2 all attacks
```

**Interactividad:**
- **Checkbox:** Activa/desactiva el contextual change
- **[i]:** Muestra descripción detallada
- **Recálculo en tiempo real:** Al cambiar las selecciones, los valores de attack y damage se actualizan

### 2.5 Contextual Changes con Variables

Algunos contextual changes tienen variables editables:

```
[x] Power Attack           [i]

    Power: [2 ▼]           ← Selector numérico
    
    Effect:
    -2 attack / +4 damage
```

El usuario puede ajustar el "power level" y el efecto se recalcula.

### 2.6 Botón de Tirada (Futuro)

```
┌──────────────────┐
│  Roll Attack     │
└──────────────────┘
```

Implementar en fase posterior cuando se agregue el sistema de dados.

---

## 3. Gestión de Contextual Changes

### Hook de attack context

#### `useAttackContext.ts`
**Ubicación:** `packages/ui/src/hooks/character/useAttackContext.ts`

**Responsabilidad:**
- Mantener estado de contextual changes seleccionados
- Recalcular attack y damage según las selecciones
- Manejar variables de contextual changes

```typescript
export function useAttackContext(attack: Attack) {
  const [selectedContextualChanges, setSelectedContextualChanges] = useState<string[]>([])
  const [contextualVariables, setContextualVariables] = useState<Record<string, number>>({})
  
  // Obtener contextual changes disponibles para este ataque
  const availableContextualChanges = getContextualChangesForAttack(attack)
  
  // Recalcular attack con las selecciones actuales
  const recalculatedAttack = useMemo(() => {
    return applyContextualChanges(attack, selectedContextualChanges, contextualVariables)
  }, [attack, selectedContextualChanges, contextualVariables])
  
  const toggleContextualChange = (changeId: string) => {
    // Toggle on/off
  }
  
  const setVariable = (changeId: string, variableName: string, value: number) => {
    // Actualizar variable
  }
  
  return {
    attack: recalculatedAttack,
    availableContextualChanges,
    selectedContextualChanges,
    toggleContextualChange,
    setVariable,
  }
}
```

**Referencia:**
- `zukusnextmicon/src/components/AttackContext/useAttackContext.ts`

---

## 4. Componentes de UI para Contextual Changes

#### `ContextualChangeToggle.tsx`
**Ubicación:** `packages/ui/src/components/character/attacks/ContextualChangeToggle.tsx`

**Props:**
```typescript
type ContextualChangeToggleProps = {
  contextualChange: AttackContextualChange;
  isSelected: boolean;
  onToggle: () => void;
  variables?: Record<string, number>;
  onVariableChange?: (varName: string, value: number) => void;
}
```

**UI:**
Muestra:
- Checkbox para activar/desactivar
- Nombre y descripción
- Variables editables (si las tiene)
- Efecto actual calculado

---

## 5. Integración en CharacterSheet

### Ubicación en el layout

**Desktop:**
- Columna 1 (junto con Saving Throws, AC, Resources)
- Sección "Combat"

**Mobile:**
- Tab "Main" (sección 1)
- Sección "Combat"

---

## 6. Dependencias

### Componentes compartidos
- [x] `SourceValuesView` - Para desglose de attack bonus y damage

### Otros sistemas
- **Buffs:** Los contextual changes vienen mayormente de buffs
- **Equipment:** Los ataques se generan desde armas equipadas

### Datos del core
```typescript
import type { Attack, AttackContextualChange } from '@zukus/core'
```

Verificar que:
- `characterSheet.attackData` contiene los ataques
- Los tipos de Attack y AttackContextualChange están exportados

---

## 7. Flujo Completo

### Ver un ataque con contextual changes

1. User ve la lista de ataques en `AttacksSection`
2. Click en un ataque (ej: "Longbow +1")
3. Navega a `/character/[id]/attack/[attackId]`
4. `AttackDetailPage` muestra:
   - Attack bonus base: +12
   - Damage base: 1d8+5
   - Lista de contextual changes disponibles
5. User activa "Deadly Aim"
6. `useAttackContext` recalcula:
   - Attack bonus: +10 (era +12, ahora -2)
   - Damage: 1d8+9 (era +5, ahora +9)
7. UI se actualiza mostrando los nuevos valores
8. User puede desactivar y los valores vuelven al estado anterior

### Ajustar variable de contextual change

1. User tiene "Power Attack" activado
2. Ve un selector: "Power: [2 ▼]"
3. Cambia a 4
4. El efecto pasa de "-2 attack / +4 damage" a "-4 attack / +8 damage"
5. Los valores totales se actualizan

---

## 8. Consideraciones Técnicas

### Obtención de ataques

Los ataques vienen del characterSheet:

```typescript
const attacks = useCharacterStore(state => state.characterSheet?.attackData ?? [])
```

Estos son calculados por el core basándose en:
- Armas equipadas
- BAB del personaje
- Modificadores de abilities (STR para melee, DEX para ranged)
- Buffs activos
- Feats (Weapon Focus, etc.)

### Contextual Changes disponibles

Los contextual changes vienen de buffs y features:

```typescript
function getContextualChangesForAttack(attack: Attack): AttackContextualChange[] {
  const allContextualChanges = getAllContextualChanges() // de buffs, features, etc.
  
  return allContextualChanges.filter(cc => {
    // Si aplica a 'all', siempre disponible
    if (cc.appliesTo === 'all') return true
    
    // Si aplica a 'melee' y es ataque melee
    if (cc.appliesTo === 'melee' && attack.type === 'melee') return true
    
    // Si aplica a 'ranged' y es ataque ranged
    if (cc.appliesTo === 'ranged' && attack.type === 'ranged') return true
    
    return false
  }).filter(cc => cc.available) // Solo los disponibles
}
```

### Recálculo de ataque

El recálculo debe:
1. Tomar el ataque base
2. Aplicar los changes de cada contextual change seleccionado
3. Resolver variables si las hay
4. Devolver el ataque modificado

**Nota:** Este cálculo debería hacerse en el core, no en la UI. La UI solo maneja el estado de selecciones.

---

## 9. Verificación

Antes de considerar esta sección completa:

### Visualización
- [ ] La lista de ataques se muestra correctamente
- [ ] Se separan melee de ranged (opcional)
- [ ] Los valores de attack bonus y damage son correctos
- [ ] El diseño es legible y coherente

### Navegación
- [ ] Click en ataque navega a detalle
- [ ] El detalle muestra toda la información
- [ ] El botón back funciona

### SourceValues
- [ ] El desglose de attack bonus es correcto
- [ ] El desglose de damage es correcto
- [ ] Los sources coinciden con los buffs/items activos

### Contextual Changes
- [ ] Se muestran los contextual changes disponibles para el ataque
- [ ] Power Attack solo aparece en melee
- [ ] Deadly Aim solo aparece en ranged
- [ ] Changes con appliesTo='all' aparecen en ambos

### Toggle Contextual Changes
- [ ] Click en checkbox activa/desactiva el change
- [ ] Los valores de attack y damage se recalculan correctamente
- [ ] El recálculo es instantáneo (sin lag)
- [ ] Los sourceValues se actualizan mostrando el contextual change

### Variables en Contextual Changes
- [ ] Los changes con variables muestran el selector
- [ ] Cambiar la variable recalcula el efecto
- [ ] Los valores min/max de la variable se respetan

### Integración
- [ ] Los ataques vienen de las armas equipadas
- [ ] Equipar/desequipar arma actualiza la lista
- [ ] Los buffs activos afectan los ataques
- [ ] Los contextual changes de buffs están disponibles

---

## 10. Archivos Creados

Checklist de archivos:

```
packages/ui/src/components/character/
├── attacks/
│   ├── AttackCard.tsx                   [ ]
│   ├── AttacksList.tsx                  [ ]
│   ├── AttacksSection.tsx               [ ]
│   ├── ContextualChangeToggle.tsx       [ ]
│   └── index.ts                         [ ]
├── detail/
│   ├── AttackDetailPage.tsx             [ ]
│   └── index.ts (actualizar)            [ ]
└── hooks/
    └── useAttackContext.ts              [ ]

apps/zukus/app/character/[id]/
└── attack/
    └── [attackId].tsx                   [ ]
```

---

## Siguiente Paso

Los ataques son una de las partes más interactivas del character sheet. Una vez completados, el usuario puede ver cómo los buffs y modificadores afectan el combate en tiempo real.

Continuar con [07-skills.md](./07-skills.md) para otra sección importante, o con [04-hit-points.md](./04-hit-points.md) para algo más simple.
