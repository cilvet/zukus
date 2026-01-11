# Fase 0: Extensión de Filtros - Aclaraciones

> Aclaraciones obtenidas durante el refinamiento de requisitos.

---

## Objetivo de la Fase

Extender el sistema de filtros para que:
1. Devuelvan resultados con metadata (qué condiciones se cumplieron/fallaron)
2. Soporten política de visualización (strict/permissive)
3. Puedan evaluar condiciones que referencian variables

---

## Aclaraciones Confirmadas

### FilterResult con metadata
**Decisión**: Los resultados de filtrado deben incluir información detallada de cada condición evaluada.

**Razón**: Es necesario para mostrar en UI por qué una entidad no cumple un filtro (ej: tooltip "No cumples: requiere BAB +6").

**Estructura acordada**: El resultado incluirá:
- La entidad evaluada
- Si hace match global
- Array de resultados por condición (cumplida/no cumplida, valores actuales vs esperados)

---

### Política de visualización
**Decisión**: La política va a nivel de filtro, no del selector.

**Razón**: Puede darse el caso de que queramos que un tipo de filtro sea hard (strict) y otro sea soft (permissive) dentro del mismo selector.

**Comportamiento**:
- `strict`: Solo devuelve entidades que hacen match
- `permissive`: Devuelve todas las entidades, cada una con su `FilterResult`

**Nota importante**: Los resultados siempre irán marcados con una propiedad que indique si cumplían o no el requisito. Esto significa que necesitamos un tipo `FilterResult` estructurado, no podemos devolver simplemente las entidades.

---

### Evaluación con variables
**Decisión**: Las condiciones de filtro pueden referenciar variables del personaje usando sintaxis `@variable.path`.

**Ejemplos de uso común**:
```
@character.bab >= 6
@character.features.enabled.powerAttack == 1
@character.level >= 5
```

**Integración**: Se reutilizará el sistema de fórmulas existente para resolver las expresiones.

---

### Evaluación dinámica
**Decisión**: Los filtros se reevalúan cada vez que cambia el estado.

**Razón**: Las variables del personaje pueden cambiar durante la edición de niveles (ej: al seleccionar una feature que define una variable).

---

## Preguntas Pendientes para Implementación

Las siguientes decisiones se tomarán al inicio de la implementación:

- [ ] Estructura exacta de `FilterResult<T>`
- [ ] Estructura exacta de `ConditionEvaluationResult`
- [ ] Nombre del archivo donde se definirán estos tipos
- [ ] Nombre del campo de política: `displayPolicy`, `filterPolicy`, u otro
- [ ] Si la política es campo obligatorio u opcional (con default)
- [ ] Nombre de la función nueva de filtrado
- [ ] Tipo del parámetro de variables: `Record<string, number>` o `SubstitutionIndex`

---

## Casos de Uso a Cubrir

1. **Filtro básico sin variables**: Filtrar conjuros por escuela
2. **Filtro con variables**: Filtrar dotes por requisito de BAB (`@character.bab >= 6`)
3. **Filtro permissive**: Mostrar todas las dotes, marcando las que no cumplen requisitos
4. **Filtro strict**: Mostrar solo las dotes disponibles
5. **Resultado con razones**: Mostrar por qué una dote no está disponible

---

## Dependencias Identificadas

### Input (código existente a usar)
- `core/domain/entities/filtering/filters.ts` - Tipos y funciones de filtrado actuales
- `core/domain/formulae/formula.ts` - Sistema de fórmulas para resolver variables
- `core/domain/character/baseData/conditions.ts` - Tipo Condition y operadores

### Output (lo que otras fases usarán)
- Tipo `FilterResult<T>` - Usado en Fase 1 (supresión) y Fase 4 (EntityProvider)
- Función de filtrado con variables - Usada en todas las fases que evalúen filtros

