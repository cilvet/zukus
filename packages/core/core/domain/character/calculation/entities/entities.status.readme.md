# Estado del Sistema de Entidades - Character Calculation

> **Última actualización**: 2025-01-02  
> **Estado general**: ✅ Implementación base completada

---

## 📖 ¿Qué es este documento?

Este es el **punto de entrada único** para entender el estado y la planificación del sistema de entidades en el cálculo de personajes. Aquí encontrarás:

- 🎯 Visión general del proyecto
- 📊 Estado actual de cada fase
- 🗺️ Roadmap y próximos pasos
- 🔗 Enlaces a documentación detallada

---

## 🎯 Visión General

### Objetivo

Permitir que **entidades** (feats, spells, items, class features, etc.) definidas por usuarios o el sistema de niveles puedan aportar modificadores al personaje a través de:

- `Changes` (BAB, AC, Skills, etc.)
- `ContextualChanges` (Power Attack, Flanking, etc.)
- `SpecialChanges` (Extra feat selection, etc.)
- `Effects` (sistema nuevo, futuro)

### Beneficios

✅ **Flexibilidad**: Usuarios crean custom entities con efectos propios  
✅ **Unificación**: Un solo sistema para custom entities + sistema de niveles  
✅ **Extensibilidad**: Fácil añadir nuevos tipos de entidades  
✅ **Retrocompatibilidad**: Coexiste con sistema legacy sin romper nada  

### Alcance

**Fase actual**: Custom Entities (entidades definidas manualmente por el usuario)  
**Fase futura**: Level Build Entities (entidades del sistema de niveles)

---

## 📚 Documentación Disponible

### 1. 🔍 Investigación: Effects vs ContextualChanges

**Archivo**: [EFFECTS_CONTEXTUAL_INTEROP_RESEARCH.md](./EFFECTS_CONTEXTUAL_INTEROP_RESEARCH.md)  
**Propósito**: Análisis de viabilidad de migrar ContextualChanges al nuevo sistema de Effects  
**Estado**: ✅ Completado

**Contenido destacado**:
- Análisis exhaustivo del sistema actual de ContextualChanges
- 6 puntos de dolor identificados (especialmente el problema del daño)
- Comparación detallada Effects vs Changes
- **Decisión**: Mantener sistema legacy de Changes para entidades (por ahora)
- Enfoque híbrido recomendado para migración gradual

**Conclusión clave**: 
> El daño no encaja bien en el modelo de Effects porque no es un stat tradicional del character sheet, sino una fórmula compleja construida dinámicamente por arma. Mantener `DamageChange` como está.

**Lee este documento si**:
- Quieres entender por qué NO migramos a Effects todavía
- Te preguntas qué es Effects y por qué existe
- Necesitas contexto sobre la arquitectura de modificadores del sistema

---

### 2. 📋 Plan de Implementación: Custom Entities

**Archivo**: [CUSTOM_ENTITIES_IMPLEMENTATION_PLAN.md](./CUSTOM_ENTITIES_IMPLEMENTATION_PLAN.md)  
**Propósito**: Plan completo de implementación del sistema de custom entities  
**Estado**: 📝 Diseño completado, pendiente de implementación

**Contenido destacado**:
- ✅ 8 decisiones de diseño confirmadas
- ✅ Arquitectura completa con diagramas
- ✅ Plan de implementación en 5 fases
- ✅ Estrategia de testing (Test First)
- ✅ 40+ casos de test identificados
- ✅ Checklist completo de tareas
- ✅ Criterios de aceptación

**Decisiones clave documentadas**:
1. Addon `effectful`: `legacy_changes`, `legacy_contextualChanges`, `legacy_specialChanges`, `effects`
2. `customEntities` organizadas por entityType: `{ [entityType]: Entity[] }`
3. `ComputedEntity` = StandardEntity + `_meta` (source, suppressed)
4. Warnings en CharacterSheet para errores no críticos
5. 100% retrocompatible con feats, buffs, specialFeatures legacy

**Lee este documento si**:
- Vas a implementar el sistema
- Necesitas entender el diseño completo
- Quieres ver el plan de testing
- Buscas criterios de aceptación

---

### 3. 🗺️ Índice General: README

**Archivo**: [README.md](./README.md)  
**Propósito**: Índice navegable y referencia rápida  
**Estado**: ✅ Actualizado

**Contenido destacado**:
- Resumen ejecutivo del sistema
- Flujo de compilación visual
- Estado de cada fase
- Enlaces a código relevante
- Notas importantes y convenciones

**Lee este documento si**:
- Necesitas una vista rápida del sistema
- Buscas enlaces a código específico
- Quieres ver el estado actual de un vistazo

---

## 📊 Estado por Fase

### ✅ Fase 0: Investigación (COMPLETADA)

**Objetivo**: Determinar si migrar ContextualChanges a Effects  
**Resultado**: NO migrar, mantener sistema legacy  
**Documento**: [EFFECTS_CONTEXTUAL_INTEROP_RESEARCH.md](./EFFECTS_CONTEXTUAL_INTEROP_RESEARCH.md)  
**Fecha**: 2025-01-02

**Hallazgos clave**:
- Daño no es un stat tradicional → no encaja en Effects
- Variables dinámicas en ContextualChanges son más complejas
- Recomendación: Sistema híbrido gradual

---

### ✅ Fase 1: Diseño de Custom Entities (COMPLETADA)

**Objetivo**: Definir arquitectura completa del sistema  
**Resultado**: 8 decisiones confirmadas, plan detallado  
**Documento**: [CUSTOM_ENTITIES_IMPLEMENTATION_PLAN.md](./CUSTOM_ENTITIES_IMPLEMENTATION_PLAN.md)  
**Fecha**: 2025-01-02

**Entregables**:
- ✅ Tipos TypeScript diseñados
- ✅ Flujo de compilación definido
- ✅ Estrategia de testing establecida
- ✅ Plan de implementación en 5 fases
- ✅ Checklist completo de tareas

---

### ✅ Fase 2: Sistema de Compendios (DISEÑADO)

**Objetivo**: Definir cómo se proveen los entityTypes disponibles  
**Resultado**: Diseño completado  
**Documento**: [COMPENDIUM_SYSTEM_PLAN.md](../../../compendiums/COMPENDIUM_SYSTEM_PLAN.md)  
**Fecha**: 2025-01-02

**Decisiones clave**:
1. No hay entityTypes hardcodeados; todo viene de compendios
2. Compendio = schemas + entidades + dependencias
3. Schemas tienen versión (semver)
4. CompendiumRegistry usa referencias ligeras (id, name)
5. ResolvedEntityType agrupa schema + validator + source
6. Sin gestión de conflictos por ahora (warning + skip)
7. CustomEntities se validan en cálculo; entidades de compendio se asumen válidas

**Estructura**:
```typescript
type Compendium = {
  id: string;
  name: string;
  version: string;
  dependencies: string[];
  schemas: EntitySchemaDefinition[];
  entities: Record<string, StandardEntity[]>;
}

type ResolvedCompendiumContext = {
  entityTypes: Map<string, ResolvedEntityType>;
  availableTypeNames: string[];
  activeCompendiums: CompendiumReference[];
  warnings: CompendiumWarning[];
}
```

---

### ✅ Fase 3: Tests (COMPLETADA)

**Objetivo**: Escribir tests antes de implementar (Test First)  
**Estado**: ✅ Completada  
**Fecha**: 2025-01-02

**Tests implementados** (34 tests):
- ✅ Compilación de entities con legacy_changes
- ✅ Compilación de entities con changes (backwards compatibility)
- ✅ Compilación de entities con legacy_specialChanges
- ✅ Creación de ComputedEntity con _meta
- ✅ Validación de entityTypes
- ✅ Generación de warnings
- ✅ Derivación de originType
- ✅ Retrocompatibilidad con sistema legacy
- ✅ Tests de integración end-to-end

---

### ✅ Fase 4: Implementación Core (COMPLETADA)

**Objetivo**: Implementar sistema de compilación de entidades  
**Estado**: ✅ Completada  
**Fecha**: 2025-01-02

**Archivos creados**:
- `compileCharacterEntities.ts` - Función principal de compilación

**Tipos añadidos**:
- `ComputedEntity` y `ComputedEntityMeta` en `entities/types/base.ts`
- `ChangeOriginType` extendido con: `'entity'`, `'buff'`, `'race'`
- `EffectfulFields` extendido con: `legacy_changes`, `legacy_contextualChanges`, `legacy_specialChanges`

---

### ✅ Fase 5: Integración en Pipeline (COMPLETADA)

**Objetivo**: Conectar con calculateCharacterSheet()  
**Estado**: ✅ Completada  
**Fecha**: 2025-01-02

**Cambios realizados**:
1. ✅ Modificar `calculateCharacterSheet.ts`
2. ✅ Concatenar changes de ambas fuentes (legacy + entities)
3. ✅ Agregar computedEntities al CharacterSheet
4. ✅ Agregar warnings al CharacterSheet
5. ✅ Verificar retrocompatibilidad (689 tests pasan)

---

## 🚀 Próximos Pasos

### ✅ Completado

1. **Sistema de Compendios** ✅
   - Tipos en `core/domain/compendiums/types.ts`
   - `resolveCompendiumContext()`
   - `validateCustomEntities()`

2. **Tests** ✅
   - Tests para resolución de compendios (8)
   - Tests para validación de customEntities (12)
   - Tests para compileCharacterEntities (24)
   - Tests de integración (10)

3. **Implementación Core** ✅
   - `compileCharacterEntities.ts`
   - Tipos base modificados
   - Integración en pipeline

### Medio Plazo (Próximas semanas)

4. **Sistema de Niveles (levelBuild)**
   - Definir estructura de levelBuild
   - Compilar entidades de EntityProviders
   - Integrar con custom entities

5. **Sistema de Supresión**
   - Implementar lógica de suppression
   - Marcar entities._meta.suppressed
   - UI para mostrar entidades suprimidas

### Largo Plazo (Mes 2+)

6. **Migración a Effects**
   - Soporte para entity.effects
   - Deprecación gradual de legacy_changes
   - Resolver problema del daño en Effects

7. **Deprecar Sistema Legacy**
   - Migrar feats → customEntities
   - Migrar buffs → customEntities
   - Deprecar specialFeatures

---

## 🎯 Criterios de Éxito

### Para considerar la implementación completa

El sistema estará listo cuando:

✅ **Funcionalidad**:
- Entidades custom con addon `effectful` aportan changes al personaje
- Changes se contextualizan correctamente
- ComputedEntities incluyen metadata completo
- Warnings se generan para entityTypes desconocidos

✅ **Calidad**:
- Todos los tests pasan (legacy + nuevos)
- Cobertura de tests > 90%
- No hay regresiones en funcionalidad existente
- Documentación actualizada

✅ **Retrocompatibilidad**:
- Sistema legacy (feats, buffs, etc.) funciona igual
- No hay breaking changes
- Migración es opcional y gradual

---

## 🔗 Enlaces Rápidos

### Documentación

- 📖 [Este archivo](./entities.status.readme.md) - Estado general
- 🔍 [Investigación Effects](./EFFECTS_CONTEXTUAL_INTEROP_RESEARCH.md) - Por qué NO migrar a Effects
- 📋 [Plan de Custom Entities](./CUSTOM_ENTITIES_IMPLEMENTATION_PLAN.md) - Diseño de entidades
- 📦 [Plan de Compendios](../../../compendiums/COMPENDIUM_SYSTEM_PLAN.md) - Sistema de compendios
- 🗺️ [README](./README.md) - Índice y referencia rápida

### Código Relacionado

- [core/domain/entities/types/base.ts](../../../entities/types/base.ts) - Tipos base de entidades
- [core/domain/entities/ADDONS.md](../../../entities/ADDONS.md) - Sistema de addons
- [core/domain/character/calculation/calculateCharacterSheet.ts](../calculateCharacterSheet.ts) - Pipeline principal
- [core/domain/character/calculation/sources/compileCharacterChanges.ts](../sources/compileCharacterChanges.ts) - Compilación legacy

### Sistemas Relacionados

- [core/domain/levels/](../../../levels/) - Sistema de niveles (futura fuente de entidades)
- [core/domain/character/calculation/effects/](../effects/) - Sistema de Effects (futuro)

---

## 💡 Información Útil

### Convenciones de Nombres

| Nombre | Significado | Ejemplo |
|--------|-------------|---------|
| `legacy_changes` | Sistema viejo de Changes | BAB, AC, Skills |
| `legacy_contextualChanges` | ContextualChanges viejo | Power Attack, Flanking |
| `legacy_specialChanges` | SpecialChanges viejo | Extra feat selection |
| `effects` | Sistema nuevo (futuro) | Effect con target paths |

### Warnings vs Errors

| Tipo | Comportamiento | Uso |
|------|----------------|-----|
| **Error** | Rompe el cálculo, lanza excepción | Datos inválidos críticos |
| **Warning** | No rompe, se guarda en `sheet.warnings[]` | EntityType desconocido, change inválido |

### Filosofía del Sistema

- **Test First**: Tests antes de implementación
- **Baby Steps**: Cambios pequeños y verificables
- **Retrocompatibilidad**: 100% compatible siempre
- **Migración Gradual**: Nuevo sistema coexiste con legacy

---

## 📞 Contacto y Soporte

**Mantenedor**: Sistema de Character Calculation  
**Última revisión**: 2025-01-02  
**Próxima revisión**: Después de resolver Fase 2 (EntityTypesContext)

---

## 🗂️ Historial de Cambios

| Fecha | Fase | Cambio |
|-------|------|--------|
| 2025-01-02 | 0 | Investigación Effects vs ContextualChanges completada |
| 2025-01-02 | 1 | Diseño completo de Custom Entities confirmado |
| 2025-01-02 | 2 | Sistema de Compendios diseñado e implementado |
| 2025-01-02 | 3 | Tests escritos (54 tests nuevos) |
| 2025-01-02 | 4 | `compileCharacterEntities.ts` implementado |
| 2025-01-02 | 5 | Integración en pipeline completada |
| 2025-01-02 | - | Documentación actualizada |

---

**🎯 Estado actual**: ✅ Implementación base completada  
**Total tests**: 689 (todos pasan)

