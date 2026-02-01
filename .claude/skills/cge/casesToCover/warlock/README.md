# Warlock - Invocations

## CGE Generico: AT_WILL_INVOCATIONS

## Estado: Implementado

Implementacion completa en:
- Clase: `packages/core/testClasses/warlock/warlockClass.ts`
- Features: `packages/core/testClasses/warlock/warlockClassFeatures.ts`
- Ejemplo CGE: `packages/core/core/domain/cge/examples.ts` (warlockCGE)
- Tests: `packages/core/core/domain/character/calculation/__tests__/cge/warlock.spec.ts`

---

## Resumen Mecanico

El Warlock usa invocaciones at-will:
- Conoce invocaciones limitadas (total, no por nivel de invocacion)
- Puede usarlas sin limite (at-will)
- Eldritch Blast como base modificable

---

## Configuracion CGE

### known

**Tipo**: `LIMITED_TOTAL`

- Conoce invocaciones limitadas por tabla (total, no separado por nivel)
- Invocaciones tienen grados (least, lesser, greater, dark) que determinan cuando se pueden aprender
- Solo puede aprender invocaciones de grado accesible por nivel de clase

**Tabla de conocidos (total)**:
```
Nivel | Invocaciones conocidas
------+----------------------
  1   | 1
  2   | 2
  3   | 2
  4   | 3
  5   | 3
  6   | 4
  ...
 20   | 12
```

**Restriccion por grado** (implementado via `levelPath`):
```
Nivel | Grados accesibles
------+------------------
 1-5  | Least
 6-10 | Least, Lesser
11-15 | Least, Lesser, Greater
16-20 | Least, Lesser, Greater, Dark
```

El `levelPath` es `@entity.gradeLevel` donde:
- Least = 1
- Lesser = 6
- Greater = 11
- Dark = 16

---

### resource

**Tipo**: `NONE`

- No genera recursos de "usos"
- Las invocaciones son at-will (uso ilimitado)

---

### preparation

**Tipo**: `NONE`

- No prepara invocaciones
- Usa cualquier invocacion conocida cuando quiera

---

## Track

Un unico track "base":

```typescript
tracks: [
  {
    id: 'base',
    label: 'invocations',
    resource: { type: 'NONE' },
    preparation: { type: 'NONE' },
  },
]
```

---

## Variables Expuestas

```typescript
variables: {
  classPrefix: 'warlock.invocation',
  genericPrefix: 'invocation',
  casterLevelVar: 'invocationLevel.warlock',
}
```

---

## Labels

```typescript
labels: {
  known: 'known_invocations',
  action: 'invoke',
}
```

---

## Eldritch Blast (caso especial)

Eldritch Blast es una habilidad base (classFeature) que:
- Escala con nivel (1d6, 2d6, etc.)
- Puede modificarse con invocaciones de "blast shape" y "eldritch essence"
- Solo una de cada tipo a la vez

Esto se modela como entidad separada (classFeature), no como parte del CGE.

---

## Texto Original (Complete Arcane)

> **Invocations**: A warlock does not prepare or cast spells as other wielders of arcane magic do. Instead, he possesses a repertoire of attacks, defenses, and abilities known as invocations that require him to focus the wild energy that suffuses his soul. A warlock can use any invocation he knows at will.
>
> **Eldritch Blast**: The first ability a warlock learns is eldritch blast. A warlock attacks his foes with eldritch power, using baleful magical energy to deal damage and sometimes impart other debilitating effects.

---

## Patron CGE Completo

Este es el patron mas simple de CGE:
- **LIMITED_TOTAL**: pool de conocidos sin separacion por nivel
- **NONE + NONE**: sin recursos ni preparacion

Util para habilidades at-will con conocidos limitados.
