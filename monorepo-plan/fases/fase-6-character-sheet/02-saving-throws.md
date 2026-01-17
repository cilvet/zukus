# 02: Saving Throws

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

Los tres tiros de salvación (Fortitude, Reflex, Will) con sus bonuses totales.

### Datos del core
```typescript
characterSheet.savingThrows.fortitude.totalBonus    // +8
characterSheet.savingThrows.fortitude.sourceValues  // Array
```

### Referencia
- `zukusnextmicon/src/components/Character/savingThrows/`

---

## Componentes a Crear

### 1. `SavingThrowCard.tsx`
**Ubicación:** `packages/ui/src/components/character/saving-throws/SavingThrowCard.tsx`

UI:
```
┌─────────────┐
│   FOR       │
│   +8        │
└─────────────┘
```

Click navega a detalle.

### 2. `SavingThrowsSection.tsx`
**Ubicación:** `packages/ui/src/components/character/saving-throws/SavingThrowsSection.tsx`

Layout horizontal con los tres:
```
┌──────┬──────┬──────┐
│ FOR  │ REF  │ WIL  │
│  +8  │ +10  │  +5  │
└──────┴──────┴──────┘
```

### 3. `SavingThrowDetailPage.tsx`
**Ubicación:** `packages/ui/src/components/character/detail/SavingThrowDetailPage.tsx`

**Ruta:** `/character/[id]/saving-throw/[type]` (fortitude, reflex, will)

Muestra:
- Nombre (Fortitude/Reflex/Will)
- Bonus total
- SourceValuesView con desglose

---

## Traducción de Nombres

```typescript
export const savingThrowNames = {
  fortitude: 'Fortitude',
  reflex: 'Reflex',
  will: 'Will',
}

export const savingThrowAbbreviations = {
  fortitude: 'FOR',
  reflex: 'REF',
  will: 'WIL',
}
```

---

## Integración en CharacterSheet

**Desktop:** Columna 1, sección superior  
**Mobile:** Tab "Main" (sección 1)

---

## Verificación

- [ ] Las 3 saving throw cards se muestran
- [ ] Los valores son correctos
- [ ] Click navega a detalle
- [ ] SourceValues muestra el desglose correcto

---

## Archivos

```
packages/ui/src/components/character/
├── saving-throws/
│   ├── SavingThrowCard.tsx              [ ]
│   ├── SavingThrowsSection.tsx          [ ]
│   └── index.ts                         [ ]
└── detail/
    └── SavingThrowDetailPage.tsx        [ ]

apps/zukus/app/character/[id]/
└── saving-throw/
    └── [type].tsx                       [ ]
```
