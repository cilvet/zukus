# Fase D: UI de Selector de Entidades Generico

## Objetivo

Crear los componentes de UI para seleccion de entidades, conectando con el sistema de providers existente en el core.

## Entregables

1. `EntitySelector` - Componente principal de seleccion
2. `EntityOptionRow` - Fila de opcion disponible
3. `SelectedEntityRow` - Fila de entidad seleccionada
4. `EntityInfoButton` - Boton de info para ver detalle
5. Integracion con el sistema de providers del core

## Prerequisitos

- Fase A completada (estructura basica)
- Familiaridad con el sistema de providers en `packages/core/core/domain/levels/providers/`

## Contexto: Sistema de Providers Existente

El core ya tiene:

```typescript
// packages/core/core/domain/levels/providers/types.ts
type EntityProvider<T> = {
  granted?: GrantedConfig;
  selector?: Selector;
  selectedInstanceIds?: string[];
  entities?: ResolvedEntities<T>;
};

type Selector = {
  id: string;
  name: string;
  entityType?: string;
  entityIds?: string[];
  filter?: EntityFilter;
  min: number;
  max: number;
};

// packages/core/core/domain/levels/selection/applySelection.ts
function applySelection<T>(provider, entity, allEntities, variables): ApplySelectionResult<T>

// packages/core/core/domain/levels/selection/removeSelection.ts
function removeSelection<T>(provider, instanceId): RemoveSelectionResult<T>
```

## Pasos de Implementacion

### Paso 1: Crear tipos de UI para seleccion

**Archivo:** `components/entity/types.ts`

```typescript
type EntitySelectorProps<T extends SelectableEntity> = {
  // Datos del selector
  selector: Selector;

  // Entidades disponibles (ya filtradas)
  availableEntities: FilterResult<T>[];

  // Entidades seleccionadas
  selectedEntities: T[];

  // Callbacks
  onSelect: (entity: T) => void;
  onDeselect: (instanceId: string) => void;
  onInfoPress: (entity: T) => void;

  // Estado
  selectionCount: number;
  maxSelections: number;
  minSelections: number;
};

type FilterResult<T> = {
  entity: T;
  matches: boolean;
  reasons?: string[];
};
```

### Paso 2: Crear EntityOptionRow

**Archivo:** `components/entity/EntityOptionRow.tsx`

Fila para una entidad disponible:

```typescript
type EntityOptionRowProps = {
  entity: SelectableEntity;
  isEligible: boolean;
  eligibilityReasons?: string[];
  onSelect: () => void;
  onInfoPress: () => void;
};
```

**Layout:**

```
+-----------------------------------------------+
| [Checkbox]  Nombre de la Entidad    [i]       |
|             Descripcion corta...              |
|             [No elegible: razon]              |
+-----------------------------------------------+
```

- Checkbox a la izquierda (o area clickable)
- Nombre prominente
- Descripcion de una linea (si existe)
- Icono de info [i] a la derecha
- Badge "No elegible" si `isEligible = false`
- Click en fila = seleccionar (si elegible)
- Click en [i] = ver detalle

### Paso 3: Crear SelectedEntityRow

**Archivo:** `components/entity/SelectedEntityRow.tsx`

Fila para una entidad ya seleccionada:

```typescript
type SelectedEntityRowProps = {
  entity: SelectableEntity;
  onDeselect: () => void;
  onInfoPress: () => void;
};
```

**Layout:**

```
+-----------------------------------------------+
| [X]  Nombre de la Entidad           [i]       |
|      Descripcion corta...                     |
+-----------------------------------------------+
```

- [X] Checkbox marcado (click = deseleccionar)
- Nombre
- Descripcion
- Icono de info

### Paso 4: Crear EntitySelector

**Archivo:** `components/entity/EntitySelector.tsx`

Componente principal que agrupa todo:

```typescript
function EntitySelector<T extends SelectableEntity>({
  selector,
  availableEntities,
  selectedEntities,
  onSelect,
  onDeselect,
  onInfoPress,
  selectionCount,
  maxSelections,
  minSelections,
}: EntitySelectorProps<T>) {
  return (
    <YStack>
      {/* Header con contador */}
      <XStack>
        <Text>{selector.name}</Text>
        <Text>{selectionCount}/{maxSelections}</Text>
      </XStack>

      {/* Entidades seleccionadas */}
      {selectedEntities.length > 0 && (
        <YStack>
          <SectionHeader title="Seleccionados" />
          {selectedEntities.map(entity => (
            <SelectedEntityRow
              key={entity.instanceId}
              entity={entity}
              onDeselect={() => onDeselect(entity.instanceId)}
              onInfoPress={() => onInfoPress(entity)}
            />
          ))}
        </YStack>
      )}

      {/* Entidades disponibles */}
      <YStack>
        <SectionHeader title="Opciones disponibles" />
        {availableEntities.map(({ entity, matches, reasons }) => (
          <EntityOptionRow
            key={entity.uniqueId}
            entity={entity}
            isEligible={matches}
            eligibilityReasons={reasons}
            onSelect={() => onSelect(entity)}
            onInfoPress={() => onInfoPress(entity)}
          />
        ))}
      </YStack>
    </YStack>
  );
}
```

### Paso 5: Crear hook useEntitySelector

**Archivo:** `hooks/useEntitySelector.ts`

Hook que conecta UI con logica del core:

```typescript
function useEntitySelector<T extends SelectableEntity>(
  providerLocation: ProviderLocation,
  entityType: string,
) {
  const baseData = useCharacterBaseData();
  const updater = useCharacterUpdater();

  // Obtener provider del personaje
  const provider = getProviderAtLocation(baseData, providerLocation);

  // Obtener entidades disponibles
  const allEntities = getEntitiesOfType<T>(entityType);

  // Resolver eligibilidad
  const availableEntities = resolveAvailableEntities(provider, allEntities);

  // Obtener seleccionadas
  const selectedEntities = getSelectedEntities(provider);

  const handleSelect = useCallback((entity: T) => {
    const result = applySelection(provider, entity, allEntities, {});
    if (result.success) {
      updater.updateProvider(providerLocation, result.provider);
    }
  }, [provider, allEntities, providerLocation]);

  const handleDeselect = useCallback((instanceId: string) => {
    const result = removeSelection(provider, instanceId);
    if (result.success) {
      updater.updateProvider(providerLocation, result.provider);
    }
  }, [provider, providerLocation]);

  return {
    selector: provider.selector,
    availableEntities,
    selectedEntities,
    selectionCount: selectedEntities.length,
    maxSelections: provider.selector?.max ?? 0,
    minSelections: provider.selector?.min ?? 0,
    onSelect: handleSelect,
    onDeselect: handleDeselect,
  };
}
```

### Paso 6: Crear EntitySelectorDetail (pantalla completa)

**Archivo:** `components/entity/EntitySelectorDetail.tsx`

Pantalla/panel completo para seleccion:

```typescript
type EntitySelectorDetailProps = {
  providerLocation: ProviderLocation;
  entityType: string;
};

function EntitySelectorDetail({ providerLocation, entityType }: EntitySelectorDetailProps) {
  const {
    selector,
    availableEntities,
    selectedEntities,
    onSelect,
    onDeselect,
    selectionCount,
    maxSelections,
    minSelections,
  } = useEntitySelector(providerLocation, entityType);

  const navigateToDetail = useNavigateToDetail();

  const handleInfoPress = (entity: SelectableEntity) => {
    navigateToDetail('entity', entity.uniqueId, entity.name);
  };

  return (
    <ScrollView>
      <EntitySelector
        selector={selector}
        availableEntities={availableEntities}
        selectedEntities={selectedEntities}
        onSelect={onSelect}
        onDeselect={onDeselect}
        onInfoPress={handleInfoPress}
        selectionCount={selectionCount}
        maxSelections={maxSelections}
        minSelections={minSelections}
      />
    </ScrollView>
  );
}
```

### Paso 7: Registrar en navegacion

Anadir `entitySelectorDetail` al registro de navegacion para que se pueda abrir como panel/pantalla.

### Paso 8: Crear EntityDetailPanel

**Archivo:** `components/entity/EntityDetailPanel.tsx`

Panel para ver detalle de una entidad (cuando se presiona [i]):

```typescript
type EntityDetailPanelProps = {
  entityId: string;
  entityType: string;
};

function EntityDetailPanel({ entityId, entityType }: EntityDetailPanelProps) {
  const entity = useEntity(entityId, entityType);

  return (
    <YStack>
      <Text fontSize="$6" fontWeight="bold">{entity.name}</Text>
      <Text>{entity.description}</Text>
      {/* Mostrar propiedades adicionales segun el tipo */}
    </YStack>
  );
}
```

## Verificacion

- [ ] EntitySelector renderiza correctamente
- [ ] Se pueden seleccionar entidades
- [ ] Se pueden deseleccionar entidades
- [ ] Contador de selecciones funciona
- [ ] Entidades no elegibles aparecen deshabilitadas
- [ ] Icono de info abre detalle de entidad
- [ ] Integracion con providers del core funciona

## Archivos Afectados

### Nuevos
- `components/entity/types.ts`
- `components/entity/EntitySelector.tsx`
- `components/entity/EntityOptionRow.tsx`
- `components/entity/SelectedEntityRow.tsx`
- `components/entity/EntitySelectorDetail.tsx`
- `components/entity/EntityDetailPanel.tsx`
- `components/entity/index.ts`
- `hooks/useEntitySelector.ts`

### Modificados
- `navigation/detailRegistry.ts` (anadir entitySelectorDetail)
- `screens/detail/DetailScreen.tsx` (renderizar EntitySelectorDetail)
- `screens/character/CharacterScreenDesktop.tsx` (SidePanel para EntitySelector)

## Notas de Diseno

### Reutilizacion
- Los componentes deben ser genericos para cualquier tipo de entidad
- No hardcodear logica especifica de feats, clases, etc.

### Filtrado
- Respetar `FilterResult.matches` del core
- Mostrar razones de no elegibilidad si existen

### Performance
- Virtualizar lista si hay muchas entidades
- Memoizar componentes de fila

## Estimacion de Complejidad

- Alta: Conectar UI con sistema de providers existente requiere entender bien ambos
