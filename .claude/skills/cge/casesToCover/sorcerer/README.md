# Sorcerer - Spellcasting

## Estado: Implementado

El Sorcerer es el arquetipo del lanzador espontaneo arcano en D&D 3.5.

---

## Resumen Mecanico

- Conoce un numero limitado de conjuros (fijo por nivel de clase)
- Puede lanzar cualquier conocido usando un slot disponible del nivel correspondiente
- No prepara, elige al momento de lanzar
- Charisma como atributo de lanzamiento

---

## Configuracion CGE

### Known

**Tipo**: `LIMITED_PER_ENTITY_LEVEL`

El Sorcerer conoce un numero fijo de conjuros por cada nivel de conjuro. Esta limitacion es la principal desventaja frente al Wizard.

```typescript
known: {
  type: 'LIMITED_PER_ENTITY_LEVEL',
  table: SORCERER_KNOWN_TABLE,  // [cantrips, nivel1, nivel2, ...]
}
```

**Tabla de conjuros conocidos** (PHB pagina 54):
```
Nivel | 0  1  2  3  4  5  6  7  8  9
------+-----------------------------
  1   | 4  2  -  -  -  -  -  -  -  -
  4   | 6  3  1  -  -  -  -  -  -  -
  7   | 7  5  3  2  -  -  -  -  -  -
 10   | 9  5  4  3  2  1  -  -  -  -
 20   | 9  5  5  4  4  4  3  3  3  3
```

### Resource

**Tipo**: `SLOTS`

Slots por nivel de conjuro, mas que el Wizard pero con menos flexibilidad de conocidos.

```typescript
resource: {
  type: 'SLOTS',
  table: SORCERER_SLOTS_TABLE,
  bonusVariable: '@bonusSpells',  // Bonus por CHA alto
  refresh: 'daily',
}
```

**Tabla de slots por dia** (PHB pagina 54):
```
Nivel | 0  1  2  3  4  5  6  7  8  9
------+-----------------------------
  1   | 5  3  -  -  -  -  -  -  -  -
  4   | 6  6  3  -  -  -  -  -  -  -
  7   | 6  6  6  4  -  -  -  -  -  -
 10   | 6  6  6  6  5  3  -  -  -  -
 20   | 6  6  6  6  6  6  6  6  6  6
```

### Preparation

**Tipo**: `NONE`

El Sorcerer es espontaneo: no prepara conjuros. Al lanzar, elige cualquiera de sus conocidos y gasta un slot del nivel correspondiente.

```typescript
preparation: { type: 'NONE' }
```

---

## Track Unico

El Sorcerer tiene un unico track de lanzamiento:

```typescript
tracks: [
  {
    id: 'base',
    label: 'spell_slots',
    resource: {
      type: 'SLOTS',
      table: SORCERER_SLOTS_TABLE,
      bonusVariable: '@bonusSpells',
      refresh: 'daily',
    },
    preparation: { type: 'NONE' },
  },
]
```

---

## Variables Expuestas

```typescript
variables: {
  classPrefix: 'sorcerer.spell',    // @sorcerer.spell.slot.1.max
  genericPrefix: 'spell',           // @spell.slot.1.max (compartida)
  casterLevelVar: 'castingClassLevel.sorcerer',
}
```

Variables generadas:
- `@sorcerer.spell.slot.{level}.max` - Slots maximos por nivel
- `@sorcerer.spell.slot.{level}.current` - Slots disponibles
- `@sorcerer.spell.known.{level}.max` - Conocidos maximos por nivel
- `@sorcerer.spell.known.{level}.current` - Conocidos seleccionados
- `@castingClassLevel.sorcerer` - Nivel de lanzador

---

## Estado del Personaje (CGEState)

```typescript
// Sorcerer nivel 7 con CHA 18 (+4 bonus)
{
  knownSelections: {
    "0": ["detect-magic", "light", "prestidigitation", ...],  // 7 cantrips
    "1": ["magic-missile", "shield", "mage-armor", ...],      // 5 de nivel 1
    "2": ["invisibility", "mirror-image", "scorching-ray"],   // 3 de nivel 2
    "3": ["fireball", "haste"],                               // 2 de nivel 3
  },
  slotCurrentValues: {
    "0": 6,  // 6 cantrips disponibles
    "1": 4,  // 4 de 8 slots nivel 1 restantes
    "2": 5,  // 5 de 7 slots nivel 2 restantes
    "3": 4,  // 4 de 5 slots nivel 3 restantes
  },
}
```

---

## Flujo de Uso

1. **Seleccion de conocidos** (al subir de nivel):
   - El jugador elige conjuros hasta llenar su limite por nivel
   - Puede cambiar 1 conjuro conocido al subir ciertos niveles

2. **Descanso**:
   - Se restauran todos los slots a su maximo

3. **Lanzamiento**:
   - Elige cualquier conjuro conocido
   - Gasta 1 slot del nivel del conjuro
   - Metamagia aumenta el nivel del slot (y tiempo de casting a full-round)

---

## Implementacion Real

### Clase y Feature

**Archivo**: `packages/core/srd/sorcerer/sorcererClass.ts`

```typescript
export const sorcererClass: StandardEntity = {
  id: 'sorcerer',
  entityType: 'class',
  levels: {
    '1': { providers: [grantFeature('sorcerer-spellcasting'), ...] },
    // ...
  },
}
```

**Archivo**: `packages/core/srd/sorcerer/sorcererClassFeatures.ts`

```typescript
const sorcererCGEConfig: CGEConfig = {
  id: 'sorcerer-spells',
  classId: 'sorcerer',
  entityType: 'spell',
  levelPath: '@entity.levels.sorcerer',
  known: { type: 'LIMITED_PER_ENTITY_LEVEL', table: SORCERER_KNOWN_TABLE },
  tracks: [{
    id: 'base',
    resource: { type: 'SLOTS', table: SORCERER_SLOTS_TABLE, ... },
    preparation: { type: 'NONE' },
  }],
  // ...
}

export const sorcererSpellcasting: StandardEntity = {
  id: 'sorcerer-spellcasting',
  entityType: 'classFeature',
  legacy_specialChanges: [{ type: 'CGE_DEFINITION', config: sorcererCGEConfig }],
}
```

### Ejemplo en CGE

**Archivo**: `packages/core/core/domain/cge/examples.ts`

```typescript
export const sorcererCGE: CGEConfig = {
  id: 'sorcerer-spells',
  classId: 'sorcerer',
  entityType: 'spell',
  levelPath: '@entity.levels.sorcerer',
  accessFilter: { field: 'lists', operator: 'contains', value: 'sorcerer' },
  known: { type: 'LIMITED_PER_ENTITY_LEVEL', table: SORCERER_KNOWN_TABLE },
  tracks: [{
    id: 'base',
    resource: { type: 'SLOTS', ... },
    preparation: { type: 'NONE' },
  }],
  // ...
}
```

---

## Diferencias con otras clases

| Aspecto | Sorcerer | Wizard | Cleric |
|---------|----------|--------|--------|
| known | LIMITED_PER_ENTITY_LEVEL | UNLIMITED | (sin known) |
| resource | SLOTS | SLOTS | SLOTS |
| preparation | NONE | BOUND | BOUND |
| Flexibilidad | Al lanzar | Al preparar | Al preparar |

---

## Texto Original (SRD)

> **Spells Known**: A sorcerer begins play knowing four 0-level spells and two 1st-level spells of your choice. At each new sorcerer level, she gains one or more new spells, as indicated on Table: Sorcerer Spells Known.
>
> **Spells per Day**: A sorcerer can cast any spell she knows without preparing it ahead of time. To learn or cast a spell, a sorcerer must have a Charisma score equal to at least 10 + the spell level.
