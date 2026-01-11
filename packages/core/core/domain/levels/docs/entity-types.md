# Tipos de Entidad

> **Estado**: Propuesta  
> **Fecha**: 2026-01-05

---

## feat

Dotes/talentos del personaje.

### Campos específicos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `canBeTakenMultipleTimes` | boolean | Si se puede tomar más de una vez |
| `repeatLimit` | string (fórmula) | Límite de repeticiones (si aplica) |
| `prerequisites` | Condition[] | Requisitos para tomarlo (futuro: tipo de campo específico) |

### Addons

- `effectful` — Puede tener changes
- `searchable` — Buscable en UI
- `source` — Origen (compendio, página, etc.)

### Notas

- Categorías via tags: `"fighterBonusFeat"`, `"metamagic"`, etc.

---

## classFeature

Aptitudes de clase (Sneak Attack, Evasion, etc.).

### Campos específicos

Ninguno adicional. Los efectos y variables se definen via addon `effectful`.

### Addons

- `effectful` — Puede tener changes y specialChanges (definesVariables)
- `searchable` — Buscable en UI
- `source` — Origen
- `providable` — Puede tener providers anidados

---

## class

Clases de personaje.

### Campos específicos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `hitDie` | enum | Dado de golpe: 4, 6, 8, 10, 12 |
| `babProgression` | enum | Progresión BAB: full, medium, poor |
| `saves` | object | Progresión de salvaciones |
| `saves.fortitude` | enum | good, poor |
| `saves.reflex` | enum | good, poor |
| `saves.will` | enum | good, poor |
| `skillPointsPerLevel` | string (fórmula) | Puntos de habilidad por nivel |
| `classSkillIds` | string[] | Skills de clase (enum predefinido) |
| `classType` | enum | base, prestige |
| `levels` | dataTable | Providers por nivel (1-20) |
| `prerequisites` | Condition[] | Requisitos para prestigio (futuro) |

### Addons

- `searchable` — Buscable en UI
- `source` — Origen

### Estructura de levels (dataTable)

```json
{
  "levels": {
    "1": {
      "providers": [
        { "granted": { "specificIds": ["sneak-attack-1d6", "trapfinding"] } }
      ]
    },
    "2": {
      "providers": [
        { "granted": { "specificIds": ["evasion"] } },
        { "selector": { "id": "rogue-talent", "entityType": "classFeature", "min": 1, "max": 1 } }
      ]
    }
  }
}
```

---

## Enums con metadatos

Los campos enum tendrán opciones con nombre y descripción:

```typescript
type EnumOption = {
  value: string | number
  name: string
  description?: string
}
```

### Ejemplo: babProgression

```json
{
  "name": "babProgression",
  "type": "enum",
  "options": [
    { "value": "full", "name": "Completa", "description": "+1 por nivel" },
    { "value": "medium", "name": "Media", "description": "+3/4 por nivel" },
    { "value": "poor", "name": "Pobre", "description": "+1/2 por nivel" }
  ]
}
```

