# 05: Combat Basics (Initiative + BAB)

**Prioridad:** Alta  
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

Iniciativa y Base Attack Bonus, dos stats simples de combate.

### Datos del core
```typescript
characterSheet.initiative.totalValue      // +6
characterSheet.baseAttackBonus.totalValue // +6
```

---

## Componentes

### `InitiativeCard.tsx`
```
┌─────────────┐
│ Initiative  │
│    +6       │
└─────────────┘
```

### `BABCard.tsx`
```
┌─────────────┐
│     BAB     │
│    +6/+1    │
└─────────────┘
```

Nota: BAB puede tener múltiples ataques (ej: +6/+1 a nivel 6+).

### `CombatSection.tsx`
Contiene Initiative + BAB + Attacks (de la sección 06).

---

## Detalles

### `InitiativeDetailPage.tsx`
Ruta: `/character/[id]/initiative`
- Total value
- SourceValues

### `BABDetailPage.tsx`
Ruta: `/character/[id]/bab`
- Total value
- SourceValues (normalmente solo class levels)

---

## Integración

**Desktop:** Columna 1, sección "Combat"  
**Mobile:** Tab "Main", sección "Combat"

---

## Archivos

```
packages/ui/src/components/character/
├── combat/
│   ├── InitiativeCard.tsx               [ ]
│   ├── BABCard.tsx                      [ ]
│   ├── CombatSection.tsx                [ ]
│   └── index.ts                         [ ]
└── detail/
    ├── InitiativeDetailPage.tsx         [ ]
    └── BABDetailPage.tsx                [ ]

apps/zukus/app/character/[id]/
├── initiative.tsx                       [ ]
└── bab.tsx                              [ ]
```
