# 00-01: Formula Input

**Prioridad:** CRITICA - Es la base de todos los formularios  
**Complejidad:** Alta  
**Dependencias:** Ninguna

---

## Contexto

El **FormulaInput** es el componente base para editar formulas matematicas que referencian variables del personaje. Se usa en:
- ChangeForm (valor del change)
- SpecialChangeForm (max value, recharge, etc.)
- ConditionInput (valores de comparacion)
- Cualquier lugar donde se escriba una formula

### Ejemplos de formulas

```
1d8 + @ability.strength.modifier
@level + 2
@bab.base
@customVariable.sneakAttackDice
floor(@level / 2)
```

---

## Paso 0: Formula Playground (Desarrollo/Testing)

### Objetivo

Crear una seccion temporal en el character sheet para probar el FormulaInput durante el desarrollo. Permite escribir formulas y ver su resultado en tiempo real.

### Ubicacion

`ui/components/character/sections/FormulaPlaygroundSection.tsx`

### UI

```
+------------------------------------------+
| Formula Playground                       |
+------------------------------------------+
| Formula:                                 |
| [ @ability.strength.modifier + 2       ] |
|                                          |
| Result: 5                                |
| (o error si la formula es invalida)      |
+------------------------------------------+
```

### Integracion

- [x] Anadir a CharacterScreenDesktop.tsx (columna derecha, abajo)
- [x] Anadir a mobile (seccion al final)
- [ ] Mostrar solo en modo desarrollo (opcional)

### Estado

- [x] Crear componente basico con Input simple
- [x] Evaluar formula con el character actual
- [x] Mostrar resultado o error

---

## Paso 1: FormulaInput Basico

### Objetivo

Input de texto que:
1. Permite escribir formulas
2. Valida la formula en tiempo real
3. Muestra error si es invalida

### Props

```typescript
type FormulaInputProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string // Error externo
}
```

### Validacion

Usar el core para validar:

```typescript
import { substituteExpression, evaluateExpression } from '@zukus/core'

const validate = (formula: string, substitutionValues: Record<string, number>) => {
  try {
    const substituted = substituteExpression(formula, substitutionValues)
    evaluateExpression(substituted)
    return { valid: true }
  } catch (e) {
    return { valid: false, error: e.message }
  }
}
```

### Estado

- [ ] Crear componente FormulaInput.tsx
- [ ] Validacion en tiempo real (con debounce)
- [ ] Mostrar estado de error visualmente

---

## Paso 2: Autocompletado de Variables

### Objetivo

Cuando el usuario escribe `@`, mostrar un dropdown con las variables disponibles.

### Variables disponibles

El core exporta `valueIndexKeys` con todas las variables del sistema:

```typescript
// Abilities
'@ability.strength.score', '@ability.strength.modifier'
'@ability.dexterity.score', '@ability.dexterity.modifier'
// ... etc

// Combat
'@bab.base', '@bab.total'
'@ac.total', '@ac.touch.total', '@ac.flatFooted.total'
'@initiative.total'

// Saving Throws
'@savingThrow.fortitude.total'
'@savingThrow.reflex.total'
'@savingThrow.will.total'

// Level
'@level', '@casterLevel'
'@class.{classId}.level'

// Custom
'@customVariable.{id}'
'@resources.{id}.current', '@resources.{id}.max'
```

### UI del autocompletado

```
Formula: @abi|
        +------------------------+
        | ability.strength.score |
        | ability.strength.mod   |
        | ability.dexterity...   |
        +------------------------+
```

### Implementacion

**Opcion A: Popover de Tamagui (recomendada)**
- Usar `Popover` de Tamagui
- Filtrar opciones segun lo que el usuario escribe despues de `@`
- Al seleccionar, reemplazar el texto parcial

**Opcion B: react-native-mention o similar**
- Libreria especializada
- Puede ser mas compleja de integrar con Tamagui

### Estado

- [ ] Detectar cuando se escribe `@`
- [ ] Mostrar Popover con opciones filtradas
- [ ] Navegacion con teclado (arrows + enter)
- [ ] Insertar variable seleccionada
- [ ] Cerrar al hacer click fuera

---

## Paso 3: Chips Visuales (Opcional/Avanzado)

### Objetivo

Mostrar las referencias `@variable` como chips visuales en lugar de texto plano.

### Ejemplo

En lugar de:
```
1d8 + @ability.strength.modifier
```

Mostrar:
```
1d8 + [STR mod]
```

Donde `[STR mod]` es un chip/badge visual.

### Consideraciones

- React Native no soporta bien rich text editing
- Opciones:
  1. **Solo visual en display**: El input es texto plano, pero el display muestra chips
  2. **Hybrid approach**: Parsear y mostrar chips, pero editar como texto
  3. **Custom implementation**: Componente custom con multiples TextInput

### Estado

- [ ] Decidir approach con el usuario
- [ ] Implementar version basica
- [ ] Pulir UX

---

## Paso 4: Switch Formulas (Condicionales)

### Objetivo

Soportar formulas con multiples casos:

```typescript
type SwitchFormula = {
  type: 'switch'
  switchExpression: string     // '@level'
  cases: SwitchCase[]
  defaultValue: string
}

type SwitchCase = {
  caseValue: string            // '5'
  operator: '==' | '>=' | '<=' | '>' | '<' | '!='
  resultExpression: string     // '3'
}
```

### Ejemplo: Sneak Attack Dice

```
Switch on: @level
Cases:
  >= 1: 1d6
  >= 3: 2d6
  >= 5: 3d6
  >= 7: 4d6
Default: 0
```

### UI

```
+----------------------------------+
| Formula Type: [Switch v]          |
+----------------------------------+
| Switch on: [@level             ] |
|                                  |
| Cases:                           |
| [>=] [1] -> [1d6            ]   |
| [>=] [3] -> [2d6            ]   |
| [>=] [5] -> [3d6            ]   |
| [+] Add case                     |
|                                  |
| Default: [0                 ]    |
+----------------------------------+
```

### Estado

- [ ] Toggle entre formula normal y switch
- [ ] Editor de casos
- [ ] Agregar/eliminar casos
- [ ] Validar cada expresion

---

## Archivos a Crear

```
ui/components/character/
  sections/
    FormulaPlaygroundSection.tsx    # Paso 0 - Playground
  shared/
    FormulaInput.tsx                # Paso 1, 2
    FormulaDisplay.tsx              # Display sin edicion
    SwitchFormulaEditor.tsx         # Paso 4
    VariableAutocomplete.tsx        # Paso 2 - Componente del dropdown
  hooks/
    useFormulaValidation.ts         # Validacion de formulas
    useVariableAutocomplete.ts      # Logica del autocomplete
```

---

## Verificacion

### Paso 0 - Playground
- [ ] El playground aparece en el character sheet
- [ ] Puedo escribir una formula
- [ ] Veo el resultado evaluado
- [ ] Veo errores si la formula es invalida

### Paso 1 - Input basico
- [ ] FormulaInput acepta texto
- [ ] Valida en tiempo real
- [ ] Muestra errores visualmente

### Paso 2 - Autocompletado
- [ ] Al escribir `@` aparece dropdown
- [ ] Las opciones se filtran mientras escribo
- [ ] Puedo navegar con teclado
- [ ] Al seleccionar se inserta la variable

### Paso 3 - Chips
- [ ] (Depende de la decision del usuario)

### Paso 4 - Switch
- [ ] Puedo crear formula switch
- [ ] Puedo agregar/quitar casos
- [ ] Cada caso se valida

---

## Siguiente Paso

Una vez completado el FormulaInput, proceder con:
- [00-02-condition-input.md](./00-02-condition-input.md) - Usa FormulaInput
- [00-componentes-compartidos.md](./00-componentes-compartidos.md) - ChangeForm usa FormulaInput
