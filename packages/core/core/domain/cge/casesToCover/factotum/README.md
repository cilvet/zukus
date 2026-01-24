# Factotum - Inspiration

## CGE Generico: Pendiente de disenar

## Estado: NO RESUELTO

---

## Resumen Mecanico

El Factotum usa Inspiration Points (per-encounter) para alimentar multiples habilidades:
- Arcane Dilettante: imita spells de wizard/sorcerer
- Otras habilidades que cuestan inspiration points

---

## Pool Source (para Arcane Dilettante)

**Tipo**: FULL_LIST_ACCESS (peculiar)

- Accede a toda la lista de wizard/sorcerer
- Cada dia, puede preparar un numero limitado de "spells conocidos temporales"
- Estos son los unicos que puede lanzar ese dia

Esto es similar a Spirit Shaman pero con lista arcana.

---

## Selection Stage

**Tipo**: DAILY_LIST

- Elige X conjuros de la lista wizard/sorcerer cada dia
- Solo puede lanzar esos durante el dia

---

## Resources

**Estrategia**: UNIFIED_POOL (per-encounter)

- Inspiration Points: pool unico
- Refresh: per-encounter (no diario)
- Lanzar un spell cuesta inspiration points segun nivel

**Tabla de coste**:
```
Nivel spell | Coste IP
------------+---------
    0       | 1
    1       | 1
    2       | 2
    3       | 3
    ...
```

---

## Problema Principal

El recurso es PER-ENCOUNTER, no diario.
Ademas, el mismo pool de Inspiration Points se usa para:
- Arcane Dilettante (spells)
- Cunning Insight (bonus a rolls)
- Cunning Surge (accion extra)
- etc.

¿Deberia el CGE modelar solo Arcane Dilettante, o todo el sistema de Inspiration?

---

## Arcane Dilettante Detalle

> At 2nd level, you can use your inspiration to draw on the spells of the wizard and sorcerer. Once per day per three factotum levels, you can prepare a spell from the sorcerer/wizard spell list.

---

## Texto Original (Dungeonscape)

> **Inspiration**: A factotum's abilities are powered by inspiration points. You have a number of inspiration points per encounter equal to your class level + your Intelligence modifier.
>
> **Arcane Dilettante**: You can mimic the spellcasting abilities of a sorcerer or wizard. Once per day per three class levels, you can prepare a spell from the sorcerer/wizard spell list.
