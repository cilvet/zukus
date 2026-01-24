# Wizard - Spellcasting

## CGE Generico: PREPARED_VANCIAN

## Estado: Resuelto

---

## Resumen Mecanico

El Wizard es el lanzador Vanciano clasico:
- Libro de conjuros con conjuros aprendidos (sin limite)
- Prepara conjuros especificos en slots cada dia
- Cada slot preparado se consume al lanzar

---

## Pool Source

**Tipo**: Libro de conjuros (GROWING_COLLECTION)

- Empieza con conjuros iniciales
- Puede anadir conjuros copiandolos de scrolls/otros libros
- Sin limite maximo de conjuros en el libro
- NO genera recursos de "max conocidos por nivel"

**Label**: "Libro de conjuros"

---

## Selection Stage

**Tipo**: DAILY_SLOTS

- Cada manana, prepara conjuros especificos en slots
- Cada slot contiene exactamente un conjuro
- Metamagia se aplica al preparar (ocupa slot superior)

**Label**: "Conjuros preparados"

---

## Resources

**Estrategia**: SLOTS_PER_ENTITY_LEVEL

- Genera: `@spell.slots.level.0` a `@spell.slots.level.9`
- Max value: tabla de progresion + bonus por INT
- Refresh: daily

**Tabla de slots por dia** (nivel de clase x nivel de conjuro):
```
Nivel | 0  1  2  3  4  5  6  7  8  9
------+-----------------------------
  1   | 3  1  -  -  -  -  -  -  -  -
  2   | 4  2  -  -  -  -  -  -  -  -
  3   | 4  2  1  -  -  -  -  -  -  -
  4   | 4  3  2  -  -  -  -  -  -  -
  5   | 4  3  2  1  -  -  -  -  -  -
  ...
```

---

## Preparation Tracks

### Track 1: Base
- Filter: lista "wizard"
- Resources: tabla principal

### Track 2: Especialista (opcional)
- Filter: lista "wizard" AND school = @character.specialistSchool
- Resources: +1 slot por nivel accesible
- Solo si el wizard es especialista

---

## Variables Expuestas

- `@castingClassLevel.wizard` - Nivel de clase wizard (para PrCs)
- `@effectiveCasterLevel` - Nivel de lanzador efectivo (para UI)

---

## Preparation Context

```
inputEntityType: 'spell'
effectiveSlotLevel: {
  baseSources: [{ formula: '@entity.level' }]
}
```

Los efectos metamagicos modifican `effectiveSlotLevel`.

---

## Texto Original (SRD)

> **Spellbook**: A wizard must study her spellbook each day to prepare her spells. She cannot prepare any spell not recorded in her spellbook, except for read magic, which all wizards can prepare from memory.
>
> **Spell Slots**: The Wizard table shows how many spells of each level a wizard can cast per day. In addition, she receives bonus spells per day if she has a high Intelligence score.
>
> **School Specialization**: A specialist wizard can prepare one additional spell of her specialty school per spell level each day. She also must choose two other schools as her opposition schools.
