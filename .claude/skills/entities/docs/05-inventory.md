# Sistema de Inventario

Sistema de inventario basado en entidades que coexiste con el sistema legacy `equipment`.

> Ver tambien: `.cursor/rules/core/inventory-system.mdc` para API detallada

## Arquitectura

```
CharacterBaseData
├── equipment (legacy)          # Sistema antiguo
└── inventoryState (nuevo)      # Sistema de entidades
    ├── items: InventoryItemInstance[]
    └── currencies: CurrencyState
```

## InventoryItemInstance

```typescript
type InventoryItemInstance = {
  instanceId: string;        // UUID unico
  itemId: string;            // ID en compendium
  entityType: string;        // 'weapon', 'armor', 'item'
  quantity: number;          // Default 1
  containerId?: string;      // Si esta en container
  customName?: string;       // Nombre personalizado
  notes?: string;            // Notas del usuario

  instanceValues?: {         // Campos editables
    equipped?: boolean;
    wielded?: boolean;
    active?: boolean;
    [key: string]: boolean | number | string | undefined;
  };

  entity?: ResolvedInventoryEntity;  // Entidad resuelta (opcional)
};
```

## Propiedades de Items con @item Effects

Las propiedades (Keen, Flaming) son entidades que aplican Effects al item padre.

### En el Schema

```typescript
// weaponSchema.ts
{
  name: 'properties',
  type: 'reference_array',
  referenceType: 'weaponProperty',
  applyEffectsToParent: true,  // FLAG CLAVE
}
```

### Ejemplo: Keen

```typescript
const keenProperty = {
  id: 'keen',
  entityType: 'weaponProperty',
  name: 'Keen',
  effects: [{
    target: '@item.critRange',    // Target especial
    formula: '...',               // Formula para duplicar rango
    bonusType: 'untyped',
  }],
};
```

### Resolucion de Propiedades

```typescript
import {
  resolveItemForInventory,
  applyPropertyEffectsToItem
} from '@zukus/core';

// Resolver item con propiedades
const result = resolveItemForInventory(weaponEntity, {
  resolver: (type, id) => compendium.getEntity(type, id),
  evaluateFormula: (formula, ctx) => evaluate(formula, ctx),
});

// result.entity tiene propiedades aplicadas:
// - critRange modificado por Keen
// - _appliedEffects con trazabilidad
// - _modifiedFields con campos cambiados
```

### Target @item.X

Los Effects con target `@item.fieldName`:
1. Se extraen de las propiedades
2. Se evaluan con contexto del item
3. Se aplican al item padre

```typescript
// En la propiedad
{ target: '@item.critRange', formula: '...' }

// Resultado en el item
item.critRange = valorCalculado
item._appliedEffects = [{ propertyId: 'keen', originalValue: 19, modifiedValue: 17 }]
```

## Instance Fields

Campos editables por usuario usando helpers:

```typescript
import {
  isItemEquipped,
  setItemEquipped,
  isItemWielded,
  setItemWielded,
  isItemActive,
  setItemActive,
} from '@zukus/core';

// Leer
if (isItemEquipped(item)) { ... }

// Modificar (retorna nuevo item)
const equipped = setItemEquipped(item, true);
```

### Effects Condicionales con @instance

Los Effects pueden depender del estado de la instancia:

```typescript
{
  target: 'speed.base',
  formula: '30',
  conditions: [{
    type: 'simple',
    firstFormula: '@instance.active',
    operator: '==',
    secondFormula: '1'
  }]
}
```

Las referencias `@instance.X` se resuelven automaticamente:
- `@instance.equipped` -> 0 o 1
- `@instance.wielded` -> 0 o 1
- `@instance.active` -> 0 o 1

## Operaciones

### Items

```typescript
import { inventoryOps } from '@zukus/core';

// Anadir
const result = inventoryOps.addItem(state, {
  itemId: 'longsword',
  entityType: 'weapon',
  entity: resolvedEntity,
});

// Eliminar
inventoryOps.removeItem(state, instanceId, quantity?);

// Actualizar
inventoryOps.updateItem(state, instanceId, { equipped: true });

// Toggle equipado
inventoryOps.toggleItemEquipped(state, instanceId);
```

### Containers

```typescript
// Mover a container
inventoryOps.moveToContainer(state, instanceId, containerId);

// Sacar de container
inventoryOps.removeFromContainer(state, instanceId);

// Contenido
inventoryOps.getContainerContents(state, containerId);
```

### Currencies

```typescript
// Anadir
inventoryOps.addCurrency(currencies, 'gold', 100);

// Gastar
inventoryOps.removeCurrency(currencies, 'gold', 50);

// Convertir
inventoryOps.convertCurrency(currencies, 'gold', 'silver', 10, currencyDefs);
```

## Addons para Items

### dnd35item

```typescript
fields: [
  { name: 'weight', type: 'number' },
  { name: 'cost', type: 'object' },
  { name: 'itemSlot', type: 'string', optional: true },
  { name: 'aura', type: 'string', optional: true },
  { name: 'casterLevel', type: 'integer', optional: true },
]
```

### container

```typescript
fields: [
  { name: 'capacity', type: 'number' },
  { name: 'ignoresContentWeight', type: 'boolean' },
]
```

### equippable, wieldable, activable

Anaden instanceFields: `equipped`, `wielded`, `active`.

## Schemas de Entidades

| Schema | Campos Principales |
|--------|-------------------|
| weaponSchema | damageDice, damageType, critRange, critMultiplier, properties |
| armorSchema | armorBonus, maxDexBonus, armorCheckPenalty, properties |
| shieldSchema | shieldBonus, armorCheckPenalty, properties |
| currencySchema | abbreviation, conversionToBase, weightPerUnit |
| weaponPropertySchema | costType, costBonus, casterLevel, effects |
| armorPropertySchema | costType, costBonus, casterLevel, effects |

## Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `inventory/types.ts` | InventoryItemInstance, CurrencyState |
| `inventory/itemOperations.ts` | CRUD de items |
| `inventory/containerOperations.ts` | Operaciones de containers |
| `inventory/instanceFields.ts` | Helpers para equipped/wielded/active |
| `inventory/properties/resolveItemEffects.ts` | Aplica @item Effects |
| `inventory/properties/resolveItemForInventory.ts` | Flujo completo |

## Siguiente

Ver `06-relations.md` para el sistema de relaciones entre entidades.
