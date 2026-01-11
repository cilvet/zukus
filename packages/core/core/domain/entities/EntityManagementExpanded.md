# Sistema CGE - Ejemplos y Desarrollo de Tipos

Este documento contiene ejemplos concretos en formato JSON/TypeScript que iremos usando para desarrollar el sistema de Configuración de Gestión de Entidades (CGE).

---

## 1. Schema de Entidad: Conjuro D&D 3.5

### Schema Definition

```json
{
  "typeName": "spell",
  "description": "Un conjuro de D&D 3.5",
  "fields": [
    {
      "name": "schools",
      "type": "string_array",
      "description": "Escuelas de magia (puede tener subescuela)",
      "nonEmpty": true,
      "allowedValues": [
        "abjuration",
        "conjuration",
        "divination", 
        "enchantment",
        "evocation",
        "illusion",
        "necromancy",
        "transmutation",
        "universal"
      ]
    },
    {
      "name": "subschools",
      "type": "string_array",
      "description": "Subescuelas específicas",
      "optional": true,
      "allowedValues": [
        "calling",
        "creation",
        "healing",
        "summoning",
        "teleportation",
        "scrying",
        "charm",
        "compulsion",
        "figment",
        "glamer",
        "pattern",
        "phantasm",
        "shadow"
      ]
    },
    {
      "name": "descriptors",
      "type": "string_array",
      "description": "Descriptores del conjuro (elemento, tipo, etc.)",
      "optional": true,
      "allowedValues": [
        "acid",
        "air",
        "chaotic",
        "cold",
        "darkness",
        "death",
        "earth",
        "electricity",
        "evil",
        "fear",
        "fire",
        "force",
        "good",
        "language-dependent",
        "lawful",
        "light",
        "mind-affecting",
        "sonic",
        "water"
      ]
    },
    {
      "name": "components",
      "type": "string_array",
      "description": "Componentes requeridos",
      "nonEmpty": true,
      "allowedValues": ["V", "S", "M", "F", "DF", "XP"]
    },
    {
      "name": "materialComponent",
      "type": "string",
      "description": "Descripción del componente material",
      "optional": true
    },
    {
      "name": "focus",
      "type": "string",
      "description": "Descripción del foco",
      "optional": true
    },
    {
      "name": "xpCost",
      "type": "string",
      "description": "Coste en XP (puede ser fórmula)",
      "optional": true
    },
    {
      "name": "castingTime",
      "type": "string",
      "description": "Tiempo de casteo",
      "optional": false
    },
    {
      "name": "range",
      "type": "string", 
      "description": "Rango del conjuro (puede incluir fórmulas como '25 ft. + 5 ft./2 levels')",
      "optional": false
    },
    {
      "name": "target",
      "type": "string",
      "description": "Objetivo del conjuro",
      "optional": true
    },
    {
      "name": "area",
      "type": "string",
      "description": "Área de efecto",
      "optional": true
    },
    {
      "name": "effect",
      "type": "string",
      "description": "Efecto del conjuro",
      "optional": true
    },
    {
      "name": "duration",
      "type": "string",
      "description": "Duración del efecto",
      "optional": false
    },
    {
      "name": "savingThrow",
      "type": "string",
      "description": "Tipo de salvación y efecto",
      "optional": false
    },
    {
      "name": "spellResistance",
      "type": "string",
      "description": "Si aplica resistencia a conjuros",
      "optional": false,
      "allowedValues": ["Yes", "No", "Yes (harmless)", "Yes (object)", "See text"]
    },
    {
      "name": "shortDescription",
      "type": "string",
      "description": "Descripción corta para mostrar en listas",
      "optional": true
    },
    {
      "name": "classLevels",
      "type": "object_array",
      "description": "Niveles por clase",
      "nonEmpty": true,
      "objectFields": [
        {
          "name": "className",
          "type": "string",
          "description": "Nombre de la clase",
          "optional": false
        },
        {
          "name": "level",
          "type": "integer",
          "description": "Nivel del conjuro para esta clase",
          "optional": false,
          "allowedValues": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        }
      ]
    }
  ]
}
```

---

## 2. Instancias de Ejemplo

### Ejemplo 1: Magic Missile

```json
{
  "id": "magic_missile",
  "name": "Magic Missile",
  "type": "spell",
  "description": "A missile of magical energy darts forth from your fingertip and strikes its target, dealing 1d4+1 points of force damage. The missile strikes unerringly, even if the target is in melee combat, so long as it has less than total cover or total concealment. Specific parts of a creature can't be singled out. Objects are not damaged by the spell. For every two caster levels beyond 1st, you gain an additional missile—two at 3rd level, three at 5th, four at 7th, and the maximum of five missiles at 9th level or higher. If you shoot multiple missiles, you can have them strike a single creature or several creatures. A single missile can strike only one creature. You must designate targets before you check for spell resistance or roll damage.",
  "schools": ["evocation"],
  "descriptors": ["force"],
  "components": ["V", "S"],
  "castingTime": "1 standard action",
  "range": "Medium (100 ft. + 10 ft./level)",
  "target": "Up to five creatures, no two of which can be more than 15 ft. apart",
  "duration": "Instantaneous",
  "savingThrow": "None",
  "spellResistance": "Yes",
  "shortDescription": "1d4+1 damage; +1 missile per two levels above 1st (max 5).",
  "classLevels": [
    { "className": "Sorcerer", "level": 1 },
    { "className": "Wizard", "level": 1 }
  ]
}
```

### Ejemplo 2: Fireball

```json
{
  "id": "fireball",
  "name": "Fireball",
  "type": "spell",
  "description": "A fireball spell is an explosion of flame that detonates with a low roar and deals 1d6 points of fire damage per caster level (maximum 10d6) to every creature within the area. Unattended objects also take this damage. The explosion creates almost no pressure. You point your finger and determine the range (distance and height) at which the fireball is to burst. A glowing, pea-sized bead streaks from the pointing digit and, unless it impacts upon a material body or solid barrier prior to attaining the prescribed range, blossoms into the fireball at that point. An early impact results in an early detonation. If you attempt to send the bead through a narrow passage, such as through an arrow slit, you must 'hit' the opening with a ranged touch attack, or else the bead strikes the barrier and detonates prematurely. The fireball sets fire to combustibles and damages objects in the area. It can melt metals with low melting points, such as lead, gold, copper, silver, and bronze. If the damage caused to an interposing barrier shatters or breaks through it, the fireball may continue beyond the barrier if the area permits; otherwise it stops at the barrier just as any other spell effect does.",
  "schools": ["evocation"],
  "descriptors": ["fire"],
  "components": ["V", "S", "M"],
  "materialComponent": "A tiny ball of bat guano and sulfur.",
  "castingTime": "1 standard action",
  "range": "Long (400 ft. + 40 ft./level)",
  "area": "20-ft.-radius spread",
  "duration": "Instantaneous",
  "savingThrow": "Reflex half",
  "spellResistance": "Yes",
  "shortDescription": "1d6/level damage (max 10d6).",
  "classLevels": [
    { "className": "Sorcerer", "level": 3 },
    { "className": "Wizard", "level": 3 }
  ]
}
```

### Ejemplo 3: Cure Light Wounds

```json
{
  "id": "cure_light_wounds",
  "name": "Cure Light Wounds",
  "type": "spell",
  "description": "When laying your hand upon a living creature, you channel positive energy that cures 1d8 points of damage +1 point per caster level (maximum +5). Since undead are powered by negative energy, this spell deals damage to them instead of curing their wounds. An undead creature can apply spell resistance, and can attempt a Will save to take half damage.",
  "schools": ["conjuration"],
  "subschools": ["healing"],
  "components": ["V", "S"],
  "castingTime": "1 standard action",
  "range": "Touch",
  "target": "Creature touched",
  "duration": "Instantaneous",
  "savingThrow": "Will half (harmless); see text",
  "spellResistance": "Yes (harmless); see text",
  "shortDescription": "Cures 1d8 damage +1/level (max +5).",
  "classLevels": [
    { "className": "Cleric", "level": 1 },
    { "className": "Druid", "level": 1 },
    { "className": "Paladin", "level": 1 },
    { "className": "Ranger", "level": 2 },
    { "className": "Bard", "level": 1 }
  ]
}
```

### Ejemplo 4: Summon Monster I

```json
{
  "id": "summon_monster_1",
  "name": "Summon Monster I",
  "type": "spell",
  "description": "This spell summons an extraplanar creature (typically an outsider, elemental, or magical beast native to another plane). It appears where you designate and acts immediately, on your turn. It attacks your opponents to the best of its ability. If you can communicate with the creature, you can direct it not to attack, to attack particular enemies, or to perform other actions. The spell conjures one of the creatures from the 1st-level list on Table: Summon Monster. You choose which kind of creature to summon, and you can change that choice each time you cast the spell.",
  "schools": ["conjuration"],
  "subschools": ["summoning"],
  "components": ["V", "S", "F", "DF"],
  "focus": "A tiny bag and a small (not necessarily lit) candle.",
  "castingTime": "1 round",
  "range": "Close (25 ft. + 5 ft./2 levels)",
  "effect": "One summoned creature",
  "duration": "1 round/level (D)",
  "savingThrow": "None",
  "spellResistance": "No",
  "shortDescription": "Calls extraplanar creature to fight for you.",
  "classLevels": [
    { "className": "Sorcerer", "level": 1 },
    { "className": "Wizard", "level": 1 },
    { "className": "Cleric", "level": 1 },
    { "className": "Bard", "level": 1 }
  ]
}
```

### Ejemplo 5: Wish (conjuro de alto nivel con coste de XP)

```json
{
  "id": "wish",
  "name": "Wish",
  "type": "spell",
  "description": "Wish is the mightiest spell a wizard or sorcerer can cast. By simply speaking aloud, you can alter reality to better suit you. Even wish, however, has its limits. A wish can produce any one of the following effects: Duplicate any wizard or sorcerer spell of 8th level or lower; Duplicate any other spell of 6th level or lower; Duplicate any wizard or sorcerer spell of 7th level or lower even if it's of a restricted school; Undo the harmful effects of many other spells; Create a nonmagical item of up to 25,000 gp in value; Grant a creature a +1 inherent bonus to an ability score (two creatures if they're the same bonus); and more...",
  "schools": ["universal"],
  "components": ["V", "XP"],
  "xpCost": "5000 XP (or 1000 XP for duplicating spells)",
  "castingTime": "1 standard action",
  "range": "See text",
  "target": "See text",
  "area": "See text", 
  "effect": "See text",
  "duration": "See text",
  "savingThrow": "None; see text",
  "spellResistance": "Yes",
  "shortDescription": "As limited wish, but with fewer limits.",
  "classLevels": [
    { "className": "Sorcerer", "level": 9 },
    { "className": "Wizard", "level": 9 }
  ]
}
```

---

## Observaciones sobre el Schema

1. **Campo `classLevels` como array de objetos**: Un mismo conjuro puede tener niveles diferentes para distintas clases. Esto es crucial para D&D 3.5.

2. **Campos opcionales vs obligatorios**: No todos los conjuros tienen todas las propiedades (target vs area vs effect son mutuamente exclusivos en muchos casos).

3. **Descriptores como metadata**: Los descriptores son importantes para reglas de juego (resistencias, inmunidades, etc.).

4. **Componentes y sus descripciones**: Los componentes son un array, pero los detalles (materialComponent, focus, xpCost) son campos separados.

5. **Strings con semántica de fórmula**: Campos como `range`, `duration`, `xpCost` contienen texto que podría parsearse como fórmulas en el futuro.

---

## Siguiente paso

Con este schema y estas instancias en mente, podemos empezar a pensar en cómo un CGE (Configuración de Gestión de Entidades) gestionaría estos conjuros para diferentes clases y estilos de casting.

---

## 3. Aprendizajes del diseño del sistema CGE

### 3.1. Las capacidades no son datos fijos, son variables calculadas

**Problema inicial**: Empezamos pensando en las capacidades como datos estáticos dentro del modo de gestión (slots máximos y usados como valores fijos).

**Por qué no funciona**: Esto ignora que las capacidades pueden modificarse desde múltiples fuentes:
- Un anillo que duplique los slots de nivel 1
- Una clase de prestigio que avance el nivel de lanzador
- Un talento que dé conjuros conocidos extra
- Penalizaciones temporales por efectos

**Solución**: Las capacidades deben ser variables calculadas en el sistema, igual que los recursos. El CGE debe referenciar variables en vez de contener valores fijos, y esas variables pueden modificarse desde cualquier parte del sistema mediante el sistema de cambios.

Ventajas:
- Trazabilidad completa (SourceValues muestran de dónde viene cada modificador)
- Coherente con el resto del sistema (recursos, AC, etc.)
- Permite modificaciones desde cualquier parte (ítems, talentos, buffs)

---

### 3.2. La tabla de progresión vive en el CGE

**Concepto clave**: El CGE no solo define *cómo* se gestionan las entidades, sino que contribuye la tabla de progresión que determina las capacidades.

**Estructura bidimensional**: 
- **Eje X**: Nivel de clase del personaje (1-20)
- **Eje Y**: Nivel de la entidad (0-9 para conjuros)
- **Valor**: Capacidad en ese cruce

Por ejemplo, un mago de nivel 5 tendría acceso a conjuros de nivel 0-3, con diferentes cantidades de slots por nivel. Un hechicero tendría una tabla similar pero para conjuros conocidos en vez de slots.

**Generación de variables**: A partir de estas tablas se crearían automáticamente las variables mediante fórmulas tipo switch que consultan el nivel de clase del personaje.

---

### 3.3. Libro de conjuros y conocidos son lo mismo conceptualmente

**Observación clave**: Aunque se sientan diferentes jugando, mago y hechicero tienen la misma estructura de acceso.

**Estructura común - Dos niveles de filtrado**:
1. **Lista de clase**: Todos los conjuros de la lista de clase (arcanos, divinos, etc.)
2. **Lista personal**: 
   - Mago → Conjuros en su libro de conjuros
   - Hechicero → Conjuros conocidos

La diferencia está en el uso posterior:
- **Mago**: Prepara diariamente un subconjunto desde su libro
- **Hechicero**: Lanza espontáneamente directamente desde sus conocidos

**Implicación para el diseño**: Necesitamos un concepto unificado de "lista personal de entidades" que después se combine con diferentes "modos de uso" (preparación diaria vs espontáneo).

---

### 3.4. El CGE es configuración, no estado

**Problema detectado**: Mezclábamos cosas inmutables (como si se permite overcast) con cosas que cambian durante el juego (slots usados, conjuros preparados hoy).

**Separación correcta**: Debe existir una distinción clara entre:
- **EntityManagementConfig**: Inmutable, define las reglas del sistema (tipo de gestión, políticas, referencias a variables)
- **EntityManagementState**: Mutable, registra las decisiones del jugador y el consumo (slots usados, entidades preparadas hoy)

Beneficios:
- Reset diario: solo reseteas el estado, la configuración se mantiene
- Reconciliación: si cambia el acceso, comparas estado contra nueva configuración
- Serialización: el estado va en el save, la configuración viene de la definición de clase

---

### 3.5. Sistema de tablas bidimensionales generadoras de variables

**Patrón emergente**: Necesitamos un sistema que, dada una variable externa (como el nivel de clase), genere automáticamente múltiples variables derivadas (como los slots para cada nivel de conjuro).

**Funcionamiento**: Una tabla bidimensional mapea el valor de una variable fuente a un array de valores. Por cada elemento del array, se genera una variable con un identificador único. Por ejemplo, el nivel 5 de mago generaría variables para slots de nivel 0, 1, 2, 3, etc., cada una con su valor correspondiente.

**Aplicabilidad fuera de conjuros**:
- Dagas arrojadizas por nivel de monje
- Usos de rage por día según nivel de bárbaro
- Cantidad de invocations según nivel de warlock
- Maneuvers preparadas por nivel en Tome of Battle

Este patrón podría abstraerse como un sistema reutilizable más allá del CGE específico de conjuros.

