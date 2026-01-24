# Sorcerer - Spellcasting

## CGE Generico: SPONTANEOUS_KNOWN_LIMITED

## Estado: Resuelto

---

## Resumen Mecanico

El Sorcerer es el lanzador espontaneo clasico:
- Conoce un numero limitado de conjuros (fijo por nivel)
- Puede lanzar cualquier conocido usando un slot disponible
- No prepara, elige al momento de lanzar

---

## Pool Source

**Tipo**: CURATED_SELECTION

- Conoce conjuros limitados por tabla de progresion
- Elige al subir de nivel
- Genera recursos de "max conocidos por nivel"

**Label**: "Conjuros conocidos"

**Tabla de conjuros conocidos**:
```
Nivel | 0  1  2  3  4  5  6  7  8  9
------+-----------------------------
  1   | 4  2  -  -  -  -  -  -  -  -
  2   | 5  2  -  -  -  -  -  -  -  -
  3   | 5  3  -  -  -  -  -  -  -  -
  4   | 6  3  1  -  -  -  -  -  -  -
  ...
```

---

## Selection Stage

**Tipo**: NONE (espontaneo)

- No prepara conjuros
- Al lanzar, elige de entre los conocidos
- Metamagia se aplica al lanzar (full-round action en vez de standard)

---

## Resources

**Estrategia**: SLOTS_PER_ENTITY_LEVEL

- Genera: `@spell.slots.level.0` a `@spell.slots.level.9`
- Max value: tabla de progresion + bonus por CHA
- Refresh: daily

**Tabla de slots por dia**:
```
Nivel | 0  1  2  3  4  5  6  7  8  9
------+-----------------------------
  1   | 5  3  -  -  -  -  -  -  -  -
  2   | 6  4  -  -  -  -  -  -  -  -
  3   | 6  5  -  -  -  -  -  -  -  -
  4   | 6  6  3  -  -  -  -  -  -  -
  ...
```

---

## Preparation Tracks

### Track 1: Base (unico)
- Filter: lista "sorcerer/wizard"
- Resources: tabla de slots

No tiene tracks adicionales.

---

## Variables Expuestas

- `@castingClassLevel.sorcerer`
- `@effectiveCasterLevel`
- `@spells.known.level.{X}.max` - Generados por CURATED_SELECTION
- `@spells.known.level.{X}.current`

---

## Preparation Context

No tiene contexto de preparacion tradicional.

Para metamagia al lanzar (futuro sistema de acciones):
- Se aplicara en el contexto de USO, no de preparacion
- Aumentara el tiempo de casting

---

## Texto Original (SRD)

> **Spells Known**: A sorcerer begins play knowing four 0-level spells and two 1st-level spells of your choice. At each new sorcerer level, she gains one or more new spells, as indicated on Table: Sorcerer Spells Known.
>
> **Spells per Day**: A sorcerer can cast any spell she knows without preparing it ahead of time. To learn or cast a spell, a sorcerer must have a Charisma score equal to at least 10 + the spell level.
