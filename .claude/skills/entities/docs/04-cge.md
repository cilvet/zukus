# CGE (Configuracion de Gestion de Entidades)

Sistema para configurar como los personajes interactuan con entidades accionables: conjuros, maniobras, poderes, invocaciones.

## Concepto Central

Un CGE es una configuracion que combina varias **dimensiones ortogonales** para describir las reglas de una clase con sus entidades. No son "tipos de CGE" sino aspectos independientes que se combinan.

## Arquitectura

```
CGEConfig (definicion en clase)
    |
    v
CGEState (persistido en character)
    |
    v
CalculatedCGE (en CharacterSheet)
    |
    v
UI (CGEKnownPanel, CGEEntitySelectPanel)
```

## Dimensiones de Configuracion

Un CGEConfig se compone de:

1. **Identificacion**: id, classId, entityType, levelPath
2. **Acceso**: accessFilter que limita entidades disponibles
3. **Conocidos (known)**: como se adquieren entidades
4. **Tracks**: pistas con configuracion de recursos y preparacion
5. **Variables**: prefijos para exponer valores al sistema de formulas

Las dimensiones known, resource y preparation son independientes y se combinan. Por ejemplo:
- Sorcerer: LIMITED_PER_LEVEL + SLOTS + NONE
- Wizard: UNLIMITED + SLOTS + BOUND
- Warblade: LIMITED_TOTAL + NONE + LIST
- Warlock: LIMITED_TOTAL + NONE + NONE

## CGEConfig

```typescript
type CGEConfig = {
  id: string;              // "sorcerer-spells"
  classId: string;         // "sorcerer"
  entityType: string;      // "spell"
  levelPath: string;       // "@entity.levels.sorcerer"

  accessFilter?: Filter;   // Limita entidades disponibles

  known?: KnownConfig;     // Configuracion de conocidos (opcional)
  tracks: Track[];         // Pistas de recursos y preparacion
  variables?: VariablesConfig;
};
```

Si `known` no existe, la clase accede directamente a la lista filtrada sin pool de conocidos (Cleric, Druid).

## Dimension: Known

Como se adquieren entidades al pool de conocidos.

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `UNLIMITED` | Sin limite, spellbook | Wizard |
| `LIMITED_PER_ENTITY_LEVEL` | X por nivel de entidad | Sorcerer (6/6/5/4...) |
| `LIMITED_TOTAL` | X totales de cualquier nivel | Warblade, Warlock |
| *(sin config)* | Acceso directo a lista filtrada | Cleric, Druid |

### LIMITED_TOTAL importante

Para `LIMITED_TOTAL`, los `knownLimits` tienen `level: -1`:
- El usuario puede aprender entidades de cualquier nivel
- NO aplicar filtro de nivel en UI cuando `level < 0`

```typescript
// En UI
state['level'] = slotLevel >= 0 ? slotLevel : null
```

## Dimension: Resource

Como se consumen las entidades.

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `SLOTS` | Slots por nivel | Wizard, Cleric, Sorcerer |
| `POOL` | Pool de puntos | Psion (power points) |
| `NONE` | Sin coste (at-will) | Warlock, Warblade |

### SLOTS

```typescript
resource: {
  type: 'SLOTS',
  table: { 1: [5, 3, 0, ...], 2: [5, 4, 0, ...] },
  bonusVariable: '@bonusSpells',
  refresh: 'daily',
}
```

### POOL

```typescript
resource: {
  type: 'POOL',
  maxFormula: { expression: '@psion.powerPoints' },
  costPath: '@entity.level',
  refresh: 'daily',
}
```

## Dimension: Preparation

Como se preparan entidades antes de usarlas.

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `NONE` | Sin preparacion, usa de conocidos | Sorcerer, Warlock |
| `BOUND` | Cada slot ligado a una entidad | Wizard 3.5, Cleric |
| `LIST` | Lista preparada independiente | Warblade, Spirit Shaman |

### BOUND

Cada slot individual se prepara con una entidad:

```typescript
preparation: { type: 'BOUND' }

// Estado persistido:
boundPreparations: { "base:1-0": "fireball", "base:1-1": "magic-missile" }
usedBoundSlots: { "base:1-0": true }  // Ya lanzado
```

### LIST

Lista de preparados (GLOBAL o PER_LEVEL):

```typescript
// GLOBAL - Warblade
preparation: {
  type: 'LIST',
  structure: 'GLOBAL',
  maxFormula: { expression: '@warblade.readiedManeuvers' },
  consumeOnUse: true,
  recovery: 'manual',
}

// PER_LEVEL - Spirit Shaman
preparation: {
  type: 'LIST',
  structure: 'PER_LEVEL',
  maxPerLevel: { 1: [0, 2, 0, ...], 2: [0, 3, 1, ...] },
  consumeOnUse: false,
}
```

## CGEState (Persistencia)

```typescript
type CGEState = {
  // Entidades conocidas por nivel
  knownSelections?: Record<string, string[]>
  // { "0": ["prestidigitation"], "1": ["magic-missile"] }

  // Preparacion BOUND
  boundPreparations?: Record<string, string>  // slotId -> entityId
  usedBoundSlots?: Record<string, boolean>    // slotId -> usado

  // Slots consumidos
  slotCurrentValues?: Record<string, number>  // deltaFromMax
}
```

## Operaciones

### Conocidos

```typescript
import {
  addKnownEntity,
  removeKnownEntity,
  isEntityKnown,
  getKnownCountsByLevel
} from '@zukus/core';

// Anadir
const result = addKnownEntity(character, "sorcerer-spells", spellEntity, 1);

// Verificar
if (isEntityKnown(character, "sorcerer-spells", "fireball")) { ... }

// Contar
const counts = getKnownCountsByLevel(character, "sorcerer-spells");
// { 0: 5, 1: 3, 2: 0 }
```

### Preparacion

```typescript
import {
  prepareEntityInSlot,
  unprepareSlot,
  useBoundSlot,
  refreshSlots
} from '@zukus/core';

// Preparar en slot BOUND
prepareEntityInSlot(character, "wizard-spells", 1, 0, "fireball", "base");
// boundPreparations["base:1-0"] = "fireball"

// Usar slot
useBoundSlot(character, "wizard-spells", "base:1-0");
// usedBoundSlots["base:1-0"] = true

// Descanso largo
refreshSlots(character, "wizard-spells");
// Limpia slotCurrentValues y usedBoundSlots
```

## Tracks (Pistas)

La mayoria de clases tienen 1 track. Algunas tienen varias (Cleric: base + dominios).

```typescript
tracks: [
  {
    id: 'base',
    label: 'Conjuros',
    resource: { type: 'SLOTS', table: {...}, refresh: 'daily' },
    preparation: { type: 'BOUND' },
  },
  {
    id: 'domain',
    label: 'Dominios',
    filter: { type: 'tag', tag: 'domain-spell' },
    resource: { type: 'SLOTS', table: {...}, refresh: 'daily' },
    preparation: { type: 'BOUND' },
  },
]
```

## Clases de Prueba

| Clase | Known | Resource | Preparation |
|-------|-------|----------|-------------|
| Sorcerer | LIMITED_PER_ENTITY_LEVEL | SLOTS | NONE |
| Wizard | UNLIMITED | SLOTS | BOUND |
| Cleric | UNLIMITED | SLOTS | BOUND |
| Warblade | LIMITED_TOTAL | NONE | LIST GLOBAL + consume |
| Psion | LIMITED_TOTAL | POOL | NONE |
| Warlock | LIMITED_TOTAL | NONE | NONE |

## Filosofia: "Warn, Don't Restrict"

Las operaciones permiten estados invalidos pero generan warnings:

- Agregar mas entidades que el limite -> Warning en calculo
- Preparar entidad no conocida -> Warning en calculo
- Usar slots cuando no quedan -> No bloquea

## Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `cge/types.ts` | CGEConfig, CGEState, CalculatedCGE |
| `cge/knownOperations.ts` | Add/remove known |
| `cge/preparationOperations.ts` | Preparacion de slots |
| `cge/slotOperations.ts` | Uso y refresco de slots |
| `character/calculation/cge/calculateCGE.ts` | Calculo de CGE |

## Siguiente

Ver `05-inventory.md` para el sistema de inventario.
