# Plan de Implementación: Custom Entities en Character Calculation

## 📋 Resumen Ejecutivo

Este documento captura el plan completo para implementar el sistema de **Custom Entities** en el cálculo de personajes, permitiendo que las entidades (feats, spells, items, etc.) definidas por el usuario o el sistema de niveles puedan aportar `Changes`, `ContextualChanges` y `SpecialChanges` al personaje.

**Estado**: ✅ Implementación completada

**Fecha**: 2025-01-02  
**Última actualización**: 2025-01-02

---

## 🎯 Objetivos

1. ✅ Permitir que entidades con addon `effectful` aporten changes al personaje
2. ✅ Mantener **100% retrocompatibilidad** con sistema legacy (feats, buffs, specialFeatures)
3. ✅ Preparar infraestructura para el sistema de niveles (levelBuild)
4. ✅ Crear sistema de warnings para errores no críticos

---

## 🔍 Contexto: Investigación Previa

### Sistema de Effects vs ContextualChanges

**Archivo relacionado**: `core/domain/character/calculation/effects/EFFECTS_CONTEXTUAL_INTEROP_RESEARCH.md`

**Decisión tomada**: 
- **NO migrar** ContextualChanges a Effects en este momento
- El sistema de Effects tiene problemas con el daño (no es un stat tradicional)
- Mantener sistema de Changes legacy para entidades por ahora
- Migración gradual en el futuro

### Sistema de Entidades Actual

**Archivos relacionados**:
- `core/domain/entities/ADDONS.md`
- `core/domain/entities/types/base.ts`
- `core/domain/levels/entities/createEntitySchemaWithAddons.ts`

**Addons relevantes**:
- `searchable`: name, description
- `taggable`: tags
- `effectful`: changes, specialChanges (sin contextualChanges actualmente)

---

## 📐 Decisiones de Diseño

### 1. Addon `effectful` - Nuevos Campos

**Decisión**: Añadir soporte completo para Changes legacy + Effects nuevos

```typescript
type EffectfulFields = {
  // Sistema LEGACY (Changes)
  legacy_changes?: Change[];
  legacy_contextualChanges?: ContextualChange[];
  legacy_specialChanges?: SpecialChange[];
  
  // Sistema NUEVO (Effects) - para el futuro
  effects?: Effect[];
}
```

**Razón**: 
- Nombrados explícitamente como `legacy_*` para claridad
- `effects` preparado para migración futura
- Las entidades pueden tener ambos sistemas simultáneamente

---

### 2. Custom Entities en CharacterBaseData

**Decisión**: Organizadas por entityType con validación

```typescript
type CharacterBaseData = {
  // ... campos existentes (feats, buffs, etc.)
  
  // NUEVO: Entidades custom organizadas por tipo
  customEntities?: {
    [entityType: string]: StandardEntity[];
  };
  
  // NUEVO: Sistema de niveles (estructura TBD)
  levelBuild?: any;  // TODO: Definir después
  
  // Mantener por ahora
  specialFeatures?: SpecialFeature[];
}
```

**Ejemplo**:
```typescript
const character: CharacterBaseData = {
  customEntities: {
    'feat': [powerAttackEntity, cleaveEntity],
    'spell': [fireballEntity],
    'item': [customSwordEntity]
  }
}
```

---

### 3. ComputedEntity - Entidades con Metadata

**Decisión**: Extender StandardEntity con campo `_meta`

```typescript
type ComputedEntity = StandardEntity & {
  _meta: {
    source: {
      originType: ChangeOriginType;  // Del entityType de la entidad
      originId: string;              // entity.id
      name: string;                  // entity.name
    };
    suppressed?: boolean;  // Para sistema de supresión (futuro)
    // ... más campos en el futuro
  }
}
```

**Razón**:
- Mantiene todos los campos de la entidad accesibles
- `_meta` claramente separado de datos de dominio
- Reutiliza estructura de `ContextualizedChange.source`

**Ejemplo**:
```typescript
const computedEntity: ComputedEntity = {
  // Campos de la entidad
  id: 'power-attack',
  entityType: 'feat',
  name: 'Power Attack',
  legacy_changes: [...],
  
  // Metadata de compilación
  _meta: {
    source: {
      originType: 'feat',  // Derivado del entityType
      originId: 'power-attack',
      name: 'Power Attack'
    },
    suppressed: false
  }
}
```

---

### 4. CharacterSheet - Entidades Computadas

**Decisión**: Añadir array de entidades compiladas + warnings

```typescript
type CharacterSheet = {
  // ... campos existentes
  
  // NUEVO: Entidades procesadas
  computedEntities: ComputedEntity[];
  
  // NUEVO: Warnings del proceso de cálculo
  warnings: CharacterWarning[];
}

type CharacterWarning = {
  type: 'unknown_entity_type' | 'missing_entity' | 'invalid_change' | 'other';
  message: string;
  context?: any;  // Info adicional para debugging
}
```

---

### 5. ChangeOriginType - Nuevo Tipo 'entity'

**Decisión**: Añadir tipo específico, pero derivar del entityType real

```typescript
type ChangeOriginType = 
  | 'feat' 
  | 'item' 
  | 'buff' 
  | 'classFeature'
  | 'race'
  | 'entity'  // ← NUEVO (genérico)
  | 'other'
  | 'base';
```

**Pero al contextualizar**:
```typescript
// Si entity.entityType es 'feat', usar 'feat'
// Si entity.entityType es 'spell', usar 'spell'
// Si entity.entityType no está en ChangeOriginType, usar 'entity'

function getOriginTypeFromEntityType(entityType: string): ChangeOriginType {
  const validTypes: ChangeOriginType[] = ['feat', 'item', 'buff', 'classFeature', 'race'];
  
  if (validTypes.includes(entityType as ChangeOriginType)) {
    return entityType as ChangeOriginType;
  }
  
  return 'entity';
}
```

---

## 🏗️ Arquitectura de la Solución

### Flujo de Compilación

```
CharacterBaseData
  ├─ customEntities: { [entityType]: StandardEntity[] }
  ├─ levelBuild: any (futuro)
  └─ legacy: feats, buffs, specialFeatures, etc.
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ calculateCharacterSheet()                              │
│                                                        │
│  1. Validar entityTypes disponibles                   │
│     └─ Generar warnings para tipos desconocidos       │
│                                                        │
│  2. compileCharacterEntities()                        │
│     ├─ customEntities → ComputedEntity[]              │
│     └─ (futuro) levelBuild → ComputedEntity[]         │
│                                                        │
│  3. compileContextualizedChanges()                    │
│     ├─ Legacy: feats, buffs, etc.                     │
│     └─ Entities: legacy_changes, contextualChanges    │
│                                                        │
│  4. compileCharacterEffects()                         │
│     └─ (futuro) entities.effects                      │
│                                                        │
│  5. Pipeline de cálculo existente                     │
│     └─ calculateSize, calculateAbilities, etc.        │
└────────────────────────────────────────────────────────┘
         │
         ▼
CharacterSheet
  ├─ computedEntities: ComputedEntity[]
  ├─ warnings: CharacterWarning[]
  └─ ... resto de stats calculados
```

---

## 📝 Plan de Implementación

### Fase 1: Tipos Base ✅ COMPLETADA

**Archivo**: `core/domain/entities/types/base.ts`

```typescript
// Modificar EffectfulFields
export type EffectfulFields = {
  legacy_changes?: Change[];
  legacy_contextualChanges?: ContextualChange[];
  legacy_specialChanges?: SpecialChange[];
  effects?: Effect[];  // Futuro
}

// Nuevo tipo
export type ComputedEntity = StandardEntity & {
  _meta: {
    source: {
      originType: ChangeOriginType;
      originId: string;
      name: string;
    };
    suppressed?: boolean;
  }
}
```

**Archivo**: `core/domain/character/baseData/changes.ts`

```typescript
// Añadir a ChangeOriginType
export type ChangeOriginType = 
  | ... 
  | 'entity';
```

**Archivo**: `core/domain/character/baseData/character.ts`

```typescript
export type CharacterBaseData = {
  // ... existente
  customEntities?: {
    [entityType: string]: StandardEntity[];
  };
  levelBuild?: any;  // TODO: Definir estructura
}

export type CharacterWarning = {
  type: 'unknown_entity_type' | 'missing_entity' | 'invalid_change' | 'other';
  message: string;
  context?: any;
}
```

**Archivo**: `core/domain/character/calculatedSheet/sheet.ts`

```typescript
export type CharacterSheet = {
  // ... existente
  computedEntities: ComputedEntity[];
  warnings: CharacterWarning[];
}
```

---

### Fase 2: Context de EntityTypes ✅ COMPLETADA

**Solución implementada**: Se usa `ResolvedCompendiumContext` del sistema de compendios.

**Implementación**:
- `ResolvedCompendiumContext` provee `availableTypeNames` y `entityTypes` Map
- Se pasa como parte de `CalculationContext` a `calculateCharacterSheet()`
- `compileCharacterEntities()` usa `compendiumContext.availableTypeNames` para validación
- Modo permisivo: sin contexto, se procesan todas las entidades sin validación

**Archivos relacionados**:
- `core/domain/compendiums/types.ts` - `ResolvedCompendiumContext`
- `core/domain/compendiums/resolve.ts` - `resolveCompendiumContext()`
- `core/domain/character/calculation/entities/compileCharacterEntities.ts` - Usa el contexto

---

### Fase 3: Tests ✅ COMPLETADA

**Archivo**: `core/domain/character/calculation/entities/__tests__/compileCharacterEntities.spec.ts`

**Casos de test**:

```typescript
describe('compileCharacterEntities', () => {
  describe('Custom Entities Compilation', () => {
    it('should compile entities with legacy_changes', () => {
      // Entity con BAB change
      // Verificar ContextualizedChange generado
    });

    it('should compile entities with legacy_contextualChanges', () => {
      // Entity con Power Attack contextual
      // Verificar se preservan variables
    });

    it('should compile entities with legacy_specialChanges', () => {
      // Entity con special change
      // Verificar se contextualizan correctamente
    });

    it('should create proper ComputedEntity with _meta', () => {
      // Verificar estructura _meta.source
      // Verificar originType derivado de entityType
    });

    it('should handle entities without effectful addon', () => {
      // Entity sin legacy_changes
      // No debería generar changes pero sí ComputedEntity
    });

    it('should derive originType from entityType', () => {
      // entityType: 'feat' → originType: 'feat'
      // entityType: 'spell' → originType: 'spell'  
      // entityType: 'custom-type' → originType: 'entity'
    });
  });

  describe('EntityType Validation', () => {
    it('should generate warning for unknown entityType', () => {
      // customEntities con tipo inválido
      // Verificar warning en resultado
    });

    it('should skip entities with unknown entityType', () => {
      // No debería generar changes de entidades inválidas
    });

    it('should process valid entityTypes from system', () => {
      // 'feat', 'spell' deberían procesarse
    });

    it('should process valid entityTypes from compendiums', () => {
      // entityTypes custom pero registrados
    });
  });

  describe('Multiple Entity Sources', () => {
    it('should compile entities from multiple entityTypes', () => {
      // customEntities: { feat: [...], spell: [...] }
      // Verificar ambos se compilan
    });

    it('should preserve entity order within type', () => {
      // Orden de entities en array se mantiene
    });
  });

  describe('Retrocompatibility', () => {
    it('should work alongside legacy feats', () => {
      // Character con feats legacy + customEntities
      // Ambos deberían generar changes
    });

    it('should work alongside legacy buffs', () => {
      // Character con buffs legacy + customEntities
    });

    it('should work alongside specialFeatures', () => {
      // Mantener specialFeatures funcionando
    });
  });
});
```

---

### Fase 4: Implementación Core ✅ COMPLETADA

**Archivo nuevo**: `core/domain/character/calculation/entities/compileCharacterEntities.ts`

```typescript
import type { CharacterBaseData } from '../../baseData/character';
import type { ComputedEntity } from '../../../entities/types/base';
import type { CharacterWarning } from '../../calculatedSheet/sheet';
import type { ContextualizedChange } from '../../baseData/changes';
import type { ContextualChange } from '../../baseData/contextualChange';
import type { SpecialChange } from '../../baseData/specialChanges';

type EntityTypesContext = {
  system: string[];
  compendiums: Record<string, string[]>;
}

type EntitiesCompilationResult = {
  computedEntities: ComputedEntity[];
  changes: ContextualizedChange[];
  contextualChanges: ContextualChange[];
  specialChanges: SpecialChange[];
  warnings: CharacterWarning[];
}

/**
 * Compila todas las entidades custom del personaje.
 * 
 * @param baseData - Datos base del personaje
 * @param context - Contexto de entityTypes disponibles
 * @returns Entidades compiladas, changes contextualizados y warnings
 */
export function compileCharacterEntities(
  baseData: CharacterBaseData,
  context?: EntityTypesContext
): EntitiesCompilationResult {
  const result: EntitiesCompilationResult = {
    computedEntities: [],
    changes: [],
    contextualChanges: [],
    specialChanges: [],
    warnings: []
  };

  if (!baseData.customEntities) {
    return result;
  }

  // 1. Validar entityTypes
  const availableTypes = getAvailableEntityTypes(context);
  
  // 2. Por cada entityType
  for (const [entityType, entities] of Object.entries(baseData.customEntities)) {
    // 2.1. Validar que el tipo existe
    if (!availableTypes.includes(entityType)) {
      result.warnings.push({
        type: 'unknown_entity_type',
        message: `Unknown entityType: "${entityType}". Entities of this type will be skipped.`,
        context: { entityType, entityCount: entities.length }
      });
      continue;
    }

    // 2.2. Por cada entidad del tipo
    for (const entity of entities) {
      // 2.2.1. Crear ComputedEntity
      const computedEntity = createComputedEntity(entity);
      result.computedEntities.push(computedEntity);

      // 2.2.2. Contextualizar changes
      if (entity.legacy_changes) {
        const contextualizedChanges = entity.legacy_changes.map(change =>
          contextualizeEntityChange(change, entity)
        );
        result.changes.push(...contextualizedChanges);
      }

      // 2.2.3. Contextualizar contextualChanges
      if (entity.legacy_contextualChanges) {
        // Los contextualChanges ya tienen name, solo agregar source
        result.contextualChanges.push(...entity.legacy_contextualChanges);
      }

      // 2.2.4. Contextualizar specialChanges
      if (entity.legacy_specialChanges) {
        const contextualizedSpecial = entity.legacy_specialChanges.map(change =>
          contextualizeSpecialChange(change, entity)
        );
        result.specialChanges.push(...contextualizedSpecial);
      }
    }
  }

  return result;
}

/**
 * Obtiene lista de entityTypes disponibles del contexto.
 */
function getAvailableEntityTypes(context?: EntityTypesContext): string[] {
  if (!context) {
    // Sin contexto, permitir tipos básicos conocidos
    return ['feat', 'spell', 'item', 'class-feature', 'race', 'skill', 'domain'];
  }

  const systemTypes = context.system || [];
  const compendiumTypes = Object.values(context.compendiums || {}).flat();
  
  return [...systemTypes, ...compendiumTypes];
}

/**
 * Crea ComputedEntity con metadata de source.
 */
function createComputedEntity(entity: StandardEntity): ComputedEntity {
  return {
    ...entity,
    _meta: {
      source: {
        originType: getOriginTypeFromEntityType(entity.entityType),
        originId: entity.id,
        name: entity.name || entity.id  // Fallback si no tiene name
      },
      suppressed: false  // TODO: Implementar lógica de supresión
    }
  };
}

/**
 * Deriva ChangeOriginType del entityType de la entidad.
 * Si el entityType coincide con un tipo conocido, lo usa.
 * Si no, usa 'entity' genérico.
 */
function getOriginTypeFromEntityType(entityType: string): ChangeOriginType {
  const knownTypes: ChangeOriginType[] = [
    'feat', 'item', 'buff', 'classFeature', 'race'
  ];
  
  if (knownTypes.includes(entityType as ChangeOriginType)) {
    return entityType as ChangeOriginType;
  }
  
  return 'entity';
}

/**
 * Contextualiza un Change de una entidad.
 */
function contextualizeEntityChange<T extends Change>(
  change: T,
  entity: StandardEntity
): ContextualizedChange<T> {
  return {
    ...change,
    originType: getOriginTypeFromEntityType(entity.entityType),
    originId: entity.id,
    name: entity.name || entity.id
  };
}

/**
 * Contextualiza un SpecialChange de una entidad.
 */
function contextualizeSpecialChange(
  change: SpecialChange,
  entity: StandardEntity
): ContextualizedChange<SpecialChange> {
  return {
    ...change,
    originType: getOriginTypeFromEntityType(entity.entityType),
    originId: entity.id,
    name: entity.name || entity.id
  };
}
```

---

### Fase 5: Integración en Pipeline ✅ COMPLETADA

**Archivo**: `core/domain/character/calculation/calculateCharacterSheet.ts`

```typescript
import { compileCharacterEntities } from './entities/compileCharacterEntities';

export const calculateCharacterSheet = (
  characterBaseData: CharacterBaseData,
  context?: {
    availableEntityTypes?: EntityTypesContext;
  }
): CharacterSheet => {
  
  // 0. Inicializar sheet
  let characterSheet = getInitialCharacterSheet(characterBaseData);
  
  // 1. NUEVO: Compilar entidades
  const entitiesResult = compileCharacterEntities(
    characterBaseData,
    context?.availableEntityTypes
  );
  
  // 2. Compilar changes (legacy + entities)
  const [legacyChanges, legacyContextual, legacySpecial] = 
    compileContextualizedChanges(characterBaseData);
  
  // 2.1. Concatenar changes de ambas fuentes
  const allChanges = {
    ...legacyChanges,
    // Concatenar cada tipo de change
    abilityChanges: [
      ...legacyChanges.abilityChanges,
      ...entitiesResult.changes.filter(isAbilityChange)
    ],
    skillChanges: [
      ...legacyChanges.skillChanges,
      ...entitiesResult.changes.filter(isSkillChange)
    ],
    // ... resto de tipos
  };
  
  const allContextualChanges = [
    ...legacyContextual,
    ...entitiesResult.contextualChanges
  ];
  
  const allSpecialChanges = [
    ...legacySpecial,
    ...entitiesResult.specialChanges
  ];
  
  // 3. Compilar effects (futuro)
  const effects = compileCharacterEffects(characterBaseData);
  
  // 4. Pipeline de cálculo existente
  let valuesIndex: SubstitutionIndex = {};
  
  for (const calculationFunction of calculationFunctions) {
    const result = calculationFunction(
      characterBaseData,
      valuesIndex,
      allChanges,  // ← Usar concatenados
      allContextualChanges,
      allSpecialChanges,
      effects
    );
    
    characterSheet = result.characterSheet;
    valuesIndex = { ...valuesIndex, ...result.indexValuesToUpdate };
  }
  
  // 5. Agregar entidades computadas y warnings
  characterSheet.computedEntities = entitiesResult.computedEntities;
  characterSheet.warnings = entitiesResult.warnings;
  
  // ... resto del pipeline
  
  return characterSheet;
}
```

---

## 🧪 Estrategia de Testing

### Test First Approach

Siguiendo las reglas del sistema de niveles, escribiremos tests ANTES de implementar:

1. **Tests de unidad** para `compileCharacterEntities()`
2. **Tests de integración** con pipeline completo
3. **Tests de retrocompatibilidad** con sistema legacy

### Cobertura de Tests

- ✅ Compilación básica de entidades
- ✅ Contextualización de changes
- ✅ Validación de entityTypes
- ✅ Generación de warnings
- ✅ Metadata de ComputedEntity
- ✅ Derivación de originType
- ✅ Compatibilidad con legacy

---

## 🚧 Pendientes y Consideraciones Futuras

### ✅ Completado en esta Implementación

1. ✅ **Sistema de Compendios** - Implementado
   - `ResolvedCompendiumContext` provee entityTypes disponibles
   - Validación de customEntities contra schemas
   - Ver: [COMPENDIUM_SYSTEM_PLAN.md](../../../compendiums/COMPENDIUM_SYSTEM_PLAN.md)

2. ✅ **Tests completos** - Implementado
   - 27 tests unitarios para `compileCharacterEntities`
   - 10 tests de integración end-to-end
   - Todos los casos principales cubiertos

### Medio Plazo (Próximas Iteraciones)

3. ✅ **Entity Effects** - Implementado
   - `effects` field añadido a `EffectfulFields`
   - `compileCharacterEffects()` compila effects de `ComputedEntity[]`
   - Integration en pipeline de cálculo completo
   - 23 tests unitarios + 9 tests de integración
   - Ver: `compileEffects.ts` y `entityEffectsIntegration.test.ts`

4. 🔄 **Sistema de Niveles (levelBuild)**
   - Estructura de levelBuild en CharacterBaseData
   - Compilación de entidades de providers (granted + selector)
   - Integración en compileCharacterEntities

5. 🔄 **Sistema de Supresión**
   - Implementar lógica de suppression
   - Aplicar al calcular sheet
   - Marcar entities._meta.suppressed

6. 🔄 **Migración a Effects**
   - Deprecación gradual de legacy_changes
   - Guías de migración para entidades existentes

### Largo Plazo

6. 📋 **Deprecar campos legacy**
   - Migrar feats → customEntities.feat
   - Migrar buffs → customEntities.buff
   - Deprecar specialFeatures

7. 📋 **Mejoras al Sistema de Compendios**
   - Gestión de conflictos de schemas
   - Migraciones de versiones
   - Hot-reload de compendios
   - UI de gestión de compendios

---

## 📚 Referencias

### Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `core/domain/entities/types/base.ts` | Tipos base de entidades |
| `core/domain/entities/ADDONS.md` | Documentación de addons |
| `core/domain/character/baseData/character.ts` | CharacterBaseData |
| `core/domain/character/calculatedSheet/sheet.ts` | CharacterSheet |
| `core/domain/character/calculation/sources/compileCharacterChanges.ts` | Compilación legacy |
| `core/domain/character/calculation/calculateCharacterSheet.ts` | Pipeline principal |

### Documentos Relacionados

| Documento | Contenido |
|-----------|-----------|
| `EFFECTS_CONTEXTUAL_INTEROP_RESEARCH.md` | Investigación Effects vs ContextualChanges |
| `effects/README.md` | Sistema de Effects |
| `levels/IMPLEMENTATION_PLAN.md` | Plan del sistema de niveles |

---

## 🎯 Checklist de Implementación

### Fase 1: Tipos Base ✅
- [x] Modificar `EffectfulFields` con campos legacy_*
- [x] Crear tipo `ComputedEntity` y `ComputedEntityMeta`
- [x] Añadir `customEntities` a `CharacterBaseData`
- [x] Crear tipo `CharacterWarning`
- [x] Añadir `computedEntities` y `warnings` a `CharacterSheet`
- [x] Añadir `'entity'`, `'buff'`, `'race'` a `ChangeOriginType`

### Fase 2: Context de EntityTypes ✅
- [x] Usar `ResolvedCompendiumContext` del sistema de compendios
- [x] Integrar con `resolveCompendiumContext()`
- [x] Modo permisivo sin contexto

### Fase 3: Tests ✅
- [x] Test: compilar entities con legacy_changes
- [x] Test: compilar entities con legacy_contextualChanges
- [x] Test: compilar entities con legacy_specialChanges
- [x] Test: crear ComputedEntity con _meta correcto
- [x] Test: entities sin effectful addon
- [x] Test: derivar originType de entityType
- [x] Test: warning para entityType desconocido
- [x] Test: skip entities con tipo inválido
- [x] Test: múltiples entityTypes
- [x] Test: retrocompatibilidad con feats
- [x] Test: retrocompatibilidad con buffs
- [x] Test: integración end-to-end (10 tests)

### Fase 4: Implementación ✅
- [x] Crear `compileCharacterEntities.ts`
- [x] Implementar `compileCharacterEntities()`
- [x] Implementar `getAvailableEntityTypes()`
- [x] Implementar `createComputedEntity()`
- [x] Implementar `getOriginTypeFromEntityType()`
- [x] Implementar `contextualizeEntityChange()`
- [x] Implementar funciones helper para changes

### Fase 5: Integración ✅
- [x] Modificar `calculateCharacterSheet()`
- [x] Integrar `compileCharacterEntities()` al inicio
- [x] Concatenar changes de ambas fuentes (legacy + entities)
- [x] Agregar computedEntities al sheet
- [x] Agregar warnings al sheet
- [x] Verificar todos los tests pasan (692 tests)

---

## ✅ Criterios de Aceptación

La implementación estará completa cuando:

1. ✅ Entidades en `customEntities` con addon `effectful` aportan changes
2. ✅ Changes se contextualizan con source correcto
3. ✅ originType se deriva del entityType de la entidad
4. ✅ ComputedEntities tienen _meta con source completo
5. ✅ EntityTypes desconocidos generan warnings
6. ✅ Sistema legacy (feats, buffs, etc.) sigue funcionando
7. ✅ CharacterSheet incluye computedEntities y warnings
8. ✅ Todos los tests pasan (legacy + nuevos)
9. ✅ No hay regresiones en funcionalidad existente

---

## 💡 Notas de Implementación

### Orden de Compilación

**IMPORTANTE**: La compilación de entidades debe hacerse ANTES que la compilación de changes legacy, para que los warnings estén disponibles desde el principio.

### Performance

- Validación de entityTypes se hace UNA VEZ al inicio
- No validar en cada entidad individual
- Cache de availableTypes si el context no cambia

### Debugging

Los warnings en el sheet permitirán debugging:
```typescript
if (sheet.warnings.length > 0) {
  console.warn('Character compilation warnings:', sheet.warnings);
}
```

---

**Última actualización**: 2025-01-02  
**Estado**: ✅ Implementación completa

## 📊 Resumen de Implementación

### Archivos Creados
- `core/domain/character/calculation/entities/compileCharacterEntities.ts`
- `core/domain/character/calculation/entities/__tests__/compileCharacterEntities.test.ts` (27 tests)
- `core/domain/character/calculation/entities/__tests__/integration.test.ts` (10 tests)
- `core/domain/character/calculation/effects/__tests__/compileEffects.test.ts` (23 tests)
- `core/domain/character/calculation/effects/__tests__/entityEffectsIntegration.test.ts` (9 tests)

### Archivos Modificados
- `core/domain/entities/types/base.ts` - ComputedEntity, EffectfulFields extendido con `effects`
- `core/domain/character/baseData/changes.ts` - ChangeOriginType extendido
- `core/domain/character/baseData/character.ts` - customEntities añadido
- `core/domain/character/calculatedSheet/sheet.ts` - computedEntities añadido
- `core/domain/character/calculation/calculateCharacterSheet.ts` - Integración completa
- `core/domain/character/calculation/sources/compileCharacterChanges.ts` - Helper functions
- `core/domain/character/calculation/effects/compileEffects.ts` - Soporte para entity effects

### Tests
- **Total**: 756 tests pasando (antes: 692 tests)
- **Nuevos**: 69 tests (27 unit entities + 10 integration entities + 23 unit effects + 9 integration effects)
- **Cobertura**: Todos los casos principales cubiertos

### Próximos Pasos (Futuro)
- Sistema de Niveles (levelBuild) - Integrar con custom entities
- Sistema de Supresión - Implementar lógica de suppression
- Migración progresiva de legacy_changes a effects

