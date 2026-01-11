# Fase 10: Sistema de Fuentes y Compendios - Aclaraciones

> Aclaraciones obtenidas durante el refinamiento de requisitos.

---

## Objetivo de la Fase

Implementar sistema para organizar entidades por fuentes/libros con dependencias entre compendios.

---

## Aclaraciones Confirmadas

### Concepto de Compendio
**Decisión**: Un compendio es una colección de contenido (entidades + schemas) que proviene de una fuente específica (libro, suplemento, homebrew).

**Ejemplos**:
- Compendio "D&D 3.5 Core" define tipos base: `feat`, `spell`, `class_feature`
- Compendio "Complete Warrior" depende de "Core", añade nuevas entidades de tipo `feat` y `class_feature`
- Compendio "My Homebrew" depende de "Core", define nuevo tipo `custom_power`

---

### Dependencias entre compendios
**Decisión**: Los compendios pueden declarar dependencias de otros compendios. Al cargar un compendio, se cargan automáticamente sus dependencias.

**Razón**: Evita duplicación. "Complete Warrior" no tiene que redefinir qué es un `feat`, simplemente depende de "Core" que ya lo define.

---

### Campo compendiumId en entidades
**Decisión**: Todas las entidades tienen un campo `compendiumId` que indica de qué compendio provienen.

**Razón**: Permite filtrar entidades por fuente, y mostrar al usuario de dónde viene cada capacidad.

---

### Schemas también tienen compendiumId
**Decisión**: Los schemas también pertenecen a un compendio.

**Razón**: Algunos compendios definen nuevos tipos de entidades.

---

### Versionado de compendios
**Decisión**: Los compendios tienen versión semántica (ej: "1.0.0").

**Razón**: Permite migraciones y compatibilidad futura.

---

## Preguntas Pendientes

### P1: ¿Los compendios pueden sobrescribir schemas de dependencias?
**Pregunta**: Si "Core" define el tipo `feat` con ciertos campos, ¿puede "Custom Rules" redefinir el tipo `feat`?

**Opciones**:
- A) No - Los schemas son inmutables una vez definidos
- B) Sí - El compendio puede extender/modificar schemas
- C) Solo extensión - Puede añadir campos pero no quitar

**Recomendación**: A - Inmutables (simplicidad). Si quieres modificar, crea nuevo tipo

---

### P2: ¿Cómo se manejan conflictos de IDs de entidades?
**Pregunta**: Si dos compendios definen entidad con mismo ID, ¿qué pasa?

**Opciones**:
- A) Error - IDs deben ser únicos globalmente
- B) Warning - Se usa la del compendio cargado después
- C) Namespace - IDs se prefizan con compendio: `core:power-attack`

**Recomendación**: A - Error (fuerza buenas prácticas)

---

### P3: ¿Se validan las versiones de dependencias?
**Pregunta**: ¿Un compendio puede declarar `dependsOn: ["dnd35-core@^3.0.0"]` con rango de versiones?

**Recomendación**: No en V0 - Solo ID, sin validación de versiones (por ahora)

---

### P4: ¿Los compendios son mutables o inmutables?
**Pregunta**: Una vez cargado un compendio, ¿se puede añadir/quitar entidades dinámicamente?

**Recomendación**: Inmutables - Un compendio se carga completo y no cambia

---

### P5: ¿Cómo se organizan los compendios en disco?
**Opciones**:
- A) Un archivo por compendio: `compendiums/dnd35-core.json`
- B) Directorio por compendio: `compendiums/dnd35-core/manifest.json` + archivos separados
- C) Base de datos

**Recomendación**: A inicialmente - Un archivo JSON por compendio (simple)

---

## Entregables

### E.1 - Tipo Compendium
```typescript
type Compendium = {
  id: string;
  name: string;
  description?: string;
  version: string;
  
  dependsOn?: string[];
  
  schemas: EntitySchemaDefinition[];
  entities: Entity[];
  
  metadata?: {
    author?: string;
    source?: string;
    official?: boolean;
    tags?: string[];
  };
}
```

### E.2 - Función validateCompendiumDependencies
```typescript
type DependencyValidationResult = {
  valid: boolean;
  errors: string[];
};

function validateCompendiumDependencies(
  compendium: Compendium,
  allCompendiums: Compendium[]
): DependencyValidationResult
```

Verifica:
- Dependencias existen
- No hay ciclos
- (Futuro: versiones compatibles)

### E.3 - Función resolveCompendiums
```typescript
type CompendiumResolutionResult = {
  schemas: Map<string, EntitySchemaDefinition>;
  entities: Entity[];
  compendiumsLoaded: string[];
  errors: string[];
  warnings: string[];
};

function resolveCompendiums(
  activeCompendiumIds: string[],
  allCompendiums: Compendium[]
): CompendiumResolutionResult
```

Proceso:
1. Resuelve dependencias recursivamente
2. Detecta ciclos
3. Ordena compendios (dependencias primero)
4. Combina schemas (detecta duplicados)
5. Combina entidades (detecta duplicados)
6. Devuelve resultado consolidado

### E.4 - Campo compendiumId en entidades
Modificar tipo base `Entity`:
```typescript
type Entity = {
  id: string;
  entityType: string;
  compendiumId: string;  // NUEVO
}
```

### E.5 - Campo compendiumId en schemas
Modificar tipo `EntitySchemaDefinition`:
```typescript
type EntitySchemaDefinition = {
  typeName: string;
  description?: string;
  fields: EntityFieldDefinition[];
  addons?: string[];
  compendiumId?: string;  // NUEVO (opcional por compatibilidad)
}
```

---

## Casos de Uso a Cubrir (Tests)

### Caso 1: Compendio simple sin dependencias
```typescript
const core: Compendium = {
  id: 'dnd35-core',
  name: 'D&D 3.5 Core',
  version: '1.0.0',
  schemas: [
    { typeName: 'feat', fields: [...], compendiumId: 'dnd35-core' }
  ],
  entities: [
    { id: 'power-attack', entityType: 'feat', compendiumId: 'dnd35-core', ... }
  ]
};

const result = resolveCompendiums(['dnd35-core'], [core]);
// → schemas: Map { 'feat' => {...} }
// → entities: [power-attack]
// → compendiumsLoaded: ['dnd35-core']
```

### Caso 2: Compendio con dependencias
```typescript
const core: Compendium = { id: 'dnd35-core', ... };
const completeWarrior: Compendium = {
  id: 'complete-warrior',
  dependsOn: ['dnd35-core'],
  schemas: [],  // No define tipos nuevos
  entities: [
    { id: 'weapon-finesse-improved', entityType: 'feat', compendiumId: 'complete-warrior', ... }
  ]
};

const result = resolveCompendiums(['complete-warrior'], [core, completeWarrior]);
// → compendiumsLoaded: ['dnd35-core', 'complete-warrior']  // Core cargado automáticamente
// → entities incluye entidades de ambos compendios
```

### Caso 3: Ciclo de dependencias
```typescript
const a: Compendium = { id: 'a', dependsOn: ['b'], ... };
const b: Compendium = { id: 'b', dependsOn: ['a'], ... };

const result = resolveCompendiums(['a'], [a, b]);
// → valid: false
// → errors: ['Circular dependency detected: a -> b -> a']
```

### Caso 4: Dependencia no encontrada
```typescript
const compendium: Compendium = {
  id: 'custom',
  dependsOn: ['missing-compendium'],
  ...
};

const result = resolveCompendiums(['custom'], [compendium]);
// → errors: ['Dependency not found: missing-compendium']
```

### Caso 5: Conflicto de IDs de entidades
```typescript
const core: Compendium = {
  id: 'core',
  entities: [
    { id: 'power-attack', compendiumId: 'core', ... }
  ]
};
const custom: Compendium = {
  id: 'custom',
  entities: [
    { id: 'power-attack', compendiumId: 'custom', ... }  // Mismo ID
  ]
};

const result = resolveCompendiums(['core', 'custom'], [core, custom]);
// → errors: ['Duplicate entity ID: power-attack (in compendiums: core, custom)']
```

### Caso 6: Filtrar entidades por compendio
```typescript
const filter = {
  type: 'AND',
  conditions: [
    { field: 'compendiumId', operator: '==', value: 'dnd35-core' }
  ]
};
const results = filterEntitiesWithVariables(allEntities, [filter], {});
// → Solo entidades de dnd35-core
```

### Caso 7: Dependencias transitivas
```typescript
const a: Compendium = { id: 'a', ... };
const b: Compendium = { id: 'b', dependsOn: ['a'], ... };
const c: Compendium = { id: 'c', dependsOn: ['b'], ... };

const result = resolveCompendiums(['c'], [a, b, c]);
// → compendiumsLoaded: ['a', 'b', 'c']  // Todas las dependencias cargadas
```

---

## Archivos a Crear

- `core/domain/entities/compendium/types.ts`
- `core/domain/entities/compendium/validateDependencies.ts`
- `core/domain/entities/compendium/resolveCompendiums.ts`
- `core/domain/entities/compendium/index.ts`
- `core/domain/entities/__tests__/compendium/validateDependencies.spec.ts`
- `core/domain/entities/__tests__/compendium/resolveCompendiums.spec.ts`
- `core/domain/entities/__tests__/compendium/cycles.spec.ts`

---

## Archivos a Modificar

- `core/domain/entities/types/base.ts` - Añadir `compendiumId` a Entity
- `core/domain/entities/types/schema.ts` - Añadir `compendiumId` opcional a EntitySchemaDefinition

---

## Criterios de Aceptación

- [ ] Se puede definir un compendio con schemas y entidades
- [ ] Las dependencias se validan correctamente
- [ ] La resolución carga dependencias recursivamente
- [ ] Se detectan ciclos de dependencias
- [ ] Las entidades tienen compendiumId
- [ ] Los schemas tienen compendiumId
- [ ] Se pueden filtrar entidades por compendio
- [ ] Se detectan conflictos de IDs de entidades
- [ ] Se detectan conflictos de nombres de schemas
- [ ] Tests cubren: compendio simple, con dependencias, ciclos, dependencia no encontrada, conflictos

---

## Dependencias

**Requiere**:
- Sistema base de entidades (schemas, instancias) ✅
- Sistema de filtros ✅

**Proporciona**:
- Organización de contenido por fuentes usado en toda la aplicación
- Base para marketplace de compendios (futuro)

