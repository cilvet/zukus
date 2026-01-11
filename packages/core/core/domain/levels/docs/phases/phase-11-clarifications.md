# Fase 11: CGE (Configuración de Gestión de Entidades) - Aclaraciones

> Aclaraciones obtenidas durante el refinamiento de requisitos.

---

## Objetivo de la Fase

Implementar sistema para gestionar entidades accionables/consumibles (conjuros, maniobras, invocaciones, etc.) con diferentes modos de gestión.

---

## Aclaraciones Confirmadas

### Concepto de CGE
**Decisión**: Un CGE define cómo un personaje interactúa con un tipo de entidad accionable: cómo accede, conoce, prepara y usa esas entidades.

**Razón**: Unificar todos los sistemas de gestión de recursos bajo una abstracción común.

---

### Modos de gestión
**Decisión**: Existen 5 modos principales de gestión:

| Modo | Ejemplo | Descripción |
|------|---------|-------------|
| `PREPARED_BY_LEVEL` | Mago, Clérigo | Prepara conjuros específicos en slots por nivel |
| `SPONTANEOUS` | Hechicero, Bardo | Conocidos limitados, slots compartidos por nivel |
| `USES_PER_ENTITY` | Warlock (SLA) | Cada entidad tiene sus propios usos/día |
| `ALL_ACCESS` | Mago de Guerra | Acceso total a lista, usa slots |
| `GLOBAL_PREPARED` | Variantes | Preparación con pool global (no por nivel) |

---

### Fuente de acceso
**Decisión**: Cada CGE define de dónde vienen las entidades disponibles:

- `filtered_view`: Filtro sobre todas las entidades
- `compendium`: De compendios específicos
- `all_access`: Todas las entidades del tipo

---

### Capacity Tables
**Decisión**: Los slots/conocidos se definen mediante tablas tabulares (como en los libros) que luego se convierten en SwitchFormulas.

**Razón**: Facilita la definición (copiar tablas del PHB) y mantiene la legibilidad.

---

### Estado de CGE en personaje
**Decisión**: El personaje tiene un estado por cada CGE activo que incluye:
- Entidades conocidas (para SPONTANEOUS)
- Entidades preparadas (para PREPARED)
- Slots usados/disponibles

---

## Preguntas Pendientes

### P1: ¿Cómo se definen las capacity tables?
**Opciones**:
- A) Objeto anidado: `{ [charLevel]: { [spellLevel]: amount } }`
- B) Array de objetos: `[{ charLevel: 1, spellLevel: 0, amount: 3 }]`
- C) String tabular parseado

**Recomendación**: A - Más compacto y legible

---

### P2: ¿Los slots se pueden modificar con Changes?
**Pregunta**: ¿Un item/feat puede modificar los slots disponibles?

**Ejemplo**: "Ring of Wizardry duplica slots de nivel 1"

**Opciones**:
- A) Sí - mediante changes especiales
- B) No - solo valores base de la tabla
- C) V2 - posponer para después

**Recomendación**: C - Posponer (complejidad alta)

---

### P3: ¿Cómo se resuelve el nivel de una entidad?
**Pregunta**: Un conjuro tiene `levels: [{ class: 'wizard', level: 1 }, { class: 'cleric', level: 2 }]`. ¿Qué nivel se usa para el CGE del Mago?

**Decisión**: El CGE define un `levelResolver` que extrae el nivel correcto:
```typescript
levelResolver: {
  field: 'levels',
  matcher: { class: 'wizard' },  // Busca en array
  extract: 'level'
}
```

---

### P4: ¿Se validan automáticamente los slots?
**Pregunta**: ¿La función de preparar/usar valida que hay slots disponibles?

**Recomendación**: Sí - devuelve error si no hay slots

---

### P5: ¿Cómo se manejan los usos por día?
**Pregunta**: Para USES_PER_ENTITY, ¿dónde se define cuántos usos tiene cada entidad?

**Recomendación**: Campo en la entidad: `usesPerDay: number | Formula`

---

## Entregables

### F.1 - Tipo EntityManagementConfig
```typescript
type EntityManagementConfig = {
  id: string;
  name: string;
  
  entityType: string;
  mode: ManagementMode;
  
  accessSource: AccessSource;
  levelResolver?: EntityLevelResolver;
  capacityTables?: CapacityTable[];
  policy: 'warn' | 'strict';
}

type ManagementMode = 
  | 'PREPARED_BY_LEVEL'
  | 'SPONTANEOUS' 
  | 'USES_PER_ENTITY'
  | 'ALL_ACCESS'
  | 'GLOBAL_PREPARED';

type AccessSource = 
  | { type: 'filtered_view'; filter: EntityFilter; }
  | { type: 'compendium'; compendiumIds: string[]; }
  | { type: 'all_access'; };

type EntityLevelResolver = {
  field: string;
  default?: number;
}

type CapacityTable = {
  name: string;
  variableName: string;
  perLevel: boolean;
  table: Record<number, Record<number, number>>;
}
```

### F.2 - Estado de CGE en personaje
```typescript
type CharacterCGEState = {
  configId: string;
  
  knownEntities?: Record<string, Entity>;
  preparedEntities?: PreparedEntity[];
  slotsState?: SlotsState;
}

type PreparedEntity = {
  entity: Entity;
  level: number;
  slotUsed: boolean;
}

type SlotsState = {
  perLevel?: Record<number, SlotInfo>;
  global?: SlotInfo;
}

type SlotInfo = {
  total: number;
  used: number;
}
```

### F.3 - Funciones de gestión
```typescript
function getAccessibleEntities(
  config: EntityManagementConfig,
  allEntities: Entity[],
  characterLevel: number
): Entity[]

function prepareEntity(
  cgeState: CharacterCGEState,
  entity: Entity,
  level: number
): { state: CharacterCGEState; errors: string[]; }

function learnEntity(
  cgeState: CharacterCGEState,
  entity: Entity
): { state: CharacterCGEState; errors: string[]; }

function validateCGEState(
  config: EntityManagementConfig,
  state: CharacterCGEState,
  characterLevel: number
): { valid: boolean; errors: string[]; warnings: string[]; }
```

---

## Casos de Uso a Cubrir (Tests)

### Caso 1: Wizard (PREPARED_BY_LEVEL)
```typescript
const wizardCGE: EntityManagementConfig = {
  id: 'wizard-spells',
  name: 'Wizard Spells',
  entityType: 'spell',
  mode: 'PREPARED_BY_LEVEL',
  accessSource: { type: 'all_access' },
  levelResolver: { field: 'levels', default: 0 },
  capacityTables: [
    {
      name: 'Spells per day',
      variableName: 'spellsPerDay',
      perLevel: true,
      table: {
        1: { 0: 3, 1: 1 },
        2: { 0: 4, 1: 2 }
      }
    }
  ],
  policy: 'warn'
};
```

### Caso 2: Sorcerer (SPONTANEOUS)
```typescript
const sorcererCGE: EntityManagementConfig = {
  id: 'sorcerer-spells',
  entityType: 'spell',
  mode: 'SPONTANEOUS',
  capacityTables: [
    {
      name: 'Spells known',
      variableName: 'spellsKnown',
      perLevel: true,
      table: {
        1: { 0: 4, 1: 2 }
      }
    },
    {
      name: 'Spells per day',
      variableName: 'spellsPerDay',
      perLevel: true,
      table: {
        1: { 0: 5, 1: 3 }
      }
    }
  ]
};
```

### Caso 3: Warlock (USES_PER_ENTITY)
```typescript
const warlockCGE: EntityManagementConfig = {
  id: 'warlock-invocations',
  entityType: 'invocation',
  mode: 'USES_PER_ENTITY',
  // Cada invocation tiene su propio usesPerDay
};

const invocation = {
  id: 'eldritch-blast',
  entityType: 'invocation',
  usesPerDay: '@characterLevel >= 10 ? 0 : 3'  // At-will at level 10+
};
```

### Caso 4: Preparar conjuro
```typescript
const state: CharacterCGEState = {
  configId: 'wizard-spells',
  preparedEntities: [],
  slotsState: {
    perLevel: {
      1: { total: 2, used: 0 }
    }
  }
};

const fireball = { id: 'fireball', level: 3, ... };
const result = prepareEntity(state, fireball, 1);
// → preparedEntities: [{ entity: fireball, level: 1, slotUsed: false }]
// → No error (hay slot disponible)
```

### Caso 5: Exceder slots
```typescript
const state: CharacterCGEState = {
  configId: 'wizard-spells',
  slotsState: {
    perLevel: {
      1: { total: 1, used: 1 }
    }
  }
};

const result = prepareEntity(state, spell, 1);
// → errors: ['No slots available for level 1']
```

---

## Archivos a Crear

- `core/domain/entities/cge/types.ts`
- `core/domain/entities/cge/getAccessibleEntities.ts`
- `core/domain/entities/cge/prepareEntity.ts`
- `core/domain/entities/cge/learnEntity.ts`
- `core/domain/entities/cge/validateCGEState.ts`
- `core/domain/entities/cge/index.ts`
- `core/domain/entities/__tests__/cge/prepared.spec.ts`
- `core/domain/entities/__tests__/cge/spontaneous.spec.ts`
- `core/domain/entities/__tests__/cge/usesPerEntity.spec.ts`

---

## Criterios de Aceptación

- [ ] Se puede definir un CGE para cada modo
- [ ] Las capacity tables se resuelven correctamente por nivel
- [ ] El modo SPONTANEOUS maneja conocidos y slots
- [ ] El modo PREPARED_BY_LEVEL maneja preparación por nivel
- [ ] El modo USES_PER_ENTITY maneja usos individuales
- [ ] La validación detecta problemas (slots excedidos, conocidos excedidos)
- [ ] getAccessibleEntities filtra según accessSource
- [ ] Tests cubren todos los modos

---

## Dependencias

**Requiere**:
- Fase B completada (Requirements) ✅
- Fase D completada (Resolución de niveles) ✅
- Fase E completada (Compendios) ✅

**Proporciona**:
- Sistema completo de gestión de conjuros/maniobras/etc

