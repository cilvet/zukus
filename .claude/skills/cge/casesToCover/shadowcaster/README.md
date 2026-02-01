# Shadowcaster - Shadow Magic

## Estado: FUERA DEL MODELO

El Shadowcaster no puede modelarse con el sistema CGE actual.

---

## Resumen Mecanico

El Shadowcaster usa "mysteries" que evolucionan con el nivel:
- Mysteries empiezan como spells (usan slots)
- A cierto nivel, se convierten en spell-like abilities (2/day)
- A nivel mas alto, se convierten en supernatural abilities (at-will)

---

## Por que no encaja en CGE

El problema fundamental es que **el tipo de recurso evoluciona por entidad individual**.

En CGE, un track define un tipo de recurso (slots, usos diarios, puntos, etc.) y todas las entidades de ese track consumen ese recurso. El Shadowcaster rompe esta asuncion:

Un shadowcaster de nivel 10 podria tener simultaneamente:
- Mystery A: at-will (ya evoluciono completamente)
- Mystery B: 2/day (en fase SLA)
- Mystery C: consume slots (recien aprendido)

Cada mystery tiene su **propia progresion de recursos**, independiente de los demas. El CGE actual no tiene forma de expresar "esta entidad usa slots AHORA, pero usara usos diarios en 3 niveles".

---

## Informacion del Juego

### Fuente
Tome of Magic (D&D 3.5)

### Categorias de Mysteries
- **Apprentice**: Mysteries de nivel bajo
- **Initiate**: Mysteries de nivel medio
- **Master**: Mysteries de nivel alto

Cada categoria tiene "paths" (grupos tematicos de mysteries relacionados).

### Progresion de Evolucion
Cada mystery pasa por tres fases segun cuantas veces se ha usado o el nivel del caster:
1. **Spell**: Usa slots de misterio de su nivel
2. **Spell-Like Ability**: 2 usos por dia (recurso dedicado)
3. **Supernatural Ability**: A voluntad (sin limite)

### Texto Original

> **Mysteries**: A shadowcaster's primary abilities take the form of mysteries, which function similarly to spells. Unlike spells, mysteries do not require verbal, somatic, or material components unless noted in the mystery's description.
>
> **Evolving Mysteries**: As a shadowcaster gains levels, his mysteries become more powerful. When a mystery reaches a certain threshold, it transforms from a spell into a spell-like ability, and finally into a supernatural ability.

---

## Posibles Soluciones Futuras

### Recurso dinamico por entidad
Extender CGE para que el tipo de recurso de cada entidad pueda determinarse por una formula o condicion. Cada mystery tendria metadata indicando en que "fase" esta basado en el nivel del personaje.

### Sistema de fases en el track
Un track podria definir multiples "fases de recursos" y cada entidad indicaria en que fase esta. Las fases serian: slot -> daily_uses -> at_will.

### Sistema especial fuera de CGE
Dado que el Shadowcaster es unico en su progresion de recursos, podria justificarse un sistema dedicado que no intente encajar en la abstraccion generica.

---

## Complejidad Estimada

Alta. Requiere cambios fundamentales en como CGE asocia recursos a entidades, o un sistema paralelo especializado.
