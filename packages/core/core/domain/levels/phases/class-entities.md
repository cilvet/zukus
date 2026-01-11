# Fase 8: Clases como Entidades

---

## Objetivo

Definir las clases de personaje, sus niveles y aptitudes como **entidades** del sistema de compendios, en lugar de tipos TypeScript hardcodeados.

---

## Por qué entidades en lugar de tipos hardcodeados

El sistema actual (`core/domain/class/class.ts`) define `CharacterClass` y `ClassLevel` como tipos TypeScript con estructura fija. Esto tiene limitaciones:

1. **Rigidez**: Añadir un campo nuevo requiere cambiar el tipo y todas las clases existentes
2. **No validable dinámicamente**: No hay schema que valide clases creadas por usuarios
3. **No extensible por compendios**: Un compendio no puede definir una clase nueva sin código

Con entidades:
- Los schemas definen la estructura, validable en runtime
- Los compendios pueden añadir clases, niveles y aptitudes
- El mismo sistema de filtrado, supresión y addons aplica a clases
- La UI puede generar formularios automáticamente desde el schema

---

## Tipos de Entidad

### `class`
Representa una clase de personaje (Guerrero, Pícaro, Mago).

**Campos**:
- `id`: Identificador único (`"rogue"`, `"fighter"`)
- `name`: Nombre para mostrar
- `description`: Descripción de la clase
- `hitDie`: Dado de golpe (6, 8, 10, 12)
- `babProgression`: Progresión de ataque base (`"full"`, `"medium"`, `"poor"`)
- `saves`: Progresión de salvaciones (`{ fort: "good", ref: "good", will: "poor" }`)
- `classType`: Tipo de clase (`"base"`, `"prestige"`)
- `classSkillIds`: Array de IDs de entidades tipo `skill`
- `levelIds`: Array de IDs de entidades tipo `classLevel`

**Razón de `levelIds` como referencias**: 
Los niveles son entidades separadas porque pueden ser editados independientemente, referenciados por arquetipos, y el personaje guarda copias con sus selecciones.

### `classLevel`
Representa un nivel específico de una clase (Pícaro nivel 3).

**Campos**:
- `id`: Identificador único (`"rogue-level-3"`)
- `classId`: ID de la clase a la que pertenece
- `level`: Número de nivel (1-20)
- `features`: Array de EntityProvider (granted + selectors)

**Razón de `features` como EntityProvider**:
Todo lo que un nivel otorga se modela uniformemente. Un granted con IDs específicos, un granted con filtro (para inyección de arquetipos), o un selector (para elecciones del usuario). Máxima configurabilidad.

### `classFeature`
Representa una aptitud de clase (Ataque Furtivo, Evasión).

**Campos**:
- `id`: Identificador único (`"sneak-attack-1d6"`)
- `name`: Nombre para mostrar
- `description`: Descripción
- Campos del addon `effectful`: `legacy_changes`, `legacy_contextualChanges`, etc.
- Campos del addon `suppressing`: `suppression` (para aptitudes que reemplazan otras)
- `definesVariables`: Variables que esta aptitud define (ej: `furtiveAttackDice: 1`)

---

## Almacenamiento en el Personaje

### El problema de dónde viven las entidades

Las entidades que el personaje obtiene (por granted o por selección) deben guardarse en el personaje. Hay tres consideraciones:

1. **Edición**: El usuario debe poder editar cualquier entidad
2. **Duplicación**: La misma entidad puede obtenerse múltiples veces (mismo feat a diferentes niveles)
3. **Localización**: Debe ser fácil encontrar una entidad para editarla

### Solución: Índice central con claves compuestas

El personaje tiene un **índice central** de entidades, donde la clave es una combinación determinista de origen + entityId:

```typescript
type CharacterEntities = Record<EntityKey, Entity>

// Ejemplos de claves:
// "level.1.granted.sneak-attack-1d6"
// "level.1.selector.rogue-talent-1.fast-hands"
// "level.5.selector.rogue-talent-5.fast-hands"  // Misma entidad, otro origen
// "custom.feat.my-homebrew"
```

**Por qué claves compuestas**:
- Evita colisiones cuando la misma entidad se obtiene en diferentes contextos
- Permite localizar cualquier entidad para edición con un solo lookup
- El origen queda implícito en la clave

### Estructura del personaje

```typescript
type CharacterLevelBuild = {
  // Índice central de TODAS las entidades del personaje
  entities: Record<EntityKey, Entity>
  
  // Niveles con referencias (solo IDs)
  levels: CharacterLevel[]
}

type CharacterLevel = {
  characterLevel: number
  classLevelId: string  // Referencia al nivel de clase
  classLevel: {
    // Copia hidratada de la definición del nivel
    classId: string
    level: number
    features: EntityProvider[]
    // Los selectores contienen selectedEntityIds, no entidades
  }
  hpRoll?: number
}
```

### Flujo de hidratación

1. **Selección**: Usuario elige entidad en selector
2. **Copia**: Se copia la entidad del compendio al índice central
3. **Clave**: Se genera clave compuesta con `buildEntityKey(origin, entityId)`
4. **Referencia**: El selector guarda solo el ID en `selectedEntityIds`

Para granted es igual: cuando se añade un nivel, las entidades granted se copian al índice.

### Función buildEntityKey

```typescript
type EntityOrigin = 
  | { type: 'granted', characterLevel: number }
  | { type: 'selector', characterLevel: number, selectorId: string }
  | { type: 'custom', entityType: string }

function buildEntityKey(origin: EntityOrigin, entityId: string): string {
  switch (origin.type) {
    case 'granted':
      return `level.${origin.characterLevel}.granted.${entityId}`
    case 'selector':
      return `level.${origin.characterLevel}.selector.${origin.selectorId}.${entityId}`
    case 'custom':
      return `custom.${origin.entityType}.${entityId}`
  }
}
```

Centraliza el formato, es type-safe, y permite `parseEntityKey()` inverso si hace falta.

---

## Integración con el Sistema Actual

### Coexistencia

Durante la migración, el sistema nuevo coexiste con `CharacterClass[]` en `CharacterBaseData`. La función de cálculo puede recibir cualquiera de los dos formatos.

### Función de interpretación

Se creará una función específica para D&D 3.5 que interpreta las entidades de clase y extrae los valores necesarios para el cálculo (hitDie, BAB, saves, etc.). Esta función es análoga a lo que hace el sistema actual, pero lee de entidades en lugar de tipos hardcodeados.

```typescript
function resolveClassDataFromEntities(
  classEntity: Entity,
  classLevelEntities: Entity[]
): ClassCalculationData
```

---

## Auto-inyección de Features (Fase 8.5)

### Problema

Si cada clase tiene sus features hardcodeadas en los niveles, ¿cómo añade un arquetipo sus propias features sin modificar la clase?

### Solución

Todas las clases incluyen automáticamente un EntityProvider granted con filtro que busca entidades con `addedAtClassLevel` correspondiente:

```typescript
// Campo en entidades inyectables
type InjectableFeature = Entity & {
  addedAtClassLevel?: string[]  // ["rogue.1", "rogue.3"]
}

// Provider auto-añadido a cada nivel
{
  granted: {
    filter: {
      conditions: [
        { field: 'addedAtClassLevel', operator: 'contains', value: 'rogue.3' }
      ]
    }
  }
}
```

### Función helper

```typescript
function addAutoInjectionToClass(classDef: ClassDefinition): ClassDefinition
```

Aplica el provider de inyección a cada nivel. El creador de contenido no tiene que configurarlo manualmente.

### Flujo con arquetipo

1. Arquetipo define feature con `addedAtClassLevel: ["rogue.1"]` y `suppression: [{ ids: ["trapfinding"] }]`
2. Usuario selecciona arquetipo (se añade al personaje como entidad)
3. Al resolver nivel 1 de rogue:
   - Granted normal: trapfinding, sneak-attack
   - Granted filtro: encuentra la feature del arquetipo
   - Supresión: arquetipo suprime trapfinding
   - Resultado: sneak-attack + feature del arquetipo

---

## Criterios de Aceptación

- [x] Schemas definidos para `class`, `classLevel`, `classFeature`
- [ ] Ejemplos de Fighter y Rogue como entidades
- [x] Función `buildEntityKey` implementada
- [ ] Función `resolveClassDataFromEntities` implementada
- [ ] Tests validan estructura y resolución
- [ ] Auto-inyección funcionando con tests

