# Plan de Refactor: Unificación CharacterUpdater + LevelsUpdater

## Objetivo Final

```
core/domain/character/updater/
├── index.ts                    # Re-exporta todo
├── types.ts                    # Tipos compartidos (UpdateResult, etc.)
├── characterUpdater.ts         # Wrapper con estado (clase)
│
├── operations/                 # Funciones puras
│   ├── buffOperations.ts
│   ├── itemOperations.ts
│   ├── hpOperations.ts
│   ├── resourceOperations.ts
│   ├── specialFeatureOperations.ts
│   ├── characterPropertyOperations.ts
│   │
│   ├── classOperations.ts      # ← Ya existe en levels/updater
│   ├── levelSlotOperations.ts  # ← Ya existe en levels/updater
│   ├── entityOperations.ts     # ← Ya existe en levels/updater
│   └── selectionOperations.ts  # ← Ya existe en levels/updater
│
└── __tests__/
    └── (tests por operación)
```

---

## Fase 1: Tipos Unificados

**Archivo:** `core/domain/character/updater/types.ts`

```typescript
import type { CharacterBaseData } from '../baseData/character';

/**
 * Resultado de una operación de actualización.
 * Patrón consistente con el levelsUpdater.
 */
export type OperationResult = {
  character: CharacterBaseData;
  warnings: OperationWarning[];
};

export type OperationWarning = {
  type: 'not_found' | 'already_exists' | 'invalid_data' | 'validation_error';
  message: string;
  entityId?: string;
};

/**
 * Helper para crear resultado exitoso.
 */
export function success(character: CharacterBaseData): OperationResult {
  return { character, warnings: [] };
}

/**
 * Helper para crear resultado con warning.
 */
export function withWarning(
  character: CharacterBaseData,
  warning: OperationWarning
): OperationResult {
  return { character, warnings: [warning] };
}
```

---

## Fase 2: Extraer Funciones Puras

### 2.1 Buff Operations

**Archivo:** `core/domain/character/updater/operations/buffOperations.ts`

| Función | Migra desde |
|---------|-------------|
| `toggleBuff(character, buffId)` | CharacterUpdater.toggleBuff + BuffService |
| `addBuff(character, buff)` | CharacterUpdater.addBuff + BuffService |
| `editBuff(character, buff)` | CharacterUpdater.editBuff + BuffService |
| `deleteBuff(character, buffId)` | CharacterUpdater.deleteBuff + BuffService |
| `toggleSharedBuff(character, buffId, sharedBuffs)` | CharacterUpdater.toggleSharedBuff |

### 2.2 Item Operations

**Archivo:** `core/domain/character/updater/operations/itemOperations.ts`

| Función | Migra desde |
|---------|-------------|
| `addItem(character, item)` | CharacterUpdater.addItemToInventory |
| `removeItem(character, itemId)` | CharacterUpdater.removeItemFromInventory |
| `updateItem(character, item)` | CharacterUpdater.updateItem |
| `toggleItemEquipped(character, itemId)` | CharacterUpdater.toggleItemEquipped |
| `updateEquipment(character, equipment)` | CharacterUpdater.updateEquippedItems |

### 2.3 HP Operations

**Archivo:** `core/domain/character/updater/operations/hpOperations.ts`

| Función | Migra desde |
|---------|-------------|
| `modifyHp(character, amount, maxHp)` | CharacterUpdater.updateHp |

**Nota:** Esta función necesita `maxHp` como parámetro porque no puede calcular el sheet.

### 2.4 Resource Operations

**Archivo:** `core/domain/character/updater/operations/resourceOperations.ts`

| Función | Migra desde |
|---------|-------------|
| `consumeResource(character, resourceId, amount, resourceData)` | CharacterUpdater.consumeResource |
| `rechargeResource(character, resourceId, amount, resourceData)` | CharacterUpdater.rechargeResource |
| `rechargeAllResources(character, resourcesData)` | CharacterUpdater.rechargeAllResources |

**Nota:** Reciben datos de recursos calculados como parámetro.

### 2.5 Special Feature Operations

**Archivo:** `core/domain/character/updater/operations/specialFeatureOperations.ts`

| Función | Migra desde |
|---------|-------------|
| `addSpecialFeature(character, feature)` | CharacterUpdater.addSpecialFeature |
| `updateSpecialFeature(character, featureId, feature)` | CharacterUpdater.updateSpecialFeature |
| `removeSpecialFeature(character, featureId)` | CharacterUpdater.removeSpecialFeature |
| `setSpecialFeatures(character, features)` | CharacterUpdater.updateSpecialFeatures |

### 2.6 Character Property Operations

**Archivo:** `core/domain/character/updater/operations/characterPropertyOperations.ts`

| Función | Migra desde |
|---------|-------------|
| `setName(character, name)` | CharacterUpdater.updateName |
| `setTheme(character, theme)` | CharacterUpdater.updateTheme |

---

## Fase 3: Mover LevelsUpdater

**Mover** (o re-exportar) desde `core/domain/levels/updater/` a `core/domain/character/updater/operations/`:

| Archivo origen | Archivo destino |
|----------------|-----------------|
| `levels/updater/classOperations.ts` | Re-export desde `updater/operations/` |
| `levels/updater/levelSlots.ts` | Re-export desde `updater/operations/` |
| `levels/updater/entityOperations.ts` | Re-export desde `updater/operations/` |
| `levels/updater/selectionOperations.ts` | Re-export desde `updater/operations/` |

**Opción A (recomendada):** Re-exportar desde index

```typescript
// core/domain/character/updater/operations/index.ts
export * from './buffOperations';
export * from './itemOperations';
// ...

// Re-export del sistema de niveles
export * from '../../../levels/updater';
```

**Opción B:** Mover físicamente los archivos (más disruptivo)

---

## Fase 4: Refactorizar CharacterUpdater

**Archivo:** `core/domain/character/updater/characterUpdater.ts`

```typescript
import * as ops from './operations';
import { calculateCharacterSheet } from '../calculation/calculateCharacterSheet';

export class CharacterUpdater implements ICharacterUpdater {
  private character: CharacterBaseData | null;
  private compendiumContext?: CompendiumContext;
  private onCharacterUpdated: (sheet: CharacterSheet, data: CharacterBaseData) => void;

  // Wrapper sobre funciones puras
  toggleBuff(buffId: string): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.toggleBuff(this.character, buffId);
    
    if (result.warnings.length > 0) {
      return { success: false, error: result.warnings[0].message };
    }
    
    this.character = result.character;
    this.notify();
    return { success: true };
  }

  addItem(item: Item): UpdateResult {
    if (!this.character) return this.characterNotSet;
    
    const result = ops.addItem(this.character, item);
    this.character = result.character;
    this.notify();
    return { success: true };
  }

  // Métodos del nuevo sistema de niveles
  addClass(classId: string): UpdateResult {
    if (!this.character || !this.compendiumContext) return this.characterNotSet;
    
    const result = ops.addClass(this.character, classId, this.compendiumContext);
    this.character = result.character;
    this.notify();
    return this.toUpdateResult(result);
  }

  private notify() {
    if (!this.character) return;
    this.character.updatedAt = new Date().toISOString();
    const sheet = calculateCharacterSheet(this.character);
    this.onCharacterUpdated(sheet, this.character);
  }

  private toUpdateResult(result: OperationResult): UpdateResult {
    if (result.warnings.length > 0) {
      return { success: false, error: result.warnings[0].message };
    }
    return { success: true };
  }
}
```

---

## Fase 5: Deprecar Código Legacy

### 5.1 Marcar como deprecated (no eliminar aún)

```typescript
// ICharacterUpdater
interface ICharacterUpdater {
  // ✅ Mantener
  toggleBuff(buffId: string): UpdateResult;
  addItem(item: Item): UpdateResult;
  // ...

  // ⚠️ DEPRECATED - Sistema viejo de niveles
  /** @deprecated Use addClass + addLevelSlot instead */
  updateClassFeature(featureUniqueId: string, feature: ClassFeature): UpdateResult;
  /** @deprecated Use addClass + addLevelSlot instead */
  addLevelFeat(level: number, feat: Feat): UpdateResult;
  // ...
}
```

### 5.2 Eliminar servicios redundantes

| Eliminar | Razón |
|----------|-------|
| `BuffService` | Lógica movida a `buffOperations.ts` |
| `SharedBuffService` | Lógica movida a `buffOperations.ts` |
| `update/buffs/toggleBuff.ts` | Duplicado, ya existe `buffOperations.ts` |

---

## Orden de Ejecución

| # | Tarea | Riesgo | Retrocompatible |
|---|-------|--------|-----------------|
| 1 | Crear `types.ts` con tipos unificados | Bajo | ✅ |
| 2 | Crear `buffOperations.ts` | Bajo | ✅ |
| 3 | Crear `itemOperations.ts` | Bajo | ✅ |
| 4 | Crear `hpOperations.ts` | Bajo | ✅ |
| 5 | Crear `resourceOperations.ts` | Bajo | ✅ |
| 6 | Crear `specialFeatureOperations.ts` | Bajo | ✅ |
| 7 | Crear `characterPropertyOperations.ts` | Bajo | ✅ |
| 8 | Crear `operations/index.ts` con re-exports | Bajo | ✅ |
| 9 | Refactorizar `CharacterUpdater` para usar funciones puras | Medio | ✅ |
| 10 | Eliminar `BuffService`, `SharedBuffService` | Bajo | ✅ |
| 11 | Añadir métodos del sistema de niveles a `ICharacterUpdater` | Bajo | ✅ |
| 12 | Marcar métodos legacy como deprecated | Bajo | ✅ |

---

## Tests

Cada fase incluye tests:

```typescript
// buffOperations.test.ts
describe('toggleBuff', () => {
  it('should toggle buff active state', () => {
    const character = buildCharacter().withBuff(activeBuff).build();
    const result = toggleBuff(character, 'buff-1');
    
    expect(result.warnings).toHaveLength(0);
    expect(result.character.buffs[0].active).toBe(false);
  });

  it('should return warning if buff not found', () => {
    const character = buildCharacter().build();
    const result = toggleBuff(character, 'nonexistent');
    
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('not_found');
  });
});
```

---

## Resumen

| Métrica | Antes | Después |
|---------|-------|---------|
| Líneas en CharacterUpdater | ~1078 | ~200 |
| Funciones puras testeables | 0 | ~25 |
| Servicios con estado | 2 | 0 |
| Duplicación de código | Alta | Ninguna |
| Retrocompatibilidad | N/A | ✅ 100% |

