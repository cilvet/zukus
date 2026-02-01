# CGE - Analisis de Casos por Clase

Este documento proporciona analisis detallado de como diferentes clases usan el sistema CGE.

---

## Casos Resueltos

### Sorcerer

```
known: LIMITED_PER_ENTITY_LEVEL
resource: SLOTS
preparation: NONE
```

**Mecanica**: Conoce un numero fijo de conjuros por nivel (6 trucos, 4 nivel 1, 2 nivel 2...). Puede lanzar cualquier conjuro conocido sin prepararlo. Cada lanzamiento consume un slot del nivel apropiado.

**Flujo**:
```
Conocidos (LIMITED_PER_ENTITY_LEVEL) --[sin preparacion]--> Uso --[gasta SLOT del nivel]-->
```

---

### Wizard 3.5

```
known: UNLIMITED
resource: SLOTS
preparation: BOUND
```

**Mecanica**: Tiene un libro de conjuros ilimitado. Cada manana prepara conjuros especificos en slots especificos. "Preparo Bola de Fuego en mi primer slot de nivel 3". Al lanzar, gasta ESE slot especifico.

**Flujo**:
```
Libro (UNLIMITED) --[prepara en slot]--> Slots Preparados --[usa slot especifico]-->
```

---

### Cleric 3.5

```
known: (sin definir)
resource: SLOTS
preparation: BOUND
```

**Mecanica**: Accede a toda la lista clerical automaticamente (no "conoce" conjuros). Igual que el Mago en mecanica de preparacion.

**Diferencia con Mago**: Mago prepara de su libro (conocidos UNLIMITED). Clerigo prepara del compendio (toda la lista filtrada).

---

### Wizard 5e

```
known: UNLIMITED
resource: SLOTS
preparation: LIST (structure: GLOBAL, consumeOnUse: false)
```

**Mecanica**: Tiene libro ilimitado. Prepara una lista de N conjuros (no ligados a slots). Puede lanzar cualquiera de los preparados usando cualquier slot de nivel apropiado.

**Diferencia con Wizard 3.5**: `LIST GLOBAL` en lugar de `BOUND`. No prepara en slots especificos, prepara una lista global.

---

### Arcanist (Pathfinder)

```
known: UNLIMITED
resource: SLOTS
preparation: LIST (structure: PER_LEVEL, consumeOnUse: false)
```

**Mecanica**: Tiene libro. Prepara X conjuros de nivel 1, Y de nivel 2, etc. Lanza cualquiera de los preparados de ese nivel con un slot de ese nivel.

**Diferencia con Wizard 5e**: `PER_LEVEL` en lugar de `GLOBAL`. Debe preparar el numero especificado de cada nivel.

---

### Spirit Shaman

```
known: (sin definir)
resource: SLOTS
preparation: LIST (structure: PER_LEVEL, consumeOnUse: false)
```

**Mecanica**: No tiene libro (como Clerigo). Cada manana "retrieves" X conjuros de cada nivel. Lanza espontaneamente de esa lista diaria.

**CASO CRITICO: Dos Recursos Separados**

```
Spirit Shaman nivel 5:

LIMITE DE PREPARACION (maxPerLevel):
  - Nivel 0: 4 conjuros en lista
  - Nivel 1: 3 conjuros en lista
  - Nivel 2: 2 conjuros en lista

SLOTS DE LANZAMIENTO (resource.table):
  - Nivel 0: 5 usos
  - Nivel 1: 4 usos
  - Nivel 2: 2 usos
```

Puede preparar 3 conjuros de nivel 1, pero tiene 4 slots. Puede lanzar CUALQUIERA de esos 3 conjuros hasta 4 veces en total. La UI debe mostrar AMBOS limites.

---

### Warblade (Tome of Battle)

```
known: LIMITED_TOTAL
resource: NONE
preparation: LIST (structure: GLOBAL, consumeOnUse: true, recovery: manual)
```

**Mecanica**: Conoce X maniobras totales. Cada manana "readies" Y maniobras. En combate, puede usar cada readied UNA vez. Para recuperarlas, usa accion especial.

**Flujo**:
```
Conocidos --[ready]--> Readied --[usa]--> Gastada --[accion recuperar]--> Readied
```

**Clave**: `consumeOnUse: true` marca la maniobra como gastada al usarla. `resource: NONE` - no gasta slots.

---

### Psion (Psionics)

```
known: LIMITED_TOTAL
resource: POOL
preparation: NONE
```

**Mecanica**: Conoce X poderes totales. No prepara, usa directo. Cada poder cuesta power points (tipicamente = nivel del poder).

**Flujo**:
```
Conocidos --[sin prep]--> Uso --[gasta X puntos del pool]-->
```

---

### Warlock

```
known: LIMITED_TOTAL
resource: NONE
preparation: NONE
```

**Mecanica**: El caso mas simple. Conoce X invocaciones totales. Las usa a voluntad, sin limite.

**Flujo**:
```
Conocidos --[sin prep, sin coste]--> Uso directo
```

---

## Casos Fuera del Modelo

Estos casos requieren extensiones o sistemas separados:

### Shadowcaster

Recursos evolucionan con nivel de la entidad (slot -> SLA -> Su). El mismo conjuro puede empezar costando un slot y acabar siendo supernatural. Requiere CGE dinamico por nivel de entidad.

### Truenamer

DC incrementante por uso. Cada vez que usa un utterance en el mismo round, la DC sube. No es un consumible clasico.

### Binder

Vincula vestiges, no "conoce" conjuros. Sistema de binding checks, no preparacion tradicional.

### Crusader

Sus maniobras readied son granted aleatoriamente cada round. Extension de LIST con randomizacion.

---

## Referencia Historica

Los analisis detallados originales por clase estan en:
`packages/core/core/domain/cge/casesToCover/`

**Nota**: Estos READMEs usan nomenclatura antigua (GROWING_COLLECTION, CURATED_SELECTION, etc). Ver el archivo NOMENCLATURE.md en esa carpeta para el mapeo a tipos reales.
