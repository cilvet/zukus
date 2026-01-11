# Fase 1: Supresión Extendida - Aclaraciones

> Aclaraciones obtenidas durante el refinamiento de requisitos.

---

## Objetivo de la Fase

Extender el sistema de supresión para que las entidades puedan suprimir otras mediante:
1. IDs explícitos (existente)
2. Filtros dinámicos (nuevo)

---

## Aclaraciones Confirmadas

### Coexistencia de métodos de supresión
**Decisión**: `suppressesIds` y `suppressesFilter` pueden coexistir en la misma entidad.

**Comportamiento**: Ambos se aplican de forma aditiva. Una entidad queda suprimida si:
- Su ID está en `suppressesIds` de alguna entidad seleccionada, O
- Hace match con `suppressesFilter` de alguna entidad seleccionada

---

### Caso de uso: Totem del Bárbaro
**Escenario**: Los poderes de totem se suprimen mutuamente (solo puedes tener un tipo de totem).

**Ejemplo de estructura**:
```
Entidad: totem-bear
- totemType: "bear"
- suppressesFilter: {
    type: "AND",
    conditions: [
      { field: "entityType", operator: "==", value: "totemAbility" },
      { field: "totemType", operator: "!=", value: "bear" }
    ]
  }
```

**Resultado**: Cuando seleccionas `totem-bear`, automáticamente suprime todos los demás totems (wolf, eagle, etc.).

---

### Filtros de supresión con variables
**Decisión**: Los filtros de supresión pueden usar variables, igual que cualquier otro filtro.

**Ejemplo**: "Suprime todas las entidades cuyo nivel requerido sea mayor que el nivel actual del personaje"
```
suppressesFilter: {
  conditions: [
    { field: "requiredLevel", operator: ">", value: "@character.level" }
  ]
}
```

---

### Evaluación dinámica
**Decisión**: Las supresiones se recalculan cada vez que cambia el estado.

**Razón**: 
- Las selecciones del usuario cambian (añadir/quitar entidades)
- Las variables del personaje pueden cambiar
- Todo esto afecta qué entidades quedan suprimidas

---

### Resultado de supresión con razón
**Decisión**: El cálculo de supresiones debe incluir la razón de cada supresión.

**Información a incluir**:
- ID de la entidad suprimida
- ID de la entidad que la suprime
- Tipo de supresión (por ID o por filtro)
- Si es por filtro, qué filtro causó la supresión

**Razón**: Necesario para:
- Debugging
- Mostrar en UI por qué una entidad no está disponible
- Trazabilidad

---

## Preguntas Pendientes para Implementación

- [ ] Estructura exacta de cómo se añade `suppressesFilter` a entidades
- [ ] Si el filtro de supresión puede tener displayPolicy (¿tiene sentido?)
- [ ] Estructura de `SuppressionResult`
- [ ] Nombre de la función de cálculo de supresiones
- [ ] Tipo exacto del output (mapa, array, set)

---

## Casos de Uso a Cubrir

1. **Supresión por ID**: Feature A suprime Feature B por ID explícito
2. **Supresión por filtro simple**: Totem Bear suprime otros totems
3. **Supresión por filtro con variables**: Supresión basada en nivel del personaje
4. **Supresión combinada**: Entidad con tanto `suppressesIds` como `suppressesFilter`
5. **Cadena de supresión**: A suprime B, B suprime C (¿C queda suprimida si A está activa?)

---

## Dependencias

### Requiere
- Fase 0 completada (FilterResult con variables)

### Proporciona
- Función `calculateSuppressions` usada en Fase 6 (estado del formulario) y Fase 7 (evaluación)



