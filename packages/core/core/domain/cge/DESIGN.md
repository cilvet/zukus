# CGE - Diseno del Sistema

Este documento explica las decisiones de diseno del sistema CGE y como cubre las diferentes casuisticas de gestion de entidades.

---

## Filosofia

El CGE se basa en **tres ejes ortogonales** que combinados cubren la mayoria de sistemas de magia/habilidades:

1. **Conocidos** - Como se determina el pool de entidades accesibles
2. **Recursos** - Que se gasta al usar una entidad
3. **Preparacion** - Que seleccion previa se requiere antes de usar

---

## Eje 1: Conocidos (KnownConfig)

Define como el personaje accede a las entidades.

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| _(sin definir)_ | Accede a toda la lista filtrada | Cleric, Druid |
| `UNLIMITED` | Coleccion personal sin limite | Wizard (libro) |
| `LIMITED_PER_ENTITY_LEVEL` | X cantrips, Y nivel 1, Z nivel 2... | Sorcerer, Bard |
| `LIMITED_TOTAL` | X totales de cualquier nivel | Warblade, Psion, Warlock |

### Casos cubiertos

- **Cleric/Druid**: No tienen `known`, acceden a toda la lista cleric/druid
- **Wizard**: `UNLIMITED`, pueden anadir infinitos conjuros al libro
- **Sorcerer/Bard**: `LIMITED_PER_ENTITY_LEVEL`, conocen X cantrips, Y nivel 1, etc.
- **Psion/Warblade/Warlock**: `LIMITED_TOTAL`, conocen X totales de cualquier nivel
- **Warmage/Beguiler**: No tienen `known`, conocen toda su lista automaticamente

---

## Eje 2: Recursos (ResourceConfig)

Define que se gasta al usar una entidad.

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `NONE` | Nada, uso ilimitado | Warlock |
| `SLOTS` | Slot del nivel de la entidad | Wizard, Sorcerer |
| `POOL` | Puntos de un pool unico | Psion |

### Configuracion adicional

**Para SLOTS:**
- `table`: Tabla nivel clase → slots por nivel entidad
- `bonusVariable`: Variable de bonus (ej: `@bonusSpells` para bonus por atributo)
- `refresh`: Cuando se recuperan (`daily`, `encounter`, `manual`)

**Para POOL:**
- `maxFormula`: Formula para calcular maximo
- `costPath`: Como calcular coste (default: nivel de entidad)
- `refresh`: Cuando se recupera

### Casos cubiertos

- **Warlock**: `NONE` - invocaciones at-will
- **Sorcerer**: `SLOTS` - 6 slots nivel 1, 4 slots nivel 2, etc.
- **Psion**: `POOL` - 19 power points a nivel 5

---

## Eje 3: Preparacion (PreparationConfig)

Define que seleccion previa se requiere.

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `NONE` | Usa directo de conocidos | Sorcerer, Warlock, Psion |
| `BOUND` | Prepara asignando a slots | Wizard 3.5, Cleric |
| `LIST` | Prepara lista independiente | Arcanist, Tome of Battle |

### Configuracion adicional

**Para LIST:**
- `structure`: Como se organiza la preparacion
  - `GLOBAL`: Lista unica sin separar por nivel (Wizard 5e)
  - `PER_LEVEL`: Preparados separados por nivel de entidad (Arcanist)
- `maxFormula`: Si GLOBAL, cuantos puede preparar en total
- `maxPerLevel`: Si PER_LEVEL, tabla de preparados por nivel
- `consumeOnUse`: Si usar gasta la preparacion (ToB=true, Arcanist=false)
- `recovery`: Como recuperar si consumeOnUse=true

### Casos cubiertos

- **Sorcerer**: `NONE` - usa cualquier conocido con un slot
- **Wizard 3.5**: `BOUND` - asigna Fireball a slot nivel 3
- **Arcanist**: `LIST` + consumeOnUse=false - prepara 5 conjuros, usa slots genericos
- **Warblade**: `LIST` + consumeOnUse=true - cada maniobra readied se gasta

---

## Tracks Multiples

Un CGE puede tener multiples tracks para casos como el Cleric:

```
Cleric
├── Track "base": slots normales, lista cleric
└── Track "domain": 1 slot/nivel, solo conjuros de dominios
```

Cada track tiene su propia configuracion de `resource` y `preparation`, pero comparten `known` y `accessFilter`.

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

### Diferencia clave: LIST GLOBAL vs LIST PER_LEVEL

**GLOBAL (Wizard 5e, Spirit Shaman, ToB):**
- Prepara una lista unica de N entidades totales (de cualquier nivel)
- Cualquier preparado puede usar cualquier slot/uso del nivel adecuado
- Flexibilidad total en la eleccion

**PER_LEVEL (Arcanist):**
- Prepara X de nivel 1, Y de nivel 2, etc.
- Solo puedes usar preparados de nivel N con slots de nivel N
- Flexibilidad solo dentro de cada nivel

---

## Variables Expuestas

El CGE expone variables para que otros sistemas puedan interactuar:

### Variables especificas de clase
```
@wizard.spell.slot.1.max
@wizard.spell.slot.1.current
@sorcerer.spell.slot.3.max
```

### Variables genericas (para efectos cross-class)
```
@spell.slot.1.max    // Suma de todos los .slot.1.max de casters
@power.pool.max      // Para sistemas psionicos
```

### Variable de nivel de lanzador
```
@castingClassLevel.wizard
@castingClassLevel.cleric
@manifesterLevel.psion
@initiatorLevel.warblade
```

Esto permite que clases de prestigio modifiquen el nivel de lanzador de una clase base.

---

## Validaciones

El sistema valida coherencia:

| Condicion | Resultado |
|-----------|-----------|
| `preparation: BOUND` + `resource: !SLOTS` | ERROR - BOUND necesita slots |
| `resource: NONE` + `preparation: BOUND` | ERROR - No tiene sentido |
| `preparation.consumeOnUse: true` sin `recovery` | WARNING - Como recupera? |

---

## Casos Especiales No Cubiertos

Estos casos requieren extensiones o sistemas separados:

| Caso | Problema | Posible solucion |
|------|----------|------------------|
| Crusader | Granted aleatorios cada round | Extension de LIST con randomizacion |
| Shadowcaster | Recursos evolucionan (slot→SLA→Su) | CGE dinamico por nivel |
| Truenamer | DC incrementante por uso | Sistema de coste acumulativo |
| Binder | Vincula vestiges, no "conoce" | Sistema propio de binding |
| Metamagia | Modifica entidad al preparar/usar | Sistema de contextos (futuro) |
| Augment (Psion) | Gastar mas puntos para mas efecto | Sistema de contextos (futuro) |

---

## Flujo de Uso

### Sorcerer (preparation: NONE)
```
1. Personaje tiene conjuros conocidos
2. Elige uno para lanzar
3. Sistema verifica: tiene slot del nivel?
4. Si: gasta slot, lanza
```

### Wizard 3.5 (preparation: BOUND)
```
1. Al descansar, elige que preparar en cada slot
2. Asigna Fireball a slot nivel 3
3. Durante el dia, puede lanzar Fireball (una vez)
4. Al lanzar, el slot se consume
```

### Arcanist (preparation: LIST, consumeOnUse: false)
```
1. Al descansar, elige lista de preparados (5 conjuros)
2. Durante el dia, elige cual de los 5 lanzar
3. Gasta un slot del nivel correspondiente
4. La lista de preparados NO cambia
```

### Warblade (preparation: LIST, consumeOnUse: true)
```
1. Al descansar, elige maniobras readied (5 de 10 conocidas)
2. En combate, inicia una maniobra
3. Esa maniobra se "gasta" (ya no puede usarla)
4. Usa accion de recuperacion para recuperar todas
```

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

Esto permite que efectos externos modifiquen los bonus sin tocar el CGE.

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
- spell → known: "known_spells", action: "cast"
- power → known: "known_powers", action: "manifest"
- maneuver → known: "known_maneuvers", action: "initiate"
- invocation → known: "known_invocations", action: "invoke"
