# Modos y Consumidores Reales

## Modo Dropdown: ItemBrowserPanel

**Archivo**: `apps/zukus/components/character/panels/ItemBrowserPanel.tsx`

**Caso de uso**: El jugador navega el compendio de items y los agrega a su inventario (gratis o comprando).

```typescript
const modeConfig: ModeConfig = {
  mode: 'dropdown',
  buttonLabel: 'Anadir',
  buttonIcon: 'plus',
  groups: [
    {
      label: 'Gratis',
      actions: [{ id: 'add', label: 'Anadir al inventario', icon: 'box-open' }],
    },
    {
      label: 'Comercio',
      actions: [{ id: 'buy', label: 'Comprar', icon: 'coins' }],
    },
  ],
  handlers: {
    onExecute: (actionId, entityId) => {
      if (actionId === 'add') {
        // addItemToInventory(character, entityId)
        return { success: true, toastMessage: `${item.name} anadido` }
      }
      if (actionId === 'buy') {
        // spendCurrency + addItemToInventory
        return { success: true, toastMessage: `${item.name} comprado por ${cost}` }
      }
      return { success: false }
    },
    getActionState: (actionId, entityId) => {
      if (actionId === 'buy') {
        const cost = formatCost(item.cost)
        return {
          subtext: cost ?? 'Sin precio',
          disabled: !canAfford(character, item.cost),
        }
      }
      return {}
    },
  },
}

<EntitySelectionView
  entities={allItems}
  modeConfig={modeConfig}
  filterConfig={itemFilterConfig}
  initialFilterOverrides={getInitialFilterOverrides(defaultEntityTypes)}
  onEntityPress={handleItemPress}
  getMetaLine={(item) => `${typeLabel} | ${weight} lb | ${cost}`}
  searchPlaceholder="Buscar items..."
  resultLabelSingular="item"
  resultLabelPlural="items"
/>
```

**Puntos clave**:
- `itemFilterConfig` tiene filtro `entityType` (multi-tipo: weapon, armor, shield...) + facets (slot, tags)
- `getActionState` devuelve precio como subtext y disabled si no puede pagar
- `getMetaLine` genera linea de metadata con tipo, peso y coste
- `initialFilterOverrides` pre-selecciona tipos si viene de un contexto especifico

---

## Modo Counter: CGEEntitySelectPanel

**Archivo**: `apps/zukus/components/character/panels/CGEEntitySelectPanel.tsx`

**Caso de uso**: El jugador prepara/aprende conjuros o maniobras para un slot de nivel especifico.

```typescript
const modeConfig: ModeConfig = {
  mode: 'counter',
  action: {
    id: mode === 'prepare' ? 'prepare' : 'learn',
    label: mode === 'prepare' ? 'Preparar' : 'Aprender',
    icon: 'check',
  },
  handlers: {
    onExecute: (actionId, entityId) => {
      if (mode === 'prepare') {
        // prepareEntityForCGE(character, cgeId, level, slotIndex, entityId)
      } else {
        // addKnownForCGE(character, cgeId, entityId)
      }
      return { success: true }
    },
    getProgress: () => calculateSlotProgress(primaryCGE, slotLevel),
    getProgressLabel: () => `${current} de ${max} ${mode === 'prepare' ? 'preparados' : 'aprendidos'}`,
    onComplete: closePanel,
  },
  closeOnComplete: true,
}

<EntitySelectionView
  entities={allSpells}
  modeConfig={modeConfig}
  filterConfig={getFilterConfig(entityType)}   // spellFilterConfig o maneuverFilterConfig
  initialFilterOverrides={{ class: selectedClass, level: slotLevel }}
  onEntityPress={handleSpellPress}
  getBadge={(spell) => `Nv ${spell.classData.classLevels[selectedClass]}`}
  filterContextContent={<InfoBox>Nivel {slotLevel} de {className}</InfoBox>}
/>
```

**Puntos clave**:
- `filterConfig` viene del registry (`getFilterConfig('spell')` o `getFilterConfig('maneuver')`)
- `initialFilterOverrides` pre-selecciona clase y nivel del slot
- `getBadge` muestra el nivel del conjuro para la clase seleccionada
- `getProgress` / `getProgressLabel` alimentan el `CounterBar`
- `onComplete` cierra el panel cuando todos los slots estan llenos

---

## Modo Selection: EntitySelectorDetail

**Archivo**: `apps/zukus/ui/components/EntityProvider/EntitySelectorDetail.tsx`

**Caso de uso**: El jugador elige dotes, habilidades de clase o subidas de atributo al subir de nivel.

```typescript
function EntitySelectorContent({ provider, providerLocation, ... }) {
  const {
    selectedEntities,
    eligibleEntities,
    selectEntity,
    deselectEntity,
    selector,
    ...
  } = useProviderSelection({ provider, providerLocation, character, onCharacterChange, variables })

  const entities = eligibleEntities.map(fr => fr.entity)

  return (
    <EntitySelectionView
      entities={entities}
      modeConfig={{
        mode: 'selection',
        selectedEntities,
        eligibleEntities,
        onSelect: selectEntity,
        onDeselect: deselectEntity,
        min: selector.min,
        max: selector.max,
        selectionLabel: selector.name,
      }}
      onEntityPress={(entity) => navigateToDetail('customEntityDetail', entity.id, entity.name)}
    />
  )
}
```

**Puntos clave**:
- `useProviderSelection` resuelve entidades elegibles y gestiona seleccion/deseleccion
- `eligibleEntities` es `FilterResult[]` - cada entidad tiene `matches: boolean` para elegibilidad
- Entidades con `matches: false` se muestran pero deshabilitadas con badge "No elegible"
- `selectedEntities` son `EntityInstance[]` con `instanceId` unico
- `onDeselect` recibe `instanceId` (no `entityId`) porque puede haber duplicados
- No se pasa `filterConfig` (aun), podria anadirse en el futuro para dotes

### Hook useProviderSelection

```typescript
const {
  grantedEntities,      // Entidades auto-concedidas
  selectedEntities,     // EntityInstance[] ya seleccionadas por el usuario
  eligibleEntities,     // FilterResult<StandardEntity>[] opciones con elegibilidad
  selectEntity,         // (entityId: string) => void
  deselectEntity,       // (instanceId: string) => void
  selector,             // Definicion del selector (name, min, max, entityType...)
  selectionCount,       // Cuantas seleccionadas
  minSelections,
  maxSelections,
  canSelectMore,        // selectionCount < maxSelections
  validation,           // { isValid, errors[], warnings[] }
} = useProviderSelection({ provider, providerLocation, character, onCharacterChange, variables })
```

### ProviderLocation

Union discriminada que localiza un provider dentro del personaje:

```typescript
type ProviderLocation =
  | { type: 'classLevel', classId: string, classLevel: number, providerIndex: number }
  | { type: 'systemLevel', characterLevel: number, providerIndex: number }
  | { type: 'entity', parentInstanceId: string, providerIndex: number }
```

### Selector

Define las reglas de la seleccion:

```typescript
type Selector = {
  id: string            // Identificador unico
  name: string          // Nombre para UI ("Dote de Combate Bonus")
  entityType?: string   // Tipo de entidad (buscar en compendio)
  entityIds?: string[]  // Lista cerrada de IDs elegibles
  filter?: EntityFilter // Filtro de elegibilidad
  min: number           // Selecciones minimas
  max: number           // Selecciones maximas
}
```
