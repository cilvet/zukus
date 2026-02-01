---
name: cge
description: Sistema CGE (Configuracion de Gestion de Entidades) para gestionar conjuros, maniobras, poderes e invocaciones. Consultar cuando se trabaje con clases que otorgan entidades, filtros de entidades, relaciones entity-class, o UI de seleccion de entidades.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Grep, Glob
---

# CGE - Resumen Ejecutivo

> **Documentacion detallada** en esta misma carpeta:
> - [docs/architecture.md](./docs/architecture.md) - Arquitectura y razonamiento
> - [docs/design.md](./docs/design.md) - Decisiones de diseno, pool externo, contextos
> - [docs/cases.md](./docs/cases.md) - Analisis detallado por clase
> - [casesToCover/](./casesToCover/) - READMEs por clase (wizard, sorcerer, psion, etc.)

CGE configura como los personajes usan entidades accionables (conjuros, maniobras, poderes).

## Tipos REALES (en codigo)

### Known (como accede a entidades)
| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `UNLIMITED` | Sin limite | Wizard spellbook |
| `LIMITED_PER_ENTITY_LEVEL` | X por nivel de entidad | Sorcerer |
| `LIMITED_TOTAL` | X totales (level: -1) | Warblade, Warlock |
| `undefined` | Acceso directo a lista | Spirit Shaman |

### Resource (que consume al usar)
| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `SLOTS` | Slots por nivel | Wizard, Cleric |
| `POOL` | Pool de puntos | Psion |
| `NONE` | Sin coste | Warlock (at-will) |

### Preparation (como prepara)
| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `NONE` | Sin preparacion | Sorcerer, Psion |
| `BOUND` | Cada slot = 1 entidad | Wizard 3.5, Cleric |
| `LIST GLOBAL` | Lista unica | Wizard 5e, Warblade |
| `LIST PER_LEVEL` | Lista por nivel | Spirit Shaman, Arcanist |

---

## Estado de Implementacion

### FUNCIONA (tests pasan)
- Known: UNLIMITED, LIMITED_PER_ENTITY_LEVEL, LIMITED_TOTAL
- Resource: SLOTS, NONE
- Preparation: BOUND, NONE
- Multiple tracks (Cleric base + domain)
- Operaciones: addKnownEntity, prepareEntityInSlot, useSlot, useBoundSlot, refreshSlots

### PENDIENTE
1. **POOL resource** - `calculateCGE.ts:287-289`
   - Retorna `{ max: 0, current: 0 }` placeholder
   - Falta: evaluar `maxFormula` con substitutionIndex
   - Afecta: Psion

2. **LIST preparation operations** - NO EXISTE archivo
   - Falta: addToListPreparation, removeFromListPreparation
   - Afecta: Warblade, Spirit Shaman, Arcanist, Wizard5e

3. **Bonus de slots** - `calculateCGE.ts:360`
   - `bonusVariable` ya existe en ResourceConfigSlots
   - Falta: leer `@bonusSpells.level.{n}` del substitutionIndex
   - NO es hardcodeo, va por variables expuestas

### FUERA DEL MODELO (requiere diseno)
- Shadowcaster (resource evoluciona por entidad)
- Truenamer (DC incrementante, no consumible)
- Binder (binding checks, no preparacion)

### SOLUCION PROPUESTA: Pool Externo (Factotum)

Factotum tiene IP compartidos entre CGE y no-CGE. Solucion:

```typescript
resource: {
  type: 'POOL',
  poolPath: '@factotum.inspirationPoints',  // Lee/escribe variable externa
  costFormula: { expression: '1' },
  refresh: 'encounter'
}
```

Con `poolPath`, el CGE no usa `CGEState.poolCurrentValue` - lee/escribe directamente a una variable del personaje compartida.

---

## Sistema de Contextos (Futuro)

El sistema actual es **primitivo**. Los "contextos" permitiran modificar uso/preparacion:

| Caso | Input | Output |
|------|-------|--------|
| Metamagia | entidad + Maximize Spell | `effectiveSlotLevel: 6` |
| Augment (Psionics) | poder + PP extra | `effectiveCost`, `augmentedEffects` |
| Ritual (5e) | conjuro ritual | `skipSlotConsumption: true` |

**Estado**: No implementado. El sistema actual funciona sin estos modificadores.

---

## Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `cge/types.ts` | Tipos CGEConfig, CalculatedCGE |
| `cge/knownOperations.ts` | Add/remove known |
| `cge/preparationOperations.ts` | BOUND preparation only |
| `cge/slotOperations.ts` | useSlot, refreshSlots |
| `calculation/cge/calculateCGE.ts` | Calculo en sheet |

---

## TestClasses Existentes

| Clase | Config | Tests |
|-------|:------:|:-----:|
| Warblade | OK | OK |
| Psion | OK | OK |
| Warlock | OK | OK |
| Spirit Shaman | OK | NO |
| Arcanist | OK | NO |
| Wizard5e | OK | NO |

---

## Notas Criticas

1. **LIMITED_TOTAL usa level: -1** - NO filtrar por nivel en UI cuando `level < 0`

2. **bonusVariable va por variables** - El sistema de slots tiene `bonusVariable: '@bonusSpells'` que se expande a `.level.{n}` y se lee del substitutionIndex como cualquier otra variable

3. **LIST preparation tiene 2 recursos separados**:
   - `maxFormula`/`maxPerLevel` = cuantos puede preparar
   - `resource.table` = cuantos puede usar (slots)

4. **consumeOnUse distingue**:
   - `true` = Warblade (maniobra se gasta, recovery manual)
   - `false` = Arcanist (lista persiste, slots se gastan)

---

## Matriz de Casos

Ver [casesToCover/NOMENCLATURE.md](./casesToCover/NOMENCLATURE.md) para la tabla completa.

| Clase | Known | Resource | Preparation | Estado |
|-------|-------|----------|-------------|--------|
| wizard | UNLIMITED | SLOTS | BOUND | Implementado |
| sorcerer | LIMITED_PER_ENTITY_LEVEL | SLOTS | NONE | Implementado |
| cleric | undefined | SLOTS | BOUND | Implementado |
| warlock | LIMITED_TOTAL | NONE | NONE | Implementado |
| psion | LIMITED_TOTAL | POOL | NONE | Pendiente POOL |
| warblade | LIMITED_TOTAL | NONE | LIST GLOBAL | Pendiente LIST |
| wizard5e | UNLIMITED | SLOTS | LIST GLOBAL | Pendiente LIST |
