# 03: Armor Class

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

Tres valores de AC: Total, Touch, Flat-Footed.

### Datos del core
```typescript
characterSheet.armorClass.total.totalValue        // 22
characterSheet.armorClass.touch.totalValue        // 14
characterSheet.armorClass.flatFooted.totalValue   // 18
```

### Referencia
- `zukusnextmicon/src/components/Character/armorClass/`

---

## Componentes

### `ArmorClassCard.tsx`
Muestra los tres valores:
```
┌─────────────┐
│ AC   22     │
│ Touch 14    │
│ FF    18    │
└─────────────┘
```

Click navega a detalle.

### `ArmorClassDetailPage.tsx`
Ruta: `/character/[id]/armor-class`

Tabs para alternar entre Total/Touch/Flat-Footed, mostrando sourceValues del seleccionado.

---

## Integración

**Desktop:** Columna 1  
**Mobile:** Tab "Main"

---

## Archivos

```
packages/ui/src/components/character/
├── armor-class/
│   ├── ArmorClassCard.tsx               [ ]
│   └── index.ts                         [ ]
└── detail/
    └── ArmorClassDetailPage.tsx         [ ]

apps/zukus/app/character/[id]/
└── armor-class.tsx                      [ ]
```
