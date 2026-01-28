# Sistema de Relaciones entre Entidades

## Problema que Resuelve

En D&D 3.5, los conjuros no tienen un nivel único - tienen niveles diferentes según la clase:
- Magic Missile es nivel 1 para Wizard y Sorcerer
- Cure Light Wounds es nivel 1 para Cleric, pero nivel 2 para Ranger

Si codificamos esto directamente en la entidad de conjuro (`classLevels: [{ className: 'Wizard', level: 1 }]`), tenemos dos problemas:

1. **No extensible**: Una dote o clase custom no puede añadir nuevos niveles
2. **No filtrable directamente**: Requiere JMESPath complejo para filtrar

## Solución: Entidades de Relación

Las relaciones entre entidades se modelan como **entidades separadas** con metadatos:

```typescript
// Entidad de relación
{
  id: 'fireball--wizard',
  entityType: 'spell-class-relation',
  fromEntityId: 'fireball',
  toEntityId: 'wizard',
  metadata: { level: 3 }
}
```

Al cargar las entidades, las relaciones se **compilan** en estructuras directamente filtrables:

```typescript
// Spell enriquecido
{
  id: 'fireball',
  name: 'Bola de Fuego',
  classLevels: {
    relations: [
      { targetId: 'wizard', metadata: { level: 3 } },
      { targetId: 'sorcerer', metadata: { level: 3 } }
    ],
    classLevelKeys: ['wizard:3', 'sorcerer:3'],  // ← Filtrable con 'contains'
    classLevels: { wizard: 3, sorcerer: 3 }      // ← Acceso directo O(1)
  }
}
```

## Configuración en el Schema

Para usar relaciones en una entidad, define un campo de tipo `relation`:

```typescript
// En el schema de spell
{
  name: 'classLevels',
  type: 'relation',
  relationConfig: {
    // Tipo de entidad de relación a buscar
    relationType: 'spell-class-relation',

    // Tipo de entidad destino
    targetEntityType: 'class',

    // Campos de metadata que tiene la relación
    metadataFields: [
      { name: 'level', type: 'integer', required: true }
    ],

    // Cómo compilar a estructura filtrable
    compile: {
      // Formato de las claves (placeholders: {targetId}, {metadata.X})
      keyFormat: '{targetId}:{metadata.level}',

      // Nombre del array de claves generado
      keysFieldName: 'classLevelKeys',

      // (Opcional) Nombre del mapa de acceso directo
      mapFieldName: 'classLevels',

      // (Opcional) Campo de metadata para el valor del mapa
      mapValueField: 'level'
    }
  }
}
```

## Filtrado

El sistema genera estructuras filtrables con el operador `contains` existente:

```typescript
import { createRelationCondition } from './filterHelpers'
import { filterEntitiesWithVariables } from '../../levels/filtering/filterWithVariables'

// Filtrar por "Wizard nivel 3"
const condition = createRelationCondition('classLevels.classLevelKeys', 'wizard', 3)
// Genera: { field: 'classLevels.classLevelKeys', operator: 'contains', value: 'wizard:3' }

const results = filterEntitiesWithVariables(spells, [{
  type: 'AND',
  filterPolicy: 'strict',
  conditions: [condition]
}], {})
```

### Ejemplos de Filtros

```typescript
// Wizard nivel 1
{ field: 'classLevels.classLevelKeys', operator: 'contains', value: 'wizard:1' }

// Wizard nivel 1 O Sorcerer nivel 1
{
  type: 'OR',
  filterPolicy: 'strict',
  conditions: [
    { field: 'classLevels.classLevelKeys', operator: 'contains', value: 'wizard:1' },
    { field: 'classLevels.classLevelKeys', operator: 'contains', value: 'sorcerer:1' }
  ]
}

// Wizard nivel 3 + escuela evocación
{
  type: 'AND',
  filterPolicy: 'strict',
  conditions: [
    { field: 'classLevels.classLevelKeys', operator: 'contains', value: 'wizard:3' },
    { field: 'school', operator: '==', value: 'evocación' }
  ]
}
```

## Pipeline de Carga

```typescript
import { buildRelationIndex, enrichEntitiesWithRelations } from './compiler'

// 1. Cargar entidades y relaciones del compendium
const spells: Entity[] = loadSpells()
const relations: RelationEntity[] = loadRelations()

// 2. Construir índice (O(n) donde n = relaciones)
const index = buildRelationIndex(relations)

// 3. Enriquecer entidades (O(m * k) donde m = entidades, k = relaciones promedio)
const enrichedSpells = enrichEntitiesWithRelations(spells, [
  {
    fieldName: 'classLevels',
    config: SPELL_CLASS_FIELD_CONFIG
  }
], index)

// 4. Ahora las entidades están listas para filtrar
```

## Performance

Probado con dataset real (2,789 spells, 5,956 relaciones):

| Operación | Tiempo |
|-----------|--------|
| Build index | 0.6ms |
| Enrich 2,789 spells | 5ms |
| Filter wizard:1 | 1.6ms |
| Filter combinado | 1.4ms |

## Helpers para UI

```typescript
import {
  extractUniqueTargets,
  extractMetadataValuesForTarget,
  countByRelationKey
} from './filterHelpers'

// Obtener todas las clases disponibles (para dropdown)
const classes = extractUniqueTargets(spells, 'classLevels')
// → ['cleric', 'druid', 'ranger', 'sorcerer', 'wizard', ...]

// Obtener niveles disponibles para una clase
const levels = extractMetadataValuesForTarget(spells, 'classLevels', 'wizard', 'level')
// → [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

// Contar spells por combinación (para mostrar "(15)" junto a cada opción)
const counts = countByRelationKey(spells, 'classLevels.classLevelKeys')
// → Map { "wizard:1" => 185, "wizard:2" => 150, ... }
```

## Otros Casos de Uso

El sistema es genérico. Otros ejemplos implementados en tests:

### Feat Prerequisites
```typescript
// Relación: cleave requiere power-attack
{
  relationType: 'feat-prerequisite',
  compile: { keyFormat: '{targetId}:{metadata.type}' }  // → "power-attack:required"
}
```

### Class Features by Level
```typescript
// Relación: evasion se obtiene a nivel 2 de rogue
{
  relationType: 'class-feature-grant',
  compile: { keyFormat: '{targetId}:{metadata.level}' }  // → "rogue:2"
}
```

### Item Slots
```typescript
// Relación: ring-of-protection va en slot "ring"
{
  relationType: 'item-slot',
  compile: { keyFormat: '{targetId}:{metadata.exclusive}' }  // → "ring:false"
}
```

### Monster Abilities
```typescript
// Relación: breath-weapon usado por red-dragon CR 10
{
  relationType: 'monster-ability-grant',
  compile: {
    keyFormat: '{targetId}:{metadata.challengeRating}',
    mapFieldName: 'crLevels',
    mapValueField: 'challengeRating'
  }
}
```

## Estructura de Archivos

```
relations/
├── README.md           # Esta documentación
├── index.ts            # Exports públicos
├── compiler.ts         # Construcción de índices y compilación
├── filterHelpers.ts    # Helpers para generar filtros y UI
└── __testdata__/       # Dataset de prueba (2,789 spells)
    ├── spells.json
    └── spell-class-relations.json
```

## Tipos Principales

```typescript
// En types/base.ts
type RelationFieldConfig = {
  relationType: string
  targetEntityType: string
  metadataFields: RelationMetadataField[]
  compile?: RelationCompileConfig
}

type RelationCompileConfig = {
  keyFormat: string
  keysFieldName: string
  mapFieldName?: string
  mapValueField?: string
}

// En compiler.ts
type RelationEntity = {
  id: string
  entityType: string
  fromEntityId: string
  toEntityId: string
  metadata: Record<string, unknown>
}

type RelationIndex = {
  byFrom: Map<string, Map<string, RelationEntity[]>>
  byTo: Map<string, Map<string, RelationEntity[]>>
}
```

## Extensibilidad

Para añadir relaciones desde una dote o clase custom:

1. **Crear entidades de relación** adicionales en el compendium
2. **Recargar el índice** incluyendo las nuevas relaciones
3. Las entidades se enriquecerán automáticamente con los nuevos datos

El sistema no requiere modificar las entidades base - solo añadir nuevas relaciones.
