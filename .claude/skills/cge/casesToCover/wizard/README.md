# Wizard - Spellcasting (D&D 3.5)

## Configuracion CGE

| Propiedad | Valor |
|-----------|-------|
| known | `UNLIMITED` |
| resource | `SLOTS` |
| preparation | `BOUND` |

## Estado: Implementado

La configuracion del Wizard esta implementada en:
- `/packages/core/srd/wizard/wizardClassFeatures.ts` - CGE config real
- `/packages/core/core/domain/character/calculation/__tests__/cge/fixtures.ts` - Fixtures de test

---

## Resumen Mecanico

El Wizard es el lanzador Vanciano clasico de D&D 3.5:

1. **Libro de conjuros** (`known: UNLIMITED`): El mago tiene un spellbook donde registra conjuros. No hay limite de cuantos puede aprender (puede copiar de scrolls, otros libros, etc.)

2. **Slots por nivel** (`resource: SLOTS`): Cada dia tiene un numero de slots determinado por su nivel de clase + bonus por Inteligencia

3. **Preparacion vinculada** (`preparation: BOUND`): Cada manana prepara un conjuro especifico en cada slot. Cuando lanza ese conjuro, gasta ese slot especifico.

---

## Configuracion Real

```typescript
const wizardCGEConfig: CGEConfig = {
  id: 'wizard-spells',
  classId: 'wizard',
  entityType: 'spell',
  levelPath: '@entity.levels.wizard',

  // Libro sin limite
  known: { type: 'UNLIMITED' },

  tracks: [
    {
      id: 'base',
      label: 'spell_slots',
      resource: {
        type: 'SLOTS',
        table: WIZARD_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      // Vancian: cada slot tiene un conjuro especifico asignado
      preparation: { type: 'BOUND' },
    },
  ],

  variables: {
    classPrefix: 'wizard.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.wizard',
  },

  labels: {
    known: 'spellbook',
    prepared: 'prepared_spells',
    slot: 'spell_slot',
    action: 'cast',
  },
};
```

---

## Tabla de Slots por Dia

La tabla define slots base (sin bonus por INT):

```
Nivel | 0  1  2  3  4  5  6  7  8  9
------+-----------------------------
  1   | 3  1  -  -  -  -  -  -  -  -
  2   | 4  2  -  -  -  -  -  -  -  -
  3   | 4  2  1  -  -  -  -  -  -  -
  4   | 4  3  2  -  -  -  -  -  -  -
  5   | 4  3  2  1  -  -  -  -  -  -
  ...
 20   | 4  4  4  4  4  4  4  4  4  4
```

---

## Flujo de Uso

### 1. Gestion del Libro (known)
- El jugador selecciona conjuros para su spellbook
- Como `known.type = 'UNLIMITED'`, no hay limite
- La UI muestra todos los conjuros accesibles (filtrados por lista "wizard")

### 2. Preparacion Diaria (preparation: BOUND)
- Cada slot se vincula a UN conjuro especifico
- Ejemplo nivel 3: 4 cantrips + 2 nivel-1 + 1 nivel-2
- El jugador asigna: slot-1-0 = Magic Missile, slot-1-1 = Shield, etc.

### 3. Lanzamiento
- Al lanzar, se marca el slot especifico como usado
- Si preparo Magic Missile 2 veces, puede lanzarlo 2 veces
- Los slots usados se registran en `usedBoundSlots`

### 4. Descanso
- `refresh: 'daily'` restaura todos los slots
- El jugador puede cambiar las preparaciones

---

## Estado Persistido (CGEState)

```typescript
{
  // Conjuros en el spellbook
  knownSelections: {
    "0": ["detect-magic", "light", "read-magic", "prestidigitation"],
    "1": ["magic-missile", "shield", "mage-armor", "sleep"],
    "2": ["invisibility", "mirror-image", "scorching-ray"],
    // ...
  },

  // Preparaciones vinculadas (slot -> conjuro)
  boundPreparations: {
    "base:0-0": "detect-magic",
    "base:0-1": "light",
    "base:1-0": "magic-missile",
    "base:1-1": "magic-missile",  // Mismo conjuro 2 veces
    "base:1-2": "shield",
    "base:2-0": "invisibility",
  },

  // Slots ya lanzados
  usedBoundSlots: {
    "base:1-0": true,  // Lanzo 1 Magic Missile
  },

  // Valor actual de slots (para UI rapida)
  slotCurrentValues: {
    "0": 4,  // Todos disponibles
    "1": 2,  // 1 de 3 usado
    "2": 1,  // Todos disponibles
  },
}
```

---

## Comparacion con Otras Clases

| Clase | known | resource | preparation | Diferencia clave |
|-------|-------|----------|-------------|------------------|
| **Wizard** | UNLIMITED | SLOTS | BOUND | Libro + prepara en slot |
| Cleric | (ninguno) | SLOTS | BOUND | Sin libro, toda la lista |
| Sorcerer | LIMITED_PER_ENTITY_LEVEL | SLOTS | NONE | Conocidos limitados, cast espontaneo |
| Wizard 5e | UNLIMITED | SLOTS | LIST (GLOBAL) | Prepara lista, cast flexible |
| Arcanist | UNLIMITED | SLOTS | LIST (PER_LEVEL) | Como 5e pero por nivel |

---

## Variante: Mago Especialista

El especialista tiene:
- +1 slot por nivel para conjuros de su escuela
- 1-2 escuelas prohibidas

Esto se podria modelar con un segundo track:

```typescript
tracks: [
  { id: 'base', ... },
  {
    id: 'specialist',
    label: 'specialist_slot',
    filter: {
      field: 'school',
      operator: '==',
      value: { expression: '@character.wizard.specialistSchool' },
    },
    resource: {
      type: 'SLOTS',
      table: SPECIALIST_BONUS_TABLE, // +1 por nivel accesible
      refresh: 'daily',
    },
    preparation: { type: 'BOUND' },
  },
]
```

---

## Texto Original (SRD)

> **Spellbook**: A wizard must study her spellbook each day to prepare her spells. She cannot prepare any spell not recorded in her spellbook, except for read magic, which all wizards can prepare from memory.
>
> **Spell Slots**: The Wizard table shows how many spells of each level a wizard can cast per day. In addition, she receives bonus spells per day if she has a high Intelligence score.
>
> **School Specialization**: A specialist wizard can prepare one additional spell of her specialty school per spell level each day. She also must choose two other schools as her opposition schools.
