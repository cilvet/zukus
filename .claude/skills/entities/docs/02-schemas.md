# Schemas y Addons

## EntitySchemaDefinition

Un schema define la estructura de un tipo de entidad.

```typescript
type EntitySchemaDefinition = {
  typeName: string;                    // "spell", "feat", "weapon"
  description?: string;                // Descripcion para documentacion
  fields: EntityFieldDefinition[];     // Campos custom
  addons?: string[];                   // IDs de addons a incluir
  version?: string;                    // Semver
};
```

**Ubicacion**: `packages/core/core/domain/entities/types/schema.ts`

### Ejemplo Completo

```typescript
// spell.schema.ts
export const spellSchema: EntitySchemaDefinition = {
  typeName: "spell",
  description: "Conjuro de D&D 3.5",
  addons: ["searchable", "taggable", "imageable", "effectful"],
  fields: [
    { name: "level", type: "integer", allowedValues: [0,1,2,3,4,5,6,7,8,9] },
    { name: "school", type: "string" },
    { name: "components", type: "string_array", nonEmpty: true },
    {
      name: "classLevels",
      type: "object_array",
      objectFields: [
        { name: "className", type: "string" },
        { name: "level", type: "integer" }
      ]
    }
  ]
}
```

## Tipos de Campo

**Ubicacion**: `packages/core/core/domain/entities/types/fields.ts`

### Primitivos

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `string` | Texto | `"Evocation"` |
| `integer` | Numero entero | `3` |
| `number` | Numero decimal | `2.5` |
| `boolean` | Verdadero/falso | `true` |
| `string_array` | Array de textos | `["V", "S", "M"]` |
| `integer_array` | Array de numeros | `[1, 2, 3]` |

### Especiales

| Tipo | Descripcion | Config Requerida |
|------|-------------|------------------|
| `enum` | Opciones con metadatos | `options: EnumOption[]` |
| `object` | Objeto anidado | `objectFields: Field[]` |
| `object_array` | Array de objetos | `objectFields: Field[]` |
| `reference` | Referencias a entidades | `referenceType: string` |
| `reference_array` | Array de referencias | `referenceType: string` |
| `image` | URL o path de imagen | - |
| `dataTable` | Tabla con filas numeradas | `rowKey`, `columns` |
| `relation` | Relaciones con metadata | `relationConfig` |

### Propiedades de Campo

```typescript
type EntityFieldDefinition = {
  name: string;              // Nombre del campo
  type: EntityFieldType;     // Tipo (ver tablas)
  description?: string;      // Descripcion
  optional?: boolean;        // Default: false (requerido)
  nonEmpty?: boolean;        // Para arrays: requiere al menos 1
  allowedValues?: [];        // Valores permitidos (deprecated, usar enum)
  isFormula?: boolean;       // Para strings con formulas
  options?: EnumOption[];    // Para enums
  objectFields?: Field[];    // Para object/object_array
  referenceType?: string;    // Para reference/reference_array
  applyEffectsToParent?: boolean;  // Para propiedades de items
  relationConfig?: {};       // Para campos de relacion
};
```

### Enum con Metadatos

Preferir `enum` con `options` sobre `allowedValues`:

```typescript
{
  name: "hitDie",
  type: "enum",
  options: [
    { value: 4, name: "d4", description: "Dado de golpe d4" },
    { value: 6, name: "d6", description: "Dado de golpe d6" },
    { value: 8, name: "d8", description: "Dado de golpe d8" },
    { value: 10, name: "d10", description: "Dado de golpe d10" },
    { value: 12, name: "d12", description: "Dado de golpe d12" }
  ]
}
```

**IMPORTANTE**: Usar `name`, no `label` en EnumOption.

### DataTable (Progresiones por Nivel)

Para tablas como niveles de clase:

```typescript
{
  name: "levels",
  type: "dataTable",
  rowKey: {
    name: "Nivel",
    startingNumber: 1,
    incremental: true
  },
  columns: [
    { id: "bab", name: "BAB", type: "integer" },
    {
      id: "features",
      name: "Aptitudes",
      type: "reference",
      referenceType: "classFeature",
      allowMultiple: true,
      optional: true
    }
  ]
}
```

Instancia:
```json
{
  "levels": {
    "1": { "bab": 1, "features": ["sneak-attack-1d6"] },
    "2": { "bab": 2, "features": ["evasion"] }
  }
}
```

## Sistema de Addons

**Ubicacion**: `packages/core/core/domain/levels/entities/defaultAddons.ts`

Los addons inyectan campos predefinidos a las entidades.

### Addons Disponibles

| Addon | Campos Anadidos | Proposito |
|-------|-----------------|-----------|
| `searchable` | `name`, `description?` | Busqueda y display en UI |
| `taggable` | `tags?: string[]` | Categorizacion |
| `imageable` | `image?: string` | Icono o imagen |
| `source` | `source?: SourceData` | Origen (compendio, pagina) |
| `effectful` | `effects?`, `legacy_changes?` | Aplica efectos al personaje |
| `autoEffectful` | `autoEffects?` | Effects con @entity.X placeholders |
| `suppressing` | `suppression?: []` | Suprime otras entidades |
| `providable` | `providers?: []` | Otorga otras entidades |
| `dnd35item` | `weight`, `cost`, etc. | Propiedades D&D 3.5 |
| `container` | `capacity`, `ignoresContentWeight` | Items contenedores |
| `activable` | instanceField `active` | Items toggle on/off |
| `equippable` | instanceField `equipped` | Items equipables |
| `wieldable` | instanceField `wielded` | Armas empunables |
| `stackable` | instanceField `quantity` | Items apilables |

### AddonDefinition

```typescript
type AddonDefinition = {
  id: string;                          // Identificador unico
  name: string;                        // Nombre legible
  fields: EntityFieldDefinition[];     // Campos a inyectar
  instanceFields?: InstanceFieldDefinition[];  // Campos por instancia
};
```

### Instance Fields

Campos editables por usuario **por cada instancia** de una entidad. Se definen en addons con la propiedad `instanceFields`.

```typescript
type InstanceFieldDefinition = {
  name: string;          // "equipped", "active", "quantity"
  type: InstanceFieldType;  // 'boolean' | 'number' | 'string'
  default: InstanceFieldValue;  // valor por defecto
  label?: string;        // Para UI
  description?: string;  // Para tooltips
};
```

**Diferencia clave**: `fields` son estaticos (parte de la definicion), `instanceFields` son editables por usuario por instancia.

```typescript
// Addon que define un instanceField
export const stackableAddon: AddonDefinition = {
  id: 'stackable',
  name: 'Stackable',
  fields: [],  // Sin campos estaticos
  instanceFields: [
    {
      name: 'quantity',
      type: 'number',
      default: 1,
      label: 'Quantity',
      description: 'Number of units in this stack',
    },
  ],
};
```

**Descubrir instance fields dinamicamente**:

```typescript
import {
  getInstanceFieldsFromCompendium,
  hasInstanceField,
} from '@zukus/core';

// Obtener todos los instance fields de un entityType
const fields = getInstanceFieldsFromCompendium('armor', compendium);
// → [{ name: 'equipped', type: 'boolean', default: false }]

// Verificar si tiene un campo especifico
if (hasInstanceField('item', 'quantity', compendium)) {
  // El schema incluye addon stackable
}
```

**Helpers tipados para campos comunes**:

```typescript
import { isItemEquipped, setItemEquipped } from '@zukus/core';

if (isItemEquipped(item)) { ... }
const updated = setItemEquipped(item, true);
```

> Ver `docs/05-inventory.md` para mas detalles sobre instance fields en inventario.

## Validacion con Zod

```typescript
import { createEntitySchema } from 'core/domain/entities';

const schema = createEntitySchema(definition);
const validated = schema.parse(instance);  // Throws si invalido
```

Con addons:
```typescript
import { createEntitySchemaWithAddons } from 'core/domain/levels/entities';

const schema = createEntitySchemaWithAddons(definition, addonRegistry);
```

## Type Guards

```typescript
import {
  isEnumField,
  isDataTableField,
  isObjectField,
  isFormulaField,
  isRelationField
} from 'core/domain/entities/types/fields';

if (isEnumField(field)) {
  // field.options esta disponible
}

if (isDataTableField(field)) {
  // field.rowKey y field.columns estan disponibles
}
```

## Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `entities/types/schema.ts` | EntitySchemaDefinition |
| `entities/types/fields.ts` | EntityFieldDefinition, tipos de campo |
| `entities/types/base.ts` | StandardEntity, addon field types |
| `levels/entities/types.ts` | AddonDefinition, AddonRegistry |
| `levels/entities/defaultAddons.ts` | Implementacion de addons |
| `levels/entities/createEntitySchemaWithAddons.ts` | Creacion de schema con addons |

## Ejemplos

Ver archivos en:
- `packages/core/core/domain/entities/examples/schemas/`
- `packages/core/core/domain/compendiums/examples/schemas/`

## Siguiente

Ver `03-storage.md` para entender como se almacenan las entidades en el personaje.
