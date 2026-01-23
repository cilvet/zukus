# Fase C: Columna 2 - Niveles con Selector y Modal

## Objetivo

Implementar la Columna 2 completa con:
- Selector de nivel actual en la parte superior
- Lista de niveles existente
- Modal de confirmacion al cambiar nivel via bolitas

## Entregables

1. Selector de nivel actual (dropdown o similar)
2. Lista de niveles (reutilizar LevelEditor)
3. Modal de confirmacion para cambio de nivel
4. Integracion completa en ViewPager/columnas

## Prerequisitos

- Fase A completada (estructura ViewPager funcionando)

## Pasos de Implementacion

### Paso 1: Crear LevelSelectorHeader

**Archivo:** `components/character/editor/LevelSelectorHeader.tsx`

Selector simple para el nivel actual del personaje:

```typescript
type LevelSelectorHeaderProps = {
  currentLevel: number;  // 1-20
  maxConfiguredLevel: number;  // Hasta donde hay clases asignadas
  onLevelChange: (level: number) => void;
};
```

**Opciones de UI:**

**Opcion A: Dropdown/Select**
```
Nivel Actual: [ 5 v ]
              -------
              | 1   |
              | 2   |
              | 3   |
              | ... |
              -------
```

**Opcion B: Stepper con flechas**
```
Nivel Actual:  [<]  5  [>]
```

**Opcion C: Slider**
```
Nivel Actual: 5
[====o---------------] 1-20
```

**Recomendacion:** Opcion A (dropdown) por claridad y facilidad de uso.

**Comportamiento:**
- Muestra el nivel actual
- Al cambiar, actualiza `baseData.level.level`
- Limitar opciones a niveles que tienen clase asignada (o todos 1-20)

### Paso 2: Crear LevelChangeModal

**Archivo:** `components/character/editor/LevelChangeModal.tsx`

Modal de confirmacion cuando se toca una bolita:

```typescript
type LevelChangeModalProps = {
  isOpen: boolean;
  targetLevel: number;
  onConfirm: () => void;
  onCancel: () => void;
};
```

**Contenido:**

```
+----------------------------------+
|                                  |
|  Cambiar el nivel actual del     |
|  personaje a nivel {X}?          |
|                                  |
|  [Cancelar]        [Confirmar]   |
|                                  |
+----------------------------------+
```

- Titulo claro
- Botones de accion
- Cerrar con tap fuera o boton cancelar

### Paso 3: Modificar LevelProgressIndicator

**Archivo:** `components/character/editor/LevelProgressIndicator.tsx` (modificar)

Cambiar comportamiento de `onDotPress`:

```typescript
// Antes: Cambiaba nivel directamente
onDotPress={() => onLevelActivate(levelNumber)}

// Ahora: Abre modal de confirmacion
onDotPress={() => onRequestLevelChange(levelNumber)}
```

### Paso 4: Crear LevelsSection (Columna 2 completa)

**Archivo:** `components/character/editor/LevelsSection.tsx`

Componente que agrupa todo:

```typescript
type LevelsSectionProps = {
  // Props necesarias del store
};

function LevelsSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [targetLevel, setTargetLevel] = useState<number | null>(null);

  const handleRequestLevelChange = (level: number) => {
    setTargetLevel(level);
    setModalOpen(true);
  };

  const handleConfirmLevelChange = () => {
    if (targetLevel) {
      updater.setCurrentCharacterLevel(targetLevel);
    }
    setModalOpen(false);
  };

  return (
    <YStack>
      <LevelSelectorHeader
        currentLevel={currentLevel}
        onLevelChange={handleDirectLevelChange}
      />

      <LevelEditor
        onRequestLevelChange={handleRequestLevelChange}
      />

      <LevelChangeModal
        isOpen={modalOpen}
        targetLevel={targetLevel}
        onConfirm={handleConfirmLevelChange}
        onCancel={() => setModalOpen(false)}
      />
    </YStack>
  );
}
```

### Paso 5: Modificar LevelEditor

**Archivo:** `components/character/editor/LevelEditor.tsx` (modificar)

Actualizar para:
- Aceptar `onRequestLevelChange` prop en lugar de cambiar nivel directamente
- Pasar esta prop a `LevelSlotRow` y `LevelProgressIndicator`

### Paso 6: Modificar LevelSlotRow

**Archivo:** `components/character/editor/LevelSlotRow.tsx` (modificar)

Actualizar para propagar `onRequestLevelChange` a `LevelProgressIndicator`.

### Paso 7: Integrar en EditCharacterScreen

En la pantalla principal, renderizar `LevelsSection` en la Columna 2 / Pagina 2.

### Paso 8: Actualizar navegacion

Asegurar que al tocar una fila de nivel, se navega al detalle de nivel (`LevelDetail`) correctamente desde la nueva estructura.

## Verificacion

- [ ] Selector de nivel actual funciona
- [ ] Cambiar nivel via selector actualiza el personaje
- [ ] Tocar bolita abre modal de confirmacion
- [ ] Confirmar en modal cambia el nivel
- [ ] Cancelar en modal no hace nada
- [ ] Lista de niveles se ve correctamente
- [ ] Navegacion a detalle de nivel funciona
- [ ] No hay regresiones en funcionalidad existente

## Archivos Afectados

### Nuevos
- `components/character/editor/LevelSelectorHeader.tsx`
- `components/character/editor/LevelChangeModal.tsx`
- `components/character/editor/LevelsSection.tsx`

### Modificados
- `components/character/editor/LevelEditor.tsx`
- `components/character/editor/LevelSlotRow.tsx`
- `components/character/editor/LevelProgressIndicator.tsx`
- `screens/edit/EditCharacterScreen.native.tsx`
- `screens/edit/EditCharacterScreenDesktop.tsx`

## Notas de Diseno

### Modal
- Usar el sistema de modales existente si hay uno
- Si no, crear componente modal reutilizable
- Animacion suave de entrada/salida

### Selector de Nivel
- Opciones limitadas a niveles validos
- Destacar visualmente el nivel actual
- Considerar mostrar clase de cada nivel en el dropdown

## Estimacion de Complejidad

- Media: Refactoring de componentes existentes + modal nuevo
