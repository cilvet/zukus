# 11: Special Features

**Prioridad:** Media  
**Complejidad:** Media  
**Dependencias:** `ChangeForm`, `ContextualChangeForm`, `SpecialChangeForm`

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

Características especiales del personaje. Dos tipos:
1. **Class Features** - Otorgadas por niveles de clase (no editables)
2. **Custom Features** - Creadas por el usuario (editables)

### Estructura
```typescript
type SpecialFeature = {
  uniqueId: string;
  name: string;
  description: string;
  source: 'class' | 'custom';
  sourceClass?: string;       // Si viene de clase
  sourceLevel?: number;       // A qué nivel se obtiene
  changes?: Change[];
  contextualChanges?: AttackContextualChange[];
  specialChanges?: SpecialChange[];
}
```

---

## Componentes

### `SpecialFeatureCard.tsx`
```
┌────────────────────────────────┐
│ Sneak Attack +2d6              │
│ From: Rogue 3                  │
└────────────────────────────────┘
```

### `SpecialFeaturesSection.tsx`
Separar class features de custom:

```
Class Features:
- Sneak Attack +2d6
- Evasion

Custom Features:
- [Custom feature creada por usuario]

[+ Add Custom Feature]
```

---

## Edición

Solo las custom features son editables.

### `SpecialFeatureForm.tsx`
Similar a `BuffForm`:
- Nombre y descripción
- Changes con `ChangeForm`
- ContextualChanges (opcional)
- SpecialChanges (opcional)

---

## Detalle

### `SpecialFeatureDetailPage.tsx`
Ruta: `/character/[id]/feature/[featureId]`

Muestra:
- Nombre
- Source (si es class feature)
- Descripción
- Lista de changes (si tiene)

Botón "Edit" solo visible si es custom.

---

## Gestión

```typescript
export function useSpecialFeatures() {
  const classFeatures = // De characterSheet (read-only)
  const customFeatures = // De baseData (editable)
  
  const addCustomFeature = (feature: SpecialFeature) => { ... }
  const updateCustomFeature = (id: string, updates: Partial<SpecialFeature>) => { ... }
  const deleteCustomFeature = (id: string) => { ... }
  
  return { classFeatures, customFeatures, addCustomFeature, updateCustomFeature, deleteCustomFeature }
}
```

---

## Integración

**Desktop:** Columna 4  
**Mobile:** Tab "Features"

---

## Archivos

```
packages/ui/src/components/character/
├── special-features/
│   ├── SpecialFeatureCard.tsx           [ ]
│   ├── SpecialFeaturesSection.tsx       [ ]
│   ├── SpecialFeatureForm.tsx           [ ]
│   └── index.ts                         [ ]
└── detail/
    ├── SpecialFeatureDetailPage.tsx     [ ]
    └── SpecialFeatureEditPage.tsx       [ ]

apps/zukus/app/character/[id]/
└── feature/
    ├── [featureId].tsx                  [ ]
    ├── [featureId]/
    │   └── edit.tsx                     [ ]
    └── new.tsx                          [ ]
```

---

**Referencia:** `zukusnextmicon/src/components/Character/SpecialFeatures/`
