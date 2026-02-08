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
- Resource: SLOTS, POOL, NONE
- Preparation: BOUND, NONE
- Multiple tracks (Cleric base + domain)
- Operaciones: addKnownEntity, prepareEntityInSlot, useSlot, useBoundSlot, refreshSlots, calculatePoolCost
- **UI Libro del Mago**: UNLIMITED genera `knownLimits` con `max: -1` por nivel (derivados del track SLOTS). CGEKnownPanel soporta modo ilimitado (sin conteo max, "Quitar" en vez de "Olvidar"). CGEEntitySelectPanel tiene toggle "Libro"/"Todos" en modo prepare cuando hay known.

### PENDIENTE

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

### POOL Resource (IMPLEMENTADO)

El CGE puede definir recursos usando el sistema generico `RESOURCE_DEFINITION`:

```typescript
// En CGEConfig
resources: [
  {
    resourceId: 'psion-power-points',
    name: 'Power Points',
    maxValueFormula: { expression: '@customVariable.psion.powerPoints.base + @ability.intelligence.modifier * @class.psion.level' },
    rechargeFormula: { expression: '@resources.psion-power-points.max' },
  },
],

tracks: [
  {
    id: 'base',
    resource: {
      type: 'POOL',
      resourceId: 'psion-power-points', // Referencia al recurso definido
      costPath: '@entity.level',         // Formula para calcular coste
      refresh: 'daily',
    },
    preparation: { type: 'NONE' },
  },
],
```

**Flujo de calculo** (pipeline actualizado):
1. CustomVariables → se calcula `psion.powerPoints.base`
2. Resources → procesa `RESOURCE_DEFINITION` de CGE, expone `@resources.psion-power-points.max`
3. CGE → lee `@resources.psion-power-points.max` y `current` del substitutionIndex

**Para recursos externos (Factotum)**: El CGE no define el recurso, solo lo referencia:
```typescript
// El Inspiration Points se define en otra feature con RESOURCE_DEFINITION
resource: {
  type: 'POOL',
  resourceId: 'factotum-inspiration-points', // Recurso definido externamente
  costPath: '@entity.level',
  refresh: 'encounter'
}
```

#### costPath - Calculo de coste por entidad

El `costPath` define una formula que se evalua contra las propiedades de la entidad para calcular el coste de uso. Usa el prefijo `@entity.*` para acceder a campos de la entidad.

| costPath | Descripcion | Ejemplo |
|----------|-------------|---------|
| `@entity.level` | Nivel de la entidad (default) | Poder nivel 3 = 3 PP |
| `@entity.powerPoints` | Campo powerPoints directo | Si la entidad define su coste |
| `@entity.level * 2` | Formula personalizada | Nivel 3 = 6 PP |

**Funcion**: `calculatePoolCost(costPath, entity)` en `cge/poolOperations.ts`

```typescript
import { calculatePoolCost } from '@zukus/core';

// Calcula el coste basandose en el costPath y la entidad
const cost = calculatePoolCost('@entity.level', { level: 3, name: 'Mind Thrust' });
// cost = 3

// Con formula compleja
const cost2 = calculatePoolCost('@entity.level + @entity.bonus', { level: 2, bonus: 1 });
// cost2 = 3
```

**Notas:**
- El coste minimo siempre es 1
- Si la propiedad no existe en la entidad, se sustituye por 0
- Soporta operaciones matematicas (`+`, `-`, `*`, `/`, `floor`, `ceil`)

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
| `cge/types.ts` | Tipos CGEConfig, CalculatedCGE, CalculatedKnownLimit |
| `cge/knownOperations.ts` | Add/remove known |
| `cge/preparationOperations.ts` | BOUND preparation only |
| `cge/slotOperations.ts` | useSlot, refreshSlots |
| `cge/poolOperations.ts` | calculatePoolCost (coste por entidad) |
| `calculation/cge/calculateCGE.ts` | Calculo en sheet (known limits, tracks, slots) |
| `panels/CGEKnownPanel.tsx` | UI del libro/conocidos (soporta UNLIMITED con max:-1) |
| `panels/CGEEntitySelectPanel.tsx` | Selector de entidades con toggle fuente (Libro/Todos) |
| `panels/cgeUtils.ts` | parseSelectionId, calculateSlotProgress, calculateKnownProgress |

---

## Pagina de Demo

**Ruta:** `/demo-cge` (`apps/zukus/app/demo-cge.tsx`)

**Archivos:**
- `apps/zukus/screens/demo/DemoCGEScreen.tsx` - Pantalla principal
- `apps/zukus/screens/demo/demoCharacters.ts` - Definiciones de personajes demo

La demo permite probar interactivamente todos los tipos de CGE con personajes reales. Usa entidades del compendium real (conjuros en espanol, maniobras, poderes).

### Personajes Demo

| Demo | Configuracion | Funciona |
|------|---------------|:--------:|
| Wizard | UNLIMITED + SLOTS + BOUND | Si |
| Sorcerer | LIMITED_PER_LEVEL + SLOTS + NONE | Si |
| Cleric | UNLIMITED + SLOTS + BOUND | Si |
| Warblade | LIMITED_TOTAL + NONE + LIST | Parcial |
| Psion | LIMITED_TOTAL + POOL + NONE | Si |
| Warlock | LIMITED_TOTAL + NONE + NONE | Si |

**Al implementar nuevas features (POOL, LIST):**
1. Verificar que funciona en la demo correspondiente
2. Los datos de `demoCharacters.ts` usan IDs reales del compendium
3. El estado inicial (`initialCgeState`) debe ser coherente con la config

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

## UNLIMITED Known Limits (max: -1)

Cuando `known.type === 'UNLIMITED'`, `calculateKnownLimits()` genera `CalculatedKnownLimit[]` con `max: -1` para cada nivel que tiene slots > 0 (derivado del primer track SLOTS). Esto permite que la UI muestre los niveles disponibles y permita anadir conjuros al libro.

**Convencion `max: -1`**: Significa "ilimitado". La UI debe:
- No mostrar barra de progreso ni conteo "X/max"
- Mostrar solo el count: "3" en vez de "3/5"
- No bloquear ni auto-cerrar al alcanzar un limite
- CounterBar con `max <= 0` no muestra progreso ni boton OK (funciona por defecto)

**`calculateKnownProgress(cge, level)`** en `cgeUtils.ts`: Devuelve `{ current, max }` donde `max` puede ser `-1`. CGEEntitySelectPanel usa esta funcion en modo `known` (en vez de `calculateSlotProgress` que es para slots).

**Source toggle (Libro/Todos)**: En modo `prepare`, si el CGE tiene `known` config, CGEEntitySelectPanel muestra chips "Libro"/"Todos" para filtrar por entidades conocidas. Default: "Libro" (solo muestra conjuros del libro/conocidos).

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
| psion | LIMITED_PER_ENTITY_LEVEL | POOL | NONE | Implementado |
| warblade | LIMITED_TOTAL | NONE | LIST GLOBAL | Pendiente LIST |
| wizard5e | UNLIMITED | SLOTS | LIST GLOBAL | Pendiente LIST |
