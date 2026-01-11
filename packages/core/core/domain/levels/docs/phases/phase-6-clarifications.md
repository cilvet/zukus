# Fase 6: Funciones de Selección - Aclaraciones

> Aclaraciones obtenidas durante el refinamiento de requisitos.

---

## Objetivo de la Fase

Implementar funciones para gestionar selecciones de entidades dentro de selectores, permitiendo que las selecciones del usuario se guarden directamente en el propio selector.

---

## Aclaraciones Confirmadas

### Las selecciones viven en el selector
**Decisión**: El selector ES el estado. Las entidades seleccionadas se guardan completas (no solo IDs) dentro del campo `selectedEntities` del selector.

**Razón**: Simplicidad. No hay sincronización entre selector y estado externo. El selector contiene toda la información necesaria.

**Estructura**:
```typescript
type Selector = {
  id: string;
  name: string;
  entityType?: string;
  entityIds?: string[];
  filter?: EntityFilter;
  min: number;
  max: number;
  
  // NUEVO: Selecciones del usuario
  selectedEntities?: Record<string, Entity>;  // Entidades completas, indexadas por ID
}
```

---

### Filtro en granted vs filtro en selector
**Aclaración**: Es importante entender la diferencia:

- **Filtro en `granted`**: Los resultados del filtro se OTORGAN automáticamente. No hay selección del usuario.
- **Filtro en `selector`**: Los resultados del filtro son ELEGIBLES para selección. El usuario debe elegir entre ellos.

**Ejemplo**:
```typescript
// GRANTED con filtro: Se otorgan automáticamente todas las entidades que cumplen
{
  granted: {
    filter: {
      conditions: [{ field: 'level', operator: '<=', value: 3 }]
    }
  }
}
// → Todas las entidades con level <= 3 se otorgan automáticamente

// SELECTOR con filtro: Se muestran para que el usuario elija
{
  selector: {
    id: 'feat-choice',
    filter: {
      conditions: [{ field: 'level', operator: '<=', value: 3 }]
    },
    min: 1,
    max: 3
  }
}
// → Usuario puede elegir 1-3 entidades de las que tienen level <= 3
```

**Estado actual en visualPlayground**: Correcto. El selector con filtro muestra entidades elegibles, no las otorga automáticamente.

---

### applySelection es inmutable
**Decisión**: Las funciones de selección NO mutan el selector, sino que devuelven un nuevo selector con las selecciones actualizadas.

**Razón**: Inmutabilidad, facilita rastreo de cambios y rollback.

---

### Validación permissive
**Decisión**: La validación sigue la filosofía permissive del sistema. Devuelve warnings pero permite continuar.

**Ejemplo**:
- Usuario selecciona entidad que no cumple filtro → Warning, pero se permite
- Usuario excede max → Error, no se permite
- Usuario no cumple min → Error al validar, pero se puede guardar el selector incompleto

---

### Validación contra variables actuales
**Decisión**: Las funciones de validación reciben las variables actuales del personaje para evaluar filtros dinámicos.

**Razón**: Los filtros pueden referenciar variables (`@characterLevel >= 3`), por lo que necesitamos el contexto actual.

---

## Preguntas Pendientes

### P1: ¿Qué devuelve applySelection?
**Opciones**:
- A) Solo el nuevo selector
- B) `{ selector, warnings, errors }`

**Recomendación**: B - Para informar a la UI de problemas

---

### P2: ¿validateSelector valida también el estado de selecciones previas?
**Pregunta**: Si un selector tiene selecciones que antes cumplían el filtro pero ahora no (porque cambiaron las variables), ¿lo detectamos?

**Caso de uso**: Personaje subió de nivel, una dote seleccionada ya no es elegible.

**Recomendación**: Sí, devolver warnings de "entidades que ya no cumplen filtro"

---

### P3: ¿Cómo manejamos el caso de selector con selectedEntities pero sin acceso al compendio?
**Pregunta**: Si el selector tiene IDs seleccionados pero no tenemos acceso a `allEntities` para validar, ¿qué hacemos?

**Opciones**:
- A) Error - requiere siempre allEntities
- B) Warning - asume que las entidades son válidas

**Recomendación**: A - para garantizar validación completa

---

## Entregables

### A.1 - Actualizar tipo Selector
Añadir campo `selectedEntities?: Record<string, Entity>`

### A.2 - Función applySelection
```typescript
function applySelection(
  selector: Selector,
  entity: Entity,
  allEntities: Entity[],
  variables: SubstitutionIndex
): {
  selector: Selector;
  warnings: string[];
  errors: string[];
}
```

**Comportamiento**:
- Valida que entity es elegible (cumple filtro si existe)
- Valida que no excede max
- Añade entity completa a selectedEntities
- Devuelve warnings si entity no cumple filtro pero se permite añadir

### A.3 - Función removeSelection
```typescript
function removeSelection(
  selector: Selector,
  entityId: string
): Selector
```

**Comportamiento**:
- Elimina entityId de selectedEntities
- Devuelve nuevo selector

### A.4 - Función validateSelector
```typescript
type SelectorValidationResult = {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

function validateSelector(
  selector: Selector,
  allEntities: Entity[],
  variables: SubstitutionIndex
): SelectorValidationResult
```

**Comportamiento**:
- Valida min/max de selecciones
- Valida que todas las entidades seleccionadas siguen siendo elegibles
- Devuelve warnings para entidades que ya no cumplen filtro
- Devuelve errors para violaciones de min/max

---

## Casos de Uso a Cubrir (Tests)

### Caso 1: Añadir selección válida
```typescript
const selector = { id: 'feat-sel', min: 1, max: 3 };
const feat = { id: 'power-attack', ... };
const result = applySelection(selector, feat, allFeats, vars);
// → selector.selectedEntities['power-attack'] existe
// → warnings: [], errors: []
```

### Caso 2: Añadir selección que no cumple filtro
```typescript
const selector = { 
  id: 'feat-sel', 
  filter: { field: 'level', operator: '<=', value: 5 },
  min: 1, 
  max: 3 
};
const highLevelFeat = { id: 'epic-feat', level: 10, ... };
const result = applySelection(selector, highLevelFeat, allFeats, vars);
// → selector.selectedEntities['epic-feat'] existe (filosofía permissive)
// → warnings: ['Entity does not meet filter criteria']
```

### Caso 3: Exceder máximo
```typescript
const selector = { 
  id: 'feat-sel', 
  min: 1, 
  max: 2,
  selectedEntities: { 'feat1': {...}, 'feat2': {...} }
};
const feat3 = { id: 'feat3', ... };
const result = applySelection(selector, feat3, allFeats, vars);
// → selector sin cambios
// → errors: ['Maximum selections (2) already reached']
```

### Caso 4: Validar selector con selecciones que ya no cumplen
```typescript
const selector = {
  id: 'feat-sel',
  filter: { field: 'level', operator: '<=', value: '@characterLevel' },
  selectedEntities: { 'feat5': { id: 'feat5', level: 5 } }
};
const vars = { characterLevel: 3 }; // Personaje bajo de nivel
const result = validateSelector(selector, allFeats, vars);
// → warnings: ['Entity feat5 no longer meets filter criteria (level 5 > characterLevel 3)']
```

### Caso 5: Validar min no cumplido
```typescript
const selector = { id: 'feat-sel', min: 2, max: 3 };
// selectedEntities está vacío
const result = validateSelector(selector, allFeats, vars);
// → valid: false
// → errors: ['Minimum selections (2) not met. Current: 0']
```

---

## Archivos a Crear

- `core/domain/levels/selection/types.ts`
- `core/domain/levels/selection/applySelection.ts`
- `core/domain/levels/selection/removeSelection.ts`
- `core/domain/levels/selection/validateSelector.ts`
- `core/domain/levels/selection/index.ts`
- `core/domain/levels/__tests__/selection/applySelection.spec.ts`
- `core/domain/levels/__tests__/selection/removeSelection.spec.ts`
- `core/domain/levels/__tests__/selection/validateSelector.spec.ts`

---

## Archivos a Modificar

- `core/domain/levels/providers/types.ts` - Añadir `selectedEntities` a Selector

---

## Criterios de Aceptación

- [ ] Se puede añadir entidad a selector con applySelection
- [ ] Se puede quitar entidad de selector con removeSelection
- [ ] La validación detecta min/max no cumplido
- [ ] La validación detecta entidades que ya no cumplen filtro (warning)
- [ ] applySelection valida contra filtro con variables
- [ ] applySelection detecta cuando se excede max
- [ ] Las selecciones se guardan como entidades completas (no solo IDs)
- [ ] Tests cubren: añadir válida, añadir inválida (warning), exceder max, min no cumplido, validación con variables

---

## Dependencias

**Requiere**:
- Fase 4 completada (EntityProvider con Selector) ✅

**Proporciona**:
- Selector con `selectedEntities` usado en Fase C (ClassDefinition)
- Funciones de selección usadas en Fase D (Resolución)

