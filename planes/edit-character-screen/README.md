# Rediseno de EditCharacterScreen

## Objetivo

Redisenar la pantalla de edicion de personaje (`EditCharacterScreen`) para que siga el mismo patron visual y de interaccion que `CharacterScreen`:

- **Mobile**: ViewPager con columnas swipeables
- **Desktop**: Columnas lado a lado con scroll horizontal

## Estructura Final

### Columna 1: Datos del Personaje

| Seccion | Contenido |
|---------|-----------|
| **Identidad** | Nombre, Descripcion (texto largo) |
| **Alineamiento** | Grid 3x3 (Caotico-Legal x Bueno-Malvado) con opcion "sin alineamiento" |
| **Datos Fisicos** | Edad, Genero, Altura, Peso, Ojos, Cabello, Piel |
| **Trasfondo** | Deidad, Historia/Background (multilinea) |
| **Raza** | Selector de entidades |
| **Imagen** | Placeholder (sin implementar inicialmente) |
| **Abilities** | Reutilizar `AbilityScoresEditor` existente |

### Columna 2: Niveles

| Seccion | Contenido |
|---------|-----------|
| **Selector de Nivel Actual** | Dropdown/selector simple arriba del todo |
| **Lista de Niveles** | 20 filas con bolitas (LevelProgressIndicator) |
| **Modal de Confirmacion** | Al tocar bolita: "Cambiar el nivel actual del personaje a nivel X?" |

## Cambios Arquitectonicos

### Selectores de Entidades

- Traer UI de selector de entidades de zukus-again
- El selector de **clases** pasara a ser un EntitySelector generico
- El selector de **raza** sera un EntitySelector
- Icono de info en cada entidad para ver detalle (click en entidad = seleccionar)

### Infraestructura Existente

El core ya tiene el sistema de providers completo:
- `EntityProvider` + `Selector` en `packages/core/core/domain/levels/providers/`
- `applySelection()`, `removeSelection()`, `validateSelector()`
- `ProviderLocation` para localizar selecciones
- Addon "providable" para entidades que otorgan otras

Solo falta conectar la UI.

## Fases de Implementacion

| Fase | Descripcion | Archivo |
|------|-------------|---------|
| A | Estructura ViewPager + Columna 1 basica | [fase-a.md](./fase-a.md) |
| B | Campos de ficha completos + placeholder imagen | [fase-b.md](./fase-b.md) |
| C | Columna 2 + selector nivel + modal confirmacion | [fase-c.md](./fase-c.md) |
| D | UI de selector de entidades generico | [fase-d.md](./fase-d.md) |
| E | Migrar clases y raza a EntitySelector | [fase-e.md](./fase-e.md) |

## Archivos Clave a Modificar/Crear

### Pantallas
- `screens/edit/EditCharacterScreen.native.tsx` - ViewPager mobile
- `screens/edit/EditCharacterScreen.web.tsx` - Wrapper web
- `screens/edit/EditCharacterScreenDesktop.tsx` - Columnas desktop

### Componentes Nuevos
- `components/character/editor/CharacterInfoSection.tsx` - Columna 1
- `components/character/editor/AlignmentGrid.tsx` - Grid 3x3
- `components/character/editor/CharacterFieldsSection.tsx` - Campos de ficha
- `components/character/editor/LevelSelectorHeader.tsx` - Selector nivel actual
- `components/character/editor/LevelChangeModal.tsx` - Modal confirmacion
- `components/entity/EntitySelector.tsx` - Selector generico
- `components/entity/EntityOptionRow.tsx` - Fila de opcion
- `components/entity/SelectedEntityRow.tsx` - Fila seleccionada

### Core (ya existente, solo conectar)
- `packages/core/core/domain/levels/providers/` - Sistema de providers
- `packages/core/core/domain/levels/selection/` - Logica de seleccion

## Dependencias Entre Fases

```
Fase A (ViewPager basico)
    |
    v
Fase B (Campos ficha) -----> Fase C (Niveles)
                                  |
                                  v
                             Fase D (EntitySelector UI)
                                  |
                                  v
                             Fase E (Migrar clases/raza)
```

Fases B y C pueden hacerse en paralelo despues de A.
Fases D y E son secuenciales y dependen de C.
