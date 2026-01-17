# 00: Componentes Compartidos

**Prioridad:** CRÍTICA - Crear primero, antes de cualquier sección.

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

Estos componentes son usados por múltiples secciones del CharacterSheet. Implementarlos primero evita duplicación y asegura consistencia.

---

## 1. SourceValuesView

**Ubicación:** `packages/ui/src/components/character/shared/SourceValuesView.tsx`

### Qué hace
Muestra el desglose de fuentes que componen un valor calculado.

### Ejemplo visual
```
Total: +8

━━━━━━━━━━━━━━━━━━
Base             +4
Racial Bonus     +2
Enhancement      +2
━━━━━━━━━━━━━━━━━━
```

### Props
```typescript
type SourceValuesViewProps = {
  sources: SourceValue[];
  totalValue: number;
  label?: string;
}

type SourceValue = {
  sourceName: string;
  value: number;
  relevant: boolean;
}
```

### Referencia
- `zukusnextmicon/src/components/Character/SourceValues/SourceValuesContent.tsx`

### Consideraciones
- Filtrar sources con `relevant: false` o mostrarlos grises
- Formato de valor con signo (+4, -2)
- Separador visual entre sources

---

## 2. ChangeForm

**Ubicación:** `packages/ui/src/components/character/forms/ChangeForm.tsx`

### Qué hace
Editor completo para un `Change` (modificador normal).

### Datos que edita
```typescript
type Change = {
  type: ChangeType;           // 'ability', 'skill', 'savingThrow', 'ac', etc.
  bonusTypeId: string;        // 'enhancement', 'morale', 'dodge', etc.
  formula: Formula;           // Fórmula simple o switch
  conditions?: Condition[];   // Condiciones de aplicación
  // Campos específicos según el tipo
  abilityUniqueId?: string;
  skillUniqueId?: string;
  savingThrowUniqueId?: string;
  // etc.
}
```

### UI Elements
- **Selector de tipo de change** (ability, skill, AC, etc.)
- **Selector de bonus type** (enhancement, morale, etc.)
- **Editor de fórmula:**
  - Fórmula simple: input de texto
  - Fórmula switch: casos condicionales
- **Selector de target específico:**
  - Si es ability → selector de STR/DEX/etc.
  - Si es skill → selector de skill
  - Si es saving throw → selector de FOR/REF/WIL
- **Condiciones opcionales** (cuando aplica el change)

### Referencia
- `zukusnextmicon/src/components/Character/Changes/ChangeForm.tsx`
- `zukusnextmicon/src/components/Character/Changes/helpers/`

### Componentes internos
- `FormulaEditor` - Editar fórmulas simples o switch
- `ChangeTypeSelector` - Dropdown de tipos
- `BonusTypeSelector` - Dropdown de bonus types
- `ChangeTargetSelector` - Selector dinámico según el tipo

---

## 3. ContextualChangeForm

**Ubicación:** `packages/ui/src/components/character/forms/ContextualChangeForm.tsx`

### Qué hace
Editor para `AttackContextualChange` (modificadores opcionales de ataque).

### Datos que edita
```typescript
type AttackContextualChange = {
  name: string;
  type: 'attack';
  optional: boolean;
  available: boolean;
  appliesTo: 'all' | 'melee' | 'ranged';
  changes: Change[];
}
```

### Ejemplo: Power Attack
```
Name: Power Attack
Optional: true
Available: true (cuando available = true, se puede activar)
Applies To: melee
Changes:
  - Attack: -1 per +1 to damage
  - Damage: +2 (or +3 if two-handed)
```

### UI Elements
- Input de nombre
- Checkbox "Optional" (si es seleccionable por el usuario)
- Checkbox "Available" (si está disponible actualmente)
- Selector "Applies To" (all/melee/ranged)
- Lista de Changes con `ChangeForm`

### Referencia
- `zukusnextmicon/src/components/Character/Changes/ContextualChangeForm.tsx`

---

## 4. SpecialChangeForm

**Ubicación:** `packages/ui/src/components/character/forms/SpecialChangeForm.tsx`

### Qué hace
Editor para `SpecialChange` (define recursos o variables personalizadas).

### Tipos de Special Changes

#### A) RESOURCE_DEFINITION
Define un recurso (usos por día, puntos, etc.)

```typescript
type ResourceDefinitionChange = {
  type: 'RESOURCE_DEFINITION';
  resourceId: string;
  name: string;
  maxValueFormula: Formula;
  chargesPerUseFormula?: Formula;
  rechargeFormula?: Formula;
}
```

Ejemplo: Ki Points
```
Resource ID: ki_points
Name: Ki Points
Max Value: characterLevel (monk levels)
Charges Per Use: 1
Recharge: characterLevel on rest
```

#### B) CUSTOM_VARIABLE_DEFINITION
Define una variable personalizada

```typescript
type CustomVariableChange = {
  type: 'CUSTOM_VARIABLE_DEFINITION';
  variableId: string;
  name: string;
  baseSources: BaseSource[];
}
```

### UI Elements
- Selector de tipo (RESOURCE_DEFINITION / CUSTOM_VARIABLE_DEFINITION)
- Campos específicos según el tipo
- Editor de fórmulas para max/charges/recharge

### Referencia
- `zukusnextmicon/src/components/Character/Changes/SpecialChangeForm.tsx`

---

## 5. EntitySearchModal

**Ubicación:** `packages/ui/src/components/character/search/EntitySearchModal.tsx`

### Qué hace
Modal de búsqueda genérico para entidades del compendio (items, hechizos, dotes, etc.)

### Props
```typescript
type EntitySearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (entity: ComputedEntity) => void;
  entityType: string;          // 'item', 'spell', 'feat', etc.
  filters?: FacetFilters;      // Filtros específicos
}
```

### Features
- **Búsqueda por nombre** (input de texto)
- **Filtros por facets** (según el schema de la entidad)
  - Ejemplo para items: tipo, subtipo, peso, costo
  - Ejemplo para hechizos: nivel, escuela, componentes
- **Paginación** (20 resultados por página)
- **Resultados** como tarjetas clickeables

### Referencia
- `zukusnextmicon/src/components/Character/CustomEntities/EntitySearch/EntitySearchModal.tsx`
- `zukusnextmicon/src/components/Character/Equipment/EquipmentSearch/EquipmentSearchPanel.tsx`

### Componentes internos
- `SearchInput` - Input con debounce
- `FacetFilters` - Filtros dinámicos según schema
- `EntitySearchResult` - Tarjeta de resultado
- `Pagination` - Controles de paginación

---

## 6. EntityProvider (Sistema Completo)

**Ubicación:** `packages/ui/src/components/character/entity-provider/`

### Qué hace
Sistema completo para seleccionar entidades con validación (usado principalmente en el editor de niveles).

### Estructura de archivos
```
entity-provider/
├── types.ts                      # Tipos del sistema
├── useProviderSelection.ts       # Hook de lógica
├── ProviderView.tsx              # Vista principal
├── SelectorView.tsx              # Vista de selección
├── GrantedEntitiesList.tsx       # Lista de otorgadas
├── NestedProviderRenderer.tsx    # Renderizado recursivo
├── EntityOptionRow.tsx           # Fila de opción
└── index.ts
```

### Concepto: Provider

Un **Provider** es una entidad que otorga otras entidades con posibles selecciones.

Ejemplo: Clase Fighter nivel 1
```
Granted:
  - Bonus Feats (granted automáticamente)
  - Base Attack Bonus +1

Selections (requieren elección del usuario):
  - Select 1 from [Feats de combate]
  - Select 1 from [Skills como class skill]
```

### Flujo
1. **ProviderView** - Muestra el provider y lo que otorga
2. **Detecta selecciones pendientes** - Marca con advertencia
3. **SelectorView** - Modal/página para hacer la selección
4. **Validación** - No permite avanzar si faltan selecciones

### Referencia
- `zukusnextmicon/src/components/EntityProvider/`
- `zukusnextmicon/projectDocs/EntityProviderViewsPlan.md`

### Consideraciones
- Los providers pueden ser recursivos (un feat otorga otro feat)
- Hay validación de prerequisitos
- Las selecciones se persisten con el personaje

---

## Orden de Implementación de Compartidos

1. **SourceValuesView** - Lo más simple, lo necesitan todas las páginas de detalle
2. **ChangeForm** - Fundacional para buffs e items
3. **ContextualChangeForm** - Extensión de ChangeForm
4. **SpecialChangeForm** - Extensión de ChangeForm
5. **EntitySearchModal** - Para búsquedas en equipment y entities
6. **EntityProvider** - El más complejo, para el editor de niveles

---

## Verificación

Antes de considerar esta sección completa:

- [ ] SourceValuesView muestra correctamente un array de sources
- [ ] ChangeForm permite crear/editar todos los tipos de changes
- [ ] ContextualChangeForm permite editar contextual changes
- [ ] SpecialChangeForm permite editar special changes
- [ ] EntitySearchModal busca y filtra entidades del compendio
- [ ] EntityProvider detecta y valida selecciones pendientes
- [ ] Todos los componentes tienen typecheck correcto
- [ ] Los componentes son reutilizables (props genéricos)

---

## Siguiente Paso

Una vez completados estos componentes, proceder con [01-abilities.md](./01-abilities.md) que es la sección más simple y valida el flujo completo.
