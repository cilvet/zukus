# Psion - Manifesting

## CGE Generico: POWER_POOL

## Estado: Resuelto

---

## Resumen Mecanico

El Psion usa un sistema de puntos en lugar de slots:
- Conoce poderes limitados (similar a sorcerer)
- Gasta power points de un pool unico
- Puede "augmentar" poderes gastando mas puntos

---

## Pool Source

**Tipo**: CURATED_SELECTION

- Conoce poderes limitados por tabla
- Elige al subir de nivel
- Puede elegir de su disciplina o lista general

**Label**: "Poderes conocidos"

---

## Selection Stage

**Tipo**: NONE (espontaneo)

- No prepara poderes
- Manifiesta cualquier conocido gastando puntos

---

## Resources

**Estrategia**: UNIFIED_POOL

- Genera: `@psionic.powerPoints.max`, `@psionic.powerPoints.current`
- Max value: tabla de progresion + bonus por INT
- Refresh: daily

**Tabla de power points**:
```
Nivel | PP Base
------+--------
  1   | 2
  2   | 6
  3   | 11
  4   | 17
  5   | 25
  ...
```

Bonus por INT alta anade puntos adicionales.

---

## Preparation Tracks

No aplica - no hay preparacion.

---

## Variables Expuestas

- `@manifesterLevel.psion` (equivalente a casterLevel)
- `@psionic.powerPoints.max`
- `@psionic.powerPoints.current`
- `@powers.known.max` (total, no por nivel)

---

## Augmentation (caso especial)

Los poderes psionicos pueden "augmentarse" gastando mas puntos:
- Cada poder define opciones de augment
- Limite: no puedes gastar mas puntos que tu manifester level en un solo poder
- Esto se modelara en el sistema de acciones, no en el CGE

---

## Preparation Context

No tiene contexto de preparacion.

El "contexto de manifestacion" (futuro) manejara:
- Cuantos puntos gastar
- Que augments aplicar

---

## Texto Original (SRD)

> **Power Points/Day**: A psion's ability to manifest powers is limited by the power points he has available. His base daily allotment of power points is given on Table: The Psion. In addition, he receives bonus power points per day if he has a high Intelligence score.
>
> **Powers Known**: A psion begins play knowing three 1st-level powers of your choice. At every even-numbered class level after 1st, a psion gains knowledge of one new power.
>
> **Maximum Power Level Known**: A psion begins play with the ability to learn 1st-level powers. As he attains higher levels, a psion may gain the ability to master more complex powers.
