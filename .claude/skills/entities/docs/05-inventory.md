# Sistema de Inventario

Sistema de inventario basado en entidades que coexiste con el sistema legacy `equipment`.

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

  entity?: ResolvedInventoryEntity;  // Entidad resuelta con valores de instancia
};

// La entidad contiene TODO, incluyendo valores de instancia:
entity: {
  id: 'longsword',
  name: 'Longsword',
  damage: '1d8',
  equipped: false,   // Valor de instancia (del addon equippable)
  wielded: false,    // Valor de instancia (del addon wieldable)
  quantity: 1,       // Valor de instancia (del addon stackable)
  // ... otros campos
}
```

**Principio clave**: Los valores de instancia (equipped, wielded, active, quantity) son campos **normales de la entidad**, no un campo separado. Esto permite que las formulas accedan directamente a `@item.equipped`, `@item.quantity`, etc.

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

## Instance Fields (Sistema Dinamico)

Los instance fields son campos editables por usuario que existen **por instancia** de una entidad. Se definen en los **addons** del schema y se descubren dinamicamente.

### Arquitectura

```
Schema (en compendium)
├── addons: ['equippable', 'wieldable', 'stackable']
│
└── Addons definen instanceFields:
    ├── equippable → equipped: boolean (default: false)
    ├── wieldable → wielded: boolean (default: false)
    ├── activable → active: boolean (default: false)
    └── stackable → quantity: number (default: 1)
```

Los valores de instancia son campos **normales de la entidad**, fusionados al resolver el item.

### Descubrir Instance Fields

```typescript
import {
  getInstanceFieldsFromCompendium,
  hasInstanceField,
  getInstanceField,
} from '@zukus/core';

// Obtener todos los instance fields de un tipo de entidad
const fields = getInstanceFieldsFromCompendium('armor', compendium);
// → [{ name: 'equipped', type: 'boolean', default: false, label: 'Equipped' }]

// Verificar si un tipo tiene un campo especifico
if (hasInstanceField('weapon', 'wielded', compendium)) {
  // El schema de weapon incluye el addon wieldable
}

// Obtener definicion de un campo
const field = getInstanceField('item', 'quantity', compendium);
// → { name: 'quantity', type: 'number', default: 1, label: 'Quantity' }
```

### Helpers para Campos Comunes

Para los campos mas usados, existen helpers tipados:

```typescript
import {
  isItemEquipped,
  setItemEquipped,
  isItemWielded,
  setItemWielded,
  isItemActive,
  setItemActive,
} from '@zukus/core';

// Leer - accede a entity.equipped
if (isItemEquipped(item)) { ... }

// Modificar - retorna nuevo item con entity.equipped actualizado
const equipped = setItemEquipped(item, true);
```

### Modificar Instance Fields Genericamente

Para campos arbitrarios (incluyendo quantity), usar el CharacterUpdater:

```typescript
// En el store
characterStore.setInventoryInstanceField(instanceId, 'quantity', 5);
characterStore.setInventoryInstanceField(instanceId, 'equipped', true);
```

### Effects Condicionales con @instance.X

Los Effects pueden depender del estado de la instancia. Las referencias `@instance.X` se resuelven en tiempo de compilacion de effects:

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

Resolucion de `@instance.X`:
- `@instance.equipped` → entity.equipped → 0 o 1
- `@instance.wielded` → entity.wielded → 0 o 1
- `@instance.active` → entity.active → 0 o 1
- `@instance.quantity` → entity.quantity → numero

### Diferencia: @entity.X vs @instance.X

| Placeholder | Uso | Resolucion |
|-------------|-----|------------|
| `@entity.X` | En autoEffects | Propiedades estaticas de la entidad (casterLevel, enhancementBonus) |
| `@instance.X` | En conditions de effects | Valores de instancia editables (equipped, wielded, active, quantity) |

```typescript
// @entity.X - para valores de la definicion de la entidad
autoEffects: [{
  target: 'ac.armor',
  formula: '@entity.armorBonus + @entity.enhancementBonus'
}]

// @instance.X - para condiciones basadas en estado del usuario
effects: [{
  target: 'ac.armor',
  formula: '@entity.armorBonus',
  conditions: [{
    type: 'simple',
    firstFormula: '@instance.equipped',
    operator: '==',
    secondFormula: '1'
  }]
}]
```

## Operaciones

### Items

```typescript
import { inventoryOps } from '@zukus/core';

// Anadir (entity debe tener equipped/wielded/active)
const result = inventoryOps.addItem(state, {
  itemId: 'longsword',
  entityType: 'weapon',
  entity: resolvedEntity,
});

// Eliminar
inventoryOps.removeItem(state, instanceId, quantity?);

// Actualizar metadata (quantity, notes, etc.)
inventoryOps.updateItem(state, instanceId, { quantity: 5 });

// Toggle equipado (modifica entity.equipped)
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

Los addons inyectan campos al schema. Algunos definen `fields` (campos estaticos) y otros `instanceFields` (campos editables por instancia).

### dnd35item (campos estaticos)

Propiedades comunes de items D&D 3.5:

```typescript
fields: [
  { name: 'weight', type: 'number' },
  { name: 'cost', type: 'object', objectFields: [
    { name: 'amount', type: 'number' },
    { name: 'currency', type: 'string' }
  ]},
  { name: 'itemSlot', type: 'string', optional: true },
  { name: 'aura', type: 'string', optional: true },
  { name: 'casterLevel', type: 'integer', optional: true },
]
```

### container (campos estaticos)

Para items que contienen otros items:

```typescript
fields: [
  { name: 'capacity', type: 'number' },        // Peso maximo en libras
  { name: 'ignoresContentWeight', type: 'boolean' },  // Bag of Holding
]
```

### equippable (instanceField)

Para armaduras, anillos, amuletos, etc.:

```typescript
instanceFields: [
  { name: 'equipped', type: 'boolean', default: false, label: 'Equipped' }
]
```

**Cuando usar**: Items que necesitan "ponerse" para dar beneficios.

### wieldable (instanceField)

Para armas que se empunan:

```typescript
instanceFields: [
  { name: 'wielded', type: 'boolean', default: false, label: 'Wielded' }
]
```

**Cuando usar**: Armas. Un arma puede estar equipped (en el cinturon) pero no wielded (en mano).

### activable (instanceField)

Para items con efecto toggle:

```typescript
instanceFields: [
  { name: 'active', type: 'boolean', default: false, label: 'Active' }
]
```

**Cuando usar**: Items como Ring of Invisibility, Boots of Speed que se activan/desactivan.

### stackable (instanceField)

Para items que se apilan (quantity > 1):

```typescript
instanceFields: [
  { name: 'quantity', type: 'number', default: 1, label: 'Quantity' }
]
```

**Cuando usar**: Municion (flechas, virotes), consumibles (pociones, scrolls), materiales.

### Ejemplo de Schema con Addons

```typescript
// itemSchema.ts - Item generico stackable
export const itemSchema: EntitySchemaDefinition = {
  typeName: 'item',
  description: 'D&D 3.5 General Item',
  addons: ['searchable', 'imageable', 'taggable', 'dnd35item', 'stackable'],
  fields: [],  // Solo usa campos de addons
};

// armorSchema.ts - Armadura equipable
export const armorSchema: EntitySchemaDefinition = {
  typeName: 'armor',
  addons: ['searchable', 'imageable', 'dnd35item', 'effectful', 'equippable'],
  fields: [
    { name: 'armorBonus', type: 'integer' },
    { name: 'maxDexBonus', type: 'integer' },
    // ...
  ],
};
```

## Compilacion de Effects desde Inventario

Los items equipados contribuyen effects al personaje durante el calculo.

### Flujo de Compilacion

```
compileCharacterEffects(characterBaseData)
├── compileBuffEffects()        # Buffs activos
├── compileEntityEffects()      # Entidades custom (class features, etc.)
└── compileInventoryItemEffects()  # Items equipados
    │
    ├── Para cada item en inventoryState.items:
    │   ├── Verificar isItemEquipped(item)
    │   ├── Obtener entity.effects
    │   ├── Filtrar effects que NO son @item.X
    │   ├── Resolver @instance.X en conditions
    │   └── Añadir al pool de compiled effects
```

### Que Effects se Incluyen

Solo los effects de items **equipados** que:
- No tienen target `@item.X` (esos son para el item, no el personaje)
- Pasan sus conditions (incluyendo `@instance.X`)

```typescript
// Effect que aplica al personaje (se incluye)
{
  target: 'ac.armor',
  formula: '@entity.armorBonus',
  conditions: [{ firstFormula: '@instance.equipped', operator: '==', secondFormula: '1' }]
}

// Effect que aplica al item (NO se incluye aqui)
{
  target: '@item.critRange',
  formula: '...'
}
```

### Ubicacion del Codigo

- Compilacion: `character/calculation/effects/compileEffects.ts`
- Funcion: `compileInventoryItemEffects()`

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
| **Tipos e instancias** | |
| `inventory/types.ts` | InventoryItemInstance, CurrencyState, InventoryState |
| `inventory/instanceFields.ts` | Helpers: isItemEquipped, setItemEquipped, etc. |
| **Operaciones** | |
| `inventory/itemOperations.ts` | CRUD de items |
| `inventory/containerOperations.ts` | Operaciones de containers |
| `inventory/currencies/currencyOperations.ts` | Operaciones de currencies |
| `character/updater/operations/inventoryOperations.ts` | Wrapper para CharacterUpdater |
| **Propiedades y Effects** | |
| `inventory/properties/resolveItemEffects.ts` | Aplica @item Effects |
| `inventory/properties/resolveItemForInventory.ts` | Flujo completo de resolucion |
| `character/calculation/effects/compileEffects.ts` | Compila effects de items equipados |
| **Instance Fields dinamicos** | |
| `entities/instanceFields/getInstanceFields.ts` | Descubre instance fields del schema |
| `entities/types/instanceFields.ts` | Tipos: InstanceFieldDefinition |
| `levels/entities/defaultAddons.ts` | Definiciones de addons con instanceFields |
| **Schemas de ejemplo** | |
| `compendiums/examples/schemas/itemSchema.ts` | Item generico (stackable) |
| `compendiums/examples/schemas/armorSchema.ts` | Armadura (equippable) |
| `compendiums/examples/schemas/weaponSchema.ts` | Arma (wieldable) |

## Siguiente

Ver `06-relations.md` para el sistema de relaciones entre entidades.
