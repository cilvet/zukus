# CGEs Genericos

Este documento describe los CGEs genericos identificados que cubren la mayoria de casos de lanzamiento de conjuros y sistemas similares.

## 1. PREPARED_VANCIAN

**Descripcion**: Preparacion diaria de entidades en slots especificos. Cada slot contiene una entidad preparada que se consume al usarla.

**Caracteristicas**:
- Pool Source: Variable (libro, lista completa, seleccion curada)
- Selection Stage: DAILY_SLOTS
- Resources: Slots por nivel de entidad
- Metamagia: Se aplica al preparar (ocupa slot de nivel superior)

**Clases que lo usan**:
- Wizard (pool: libro de conjuros)
- Cleric (pool: lista completa, track adicional para dominios)
- Druid (pool: lista completa)
- Paladin/Ranger (pool: lista completa, niveles limitados)

---

## 2. SPONTANEOUS_KNOWN_LIMITED

**Descripcion**: Conoce un numero limitado de entidades permanentemente. Puede usar cualquier conocida gastando un slot del nivel apropiado.

**Caracteristicas**:
- Pool Source: CURATED_SELECTION (max conocidos por nivel, tabla de progresion)
- Selection Stage: NONE (elige al lanzar de entre los conocidos)
- Resources: Slots por nivel de entidad
- Metamagia: Se aplica al lanzar (aumenta tiempo de casting)

**Clases que lo usan**:
- Sorcerer
- Bard
- Favored Soul

---

## 3. SPONTANEOUS_DAILY_LIST

**Descripcion**: Accede a lista completa pero elige una sublista cada dia. Luego lanza espontaneamente de esa sublista.

**Caracteristicas**:
- Pool Source: FULL_LIST_ACCESS
- Selection Stage: DAILY_LIST (elige X entidades por nivel cada dia)
- Resources: Slots por nivel (separados de la lista elegida)
- Metamagia: Se aplica al elegir la lista diaria

**Clases que lo usan**:
- Spirit Shaman

---

## 4. POWER_POOL

**Descripcion**: Pool unico de puntos que se gastan para usar entidades. Las entidades pueden "augmentarse" gastando mas puntos.

**Caracteristicas**:
- Pool Source: CURATED_SELECTION (poderes conocidos limitados)
- Selection Stage: NONE
- Resources: Pool unico (no por nivel)
- Augmentacion: Gastar mas puntos para efectos mejorados

**Clases que lo usan**:
- Psion
- Wilder
- Psychic Warrior

---

## 5. AT_WILL_INVOCATIONS

**Descripcion**: Entidades usables sin limite. Se conocen un numero limitado y se usan a voluntad.

**Caracteristicas**:
- Pool Source: CURATED_SELECTION (invocaciones conocidas)
- Selection Stage: NONE
- Resources: NONE (at-will)

**Clases que lo usan**:
- Warlock
- Dragonfire Adept

---

## 6. MANEUVER_READIED

**Descripcion**: Conoce maniobras, prepara un subset cada dia (readied). Las readied se "gastan" al usarlas y se recuperan con acciones especificas.

**Caracteristicas**:
- Pool Source: CURATED_SELECTION (maniobras conocidas por nivel)
- Selection Stage: DAILY_LIST (readied, sin metamagia)
- Resources: PER_PREPARED_ENTITY (cada maniobra readied es un uso)
- Recovery: Por accion en combate (no descanso)

**Clases que lo usan**:
- Crusader (readied aleatorias cada round - caso especial)
- Swordsage
- Warblade

---

## 7. PREPARED_FLEXIBLE (Arcanist-style)

**Descripcion**: Prepara lista diaria como Vancian, pero lanza espontaneamente de esa lista como Spontaneous.

**Caracteristicas**:
- Pool Source: Libro (como Wizard)
- Selection Stage: DAILY_LIST (prepara X conjuros)
- Resources: Slots por nivel (se consumen al lanzar, no al preparar)
- Casting: Espontaneo de la lista preparada

**Clases que lo usan**:
- Arcanist (Pathfinder)

**Estado**: Pendiente de disenar en detalle.

---

## Casos Especiales No Cubiertos

Estos casos requieren CGEs unicos o extensiones significativas:

### Shadowcaster
- Mysteries que evolucionan: slot -> spell-like (2/day) -> supernatural (at-will)
- Requiere: recurso que cambia segun nivel del personaje

### Truenamer
- DC incrementante por uso
- Requiere: sistema de "coste acumulativo"

### Binder
- Vinculacion diaria con vestiges
- No tiene "entidades conocidas" tradicionales
- Requiere: sistema de negociacion/binding

### Factotum
- Inspiration points (per-encounter)
- Puede imitar cualquier spell de wizard
- Requiere: pool encounter-based + acceso a lista completa
