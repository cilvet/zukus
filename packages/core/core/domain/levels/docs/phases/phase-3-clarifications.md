# Fase 3: Sistema de Addons - Aclaraciones

> Aclaraciones obtenidas durante el refinamiento de requisitos.

---

## Objetivo de la Fase (Revisado)

~~Definir la nueva estructura base de entidad que incluya `effects`, `specialEffects` y `props`.~~

**Nuevo objetivo**: Implementar el sistema de addons para composición de entidades, con metadata a nivel de schema.

---

## Aclaraciones Confirmadas

### No hay campo `props`
**Decisión**: Las propiedades específicas van al mismo nivel que los campos base, no dentro de un campo `props`.

**Razón**: Simplifica la estructura y el acceso a datos.

---

### Addons como array de IDs
**Decisión**: El schema define qué addons usa mediante un array de IDs.

```typescript
type EntitySchemaDefinition = {
  typeName: string;
  fields: EntityFieldDefinition[];
  addons?: string[];  // ['searchable', 'effectful']
}
```

**Rechazado**: Booleanos por addon (`searchable: true`).

---

### Campos base implícitos
**Decisión**: `id` y `entityType` son siempre implícitos, NO son un addon.

---

### Renombramiento changes → effects
**Decisión**: Se mantiene el renombramiento para entidades del sistema de niveles:
- `changes` → `effects`
- `specialChanges` → `specialEffects`

**Alcance**: Solo afecta a entidades, no al sistema de cálculo existente.

---

### AddonRegistry
**Decisión**: La función de creación de schema recibe un registro de addons disponibles.

```typescript
function createEntitySchemaWithAddons(
  definition: EntitySchemaDefinition,
  addonRegistry: AddonRegistry
): ZodSchema
```

**Razón**: Permite addons personalizados sin modificar el código base.

---

## Addons Implementados

| ID | Campos | Tipo TS |
|----|--------|---------|
| `searchable` | `name`, `description?` | `SearchableFields` |
| `taggable` | `tags?` | `TaggableFields` |
| `imageable` | `image?` | `ImageableFields` |
| `effectful` | `effects?`, `specialEffects?` | `EffectfulFields` |
| `suppressing` | `suppression?` | `SuppressingFields` |

---

## Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `core/domain/levels/entities/types.ts` | `AddonDefinition`, `AddonRegistry` |
| `core/domain/levels/entities/defaultAddons.ts` | Addons predefinidos |
| `core/domain/levels/entities/createEntitySchemaWithAddons.ts` | Función principal |
| `core/domain/levels/entities/index.ts` | Exports |
| `core/domain/entities/ADDONS.md` | Documentación |
| `core/domain/levels/__tests__/entities/createEntitySchemaWithAddons.spec.ts` | Tests (15 tests) |

---

## Modificaciones a Archivos Existentes

| Archivo | Cambio |
|---------|--------|
| `core/domain/entities/types/schema.ts` | Añadido campo `addons?: string[]` |

---

## Dependencias

### Requiere
- Ninguna

### Proporciona
- Sistema de composición de entidades para todas las fases posteriores
- Documentación clara del patrón de addons

---

## Criterios de Aceptación

- [x] Schema puede definir qué addons usa mediante array de IDs
- [x] Addons inyectan sus campos automáticamente
- [x] Campos base (id, entityType) son implícitos
- [x] Se puede usar registry personalizado
- [x] Documentación completa del sistema
- [x] Tests cubren comportamiento de la función (15 tests)
