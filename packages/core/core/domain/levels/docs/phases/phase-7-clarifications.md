# Fase 7: Sistema de Requerimientos - Aclaraciones

> Aclaraciones obtenidas durante el refinamiento de requisitos.

---

## Objetivo de la Fase

Implementar sistema de requerimientos (prerequisites) para entidades, permitiendo que las entidades declaren condiciones que deben cumplirse para ser elegibles.

---

## Aclaraciones Confirmadas

### Requerimientos son Conditions extendidas
**Decisión**: Los requerimientos son un array de `Condition | HasEntityRequirement`. Reutilizamos el tipo `Condition` existente y añadimos un nuevo tipo para "tiene entidad X".

**Razón**: Aprovecha infraestructura existente de evaluación de condiciones.

**Estructura**:
```typescript
type Requirement = Condition | HasEntityRequirement;

type HasEntityRequirement = {
  type: 'has_entity';
  entityId?: string;        // ID específico
  entityType?: string;      // Tipo de entidad
  filter?: EntityFilter;    // Filtro dinámico
  count?: number;           // Cantidad requerida (default: 1)
};
```

---

### AND implícito entre requerimientos
**Decisión**: Si una entidad tiene múltiples requirements, TODOS deben cumplirse (AND implícito).

**Razón**: Consistencia con el sistema de conditions.

**Ejemplo**:
```typescript
{
  id: 'improved-power-attack',
  requirements: [
    { type: 'simple', firstFormula: '@bab', operator: '>=', secondFormula: '4' },
    { type: 'has_entity', entityId: 'power-attack' }
  ]
  // Requiere: BAB >= 4 AND tiene Power Attack
}
```

---

### Integración con filtros
**Decisión**: Nuevo operador de filtro `meets_requirements` para filtrar entidades por si cumplen sus requirements.

**Razón**: Permite filtrar entidades elegibles en selectores.

**Ejemplo**:
```typescript
{
  type: 'AND',
  conditions: [
    { field: 'requirements', operator: 'meets_requirements', value: true }
  ]
}
```

---

### has_entity con filtro
**Decisión**: `has_entity` puede usar filtro para buscar entidades del personaje.

**Razón**: Flexibilidad para requerimientos como "tener cualquier dote de metamagia".

**Ejemplo**:
```typescript
{
  type: 'has_entity',
  entityType: 'feat',
  filter: {
    type: 'AND',
    conditions: [
      { field: 'category', operator: '==', value: 'metamagic' }
    ]
  },
  count: 1
}
// Requiere: tener al menos 1 dote de categoría metamagic
```

---

## Preguntas Pendientes

### P1: ¿Necesitamos givesRequirements?
**Pregunta**: ¿Las entidades pueden declarar que confieren requerimientos abstractos (`givesRequirements: ['sneak-attack']`) para que otras entidades los puedan requerir?

**Contexto**: En el PRD original se mencionaba este concepto.

**Casos de uso**:
- Aptitud de clase Sneak Attack da `'sneak-attack'`
- Dote que requiere `'sneak-attack'` (sin importar de dónde venga)

**Opciones**:
- A) Implementar ahora con `givesRequirements` + `requiresRequirements`
- B) Posponer, usar solo `has_entity` con filtros por ahora

**Recomendación**: B - `has_entity` con filtros cubre la mayoría de casos

---

### P2: ¿Los requerimientos afectan a validación de selector?
**Pregunta**: Si un selector tiene filtro con `meets_requirements`, y una entidad seleccionada deja de cumplir requirements (personaje perdió una capacidad), ¿lo detectamos?

**Recomendación**: Sí, `validateSelector` debería detectarlo como warning

---

### P3: ¿Qué pasa si has_entity no encuentra ninguna entidad?
**Pregunta**: Si `has_entity` con filtro no encuentra entidades, ¿es error o simplemente no cumple?

**Recomendación**: Simplemente no cumple (devuelve `met: false`)

---

## Entregables

### B.1 - Tipo de campo requirements
Añadir `'requirements'` como tipo válido en `EntityFieldType`

### B.2 - Tipos de Requirements
```typescript
type Requirement = Condition | HasEntityRequirement;

type HasEntityRequirement = {
  type: 'has_entity';
  entityId?: string;
  entityType?: string;
  filter?: EntityFilter;
  count?: number;  // Default: 1
};

type RequirementsField = {
  requirements?: Requirement[];
}
```

### B.3 - Función evaluateRequirements
```typescript
type RequirementEvaluationResult = {
  met: boolean;
  unmetRequirements: Array<{
    requirement: Requirement;
    reason: string;
  }>;
};

function evaluateRequirements(
  requirements: Requirement[],
  characterEntities: Entity[],
  variables: SubstitutionIndex
): RequirementEvaluationResult
```

### B.4 - Operador meets_requirements en filtros
Modificar `filterWithVariables` para soportar:
```typescript
{ field: 'requirements', operator: 'meets_requirements', value: true }
```

---

## Casos de Uso a Cubrir (Tests)

### Caso 1: Requerimiento simple con variable
```typescript
const feat = {
  id: 'power-attack',
  requirements: [
    { type: 'simple', firstFormula: '@bab', operator: '>=', secondFormula: '1' }
  ]
};
const vars = { bab: 3 };
const result = evaluateRequirements(feat.requirements, [], vars);
// → met: true
```

### Caso 2: has_entity por ID
```typescript
const improvedPA = {
  id: 'improved-power-attack',
  requirements: [
    { type: 'has_entity', entityId: 'power-attack' }
  ]
};
const characterEntities = [
  { id: 'power-attack', ... },
  { id: 'cleave', ... }
];
const result = evaluateRequirements(improvedPA.requirements, characterEntities, {});
// → met: true
```

### Caso 3: has_entity por tipo
```typescript
const feat = {
  id: 'arcane-strike',
  requirements: [
    { type: 'has_entity', entityType: 'spell', count: 1 }
  ]
};
const characterEntities = [
  { id: 'fireball', entityType: 'spell', ... }
];
const result = evaluateRequirements(feat.requirements, characterEntities, {});
// → met: true
```

### Caso 4: has_entity con filtro
```typescript
const feat = {
  id: 'spell-focus-evocation',
  requirements: [
    { 
      type: 'has_entity',
      entityType: 'spell',
      filter: {
        type: 'AND',
        conditions: [
          { field: 'school', operator: '==', value: 'Evocation' }
        ]
      },
      count: 1
    }
  ]
};
const characterEntities = [
  { id: 'fireball', entityType: 'spell', school: 'Evocation', ... }
];
const result = evaluateRequirements(feat.requirements, characterEntities, {});
// → met: true
```

### Caso 5: Múltiples requerimientos (AND implícito)
```typescript
const feat = {
  id: 'epic-feat',
  requirements: [
    { type: 'simple', firstFormula: '@characterLevel', operator: '>=', secondFormula: '20' },
    { type: 'has_entity', entityId: 'power-attack' },
    { type: 'has_entity', entityId: 'cleave' }
  ]
};
const vars = { characterLevel: 21 };
const characterEntities = [
  { id: 'power-attack', ... },
  { id: 'cleave', ... }
];
const result = evaluateRequirements(feat.requirements, characterEntities, vars);
// → met: true
```

### Caso 6: Requerimiento no cumplido
```typescript
const feat = {
  id: 'improved-power-attack',
  requirements: [
    { type: 'has_entity', entityId: 'power-attack' }
  ]
};
const characterEntities = [];
const result = evaluateRequirements(feat.requirements, characterEntities, {});
// → met: false
// → unmetRequirements: [{ requirement: {...}, reason: 'Missing entity: power-attack' }]
```

### Caso 7: Filtro con meets_requirements
```typescript
const filter = {
  type: 'AND',
  filterPolicy: 'strict',
  conditions: [
    { field: 'requirements', operator: 'meets_requirements', value: true }
  ]
};
const feats = [
  { id: 'power-attack', requirements: [...] },  // cumple
  { id: 'epic-feat', requirements: [...] }       // no cumple
];
const results = filterEntitiesWithVariables(feats, [filter], vars, characterEntities);
// → Solo power-attack en resultados
```

---

## Archivos a Crear

- `core/domain/levels/requirements/types.ts`
- `core/domain/levels/requirements/evaluateRequirements.ts`
- `core/domain/levels/requirements/index.ts`
- `core/domain/levels/__tests__/requirements/evaluateRequirements.spec.ts`
- `core/domain/levels/__tests__/requirements/meetsRequirementsOperator.spec.ts`

---

## Archivos a Modificar

- `core/domain/entities/types/fields.ts` - Añadir tipo `'requirements'` si se necesita en schemas
- `core/domain/levels/filtering/types.ts` - Añadir operador `'meets_requirements'`
- `core/domain/levels/filtering/filterWithVariables.ts` - Implementar operador

---

## Criterios de Aceptación

- [ ] Se puede definir campo requirements en entidades
- [ ] Se pueden evaluar requirements con variables del personaje
- [ ] El tipo `has_entity` verifica entidades por ID
- [ ] El tipo `has_entity` verifica entidades por tipo
- [ ] El tipo `has_entity` verifica con filtro dinámico
- [ ] El tipo `has_entity` verifica count mínimo
- [ ] El operador `meets_requirements` funciona en filtros
- [ ] AND implícito entre múltiples requirements
- [ ] Los resultados incluyen razones de por qué no se cumple
- [ ] Tests cubren: requirements met/unmet, has_entity por ID/tipo/filtro, con variables

---

## Dependencias

**Requiere**:
- Fase 2 completada (Conditions) ✅
- Fase 0 completada (FilterResult con variables) ✅

**Proporciona**:
- Sistema de requirements usado en Fase D (Resolución) y Fase F (CGE)

