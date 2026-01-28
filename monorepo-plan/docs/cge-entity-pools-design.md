# CGE Entity Pools - Diseño Futuro

> **Estado**: Propuesta pendiente de implementación
> **Fecha**: 2026-01-28

## Problema Actual

El sistema CGE define el acceso a entidades mediante un único `accessFilter` estático en `CGEConfig`:

```typescript
type CGEConfig = {
  // ...
  accessFilter?: EntityFilter  // Filtro único y estático
}
```

### Limitaciones

1. **No extensible**: Una dote o feature no puede añadir entidades al pool de acceso
2. **Hardcoded**: El filtro se define en la configuración de clase y no cambia
3. **Sin fuentes múltiples**: No hay forma de combinar entidades de diferentes orígenes

### Casos de uso no cubiertos

- Dote que da acceso a conjuros específicos fuera de la lista de clase
- Dominio que añade conjuros de dominio al pool accesible
- Raza que concede spell-like abilities
- Item que permite lanzar un conjuro (scroll, wand)
- Prestige class que expande la lista de conjuros base

---

## Solución Propuesta: EntityProviders + Pools

### Concepto Central

En lugar de un `accessFilter` único, el CGE tendría una lista de `EntityProvider`, cada uno con su propia `Pool`:

```typescript
type EntityProvider = {
  id: string
  pool: EntityPool
  // Opcionalmente: prioridad, condiciones, etc.
}

type EntityPool = {
  id: string
  storageMode: 'reference' | 'instance'
  source: PoolSource
}

type PoolSource =
  | { type: 'FILTER', filter: EntityFilter }           // Filtro sobre compendium
  | { type: 'EXPLICIT_LIST', entityIds: string[] }     // Lista fija de IDs
  | { type: 'DYNAMIC', expression: string }            // Expresión evaluable
```

### Storage Mode

La propiedad `storageMode` determina cómo la pool gestiona las entidades:

- **`reference`**: Solo almacena IDs. Las entidades se resuelven contra el compendium en tiempo de cálculo. Ideal para pools de "acceso" donde las entidades no se modifican.

- **`instance`**: Almacena `EntityInstance` completas en el personaje. Necesario cuando las entidades tienen estado propio (metamagic aplicada, modificaciones del usuario).

### Integración con CGEConfig

```typescript
type CGEConfig = {
  id: string
  classId: string
  entityType: string
  levelPath: string

  // NUEVO: Reemplaza accessFilter
  entityProviders: EntityProvider[]

  // El resto igual...
  known?: KnownConfig
  tracks: Track[]
  variables: VariablesConfig
}
```

### Extensión Dinámica

Los effects podrían añadir providers mediante un nuevo tipo de Change:

```typescript
type AddEntityProviderChange = {
  type: 'ADD_ENTITY_PROVIDER'
  cgeId: string
  provider: EntityProvider
}

// Ejemplo: Dote "Expanded Spell List"
{
  type: 'ADD_ENTITY_PROVIDER',
  cgeId: 'wizard-spells',
  provider: {
    id: 'expanded-spell-list-feat',
    pool: {
      id: 'expanded-spells',
      storageMode: 'reference',
      source: {
        type: 'EXPLICIT_LIST',
        entityIds: ['fireball', 'lightning-bolt']
      }
    }
  }
}
```

---

## Flujo de Cálculo Propuesto

```
1. Recopilar todos los EntityProviders del CGEConfig base
2. Recopilar ADD_ENTITY_PROVIDER changes de effects activos
3. Para cada provider, resolver su pool:
   - FILTER: Aplicar filtro sobre compendium
   - EXPLICIT_LIST: Resolver IDs contra compendium
   - DYNAMIC: Evaluar expresión
4. UNION de todas las entidades resueltas = Pool de acceso final
5. Continuar con el flujo actual (known, preparation, etc.)
```

---

## Pools Básicas del Sistema

El sistema definiría pools predeterminadas:

| Pool ID | Tipo | Descripción |
|---------|------|-------------|
| `{classId}-base-access` | reference | Lista base de la clase (el actual accessFilter) |
| `{classId}-domain-access` | reference | Conjuros de dominio (Cleric/Druid) |
| `{classId}-known` | reference | Conjuros conocidos seleccionados |
| `granted-{sourceId}` | reference/instance | Concedidos por dotes/features |

---

## Consideraciones de UI

Si se implementa, la UI podría mostrar:

1. **Origen de cada entidad**: "Fireball (desde: Expanded Spell List feat)"
2. **Pools expandibles**: Agrupar entidades por pool de origen
3. **Conflictos**: Si una entidad está en múltiples pools

---

## Relación con Known y Preparaciones

### Known como Pool Especial

Los "conocidos" podrían modelarse también como una pool con límites:

```typescript
type KnownPool = EntityPool & {
  limits: KnownConfig  // UNLIMITED, LIMITED_PER_LEVEL, LIMITED_TOTAL
}
```

Esto unificaría el concepto: "conocer" = "tener en la pool de known"

### Sincronización con Slots

Para preparación BOUND, los slots referencian entidades de las pools. La validación verificaría que la entidad preparada existe en alguna pool accesible.

---

## Casos de Uso Detallados

### 1. Dote "Expanded Spell List"
```typescript
// La dote añade un provider
{
  type: 'ADD_ENTITY_PROVIDER',
  cgeId: 'sorcerer-spells',
  provider: {
    id: 'expanded-spell-list',
    pool: {
      storageMode: 'reference',
      source: {
        type: 'EXPLICIT_LIST',
        entityIds: ['haste', 'slow']  // Conjuros específicos
      }
    }
  }
}
```

### 2. Dominio de Cleric
```typescript
// El dominio "War" añade sus conjuros
{
  type: 'ADD_ENTITY_PROVIDER',
  cgeId: 'cleric-spells',
  provider: {
    id: 'war-domain-spells',
    pool: {
      storageMode: 'reference',
      source: {
        type: 'FILTER',
        filter: {
          field: 'domains',
          operator: 'contains',
          value: 'war'
        }
      }
    }
  }
}
```

### 3. Item Mágico (Scroll)
```typescript
// Un scroll añade temporalmente acceso a un conjuro
// Nota: Este caso podría necesitar un sistema diferente (items con cargas)
{
  type: 'ADD_ENTITY_PROVIDER',
  cgeId: 'wizard-spells',
  provider: {
    id: 'scroll-fireball',
    pool: {
      storageMode: 'instance',  // Instance porque tiene cargas
      source: {
        type: 'EXPLICIT_LIST',
        entityIds: ['fireball']
      }
    }
  }
}
```

---

## Decisiones Pendientes

1. **Prioridad de pools**: ¿Importa el orden? ¿Hay conflictos posibles?
2. **Persistencia**: ¿Las pools dinámicas se guardan o se recalculan?
3. **Pools para otros sistemas**: ¿Feats e inventory también usarían este modelo?
4. **Granularidad**: ¿Un provider = una pool, o un provider puede tener múltiples pools?

---

## Referencias

- `packages/core/core/domain/cge/types.ts` - Tipos actuales del CGE
- `packages/core/core/domain/levels/filtering/types.ts` - Sistema EntityFilter
- `packages/core/core/domain/character/calculation/cge/calculateCGE.ts` - Cálculo actual
