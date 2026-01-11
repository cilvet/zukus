# Sistema de Entidades en Character Calculation

## 📚 Índice de Documentación

Esta carpeta contiene la documentación y código del sistema de entidades para el cálculo de personajes.

### Documentos de Diseño

| Documento | Estado | Descripción |
|-----------|--------|-------------|
| [CUSTOM_ENTITIES_IMPLEMENTATION_PLAN.md](./CUSTOM_ENTITIES_IMPLEMENTATION_PLAN.md) | 📝 Planificación | Plan completo de implementación de custom entities |
| [../effects/EFFECTS_CONTEXTUAL_INTEROP_RESEARCH.md](../effects/EFFECTS_CONTEXTUAL_INTEROP_RESEARCH.md) | ✅ Completado | Investigación sobre interoperabilidad Effects ↔ ContextualChanges |

---

## 🎯 Resumen del Sistema

### ¿Qué es?

Un sistema que permite que **entidades** (feats, spells, items, etc.) definidas por el usuario o el sistema de niveles puedan aportar `Changes`, `ContextualChanges` y `SpecialChanges` al personaje.

### ¿Por qué?

- **Flexibilidad**: Usuarios pueden crear custom entities con efectos
- **Unificación**: Sistema de niveles y custom entities usan misma infraestructura
- **Retrocompatibilidad**: Coexiste con sistema legacy (feats, buffs, etc.)

---

## 🏗️ Componentes Principales

### 1. Addon `effectful`

Las entidades pueden tener el addon `effectful` con estos campos:

```typescript
type EffectfulFields = {
  legacy_changes?: Change[];                  // BAB, AC, Skills, etc.
  legacy_contextualChanges?: ContextualChange[];  // Power Attack, Flanking, etc.
  legacy_specialChanges?: SpecialChange[];    // Extra feat selection, etc.
  effects?: Effect[];                         // Sistema nuevo (futuro)
}
```

### 2. Custom Entities en CharacterBaseData

```typescript
type CharacterBaseData = {
  customEntities?: {
    [entityType: string]: StandardEntity[];
  };
  // ... otros campos
}

// Ejemplo
const character: CharacterBaseData = {
  customEntities: {
    'feat': [powerAttackEntity],
    'spell': [fireballEntity]
  }
}
```

### 3. ComputedEntity

Entidades procesadas con metadata de compilación:

```typescript
type ComputedEntity = StandardEntity & {
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

### 4. CharacterSheet con Entidades

```typescript
type CharacterSheet = {
  computedEntities: ComputedEntity[];  // Entidades procesadas
  warnings: CharacterWarning[];        // Errores no críticos
  // ... otros campos
}
```

---

## 🔄 Flujo de Compilación

```
CharacterBaseData.customEntities
         │
         ▼
compileCharacterEntities()
         │
         ├─ Validar entityTypes
         ├─ Crear ComputedEntity[]
         ├─ Contextualizar legacy_changes
         ├─ Contextualizar legacy_contextualChanges
         ├─ Contextualizar legacy_specialChanges
         └─ Generar warnings
         │
         ▼
compileContextualizedChanges()
         │
         ├─ Concatenar changes legacy
         └─ Concatenar changes de entidades
         │
         ▼
Pipeline de cálculo del personaje
         │
         ▼
CharacterSheet con computedEntities + warnings
```

---

## 📋 Estado de Implementación

| Fase | Estado | Documentación |
|------|--------|---------------|
| Investigación Effects vs ContextualChanges | ✅ Completado | [EFFECTS_CONTEXTUAL_INTEROP_RESEARCH.md](../effects/EFFECTS_CONTEXTUAL_INTEROP_RESEARCH.md) |
| Diseño de Custom Entities | ✅ Completado | [CUSTOM_ENTITIES_IMPLEMENTATION_PLAN.md](./CUSTOM_ENTITIES_IMPLEMENTATION_PLAN.md) |
| Context de EntityTypes | ⏸️ Bloqueado | Pendiente de decisión |
| Implementación | 📝 Pendiente | Ver plan de implementación |

---

## 🚀 Próximos Pasos

1. **Definir EntityTypesContext**
   - ¿Dónde viven los entityTypes del sistema?
   - ¿Cómo se registran compendios?

2. **Crear Tests (Test First)**
   - Mock de EntityTypesContext
   - Tests de compilación de entidades
   - Tests de retrocompatibilidad

3. **Implementar Core**
   - Modificar tipos base
   - Crear `compileCharacterEntities.ts`
   - Integrar en pipeline

---

## 🔗 Enlaces Útiles

### Código Base de Entidades
- [core/domain/entities/types/base.ts](../../../entities/types/base.ts) - Tipos base
- [core/domain/entities/ADDONS.md](../../../entities/ADDONS.md) - Documentación de addons

### Cálculo de Personaje
- [core/domain/character/calculation/calculateCharacterSheet.ts](../calculateCharacterSheet.ts) - Pipeline principal
- [core/domain/character/calculation/sources/compileCharacterChanges.ts](../sources/compileCharacterChanges.ts) - Compilación legacy

### Sistema de Niveles
- [core/domain/levels/IMPLEMENTATION_PLAN.md](../../../levels/IMPLEMENTATION_PLAN.md) - Plan del sistema de niveles
- [core/domain/levels/providers/types.ts](../../../levels/providers/types.ts) - EntityProvider

---

## 💡 Notas Importantes

### Retrocompatibilidad

**100% compatible** con sistema legacy:
- `feats`, `buffs`, `specialFeatures` siguen funcionando
- Custom entities se SUMAN, no reemplazan
- Migración gradual y opcional

### Convención de Nombres

- `legacy_changes`: Sistema viejo (Changes)
- `effects`: Sistema nuevo (Effects)
- Ambos pueden coexistir durante transición

### Warnings vs Errors

- **Errors**: Rompen el cálculo, lanzan excepción
- **Warnings**: No rompen, se guardan en `sheet.warnings[]`
- EntityType desconocido = Warning (no Error)

---

**Última actualización**: 2025-01-02  
**Mantenedor**: Sistema de Character Calculation

