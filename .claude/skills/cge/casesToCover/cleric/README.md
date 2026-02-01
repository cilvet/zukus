# Cleric - Spellcasting

## CGE Generico: PREPARED_VANCIAN (con tracks multiples)

## Estado: Resuelto

---

## Resumen Mecanico

El Cleric es un lanzador divino preparado con acceso a lista completa:
- Accede a toda la lista de cleric (no tiene libro)
- Prepara conjuros en slots cada dia
- Tiene slots adicionales de dominio (solo para conjuros de sus dominios)

---

## Pool Source

**Tipo**: FULL_LIST_ACCESS

- Accede a toda la lista de cleric
- Restricciones de alineamiento (no puede lanzar conjuros con descriptor opuesto)
- Spontaneous casting de cure/inflict

**Label**: "Lista de clerigo"

---

## Selection Stage

**Tipo**: DAILY_SLOTS

- Prepara conjuros especificos en slots cada manana
- Requiere 1 hora de oracion en momento especifico del dia

---

## Resources

**Estrategia**: SLOTS_PER_ENTITY_LEVEL (x2 tracks)

Track base:
- Genera: `@spell.slots.level.0` a `@spell.slots.level.9`
- Max value: tabla de progresion + bonus por WIS

Track dominios:
- Genera: `@spell.slots.domain.level.1` a `@spell.slots.domain.level.9`
- Max value: 1 por nivel (fijo)

---

## Preparation Tracks

### Track 1: Base
- Filter: lista "cleric", excluyendo descriptores de alineamiento prohibido
- Resources: tabla principal de slots

### Track 2: Dominios
- Filter: conjuros de los dominios elegidos (`domainId IN @character.clericDomains`)
- Resources: 1 slot por nivel (1-9)
- Label: "Conjuro de dominio"

---

## Variables Expuestas

- `@castingClassLevel.cleric`
- `@effectiveCasterLevel`
- `@character.clericDomains` - Array de domain IDs elegidos

---

## Preparation Context

```
inputEntityType: 'spell'
effectiveSlotLevel: {
  baseSources: [{ formula: '@entity.level' }]
}
```

---

## Spontaneous Casting (caso especial)

El Cleric puede convertir cualquier slot preparado (no de dominio) en:
- Cure wounds (si es bueno/neutral)
- Inflict wounds (si es malvado)

Esto se modelara como una accion especial, no como parte del CGE directamente.

---

## Texto Original (SRD)

> **Spells**: A cleric casts divine spells, which are drawn from the cleric spell list. However, his alignment may restrict him from casting certain spells opposed to his moral or ethical beliefs.
>
> **Domain Spells**: A cleric's deity influences his alignment, what magic he can perform, what values he upholds, and how others see him. A cleric chooses two domains from among those belonging to his deity. Each domain gives the cleric access to a domain spell at each spell level he can cast, from 1st on up, as well as a granted power.
>
> **Spontaneous Casting**: A good cleric (or a neutral cleric of a good deity) can channel stored spell energy into healing spells that the cleric did not prepare ahead of time.
