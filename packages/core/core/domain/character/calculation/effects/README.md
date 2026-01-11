# Sistema de Effects

Este documento describe el nuevo sistema de Effects y cómo aplicarlo a las funciones de cálculo del personaje.

## Índice

1. [Visión General](#visión-general)
2. [Tipos Principales](#tipos-principales)
3. [Flujo de Datos](#flujo-de-datos)
4. [Cómo Aplicar Effects a una Función de Cálculo](#cómo-aplicar-effects-a-una-función-de-cálculo)
5. [Ejemplo: calculateSize](#ejemplo-calculatesize)
6. [Archivos Relevantes](#archivos-relevantes)

---

## Visión General

El sistema de Effects es un reemplazo gradual para el sistema de Changes. Mientras que Changes tiene múltiples tipos discriminados (ABILITY_SCORE, AC, SAVING_THROW, etc.), **Effects usa un sistema basado en paths** similar a CustomVariableChange.

### Ventajas de Effects sobre Changes

| Aspecto | Changes | Effects |
|---------|---------|---------|
| Tipos | 17+ tipos discriminados | Un solo tipo con `target` path |
| BonusTypes | Enum hardcodeado | String libre |
| Fórmula | Siempre `{ expression: "..." }` | String directo o Formula |
| Identificador de fuente | `originType` + `originId` | Un solo `sourceRef` |

---

## Tipos Principales

### Effect (átomo fundamental)

```typescript
type Effect = {
  target: string;              // Path al stat: "size.total", "ability.strength.score"
  formula: string | Formula;   // "4" o { expression: "4" }
  bonusType?: string;          // Libre: "ENHANCEMENT", "UNTYPED", etc.
  conditions?: Condition[];    // Condiciones para aplicar
}
```

### SourcedEffect (compilado con origen)

```typescript
type SourcedEffect = Effect & {
  sourceRef: string;    // "spell:enlarge-person", "item:belt-of-strength"
  sourceName: string;   // "Enlarge Person" (para UI)
}
```

### CompiledEffects (agrupados para búsqueda eficiente)

```typescript
type CompiledEffects = {
  all: SourcedEffect[];
  byPrefix: Map<string, SourcedEffect[]>;  // Agrupados por prefijo del target
}
```

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│  calculateCharacterSheet()                                      │
│                                                                 │
│  1. compileContextualizedChanges() → CharacterChanges           │
│  2. compileCharacterEffects()      → CompiledEffects  ← NUEVO   │
│                                                                 │
│  3. Pipeline de cálculo (reduce):                               │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │  getCalculatedSize(baseData, index, changes, ..., effects)│
│     │     ├── Calcular con changes (como antes)               │ │
│     │     ├── applyEffectsToSize()  ← NUEVO                   │ │
│     │     └── Retornar valores actualizados                   │ │
│     └─────────────────────────────────────────────────────────┘ │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │  getCalculatedAbilityScores(..., effects)               │ │
│     │     (usa index ya actualizado por Size)                 │ │
│     └─────────────────────────────────────────────────────────┘ │
│     ... (más funciones en orden de dependencia)                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Importante**: Los effects se aplican al final de cada función de cálculo, ANTES de que la siguiente función use los valores. Esto mantiene las dependencias correctas entre cálculos.

---

## Cómo Aplicar Effects a una Función de Cálculo

### Paso 1: Añadir el parámetro `effects` a la función

```typescript
import { CompiledEffects, getEffectsByTarget } from "../effects/compileEffects";
import { calculateEffect, effectsToSourceValues, mergeEffectsWithSources } from "../effects/applyEffects";

export const getCalculatedXXX: getSheetWithUpdatedField = function (
  baseData: CharacterBaseData,
  index: SubstitutionIndex,
  changes: CharacterChanges,
  contextualChanges?: ContextualChange[],
  specialChanges?: SpecialChange[],
  effects?: CompiledEffects  // ← AÑADIR
) {
  // ...
};
```

### Paso 2: Calcular valores con changes (como antes)

```typescript
const xxxChanges = changes.xxxChanges.map((change) =>
  calculateSource(change, index)
);

const changesSourceValues = getCalculatedSourceValues(xxxChanges);
```

### Paso 3: Aplicar effects al final

```typescript
// Obtener effects que apuntan a este stat
const targetEffects = getEffectsByTarget(effects, "xxx.total");

if (targetEffects.length > 0) {
  // Calcular cada effect
  const calculatedEffects = targetEffects.map((effect) =>
    calculateEffect(effect, index)
  );

  // Convertir a source values (aplica stacking)
  const effectsSourceValues = effectsToSourceValues(calculatedEffects);

  // Mergear con los source values de changes
  const finalSourceValues = mergeEffectsWithSources(
    changesSourceValues,
    effectsSourceValues
  );
  
  // Usar finalSourceValues.total y finalSourceValues.sourceValues
}
```

### Paso 4: Actualizar el index con valores finales

```typescript
const indexValuesToUpdate: SubstitutionIndex = {
  [valueIndexKeys.XXX_TOTAL]: finalSourceValues.total,
};
```

---

## Ejemplos de Implementación

### Ejemplo 1: calculateSize

Ver archivo: `core/domain/character/calculation/size/calculateSize.ts`

**Targets soportados:**

| Target | Descripción |
|--------|-------------|
| `size.total` | Tamaño total del personaje |

**Ejemplo de Effect:**

```typescript
const enlargePerson: Effect = {
  target: "size.total",
  formula: "1",           // +1 categoría de tamaño
  bonusType: "UNTYPED",
}
```

### Ejemplo 2: calculateAbilityScores

Ver archivo: `core/domain/character/calculation/abilityScores/calculateAbilityScores.ts`

**Targets soportados:**

| Target | Descripción |
|--------|-------------|
| `ability.strength.score` | Puntuación de Fuerza |
| `ability.dexterity.score` | Puntuación de Destreza |
| `ability.constitution.score` | Puntuación de Constitución |
| `ability.intelligence.score` | Puntuación de Inteligencia |
| `ability.wisdom.score` | Puntuación de Sabiduría |
| `ability.charisma.score` | Puntuación de Carisma |

**Ejemplo de Effect:**

```typescript
const bullsStrength: Effect = {
  target: "ability.strength.score",
  formula: "4",
  bonusType: "ENHANCEMENT",
}
```

### Ejemplo 3: calculateInitiative

Ver archivo: `core/domain/character/calculation/initiative/calculateInitiative.ts`

**Targets soportados:**

| Target | Descripción |
|--------|-------------|
| `initiative.total` | Iniciativa total |

**Ejemplo de Effect:**

```typescript
const improvedInitiative: Effect = {
  target: "initiative.total",
  formula: "4",
  bonusType: "UNTYPED",
}
```

### Ejemplo 4: calculateBaseAttackBonus

Ver archivo: `core/domain/character/calculation/baseAttackBonus/calculateBaseAttackBonus.ts`

**Targets soportados:**

| Target | Descripción |
|--------|-------------|
| `bab.total` | Bonificador de ataque base total |

**Ejemplo de Effect:**

```typescript
const divineFavor: Effect = {
  target: "bab.total",
  formula: "floor(@character.level / 3)",  // Escala con nivel
  bonusType: "UNTYPED",
}
```

### Ejemplo 5: calculateHitPoints

Ver archivo: `core/domain/character/calculation/hitPoints/calculateHitPoints.ts`

**Targets soportados:**

| Target | Descripción |
|--------|-------------|
| `hp.max` | Puntos de golpe máximos |
| `hp.temporary` | Puntos de golpe temporales |

**Ejemplo de Effects:**

```typescript
const toughness: Effect = {
  target: "hp.max",
  formula: "@character.level",  // +1 HP por nivel
  bonusType: "UNTYPED",
}

const aidSpell: Effect = {
  target: "hp.temporary",
  formula: "1d8 + 5",
  bonusType: "UNTYPED",
}
```

### Ejemplo 6: calculateSavingThrows

Ver archivo: `core/domain/character/calculation/savingThrows/calculateSavingThrows.ts`

**Targets soportados:**

| Target | Descripción |
|--------|-------------|
| `savingThrow.fortitude.total` | Salvación de Fortaleza |
| `savingThrow.reflex.total` | Salvación de Reflejos |
| `savingThrow.will.total` | Salvación de Voluntad |

**Ejemplo de Effects:**

```typescript
const resistance: Effect = {
  target: "savingThrow.fortitude.total",
  formula: "1",
  bonusType: "RESISTANCE",
}

const greatFortitude: Effect = {
  target: "savingThrow.fortitude.total",
  formula: "2",
  bonusType: "UNTYPED",
}
```

### Ejemplo 7: calculateArmorClass

Ver archivo: `core/domain/character/calculation/armorClass/calculateArmorClass.ts`

**Targets soportados:**

| Target | Descripción |
|--------|-------------|
| `ac.total` | Clase de Armadura total |
| `ac.touch.total` | CA contra ataques de toque |
| `ac.flatFooted.total` | CA con los pies planos |

**Ejemplo de Effects:**

```typescript
const shieldOfFaith: Effect = {
  target: "ac.total",
  formula: "2",
  bonusType: "DEFLECTION",
}

const dodge: Effect = {
  target: "ac.total",
  formula: "1",
  bonusType: "DODGE",  // Stacks with itself
}
```

### Ejemplo 8: calculateSkills

Ver archivo: `core/domain/character/calculation/skills/calculateSkills.ts`

**Targets soportados:**

| Target | Descripción |
|--------|-------------|
| `skills.{skillUniqueId}.total` | Bonificador total de habilidad |

**Ejemplo de Effects:**

```typescript
const guidanceSpell: Effect = {
  target: "skills.diplomacy.total",
  formula: "1d4",
  bonusType: "COMPETENCE",
}

const skillFocus: Effect = {
  target: "skills.perception.total",
  formula: "3",
  bonusType: "UNTYPED",
}
```

### Ejemplo de Buff con Effects

```typescript
const enlargePersonBuff: Buff = {
  uniqueId: "enlarge-person",
  name: "Enlarge Person",
  description: "+1 size category, +2 Strength",
  originType: "spell",
  originName: "Enlarge Person",
  originUniqueId: "spell-enlarge-person",
  active: true,
  
  // Nuevo sistema de effects
  effects: [
    {
      target: "size.total",
      formula: "1",
      bonusType: "UNTYPED",
    },
    {
      target: "ability.strength.score",
      formula: "2",
      bonusType: "UNTYPED",
    }
  ]
}
```

---

## Ejemplos Completos de Buffs

### Buff de Combate Completo

```typescript
const blessSpell: Buff = {
  uniqueId: "bless",
  name: "Bless",
  description: "+1 morale bonus on attack rolls and saving throws vs fear",
  originType: "spell",
  originName: "Bless",
  originUniqueId: "spell-bless",
  active: true,
  effects: [
    {
      target: "bab.total",
      formula: "1",
      bonusType: "MORALE",
    },
    {
      target: "savingThrow.fortitude.total",
      formula: "1",
      bonusType: "MORALE",
      conditions: [{
        type: "simple",
        firstFormula: { expression: "1" },  // Vs fear only
        operator: "==",
        secondFormula: { expression: "1" }
      }]
    },
    {
      target: "savingThrow.will.total",
      formula: "1",
      bonusType: "MORALE",
      conditions: [{
        type: "simple",
        firstFormula: { expression: "1" },  // Vs fear only
        operator: "==",
        secondFormula: { expression: "1" }
      }]
    }
  ]
}
```

### Buff con Múltiples Stats

```typescript
const barkskinSpell: Buff = {
  uniqueId: "barkskin",
  name: "Barkskin",
  description: "Natural armor enhancement bonus",
  originType: "spell",
  originName: "Barkskin",
  originUniqueId: "spell-barkskin",
  active: true,
  effects: [
    {
      target: "ac.total",
      formula: "2 + floor(@character.level / 3)",  // Scales with caster level
      bonusType: "ENHANCEMENT",
    }
  ]
}
```

### Buff de Habilidades

```typescript
const foxsCunning: Buff = {
  uniqueId: "foxs-cunning",
  name: "Fox's Cunning",
  description: "+4 enhancement bonus to Intelligence",
  originType: "spell",
  originName: "Fox's Cunning",
  originUniqueId: "spell-foxs-cunning",
  active: true,
  effects: [
    {
      target: "ability.intelligence.score",
      formula: "4",
      bonusType: "ENHANCEMENT",
    }
  ]
}
```

### Buff Temporal con HP

```typescript
const heroism: Buff = {
  uniqueId: "heroism",
  name: "Heroism",
  description: "+2 morale bonus on attack rolls, saves, and skill checks",
  originType: "spell",
  originName: "Heroism",
  originUniqueId: "spell-heroism",
  active: true,
  effects: [
    {
      target: "bab.total",
      formula: "2",
      bonusType: "MORALE",
    },
    {
      target: "savingThrow.fortitude.total",
      formula: "2",
      bonusType: "MORALE",
    },
    {
      target: "savingThrow.reflex.total",
      formula: "2",
      bonusType: "MORALE",
    },
    {
      target: "savingThrow.will.total",
      formula: "2",
      bonusType: "MORALE",
    },
    {
      target: "skills.diplomacy.total",
      formula: "2",
      bonusType: "MORALE",
    },
    {
      target: "skills.intimidate.total",
      formula: "2",
      bonusType: "MORALE",
    }
  ]
}
```

---

## Archivos Relevantes

| Archivo | Propósito |
|---------|-----------|
| `baseData/effects.ts` | Tipos: Effect, SourcedEffect, ManualEffectVariable, etc. |
| `calculation/effects/applyEffects.ts` | Helpers: calculateEffect, effectsToSourceValues, mergeEffectsWithSources |
| `calculation/effects/compileEffects.ts` | compileCharacterEffects, getEffectsByTarget, getEffectsByPrefix |
| `baseData/buffs.ts` | Tipo Buff con campo `effects?: Effect[]` |
| `calculation/calculateCharacterSheet.ts` | Pipeline principal que compila y pasa effects |

---

## Lista de Funciones de Cálculo y su Estado

| Función | Target(s) | Estado |
|---------|-----------|--------|
| `getCalculatedSize` | `size.total` | ✅ Implementado |
| `getCalculatedAbilityScores` | `ability.{x}.score`, `ability.{x}.modifier` | ✅ Implementado |
| `getCalculatedInitiative` | `initiative.total` | ✅ Implementado |
| `getCalculatedBaseAttackBonus` | `bab.total` | ✅ Implementado |
| `getCalculatedHitPoints` | `hp.max`, `hp.temporary` | ✅ Implementado |
| `getCalculatedSavingThrows` | `savingThrow.{x}.total` | ✅ Implementado |
| `getCalculatedArmorClass` | `ac.total`, `ac.touch.total`, `ac.flatFooted.total` | ✅ Implementado |
| `getCalculatedSkills` | `skills.{x}.total` | ✅ Implementado |

---

## Tests

Los tests para el sistema de effects en size están en:
`core/domain/character/calculation/size/calculateSize.test.ts`

Para cada nueva función, crear tests que verifiquen:
1. ✅ Effects se aplican correctamente
2. ✅ Effects stackean según bonusType
3. ✅ Changes y Effects se combinan correctamente
4. ✅ Conditions de Effects funcionan
5. ✅ Source values incluyen información de trazabilidad

