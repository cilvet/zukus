# Plan: Sistema de Compendios

> **Estado**: ✅ Implementación completa  
> **Fecha**: 2025-01-02  
> **Última actualización**: 2025-01-02  
> **Relacionado con**: [entities.status.readme.md](../character/calculation/entities/entities.status.readme.md)

---

## 📋 Resumen Ejecutivo

Este documento define el sistema de **Compendios** para gestionar contenido modular (entityTypes + entidades) que puede ser activado/desactivado por personaje.

### Objetivo

Permitir que el contenido del juego (spells, feats, items, etc.) esté organizado en **packs de contenido** (compendios) con:
- Schemas de entityTypes con versiones
- Instancias de entidades
- Dependencias entre compendios
- Activación/desactivación por personaje

### Alcance

- ✅ Definir estructura de Compendium
- ✅ Sistema de dependencias entre compendios
- ✅ Resolución de contexto para cálculo
- ✅ Validación de customEntities contra schemas
- ❌ Gestión de conflictos de schemas (futuro)
- ❌ Migraciones de versiones (futuro)
- ❌ UI de gestión de compendios (visual playground)

---

## 🎯 Decisiones de Diseño

### 1. Compendio Core

**Decisión**: El compendio "core" (SRD) se carga igual que cualquier otro compendio. No hay entityTypes hardcodeados en la biblioteca.

**Razón**: Flexibilidad total. La biblioteca es agnóstica del contenido.

---

### 2. Estructura de Compendium

**Decisión**: Un compendio contiene schemas + entidades + dependencias.

```typescript
type Compendium = {
  id: string;
  name: string;
  version: string;
  description?: string;
  dependencies: string[];
  schemas: EntitySchemaDefinition[];
  entities: Record<string, StandardEntity[]>;
}
```

---

### 3. Versiones en Schemas

**Decisión**: Añadir campo `version` a `EntitySchemaDefinition`.

```typescript
type EntitySchemaDefinition = {
  typeName: string;
  version: string;  // ← NUEVO: semver "1.0.0"
  description?: string;
  fields: EntityFieldDefinition[];
  addons?: string[];
}
```

**Razón**: Permite migraciones futuras y compatibilidad.

---

### 4. CompendiumRegistry Ligero

**Decisión**: El registry usa referencias ligeras, no compendios completos.

```typescript
type CompendiumReference = {
  id: string;
  name: string;
};

type CompendiumRegistry = {
  available: CompendiumReference[];
  active: string[];
};
```

**Razón**: Eficiencia. Los compendios completos se cargan bajo demanda.

---

### 5. ResolvedEntityType Agrupado

**Decisión**: Agrupar schema + validator juntos en una sola estructura.

```typescript
type ResolvedEntityType = {
  schema: EntitySchemaDefinition;
  validator: z.ZodSchema;
  sourceCompendiumId: string;
};
```

**Razón**: Acceso conveniente a ambos en el mismo lugar.

---

### 6. Conflictos de Schemas

**Decisión**: No gestionar conflictos por ahora. Si dos compendios definen el mismo `typeName`, no se permite usar ambos a la vez.

**Comportamiento**: Generar warning y usar solo el primero encontrado.

---

### 7. Validación de Entidades

**Decisión**: 
- Entidades de compendio → Se asumen válidas (ya validadas al crear el compendio)
- CustomEntities del usuario → Se validan en `calculateCharacterSheet()`

---

### 8. Sin Contexto de Compendios

**Decisión**: Si no hay `compendiumContext`, generar warning y skip customEntities.

**Razón**: Modo permisivo para desarrollo/testing.

---

## 📐 Tipos TypeScript

### Tipos Existentes a Extender

```typescript
// core/domain/entities/types/schema.ts
export type EntitySchemaDefinition = {
  typeName: string;
  description?: string;
  fields: EntityFieldDefinition[];
  addons?: string[];
  version: string;  // ← AÑADIR
};
```

```typescript
// core/domain/character/baseData/character.ts
export type CharacterBaseData = {
  // ... campos existentes
  activeCompendiums?: string[];  // ← AÑADIR
  customEntities?: Record<string, StandardEntity[]>;  // ← AÑADIR
};
```

### Tipos Nuevos

```typescript
// core/domain/compendiums/types.ts

import type { z } from 'zod';
import type { EntitySchemaDefinition } from '../entities/types/schema';
import type { StandardEntity } from '../entities/types/base';

/**
 * Un compendio es un pack de contenido modular.
 */
export type Compendium = {
  /** Identificador único */
  id: string;
  
  /** Nombre para mostrar */
  name: string;
  
  /** Versión del compendio (semver) */
  version: string;
  
  /** Descripción opcional */
  description?: string;
  
  /** IDs de compendios requeridos */
  dependencies: string[];
  
  /** Schemas de entityTypes que define */
  schemas: EntitySchemaDefinition[];
  
  /** Instancias organizadas por entityType */
  entities: Record<string, StandardEntity[]>;
};

/**
 * Referencia ligera a un compendio.
 */
export type CompendiumReference = {
  id: string;
  name: string;
};

/**
 * Registro de compendios disponibles y activos.
 */
export type CompendiumRegistry = {
  available: CompendiumReference[];
  active: string[];
};

/**
 * EntityType resuelto con schema y validador.
 */
export type ResolvedEntityType = {
  schema: EntitySchemaDefinition;
  validator: z.ZodSchema;
  sourceCompendiumId: string;
};

/**
 * Warning durante resolución de compendios.
 */
export type CompendiumWarning = {
  type: 
    | 'missing_dependency' 
    | 'schema_conflict' 
    | 'unknown_entity_type' 
    | 'invalid_entity'
    | 'no_context';
  message: string;
  context?: Record<string, unknown>;
};

/**
 * Contexto de compendios completamente resuelto.
 */
export type ResolvedCompendiumContext = {
  /** EntityTypes disponibles, indexados por typeName */
  entityTypes: Map<string, ResolvedEntityType>;
  
  /** Lista de typeNames disponibles */
  availableTypeNames: string[];
  
  /** Compendios activos (referencias) */
  activeCompendiums: CompendiumReference[];
  
  /** Warnings de resolución */
  warnings: CompendiumWarning[];
};
```

---

## 📁 Estructura de Archivos

### Nuevos Archivos

```
core/domain/compendiums/           # NUEVO directorio
├── types.ts                       # Tipos: Compendium, Registry, Context
├── resolve.ts                     # resolveCompendiumContext()
├── validateCustomEntities.ts      # validateCustomEntities()
├── index.ts                       # Exports públicos
└── COMPENDIUM_SYSTEM_PLAN.md      # Este documento
```

### Archivos a Modificar

```
core/domain/entities/types/schema.ts
  └── Añadir campo `version` a EntitySchemaDefinition

core/domain/character/baseData/character.ts
  └── Añadir campos `activeCompendiums` y `customEntities`

core/domain/character/calculation/calculateCharacterSheet.ts
  └── Añadir CalculationContext y llamar a validación

core/domain/character/calculatedSheet/sheet.ts
  └── Añadir campo `warnings` a CharacterSheet (si no existe)
```

---

## 🔧 Funciones Principales

### 1. resolveCompendiumContext()

```typescript
/**
 * Resuelve los compendios activos a un contexto utilizable.
 * 
 * @param registry - Registro con IDs de compendios disponibles/activos
 * @param loadCompendium - Función para cargar un compendio por ID
 * @returns Contexto resuelto con entityTypes y warnings
 */
function resolveCompendiumContext(
  registry: CompendiumRegistry,
  loadCompendium: (id: string) => Compendium | undefined
): ResolvedCompendiumContext;
```

**Responsabilidades**:
1. Cargar compendios activos usando `loadCompendium`
2. Verificar que las dependencias estén activas
3. Registrar schemas (primero gana si hay conflicto)
4. Generar validadores Zod para cada schema
5. Devolver contexto con warnings

---

### 2. validateCustomEntities()

```typescript
/**
 * Valida las customEntities del personaje contra los schemas.
 * 
 * @param customEntities - Entidades del usuario por entityType
 * @param compendiumContext - Contexto resuelto con validadores
 * @returns Entidades válidas + warnings
 */
function validateCustomEntities(
  customEntities: Record<string, StandardEntity[]> | undefined,
  compendiumContext: ResolvedCompendiumContext | undefined
): {
  validEntities: StandardEntity[];
  warnings: CharacterWarning[];
};
```

**Responsabilidades**:
1. Verificar que cada entityType existe en el contexto
2. Validar cada entidad con el validador Zod correspondiente
3. Filtrar entidades inválidas
4. Generar warnings descriptivos

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│ App / Visual Playground                                         │
│                                                                 │
│  1. Usuario activa/desactiva compendios                        │
│  2. Crear CompendiumRegistry { available, active }             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ resolveCompendiumContext(registry, loadCompendium)              │
│                                                                 │
│  • Cargar compendios activos                                   │
│  • Verificar dependencias                                      │
│  • Crear validadores Zod                                       │
│  • Detectar conflictos → warnings                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ ResolvedCompendiumContext                                       │
│  ├─ entityTypes: Map<typeName, {schema, validator, source}>    │
│  ├─ availableTypeNames: ['spell', 'feat', ...]                 │
│  ├─ activeCompendiums: [{id, name}, ...]                       │
│  └─ warnings: [...]                                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ calculateCharacterSheet(character, { compendiumContext })       │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ validateCustomEntities(customEntities, context)         │    │
│  │  → { validEntities, warnings }                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                  │
│                              ▼                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ compileCharacterEntities(validEntities)                 │    │
│  │  → { computedEntities, changes, ... }                   │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                  │
│                              ▼                                  │
│  Pipeline de cálculo existente...                              │
│                                                                 │
│  → CharacterSheet { ..., computedEntities, warnings }          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Plan de Implementación

### Fase 1: Tipos Base ✅

**Archivos**:
- `core/domain/compendiums/types.ts`
- `core/domain/entities/types/schema.ts` (modificar)

**Tareas**:
- [x] Añadir `version` a `EntitySchemaDefinition`
- [x] Crear tipo `Compendium`
- [x] Crear tipo `CompendiumReference`
- [x] Crear tipo `CompendiumRegistry`
- [x] Crear tipo `ResolvedEntityType`
- [x] Crear tipo `CompendiumWarning`
- [x] Crear tipo `ResolvedCompendiumContext`

---

### Fase 2: Función de Resolución ✅

**Archivos**:
- `core/domain/compendiums/resolve.ts`

**Tareas**:
- [x] Implementar `resolveCompendiumContext()`
- [x] Cargar compendios activos
- [x] Verificar dependencias
- [x] Detectar conflictos de schemas
- [x] Generar validadores Zod
- [x] Tests para resolución (8 tests)

---

### Fase 3: Validación de CustomEntities ✅

**Archivos**:
- `core/domain/compendiums/validateCustomEntities.ts`

**Tareas**:
- [x] Implementar `validateCustomEntities()`
- [x] Validar entityType existe
- [x] Validar entidad contra schema
- [x] Filtrar inválidas + warnings
- [x] Tests para validación (12 tests)

---

### Fase 4: Integración en CharacterBaseData ✅

**Archivos**:
- `core/domain/character/baseData/character.ts`

**Tareas**:
- [x] Añadir `activeCompendiums?: string[]`
- [x] Añadir `customEntities?: Record<string, StandardEntity[]>`
- [x] Verificar imports

---

### Fase 5: Integración en calculateCharacterSheet ✅

**Archivos**:
- `core/domain/character/calculation/calculateCharacterSheet.ts`
- `core/domain/character/calculatedSheet/sheet.ts`
- `core/domain/character/calculation/entities/compileCharacterEntities.ts`

**Tareas**:
- [x] Definir tipo `CalculationContext`
- [x] Llamar a `validateCustomEntities()` al inicio
- [x] Implementar `compileCharacterEntities()`
- [x] Integrar `compileCharacterEntities()` en el pipeline
- [x] Agregar warnings al sheet
- [x] Añadir tipo `CharacterWarning` al sheet
- [x] Añadir `computedEntities` al CharacterSheet
- [x] Tests de integración (10 tests)

---

### Fase 6: Exports e Índice ✅

**Archivos**:
- `core/domain/compendiums/index.ts`

**Tareas**:
- [x] Exportar tipos públicos
- [x] Exportar funciones públicas
- [x] Documentar API pública

---

## ✅ Checklist de Implementación

### Tipos
- [x] `EntitySchemaDefinition.version`
- [x] `Compendium`
- [x] `CompendiumReference`
- [x] `CompendiumRegistry`
- [x] `ResolvedEntityType`
- [x] `CompendiumWarning`
- [x] `ResolvedCompendiumContext`
- [x] `CharacterBaseData.activeCompendiums`
- [x] `CharacterBaseData.customEntities`
- [x] `CalculationContext`
- [x] `CharacterWarning` (nuevo, añadido al sheet)

### Funciones
- [x] `resolveCompendiumContext()`
- [x] `validateCustomEntities()`

### Tests
- [x] Test: resolver compendio sin dependencias
- [x] Test: resolver compendio con dependencias satisfechas
- [x] Test: warning cuando falta dependencia
- [x] Test: warning cuando hay conflicto de schema
- [x] Test: validar customEntity válida
- [x] Test: warning para entityType desconocido
- [x] Test: warning para entidad inválida
- [x] Test: skip entidades inválidas
- [x] Test: sin contexto → warning + skip all

### Integración
- [x] calculateCharacterSheet usa CalculationContext
- [x] warnings agregados al CharacterSheet
- [x] Retrocompatibilidad (sin customEntities funciona igual) - 655 tests pasan

### Cambios adicionales realizados
- [x] Corregido schema Zod: `type` → `entityType` para consistencia con tipos TypeScript
- [x] Actualizados tests existentes para usar `entityType`

---

## 🔮 Futuro (No en este plan)

1. **Gestión de conflictos de schemas**
   - Merge de schemas
   - Prioridad configurable

2. **Migraciones de versiones**
   - Detectar entity con schema version anterior
   - Aplicar migraciones automáticas

3. **UI de gestión de compendios**
   - Visual Playground: activar/desactivar
   - Ver dependencias
   - Resolver conflictos

4. **Hot-reload de compendios**
   - Detectar cambios en storage
   - Invalidar contexto resuelto

---

## 📚 Referencias

### Archivos Relacionados

| Archivo | Propósito |
|---------|-----------|
| `core/domain/entities/types/schema.ts` | EntitySchemaDefinition |
| `core/domain/entities/types/fields.ts` | EntityFieldDefinition |
| `core/domain/entities/schema/creation.ts` | createEntitySchema() |
| `core/domain/character/calculation/entities/` | Sistema de entities en cálculo |

### Documentos Relacionados

| Documento | Contenido |
|-----------|-----------|
| `entities.status.readme.md` | Estado general del sistema |
| `CUSTOM_ENTITIES_IMPLEMENTATION_PLAN.md` | Plan de custom entities |
| `EFFECTS_CONTEXTUAL_INTEROP_RESEARCH.md` | Investigación Effects |

---

**Última actualización**: 2025-01-02  
**Estado**: ✅ Implementación completa

## 📊 Resumen de Tests

| Archivo | Tests |
|---------|-------|
| `compendiums/__tests__/resolve.test.ts` | 8 tests |
| `compendiums/__tests__/validateCustomEntities.test.ts` | 12 tests |
| `entities/__tests__/compileCharacterEntities.test.ts` | 24 tests |
| `entities/__tests__/integration.test.ts` | 10 tests |
| **Total nuevos** | **54 tests** |
| **Total proyecto** | **689 tests** (todos pasan)

## 🎯 Implementación Completada

### Nuevos Archivos Creados

```
core/domain/compendiums/
├── types.ts                       # Tipos de compendios
├── resolve.ts                     # resolveCompendiumContext()
├── validateCustomEntities.ts      # validateCustomEntities()
├── index.ts                       # Exports
└── __tests__/
    ├── resolve.test.ts
    └── validateCustomEntities.test.ts

core/domain/character/calculation/entities/
├── compileCharacterEntities.ts    # NUEVO: Compilación de entidades
└── __tests__/
    ├── compileCharacterEntities.test.ts
    └── integration.test.ts
```

### Tipos Añadidos

- `ComputedEntity` y `ComputedEntityMeta` en `entities/types/base.ts`
- `ChangeOriginType` ahora incluye: `'entity'`, `'buff'`, `'race'`
- `EffectfulFields` ahora incluye: `legacy_changes`, `legacy_contextualChanges`, `legacy_specialChanges`
- `CharacterSheet.computedEntities` para entidades procesadas

### Funciones Añadidas

- `compileCharacterEntities()` - Compila customEntities con metadata
- `categorizeChanges()` - Categoriza changes por tipo
- `mergeCharacterChanges()` - Combina CharacterChanges
- `getOriginTypeFromEntityType()` - Deriva ChangeOriginType de entityType

