# Guía para Crear Clases en el Sistema de Entidades

Esta guía documenta los patrones y sistemas utilizados para definir clases de personaje como entidades en el sistema de niveles.

---

## Índice

1. [Estructura de Archivos](#estructura-de-archivos)
2. [Anatomía de una Clase](#anatomía-de-una-clase)
3. [Sistema de Providers](#sistema-de-providers)
4. [Sistema de Variables](#sistema-de-variables)
5. [Class Features (Aptitudes de Clase)](#class-features-aptitudes-de-clase)
6. [Addons Disponibles](#addons-disponibles)
7. [Patrones Comunes](#patrones-comunes)
8. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## Estructura de Archivos

Cada clase se organiza en su propia carpeta dentro de `srd/`:

```
srd/
├── fighter/
│   ├── index.ts              # Exportaciones
│   └── fighterClass.ts       # Definición de la clase
├── rogue/
│   ├── index.ts              # Exportaciones
│   ├── rogueClass.ts         # Definición de la clase
│   └── rogueClassFeatures.ts # Aptitudes de clase
└── CLASS_CREATION_GUIDE.md   # Esta guía
```

---

## Anatomía de una Clase

Una clase es una `StandardEntity` con `entityType: 'class'`:

```typescript
import type { StandardEntity } from '../../core/domain/entities/types/base';
import type { EntityProvider } from '../../core/domain/levels/providers/types';

export const myClass: StandardEntity = {
  // Identificación
  id: 'my-class',           // ID único (kebab-case)
  entityType: 'class',      // Siempre 'class'
  name: 'My Class',         // Nombre para UI
  description: '...',       // Descripción completa
  
  // Estadísticas base
  hitDie: 8,                // 4, 6, 8, 10, o 12
  babProgression: 'medium', // 'full', 'medium', o 'poor'
  saves: {
    fortitude: 'good',      // 'good' o 'poor'
    reflex: 'poor',
    will: 'poor',
  },
  skillPointsPerLevel: '4 + @ability.intelligence.modifier',
  classSkillIds: ['climb', 'swim', ...],
  classType: 'base',        // 'base' o 'prestige'
  
  // Progresión de niveles (1-20 para base, 1-10 para prestigio)
  levels: {
    '1': { providers: [...] },
    '2': { providers: [...] },
    // ...
    '20': { providers: [] },
  },
} as StandardEntity;
```

### Progresiones de BAB

| Tipo | Fórmula | Ejemplos |
|------|---------|----------|
| `full` | nivel | Fighter, Paladin, Ranger |
| `medium` | nivel × 3/4 | Rogue, Cleric, Bard |
| `poor` | nivel × 1/2 | Wizard, Sorcerer |

### Progresiones de Salvación

| Tipo | Fórmula Base |
|------|--------------|
| `good` | 2 + nivel/2 |
| `poor` | nivel/3 |

---

## Sistema de Providers

Los **EntityProviders** son el mecanismo para otorgar entidades a los personajes. Cada nivel puede tener múltiples providers.

### Tipos de Providers

#### 1. Granted (Otorgado automáticamente)

```typescript
// Otorgar una aptitud específica por ID
function grantFeature(featureId: string): EntityProvider {
  return {
    granted: {
      specificIds: [featureId],
    },
  };
}

// Otorgar múltiples aptitudes
function grantFeatures(...featureIds: string[]): EntityProvider {
  return {
    granted: {
      specificIds: featureIds,
    },
  };
}

// Otorgar por filtro (todas las entidades que cumplan)
{
  granted: {
    filter: {
      type: 'AND',
      conditions: [
        { field: 'tags', operator: 'contains', value: 'basic' },
      ],
    },
  },
}
```

#### 2. Selector (Elección del usuario)

```typescript
// Selección de una dote de un pool
function createFeatSelector(level: number, poolTag: string): EntityProvider {
  return {
    selector: {
      id: `bonus-feat-${level}`,         // ID único del selector
      name: `Bonus Feat (Level ${level})`, // Nombre para UI
      entityType: 'feat',                 // Tipo de entidad a seleccionar
      filter: {                           // Filtro opcional
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'tags', operator: 'contains', value: poolTag },
        ],
      },
      min: 1,                             // Mínimo de selecciones
      max: 1,                             // Máximo de selecciones
    },
  };
}
```

#### 3. Combinado (Granted + Selector)

Un provider puede tener ambos:

```typescript
{
  granted: { specificIds: ['base-feature'] },
  selector: { 
    id: 'upgrade-selection',
    entityType: 'classFeature',
    min: 0, max: 1,
  },
}
```

### Estructura de Niveles

```typescript
levels: {
  '1': { 
    providers: [
      grantFeatures('ability-a', 'ability-b'),
    ],
  },
  '2': { 
    providers: [
      grantFeature('ability-c'),
    ],
  },
  '3': { 
    providers: [], // Nivel sin aptitudes nuevas
  },
  '4': { 
    providers: [
      createTalentSelector(4), // Selección de talento
    ],
  },
}
```

---

## Sistema de Variables

### Filosofía

Las **variables** permiten que las aptitudes escalen dinámicamente y sean **expandibles** por otras fuentes (clases de prestigio, dotes, objetos).

En lugar de crear múltiples entidades granulares (sneak-attack-1d6, sneak-attack-2d6, etc.), usamos **una entidad** que define variables calculadas.

### Variables del Sistema Disponibles

El sistema proporciona múltiples variables que pueden usarse en fórmulas. Todas se referencian con el prefijo `@`:

#### Nivel de Personaje y Clases

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `@level` | Nivel total del personaje | `@level` → 5 |
| `@class.{classId}.level` | Nivel en una clase específica | `@class.rogue.level` → 3 |
| `@casterLevel` | Nivel de lanzador | `@casterLevel` → 4 |

#### Características (Ability Scores)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `@ability.strength.score` | Puntuación de Fuerza | `@ability.strength.score` → 16 |
| `@ability.strength.modifier` | Modificador de Fuerza | `@ability.strength.modifier` → 3 |
| `@ability.dexterity.score` | Puntuación de Destreza | `@ability.dexterity.score` → 14 |
| `@ability.dexterity.modifier` | Modificador de Destreza | `@ability.dexterity.modifier` → 2 |
| `@ability.constitution.score` | Puntuación de Constitución | `@ability.constitution.score` → 12 |
| `@ability.constitution.modifier` | Modificador de Constitución | `@ability.constitution.modifier` → 1 |
| `@ability.intelligence.score` | Puntuación de Inteligencia | `@ability.intelligence.score` → 10 |
| `@ability.intelligence.modifier` | Modificador de Inteligencia | `@ability.intelligence.modifier` → 0 |
| `@ability.wisdom.score` | Puntuación de Sabiduría | `@ability.wisdom.score` → 14 |
| `@ability.wisdom.modifier` | Modificador de Sabiduría | `@ability.wisdom.modifier` → 2 |
| `@ability.charisma.score` | Puntuación de Carisma | `@ability.charisma.score` → 8 |
| `@ability.charisma.modifier` | Modificador de Carisma | `@ability.charisma.modifier` → -1 |

#### Combate (BAB, AC, etc.)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `@bab.base` | Base Attack Bonus base | `@bab.base` → 3 |
| `@bab.total` | Base Attack Bonus total | `@bab.total` → 4 |
| `@ac.total` | Clase de Armadura total | `@ac.total` → 18 |
| `@ac.touch.total` | CA de toque | `@ac.touch.total` → 12 |
| `@ac.flatFooted.total` | CA con pies planos | `@ac.flatFooted.total` → 16 |
| `@ac.natural.total` | Armadura natural total | `@ac.natural.total` → 2 |
| `@initiative.total` | Iniciativa total | `@initiative.total` → 4 |

#### Salvaciones (Saving Throws)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `@savingThrow.fort.base` | Fortaleza base | `@savingThrow.fort.base` → 2 |
| `@savingThrow.fort.total` | Fortaleza total | `@savingThrow.fort.total` → 5 |
| `@savingThrow.ref.base` | Reflejos base | `@savingThrow.ref.base` → 3 |
| `@savingThrow.ref.total` | Reflejos total | `@savingThrow.ref.total` → 5 |
| `@savingThrow.will.base` | Voluntad base | `@savingThrow.will.base` → 1 |
| `@savingThrow.will.total` | Voluntad total | `@savingThrow.will.total` → 3 |

#### Puntos de Golpe y Dados de Golpe

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `@hp.max` | Puntos de golpe máximos | `@hp.max` → 32 |
| `@hp.current` | Puntos de golpe actuales | `@hp.current` → 28 |
| `@hp.damage` | Daño actual | `@hp.damage` → 4 |
| `@hp.temporary` | PG temporales | `@hp.temporary` → 5 |
| `@hd.base` | Dados de golpe base | `@hd.base` → 5 |
| `@hd.total` | Dados de golpe total | `@hd.total` → 5 |

#### Tamaño

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `@size.base` | Tamaño base (0=Medium) | `@size.base` → 0 |
| `@size.total` | Tamaño total | `@size.total` → 0 |
| `@size.modifier` | Modificador de tamaño | `@size.modifier` → 0 |

#### Velocidad

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `@speed.base` | Velocidad base | `@speed.base` → 30 |
| `@speed.total` | Velocidad total | `@speed.total` → 30 |
| `@speed.fly.total` | Velocidad de vuelo | `@speed.fly.total` → 0 |
| `@speed.swim.total` | Velocidad de nado | `@speed.swim.total` → 0 |
| `@speed.burrow.total` | Velocidad de excavar | `@speed.burrow.total` → 0 |

#### Habilidades (Skills)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `@skills.{skillId}.total` | Total de la habilidad | `@skills.hide.total` → 8 |
| `@skills.{skillId}.ranks` | Rangos en la habilidad | `@skills.hide.ranks` → 5 |

Ejemplos de skillIds: `hide`, `moveSilently`, `tumble`, `bluff`, `diplomacy`, `senseMotive`, `spot`, `listen`, `search`, `disableDevice`, `openLock`, `sleightOfHand`, `useMagicDevice`, etc.

#### Variables Personalizadas (Custom Variables)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `@customVariable.{variableId}` | Variable personalizada | `@customVariable.sneakAttackDiceAmount` → 3 |

Las custom variables son definidas por entidades usando `CUSTOM_VARIABLE_DEFINITION` (ver sección siguiente).

### Definición de Variables

Las variables se definen mediante `CUSTOM_VARIABLE_DEFINITION` en `legacy_specialChanges`:

```typescript
import type { CustomVariableDefinitionChange } from '../../core/domain/character/baseData/specialChanges';

const sneakAttack: StandardEntity = {
  id: 'rogue-sneak-attack',
  entityType: 'classFeature',
  name: 'Sneak Attack',
  
  legacy_specialChanges: [
    {
      type: 'CUSTOM_VARIABLE_DEFINITION',
      variableId: 'sneakAttackDiceAmount',
      name: 'Sneak Attack Dice Amount',
      description: 'Number of dice for sneak attack damage',
      baseSources: [
        {
          type: 'CUSTOM_VARIABLE',
          uniqueId: 'sneakAttackDiceAmount',
          bonusTypeId: 'BASE',
          formula: { expression: 'ceil(@class.rogue.level / 2)' },
          name: 'Rogue Sneak Attack Progression',
          createVariableForSource: true,
        },
      ],
    } as CustomVariableDefinitionChange,
    {
      type: 'CUSTOM_VARIABLE_DEFINITION',
      variableId: 'sneakAttackDiceType',
      name: 'Sneak Attack Dice Type',
      description: 'Type of die for sneak attack damage',
      baseSources: [
        {
          type: 'CUSTOM_VARIABLE',
          uniqueId: 'sneakAttackDiceType',
          bonusTypeId: 'BASE',
          formula: { expression: '6' }, // d6 por defecto
          name: 'Sneak Attack Dice Type Base',
          createVariableForSource: true,
        },
      ],
    } as CustomVariableDefinitionChange,
  ],
};
```

### Uso de Variables en Fórmulas

Las variables definidas pueden usarse en fórmulas de daño o efectos:

```
(@customVariable.sneakAttackDiceAmount)d(@customVariable.sneakAttackDiceType)
```

Esto produce: `1d6` → `2d6` → ... → `10d6` según el nivel.

### Expansión por Otras Clases

Una clase de prestigio puede **sumar** a variables existentes usando `CUSTOM_VARIABLE` changes (no `CUSTOM_VARIABLE_DEFINITION`):

```typescript
// Clase de prestigio Asesino añade a la variable existente
legacy_specialChanges: [
  {
    type: 'CUSTOM_VARIABLE_DEFINITION',
    variableId: 'sneakAttackDiceAmount',
    name: 'Assassin Sneak Attack',
    baseSources: [
      {
        type: 'CUSTOM_VARIABLE',
        uniqueId: 'sneakAttackDiceAmount',
        bonusTypeId: 'BASE', // BASE stacks with itself
        formula: { expression: 'ceil(@class.assassin.level / 2)' },
        name: 'Assassin Sneak Attack Progression',
        createVariableForSource: true,
      },
    ],
  } as CustomVariableDefinitionChange,
],
```

Los valores de múltiples fuentes con `bonusTypeId: 'BASE'` se **acumulan** automáticamente.

### Variables Personalizadas Comunes

| Variable | Clase | Uso | Ejemplo de Fórmula |
|----------|-------|-----|-------------------|
| `sneakAttackDiceAmount` | Rogue | Dados de ataque furtivo | `ceil(@class.rogue.level / 2)` |
| `sneakAttackDiceType` | Rogue | Tipo de dado (d6, d8) | `6` (valor fijo) |
| `trapSenseBonus` | Rogue | Bonus vs trampas | `floor((@class.rogue.level + 1) / 3)` |
| `kiPool` | Monk | Puntos de ki | `floor(@class.monk.level / 2) + @ability.wisdom.modifier` |
| `smiteDamage` | Paladin | Daño de smite | `@class.paladin.level` |
| `layOnHandsPool` | Paladin | Pool de imposición de manos | `@class.paladin.level * @ability.charisma.modifier` |
| `rageRounds` | Barbarian | Rondas de ira | `3 + @ability.constitution.modifier` |

### Patrones de Fórmulas Comunes

#### Escalado cada X niveles

```typescript
// +1 cada 2 niveles (1 en L1, 2 en L3, 3 en L5...)
formula: { expression: 'ceil(@class.rogue.level / 2)' }

// +1 cada 3 niveles empezando en L3 (0 en L1-2, 1 en L3-5, 2 en L6-8...)
formula: { expression: 'floor((@class.rogue.level) / 3)' }

// +1 cada 3 niveles empezando en L3 (forma alternativa)
formula: { expression: 'floor((@class.rogue.level + 1) / 3)' }

// +1 cada 4 niveles
formula: { expression: 'floor(@class.fighter.level / 4)' }
```

#### Combinando nivel con características

```typescript
// Nivel + modificador de característica
formula: { expression: '@class.paladin.level + @ability.charisma.modifier' }

// Mitad del nivel + modificador
formula: { expression: 'floor(@class.monk.level / 2) + @ability.wisdom.modifier' }

// Nivel * modificador (para pools)
formula: { expression: '@class.paladin.level * max(1, @ability.charisma.modifier)' }
```

#### Mínimos y máximos

```typescript
// Mínimo de 1
formula: { expression: 'max(1, @ability.charisma.modifier)' }

// Máximo del nivel
formula: { expression: 'min(@class.fighter.level, 5)' }

// Entre 1 y nivel
formula: { expression: 'max(1, min(@class.rogue.level, @ability.dexterity.modifier))' }
```

#### Usando otras variables del sistema

```typescript
// Basado en BAB
formula: { expression: 'floor(@bab.total / 4)' }

// Basado en dados de golpe
formula: { expression: '@hd.total' }

// Basado en nivel total (multiclase)
formula: { expression: '@level' }

// Basado en habilidad
formula: { expression: 'floor(@skills.tumble.ranks / 5)' }
```

#### Fórmulas de daño con dados

```typescript
// Dados simples usando custom variables
formula: { expression: '(@customVariable.sneakAttackDiceAmount)d(@customVariable.sneakAttackDiceType)' }

// Dados fijos + modificador
formula: { expression: '2d6 + @ability.strength.modifier' }

// Dados escalables
formula: { expression: '(@customVariable.flamingBurstDice)d6' }
```

---

## Class Features (Aptitudes de Clase)

Las aptitudes de clase son `StandardEntity` con `entityType: 'classFeature'`.

### Estructura Básica

```typescript
const myFeature: StandardEntity = {
  id: 'class-feature-name',
  entityType: 'classFeature',
  name: 'Feature Name',
  description: '...',
  tags: ['classAbility', 'defensive'],
  
  // Opcional: special changes (para definir variables, proficiencias, etc.)
  legacy_specialChanges: [...],
  
  // Opcional: efectos numéricos directos
  effects: [...],
  
  // Opcional: cambios contextuales (bonuses situacionales)
  legacy_contextualChanges: [...],
  
  // Opcional: supresión de otras features
  suppression: [...],
  
  // Opcional: providers anidados (para selecciones)
  providers: [...],
};
```

### Tipos de Features

#### 1. Feature Cualitativa (sin efectos numéricos)

```typescript
const trapfinding: StandardEntity = {
  id: 'rogue-trapfinding',
  entityType: 'classFeature',
  name: 'Trapfinding',
  description: 'Allows finding traps with DC > 20...',
  tags: ['rogueAbility', 'skill', 'traps'],
};
```

#### 2. Feature con Variables

```typescript
const sneakAttack: StandardEntity = {
  id: 'rogue-sneak-attack',
  entityType: 'classFeature',
  name: 'Sneak Attack',
  legacy_specialChanges: [
    {
      type: 'CUSTOM_VARIABLE_DEFINITION',
      variableId: 'sneakAttackDiceAmount',
      name: 'Sneak Attack Dice',
      baseSources: [{
        type: 'CUSTOM_VARIABLE',
        uniqueId: 'sneakAttackDiceAmount',
        bonusTypeId: 'BASE',
        formula: { expression: 'ceil(@class.rogue.level / 2)' },
        name: 'Rogue Sneak Attack',
        createVariableForSource: true,
      }],
    } as CustomVariableDefinitionChange,
  ],
};
```

#### 3. Feature con Efectos

```typescript
import { effectTargets } from '../../core/domain/character/baseData/effects';

const trapSense: StandardEntity = {
  id: 'rogue-trap-sense',
  entityType: 'classFeature',
  name: 'Trap Sense',
  effects: [
    {
      target: effectTargets.SAVING_THROW_TOTAL('reflex'),
      formula: '@customVariable.trapSenseBonus',
      bonusType: 'UNTYPED',
      // conditions: [...] // Opcional: solo vs trampas
    },
  ],
};
```

#### 4. Feature con Supresión

```typescript
const improvedUncannyDodge: StandardEntity = {
  id: 'rogue-improved-uncanny-dodge',
  entityType: 'classFeature',
  name: 'Improved Uncanny Dodge',
  suppression: [
    { 
      scope: 'applied',  // 'applied' | 'selectable' | 'all'
      ids: ['rogue-uncanny-dodge'],
      reason: 'Replaces Uncanny Dodge', // opcional, para UI
    },
  ],
};
```

**Opciones de `scope`:**
- `'applied'`: Suprime solo entidades ya aplicadas al personaje
- `'selectable'`: Suprime entidades de las opciones de selección
- `'all'`: Suprime en ambos contextos

#### 5. Feature con Providers (Selecciones)

```typescript
const skillMastery: StandardEntity = {
  id: 'rogue-skill-mastery',
  entityType: 'classFeature',
  name: 'Skill Mastery',
  providers: [
    {
      selector: {
        id: 'skill-mastery-skills',
        name: 'Skill Mastery Skills',
        entityType: 'skill',
        min: 3,
        max: 10,
      },
    },
  ],
};
```

---

## Addons Disponibles

Los **addons** son módulos que añaden campos opcionales a las entidades.

| Addon | Campos | Uso |
|-------|--------|-----|
| `searchable` | `name`, `description?` | UI de búsqueda |
| `taggable` | `tags?` | Categorización y filtrado |
| `effectful` | `effects?`, `specialEffects?` | Modificaciones numéricas |
| `suppressing` | `suppression?` | Suprimir otras entidades |
| `providable` | `providers?` | Otorgar/seleccionar entidades |
| `imageable` | `image?` | Imagen asociada |

### Uso en Schemas

```typescript
const classFeatureSchema: EntitySchemaDefinition = {
  typeName: 'classFeature',
  addons: ['searchable', 'effectful', 'suppressing', 'providable'],
  fields: [...],
};
```

---

## Patrones Comunes

### Patrón: Habilidad Escalable

Para habilidades que mejoran con el nivel:

```typescript
// 1. Una sola entidad que define la variable
const scalingAbility = {
  id: 'class-scaling-ability',
  legacy_specialChanges: [
    {
      type: 'CUSTOM_VARIABLE_DEFINITION',
      variableId: 'abilityBonus',
      name: 'Ability Bonus',
      baseSources: [{
        type: 'CUSTOM_VARIABLE',
        uniqueId: 'abilityBonus',
        bonusTypeId: 'BASE',
        formula: { expression: '@class.myclass.level' },
        name: 'Class Ability Bonus',
        createVariableForSource: true,
      }],
    } as CustomVariableDefinitionChange,
  ],
};

// 2. Efectos que usan la variable (con prefijo @customVariable.)
effects: [
  { target: 'combat.attackBonus', formula: '@customVariable.abilityBonus' },
],
```

### Patrón: Mejora que Reemplaza

Para habilidades que mejoran (Evasion → Improved Evasion):

```typescript
const improvedVersion = {
  id: 'improved-feature',
  suppression: [{ 
    scope: 'applied', 
    ids: ['base-feature'] 
  }],
  // Los efectos de la versión mejorada incluyen todo lo de la base + más
};
```

### Patrón: Selección de Pool

Para selecciones de un grupo filtrado:

```typescript
function createPoolSelector(level: number, poolTag: string): EntityProvider {
  return {
    selector: {
      id: `pool-selection-${level}`,
      name: `Selection (Level ${level})`,
      entityType: 'classFeature',
      filter: {
        type: 'AND',
        filterPolicy: 'strict',
        conditions: [
          { field: 'tags', operator: 'contains', value: poolTag },
        ],
      },
      min: 1,
      max: 1,
    },
  };
}
```

### Patrón: Dote Bonus

Para clases que otorgan dotes adicionales:

```typescript
function createBonusFeatProvider(level: number, featTag?: string): EntityProvider {
  const provider: EntityProvider = {
    selector: {
      id: `bonus-feat-${level}`,
      name: `Bonus Feat (Level ${level})`,
      entityType: 'feat',
      min: 1,
      max: 1,
    },
  };
  
  // Si hay un tag específico, filtrar
  if (featTag) {
    provider.selector!.filter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'tags', operator: 'contains', value: featTag },
      ],
    };
  }
  
  return provider;
}
```

---

## Ejemplos Prácticos

### Fighter (Clase Marcial Simple)

```typescript
// Otorga dotes de combate en niveles pares
levels: {
  '1': { providers: [createBonusFeatProvider(1, 'fighterBonusFeat')] },
  '2': { providers: [createBonusFeatProvider(2, 'fighterBonusFeat')] },
  '3': { providers: [] },
  '4': { providers: [createBonusFeatProvider(4, 'fighterBonusFeat')] },
  // ...
}
```

### Rogue (Clase con Habilidades Escalables)

```typescript
// Una entidad por habilidad escalable
levels: {
  '1': { providers: [grantFeatures('sneak-attack', 'trapfinding')] },
  '2': { providers: [grantFeature('evasion')] },
  '3': { providers: [grantFeature('trap-sense')] },
  // Sneak Attack y Trap Sense escalan automáticamente via variables
}
```

### Wizard (Clase con Lanzamiento de Conjuros)

```typescript
// Los conjuros se manejan por un sistema separado (spellCasting)
// Pero las aptitudes de clase siguen el mismo patrón
levels: {
  '1': { providers: [grantFeatures('arcane-bond', 'scribe-scroll')] },
  '5': { providers: [grantFeature('bonus-feat')] },
  '10': { providers: [grantFeature('bonus-feat')] },
}
```

---

## Checklist para Crear una Clase

1. [ ] Crear carpeta en `srd/nombre-clase/`
2. [ ] Crear `nombreClass.ts` con la definición de la clase
3. [ ] Definir estadísticas base (hitDie, BAB, saves, skills)
4. [ ] Crear helpers para providers (`grantFeature`, `createSelector`)
5. [ ] Definir estructura de niveles con providers
6. [ ] Crear `nombreClassFeatures.ts` con las aptitudes
7. [ ] Usar variables para habilidades escalables
8. [ ] Implementar supresión para mejoras que reemplazan
9. [ ] Crear `index.ts` con exportaciones
10. [ ] Verificar lints (`read_lints`)
11. [ ] Añadir la clase al compendium correspondiente

---

## Referencias

- Sistema de Providers: `core/domain/levels/providers/types.ts`
- Sistema de Variables: `core/domain/character/baseData/changes.ts` (CustomVariableChange)
- Sistema de Effects: `core/domain/character/baseData/effects.ts`
- Addons: `core/domain/levels/entities/defaultAddons.ts`
- Ejemplo Fighter: `srd/fighter/fighterClass.ts`
- Ejemplo Rogue: `srd/rogue/rogueClass.ts`

