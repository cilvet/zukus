# Investigación: Interoperabilidad Effects ↔ ContextualChanges (Ataques)

## 📋 Resumen Ejecutivo

Este documento analiza la viabilidad de implementar `SituationalEffectGroup` como reemplazo de `AttackContextualChange`, enfocándose en el contexto de ataque y sus complejidades únicas.

**Estado actual**: Solo `ContextualChange` (sistema viejo con Changes) está implementado.
**Objetivo**: Diseñar interoperabilidad con el nuevo sistema de Effects.

---

## 🔍 Análisis del Sistema Actual (ContextualChange)

### Estructura Completa

```typescript
// BaseTypes
type ContextualVariable = {
  name: string;
  identifier: string;  // Para referencias en fórmulas
  min: number;
  max: number;
}

type ResolvedContextualVariable = ContextualVariable & {
  value: number;  // Valor seleccionado por el usuario
}

// AttackContextualChange
type AttackContextualChange = {
  type: 'attack';
  name: string;
  appliesTo: 'melee' | 'ranged' | 'all';
  available: boolean;    // Prerequisites cumplidos
  optional: boolean;     // Se puede activar/desactivar
  variables: ContextualVariable[];
  changes: ContextualizedChange<AttackChange>[];  // ⚠️ Array de Changes
}

type ResolvedAttackContextualChange = {
  type: 'attack';
  name: string;
  appliesTo: 'melee' | 'ranged' | 'all';
  variables: ResolvedContextualVariable[];  // Con valores resueltos
  changes: ContextualizedChange<AttackChange>[];
}
```

### AttackChange Types (todos los tipos soportados)

```typescript
type AttackChange =
  | AttackRollChange         // type: 'ATTACK_ROLLS' - Bonos al ataque
  | BaseAttackBonusChange    // type: 'BAB' - Modificar BAB
  | DamageChange             // type: 'DAMAGE' - Daño adicional
  | CriticalRangeChange      // type: 'CRITICAL_RANGE' - Modificar rango crítico
  | CriticalMultiplierChange // type: 'CRITICAL_MULTIPLIER' - Modificar multiplicador
  | CriticalConfirmationChange // type: 'CRITICAL_CONFIRMATION' - Bonus a confirmación
  | DamageTypeChange         // type: 'DAMAGE_TYPE' - Cambiar tipo de daño
```

### Ubicaciones de ContextualChanges en el Sistema

```typescript
// 1. En Buffs
type Buff = {
  // ... otros campos
  contextChanges?: AttackContextualChange[];
}

// 2. En Weapons
type BaseWeapon = {
  // ... otros campos
  wieldedContextChanges?: AttackContextualChange[];
  weaponOnlyContextualChanges?: AttackContextualChange[];
}

// 3. En WeaponEnhancements (ej: Magebane)
type ItemEnhancement = {
  // ... otros campos
  wieldedContextChanges?: AttackContextualChange[];
  weaponOnlyContextualChanges?: AttackContextualChange[];
}

// 4. Hardcoded defaults (flanking, charging, etc.)
const allDefaultAttackContextChanges: AttackContextualChange[] = [
  flanking, charging, highGround, defensiveFighting, prone
];
```

### Flujo de Aplicación (Actual)

```
1. getCalculatedAttackData()
   ↓
2. getAttackFromWeapon() - por cada arma equipada
   ↓
3. getWeaponAttackContext() - recopila todos los contextual changes
   │  ├─ Defaults (flanking, charging, etc.)
   │  ├─ Weapon.weaponOnlyContextualChanges
   │  ├─ Enhancements[].weaponOnlyContextualChanges
   │  └─ attackContextChanges pasados (de buffs, etc.)
   ↓
4. Filtrar por appliesTo y disponibilidad
   │  - Solo mandatory sin variables se aplican automáticamente
   │  - Opcionales se guardan para que UI permita activar
   ↓
5. ResolvedAttackContext
   │  - appliedContextualChanges: ResolvedAttackContextualChange[]
   │  - appliedChanges: ContextualizedChange<AttackChange>[]
   ↓
6. calculateAttackBonus()
   │  └─ getContextualAttackBonusSources()
   │     └─ context.appliedContextualChanges.flatMap(c => c.changes)
   │        └─ .filter(filterAttackChanges)  // Solo ATTACK_ROLLS
   │        └─ .map(calculateSource)
   ↓
7. getAttackDamageFormula()
   │  └─ getExtraDamageSections()
   │     └─ context.appliedContextualChanges.flatMap(c => c.changes)
   │        └─ .filter(filterDamageChanges)  // Solo DAMAGE
   │        └─ .map(getDamageSectionFromChange)
```

---

## 🎯 Sistema Propuesto (SituationalEffectGroup)

### Estructura Diseñada

```typescript
// En effects.ts (ya definido)
type ManualEffectVariable = {
  id: string;              // "@powerAttackPoints"
  name: string;            // "Power Attack Points"
  min: EffectFormula;      // Puede ser dinámico: "1" o "@bab"
  max: EffectFormula;      // Puede ser dinámico: "@bab"
  default?: EffectFormula;
}

type ResolvedManualEffectVariable = {
  id: string;
  name: string;
  min: number;             // Calculado
  max: number;             // Calculado
  default: number;         // Calculado
  currentValue: number;    // Seleccionado por usuario
}

type SituationalEffectGroup = {
  id: string;
  name: string;
  description?: string;
  context: SituationalContext;  // 'attack', 'skill', 'save', etc.
  appliesTo?: string;           // 'melee' | 'ranged' | 'all' para ataques
  effects: Effect[];            // ⚠️ Array de Effects (no Changes)
  variables?: ManualEffectVariable[];
  optional: boolean;
  availabilityConditions?: Condition[];
}

type ResolvedSituationalEffectGroup = Omit<SituationalEffectGroup, 'variables'> & {
  variables?: ResolvedManualEffectVariable[];
}
```

---

## 🔄 Comparación Lado a Lado

| Aspecto | ContextualChange (Viejo) | SituationalEffectGroup (Nuevo) |
|---------|-------------------------|--------------------------------|
| **Modificaciones** | Array de `Change[]` (17+ tipos) | Array de `Effect[]` (target-based) |
| **Variables** | `ContextualVariable` (min/max numéricos) | `ManualEffectVariable` (min/max con fórmulas) |
| **Contexto** | `type: 'attack' \| 'skill'` | `context: string` (extensible) |
| **Aplicabilidad** | `appliesTo: 'melee' \| 'ranged' \| 'all'` | `appliesTo?: string` (libre) |
| **Disponibilidad** | `available: boolean` | `availabilityConditions?: Condition[]` |
| **Resolución vars** | Manual en cada lugar | Calcular fórmulas min/max |
| **BonusType** | Enum `BonusTypes` | String libre |
| **Origen** | `originType` + `originId` en cada Change | `sourceRef` en SourcedEffect |

---

## ⚠️ PUNTOS DE DOLOR IDENTIFICADOS

### 1. 🔥 **CRÍTICO: Daño No es un Stat Tradicional**

El sistema de Effects está diseñado para stats del character sheet:
- `size.total`
- `ability.strength.score`
- `bab.total`

**Pero el daño es diferente:**
- No es un valor único en el character sheet
- Es una **fórmula compleja** construida durante cálculo de ataque
- Depende del contexto del arma específica
- Tiene múltiples secciones (base, adicional, modificadores)

```typescript
type DamageFormula = ComplexDamageSection | SimpleDamageSectionWithType;

type ComplexDamageSection = {
  type: "complex";
  baseDamage: DamageFormula;
  additionalDamageSections: DamageSection[];  // ⚠️ Array dinámico
  damageModifications?: ComplexDamageModification[];
}

type SimpleDamageSection = {
  type: "simple";
  formula: Formula;
  damageType?: DamageType;
  damageModifications?: DamageModification[];
}
```

**El problema:**
Effects funciona con targets como `"bab.total"` que apuntan a valores en el index.
Daño no tiene un target único - se construye dinámicamente por arma.

**Posibles soluciones:**

#### Opción A: Target especial `attack.damage` (⚠️ Complicado)
```typescript
const powerAttackEffect: Effect = {
  target: "attack.damage",  // ⚠️ No existe en valueIndexKeys
  formula: "@powerAttackPoints * 2",
  bonusType: "UNTYPED",
}
```

**Problemas:**
- No hay un lugar en el index para guardarlo
- Se aplicaría a TODOS los ataques (no específico por arma)
- Perdemos información de damageType

#### Opción B: Mantener DamageChange tal cual (✅ RECOMENDADO)
```typescript
type AttackSituationalEffect = {
  context: 'attack';
  appliesTo: 'melee' | 'ranged' | 'all';
  
  // Sistema mixto:
  effects: Effect[];           // Para ATTACK_ROLLS, BAB, etc.
  damageChanges: DamageChange[];  // Mantener sistema viejo para daño
  
  variables?: ManualEffectVariable[];
}
```

#### Opción C: Effect con metadata especial
```typescript
type AttackDamageEffect = Effect & {
  target: "attack.damage";
  damageType?: DamageType;
  damageModifications?: DamageModification[];
}
```

### 2. 🔥 **Variables con Fórmulas Dinámicas**

El sistema viejo tiene `min/max` numéricos fijos.
El nuevo permite fórmulas:

```typescript
// Viejo
variables: [{
  identifier: 'powerAttackPoints',
  min: 1,
  max: 5  // Fijo
}]

// Nuevo
variables: [{
  id: 'powerAttackPoints',
  min: { expression: "1" },
  max: { expression: "@bab" }  // ⚠️ Dinámico, requiere cálculo
}]
```

**Complejidad:**
1. Calcular min/max antes de mostrar slider en UI
2. Min/max pueden cambiar durante el turno (buffs temporales)
3. Requiere acceso al substitution index

**Solución:**
Función `resolveManualEffectVariable`:
```typescript
function resolveManualEffectVariable(
  variable: ManualEffectVariable,
  substitutionIndex: SubstitutionIndex
): ResolvedManualEffectVariable {
  const min = evaluateFormula(normalizeFormula(variable.min), substitutionIndex);
  const max = evaluateFormula(normalizeFormula(variable.max), substitutionIndex);
  const defaultValue = variable.default 
    ? evaluateFormula(normalizeFormula(variable.default), substitutionIndex)
    : min;
    
  return {
    id: variable.id,
    name: variable.name,
    min,
    max,
    default: defaultValue,
    currentValue: defaultValue  // O valor guardado previamente
  };
}
```

### 3. 🟡 **Filtrado por attackType**

Algunos changes se aplican solo a ciertos tipos de ataque:

```typescript
{
  type: 'ATTACK_ROLLS',
  attackType: 'melee',  // ⚠️ Filtrado adicional
  formula: { expression: "2" }
}
```

Con Effects:
```typescript
{
  target: "attack.rolls",
  formula: "2",
  // ❓ ¿Cómo especificar que solo aplica a melee?
}
```

**Soluciones:**

#### Opción A: Conditions
```typescript
{
  target: "attack.rolls",
  formula: "2",
  conditions: [{
    type: 'simple',
    firstFormula: { expression: "@attack.type" },
    operator: "==",
    secondFormula: { expression: "'melee'" }
  }]
}
```

#### Opción B: Metadata en Effect (✅ MEJOR)
```typescript
type AttackEffect = Effect & {
  attackType?: 'melee' | 'ranged' | 'all';
}
```

### 4. 🟡 **Múltiples Orígenes de ContextualChanges**

Actualmente vienen de:
- Buffs
- Weapons
- Enhancements
- Defaults hardcoded

Con Effects:
```typescript
// ¿Cómo compilar SituationalEffectGroups?
function compileSituationalEffects(
  baseData: CharacterBaseData
): CompiledSituationalEffects {
  const situationalGroups = [
    ...compileBuffSituationalEffects(baseData.buffs),
    ...compileWeaponSituationalEffects(baseData.equipment),
    ...compileEnhancementSituationalEffects(...),
    ...getDefaultAttackSituationalGroups()
  ];
  
  return {
    all: situationalGroups,
    byContext: groupByContext(situationalGroups)
  };
}
```

### 5. 🟡 **Weapon-Specific vs Character-Wide**

ContextualChanges de armas solo aplican a ESA arma.
Effects en el character sheet son globales.

**Problema:**
```typescript
// Magebane solo debería aplicar a ataques con ESE arco específico
const mageBane: AttackContextualChange = {
  name: "Mage bane",
  changes: [
    { type: 'DAMAGE', formula: "2d6" },
    { type: 'ATTACK_ROLLS', formula: "2" }
  ]
}
```

Con Effects globales, se aplicarían a TODAS las armas.

**Solución:**
```typescript
type WeaponSituationalEffect = SituationalEffectGroup & {
  weaponUniqueId: string;  // ⚠️ Filtrar por arma
}

// Durante aplicación:
function getWeaponSituationalEffects(
  weapon: Weapon,
  allSituationalEffects: SituationalEffectGroup[]
): SituationalEffectGroup[] {
  return allSituationalEffects.filter(effect => {
    if ('weaponUniqueId' in effect) {
      return effect.weaponUniqueId === weapon.uniqueId;
    }
    return true;  // Effects globales aplican a todas
  });
}
```

### 6. 🟢 **Sustitución de Variables (Resuelto)**

Ya existe `getVariablesSubstitutionExpression` y `getVariablesSubstitutionIndex`.
Solo necesita adaptarse para `ResolvedManualEffectVariable`:

```typescript
export const getManualVariablesSubstitutionIndex = (
  variables: ResolvedManualEffectVariable[]
): SubstitutionIndex => {
  const substitutionIndex: SubstitutionIndex = {};
  
  variables.forEach((variable) => {
    substitutionIndex[variable.id] = variable.currentValue;
  });
  
  return substitutionIndex;
};
```

---

## 📊 Matriz de Complejidad por Tipo de Efecto

| Tipo de Efecto | Target en Effects | Complejidad | Notas |
|----------------|-------------------|-------------|-------|
| **ATTACK_ROLLS** | `"attack.rolls"` o similar | 🟡 Media | Necesita filtrado por attackType |
| **BAB** | `"bab.total"` | 🟢 Baja | Ya funciona con Effects |
| **DAMAGE** | ❓ No existe | 🔴 Alta | Requiere diseño especial |
| **CRITICAL_RANGE** | `"attack.criticalRange"` | 🟡 Media | Nuevo target en index |
| **CRITICAL_MULTIPLIER** | `"attack.criticalMultiplier"` | 🟡 Media | Nuevo target en index |
| **CRITICAL_CONFIRMATION** | `"attack.criticalConfirmation"` | 🟡 Media | Nuevo target en index |
| **DAMAGE_TYPE** | N/A | 🔴 Alta | No es numérico, es enum |

---

## 🎯 RECOMENDACIONES

### Enfoque Híbrido (✅ RECOMENDADO)

Crear un sistema que combine lo mejor de ambos:

```typescript
type AttackSituationalEffectGroup = {
  id: string;
  name: string;
  description?: string;
  context: 'attack';
  appliesTo: 'melee' | 'ranged' | 'all';
  
  // Sistema nuevo para stats tradicionales
  effects: AttackEffect[];  // ATTACK_ROLLS, BAB, etc.
  
  // Sistema viejo para daño (más complejo)
  damageChanges?: DamageChange[];
  
  // Variables mejoradas
  variables?: ManualEffectVariable[];
  
  // Disponibilidad
  optional: boolean;
  availabilityConditions?: Condition[];
  
  // Origen (para filtrado por arma)
  weaponUniqueId?: string;
}

type AttackEffect = Effect & {
  attackType?: 'melee' | 'ranged' | 'all';
}
```

### Migración Gradual

**Fase 1: ATTACK_ROLLS** (Más simple)
```typescript
// Viejo
{ type: 'ATTACK_ROLLS', formula: "2", attackType: 'melee' }

// Nuevo
{ target: "attack.rolls", formula: "2", attackType: 'melee' }
```

**Fase 2: BAB** (Ya funciona)
```typescript
// Viejo
{ type: 'BAB', formula: "@level" }

// Nuevo
{ target: "bab.total", formula: "@level" }
```

**Fase 3: DAMAGE** (Último, más complejo)
Mantener `DamageChange` hasta encontrar mejor solución.

### API Propuesta

```typescript
// En calculateAttackData
export const getCalculatedAttackData = function (
  character: CharacterSheet,
  attackChanges: ContextualizedChange<AttackChange>[],
  attackContextChanges: ContextualChange[],  // Deprecar gradualmente
  situationalEffects: CompiledSituationalEffects,  // ← NUEVO
  substitutionValues: Record<string, number>
) {
  // Combinar ambos sistemas durante transición
}

// Nueva función helper
function applySituationalEffectsToAttack(
  weapon: Weapon,
  character: CharacterSheet,
  situationalEffects: SituationalEffectGroup[],
  substitutionIndex: SubstitutionIndex
): CalculatedAttack {
  // 1. Resolver variables
  const resolvedGroups = situationalEffects.map(group => ({
    ...group,
    variables: group.variables?.map(v => 
      resolveManualEffectVariable(v, substitutionIndex)
    )
  }));
  
  // 2. Filtrar por weaponUniqueId
  const applicableGroups = resolvedGroups.filter(g =>
    !g.weaponUniqueId || g.weaponUniqueId === weapon.uniqueId
  );
  
  // 3. Separar por tipo
  const attackRollEffects = applicableGroups.flatMap(g =>
    g.effects.filter(e => e.target === "attack.rolls")
  );
  
  const damageChanges = applicableGroups.flatMap(g =>
    g.damageChanges ?? []
  );
  
  // 4. Aplicar...
}
```

---

## 🚧 TAREAS DE IMPLEMENTACIÓN

### Alto Nivel

1. **Diseñar target para ataques**
   - ¿`"attack.rolls"` o `"attackRolls.total"`?
   - ¿Cómo manejar attackType (melee/ranged)?

2. **Resolver problema de daño**
   - Opción B (mantener DamageChange) o
   - Opción C (Effect con metadata especial)

3. **Implementar resolución de variables**
   - `resolveManualEffectVariable()`
   - Cachear para performance

4. **Compilar SituationalEffectGroups**
   - `compileSituationalEffects()`
   - Agrupar por contexto

5. **Integrar en pipeline de ataque**
   - `applySituationalEffectsToAttack()`
   - Combinar con sistema viejo (retrocompatibilidad)

6. **Tests**
   - Power Attack con variables
   - Magebane (weapon-specific)
   - Flanking (global)
   - Combinaciones complejas

### Bajo Nivel

```typescript
// effects/situational/resolveSituational.ts
export function resolveSituationalEffectGroup(
  group: SituationalEffectGroup,
  substitutionIndex: SubstitutionIndex
): ResolvedSituationalEffectGroup;

// effects/situational/compileSituational.ts
export function compileSituationalEffects(
  baseData: CharacterBaseData
): CompiledSituationalEffects;

export type CompiledSituationalEffects = {
  all: SituationalEffectGroup[];
  byContext: Map<SituationalContext, SituationalEffectGroup[]>;
}

// effects/situational/applySituational.ts
export function filterSituationalEffects(
  effects: SituationalEffectGroup[],
  context: SituationalContext,
  subcontext?: string  // 'melee', 'ranged', etc.
): SituationalEffectGroup[];

export function applySituationalEffects(
  effects: ResolvedSituationalEffectGroup[],
  substitutionIndex: SubstitutionIndex
): CalculatedEffectResult[];
```

---

## 💡 CONCLUSIONES

### Lo Bueno ✅
- Variables con fórmulas dinámicas son MÁS PODEROSAS
- Sistema de Effects es más simple y uniforme
- Path-based targets son más flexibles
- Conditions mejoran sobre `available: boolean`

### Lo Malo ❌
- Daño no encaja bien en el modelo de Effects
- Necesita metadata adicional (attackType, weaponId)
- Migración requiere mantener ambos sistemas temporalmente
- Tests complejos para cubrir todos los casos

### El Camino Forward 🚀

**Corto plazo:**
1. Implementar enfoque híbrido (`AttackSituationalEffectGroup`)
2. Migrar ATTACK_ROLLS y BAB primero
3. Mantener DamageChange como está

**Largo plazo:**
4. Investigar mejor modelo para daño en Effects
5. Considerar si otros contexts (skill, save) necesitan híbridos también
6. Deprecar gradualmente sistema viejo

---

## 📚 Referencias

- `core/domain/character/baseData/effects.ts` - Tipos del sistema nuevo
- `core/domain/character/baseData/contextualChange.ts` - Tipos del sistema viejo
- `core/domain/character/calculation/attacks/getCalculatedAttackData.ts` - Pipeline actual
- `core/domain/character/calculation/attacks/attack/getAttackDamageFormula.ts` - Construcción de daño
- `data/characters/gorwin.ts` - Ejemplo real de Magebane
- `ARCHITECTURE.md` líneas 284-334 - Documentación de ContextualChanges

