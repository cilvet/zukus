# Wizard 5e - Spellcasting (D&D 5th Edition)

## Configuracion CGE

| Eje | Tipo | Detalle |
|-----|------|---------|
| known | `UNLIMITED` | Libro de conjuros sin limite |
| resource | `SLOTS` | Slots por nivel (tabla 5e) |
| preparation | `LIST` | `structure: GLOBAL`, `consumeOnUse: false` |

## Estado: PARCIALMENTE IMPLEMENTADO

- La configuracion CGE esta definida en `packages/core/testClasses/wizard5e/`
- Las operaciones de preparacion LIST estan **pendientes de implementar**

---

## Resumen Mecanico

El Wizard de 5e es una evolucion del Wizard 3.5 con preparacion mas flexible:
- Tiene spellbook como Wizard 3.5 (conocidos ilimitados)
- Prepara una lista GLOBAL de conjuros (no ligados a slots)
- Lanza cualquier conjuro preparado usando cualquier slot del nivel apropiado

---

## Diferencia Clave: Wizard 3.5 vs Wizard 5e

| Aspecto | Wizard 3.5 | Wizard 5e |
|---------|------------|-----------|
| Conocidos | Libro (UNLIMITED) | Libro (UNLIMITED) |
| Preparacion | `BOUND` (conjuro en slot) | `LIST GLOBAL` (lista unica) |
| Casting | Consume slot especifico preparado | Consume cualquier slot del nivel |
| Flexibilidad | Debes decidir cuantas veces cada conjuro | Cualquier combinacion de preparados |

### Ejemplo Practico

**Wizard 3.5 nivel 3** (2 slots nivel 1):
- Prepara: Slot 1-0 = Magic Missile, Slot 1-1 = Shield
- Solo puede lanzar: 1x Magic Missile, 1x Shield

**Wizard 5e nivel 3** (2 slots nivel 1, prepara 4 conjuros):
- Prepara lista: Magic Missile, Shield, Detect Magic, Mage Armor
- Puede lanzar: 2x Magic Missile, o 1x Shield + 1x Detect Magic, o cualquier combinacion

---

## Configuracion en Codigo

```typescript
const wizard5eCGEConfig: CGEConfig = {
  id: 'wizard-5e-spells',
  classId: 'wizard-5e',
  entityType: 'spell',
  levelPath: '@entity.level',  // En 5e, spell level es unico (no por clase)

  // Libro sin limite
  known: { type: 'UNLIMITED' },

  tracks: [
    {
      id: 'base',
      label: 'spell_slots',
      resource: {
        type: 'SLOTS',
        table: WIZARD_5E_SLOTS_TABLE,
        refresh: 'daily',
      },
      // LIST GLOBAL: lista unica de preparados (no por nivel)
      preparation: {
        type: 'LIST',
        structure: 'GLOBAL',
        maxFormula: { expression: '@class.wizard5e.level + @ability.intelligence.modifier' },
        consumeOnUse: false,
      },
    },
  ],

  variables: {
    classPrefix: 'wizard5e.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.wizard5e',
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

## Tabla de Slots 5e

```
Nivel | Cantrips  1  2  3  4  5  6  7  8  9
------+--------------------------------------
  1   |    3      2  -  -  -  -  -  -  -  -
  2   |    3      3  -  -  -  -  -  -  -  -
  3   |    3      4  2  -  -  -  -  -  -  -
  4   |    4      4  3  -  -  -  -  -  -  -
  5   |    4      4  3  2  -  -  -  -  -  -
  ...
 20   |    5      4  3  3  3  3  2  2  1  1
```

---

## Cantrips en 5e

Los cantrips (nivel 0) en 5e son diferentes:
- Se conocen (no necesitan libro)
- No gastan slots
- No se "preparan" - estan siempre disponibles

Esto podria modelarse con un track separado `at-will` o tratandolos como known especiales.

---

## Diferencia con Arcanist (Pathfinder)

Ambos usan `preparation: LIST` con `consumeOnUse: false`, pero:

| Aspecto | Wizard 5e | Arcanist |
|---------|-----------|----------|
| structure | `GLOBAL` | `PER_LEVEL` |
| Prepared | Lista unica total | Por nivel de conjuro |
| Casting | Slot de cualquier nivel >= spell level | Slot del mismo nivel |
| Upcasting | Explicito (slot mas alto) | No aplica |

**Wizard 5e**: Prepara 8 conjuros (de cualquier nivel). Puede lanzar cualquiera con cualquier slot apropiado.

**Arcanist**: Prepara 4 de nivel 1, 2 de nivel 2, 1 de nivel 3. Cada grupo separado.

---

## Flujo de Uso

### 1. Gestion del Libro (known)
- El jugador selecciona conjuros para su spellbook
- Como `known.type = 'UNLIMITED'`, no hay limite
- Al subir nivel: aprende 2 conjuros gratis del nivel accesible

### 2. Preparacion Diaria (preparation: LIST GLOBAL)
- Elige X conjuros (nivel + INT mod) de cualquier nivel del libro
- No importa cuantos de cada nivel (respetando niveles accesibles)
- Ejemplo nivel 5 con INT 18: prepara 9 conjuros

### 3. Lanzamiento
- Al lanzar, elige conjuro preparado + slot de nivel >= conjuro
- Puede usar slots mas altos para "upcasting"
- Se marca el slot usado (no el conjuro)

### 4. Descanso Largo
- `refresh: 'daily'` restaura todos los slots
- El jugador puede cambiar los conjuros preparados

---

## Estado Persistido (CGEState)

```typescript
{
  // Conjuros en el spellbook
  knownSelections: {
    "0": ["light", "prestidigitation", "fire-bolt"],
    "1": ["magic-missile", "shield", "mage-armor", "detect-magic"],
    "2": ["invisibility", "misty-step", "hold-person"],
    // ...
  },

  // Lista global de preparados (estructura plana)
  listPreparations: {
    "global": [
      "magic-missile",
      "shield",
      "mage-armor",
      "invisibility",
      "misty-step",
      // ... hasta maxFormula
    ]
  },

  // Slots usados (por nivel)
  slotCurrentValues: {
    "1": 1,  // 1 de 4 usado
    "2": 0,  // 2 de 3 disponibles
    "3": 2,  // Todos disponibles
  },
}
```

---

## Operaciones Pendientes

Para implementacion completa de LIST preparation con structure GLOBAL:

1. **UI de Seleccion Global**: Permitir elegir X conjuros totales del libro
2. **Validacion de Nivel Maximo**: Solo puede preparar conjuros de nivel que pueda lanzar
3. **Validacion de Cantidad**: Respetar `maxFormula` total
4. **Casting desde Lista Global**: Mostrar conjuros preparados filtrados por nivel <= slot elegido
5. **Persistencia**: Guardar en `CGEState.listPreparations` con clave "global"

---

## Arcane Recovery (caso especial)

El Wizard 5e tiene Arcane Recovery:
- Una vez por dia, durante short rest
- Recupera slots con nivel total <= mitad nivel Wizard
- No puede recuperar slots de nivel 6+

Esto es un recurso/habilidad separada, no parte de la preparacion CGE.

---

## Texto Original (PHB 5e)

> **Your Spellbook**: At 1st level, you have a spellbook containing six 1st-level wizard spells of your choice. Your spellbook is the repository of the wizard spells you know.
>
> **Preparing Spells**: You prepare the list of wizard spells that are available for you to cast. To do so, choose a number of wizard spells from your spellbook equal to your Intelligence modifier + your wizard level (minimum of one spell).
>
> **Casting Spells**: You can cast any spell you have prepared by expending a spell slot of the spell's level or higher.

---

## Archivos Relevantes

- **Clase**: `packages/core/testClasses/wizard5e/wizard5eClass.ts`
- **Features + CGE Config**: `packages/core/testClasses/wizard5e/wizard5eClassFeatures.ts`
- **Ejemplos CGE**: `packages/core/core/domain/cge/examples.ts` (wizard5eCGE)
- **Tipos CGE**: `packages/core/core/domain/cge/types.ts`
