# Fase E: Migrar Clases y Raza a EntitySelector

## Objetivo

Unificar los selectores de clases y raza para usar el sistema generico de EntitySelector creado en Fase D.

## Entregables

1. Selector de clases usando EntitySelector
2. Selector de raza usando EntitySelector
3. Eliminar ClassSelectorDetail antiguo
4. Integracion en Columna 1 (raza) y detalle de nivel (clase)

## Prerequisitos

- Fase D completada (EntitySelector funcionando)
- Sistema de providers conectado

## Pasos de Implementacion

### Paso 1: Configurar clases como entidades seleccionables

Las clases ya deberian estar definidas como entidades en el sistema. Verificar que:

1. Existen en el compendio o como entidades del sistema
2. Tienen `entityType: 'class'` o similar
3. Tienen las propiedades necesarias (name, hitDie, etc.)

Si no existen como entidades, crearlas:

**Archivo:** `packages/core/core/domain/compendiums/examples/schemas/classSchema.ts` (si no existe)

```typescript
const classSchema: EntitySchema = {
  id: 'class',
  name: 'Clase',
  fields: [
    { name: 'name', type: 'string', required: true },
    { name: 'hitDie', type: 'number', required: true },
    { name: 'skillPointsPerLevel', type: 'number' },
    { name: 'classSkills', type: 'string_array' },
    // ... otros campos
  ],
};
```

### Paso 2: Crear provider para seleccion de clase en nivel

Cada nivel necesita un provider para seleccionar su clase:

```typescript
// En la logica de niveles
const classProviderForLevel = (levelIndex: number): EntityProvider => ({
  selector: {
    id: `level-${levelIndex}-class`,
    name: 'Clase',
    entityType: 'class',
    min: 1,
    max: 1,  // Solo una clase por nivel
  },
  selectedInstanceIds: [],  // Se llena cuando el usuario elige
});
```

### Paso 3: Reemplazar ClassSelectorDetail

**Archivo a eliminar:** `components/character/editor/ClassSelectorDetail.tsx`

**Reemplazar con:** Uso de `EntitySelectorDetail` con:
- `entityType: 'class'`
- `providerLocation` apuntando al nivel correspondiente

**En LevelDetail.tsx:**

```typescript
// Antes
<Button onPress={() => navigateToDetail('classSelectorDetail', levelIndex)}>
  Seleccionar clase
</Button>

// Despues
<Button onPress={() => navigateToDetail('entitySelectorDetail', {
  providerLocation: { type: 'classLevel', classId: null, classLevel: levelIndex, selectorId: 'class' },
  entityType: 'class',
})}>
  Seleccionar clase
</Button>
```

O crear un wrapper mas simple:

```typescript
// ClassSelector.tsx - wrapper sobre EntitySelector
function ClassSelector({ levelIndex }: { levelIndex: number }) {
  return (
    <EntitySelectorDetail
      providerLocation={{
        type: 'levelSlot',
        levelIndex,
        selectorId: 'class',
      }}
      entityType="class"
    />
  );
}
```

### Paso 4: Configurar raza como entidad seleccionable

Similar a clases, asegurar que las razas estan como entidades:

**Archivo:** `packages/core/core/domain/compendiums/examples/schemas/raceSchema.ts` (si no existe)

```typescript
const raceSchema: EntitySchema = {
  id: 'race',
  name: 'Raza',
  fields: [
    { name: 'name', type: 'string', required: true },
    { name: 'size', type: 'enum', enumValues: ['Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'] },
    { name: 'baseSpeed', type: 'number' },
    { name: 'abilityModifiers', type: 'object' },
    { name: 'racialTraits', type: 'string_array' },
    // ... otros campos
  ],
};
```

### Paso 5: Crear provider para seleccion de raza

A diferencia de clases (una por nivel), raza es una sola para todo el personaje:

```typescript
// Provider de raza (a nivel de personaje)
const raceProvider: EntityProvider = {
  selector: {
    id: 'character-race',
    name: 'Raza',
    entityType: 'race',
    min: 0,  // Opcional (puede no tener raza seleccionada)
    max: 1,
  },
  selectedInstanceIds: [],
};
```

### Paso 6: Crear RaceSelector en Columna 1

**Archivo:** `components/character/editor/RaceSelector.tsx`

```typescript
function RaceSelector() {
  const baseData = useCharacterBaseData();
  const navigateToDetail = useNavigateToDetail();

  const currentRace = baseData.race;

  return (
    <YStack>
      <SectionHeader title="Raza" />

      {currentRace ? (
        <XStack alignItems="center" justifyContent="space-between">
          <Text>{currentRace.name}</Text>
          <Button onPress={() => navigateToDetail('entitySelectorDetail', {
            providerLocation: { type: 'character', selectorId: 'race' },
            entityType: 'race',
          })}>
            Cambiar
          </Button>
        </XStack>
      ) : (
        <Button onPress={() => navigateToDetail('entitySelectorDetail', {
          providerLocation: { type: 'character', selectorId: 'race' },
          entityType: 'race',
        })}>
          Seleccionar raza
        </Button>
      )}
    </YStack>
  );
}
```

### Paso 7: Integrar RaceSelector en CharacterInfoSection

**Archivo:** `components/character/editor/CharacterInfoSection.tsx` (modificar)

Anadir `RaceSelector` despues de los datos basicos:

```typescript
<YStack>
  {/* Imagen placeholder */}
  <ImagePlaceholder />

  {/* Identidad */}
  <NameInput ... />
  <DescriptionInput ... />

  {/* Raza */}
  <RaceSelector />

  {/* Alineamiento */}
  <AlignmentGrid ... />

  {/* ... resto */}
</YStack>
```

### Paso 8: Actualizar logica de guardado de raza

Cuando se selecciona una raza via EntitySelector:

1. El provider actualiza `selectedInstanceIds`
2. Un efecto/watcher detecta el cambio
3. Actualiza `baseData.race` con la entidad de raza seleccionada

O hacerlo directamente en el callback de seleccion:

```typescript
const handleRaceSelect = (raceEntity: RaceEntity) => {
  updater.setRace(raceEntity);
};
```

### Paso 9: Limpiar codigo antiguo

- Eliminar `ClassSelectorDetail.tsx`
- Eliminar cualquier logica de seleccion de clase que no use el sistema de providers
- Actualizar imports y referencias

### Paso 10: Tests de regresion

Verificar que:
- Seleccion de clase sigue funcionando en niveles
- HP se calcula correctamente al cambiar clase
- Raza se guarda y carga correctamente
- Bonificadores de raza se aplican

## Verificacion

- [ ] Selector de clase en nivel usa EntitySelector
- [ ] Selector de raza en Columna 1 funciona
- [ ] Icono de info muestra detalle de clase/raza
- [ ] Al seleccionar clase, HP se calcula
- [ ] Al seleccionar raza, bonificadores se aplican
- [ ] No hay regresiones en funcionalidad existente
- [ ] ClassSelectorDetail eliminado

## Archivos Afectados

### Nuevos
- `components/character/editor/RaceSelector.tsx`

### Modificados
- `components/character/editor/CharacterInfoSection.tsx`
- `components/character/editor/LevelDetail.tsx`
- `navigation/detailRegistry.ts`
- `screens/detail/DetailScreen.tsx`
- `screens/character/CharacterScreenDesktop.tsx`

### Eliminados
- `components/character/editor/ClassSelectorDetail.tsx`

## Notas de Migracion

### Compatibilidad de Datos

Si ya hay personajes guardados con el formato antiguo de raza/clase, asegurar:
- Migracion de datos si es necesario
- O mantener compatibilidad con ambos formatos temporalmente

### Compendios

Las clases y razas deben estar disponibles en los compendios activos del personaje. Verificar que:
- Compendio SRD incluye clases base
- Compendio SRD incluye razas base
- Sistema puede cargar entidades de tipo 'class' y 'race'

## Estimacion de Complejidad

- Media-Alta: Requiere coordinar varios sistemas (providers, entidades, UI, navegacion)
