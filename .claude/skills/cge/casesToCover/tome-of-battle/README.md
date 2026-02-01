# Tome of Battle - Martial Adepts

## Estado: Parcialmente implementado

- Known (LIMITED_TOTAL): Implementado
- Resource (NONE): Implementado
- Preparation (LIST): Tipos definidos, operaciones PENDIENTES

---

## Resumen Mecanico

Las clases de Tome of Battle (Warblade, Swordsage, Crusader) usan maniobras:
- Conocen maniobras limitadas (total, no por nivel)
- Preparan (ready) un subset cada dia
- Las readied se "gastan" al usarlas y se recuperan con acciones especificas

---

## Configuracion CGE Real

Tomado de `packages/core/core/domain/cge/examples.ts`:

```typescript
const warbladeCGE: CGEConfig = {
  id: 'warblade-maneuvers',
  classId: 'warblade',
  entityType: 'maneuver',
  levelPath: '@entity.level',

  accessFilter: {
    field: 'disciplines',
    operator: 'intersects',
    value: ['Diamond Mind', 'Iron Heart', 'Stone Dragon', 'Tiger Claw', 'White Raven'],
  },

  known: {
    type: 'LIMITED_TOTAL',
    table: WARBLADE_KNOWN_TABLE, // [3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
  },

  tracks: [
    {
      id: 'base',
      resource: { type: 'NONE' },
      preparation: {
        type: 'LIST',
        structure: 'GLOBAL',
        maxFormula: { expression: '@warblade.readiedManeuvers' },
        consumeOnUse: true,
        recovery: 'manual',
      },
    },
  ],

  variables: {
    classPrefix: 'warblade.maneuver',
    genericPrefix: 'maneuver',
    casterLevelVar: 'initiatorLevel.warblade',
  },

  labels: {
    known: 'known_maneuvers',
    prepared: 'readied_maneuvers',
    action: 'initiate',
  },
}
```

---

## Known Config

**Tipo**: `LIMITED_TOTAL`

- Conoce maniobras limitadas por tabla (total, no separado por nivel de maniobra)
- La tabla tiene un solo valor por nivel de clase: `{ 1: [3], 2: [4], ... }`
- El array de un elemento (level -1) indica que es un limite global

**Label**: "known_maneuvers"

---

## Resource Config

**Tipo**: `NONE`

- No hay slots ni pool de puntos
- El sistema de gasto/recuperacion se maneja via preparation LIST

---

## Preparation Config

**Tipo**: `LIST`

```typescript
preparation: {
  type: 'LIST',
  structure: 'GLOBAL',      // Lista unica, no separada por nivel
  maxFormula: { ... },      // Formula para max readied
  consumeOnUse: true,       // Se gasta al usar
  recovery: 'manual',       // Recuperacion via accion especifica
}
```

### Operaciones pendientes de implementar:

- `addToList(character, cgeId, entityId)` - Anadir a readied
- `removeFromList(character, cgeId, entityId)` - Quitar de readied
- `useFromList(character, cgeId, entityId)` - Marcar como gastada
- `recoverFromList(character, cgeId, entityId)` - Recuperar una
- `recoverAllFromList(character, cgeId)` - Recuperar todas

---

## Variables Expuestas

- `@warblade.maneuver.known.max` - Total de conocidas
- `@warblade.readiedManeuvers` - Max que puede readiar
- `@initiatorLevel.warblade` - Nivel de iniciador

---

## Recovery por Clase

Cada clase de Tome of Battle recupera maniobras de forma diferente:

### Warblade
- **Swift action + melee attack**: recupera todas las gastadas
- Rapido y agresivo

### Swordsage
- **Full-round action**: recupera una maniobra
- Puede meditar para recuperar todas (requiere condiciones especiales)

### Crusader
- **Caso especial complejo**:
  - Al inicio de cada encuentro, solo algunas readied estan "granted" (aleatorio)
  - Cada round, una nueva se vuelve granted
  - Al final del encuentro, todas se recuperan
- Requiere logica adicional de "granted pool" que no esta en el CGE base

La recuperacion se modelara en el sistema de acciones, no directamente en CGE.

---

## Stances (entidad separada)

Ademas de maniobras, las clases de ToB conocen "stances":
- Se activan como swift action
- Permanecen activas indefinidamente
- Solo una stance activa a la vez

Las stances son un concepto separado. Opciones:
1. Otro CGE con resource=NONE, preparation=NONE (at-will conocidas)
2. Sistema de "modos activos" fuera de CGE

---

## Tests Existentes

Ver `packages/core/core/domain/character/calculation/__tests__/cge/warblade.spec.ts`:

- Configuracion CGE correcta (entityType, known, resource, preparation)
- Calculated CGE con tracks y limits
- Known operations (add, remove, get, count)
- Sheet integration con knownLimits

---

## Texto Original (Tome of Battle)

> **Maneuvers Known**: You begin your career with knowledge of three martial maneuvers. The disciplines available to you depend on your class.
>
> **Maneuvers Readied**: You ready a subset of your maneuvers known for each encounter. You can change your selection of readied maneuvers by spending 5 minutes practicing.
>
> **Recovering Maneuvers**: You must recover expended maneuvers before you can use them again. The method of recovery varies by class.
