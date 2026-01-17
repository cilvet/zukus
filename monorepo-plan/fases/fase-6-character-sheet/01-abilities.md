# 01: Abilities (Ability Scores)

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

Las 6 habilidades base (STR, DEX, CON, INT, WIS, CHA) con sus valores totales y modificadores.

### Datos del core
```typescript
characterSheet.abilityScores.strength.totalScore    // 18
characterSheet.abilityScores.strength.modifier      // +4
characterSheet.abilityScores.strength.sourceValues  // Array de sources
```

### Referencia en zukusnextmicon
- `src/components/Character/abilities/AbilitiesSection.tsx`
- `src/components/Character/abilities/AbilityScoreCard.tsx`
- `src/components/Character/detail/AbilityDetail/AbilityDetail.tsx`

---

## 1. Visualización

### Componentes a crear

#### `AbilityCard.tsx`
**Ubicación:** `packages/ui/src/components/character/abilities/AbilityCard.tsx`

**Props:**
```typescript
type AbilityCardProps = {
  abilityKey: 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
  score: number;
  modifier: number;
  onPress: () => void;
}
```

**UI:**
```
┌─────────────┐
│    STR      │
│    +4       │  ← Modificador grande
│    18       │  ← Score pequeño
└─────────────┘
```

**Interactividad:**
- Click/tap navega a la página de detalle

---

#### `AbilitiesSection.tsx`
**Ubicación:** `packages/ui/src/components/character/abilities/AbilitiesSection.tsx`

**Responsabilidad:**
- Grid 3x2 con las 6 habilidades
- Usa `useCharacterStore` para obtener los datos
- Maneja navegación a detalle

**Layout:**
```
┌─────┬─────┬─────┐
│ STR │ DEX │ CON │
├─────┼─────┼─────┤
│ INT │ WIS │ CHA │
└─────┴─────┴─────┘
```

---

## 2. Navegación a Detalle

### Componente de detalle

#### `AbilityDetailPage.tsx`
**Ubicación:** `packages/ui/src/components/character/detail/AbilityDetailPage.tsx`

**Ruta:** `/character/[id]/ability/[abilityKey]`

**Contenido:**
1. **Header** con nombre de la habilidad
   - "Strength"
2. **Valor total** destacado
   - Score: 18
   - Modifier: +4
3. **SourceValuesView** con el desglose
   - Base: 16
   - Racial Bonus: +2
   - Enhancement (Belt): +2 (si tiene)

**Referencia:**
- `zukusnextmicon/src/components/Character/detail/AbilityDetail/AbilityDetail.tsx`

---

## 3. Edición

### Editor de ability scores base

**NOTA:** La edición de ability scores NO está en esta sección. Pertenece al **Editor de Personaje** (fase futura).

En esta fase solo mostramos los valores calculados.

Sin embargo, necesitamos preparar la estructura:

#### `AbilityScoresEditor.tsx`
**Ubicación:** `packages/ui/src/components/character/editor/AbilityScoresEditor.tsx`

**Props:**
```typescript
type AbilityScoresEditorProps = {
  baseScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  onChange: (scores: typeof baseScores) => void;
}
```

**UI:**
- 6 inputs numéricos
- Validación (normalmente 3-18, o más con buffs)

**Referencia:**
- `zukusnextmicon/src/components/CharacterEditor/AbilityScoresEditor/AbilityScoresEditor.tsx`

**Estado:** Implementar solo cuando se trabaje en el Editor de Personaje.

---

## 4. Integración en CharacterSheet

### Ubicación en el layout

En `CharacterSheet.tsx`:

**Desktop:**
- Columna 2 (junto con Skills)
- Posición superior

**Mobile:**
- Tab "Skills" (sección 2)
- Posición superior

---

## 5. Dependencias

### Componentes compartidos
- [x] `SourceValuesView` (para la página de detalle)

### Datos del core
```typescript
import type { AbilityScores } from '@zukus/core'

// Verificar que están exportados:
- AbilityScoreData (tipo de cada ability)
- SourceValue (para sourceValues)
```

---

## 6. Consideraciones Técnicas

### Traducción de nombres

Crear un helper para traducir los keys:

```typescript
// packages/ui/src/components/character/abilities/abilityTranslations.ts

export const abilityNames = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
}

export const abilityAbbreviations = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}
```

### Navegación

Usar Expo Router:
```typescript
import { useRouter } from 'expo-router'

const router = useRouter()

const handleAbilityPress = (abilityKey: string) => {
  router.push(`/character/${characterId}/ability/${abilityKey}`)
}
```

---

## 7. Verificación

Antes de considerar esta sección completa:

### Visualización
- [ ] Las 6 ability cards se muestran en grid 3x2
- [ ] Los valores vienen del characterSheet del store
- [ ] Los modificadores tienen el signo correcto (+/-)
- [ ] El diseño es responsive (desktop y mobile)

### Navegación
- [ ] Click en una ability navega a su detalle
- [ ] La página de detalle muestra el nombre correcto
- [ ] El score y modifier son correctos
- [ ] El botón de back funciona

### SourceValues
- [ ] El desglose de fuentes se muestra correctamente
- [ ] Las fuentes irrelevantes se filtran o se muestran grises
- [ ] El total coincide con la suma de sources relevantes

### Typecheck
- [ ] Todos los archivos pasan typecheck
- [ ] Las importaciones del core funcionan
- [ ] No hay warnings en la consola

---

## 8. Archivos Creados

Checklist de archivos:

```
packages/ui/src/components/character/
├── abilities/
│   ├── AbilityCard.tsx                  [ ]
│   ├── AbilitiesSection.tsx             [ ]
│   ├── abilityTranslations.ts           [ ]
│   └── index.ts                         [ ]
├── detail/
│   ├── AbilityDetailPage.tsx            [ ]
│   └── index.ts (actualizar)            [ ]
└── editor/
    └── AbilityScoresEditor.tsx          [ ] (para fase futura)

apps/zukus/app/
└── character/
    └── [id]/
        └── ability/
            └── [abilityKey].tsx         [ ]
```

---

## Siguiente Paso

Una vez completada esta sección, continuar con [02-saving-throws.md](./02-saving-throws.md) que tiene un flujo muy similar.
