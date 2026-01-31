# Relaciones entre Entidades

Sistema para modelar relaciones N:N con metadatos, compilandolas en estructuras filtrables.

> Ver tambien: `.cursor/rules/core/entity-relations-system.mdc`

## Casos de Uso

- **spell-class**: Spells por clase y nivel
- **maneuver-class**: Maniobras por clase y nivel
- **feat-prerequisite**: Dotes que requieren otras dotes
- **class-feature-grant**: Habilidades por nivel de clase
- **item-slot**: Items en slots de equipo

## Arquitectura

```
RelationEntity (JSON)
    |
    v
buildRelationIndex() -> RelationIndex
    |
    v
enrichEntitiesWithRelations() -> Entidades con campos filtrables
    |
    v
RelationFilterDef (UI) -> Filtrado
```

## RelationEntity

Archivo JSON con las relaciones:

```json
[
  {
    "id": "fireball--wizard",
    "entityType": "spell-class-relation",
    "fromEntityId": "fireball",
    "toEntityId": "wizard",
    "metadata": { "level": 3 }
  },
  {
    "id": "fireball--sorcerer",
    "entityType": "spell-class-relation",
    "fromEntityId": "fireball",
    "toEntityId": "sorcerer",
    "metadata": { "level": 3 }
  }
]
```

Ubicacion: `packages/core/core/domain/entities/relations/__testdata__/`

## RelationFieldConfig

Define como compilar las relaciones:

```typescript
const SPELL_CLASS_CONFIG: RelationFieldConfig = {
  relationType: 'spell-class-relation',
  targetEntityType: 'class',
  metadataFields: [
    { name: 'level', type: 'integer', required: true }
  ],
  compile: {
    keyFormat: '{targetId}:{metadata.level}',  // "wizard:3"
    keysFieldName: 'classLevelKeys',           // Array de claves
    mapFieldName: 'classLevels',               // Mapa directo
    mapValueField: 'level',                    // Valor del mapa
  },
};
```

### keyFormat Placeholders

- `{targetId}` -> ID de destino en minusculas
- `{metadata.fieldName}` -> Valor del campo de metadata

### Ejemplos de Formato

```typescript
// spell-class
keyFormat: '{targetId}:{metadata.level}'
-> "wizard:3"

// feat-prerequisite
keyFormat: '{targetId}:{metadata.type}'
-> "power-attack:required"

// item-slot
keyFormat: '{targetId}:{metadata.exclusive}'
-> "ring:false"
```

## Pipeline de Enriquecimiento

```typescript
import {
  buildRelationIndex,
  enrichEntitiesWithRelations
} from '@zukus/core';

// 1. Cargar relaciones
import relationsData from './spell-class-relations.json';

// 2. Construir indice (O(n), ~0.6ms para 6000 relaciones)
const index = buildRelationIndex(relationsData);

// 3. Enriquecer entidades (~5ms para 2800 spells)
const enrichedSpells = enrichEntitiesWithRelations(
  rawSpells,
  [{ fieldName: 'classData', config: SPELL_CLASS_CONFIG }],
  index
);
```

## Resultado: Entidad Enriquecida

```typescript
// Spell enriquecido
{
  id: "fireball",
  name: "Fireball",
  school: "Evocation",

  classData: {
    relations: [
      { targetId: 'wizard', metadata: { level: 3 } },
      { targetId: 'sorcerer', metadata: { level: 3 } },
    ],
    classLevelKeys: ['wizard:3', 'sorcerer:3'],  // Filtrable
    classLevels: { wizard: 3, sorcerer: 3 }      // Acceso directo
  }
}
```

## Filtrado con classLevelKeys

```typescript
// Filtrar "Wizard nivel 3"
const wizardLevel3Spells = spells.filter(spell =>
  spell.classData.classLevelKeys.includes('wizard:3')
);

// O con el sistema de filtros
import { createRelationCondition } from '@zukus/core';

const condition = createRelationCondition(
  'classData.classLevelKeys',
  'wizard',
  3
);
// { field: 'classData.classLevelKeys', operator: 'contains', value: 'wizard:3' }
```

## Helpers para UI

```typescript
import {
  extractUniqueTargets,
  extractMetadataValuesForTarget,
  countByRelationKey
} from '@zukus/core';

// Obtener clases disponibles
const classes = extractUniqueTargets(spells, 'classData');
// ['cleric', 'druid', 'ranger', 'sorcerer', 'wizard']

// Obtener niveles para una clase
const levels = extractMetadataValuesForTarget(
  spells, 'classData', 'wizard', 'level'
);
// [1, 2, 3, 4, 5, 6, 7, 8, 9]

// Contar por clave (para mostrar "(15)")
const counts = countByRelationKey(spells, 'classData.classLevelKeys');
// Map { 'wizard:1' => 185, 'wizard:2' => 150, ... }
```

## Ejemplos de Tipos de Relacion

### Feat Prerequisites

```typescript
const featPrerequisiteConfig = {
  relationType: 'feat-prerequisite',
  compile: { keyFormat: '{targetId}:{metadata.type}' }
};

// Relacion:
{ fromEntityId: 'cleave', toEntityId: 'power-attack', metadata: { type: 'required' } }

// Clave: "power-attack:required"
```

### Class Features by Level

```typescript
const classFeatureConfig = {
  relationType: 'class-feature-grant',
  compile: { keyFormat: '{targetId}:{metadata.level}' }
};

// Relacion:
{ fromEntityId: 'evasion', toEntityId: 'rogue', metadata: { level: 2 } }

// Clave: "rogue:2"
```

## Performance

Con dataset real (2,789 spells, 5,956 relaciones):

| Operacion | Tiempo |
|-----------|--------|
| Build index | 0.6ms |
| Enrich 2,789 spells | 5ms |
| Filter wizard:1 | 1.6ms |

## Extensibilidad via Compendios

Las relaciones permiten expandir el sistema sin modificar entidades existentes:

1. Un compendio nuevo puede definir clases homebrew
2. Crear relaciones spell-class en ese compendio para que la clase acceda a conjuros del compendio base
3. Los conjuros originales no se modifican - la relacion vive en el compendio que la define

```
Compendio Base                    Compendio Homebrew
+------------------+              +------------------+
| spell: Fireball  |              | class: Pyromancer|
| spell: IceStorm  |              |                  |
+------------------+              | relation:        |
                                  |   Fireball ->    |
                                  |   Pyromancer lv1 |
                                  +------------------+
```

Al cargar ambos compendios, las relaciones se compilan juntas y Pyromancer puede filtrar sus spells como cualquier clase oficial.

## Anadir Nueva Relacion

1. Crear archivo JSON de relaciones
2. Definir `RelationFieldConfig`
3. Llamar a `compileAndEnrichEntities` en el loader
4. Las entidades se enriquecen automaticamente

No requiere modificar codigo existente.

## Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `entities/relations/compiler.ts` | buildRelationIndex, enrichEntitiesWithRelations |
| `entities/relations/filterHelpers.ts` | Helpers para UI |
| `entities/types/base.ts` | RelationFieldConfig |
| `entities/relations/README.md` | Documentacion completa |

## Siguiente

Ver `07-facets-filters.md` para el sistema de facetado y filtros UI.
