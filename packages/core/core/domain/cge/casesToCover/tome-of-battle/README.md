# Tome of Battle - Martial Adepts

## CGE Generico: MANEUVER_READIED

## Estado: Resuelto (parcialmente - Crusader tiene caso especial)

---

## Resumen Mecanico

Las clases de Tome of Battle usan maniobras:
- Conocen maniobras limitadas
- Preparan (ready) un subset cada dia
- Las readied se "gastan" y se recuperan con acciones

---

## Pool Source

**Tipo**: CURATED_SELECTION

- Conoce maniobras limitadas por tabla
- Maniobras tienen nivel (1-9)
- Restriccion por disciplina segun clase

**Label**: "Maniobras conocidas"

---

## Selection Stage

**Tipo**: DAILY_LIST

- Cada dia, elige cuales de las conocidas estan "readied"
- No hay metamagia equivalente (no hay contexto de preparacion)

**Label**: "Maniobras preparadas"

---

## Resources

**Estrategia**: PER_PREPARED_ENTITY

- Cada maniobra readied tiene estado: available/expended
- Al usar una maniobra, pasa a expended
- Recovery mediante accion especifica

---

## Preparation Tracks

Track unico por clase.

---

## Variables Expuestas

- `@maneuvers.known.max`
- `@maneuvers.readied.max`
- `@initiatorLevel.{classId}` (equivalente a casterLevel)

---

## Recovery (caso especial)

Cada clase recupera maniobras de forma diferente:

### Crusader
- Al inicio de cada encuentro, solo algunas readied estan "granted" (aleatorio)
- Cada round, una nueva se vuelve granted
- Al final del encuentro, todas se recuperan

### Swordsage
- Full-round action: recupera una maniobra
- Puede meditar para recuperar todas (requiere condiciones)

### Warblade
- Swift action + melee attack: recupera todas las expended

Esto se modelara en el sistema de acciones, no en el CGE.

---

## Preparation Context

No tiene contexto de preparacion (no hay metamagia para maniobras).

---

## Stances (caso especial)

Ademas de maniobras, conocen "stances":
- Se activan como swift action
- Permanecen activas indefinidamente
- Solo una stance activa a la vez

Las stances son un concepto separado, posiblemente otro CGE o un sistema de "modos activos".

---

## Texto Original (Tome of Battle)

> **Maneuvers Known**: You begin your career with knowledge of three martial maneuvers. The disciplines available to you depend on your class.
>
> **Maneuvers Readied**: You ready a subset of your maneuvers known for each encounter. You can change your selection of readied maneuvers by spending 5 minutes practicing.
>
> **Recovering Maneuvers**: You must recover expended maneuvers before you can use them again. The method of recovery varies by class.
