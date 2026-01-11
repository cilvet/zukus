# Fase 9: Resolución de Niveles del Personaje

---

## Objetivo

Implementar la función que recorre todos los niveles del personaje en orden, acumula variables, resuelve entidades granted y selected, aplica supresión, y devuelve el conjunto final de entidades activas.

---

## Por qué resolución ordenada

En D&D 3.5 (y la mayoría de TTRPGs), las capacidades del personaje se construyen nivel a nivel. Lo que obtienes en nivel 5 puede depender de lo que elegiste en nivel 3:

- Una aptitud de nivel 3 puede definir una variable que una aptitud de nivel 5 consume
- Un arquetipo en nivel 1 puede suprimir aptitudes que aparecerían en nivel 4
- Los filtros pueden usar `@characterLevel` o `@classLevel.rogue`

Por eso la resolución debe ser **secuencial y acumulativa**.

---

## Estructura de Entrada

### CharacterLevel

El personaje tiene un array de niveles, cada uno con:

```typescript
type CharacterLevel = {
  characterLevel: number      // Nivel absoluto (1, 2, 3...)
  classLevel: {
    classId: string           // "rogue", "fighter"
    level: number             // Nivel en esa clase
    features: EntityProvider[]
  }
  hpRoll?: number
}
```

Los selectores dentro de `features` contienen `selectedEntityIds`, no entidades completas. Las entidades viven en el índice central del personaje.

---

## Función Principal

```typescript
type LevelResolutionResult = {
  allEntities: Entity[]              // Todas las entidades activas
  finalVariables: SubstitutionIndex  // Variables acumuladas
  suppressedEntities: Map<string, SuppressionInfo>  // Entidades suprimidas
  warnings: string[]
}

function resolveLevelsInOrder(
  characterLevels: CharacterLevel[],
  entityIndex: Record<EntityKey, Entity>,
  baseVariables: SubstitutionIndex,
  compendiumContext: ResolvedCompendiumContext
): LevelResolutionResult
```

---

## Algoritmo de Resolución

### Paso 1: Ordenar niveles

Ordenar `characterLevels` por `characterLevel` ascendente. Esto garantiza que nivel 1 se procesa antes que nivel 2, etc.

### Paso 2: Inicializar estado

```typescript
let accumulatedVariables = { ...baseVariables }
let allEntities: Entity[] = []
let classLevelCounts: Record<string, number> = {}
```

### Paso 3: Para cada nivel

```typescript
for (const level of sortedLevels) {
  // 3.1 Actualizar contadores de clase
  classLevelCounts[level.classLevel.classId] = 
    (classLevelCounts[level.classLevel.classId] ?? 0) + 1
  
  // 3.2 Calcular variables derivadas del sistema
  const systemVariables = deriveSystemVariables(
    level.characterLevel,
    classLevelCounts,
    allEntities
  )
  accumulatedVariables = { ...accumulatedVariables, ...systemVariables }
  
  // 3.3 Resolver cada EntityProvider del nivel
  for (const provider of level.classLevel.features) {
    const resolved = resolveProvider(
      provider,
      entityIndex,
      compendiumContext,
      accumulatedVariables
    )
    allEntities.push(...resolved.entities)
  }
  
  // 3.4 Extraer variables de las nuevas entidades
  const entityVariables = extractVariablesFromEntities(resolved.entities)
  accumulatedVariables = { ...accumulatedVariables, ...entityVariables }
}
```

### Paso 4: Aplicar supresión

Después de recoger todas las entidades:

```typescript
const { activeEntities, suppressedEntities } = applySuppression(
  allEntities,
  accumulatedVariables
)
```

La supresión se aplica al final porque una entidad de nivel 10 puede suprimir algo de nivel 2.

### Paso 5: Devolver resultado

```typescript
return {
  allEntities: activeEntities,
  finalVariables: accumulatedVariables,
  suppressedEntities,
  warnings
}
```

---

## Variables Derivadas del Sistema

Función `deriveSystemVariables` calcula variables que dependen del estado actual:

```typescript
function deriveSystemVariables(
  characterLevel: number,
  classLevelCounts: Record<string, number>,
  accumulatedEntities: Entity[]
): Partial<SubstitutionIndex>
```

**Variables calculadas**:
- `@characterLevel` - Nivel total del personaje
- `@classLevel.<classId>` - Nivel en cada clase específica (ej: `@classLevel.rogue`)
- `@bab` - Base Attack Bonus acumulado (requiere sumar por clase/progresión)

Estas variables están disponibles para:
- Filtros en EntityProviders
- Conditions en entidades
- Fórmulas en changes

---

## Variables de Entidades

Las entidades pueden definir variables propias mediante el campo `definesVariables`:

```typescript
type EntityWithVariables = Entity & {
  definesVariables?: Array<{
    name: string
    value: number | Formula
  }>
}

// Ejemplo: Ataque Furtivo
{
  id: "sneak-attack-1d6",
  definesVariables: [
    { name: "sneakAttackDice", value: 1 }
  ]
}

// En nivel 3:
{
  id: "sneak-attack-2d6",
  definesVariables: [
    { name: "sneakAttackDice", value: 2 }  // Sobrescribe
  ]
}
```

**Razón de este diseño**: Las aptitudes que escalan (ataque furtivo, smite) definen variables que otras partes del sistema consumen. Al resolver en orden, la última definición gana.

---

## Resolución de EntityProviders

La función `resolveProvider` ya existe (Fase 4). En el contexto de resolución de niveles:

### Granted con IDs específicos

```typescript
{ granted: { entityIds: ["power-attack", "cleave"] } }
```

Busca las entidades en el índice del personaje por clave compuesta.

### Granted con filtro

```typescript
{ 
  granted: { 
    filter: { 
      conditions: [{ field: "addedAtClassLevel", operator: "contains", value: "rogue.3" }]
    }
  }
}
```

Evalúa el filtro contra entidades del compendio usando `accumulatedVariables`. Las que coinciden se copian al índice del personaje.

### Selector

```typescript
{
  selector: {
    id: "rogue-talent-3",
    selectedEntityIds: ["fast-hands"]
  }
}
```

Busca las entidades seleccionadas en el índice del personaje.

---

## Integración con Cálculo del Personaje

El resultado de `resolveLevelsInOrder` se usa en `calculateCharacterSheet`:

```typescript
const levelResolution = resolveLevelsInOrder(
  character.levelBuild.levels,
  character.levelBuild.entities,
  baseVariables,
  compendiumContext
)

// Las entidades resueltas aportan sus changes
const entityChanges = levelResolution.allEntities
  .flatMap(e => e.legacy_changes ?? [])
  .map(change => contextualizeChange(change, levelResolution.finalVariables))

// Se combinan con otros changes del personaje
const allChanges = [...legacyChanges, ...entityChanges]
```

---

## Manejo de Errores

### Variable no encontrada

Si una fórmula referencia `@customVar` que no existe:
- Política `permissive`: usa 0 como valor, genera warning
- Política `strict`: genera error

La política por defecto es `permissive` (filosofía del sistema: avisar, no bloquear).

### Entidad no encontrada en índice

Si un selector referencia un entityId que no está en el índice:
- Genera warning
- Continúa sin esa entidad

Esto puede pasar si se corrompe el estado o se elimina una entidad manualmente.

---

## Criterios de Aceptación

- [ ] Función `resolveLevelsInOrder` implementada
- [ ] Función `deriveSystemVariables` implementada
- [ ] Variables se acumulan correctamente nivel a nivel
- [ ] Entidades de nivel N pueden usar variables de nivel N-1
- [ ] Supresión se aplica al final
- [ ] Integración con `calculateCharacterSheet` funcionando
- [ ] Tests cubren: sin niveles, 1 nivel, multiclase, variables acumuladas, supresión cruzada

