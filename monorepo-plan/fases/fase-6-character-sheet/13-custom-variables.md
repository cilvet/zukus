# 13: Custom Variables

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

Variables personalizadas definidas por el usuario (ej: Honor, Sanity, etc.). Se definen mediante `CUSTOM_VARIABLE_DEFINITION` en specialChanges.

### Estructura
```typescript
type CustomVariable = {
  variableId: string;
  name: string;
  totalValue: number;
  sourceValues: SourceValue[];
}
```

### Ejemplo: Honor
```
Name: Honor
Total Value: 15

Sources:
- Base: 10
- Paladin Levels: +5
```

---

## Componentes

### `CustomVariableCard.tsx`
```
┌────────────────────────────────┐
│ Honor                      15  │
└────────────────────────────────┘
```

Click navega a detalle.

### `CustomVariablesSection.tsx`
Lista simple de variables personalizadas.

**Nota:** En zukusnextmicon se usa `LayoutEngine` para renderizado dinámico. Aquí podemos simplificar inicialmente con una lista básica.

---

## Detalle

### `CustomVariableDetailPage.tsx`
Ruta: `/character/[id]/variable/[variableId]`

Muestra:
- Nombre
- Total value
- SourceValues con desglose

---

## Integración

**Desktop:** Columna 4  
**Mobile:** Tab "Features"

---

## Verificación

- [ ] Las variables se muestran correctamente
- [ ] Click navega a detalle
- [ ] SourceValues muestra el desglose correcto
- [ ] Las variables se calculan desde las definitions en specialChanges

---

## Archivos

```
packages/ui/src/components/character/
├── custom-variables/
│   ├── CustomVariableCard.tsx           [ ]
│   ├── CustomVariablesSection.tsx       [ ]
│   └── index.ts                         [ ]
└── detail/
    └── CustomVariableDetailPage.tsx     [ ]

apps/zukus/app/character/[id]/
└── variable/
    └── [variableId].tsx                 [ ]
```

---

**Referencia:** `zukusnextmicon/src/components/Character/CustomVariables/`

---

## Nota sobre LayoutEngine

zukusnextmicon tiene un sistema de `LayoutEngine` para renderizar variables custom de forma dinámica. Este sistema es complejo y puede simplificarse para el MVP:

- **MVP:** Lista simple de variables
- **Futuro:** Sistema de layout configurable

Por ahora, hardcodear algunas variables conocidas (Honor, Sanity) y permitir que specialChanges las definan.
