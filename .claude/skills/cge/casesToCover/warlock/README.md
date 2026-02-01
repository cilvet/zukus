# Warlock - Invocations

## CGE Generico: AT_WILL_INVOCATIONS

## Estado: Resuelto

---

## Resumen Mecanico

El Warlock usa invocaciones at-will:
- Conoce invocaciones limitadas
- Puede usarlas sin limite (at-will)
- Eldritch Blast como base modificable

---

## Pool Source

**Tipo**: CURATED_SELECTION

- Conoce invocaciones limitadas por tabla
- Invocaciones tienen grados (least, lesser, greater, dark)
- Solo puede aprender invocaciones de grado accesible por nivel

**Label**: "Invocaciones conocidas"

**Restriccion por grado**:
```
Nivel | Grados accesibles
------+------------------
 1-5  | Least
 6-10 | Least, Lesser
11-15 | Least, Lesser, Greater
16-20 | Least, Lesser, Greater, Dark
```

---

## Selection Stage

**Tipo**: NONE

- No prepara invocaciones
- Usa cualquier conocida cuando quiera

---

## Resources

**Estrategia**: NONE (at-will)

- No genera recursos de "usos"
- Las invocaciones son ilimitadas

---

## Preparation Tracks

No aplica.

---

## Variables Expuestas

- `@invocations.known.max` - Cuantas invocaciones conoce
- `@eldritchBlast.damage` - Dado de eldritch blast (para UI)

---

## Eldritch Blast (caso especial)

Eldritch Blast es una habilidad base que:
- Escala con nivel (1d6, 2d6, etc.)
- Puede modificarse con invocaciones de "blast shape" y "eldritch essence"
- Solo una de cada tipo a la vez

Esto se modelara como entidad + modificadores, no como CGE.

---

## Preparation Context

No tiene contexto de preparacion.

---

## Texto Original (Complete Arcane)

> **Invocations**: A warlock does not prepare or cast spells as other wielders of arcane magic do. Instead, he possesses a repertoire of attacks, defenses, and abilities known as invocations that require him to focus the wild energy that suffuses his soul. A warlock can use any invocation he knows at will.
>
> **Eldritch Blast**: The first ability a warlock learns is eldritch blast. A warlock attacks his foes with eldritch power, using baleful magical energy to deal damage and sometimes impart other debilitating effects.
