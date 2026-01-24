# CGE - Character Generation Engine (Entity Management)

Sistema que gestiona como los personajes interactuan con entidades accionables (conjuros, maniobras, poderes, invocaciones, etc.).

## Principios de Diseno

### Contribuibilidad
Los CGE deben ser facilmente contribuibles por usuarios. El objetivo es que un usuario pueda:
1. Elegir un preset generico (PREPARED_VANCIAN, SPONTANEOUS_LIMITED, etc.)
2. Rellenar tablas de progresion (slots por nivel, conocidos por nivel)
3. El sistema genera automaticamente los recursos necesarios

El usuario NO deberia preocuparse por crear objetos Resource manualmente.

### Genericidad
El CGE es agnostico al tipo de entidad. Aunque hablamos de "conjuros", el sistema funciona con cualquier entidad que tenga el **addon de nivel de entidad** (maneuvers, powers, mysteries, etc.).

### Separacion de responsabilidades
- **CGE**: Define estructura, tablas, variables expuestas
- **Recursos**: Auto-generados por el CGE, gestionan current/max values
- **Efectos externos**: Modifican las variables expuestas (el CGE no define como)
- **Sistema de Contextos (futuro)**: Procesa modificadores como metamagia

---

## Anatomia de un CGE

```
CGETemplate {
  id: string                      // "wizard-spellcasting"
  targetEntityType: string        // "spell", "maneuver", "power"
  labels: CGELabels               // Textos para UI

  poolSource: PoolSourceConfig    // De donde vienen las entidades
  selectionStage: SelectionStage  // Cuando se eligen

  preparationTracks: Track[]      // Tracks de preparacion (puede haber varios)
  preparationContext?: Context    // Variables calculadas al preparar

  tables: Record<string, Table>   // Tablas de progresion
  displayVariables: DisplayVar[]  // Variables a mostrar en UI de gestion
}
```

---

## Pool Source: De donde vienen las entidades

Define como el personaje accede a las entidades del CGE.

| Tipo | Descripcion | Ejemplo | Genera recursos de "conocidos" |
|------|-------------|---------|-------------------------------|
| FULL_LIST_ACCESS | Accede a toda la lista | Cleric, Spirit Shaman | No |
| GROWING_COLLECTION | Coleccion que crece sin limite | Wizard (libro) | No |
| CURATED_SELECTION | Numero limitado por tabla | Sorcerer, Psion | Si (max por nivel) |

### Lista de conocidos: dos tipos fundamentales

**Con limite (CURATED_SELECTION)**:
- El personaje conoce X entidades por nivel segun tabla
- El CGE genera recursos: `@spells.known.level.{X}.max`
- Ejemplo: Sorcerer conoce 4 cantrips y 2 de nivel 1 a nivel 1

**Sin limite (GROWING_COLLECTION)**:
- El personaje tiene una coleccion que crece indefinidamente
- NO genera recursos de "max conocidos" (no tiene sentido)
- Almacenamiento: array de IDs en el personaje
- Ejemplo: Libro de conjuros del Wizard

---

## Selection Stage: Cuando se eligen las entidades

Define el momento de seleccion activa por parte del usuario.

| Tipo | Descripcion | Metamagia | Ejemplo |
|------|-------------|-----------|---------|
| NONE | Sin seleccion previa, elige al usar | Al usar | Sorcerer, Warlock |
| DAILY_SLOTS | Asigna entidad especifica a cada slot | Al preparar | Wizard, Cleric |
| DAILY_LIST | Elige lista diaria, usa espontaneo | Al elegir lista | Spirit Shaman |

---

## Preparation Tracks

Un CGE puede tener multiples "pistas" de preparacion independientes.

**Ejemplo: Cleric**
```
Track 1: "Slots de conjuro"
  - Filter: lista "cleric"
  - Resources: tabla estandar de slots

Track 2: "Slots de dominio"
  - Filter: conjuros de dominios elegidos
  - Resources: 1 slot por nivel (1-9)
```

Cada track tiene:
- `id` y `label` para UI
- `EntityFilter` generico (NO campos especificos como "excludeAlignmentDescriptors")
- `ResourceStrategy` que auto-genera sus recursos

---

## Variables y Recursos

### Variables genericas vs especificas

Los CGE de conjuros exponen variables en dos niveles:

**Genericas** (para efectos que afectan "cualquier caster"):
```
@spell.slots.level.3        // Afectable por "Feat: +1 slot nivel 3"
@spell.slots.divine.level.3 // Afectable por efectos divinos
@spell.slots.arcane.level.3 // Afectable por efectos arcanos
```

**Especificas** (para efectos de clase):
```
@wizard.spell.slots.level.3  // Solo wizard
@cleric.spell.slots.level.3  // Solo cleric
```

Un efecto que diga "+1 slot de nivel 3" modifica `@spell.slots.level.3`, beneficiando a cualquier clase de lanzador que el personaje tenga.

### castingClassLevel.{classId}

Variable crucial para clases de prestigio:
```
@castingClassLevel.wizard   // Nivel de lanzador de wizard
@castingClassLevel.cleric   // Nivel de lanzador de cleric
```

Una PrC como Mystic Theurge ofrece al usuario elegir que clase incrementar. El efecto aplica +1 a `@castingClassLevel.{claseElegida}`.

El naming consistente (`castingClassLevel.{id}`) permite crear selectores de entidades que filtren por "clases que exponen esta variable".

### Recursos auto-generados

El CGE define una **estrategia**, no recursos individuales:

```
ResourceStrategy: SLOTS_PER_ENTITY_LEVEL
  levelRange: [0, 9]
  tableRef: "slotsPerDay"

// Sistema genera automaticamente:
// - wizard-spell-slot-0 con max = tabla[nivel][0]
// - wizard-spell-slot-1 con max = tabla[nivel][1]
// - ...
```

Caso especial (5e Wizard): max preparados sin limite por nivel
```
ResourceStrategy: SINGLE_POOL
  maxFormula: "@class.wizard.level + @ability.intelligence.modifier"

// Sistema genera UN recurso:
// - wizard-prepared-spells-max
```

---

## Preparation Context

Define variables calculadas durante la preparacion. Usa el sistema de variables existente (baseSources).

```
preparationContext: {
  inputEntityType: "spell"

  // Variable de salida
  effectiveSlotLevel: {
    variableId: "effectiveSlotLevel"
    baseSources: [{
      type: "CUSTOM_VARIABLE"
      uniqueId: "effectiveSlotLevel"
      formula: { expression: "@entity.level" }
      bonusTypeId: "BASE"
      name: "Nivel base"
      createVariableForSource: true
    }]
  }
}
```

Los efectos metamagicos (definidos en dotes) modifican `effectiveSlotLevel` desde fuera.
El CGE solo define la variable base y su formula inicial.

---

## Interaccion del Usuario (UI)

### Flujo de preparacion con metamagia

1. Usuario abre pantalla de preparacion
2. Selecciona slot de nivel 3
3. Arrastra "Fireball" al slot
4. Sistema muestra efectos disponibles (dotes metamagicas del personaje)
5. Usuario marca "Maximize Spell"
6. Sistema calcula: `effectiveSlotLevel = 3 + 3 = 6`
7. Usuario confirma
8. Sistema verifica slot nivel 6 disponible y prepara

**Quien decide los efectos**: El usuario, via UI. El sistema de contextos (futuro) procesara los efectos seleccionados.

### Display Variables

El CGE define que variables mostrar en la UI de gestion:

```
displayVariables: [
  { variableId: "effectiveCasterLevel", label: "Nivel de lanzador" },
  { variableId: "spellDC.base", label: "CD base" },
  { variableId: "concentrationBonus", label: "Concentracion" }
]
```

Esto es contribuible: un usuario creando un CGE puede elegir que mostrar.

---

## Labels

Textos personalizables para UI:

```
labels: {
  known: "Libro de conjuros"        // o "Conjuros conocidos", "Poderes conocidos"
  prepared: "Conjuros preparados"   // o "Maniobras preparadas"
  slot: "Slot de conjuro"           // o "Power points"
  action: "Lanzar"                  // o "Manifestar", "Ejecutar"
}
```

---

## Tablas de Progresion

Las tablas viven en el CGE y son contribuibles:

```
tables: {
  slotsPerDay: {
    // nivel de clase -> slots por nivel de conjuro
    1:  [3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    2:  [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    3:  [4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
    // ...
  },
  knownPerLevel: {  // Solo para CURATED_SELECTION
    1:  [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    // ...
  }
}
```

El usuario rellena estas tablas en el formulario de edicion del CGE.

---

## Estructura de Carpetas

```
cge/
  README.md                 # Este archivo
  genericCGEs/              # CGEs genericos reutilizables
    README.md               # Descripcion de cada CGE generico
    # (futuro) types.ts     # Definiciones TypeScript
  casesToCover/             # Casos especificos por clase/sistema
    wizard/                 # RESUELTO
    sorcerer/               # RESUELTO
    cleric/                 # RESUELTO
    shadowcaster/           # NO RESUELTO - recursos que evolucionan
    ...
```

---

## Conceptos Futuros

### Listas de Entidades
Permitir al usuario trabajar con "listas" predefinidas de entidades.

Casos de uso:
- Anadir lista completa a conocidos (Dread Necromancer gana conjuros automaticos)
- Preparar lista favorita rapidamente
- Compartir listas entre usuarios

### Sistema de Acciones
Integracion con acciones para:
- Definir cuando se puede usar una entidad
- Gestionar action economy
- Aplicar efectos de uso (no solo preparacion)

### EntityFilter Dinamico
Soporte para variables del personaje en filtros:
- `domainId IN [@character.clericDomains]`
- `school = @character.specialistSchool`

### Timing de Metamagia
Diferente segun tipo de caster:
- Prepared: al preparar (slot superior, casting normal)
- Spontaneous: al lanzar (tiempo de casting aumenta)

Esto sera parte del sistema de contextos, no del CGE directamente.
