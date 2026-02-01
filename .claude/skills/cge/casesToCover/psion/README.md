# Psion - Manifesting

## Estado: Parcialmente implementado

El Psion tiene la configuracion CGE definida, pero el recurso POOL esta pendiente de implementacion real.

---

## Resumen Mecanico

El Psion usa un sistema de puntos en lugar de slots:
- Conoce poderes limitados (total, no por nivel de poder)
- Gasta power points de un pool unico
- Puede "augmentar" poderes gastando mas puntos (futuro)

---

## Implementacion Actual

### Archivos

- **Clase**: `packages/core/testClasses/psion/psionClass.ts`
- **Features**: `packages/core/testClasses/psion/psionClassFeatures.ts`
- **Tests**: `packages/core/core/domain/character/calculation/__tests__/cge/psion.spec.ts`
- **Fixtures de test**: `packages/core/core/domain/character/calculation/__tests__/cge/fixtures.ts`

### Configuracion CGE Real

```typescript
const psionCGEConfig: CGEConfig = {
  id: 'psion-powers',
  classId: 'psion',
  entityType: 'power',
  levelPath: '@entity.level',

  known: {
    type: 'LIMITED_TOTAL',
    table: PSION_KNOWN_TABLE, // [3], [5], [7]... total por nivel de clase
  },

  tracks: [
    {
      id: 'base',
      label: 'power_points',
      resource: {
        type: 'POOL',
        maxFormula: { expression: '@psion.powerPoints.max' },
        costPath: '@entity.level', // Coste = nivel del poder
        refresh: 'daily',
      },
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'psion.power',
    genericPrefix: 'power',
    casterLevelVar: 'manifesterLevel.psion',
  },

  labels: {
    known: 'known_powers',
    pool: 'power_points',
    action: 'manifest',
  },
};
```

---

## Tipos CGE

### Known: LIMITED_TOTAL

**Tipo real**: `LIMITED_TOTAL`

El Psion conoce un numero total de poderes, sin dividir por nivel de poder:
- Nivel 1: 3 poderes totales
- Nivel 2: 5 poderes totales
- Nivel 3: 7 poderes totales
- etc.

La tabla usa un solo valor por nivel de clase: `{ 1: [3], 2: [5], 3: [7], ... }`

**Nota**: Los fixtures de test usan incorrectamente `LIMITED_PER_ENTITY_LEVEL`. Esto deberia corregirse.

### Resource: POOL (PENDIENTE)

**Tipo real**: `POOL`

**Estado de implementacion**: PLACEHOLDER

El calculo en `calculateCGE.ts:287-289` retorna un valor fijo:

```typescript
if (track.resource.type === 'POOL') {
  // TODO: Implementar pool
  calculatedTrack.pool = { max: 0, current: 0 };
}
```

**Lo que deberia hacer**:
- Evaluar `maxFormula` para obtener max (tabla de PP + bonus INT)
- Leer `poolCurrentValue` del estado CGE
- Si no hay estado, current = max

**Tabla de power points base (SRD)**:
```
Nivel | PP Base
------+--------
  1   | 2
  2   | 6
  3   | 11
  4   | 17
  5   | 25
  6   | 35
  7   | 46
  8   | 58
  9   | 72
 10   | 88
```

Bonus adicional: `INT modifier * nivel de clase`

### Preparation: NONE

**Tipo real**: `NONE`

El Psion no prepara poderes. Puede manifestar cualquier poder conocido gastando puntos.

---

## Variables Expuestas

Segun la config:
- `@psion.power.slot.{n}.max` (via classPrefix, aunque no aplica a POOL)
- `@manifesterLevel.psion` (casterLevelVar)
- `@psion.powerPoints.max` (referenciada en maxFormula)

---

## Augmentation (caso especial)

Los poderes psionicos pueden "augmentarse" gastando mas puntos:
- Cada poder define opciones de augment
- Limite: no puedes gastar mas puntos que tu manifester level en un solo poder
- Esto se modelara en el sistema de acciones/uso, no en el CGE

---

## Discrepancias Encontradas

1. **Test fixtures vs clase real**: Los fixtures usan `LIMITED_PER_ENTITY_LEVEL` pero la clase real usa `LIMITED_TOTAL`. La clase real es correcta segun las reglas del juego.

2. **POOL resource**: Solo existe como placeholder. Los tests pasan porque verifican que el pool existe (con max: 0), no que tenga valores correctos.

---

## Trabajo Pendiente

1. **Implementar POOL resource** en `calculateCGE.ts`:
   - Evaluar maxFormula
   - Leer/escribir poolCurrentValue del CGEState
   - Implementar costPath para calcular coste de manifestar

2. **Corregir fixtures de test**: Cambiar `LIMITED_PER_ENTITY_LEVEL` a `LIMITED_TOTAL`

3. **Variable @psion.powerPoints.max**: Debe calcularse desde la tabla + bonus INT

---

## Texto Original (SRD)

> **Power Points/Day**: A psion's ability to manifest powers is limited by the power points he has available. His base daily allotment of power points is given on Table: The Psion. In addition, he receives bonus power points per day if he has a high Intelligence score.
>
> **Powers Known**: A psion begins play knowing three 1st-level powers of your choice. At every even-numbered class level after 1st, a psion gains knowledge of one new power.
>
> **Maximum Power Level Known**: A psion begins play with the ability to learn 1st-level powers. As he attains higher levels, a psion may gain the ability to master more complex powers.
