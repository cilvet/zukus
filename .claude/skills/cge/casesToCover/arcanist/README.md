# Arcanist - Spellcasting (Pathfinder)

## CGE Generico: PREPARED_FLEXIBLE (nuevo, por disenar)

## Estado: NO RESUELTO

---

## Resumen Mecanico

El Arcanist combina elementos de Wizard y Sorcerer:
- Tiene spellbook como Wizard
- Prepara lista diaria (no slots individuales)
- Lanza espontaneamente de la lista preparada como Sorcerer

---

## Diferencia Clave

| Aspecto | Wizard | Sorcerer | Arcanist |
|---------|--------|----------|----------|
| Fuente | Libro | Conocidos fijos | Libro |
| Preparacion | Slot especifico | Ninguna | Lista diaria |
| Casting | Consume slot preparado | Consume slot flexible | Consume slot flexible |

El Arcanist prepara "que conjuros tendre disponibles hoy" pero no "cuantas veces cada uno".

---

## Pool Source

**Tipo**: GROWING_COLLECTION (libro)

- Spellbook como Wizard
- Sin limite de conjuros en el libro

---

## Selection Stage

**Tipo**: DAILY_LIST (pero diferente a Spirit Shaman)

- Elige X conjuros del libro cada dia
- Estos son sus "conjuros preparados"
- No asigna a slots especificos

---

## Resources

**Estrategia**: SLOTS_PER_ENTITY_LEVEL

- Slots por nivel como Sorcerer
- Se consumen al lanzar, no al preparar
- El mismo conjuro preparado puede lanzarse multiples veces si hay slots

---

## Problema de Modelado

Es un hibrido entre:
- PREPARED_VANCIAN (tiene libro, prepara cada dia)
- SPONTANEOUS_DAILY_LIST (prepara lista, no slots)

Pero con recursos como SPONTANEOUS_KNOWN_LIMITED.

¿Es un nuevo CGE generico o una variacion de uno existente?

---

## Arcane Reservoir (caso especial)

Ademas de slots, tiene un pool de puntos (Arcane Reservoir):
- Se usa para activar exploits
- Algunas exploits mejoran conjuros
- Pool separado de los spell slots

---

## Texto Original (Pathfinder ACG)

> **Spellcasting**: An arcanist casts arcane spells drawn from the sorcerer/wizard spell list. An arcanist must prepare her spells ahead of time, but unlike a wizard, her spells are not expended when they're cast. Instead, she can cast any spell that she has prepared by consuming a spell slot of the appropriate level.
>
> **Arcanist Spellbook**: An arcanist must study her spellbook each day to prepare her spells. She can't prepare any spell not recorded in her spellbook.
