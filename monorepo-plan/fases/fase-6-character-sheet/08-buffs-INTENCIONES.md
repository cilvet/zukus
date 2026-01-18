# Intenciones y Contexto: Sistema de Buffs y Fórmulas

## Contexto Inicial

Estamos implementando la funcionalidad de **Buffs** según lo definido en `08-buffs.md`. Los buffs requieren formularios complejos que incluyen:

- Changes (modificadores normales)
- Contextual Changes (modificadores situacionales)
- Special Changes (recursos y variables custom)
- Conditions (condiciones de aplicación)
- **Fórmulas** (expresiones matemáticas con referencias a variables del personaje)

## Decisión Estratégica: Formula Playground Primero

### Por qué empezar con el Playground

En lugar de atacar directamente los formularios complejos, decidimos crear primero un **Formula Playground** como entorno de desarrollo y testing. Esto permite:

1. **Iteración rápida**: Probar y ajustar el sistema de fórmulas sin tener que navegar por formularios complejos
2. **Entender el problema**: Experimentar con cómo funcionan las fórmulas antes de crear la UI definitiva
3. **Validación temprana**: Verificar que las fórmulas se evalúan correctamente con el personaje actual
4. **Referencia visual**: Tener todas las variables disponibles a la vista mientras desarrollamos

### Qué hace el Playground

- Input de texto para escribir fórmulas
- Evaluación en tiempo real usando `substitutionValues` del personaje
- Muestra el resultado o error
- Ejemplos clickeables para probar fácilmente
- Lista de todas las variables disponibles con sus valores actuales

**Nota importante**: El playground es temporal y se eliminará una vez completado el desarrollo del sistema de fórmulas.

---

## Intenciones para el FormulaInput Final

### 1. Autocompletado de Variables

**Objetivo**: Cuando el usuario escribe `@`, mostrar un dropdown con las variables disponibles.

**Consideraciones**:
- Filtrar opciones mientras se escribe después del `@`
- Navegación con teclado (arrows + enter)
- Debe funcionar tanto en web como en React Native
- Usar `Popover` de Tamagui para consistencia multiplataforma

**Variables a mostrar**:
```
@ability.strength.score
@ability.strength.modifier
@bab.total
@ac.total
@level
@customVariable.{id}
@resources.{id}.current
... etc
```

### 2. Chips Visuales (Menciones)

**Objetivo**: Mostrar las referencias `@variable` como chips/badges visuales en lugar de texto plano.

**Ejemplo visual**:
```
Input:    1d8 + @ability.strength.modifier
Display:  1d8 + [STR mod]
```

**Intención del usuario**:
> "Creo que no tiene demasiado trabajo extra añadir inicialmente esos chips visuales. El trabajo va a estar dividido en dos partes. Por una parte las recomendaciones y por otra los chips visuales que se vean bien. Pero no creo que la segunda sea especialmente difícil."

**División del trabajo**:
1. **Parte 1 (más difícil)**: Sistema de autocompletado/recomendaciones
2. **Parte 2 (menos difícil)**: Renderizado visual como chips

### 3. Desafío: TextInput en React Native

**Problema conocido**: React Native no gestiona los inputs de texto de forma nativa correctamente, especialmente para rich text o inputs complejos.

**Intención del usuario**:
> "Ese es otro melón: estamos usando react native para el mobile y famosamente no gestiona los inputs de texto de forma nativa correctamente, lo que tendremos que solucionar."

**Investigación necesaria**:
- Cómo funcionan los inputs de fórmulas en `zukusnextmicon` (solo tiene autocomplete básico, sin chips visuales)
- Workarounds conocidos (eliminar `lineHeight` en native, etc.)
- Posibles librerías: `react-native-mention` o implementación custom

**Opciones a evaluar**:
- **Opción A**: Autocomplete simple con Popover (más fácil, probado en zukusnextmicon)
- **Opción B**: Chips visuales con librería especializada
- **Opción C**: Implementación custom híbrida (input normal para editar, chips para visualizar)

---

## Plan de Trabajo Dividido en Tareas

El usuario solicitó que el trabajo se divida en tareas separadas para poder atacarlas una a una.

### Tareas Creadas

1. **`00-01-formula-input.md`** ✅ En progreso
   - Paso 0: Formula Playground (temporal, para desarrollo) ✅ COMPLETADO
   - Paso 1: FormulaInput básico con validación
   - Paso 2: Autocompletado de variables
   - Paso 3: Chips visuales (opcional/avanzado)
   - Paso 4: Switch formulas (condicionales)

2. **`00-02-condition-input.md`**
   - SimpleConditionInput (comparaciones numéricas)
   - ConditionsList (lista de condiciones)
   - HasEntityConditionInput (verificar si tiene entidad)

3. **`00-componentes-compartidos.md`** (ya existía, pero se actualizará)
   - ChangeForm (usa FormulaInput + ConditionInput)
   - ContextualChangeForm
   - SpecialChangeForm (Resources y Variables)

4. **`08-buffs.md`** (plan original)
   - BuffDetailPanel
   - BuffForm (combina todos los formularios)
   - BuffsSection mejorada
   - Navegación y CRUD completo

### Orden de Implementación

```
Formula Playground (testing/dev) ✅
    ↓
FormulaInput (componente base)
    ↓
ConditionInput (usa FormulaInput)
    ↓
ChangeForm (usa FormulaInput + ConditionInput)
    ↓
ContextualChangeForm + SpecialChangeForm
    ↓
BuffDetailPanel + BuffForm
    ↓
Integración completa de Buffs
```

---

## Enfoque de Desarrollo

### Principio: Hacer bien el sistema de entrada de fórmulas

El FormulaInput es la base de todo el sistema. Si funciona bien (autocomplete fluido, visual clara, validación robusta), el resto de formularios serán naturales de usar.

### Filosofía del Playground

Crear un entorno de pruebas ANTES de la implementación final permite:
- Detectar problemas temprano
- Iterar rápidamente sin afectar otros componentes
- Entender los edge cases antes de commitear a una solución
- Tener un lugar para probar nuevas ideas

### Iteración con Usuario

**Importante**: Después de cada componente significativo, verificar con el usuario antes de continuar. Especialmente en:
- Diseño visual del FormulaInput
- Funcionamiento del autocompletado
- Comportamiento de los chips (si se implementan)

---

## Notas Técnicas

### Exports del Core

Ya se exportaron las funciones necesarias de `@zukus/core`:
```typescript
export { substituteExpression, fillFormulaWithValues } from "./core/domain/formulae/formula"
export { getRollExpression } from "./core/domain/rolls/expressionAnalysis/expressionAnalysis"
export { getResolvedRollExpression } from "./core/domain/rolls/DiceRoller/diceRoller"
```

### Valores de Sustitución

Los valores disponibles para las fórmulas están en:
```typescript
characterSheet.substitutionValues: Record<string, number>
```

Este objeto contiene todas las variables del sistema:
- `ability.strength.modifier`
- `bab.total`
- `level`
- `customVariable.{id}`
- `resources.{id}.current`
- etc.

### Evaluación de Fórmulas

Proceso de 3 pasos:
1. **Sustitución**: `substituteExpression(formula, substitutionValues)` → Reemplaza `@` variables con valores
2. **Parseo**: `getRollExpression(substituted)` → Convierte string a estructura de expresión
3. **Evaluación**: `getResolvedRollExpression(expression, randomFn)` → Calcula el resultado (incluyendo dados)

---

## Preguntas Pendientes para el Usuario

1. **Autocompletado vs Chips**: ¿Implementamos primero el autocompletado simple y luego los chips, o ambos a la vez?

2. **Diseño del FormulaInput**: ¿Quieres ver mockups o propuestas visuales antes de la implementación?

3. **Prioridad de Switch Formulas**: Las fórmulas switch (condicionales) son más avanzadas. ¿Las dejamos para después de los formularios básicos?

4. **Playground permanente**: ¿Mantenemos el playground como herramienta de debug o lo eliminamos cuando esté todo listo?

---

## Estado Actual

✅ **Completado**:
- Investigación del sistema existente
- División del trabajo en tareas
- Formula Playground funcional
- Exports necesarios del core

🚧 **En progreso**:
- Paso 0: Formula Playground (integrado en mobile y desktop)

⏳ **Pendiente**:
- Verificación del usuario (que el playground funcione bien)
- Paso 1: FormulaInput como componente reutilizable
- Paso 2: Autocompletado
- Resto de pasos según el plan

---

## Próximos Pasos Inmediatos

1. Usuario verifica que el Formula Playground funciona en mobile y web
2. Decidir approach para autocompletado y chips
3. Implementar FormulaInput básico con validación
4. Implementar sistema de autocompletado
5. (Opcional) Añadir chips visuales
6. Continuar con ConditionInput y formularios de Changes
