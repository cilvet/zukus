# 09: Equipment

**Prioridad:** Media  
**Complejidad:** Alta  
**Dependencias:** `EntitySearchModal`, `ChangeForm`, `SpecialChangeForm`

---

## ⚠️ DISCLAIMER IMPORTANTE PARA EL AGENTE

**ANTES de implementar CUALQUIER componente:**

1. **PREGUNTA AL USUARIO sobre el diseño visual del componente**
2. **NO asumas** que el diseño debe ser igual a zukusnextmicon
3. **La referencia de zukusnextmicon es VIEJA** - solo úsala para entender la funcionalidad, NO para el diseño
4. **Muestra propuestas** o mockups de cómo podría verse
5. **Espera confirmación** del usuario antes de escribir código

**NUNCA implementes sin preguntar primero sobre el diseño.**

---

## Contexto

Inventario del personaje con búsqueda de items del compendio, equipar/desequipar, y modificadores que otorgan.

### Estructura de un Item
```typescript
type InventoryItem = {
  uniqueId: string;
  entityId: string;          // ID del item en el compendio
  name: string;
  itemType: 'WEAPON' | 'ARMOR' | 'BELT' | 'BOOTS' | ...;
  equipped: boolean;
  quantity: number;
  weight: number;
  cost: number;
  description: string;
  changes?: Change[];
  specialChanges?: SpecialChange[];
  // Para armas
  damage?: string;           // "1d8"
  criticalRange?: string;    // "19-20/x2"
  // Para armaduras
  armorBonus?: number;
  maxDexBonus?: number;
  armorCheckPenalty?: number;
}
```

---

## Componentes

### Visualización

#### `EquipmentItem.tsx`
```
┌────────────────────────────────┐
│ [✓] Longsword +1               │
│     1d8+1, 4 lbs               │
└────────────────────────────────┘
```

Checkbox para equipar/desequipar.

#### `EquipmentSection.tsx`
- Lista de items equipados
- Lista de items en inventario (no equipados)
- Botón "Add Item" (abre búsqueda)
- Modo edición para eliminar items

---

### Navegación a Detalle

#### `EquipmentItemDetailPage.tsx`
Ruta: `/character/[id]/equipment/[itemId]`

Muestra:
- Nombre e icono
- Descripción
- Estadísticas (según tipo: arma/armadura/accesorio)
- Changes que otorga (si tiene)
- Botón "Equip/Unequip"
- Botón "Edit" (para custom items)
- Botón "Delete"

---

### Búsqueda de Items

#### `EquipmentSearchModal.tsx`
Usa `EntitySearchModal` genérico con schema de items.

Filtros:
- Por tipo (Weapon, Armor, Potion, etc.)
- Por subtipo (Longsword, Plate, etc.)
- Por peso
- Por costo

Al seleccionar un item, se añade al inventario.

---

### Edición

Items pueden ser:
1. **Del compendio** (no editables, solo equipar/desequipar/eliminar)
2. **Custom** (creados por el usuario, totalmente editables)

#### `EquipmentItemForm.tsx`
Para crear/editar items custom:
- Información básica (nombre, tipo, peso, costo)
- Estadísticas según tipo
- Changes con `ChangeForm`
- SpecialChanges con `SpecialChangeForm`

---

## Gestión de Estado

```typescript
export function useEquipmentManagement() {
  const addItem = (item: InventoryItem) => { ... }
  const removeItem = (itemId: string) => { ... }
  const toggleEquipped = (itemId: string) => { ... }
  const updateItem = (itemId: string, updates: Partial<InventoryItem>) => { ... }
  
  return { addItem, removeItem, toggleEquipped, updateItem }
}
```

---

## Integración

**Desktop:** Columna 4  
**Mobile:** Tab "Inventory"

---

## Verificación

- [ ] Lista de equipment se muestra
- [ ] Equipar/desequipar funciona
- [ ] Los items equipados afectan stats (armas → ataques, armaduras → AC)
- [ ] Búsqueda de items funciona
- [ ] Se pueden añadir items del compendio
- [ ] Se pueden crear items custom
- [ ] Se pueden editar items custom
- [ ] Se pueden eliminar items

---

## Archivos

```
packages/ui/src/components/character/
├── equipment/
│   ├── EquipmentItem.tsx                [ ]
│   ├── EquipmentSection.tsx             [ ]
│   ├── EquipmentItemForm.tsx            [ ]
│   └── index.ts                         [ ]
└── detail/
    └── EquipmentItemDetailPage.tsx      [ ]

apps/zukus/app/character/[id]/
└── equipment/
    ├── [itemId].tsx                     [ ]
    ├── [itemId]/
    │   └── edit.tsx                     [ ]
    └── new.tsx                          [ ]
```

---

**Referencia:** `zukusnextmicon/src/components/Character/Equipment/`
