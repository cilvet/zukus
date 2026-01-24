# Spirit Shaman - Spellcasting

## CGE Generico: SPONTANEOUS_DAILY_LIST

## Estado: Resuelto

---

## Resumen Mecanico

El Spirit Shaman es un hibrido unico:
- Accede a toda la lista de druida
- Cada dia, "prepara" una lista de conjuros accesibles
- Lanza espontaneamente de esa lista diaria

---

## Pool Source

**Tipo**: FULL_LIST_ACCESS

- Accede a toda la lista de druida
- Sin libro ni conocidos permanentes

**Label**: "Lista de druida"

---

## Selection Stage

**Tipo**: DAILY_LIST

- Cada manana, elige X conjuros por nivel que estaran "disponibles"
- Esta es su lista del dia
- Metamagia se aplica aqui (al elegir la lista)

**Label**: "Conjuros preparados"

---

## Resources

**Estrategia**: SLOTS_PER_ENTITY_LEVEL

Genera DOS tipos de recursos:

1. **Conjuros preparados por nivel** (lista diaria):
   - `@spells.prepared.level.{X}.max` - Cuantos puede elegir por nivel

2. **Slots de lanzamiento** (separados de la lista):
   - `@spell.slots.level.{X}` - Cuantas veces puede lanzar por nivel

**Tabla de conjuros preparados**:
```
Nivel | 0  1  2  3  4  5  6  7  8  9
------+-----------------------------
  1   | 3  1  -  -  -  -  -  -  -  -
  ...
```

**Tabla de slots por dia** (igual que druida).

---

## Preparation Tracks

### Track 1: Lista diaria
- Filter: lista "druid"
- Resources: conjuros preparados por nivel

---

## Variables Expuestas

- `@castingClassLevel.spiritShaman`
- `@effectiveCasterLevel`

---

## Preparation Context

```
inputEntityType: 'spell'
effectiveSlotLevel: {
  baseSources: [{ formula: '@entity.level' }]
}
```

La metamagia se aplica al PREPARAR la lista diaria, no al lanzar.
Esto significa que un Fireball+Maximize ocupa un "slot de preparacion" de nivel 6.

---

## Casting (caso especial)

Al lanzar:
- Elige cualquier conjuro de su lista preparada del dia
- Consume un slot del nivel del conjuro (ya con metamagia aplicada)
- Sin penalizacion de tiempo (metamagia ya fue aplicada)

---

## Texto Original (Complete Divine)

> **Spells**: A spirit shaman casts divine spells drawn from the druid spell list. She can cast any spell she has retrieved for that day without preparing it ahead of time.
>
> **Retrieving Spells**: Each day, a spirit shaman can retrieve a number of spells from the spirit world. She meditates for 1 hour, during which time she communes with spirits and retrieves her daily complement of spells.
