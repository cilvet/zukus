# Sistema de Addons para Entidades

## Resumen

Las entidades en este sistema son **componibles** mediante **addons**. Un addon es un conjunto de campos predefinidos que se pueden añadir a cualquier tipo de entidad.

Este enfoque permite:
- **Reutilización**: Los mismos campos se definen una vez y se usan en múltiples tipos de entidad
- **Consistencia**: Todos los tipos que usan un addon tienen exactamente los mismos campos
- **Flexibilidad**: Cada tipo de entidad elige qué addons necesita

---

## Estructura de una Entidad

### Campos Base (Implícitos)

Todas las entidades tienen estos campos automáticamente:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | Identificador único |
| `entityType` | `string` | Tipo de entidad (ej: `"spell"`, `"feat"`) |

### Campos de Addons

Se añaden según los addons seleccionados en el schema.

### Campos Personalizados

Campos específicos del tipo de entidad, definidos en `fields`.

---

## Addons Disponibles

### `searchable`

Para entidades que pueden buscarse y mostrarse al usuario.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | `string` | ✅ | Nombre para mostrar |
| `description` | `string` | ❌ | Descripción detallada |

### `taggable`

Para entidades que pueden categorizarse con etiquetas.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `tags` | `string[]` | ❌ | Etiquetas para filtrado |

### `imageable`

Para entidades que pueden tener una imagen asociada.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `image` | `string` | ❌ | URL o ruta de imagen |

### `effectful`

Para entidades que aplican efectos al personaje.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `effects` | `Change[]` | ❌ | Efectos aplicados (antes: `changes`) |
| `specialEffects` | `SpecialChange[]` | ❌ | Efectos especiales (antes: `specialChanges`) |

**Nota**: El renombramiento `changes` → `effects` aplica solo a entidades del sistema de niveles.

### `suppressing`

Para entidades que pueden suprimir otras entidades.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `suppression` | `SuppressionConfig[]` | ❌ | Configuraciones de supresión |

Ver `core/domain/entities/types/base.ts` para detalles de `SuppressionConfig`.

---

## Uso

### Definir un Schema con Addons

```typescript
import { createEntitySchemaWithAddons } from 'core/domain/levels/entities';
import { defaultAddonRegistry } from 'core/domain/levels/entities';

const spellSchema = createEntitySchemaWithAddons(
  {
    typeName: 'spell',
    description: 'A magical spell',
    addons: ['searchable', 'taggable', 'effectful'],
    fields: [
      { name: 'level', type: 'integer' },
      { name: 'school', type: 'string', allowedValues: ['evocation', 'abjuration', 'conjuration'] },
      { name: 'components', type: 'string_array', optional: true },
    ],
  },
  defaultAddonRegistry
);
```

### Validar una Entidad

```typescript
const fireball = {
  id: 'fireball',
  entityType: 'spell',
  name: 'Fireball',
  description: 'A ball of fire',
  tags: ['damage', 'area'],
  level: 3,
  school: 'evocation',
  components: ['V', 'S', 'M'],
  effects: [
    { type: 'DAMAGE', formula: { expression: '8d6' } }
  ],
};

const result = spellSchema.safeParse(fireball);
if (result.success) {
  console.log('Válido:', result.data);
} else {
  console.log('Errores:', result.error.issues);
}
```

### Crear un Addon Personalizado

```typescript
import type { AddonDefinition, AddonRegistry } from 'core/domain/levels/entities';

const castableAddon: AddonDefinition = {
  id: 'castable',
  name: 'Castable',
  fields: [
    { name: 'castingTime', type: 'string' },
    { name: 'range', type: 'string' },
    { name: 'duration', type: 'string' },
  ],
};

const myRegistry: AddonRegistry = {
  ...defaultAddonRegistry,
  castable: castableAddon,
};

const schema = createEntitySchemaWithAddons(
  {
    typeName: 'spell',
    addons: ['searchable', 'castable'],
    fields: [],
  },
  myRegistry
);
```

---

## Relación con Tipos TypeScript

Los addons del schema corresponden a los tipos TypeScript en `core/domain/entities/types/base.ts`:

| Addon | Tipo TypeScript |
|-------|-----------------|
| `searchable` | `SearchableFields` |
| `taggable` | `TaggableFields` |
| `imageable` | `ImageableFields` |
| `effectful` | `EffectfulFields` |
| `suppressing` | `SuppressingFields` |

El tipo compuesto `StandardEntity` incluye todos estos addons:

```typescript
type StandardEntity = Entity 
  & SearchableFields 
  & TaggableFields 
  & ImageableFields 
  & EffectfulFields 
  & SuppressingFields;
```

---

## Archivos Relacionados

| Archivo | Contenido |
|---------|-----------|
| `core/domain/levels/entities/types.ts` | `AddonDefinition`, `AddonRegistry` |
| `core/domain/levels/entities/defaultAddons.ts` | Addons predefinidos |
| `core/domain/levels/entities/createEntitySchemaWithAddons.ts` | Función de creación de schema |
| `core/domain/entities/types/base.ts` | Tipos TypeScript de campos |

