---
name: races
description: Sistema de Razas D&D 3.5 - schemas, datos SRD, ajuste de nivel, dados de golpe raciales, aptitudes sortilegias (SLAs), variables de sistema (ECL), integracion en personaje y UI de seleccion. Consultar cuando se trabaje con razas, nivel efectivo de personaje, rasgos raciales o spell-like abilities raciales.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Grep, Glob
---

# Sistema de Razas - Resumen Ejecutivo

El sistema de razas permite seleccionar una raza para el personaje durante la creacion/edicion. La raza es una entidad del compendio (`entityType: 'race'`) que aporta modificadores de habilidad, rasgos raciales, aptitudes sortilegias, y opcionalmente ajuste de nivel y dados de golpe raciales.

## Arquitectura

### Raza como Entidad del Compendio

La raza sigue el mismo patron que las clases: es una `StandardEntity` con schema propio (`raceSchema`), se almacena en el compendio, y se selecciona con `EntitySelectionView`.

**Schemas:**
- `raceSchema` - define la estructura de la raza (size, speed, languages, LA, racial HD, providers)
- `racialTraitSchema` - rasgos raciales individuales (Darkvision, Stonecunning, etc.)
- `spellLikeAbilitySchema` - aptitudes sortilegias con CGE (dancing lights, darkness, etc.)

**Archivos de schemas:**
- `packages/core/core/domain/compendiums/examples/schemas/raceSchema.ts`
- `packages/core/core/domain/compendiums/examples/schemas/racialTraitSchema.ts`
- `packages/core/core/domain/compendiums/examples/schemas/spellLikeAbilitySchema.ts`

### Almacenamiento en Personaje

```typescript
// CharacterBaseData (packages/core/core/domain/character/baseData/character.ts)
raceEntity?: RaceEntity   // Nueva - entidad de raza con providers y selecciones
race?: Race               // Legacy - coexiste con raceEntity
```

`RaceEntity` esta en `packages/core/core/domain/levels/storage/types.ts` y sigue el patron de `ClassEntity`: contiene los datos de la raza copiados del compendio, con `levels` que tienen providers con `selectedInstanceIds` para selecciones del usuario.

### Operaciones de Raza

Archivo: `packages/core/core/domain/levels/updater/raceOperations.ts`

| Funcion | Descripcion |
|---------|-------------|
| `addRace(character, raceId, compendiumContext)` | Copia raza del compendio, resuelve providers, añade EntityInstances al pool |
| `removeRace(character)` | Elimina raceEntity y todas las instancias con origin `race:*` |
| `changeRace(character, newRaceId, compendiumContext)` | removeRace + addRace |

El patron es identico a `classOperations.ts`. Las entidades raciales se añaden al pool con origin `race:{raceId}-{level}`.

### Variables de Sistema

Archivo: `packages/core/core/domain/character/calculation/valuesIndex/valuesIndex.ts`

| Variable | Formula | Descripcion |
|----------|---------|-------------|
| `@ecl` | character level + level adjustment | Nivel Efectivo de Personaje |
| `@totalHD` | character level + racial HD | Dados de Golpe totales |
| `@racialHD` | racial HD count (0 para razas estandar) | Dados de Golpe raciales |
| `@levelAdjustment` | LA de la raza (0 si no hay) | Ajuste de Nivel |

Se computan al inicio del pipeline de calculo, antes de ability scores.

### Resolucion de Providers Raciales

Archivo: `packages/core/core/domain/levels/resolution/resolveLevelEntities.ts`

Los providers de la raza se resuelven **ANTES** que system levels y class providers (Step 0). Esto asegura que rasgos raciales como la dote bonus del humano esten disponibles desde el nivel 1.

Orden de resolucion:
1. **Race providers** (rasgos raciales, SLAs, selectores como dote bonus humana)
2. **System level providers** (dotes de nivel, incrementos de habilidad)
3. **Class level providers** (features de clase)

### Efectos Raciales

Archivo: `packages/core/core/domain/character/calculation/effects/compileEffects.ts`

`compileRaceEntityEffects()` extrae efectos del campo `effects` de `raceEntity` (modificadores de habilidad). Se compilan antes que buffs y entity effects. Usan `bonusType: 'RACIAL'`.

### Aptitudes Sortilegias (SLAs) con CGE

Las SLAs raciales usan un CGE tipo Warlock (el mas simple):
- **KnownConfig**: NONE (entidades granted por la raza, no seleccionadas)
- **ResourceConfig**: NONE (cada SLA tiene `usesPerDay` como campo propio)
- **PreparationConfig**: NONE

El patron: la raza otorga un `classFeature` con `CGE_DEFINITION` + las entidades SLA individuales via providers.

**Ejemplo gnomo** (`packages/core/srd/races/gnome/gnomeSpellLikeAbilities.ts`):
- `gnomeSLACGEConfig` define el CGE
- `gnomeSpellLikeAbilitiesTrait` es el classFeature con la definicion
- 4 SLAs individuales: dancing lights, ghost sound, prestidigitation, speak with animals

---

## Datos SRD

8 razas implementadas en `packages/core/srd/races/`:

| Raza | Mods | Size | Speed | LA | SLAs | Directorio |
|------|------|------|-------|----|------|------------|
| Human | ninguno | Medium | 30ft | 0 | - | `human/` |
| Dwarf | +2 CON, -2 CHA | Medium | 20ft | 0 | - | `dwarf/` |
| Elf | +2 DEX, -2 CON | Medium | 30ft | 0 | - | `elf/` |
| Gnome | +2 CON, -2 STR | Small | 20ft | 0 | 4 | `gnome/` |
| Half-Elf | ninguno | Medium | 30ft | 0 | - | `halfElf/` |
| Half-Orc | +2 STR, -2 INT, -2 CHA | Medium | 30ft | 0 | - | `halfOrc/` |
| Halfling | +2 DEX, -2 STR | Small | 20ft | 0 | - | `halfling/` |
| Drow | +2 DEX, +2 INT, +2 CHA, -2 CON | Medium | 30ft | +2 | 3 | `drow/` |

Cada directorio contiene:
- `{raza}Race.ts` - entidad de raza con effects y providers
- `{raza}RacialTraits.ts` - rasgos raciales como entidades `racialTrait`
- `index.ts` - exports
- (gnome/drow) `*SpellLikeAbilities.ts` - SLAs + CGE config

Referencia completa: `packages/core/srd/races/RACE_REFERENCE.md`

---

## UI

### Selector de Raza

Componente: `apps/zukus/ui/components/character/editor/RaceSelectorDetail.tsx`

Usa `EntitySelectionView` en modo `selection` con `instantSelect: true`. Cada raza muestra:
- Nombre
- Linea meta: modificadores de habilidad, tamaño, velocidad
- Badge "LA +X" si tiene level adjustment

### Integracion en Editor

**Desktop** (`EditCharacterScreenDesktop.tsx`):
- Fila de raza en `CharacterInfoSection` (columna izquierda, entre descripcion y alineamiento)
- Click abre `RaceSelectorDetail` en el SidePanel
- Providers raciales visibles en `LevelDetail` del nivel 1

**Mobile** (`EditCharacterScreenMobile.tsx`):
- Misma fila en `CharacterInfoSection` (tab Info)
- Click reemplaza contenido con `RaceSelectorDetail` + header con boton volver

**Vista de personaje** (`CharacterScreenContent.tsx`):
- Build string incluye raza: "Human Fighter 5" o "Drow Rogue 3 / Wizard 2 (LA +2)"

---

## Tests

- `packages/core/core/domain/character/calculation/valuesIndex/valuesIndex.test.ts` - 17 tests de variables de sistema
- `packages/core/core/domain/levels/__tests__/updater/raceOperations.spec.ts` - 21 tests de operaciones de raza
- `packages/core/srd/races/gnome/__tests__/gnomeSpellLikeAbilities.test.ts` - 20 tests de SLAs gnomo

---

## Mejoras Pendientes

### Deuda tecnica
- **Duplicacion desktop/mobile**: `EditCharacterScreenDesktop.tsx` y `EditCharacterScreenMobile.tsx` duplican logica de race operations, level detail resolution, y class selection. Deberia existir un unico componente responsive o al menos hooks compartidos que encapsulen la logica comun.
- **CompendiumContext tipado para razas**: `EditRaceSelectorDetailPanelContainer` construye un `RaceCompendiumContext` ad-hoc con casts. Seria mejor que el `CompendiumContext` nativo ya soporte `getRace()`.

### Funcionalidad
- **Tests de ECL en formulas**: Verificar que `@ecl` funciona correctamente dentro de formulas de efectos, CGE y calculo de character sheet. Ej: Drow con LA +2 a nivel 3 deberia tener ECL 5.
- **Mostrar ajuste de nivel**: Mejorar como se comunica el LA al usuario. Al seleccionar una raza con LA > 0, mostrar explicacion de que significa (ECL, impacto en XP, nivel efectivo vs nivel de personaje).
- **Racial HD como clase racial**: Implementar dados de golpe raciales como pseudo-clase que ocupa level slots (BAB, salvaciones, HP, skill points propios). Necesario para razas monstruosas.
- **Traducciones**: Crear translation pack para las 8 razas y 44 rasgos raciales (es).
- **Tracking de usos de SLAs**: El CGE de SLAs esta configurado pero falta la UI de tracking de usos/dia y el boton de reset (descanso largo).
- **Prerequisitos raciales en dotes**: Algunas dotes tienen como prerequisito ser de cierta raza. El sistema de filtros deberia poder filtrar por raza del personaje.
- **Bonus skill points humano**: El humano recibe 4 skill points extra a nivel 1 y 1 extra por nivel. Esto no esta implementado como efecto, necesita integrarse en el calculo de skill points.
