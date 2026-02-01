# CGE - Decisiones de Diseno

Este documento explica las decisiones de diseno del sistema CGE y conceptos avanzados.

---

## Filosofia

El CGE se basa en **tres ejes ortogonales** que combinados cubren la mayoria de sistemas de magia/habilidades:

1. **Conocidos** - Como se determina el pool de entidades accesibles
2. **Recursos** - Que se gasta al usar una entidad
3. **Preparacion** - Que seleccion previa se requiere antes de usar

---

## Matriz de Combinaciones

| Clase | known | resource | preparation |
|-------|-------|----------|-------------|
| Warlock | `LIMITED_TOTAL` | `NONE` | `NONE` |
| Sorcerer | `LIMITED_PER_ENTITY_LEVEL` | `SLOTS` | `NONE` |
| Bard | `LIMITED_PER_ENTITY_LEVEL` | `SLOTS` | `NONE` |
| Warmage | _(sin)_ | `SLOTS` | `NONE` |
| Wizard 3.5 | `UNLIMITED` | `SLOTS` | `BOUND` |
| Cleric 3.5 | _(sin)_ | `SLOTS` | `BOUND` |
| Druid | _(sin)_ | `SLOTS` | `BOUND` |
| Wizard 5e | `UNLIMITED` | `SLOTS` | `LIST` GLOBAL |
| Arcanist | `UNLIMITED` | `SLOTS` | `LIST` PER_LEVEL |
| Spirit Shaman | _(sin)_ | `SLOTS` | `LIST` PER_LEVEL |
| Psion | `LIMITED_TOTAL` | `POOL` | `NONE` |
| Warblade | `LIMITED_TOTAL` | `NONE` | `LIST` GLOBAL + consume |
| Swordsage | `LIMITED_TOTAL` | `NONE` | `LIST` GLOBAL + consume |

---

## Pool Externo (Recursos Compartidos)

Algunos casos requieren que el CGE lea/escriba de un pool que existe fuera del CGEState porque es compartido con habilidades no-CGE.

### Caso: Factotum

El Factotum tiene Inspiration Points (IP) que se usan para:
- Arcane Dilettante (CGE - lanzar conjuros)
- Cunning Insight (no CGE - bonus a rolls)
- Cunning Knowledge (no CGE - usar skills)

El pool de IP debe ser compartido entre todos estos sistemas.

### Solucion: poolPath

Anadir `poolPath` opcional a ResourceConfigPool:

```typescript
resource: {
  type: 'POOL',
  // Opcion A: pool interno (actual)
  maxFormula: { expression: '@psion.powerPoints' },

  // Opcion B: pool externo (nuevo)
  poolPath: '@factotum.inspirationPoints',  // Lee .max y .current

  costFormula: { expression: '1' },
  refresh: 'encounter'
}
```

Con `poolPath`:
- El CGE **lee** el valor actual de una variable compartida
- El CGE **escribe** a esa variable cuando se usa el pool
- No usa `CGEState.poolCurrentValue`

### Implementacion requerida

1. Anadir `poolPath?: string` a `ResourceConfigPool` en types.ts
2. En calculateCGE: si hay `poolPath`, leer de substitutionIndex
3. En poolOperations: si hay `poolPath`, modificar variable del personaje

### Otros usos

Este patron tambien sirve para:
- Arcane Reservoir del Arcanist (pool separado de slots)
- Cualquier recurso compartido entre CGE y no-CGE

---

## Sistema de Contextos (Futuro)

El sistema actual de uso de entidades es **primitivo**. En el futuro, implementaremos **contextos** que permitan modificar el comportamiento de uso/preparacion de entidades.

### Casos de uso

| Caso | Input | Output |
|------|-------|--------|
| Metamagia (3.5/PF) | entidad + efectos (Maximize Spell) | `effectiveSlotLevel: 6` (3 + 3) |
| Augment (Psionics) | poder + PP extra | `effectiveCost`, `augmentedEffects` |
| Ritual Casting (5e) | conjuro con tag `ritual` | `skipSlotConsumption: true` |

### Flujo general

```
1. Usuario inicia accion (preparar/usar entidad)
2. CGE invoca contexto apropiado
3. Contexto recibe: entidad + efectos contextuales aplicables
4. Usuario elige opciones (metamagia, augment, ritual)
5. Contexto calcula variables de salida
6. CGE usa resultado para consumir recursos (o no) y ejecutar
```

Los efectos contextuales vendran de dotes/features que definan `effectContext: 'spell-preparation'`, `'power-manifestation'`, etc.

**Estado**: No implementado. El sistema actual funciona sin estos modificadores.

---

## Integracion con Sistema de Resources

### Por que son sistemas separados

| Aspecto | Resources | CGE |
|---------|-----------|-----|
| Semantica | Cantidad con recarga | Gestor de entidades accionables |
| Storage | `currentValue` unico | `slotCurrentValues[]`, `boundPreparations{}`, etc. |
| Granularidad | Un recurso = un valor | Multiples valores por nivel |

### Punto de integracion: CustomVariable

Ambos sistemas convergen en CustomVariable:
1. CGE genera variables: `@wizard.slot.1.max`, `@wizard.slot.1.current`
2. Resources genera variables: `@resources.{id}.max`, `@resources.{id}.current`
3. Efectos externos pueden modificar ambos via bonuses

### Capacidades del CGE

1. **Definir recursos propios** (actual)
   - Cada track define `resource: SLOTS/POOL/NONE`
   - El CGE calcula y trackea en `CGEState`

2. **Usar recursos externos** (via `poolPath`)
   - Para casos como Factotum donde el pool es compartido

---

## Bonus por Atributo

Los bonus de slots por atributo (INT para Wizard, CHA para Sorcerer) se manejan via `bonusVariable`:

```typescript
resource: {
  type: 'SLOTS',
  table: { ... },
  bonusVariable: '@bonusSpells'  // Se expande a @bonusSpells.level.{n}
}
```

El sistema de variables calcula `@bonusSpells.level.3` basado en el atributo de lanzamiento.

**IMPORTANTE**: Esto NO es hardcodeo. El valor viene de variables expuestas del personaje, como cualquier otro bonus en el sistema.

---

## Validaciones

El sistema valida coherencia de configuracion:

| Condicion | Resultado |
|-----------|-----------|
| `preparation: BOUND` + `resource: !SLOTS` | ERROR - BOUND necesita slots |
| `resource: NONE` + `preparation: BOUND` | ERROR - No tiene sentido |
| `preparation.consumeOnUse: true` sin `recovery` | WARNING - Como recupera? |

```typescript
validateCGEConfig(config)  // Retorna array de errores
```

---

## Labels y Traduccion

Los labels son claves de traduccion, no textos directos:

```typescript
labels: {
  known: 'spellbook',        // Traducido como "Libro de conjuros"
  prepared: 'prepared_spells', // Traducido como "Conjuros preparados"
  action: 'cast'             // Traducido como "Lanzar"
}
```

Defaults por `entityType`:
- spell -> known: "known_spells", action: "cast"
- power -> known: "known_powers", action: "manifest"
- maneuver -> known: "known_maneuvers", action: "initiate"
- invocation -> known: "known_invocations", action: "invoke"

---

## Casos Especiales No Cubiertos

Estos casos requieren extensiones o sistemas separados:

| Caso | Problema | Posible solucion |
|------|----------|------------------|
| Crusader | Granted aleatorios cada round | Extension de LIST con randomizacion |
| Shadowcaster | Recursos evolucionan (slot->SLA->Su) | CGE dinamico por nivel |
| Truenamer | DC incrementante por uso | Sistema de coste acumulativo |
| Binder | Vincula vestiges, no "conoce" | Sistema propio de binding |
