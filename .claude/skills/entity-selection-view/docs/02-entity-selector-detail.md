# EntitySelectorDetail - Documentacion Detallada

## Estructura del Componente

```
EntitySelectorDetail
├── Validacion: baseData, provider, selector existen
└── EntitySelectorContent
    ├── Header: nombre del selector + badge (selectionCount/max)
    ├── Validation errors (si !isValid)
    ├── Seccion "Seleccionados"
    │   └── SelectedEntityRow (por cada seleccionada)
    │       ├── Checkbox checked
    │       ├── Nombre + descripcion
    │       └── Click -> deselect
    ├── Seccion "Opciones disponibles"
    │   └── EntityOptionRow (por cada elegible no seleccionada)
    │       ├── Checkbox (si max > 1)
    │       ├── Nombre + descripcion
    │       ├── Badge de elegibilidad (si hay inelegibles con policy permissive)
    │       └── Boton info -> navega a detalle
    └── Empty state
```

## Flujo Completo de Datos

### 1. Definicion del Provider (en datos de clase/sistema)

Los providers se definen en los datos estaticos de clase o sistema. Ejemplo simplificado:

```typescript
// En la definicion de nivel 1 de Fighter:
{
  levels: {
    1: {
      providers: [
        {
          // Auto-concede "Bonus Feat" (competencia con armas marciales)
          granted: { specificIds: ['martial-weapon-proficiency'] },
        },
        {
          // El jugador elige 1 dote bonus de combate
          selector: {
            id: 'bonus-feat',
            name: 'Dote de Combate Bonus',
            entityType: 'feat',
            filter: { field: 'featType', operator: 'includes', value: 'combat' },
            min: 1,
            max: 1,
          },
        },
      ],
    },
  },
}
```

### 2. Resolucion del Provider

`resolveProvider()` en `packages/core/core/domain/levels/providers/resolveProvider.ts`:

1. **Granted**: Busca entidades por `specificIds` y/o aplica `filter` sobre todas las entidades del tipo
2. **Selector**: Resuelve entidades elegibles por:
   - `entityIds`: Lista cerrada de IDs (ej: "elige entre estas 3 opciones")
   - `entityType`: Todas las entidades de ese tipo del compendio
   - `filter`: Filtro adicional aplicado sobre las anteriores
3. Retorna `ProviderResolutionResult` con `FilterResult<T>[]` que incluye `entity` + `matches` (booleano de elegibilidad)

### 3. Hook useProviderSelection

**Ubicacion**: `apps/zukus/ui/components/EntityProvider/useProviderSelection.ts`

El hook orquesta todo el ciclo de seleccion:

```
useProviderSelection
├── Fetch: compendium.getAllEntities(entityType)
├── Resolve: resolveProvider(provider, allEntities, getEntityById, variables)
├── Selected: getSelectedEntityInstances(character, providerLocation)
├── Actions:
│   ├── selectEntity(entityId) -> selectEntityInProvider()
│   └── deselectEntity(instanceId) -> deselectEntityFromProvider()
└── State: selectionCount, canSelectMore, validation
```

### 4. Seleccion de Entidad (core)

`selectEntityInProvider()` en `packages/core/core/domain/levels/updater/entitySelectionApi.ts`:

1. Genera `instanceId` unico (ej: `"power-attack@fighter-1-bonus-feat"`)
2. Genera `origin` (ej: `"classLevel:fighter-1"`)
3. Crea `EntityInstance` con la entidad resuelta
4. Agrega la instancia al pool central `character.entities[entityType]`
5. Agrega el `instanceId` a `provider.selectedInstanceIds`
6. Retorna el character actualizado

`deselectEntityFromProvider()`:
1. Elimina el `instanceId` de `provider.selectedInstanceIds`
2. Elimina la `EntityInstance` del pool central
3. Cascade: si la entidad tenia sub-providers con selecciones, las elimina tambien

### 5. ProviderLocation: Como Localizar un Provider

```typescript
// Provider del nivel 1 de Fighter, primer provider (indice 0):
{ type: 'classLevel', classId: 'fighter', classLevel: 1, providerIndex: 0 }

// Provider de sistema del nivel 3 del personaje, primer provider:
{ type: 'systemLevel', characterLevel: 3, providerIndex: 0 }

// Sub-provider de otra entidad seleccionada:
{ type: 'entity', parentInstanceId: 'some-feat@fighter-1-feat', providerIndex: 0 }
```

## EntityFilter: Filtrado de Elegibilidad

Los filtros del selector usan `EntityFilter` (definido en `packages/core/core/domain/levels/filtering/types.ts`):

```typescript
type EntityFilter = {
  field: string              // campo de la entidad
  operator: 'eq' | 'neq' | 'includes' | 'not_includes' | 'gt' | 'lt' | 'gte' | 'lte'
  value: unknown             // valor a comparar
  policy?: 'strict' | 'permissive'  // strict=excluir, permissive=mostrar pero inelegible
}
```

Con `policy: 'permissive'`, las entidades que no pasan el filtro se muestran pero con un badge de "inelegible" y deshabilitadas. Esto permite al usuario ver que existe la opcion aunque no pueda seleccionarla.

## Variables de Sustitucion

El `EntitySelectorDetail` acepta `variables?: Record<string, number>` que se pasan al resolver filtros. Util cuando el filtro depende de valores del personaje:

```typescript
// Ejemplo: "Elige un conjuro de nivel <= tu nivel de lanzador / 2"
filter: { field: 'level', operator: 'lte', value: '$casterLevel' }
// variables: { casterLevel: 5 } -> filtra level <= 2
```

## Integracion con Level Detail

### LevelDetailContainer

**Ubicacion**: `apps/zukus/screens/character/desktop-new/panels/LevelDetailContainer.tsx`

Resuelve providers para el nivel seleccionado:

1. Obtiene `systemLevelsEntity` y `classEntity` del compendio
2. Para cada provider de clase (`classEntity.levels[classLevel].providers`):
   - Resuelve granted + selected entities
   - Construye `ProviderLocation` tipo `classLevel`
3. Para cada provider de sistema (`systemLevelsEntity.levels[charLevel].providers`):
   - Resuelve granted + selected entities
   - Construye `ProviderLocation` tipo `systemLevel`
4. Renderiza `LevelDetail` con arrays de `ProviderWithResolution`

### Navegacion al Selector

Al pulsar un selector en `ProviderSummaryRow`:
1. Se serializa `ProviderLocation` a JSON
2. Se navega a panel `entitySelectorDetail` con el JSON como parametro
3. `EntitySelectorContainer` parsea el JSON y renderiza `EntitySelectorDetail`

## Componentes de Fila

### EntityOptionRow

- Muestra checkbox (si max > 1), nombre, descripcion truncada
- Badge de elegibilidad rojo si `!filterResult.matches`
- Boton (i) para navegar al detalle de la entidad
- `disabled` si no puede seleccionar mas o no es elegible

### SelectedEntityRow

- Checkbox marcado en verde
- Nombre + descripcion
- Click en checkbox -> deselect
- Click en fila -> info de la entidad

### ProviderSummaryRow

Vista compacta para el level detail:
- Granted: fila simple con nombre + chevron (navega a detalle)
- Selector: nombre + badge `selectionCount/max` (verde si completo, amarillo si pendiente)
- Selected bajo selector: lista indentada con barra vertical de nesting
