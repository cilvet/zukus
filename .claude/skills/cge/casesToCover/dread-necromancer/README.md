# Dread Necromancer - Spellcasting

## Patron CGE: Sorcerer-like (espontaneo con conocidos limitados)

## Estado: Soportado por el sistema (sin implementacion especifica)

El sistema CGE actual soporta completamente este patron. No existe una implementacion
`dreadNecromancerCGE` en `examples.ts`, pero seria identico al `sorcererCGE` con
su propia tabla de conocidos y slots.

---

## Resumen Mecanico

El Dread Necromancer es un lanzador espontaneo con lista fija que crece:
- Conoce conjuros automaticamente al subir de nivel
- Puede anadir mas con "Advanced Learning"
- Lanza espontaneamente de conocidos

---

## Configuracion CGE

### known

**Tipo**: `LIMITED_PER_ENTITY_LEVEL`

Similar al Sorcerer: tabla de conocidos por nivel de clase y nivel de conjuro.
La diferencia es que los conocidos vienen automaticamente (no los elige el jugador).

```typescript
known: {
  type: 'LIMITED_PER_ENTITY_LEVEL',
  table: DREAD_NECROMANCER_KNOWN_TABLE, // Conocidos por nivel
}
```

**Nota sobre conocidos automaticos**:
La mayoria de los conocidos vienen automaticamente por nivel (lista fija del manual).
Esto se podria modelar como:
- Una "lista de conocidos base" que se anade al personaje segun nivel
- El campo `knownSelections` del CGEState podria pre-popularse automaticamente

**Advanced Learning** permite elegir conjuros adicionales de la lista de wizard/cleric
que tengan descriptor necromancy.

---

### resource

**Tipo**: `SLOTS`

Slots por nivel basados en tabla de progresion, con bonus por CHA.

```typescript
resource: {
  type: 'SLOTS',
  table: DREAD_NECROMANCER_SLOTS_TABLE,
  bonusVariable: '@bonusSpells',
  refresh: 'daily',
}
```

---

### preparation

**Tipo**: `NONE` (espontaneo)

No prepara conjuros. Lanza cualquier conocido con slot disponible.

```typescript
preparation: { type: 'NONE' }
```

---

## Configuracion CGE Completa (ejemplo)

```typescript
const dreadNecromancerCGE: CGEConfig = {
  id: 'dread-necromancer-spells',
  classId: 'dread-necromancer',
  entityType: 'spell',
  levelPath: '@entity.levels.dreadNecromancer',

  accessFilter: {
    field: 'lists',
    operator: 'contains',
    value: 'dread-necromancer',
  },

  known: {
    type: 'LIMITED_PER_ENTITY_LEVEL',
    table: DREAD_NECROMANCER_KNOWN_TABLE,
  },

  tracks: [
    {
      id: 'base',
      resource: {
        type: 'SLOTS',
        table: DREAD_NECROMANCER_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'dreadNecromancer.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.dreadNecromancer',
  },

  labels: {
    known: 'known_spells',
    action: 'cast',
  },
}
```

---

## Casos Especiales (fuera de CGE)

### Charnel Touch

Habilidad at-will de dano/curacion a undead. No es un conjuro, es class feature.

### Undead Minions

A nivel 8+, puede controlar undead. Esto es un sistema separado del CGE.

---

## Variables Expuestas

- `@castingClassLevel.dreadNecromancer`
- `@dreadNecromancer.spell.slot.{level}.max`
- `@dreadNecromancer.spell.slot.{level}.current`

---

## Texto Original (Heroes of Horror)

> **Spells Known**: A dread necromancer automatically knows all the spells on the dread necromancer spell list. She can cast any spell she knows without preparing it ahead of time.
>
> **Advanced Learning**: At 2nd level, and every two levels thereafter, a dread necromancer can add a spell from the sorcerer/wizard or cleric spell list to her spells known, provided the spell has the necromancy descriptor.
