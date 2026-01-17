# 12: Resources

**Prioridad:** Baja  
**Complejidad:** Baja  
**Dependencias:** `SourceValuesView`

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

Recursos del personaje (Ki Points, Rage Rounds, Spell Slots, etc.). Se definen mediante `RESOURCE_DEFINITION` en specialChanges de buffs/features.

### Estructura
```typescript
type Resource = {
  resourceId: string;
  name: string;
  currentValue: number;       // En baseData
  maxValue: number;           // Calculado
  chargesPerUse: number;      // Cuánto consume cada uso
  rechargeAmount: number;     // Cuánto recupera en rest
  sourceValues: SourceValue[];
}
```

---

## Componentes

### `ResourceCard.tsx`
```
┌────────────────────────────────┐
│ Ki Points               8/12   │
│ [Use] [Recharge]               │
└────────────────────────────────┘
```

Glow effect si `currentValue > 0`.

### `ResourcesSection.tsx`
Lista de recursos disponibles.

---

## Detalle

### `ResourceDetailPage.tsx`
Ruta: `/character/[id]/resource/[resourceId]`

Muestra:
- Current/Max con barra de progreso
- Botón "Use" (resta chargesPerUse)
- Botón "Recharge" (suma rechargeAmount)
- Input manual para ajustar
- SourceValues para maxValue

---

## Gestión

```typescript
export function useResources() {
  const resources = // De characterSheet
  
  const useResource = (resourceId: string) => {
    const resource = resources.find(r => r.resourceId === resourceId)
    const newValue = Math.max(0, resource.currentValue - resource.chargesPerUse)
    updateCharacter({ resources: { ...baseData.resources, [resourceId]: newValue } })
  }
  
  const rechargeResource = (resourceId: string) => { ... }
  const setResourceValue = (resourceId: string, value: number) => { ... }
  
  return { resources, useResource, rechargeResource, setResourceValue }
}
```

---

## Integración

**Desktop:** Columna 1  
**Mobile:** Tab "Main"

---

## Verificación

- [ ] Los recursos se muestran correctamente
- [ ] "Use" decrementa el valor
- [ ] "Recharge" incrementa el valor
- [ ] No se puede usar si currentValue es 0
- [ ] No se puede recargar más allá de max
- [ ] El glow effect aparece cuando current > 0

---

## Archivos

```
packages/ui/src/components/character/
├── resources/
│   ├── ResourceCard.tsx                 [ ]
│   ├── ResourcesSection.tsx             [ ]
│   └── index.ts                         [ ]
└── detail/
    └── ResourceDetailPage.tsx           [ ]

apps/zukus/app/character/[id]/
└── resource/
    └── [resourceId].tsx                 [ ]
```

---

**Referencia:** `zukusnextmicon/src/components/Character/ResourcesSection/`
