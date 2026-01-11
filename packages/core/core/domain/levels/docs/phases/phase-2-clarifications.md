# Fase 2: Conditions en Entidades - Aclaraciones

> Aclaraciones obtenidas durante el refinamiento de requisitos.

---

## Objetivo de la Fase

Añadir soporte para campos de tipo `conditions` en el sistema de schemas de entidades, permitiendo que las entidades declaren requisitos que deben cumplirse.

---

## Aclaraciones Confirmadas

### Tipo de campo conditions
**Decisión**: Se añade `"conditions"` como nuevo tipo de campo válido en schemas.

**Formato del campo**: Array de `Condition`, usando el mismo tipo que ya existe en `core/domain/character/baseData/conditions.ts`.

**Estructura de Condition existente**:
```typescript
{
  type: "simple",
  firstFormula: "@character.bab",
  operator: ">=",
  secondFormula: "6"
}
```

---

### Uso principal: addAtClassLevelConditions
**Contexto**: Las features inyectadas por arquetipos necesitan conditions que determinen si deben añadirse.

**Ejemplo**:
```
Entidad: assassin-death-attack
- addedAtClassLevel: ["rogue.3"]
- addAtClassLevelConditions: [
    {
      type: "simple",
      firstFormula: "@archetype.assassin.active",
      operator: "==",
      secondFormula: "1"
    }
  ]
```

**Significado**: Esta feature se inyecta en Rogue nivel 3, pero solo si el arquetipo Assassin está activo.

---

### Campos de conditions múltiples
**Decisión**: Puede haber más de un campo de tipo `conditions` en una entidad, aunque sería raro.

**Ejemplo**: Una entidad podría tener tanto `conditions` (requisitos generales) como `addAtClassLevelConditions` (requisitos específicos para inyección).

**Lo importante**: El tipo de campo `conditions` debe funcionar independientemente del nombre de la propiedad.

---

### Evaluación de conditions
**Decisión**: Las conditions se evalúan usando el mismo sistema que los Changes, con variables del personaje.

**Patrón común**: Muchas conditions serán "flags booleanos":
```
{
  firstFormula: "@character.availableFeats.powerAttack",
  operator: "==",
  secondFormula: "1"
}
```

---

### Integración con filtros
**Decisión**: Los filtros deben poder evaluar campos de tipo conditions.

**Caso de uso**: "Filtrar entidades cuyas conditions se cumplen dado el estado actual"

**Ejemplo de filtro**:
```
{
  type: "AND",
  conditions: [
    { field: "$.props.conditions", operator: "evaluates_to", value: true }
  ]
}
```

*(El operador exacto se definirá durante implementación)*

---

## Preguntas Pendientes para Implementación

- [ ] Nombre del tipo de campo: `"conditions"` o `"condition_array"`
- [ ] Si se valida la sintaxis de las fórmulas dentro de las conditions al validar la entidad
- [ ] Nombre de la función de evaluación de conditions
- [ ] Si la función devuelve boolean simple o resultado detallado
- [ ] Cómo integrar con el sistema de filtros (nuevo operador, función auxiliar, etc.)

---

## Casos de Uso a Cubrir

1. **Conditions simples**: Requisito de BAB mínimo
2. **Conditions con flag**: Verificar que un arquetipo está activo
3. **Conditions múltiples**: AND implícito entre todas las conditions del array
4. **Evaluación con variables dinámicas**: Variables que se generan durante edición de nivel
5. **Integración con filtros**: Filtrar entidades que cumplen sus conditions

---

## Dependencias

### Requiere
- Ninguna (puede desarrollarse en paralelo con Fase 0-1)

### Proporciona
- Tipo de campo `conditions` para schemas
- Función de evaluación de conditions usada en Fase 7 (features inyectadas)



