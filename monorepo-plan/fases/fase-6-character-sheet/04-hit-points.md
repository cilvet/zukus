# 04: Hit Points

**Prioridad:** Alta  
**Complejidad:** Media  
**Dependencias:** `SourceValuesView`, Buffs (temporal HP)

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

Barra de HP con current/max, modificación manual (heal/damage), y temporary HP desde buffs.

### Datos del core
```typescript
characterSheet.hitPoints.maxHp            // 58
characterSheet.currentHp                  // 45 (en baseData, no en sheet)
characterSheet.hitPoints.temporaryHp      // 10 (de buffs)
```

---

## Componentes

### `HitPointsBar.tsx`
UI:
```
┌──────────────────────────────────┐
│ HP: 45/58  (+10 temp)            │
│ [████████████░░░░░░░░] 77%       │
└──────────────────────────────────┘
```

Click navega a detalle.

### `HitPointsDetailPage.tsx`
Ruta: `/character/[id]/hit-points`

- Barra de progreso con colores según %
- Input para ajustar HP (heal/damage)
- Botones "Heal" y "Damage"
- Botón "Full Rest" (restaura a max)
- SourceValues para maxHp

---

## Edición

```typescript
const adjustHp = (amount: number) => {
  const newHp = Math.max(0, Math.min(maxHp, currentHp + amount))
  updateCharacter({ currentHp: newHp })
}
```

---

## Integración

**Desktop:** Columna 1  
**Mobile:** Tab "Main"

---

## Archivos

```
packages/ui/src/components/character/
├── hit-points/
│   ├── HitPointsBar.tsx                 [ ]
│   └── index.ts                         [ ]
└── detail/
    └── HitPointsDetailPage.tsx          [ ]

apps/zukus/app/character/[id]/
└── hit-points.tsx                       [ ]
```
