# CGE: Arquitectura y Razonamiento

Este documento explica la arquitectura del sistema CGE, el razonamiento detras de cada decision de diseno, y como las diferentes casuisticas requieren primitivos especificos.

---

## El Problema que Resuelve CGE

En juegos de rol como D&D, diferentes clases tienen sistemas muy distintos para gestionar sus habilidades especiales:

- Un **Mago de D&D 3.5** tiene un libro de conjuros (ilimitado), prepara conjuros especificos en slots cada manana, y al lanzar un conjuro "gasta" ese slot especifico.
- Un **Hechicero** conoce pocos conjuros pero los puede lanzar espontaneamente, solo limitado por slots diarios.
- Un **Psion** conoce poderes y gasta puntos de un pool comun.
- Un **Warblade** conoce maniobras, prepara algunas como "readied", las gasta al usarlas, y las recupera con una accion especial.
- Un **Brujo (Warlock)** conoce invocaciones y las usa a voluntad, sin limite.

**El problema**: Implementar cada sistema como codigo separado crearia duplicacion masiva y seria imposible de mantener.

**La solucion**: Descomponer estos sistemas en **tres ejes ortogonales** que, combinados, pueden representar cualquier sistema de habilidades.

---

## Por Que Tres Ejes y No Uno

### Intento 1: Clasificacion Simple

Podriamos intentar clasificar por "tipo de lanzador" (Espontaneo, Preparado, At-will).

**Problema**: El Psion es espontaneo pero usa pool, no slots. El Warblade prepara pero no gasta slots. Esta clasificacion no captura las diferencias reales.

### Intento 2: Dos Ejes

Podriamos usar "tiene conocidos limitados" y "tiene slots".

**Problema**: No distingue entre Mago 3.5 (BOUND) y Mago 5e (LIST). Ambos tienen conocidos ilimitados y slots, pero su mecanica de preparacion es fundamentalmente diferente.

### La Solucion: Tres Ejes Ortogonales

Cada eje es **independiente** de los otros. Cualquier combinacion es teoricamente posible.

Esta ortogonalidad permite:
1. **Reutilizacion**: El codigo para manejar SLOTS es el mismo independientemente de KNOWN o PREPARATION.
2. **Extensibilidad**: Anadir un nuevo tipo de recurso no requiere tocar el codigo de conocidos o preparacion.
3. **Combinaciones nuevas**: Si WotC inventa un nuevo sistema, probablemente sea una combinacion nueva de los mismos ejes.

---

## La Distincion Critica: Preparacion vs Recurso de Uso

**Para BOUND**: El slot ES la preparacion Y el recurso de uso. Son lo mismo.
- Preparas Fireball en slot 3-0 → al usar, gastas slot 3-0.

**Para LIST con consumeOnUse: true** (Warblade): La preparacion ES el recurso.
- Preparas 5 maniobras → al usar una, se "gasta".

**Para LIST con consumeOnUse: false** (Spirit Shaman, Arcanist): **HAY DOS RECURSOS SEPARADOS**
1. **Limite de preparacion** (`maxFormula`/`maxPerLevel`): Cuantas entidades puedes poner en tu lista.
2. **Recurso de uso** (`resource.table`): Cuantas veces puedes usar (slots).

```
Spirit Shaman nivel 5:
- Puede PREPARAR 3 conjuros de nivel 1 en su lista diaria
- Puede LANZAR 4 veces usando slots de nivel 1
- Cada lanzamiento puede ser cualquiera de los 3 preparados
```

La UI debe mostrar AMBOS limites.

---

## Matriz de Recursos por Sistema

| Preparation | Resource | Limite Prep | Recurso Uso | Tracking Usado | Ejemplo |
|-------------|----------|-------------|-------------|----------------|---------|
| NONE | SLOTS | N/A | slots | N/A | Sorcerer |
| NONE | POOL | N/A | pool | N/A | Psion |
| NONE | NONE | N/A | N/A | N/A | Warlock |
| BOUND | SLOTS | = slots | = prep | usedBoundSlots | Wizard 3.5 |
| LIST (consume) | NONE | listPrep | = prep | usedListEntities | Warblade |
| LIST (!consume) | SLOTS | maxFormula/Level | slots | N/A | Spirit Shaman |

---

## El Problema de los Multiples Tracks

El Clerigo en D&D 3.5 tiene:
- **Track base**: X slots de nivel 1, Y de nivel 2 para conjuros clericales normales.
- **Track de dominio**: 1 slot por nivel para conjuros de sus dominios especificos.

Son **independientes**: diferentes filtros, se preparan y usan por separado.

### La Solucion: Keys Normalizadas

Todas las keys de estado incluyen `trackId:` como prefijo:

```
Formato: "trackId:identificador"

Ejemplos:
- slotCurrentValues["base:3"]      // Slots nivel 3 del track base
- slotCurrentValues["domain:3"]    // Slots nivel 3 del track domain
- boundPreparations["base:3-0"]    // Slot 0 de nivel 3 del track base
- listPreparations["base:-1"]      // Lista GLOBAL del track base
```

---

## Primitivos Necesarios

### Almacenamiento de Conocidos

```typescript
// Para LIMITED_PER_ENTITY_LEVEL (Sorcerer)
knownSelections["0"] = ["prestidigitation", "light"]
knownSelections["1"] = ["magic-missile", "shield"]

// Para LIMITED_TOTAL y UNLIMITED
knownSelections["-1"] = ["fireball", "fly", "haste"]  // -1 = sin nivel especifico
```

### Consumo de Recursos

**SLOTS:**
```typescript
slotCurrentValues["base:1"] = -2  // Ha gastado 2 slots de nivel 1
```

**POOL:**
```typescript
poolCurrentValues["base"] = 15  // De 19 max, ha gastado 4
```

### Preparacion

**BOUND:**
```typescript
boundPreparations["base:3-0"] = "fireball"
usedBoundSlots["base:3-0"] = true  // Ya lanzo ese Fireball
```

**LIST:**
```typescript
// GLOBAL: nivel -1
listPreparations["base:-1"] = ["fireball", "fly", "counterspell"]

// PER_LEVEL: por nivel
listPreparations["base:1"] = ["magic-missile", "shield"]
```

### Tracking de Entidades Usadas (consumeOnUse)

```typescript
usedListEntities["base:iron-heart-surge"] = true   // Usada
```

---

## Arquitectura de Implementacion

```
+------------------------------------------------------------------+
|                      ORQUESTACION                                 |
|  useEntity() - Funcion unificada que coordina todo                |
|  getAvailableForUse() - Que entidades puedo usar ahora?           |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                OPERACIONES DE NEGOCIO                             |
|                                                                   |
|  PreparationOps     ResourceOps        UsageOps                   |
|  +- BOUND           +- SLOTS           +- consumeOnUse            |
|  +- LIST            +- POOL                                       |
|  +- NONE            +- NONE                                       |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                      STORAGE                                      |
|  Operaciones CRUD puras sobre CGEState                            |
|  - Keys normalizadas (trackId:xxx)                                |
|  - Sin logica de negocio                                          |
+------------------------------------------------------------------+
```

**Storage** es puro y testeable. Solo sabe mover datos.

**Operaciones de Negocio** implementan la logica de cada tipo de forma aislada.

**Orquestacion** es donde se combinan los ejes.

---

## Flujos de Datos

### Usar Conjuro (Wizard 3.5)

```
1. UI: Usuario ve slots preparados
2. UI: Usuario toca "Lanzar" en el slot con Fireball
3. UI: Llama useBoundSlot(character, "wizard-spells", "base:3-0")
4. Core: Actualiza usedBoundSlots["base:3-0"] = true
5. Core: Recalcula CharacterSheet
6. UI: Muestra slot como gastado
```

### Usar Maniobra (Warblade)

```
1. UI: Usuario ve maniobras readied
2. UI: Usuario toca "Iniciar" en Iron Heart Surge
3. Core: Verifica que esta en listPreparations y NO en usedListEntities
4. Core: Actualiza usedListEntities["base:iron-heart-surge"] = true
5. UI: Muestra maniobra como gastada
```

### Usar Poder (Psion)

```
1. UI: Usuario ve poderes conocidos
2. UI: Usuario toca "Manifestar" en Mind Thrust
3. Core: Calcula coste (nivel del poder = 1)
4. Core: Actualiza poolCurrentValues["base"] -= 1
5. UI: Muestra pool actualizado (18/19)
```

---

## Conclusion

Al descomponer el sistema en tres ejes ortogonales y primitivos bien definidos, podemos:

1. **Reutilizar** codigo entre sistemas similares
2. **Testear** cada primitivo de forma aislada
3. **Extender** el sistema para nuevos casos sin reescribir todo
4. **Entender** cualquier combinacion mirando su configuracion

La clave es mantener la separacion de concerns:
- **Storage**: CRUD puro
- **Operaciones**: Logica de cada tipo
- **Orquestacion**: Combinacion de todo
