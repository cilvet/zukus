# Dread Necromancer - Spellcasting

## CGE Generico: SPONTANEOUS_KNOWN_LIMITED (con conocidos automaticos)

## Estado: Resuelto (con nota sobre conocidos automaticos)

---

## Resumen Mecanico

El Dread Necromancer es un lanzador espontaneo con lista fija que crece:
- Conoce conjuros automaticamente al subir de nivel
- Puede anadir mas con "Advanced Learning"
- Lanza espontaneamente de conocidos

---

## Pool Source

**Tipo**: CURATED_SELECTION (con adiciones automaticas)

- Gana conjuros especificos automaticamente por nivel (lista fija)
- Puede elegir conjuros adicionales con Advanced Learning
- Sin libro

**Conocidos automaticos por nivel**:
```
Nivel 1: Bane, Cause Fear, Chill Touch, Detect Magic, Detect Undead, Doom, Inflict Minor Wounds, Ray of Enfeeblement, Undetectable Alignment
Nivel 2: +Blindness/Deafness, Command Undead, Darkness, Death Knell, False Life, Ghoul Touch, Inflict Light Wounds, Scare, Spectral Hand, Summon Swarm
...
```

**Label**: "Conjuros conocidos"

---

## Selection Stage

**Tipo**: NONE (espontaneo)

- No prepara conjuros
- Lanza cualquier conocido con slot disponible

---

## Resources

**Estrategia**: SLOTS_PER_ENTITY_LEVEL

- Slots por nivel basados en tabla de progresion
- Bonus por CHA

---

## Conocidos Automaticos (caso especial)

La mayoria de los conocidos vienen automaticamente por nivel.
Esto se podria modelar como:
- Una "lista de conocidos base" que se anade al personaje segun nivel
- El concepto de "Listas de Entidades" mencionado en el README principal

**Advanced Learning** permite elegir conjuros adicionales de la lista de wizard/cleric que tengan descriptor necromancy.

---

## Charnel Touch (caso especial)

Habilidad at-will de dano/curacion a undead. No es un conjuro, es class feature.

---

## Undead Minions (caso especial)

A nivel 8+, puede controlar undead. Esto es un sistema separado del CGE.

---

## Preparation Tracks

Track unico (conocidos).

---

## Variables Expuestas

- `@castingClassLevel.dreadNecromancer`
- `@effectiveCasterLevel`

---

## Texto Original (Heroes of Horror)

> **Spells Known**: A dread necromancer automatically knows all the spells on the dread necromancer spell list. She can cast any spell she knows without preparing it ahead of time.
>
> **Advanced Learning**: At 2nd level, and every two levels thereafter, a dread necromancer can add a spell from the sorcerer/wizard or cleric spell list to her spells known, provided the spell has the necromancy descriptor.
