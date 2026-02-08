---
name: actions
description: Sistema de Acciones para ejecutar conjuros, ataques, curaciones, buffs y estados. Consultar cuando se trabaje con la ejecucion de entidades, contextos de uso, parametros dinamicos, o el flujo accion-contexto-resultado.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Grep, Glob
---

# Sistema de Acciones

Sistema generico para definir, parametrizar y ejecutar acciones que producen resultados observables sobre un personaje. Las acciones son el puente entre las entidades (conjuros, items, maniobras) y sus efectos concretos en el juego.

## Estado de implementacion

### PoC implementado (`packages/core/core/domain/actions/`)

| Archivo | Funcion |
|---------|---------|
| `types.ts` | Todos los tipos del sistema |
| `resolveParams.ts` | Resolucion de params (character, entity, formula, dynamic) |
| `resolveOutputs.ts` | Calculo de outputs para inyeccion en entidades resultado |
| `contextualEffects.ts` | `compileContextualEffects()` + `applyContextualEffects()` |
| `results/injectEntity.ts` | Primitiva: copiar entidad, aplicar outputs, resolver dados |
| `results/modifyHP.ts` | Primitiva: evaluar formula de heal/damage |
| `results/diceRoll.ts` | Primitiva: evaluar formula de dados |
| `executeAction.ts` | Orquestador del flujo completo |
| `index.ts` | Re-exports del modulo |

Tests: 47 pass en 4 archivos (`__tests__/resolveParams.test.ts`, `contextualEffects.test.ts`, `results.test.ts`, `integration.test.ts`).

### Decisiones de diseno confirmadas (post-PoC review)

1. **`ActionType` debe ser `string`, no union fija.** El contexto ES el action type. Si la accion es `cast_spell`, el contexto es `cast_spell`. No hay mapeo. Los efectos contextuales matchean por ese mismo string.
2. **El nombre de la accion debe ser traducible** via el sistema de translations existente.
3. **Falta `damage` result.** `modify_hp` con `mode: 'heal' | 'damage'` esta en los tipos pero no hay `DamageResult` — solo `HealResult`. Unificar en un solo result con `mode`.
4. **`defaultParamValues` es dead code** — nunca se lee en `resolveParams`.
5. **`availabilityConditions` no se evaluan** — el filtrado se hace via `activeGroupIds`. Para el futuro: evaluar conditions pasando la entidad de contexto.

---

## Vision General

**Problema**: Las entidades (conjuros, items, dotes) definen *que* puede hacer un personaje, pero no *como* se ejecuta. Actualmente los ataques tienen un sistema ad-hoc de cambios contextuales (`AttackContextualChange`, sistema legacy), pero no existe un modelo unificado para "lanzar un conjuro", "usar una pocion", o "activar una maniobra".

**Solucion**: Un sistema de acciones declarativo donde cada entidad define:
1. Su **contexto** (string libre: `'cast_spell'`, `'use_item'`, etc.)
2. Sus **parametros** (estaticos y dinamicos, con valores por defecto)
3. Sus **resultados** (que produce la accion: inyectar buff, consumir recurso, tirada de dados)
4. Sus **outputs** (valores finales que se inyectan en las entidades resultado, como el casterLevel en un buff)

**Principios clave**:
- **Contexto = tipo de accion**: No hay mapeo ni indirecci on. El `context` de la accion es un string que los efectos contextuales matchean directamente.
- **Sin cadenas ni pasos**: Una accion define sus resultados de forma plana. No hay secuencias, dependencias ni ramificaciones. Los resultados se ejecutan todos.
- **Buffs = Entidades**: Un buff es una `StandardEntity` con `entityType: 'buff'` que se inyecta en `customEntities` del personaje. Usa el sistema de Effects existente.
- **Efectos contextuales = ContextualEffectGroup**: Efectos que se activan en un contexto especifico (metamagia al lanzar conjuro, flanqueo al atacar). Se compilan al inicio.
- **Output params**: La accion produce valores finales (outputs) que se inyectan como variables en las entidades resultado.
- **Nombres traducibles**: Los nombres de acciones deben ser traducibles via el sistema de TranslationPacks.

**Retrocompatibilidad**: El sistema actual de `AttackContextualChange` sigue funcionando para ataques. El sistema de acciones es una capa nueva que coexiste.

---

## 1. Conceptos Fundamentales

### ActionDefinition (array en la entidad, addon `actionable`)

```typescript
type ActionableFields = {
  actions?: ActionDefinition[];
}

type ActionDefinition = {
  id: string;                      // Identificador unico: 'cast', 'use', 'drink'
  name: string;                    // Nombre para UI (traducible): 'Lanzar conjuro'
  context: string;                 // Contexto libre: 'cast_spell', 'use_item', 'attack', etc.
  params?: ActionParam[];          // Parametros de la accion
  outputs?: ActionOutput[];        // Valores que se inyectan en entidades resultado
  results: ActionResult[];         // Que produce la accion (plano, sin orden)
}
```

**Nota**: El `context` es un string libre. Funcion `getContextTypes(entities)` para obtener todos los tipos de contexto existentes.

### Contexto

El contexto es la fase intermedia entre la decision de ejecutar y la ejecucion. Aqui se resuelven params, el usuario activa efectos contextuales, y se producen outputs.

```
  Entidad con     ──────> CONTEXTO ──────> Outputs + Results
  ActionDefinition        1. Params estaticos (auto-resueltos)
                          2. Params dinamicos (usuario decide)
                          3. ContextualEffectGroups (usuario activa)
                          4. Outputs calculados (se inyectan en buff)
```

---

## 2. Parametros (ActionParam)

```typescript
type ActionParam = {
  id: string;                    // Identificador en formulas: 'casterLevel'
  name: string;                  // Nombre para UI: 'Nivel de Lanzador'
  source: ParamSource;
}

type ParamSource =
  | { type: 'character'; path: string }        // Del personaje: 'class.wizard.level'
  | { type: 'entity'; path: string }           // De la entidad: 'level', 'school'
  | { type: 'formula'; expression: string }    // Calculado: '@param.casterLevel + @param.intMod'
  | { type: 'dynamic'; inputType: DynamicInput }

type DynamicInput =
  | { kind: 'boolean'; label: string }
  | { kind: 'number'; min: EffectFormula; max: EffectFormula }
  | { kind: 'select'; options: { value: string; label: string }[] }
```

**IMPORTANTE**: Los params se resuelven en orden. Un param `formula` puede referenciar `@param.X` solo si `X` fue definido ANTES en el array de params.

---

## 3. Outputs (ActionOutput)

Valores producidos por la accion que se inyectan en las entidades resultado (buffs).

```typescript
type ActionOutput = {
  id: string;
  formula: EffectFormula;    // '@param.casterLevel', '@entity.level + 2'
  targetField: string;       // Campo destino en la entidad: 'casterLevel'
}
```

---

## 4. Resultados (ActionResult)

Tipos de resultado finales de una accion:

```typescript
type ActionResult =
  | InjectEntityResult       // Inyectar entidad buff/estado en el personaje
  | ConsumeResourceResult    // Gastar un recurso
  | ModifyHPResult           // Curar o hacer dano
  | DiceRollResult           // Tirada informativa de dados
```

### InjectEntityResult
```typescript
type InjectEntityResult = {
  type: 'inject_entity';
  entityId: string;          // ID en compendium: 'buff-mage-armor'
  target: 'self';
  active: boolean;
}
```

### ConsumeResourceResult
```typescript
type ConsumeResourceResult = {
  type: 'consume_resource';
  resourceType: ResourceType;
}

type ResourceType =
  | { kind: 'cge_slot'; trackId?: string }
  | { kind: 'cge_pool'; trackId?: string; cost: EffectFormula }
  | { kind: 'resource'; resourceId: string; cost: EffectFormula }
  | { kind: 'inventory_quantity'; amount: number }
```

### ModifyHPResult
```typescript
type ModifyHPResult = {
  type: 'modify_hp';
  mode: 'heal' | 'damage';
  formula: EffectFormula;    // '1d8 + min(@param.casterLevel, 5)'
  target: 'self';
}
```

### DiceRollResult
```typescript
type DiceRollResult = {
  type: 'dice_roll';
  id: string;
  label: string;
  diceFormula: EffectFormula;
}
```

---

## 5. Efectos Contextuales (ContextualEffectGroup)

Efectos de otras entidades (dotes, items, buffs) que modifican params de una accion en un contexto especifico.

```typescript
type ContextualEffectGroup = {
  id: string;
  name: string;
  description?: string;
  context: string;                       // Matchea con ActionDefinition.context
  appliesTo?: string;                    // Subtipo: 'melee' | 'ranged' | 'all'
  effects: Effect[];                     // Effects con target 'param.*'
  variables?: ManualEffectVariable[];    // Sliders configurables
  optional: boolean;                     // Toggle on/off por usuario
  availabilityConditions?: Condition[];  // TODO: evaluar contra entidad de contexto
  cost?: ResourceType;                   // TODO: recurso que consume al activarse
}
```

### Compilacion
```typescript
type CompiledContextualEffects = {
  all: ContextualEffectGroup[];
  byContext: Record<string, ContextualEffectGroup[]>;
}
```

Funcion: `compileContextualEffects(entities)` recorre entidades y agrupa por `context`.

### Donde viven
En `EffectfulFields` de la entidad (dote, class feature, item, buff):
```typescript
contextualEffects?: ContextualEffectGroup[];
```

---

## 6. Ejemplos

### Mage Armor (buff injection con output)
```typescript
// Spell
actions: [{
  id: 'cast', name: 'Cast Mage Armor', context: 'cast_spell',
  params: [{ id: 'casterLevel', source: { type: 'character', path: 'class.wizard.level' } }],
  outputs: [{ id: 'casterLevel', formula: '@param.casterLevel', targetField: 'casterLevel' }],
  results: [
    { type: 'consume_resource', resourceType: { kind: 'cge_slot' } },
    { type: 'inject_entity', entityId: 'buff-mage-armor', target: 'self', active: true }
  ]
}]

// Buff entity (compendium): casterLevel: 0 (rellenado por output)
// effects: [{ target: 'ac.total', formula: '4', bonusType: 'ARMOR' }]
```

### Cure Light Wounds (heal)
```typescript
actions: [{
  id: 'cast', name: 'Cast CLW', context: 'cast_spell',
  params: [{ id: 'casterLevel', source: { type: 'character', path: 'class.cleric.level' } }],
  results: [
    { type: 'consume_resource', resourceType: { kind: 'cge_slot' } },
    { type: 'modify_hp', mode: 'heal', formula: '1d8 + min(@param.casterLevel, 5)', target: 'self' }
  ]
}]
```

### Potion (item consumible)
```typescript
actions: [{
  id: 'drink', name: 'Drink Potion', context: 'use_item',
  results: [
    { type: 'consume_resource', resourceType: { kind: 'inventory_quantity', amount: 1 } },
    { type: 'modify_hp', mode: 'heal', formula: '1d8 + 1', target: 'self' }
  ]
}]
```

### Spell Focus (contextual effect)
```typescript
contextualEffects: [{
  id: 'spell-focus-evocation', name: 'Spell Focus (Evocation)',
  context: 'cast_spell',
  effects: [{ target: 'param.spellDC', formula: '1' }],
  optional: false,
  availabilityConditions: [{ type: 'simple', firstFormula: '@entity.school', operator: '==', secondFormula: 'evocation' }]
}]
```

### Power Attack pattern (variable slider)
```typescript
contextualEffects: [{
  id: 'power-feat', name: 'Power Feat', context: 'cast_spell',
  effects: [{ target: 'param.bonusDamage', formula: '@points * 2' }],
  variables: [{ id: 'points', name: 'Points', min: '1', max: '@param.casterLevel' }],
  optional: true,
}]
```

---

## 7. Flujo de Ejecucion

```
1. TRIGGER: Usuario selecciona entidad usable → accion
2. RESOLVE PARAMS: character, entity, formula (en orden), dynamic
3. APPLY CONTEXTUAL EFFECTS: grupos activos modifican params (adicion)
4. RESOLVE OUTPUTS: formulas con params finales → valores para inyeccion
5. EXECUTE RESULTS: inject_entity, consume_resource, modify_hp, dice_roll
6. RETURN OUTCOMES: lista de resultados para la UI
```

---

## 8. TODO / Mejoras pendientes

### Prioridad alta (antes de produccion)
- [ ] Cambiar `ActionType` union a `context: string` libre en `ActionDefinition`
- [ ] Unificar `HealResult` en `ModifyHPResult` con `mode: 'heal' | 'damage'`
- [ ] Implementar `defaultParamValues` en `resolveParams` o eliminar el campo
- [ ] Crear funcion `getContextTypes(entities)` que recoja todos los contexts existentes
- [ ] Hacer `ActionDefinition.name` traducible

### Prioridad media
- [ ] Evaluar `availabilityConditions` pasando la entidad de contexto al evaluador
- [ ] `ContextualEffectGroup.cost?: ResourceType` — consumo de recurso al activar un efecto contextual (ej: gastar punto de inspiracion para +4). El coste debe poder ser una formula. Los grupos con `variables` pueden referenciar esas variables en la formula de coste
- [ ] `consume_resource` con validacion real (verificar recurso suficiente antes de ejecutar)
- [ ] Pre-compilar `CompiledContextualEffects` en character sheet en vez de recompilar cada ejecucion

### Futuro: Sistema generico de modificadores de dados

El dice roller actual (`packages/core/core/domain/rolls/`) soporta:
- Dados basicos, cantidad/caras dinamicas, selectors (kh/kl/dh/dl), funciones math
- SubstitutionExpressions con metadata (tipo de dano)

**NO soporta** modificadores aplicables desde fuera:
- Maximizar dados (Maximize Spell)
- Dados explosivos (reroll en max, sumar)
- Reroll condicional (reroll 1s)
- Duplicar cantidad de dados
- Sustituir tipo de dado (d6 → d8)
- Multiplicar resultado

Los selectors actuales (kh/kl/dh/dl) estan quemados en la sintaxis de texto, no son efectos aplicables externamente.

**Vision**: En vez de primitivas acopladas a D&D 3.5, el sistema de acciones deberia tener una primitiva de **tirada de dados con modificadores**. Los efectos contextuales podrian inyectar transformaciones:

| Efecto contextual | Transformacion sobre la tirada |
|--------------------|-------------------------------|
| Maximize Spell | Todos los dados = valor maximo |
| Empower Spell | Resultado total x1.5 |
| Dados explosivos | Reroll en max, acumular |
| Reroll 1s | Re-tirar dados con resultado 1 |
| Ampliar dado | d6 → d8 |
| Duplicar cantidad | 3d6 → 6d6 |

Esto requiere que el dice roller acepte **modificadores de tirada** como concepto de primer nivel, no solo como sintaxis. Los modificadores se aplicarian pre-roll (cambiar cantidad/caras), during-roll (exploding, reroll), o post-roll (maximize, multiply).

### Futuro: Otros
- [ ] Ramificaciones condicionales (tirada de salvacion → onFail/onSuccess)
- [ ] Targeting multi-personaje
- [ ] Ataques multiples (full attack con iterativos)
- [ ] Output application con nested paths (`entity.spellData.dc`)

---

## 9. Relacion con Sistemas Existentes

| Sistema | Relacion |
|---------|----------|
| **AttackContextualChange** (legacy) | Coexiste. No se migra. |
| **SituationalEffectGroup** (effects.ts) | Renombrado a ContextualEffectGroup. |
| **CGE** | Acciones consumen recursos via `consume_resource`. |
| **Buffs legacy** | Coexisten. Nuevos buffs son StandardEntity. |
| **customEntities** | Buffs inyectados van a `customEntities.buff`. |
| **Effects** | Buffs inyectados usan Effects estandar. |
| **Inventario** | Items consumibles con acciones `use_item`. |

---

## 10. Archivos

### Implementados
| Archivo | Proposito |
|---------|-----------|
| `domain/actions/types.ts` | Todos los tipos |
| `domain/actions/resolveParams.ts` | Resolucion de params |
| `domain/actions/resolveOutputs.ts` | Calculo de outputs |
| `domain/actions/contextualEffects.ts` | Compilacion + aplicacion de efectos contextuales |
| `domain/actions/results/injectEntity.ts` | Primitiva inject |
| `domain/actions/results/modifyHP.ts` | Primitiva heal/damage |
| `domain/actions/results/diceRoll.ts` | Primitiva tirada |
| `domain/actions/executeAction.ts` | Orquestador |
| `domain/actions/index.ts` | Exports |

### Existentes (relevantes)
| Archivo | Relevancia |
|---------|-----------|
| `character/baseData/effects.ts` | Effect, ManualEffectVariable, SituationalEffectGroup |
| `entities/types/base.ts` | StandardEntity, EffectfulFields |
| `rolls/DiceRoller/diceRoller.ts` | DiceRollerImpl, roll() |
| `rolls/DiceRoller/rollExpression.ts` | RollExpression AST, DiceSelectorType |
| `formulae/formula.ts` | fillFormulaWithValues, substituteExpression |
