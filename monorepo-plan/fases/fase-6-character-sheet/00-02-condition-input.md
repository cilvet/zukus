# 00-02: Condition Input

**Prioridad:** Alta  
**Complejidad:** Media  
**Dependencias:** `00-01-formula-input.md`

---

## Contexto

El **ConditionInput** permite definir condiciones que determinan cuando aplica un Change. Hay dos tipos de condiciones en el sistema.

---

## Tipos de Condiciones

### 1. SimpleCondition

Comparacion numerica entre dos expresiones:

```typescript
type SimpleCondition = {
  type: 'simple'
  firstFormula: string       // '@level'
  operator: RelationalOperator  // '>=', '<=', '==', '!=', '>', '<'
  secondFormula: string      // '5'
}
```

**Ejemplos:**
- `@level >= 5` - Solo si el nivel es 5 o mayor
- `@bab.base > 0` - Solo si tiene BAB
- `@ability.strength.score >= 13` - Prerequisito de Strength

### 2. HasEntityCondition

Verifica si el personaje tiene una entidad:

```typescript
type HasEntityCondition = {
  type: 'has_entity'
  entityId?: string           // ID especifico
  entityType?: string         // Tipo de entidad
  filter?: EntityPropertyCondition[]
  count?: { min?: number; max?: number }
}
```

**Ejemplos:**
- `has feat:power-attack` - Tiene el feat Power Attack
- `has class:fighter count >= 4` - Tiene 4+ niveles de Fighter

---

## Componentes a Crear

### 1. SimpleConditionInput

**Ubicacion:** `ui/components/character/shared/SimpleConditionInput.tsx`

**UI:**

```
+---------------------------------------------+
| [ @level         ] [>=] [ 5              ]  |
+---------------------------------------------+
```

Tres campos:
1. FormulaInput para firstFormula
2. Select para operator
3. FormulaInput para secondFormula

**Props:**

```typescript
type SimpleConditionInputProps = {
  condition: SimpleCondition
  onChange: (condition: SimpleCondition) => void
  onRemove?: () => void
}
```

### 2. HasEntityConditionInput (Avanzado)

**Ubicacion:** `ui/components/character/shared/HasEntityConditionInput.tsx`

**UI:**

```
+---------------------------------------------+
| Entity Type: [Feat v]                       |
| Entity ID:   [power-attack            ]     |
| Count:       Min [1] Max [ ]                |
+---------------------------------------------+
```

**Nota:** Este es mas complejo y puede implementarse en una fase posterior.

### 3. ConditionsList

**Ubicacion:** `ui/components/character/shared/ConditionsList.tsx`

Lista de condiciones con boton para agregar mas:

```
Conditions:
+---------------------------------------------+
| @level >= 5                            [x]  |
+---------------------------------------------+
| @bab.base > 0                          [x]  |
+---------------------------------------------+
[+ Add Condition]
```

**Props:**

```typescript
type ConditionsListProps = {
  conditions: Condition[]
  onChange: (conditions: Condition[]) => void
}
```

---

## Operadores Disponibles

```typescript
type RelationalOperator = 
  | '=='   // Igual
  | '!='   // Diferente
  | '<'    // Menor que
  | '>'    // Mayor que
  | '<='   // Menor o igual
  | '>='   // Mayor o igual
```

---

## Hook de Gestion

### useConditionsManagement

```typescript
function useConditionsManagement(initialConditions: Condition[] = []) {
  const [conditions, setConditions] = useState(initialConditions)
  
  const addCondition = (condition: Condition) => {
    setConditions([...conditions, condition])
  }
  
  const updateCondition = (index: number, condition: Condition) => {
    const updated = [...conditions]
    updated[index] = condition
    setConditions(updated)
  }
  
  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }
  
  return { conditions, addCondition, updateCondition, removeCondition, setConditions }
}
```

---

## Archivos a Crear

```
ui/components/character/
  shared/
    SimpleConditionInput.tsx
    ConditionsList.tsx
    HasEntityConditionInput.tsx    # Fase posterior
  hooks/
    useConditionsManagement.ts
```

---

## Verificacion

- [ ] SimpleConditionInput renderiza correctamente
- [ ] Puedo cambiar el operator con el select
- [ ] Los FormulaInput funcionan para ambos campos
- [ ] ConditionsList permite agregar condiciones
- [ ] Puedo eliminar condiciones
- [ ] Las condiciones se validan (formulas validas)

---

## Siguiente Paso

Una vez completado, el ConditionInput se usara en:
- [00-componentes-compartidos.md](./00-componentes-compartidos.md) - ChangeForm incluye condiciones opcionales
