# CGE - Character Generation Engine (Entity Management)

Sistema que gestiona como los personajes interactuan con entidades accionables (conjuros, maniobras, poderes, invocaciones, etc.).

---

## Documentacion

| Archivo | Contenido |
|---------|-----------|
| [DESIGN.md](./DESIGN.md) | Explicacion detallada del diseno y todas las casuisticas |
| [types.ts](./types.ts) | Tipos TypeScript del sistema |
| [examples.ts](./examples.ts) | Ejemplos completos (Sorcerer, Cleric, Warblade, Psion, etc.) |
| [genericCGEs/](./genericCGEs/) | Descripcion de los CGEs genericos |
| [casesToCover/](./casesToCover/) | Analisis de casos especificos por clase |

---

## Resumen del Sistema

El CGE se basa en **tres ejes ortogonales**:

### 1. Conocidos (known)
Como se determina el pool de entidades accesibles.

| Tipo | Ejemplo |
|------|---------|
| _(sin definir)_ | Cleric (accede a toda la lista) |
| `UNLIMITED` | Wizard (libro sin limite) |
| `LIMITED_PER_ENTITY_LEVEL` | Sorcerer (X cantrips, Y nivel 1...) |
| `LIMITED_TOTAL` | Warblade, Psion (X totales) |

### 2. Recursos (resource)
Que se gasta al usar una entidad.

| Tipo | Ejemplo |
|------|---------|
| `NONE` | Warlock (at-will) |
| `SLOTS` | Wizard, Sorcerer (slots por nivel) |
| `POOL` | Psion (power points) |

### 3. Preparacion (preparation)
Que seleccion previa se requiere.

| Tipo | Ejemplo |
|------|---------|
| `NONE` | Sorcerer (usa directo) |
| `BOUND` | Wizard 3.5 (asigna a slots) |
| `LIST` GLOBAL | Wizard 5e (lista unica, slots flexibles) |
| `LIST` PER_LEVEL | Arcanist (por nivel, slots del mismo nivel) |

---

## Ejemplo Rapido

```typescript
// Sorcerer: slots por nivel, conocidos limitados por nivel de entidad, sin preparacion
const sorcererCGE: CGEConfig = {
  id: 'sorcerer-spells',
  classId: 'sorcerer',
  entityType: 'spell',
  levelPath: '@entity.levels.sorcerer',

  known: {
    type: 'LIMITED_PER_ENTITY_LEVEL',
    table: SORCERER_KNOWN_TABLE  // [cantrips, nivel1, nivel2, ...]
  },

  tracks: [{
    id: 'base',
    resource: {
      type: 'SLOTS',
      table: SORCERER_SLOTS_TABLE,
      bonusVariable: '@bonusSpells',
      refresh: 'daily'
    },
    preparation: { type: 'NONE' }
  }],

  variables: {
    classPrefix: 'sorcerer.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.sorcerer'
  }
}
```

---

## Cobertura de Clases

| Clase | known | resource | preparation | Estado |
|-------|-------|----------|-------------|--------|
| Warlock | `LIMITED_TOTAL` | `NONE` | `NONE` | Cubierto |
| Sorcerer | `LIMITED_PER_ENTITY_LEVEL` | `SLOTS` | `NONE` | Cubierto |
| Warmage | _(sin)_ | `SLOTS` | `NONE` | Cubierto |
| Wizard 3.5 | `UNLIMITED` | `SLOTS` | `BOUND` | Cubierto |
| Cleric 3.5 | _(sin)_ | `SLOTS` | `BOUND` | Cubierto (2 tracks) |
| Wizard 5e | `UNLIMITED` | `SLOTS` | `LIST` GLOBAL | Cubierto |
| Arcanist | `UNLIMITED` | `SLOTS` | `LIST` PER_LEVEL | Cubierto |
| Spirit Shaman | _(sin)_ | `SLOTS` | `LIST` PER_LEVEL | Cubierto |
| Psion | `LIMITED_TOTAL` | `POOL` | `NONE` | Cubierto |
| Warblade | `LIMITED_TOTAL` | `NONE` | `LIST` GLOBAL+consume | Cubierto |

Ver [casesToCover/](./casesToCover/) para analisis detallado de cada clase.

---

## Principios de Diseno

### Contribuibilidad
Los CGE deben ser facilmente contribuibles por usuarios:
1. Definir conocidos (tabla o ilimitado)
2. Definir recurso (slots, pool, o ninguno)
3. Definir preparacion (bound, list, o ninguna)
4. Rellenar tablas de progresion

El sistema genera automaticamente los recursos y variables.

### Genericidad
El CGE es agnostico al tipo de entidad. Funciona con cualquier entidad que tenga nivel: conjuros, poderes, maniobras, invocaciones, etc.

### Separacion de responsabilidades
- **CGE**: Define estructura, tablas, variables expuestas
- **Recursos**: Auto-generados por el CGE
- **Efectos externos**: Modifican las variables expuestas
- **Sistema de Contextos (futuro)**: Procesa modificadores como metamagia

---

## Variables Expuestas

### Especificas de clase
```
@wizard.spell.slot.1.max
@sorcerer.spell.slot.3.current
@psion.power.pool.max
```

### Genericas (para efectos cross-class)
```
@spell.slot.1.max    // Afectable por "+1 slot nivel 1"
@power.pool.max
```

### Nivel de lanzador (para PrCs)
```
@castingClassLevel.wizard
@castingClassLevel.cleric
@manifesterLevel.psion
@initiatorLevel.warblade
```

---

## Casos No Cubiertos

Estos casos requieren extensiones o sistemas separados:

| Caso | Problema |
|------|----------|
| Crusader | Granted aleatorios cada round |
| Shadowcaster | Recursos evolucionan con nivel |
| Truenamer | DC incrementante por uso |
| Binder | Vincula vestiges, no "conoce" |
| Metamagia | Sistema de contextos (futuro) |

---

## Conceptos Futuros

- **Listas de Entidades**: Listas predefinidas para anadir a conocidos o preparar rapidamente
- **Sistema de Contextos**: Modificadores como metamagia, augment psionico
- **EntityFilter Dinamico**: Filtros con variables del personaje
