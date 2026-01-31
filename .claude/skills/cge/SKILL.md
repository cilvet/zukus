---
name: cge
description: Sistema CGE (Configuracion de Gestion de Entidades) para gestionar conjuros, maniobras, poderes e invocaciones. Consultar cuando se trabaje con clases que otorgan entidades, filtros de entidades, relaciones entity-class, o UI de seleccion de entidades.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Grep, Glob
---

# Sistema CGE (Configuracion de Gestion de Entidades)

> **Contexto**: CGE es parte del Sistema de Entidades general. Para entender la arquitectura base, el patron de almacenamiento en `character.entities`, y los principios de diseno, consulta primero la skill `entities` (`docs/01-philosophy.md` y `docs/03-storage.md`).

CGE configura como los personajes interactuan con entidades accionables: conjuros, maniobras, poderes, invocaciones, etc. Cada clase define un CGEConfig que combina varias dimensiones ortogonales (known, resource, preparation, tracks) para describir sus reglas de uso.

## Arquitectura General

```
CGEConfig (definicion en clase)
    ↓
CalculatedCGE (en CharacterSheet)
    ↓
UI (CGEKnownPanel, CGEEntitySelectPanel, etc.)
```

---

# PARTE 1: CONFIGURACION CGE

## Tipos de Known (Conocidos)

| Tipo | Descripcion | Ejemplo | knownLimits.level |
|------|-------------|---------|-------------------|
| `UNLIMITED` | Sin limite, conoce todos | Wizard spellbook | `undefined` |
| `LIMITED_PER_ENTITY_LEVEL` | X por nivel de entidad | Sorcerer (6/6/5/4...) | `0, 1, 2, 3...` |
| `LIMITED_TOTAL` | X totales de cualquier nivel | Warblade, Psion, Warlock | `-1` |

### Importante: LIMITED_TOTAL

Para `LIMITED_TOTAL`, los `knownLimits` tienen **`level: -1`**. Esto significa:
- El usuario puede aprender entidades de cualquier nivel
- **NO aplicar filtro de nivel** en la UI cuando `level < 0`
- El filtro de clase sigue siendo valido

```typescript
// En CGEEntitySelectPanel
state['level'] = slotLevel >= 0 ? slotLevel : null
```

## Tipos de Resource

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `SLOTS` | Slots por nivel | Wizard, Cleric, Sorcerer |
| `POOL` | Pool de puntos | Psion (power points) |
| `NONE` | Sin coste | Warlock (at-will), Warblade |

### ResourceConfigSlots

```typescript
resource: {
  type: 'SLOTS',
  table: { 1: [5, 3, 0, ...], 2: [5, 4, 0, ...] },  // nivel clase -> slots por nivel entidad
  bonusVariable: '@bonusSpells',  // Variable que anade bonus (opcional)
  refresh: 'daily',               // 'daily' | 'encounter' | 'manual' | 'never'
}
```

### ResourceConfigPool

```typescript
resource: {
  type: 'POOL',
  maxFormula: { expression: '@psion.powerPoints' },
  costPath: '@entity.level',  // Como calcular coste (default)
  refresh: 'daily',
}
```

## Tipos de Preparation

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| `NONE` | Sin preparacion | Sorcerer, Warlock, Psion |
| `BOUND` | Cada slot ligado a entidad | Wizard 3.5, Cleric |
| `LIST` | Lista preparada | Warblade, Spirit Shaman, Arcanist |

### PreparationConfigNone

```typescript
preparation: { type: 'NONE' }
```

Sin preparacion. El lanzador usa directamente de sus conocidos.

### PreparationConfigBound

```typescript
preparation: { type: 'BOUND' }
```

Cada slot individual se prepara con una entidad especifica. Al usar el slot, se consume. Requiere `resource.type === 'SLOTS'`.

**Estado en CGEState:**
```typescript
boundPreparations: { "base:1-0": "fireball", "base:1-1": "magic-missile" }
usedBoundSlots: { "base:1-0": true }  // Slots ya lanzados
```

### PreparationConfigList

```typescript
preparation: {
  type: 'LIST',
  structure: 'GLOBAL' | 'PER_LEVEL',
  maxFormula?: Formula,      // Para GLOBAL
  maxPerLevel?: LevelTable,  // Para PER_LEVEL
  consumeOnUse: boolean,     // true = se gasta al usar (Warblade)
  recovery?: RefreshType,    // Solo si consumeOnUse = true
}
```

#### Estructura GLOBAL

Lista unica sin separar por nivel. Ejemplo: Warblade, Wizard 5e.

```typescript
preparation: {
  type: 'LIST',
  structure: 'GLOBAL',
  maxFormula: { expression: '@warblade.readiedManeuvers' },
  consumeOnUse: true,   // Se gasta al usar
  recovery: 'manual',   // Recuperacion por accion (ej: swift action para refresh)
}
```

#### Estructura PER_LEVEL

Preparados separados por nivel de entidad. Ejemplo: Spirit Shaman, Arcanist.

```typescript
preparation: {
  type: 'LIST',
  structure: 'PER_LEVEL',
  maxPerLevel: { 1: [0, 2, 0, ...], 2: [0, 3, 1, ...] },
  consumeOnUse: false,  // Lista persiste todo el dia
}
```

## Tracks (Pistas de Uso)

La mayoria de clases tienen 1 track, pero algunas tienen varios (ej: Cleric base + dominios).

```typescript
tracks: [
  {
    id: 'base',
    label: 'Conjuros',
    resource: { type: 'SLOTS', table: {...}, refresh: 'daily' },
    preparation: { type: 'BOUND' },
  },
  {
    id: 'domain',
    label: 'Dominios',
    filter: { type: 'tag', tag: 'domain-spell' },
    resource: { type: 'SLOTS', table: {...}, refresh: 'daily' },
    preparation: { type: 'BOUND' },
  },
]
```

## Variables Config

```typescript
variables: {
  classPrefix: 'wizard.spell',     // @wizard.spell.slot.1.max
  genericPrefix: 'spell',          // @spell.slot.1.max (compartido)
  casterLevelVar: 'castingClassLevel.wizard',
}
```

---

# PARTE 2: SISTEMA DE FILTROS

## Tipos de Filtros (FilterConfig)

Definidos en `packages/core/core/domain/entities/filtering/filterConfig.ts`.

### 1. FacetFilterDef

Filtrado simple por campo de la entidad.

```typescript
{
  kind: 'facet',
  id: 'school',
  label: 'Escuela',
  facetField: 'school',      // Campo en la entidad
  multiSelect: true,          // Permite seleccionar varios (OR logic)
}
```

**Uso:**
- Disciplinas de maniobras (`discipline`)
- Escuelas de magia (`school`)
- Tipos de maniobra (`type`)
- Componentes de conjuros (`components`)

### 2. RelationFilterDef

Filtrado basado en datos de relacion enriquecidos. Tiene selector primario (clase) y secundario (nivel).

```typescript
{
  kind: 'relation',
  id: 'classLevel',
  label: 'Clase y Nivel',
  relationMapPath: 'classData.classLevels',  // Ruta al mapa en la entidad
  primary: {
    id: 'class',
    label: 'Clase',
    options: [
      { value: 'wizard', label: 'Mago' },
      { value: 'cleric', label: 'Clerigo' },
    ],
  },
  secondary: {
    id: 'level',
    label: 'Nivel',
    labelFormat: 'Nivel {value}',  // {value} se reemplaza por el valor
  },
}
```

**Como funciona:**
1. El usuario selecciona clase (primary)
2. Las opciones de nivel (secondary) se calculan dinamicamente
3. El filtro usa `applyRelationFilter()` para verificar coincidencias

### 3. FilterGroupDef

Agrupa filtros visualmente.

```typescript
{
  kind: 'group',
  id: 'spellInfo',
  label: 'Informacion',
  layout: 'row',  // 'row' | 'column'
  children: [
    { kind: 'facet', id: 'school', ... },
    { kind: 'facet', id: 'subschool', ... },
  ],
}
```

## Funciones de Filtrado

```typescript
// Verificar tipo de filtro
isFacetFilter(filter)
isRelationFilter(filter)
isFilterGroup(filter)

// Obtener opciones secundarias dinamicas
getRelationSecondaryOptions(entities, filter, primaryValue)

// Aplicar filtro de relacion
applyRelationFilter(entity, filter, primaryValue, secondaryValue)

// Crear estado inicial desde defaults
createInitialFilterState(config)
```

## Registro de FilterConfigs

```typescript
// filterConfigRegistry.ts
import { spellFilterConfig } from './configs/spellFilterConfig'
import { maneuverFilterConfig } from './configs/maneuverFilterConfig'

registerFilterConfig(spellFilterConfig)
registerFilterConfig(maneuverFilterConfig)

// Uso
const config = getFilterConfig('spell')  // Retorna spellFilterConfig
const config = getFilterConfig('maneuver')  // Retorna maneuverFilterConfig
```

---

# PARTE 3: SISTEMA DE RELACIONES

Pipeline completo para que entidades sean filtrables por clase+nivel.

## 1. Archivo de Relaciones (JSON)

Ubicacion: `packages/core/core/domain/entities/relations/__testdata__/`

```json
[
  {
    "id": "fireball--wizard",
    "entityType": "spell-class-relation",
    "fromEntityId": "fireball",
    "toEntityId": "wizard",
    "metadata": { "level": 3 }
  },
  {
    "id": "fireball--sorcerer",
    "entityType": "spell-class-relation",
    "fromEntityId": "fireball",
    "toEntityId": "sorcerer",
    "metadata": { "level": 3 }
  }
]
```

## 2. RelationFieldConfig

Define como compilar las relaciones a estructuras filtrables.

```typescript
const SPELL_CLASS_FIELD_CONFIG: RelationFieldConfig = {
  relationType: 'spell-class-relation',
  targetEntityType: 'class',
  metadataFields: [{ name: 'level', type: 'integer', required: true }],
  compile: {
    keyFormat: '{targetId}:{metadata.level}',  // wizard:3
    keysFieldName: 'classLevelKeys',           // Array de claves
    mapFieldName: 'classLevels',               // Mapa directo
    mapValueField: 'level',                    // Valor del mapa
  },
}
```

## 3. Pipeline de Enriquecimiento

```typescript
// En el loader de entidades (ej: maneuvers/index.ts)
import relationsData from '../relations/__testdata__/spell-class-relations.json'

const index = buildRelationIndex(relationsData as RelationEntity[])

export const allSpells = enrichEntitiesWithRelations(
  rawSpells,
  [{ fieldName: 'classData', config: SPELL_CLASS_FIELD_CONFIG }],
  index
)
```

## 4. Resultado: Entidad Enriquecida

```typescript
spell.classData = {
  relations: [
    { targetId: 'wizard', metadata: { level: 3 } },
    { targetId: 'sorcerer', metadata: { level: 3 } },
  ],
  classLevelKeys: ['wizard:3', 'sorcerer:3'],
  classLevels: { wizard: 3, sorcerer: 3 }
}
```

## 5. Filtrado con RelationFilter

```typescript
// El RelationFilter usa relationMapPath para acceder a classLevels
const filter: RelationFilterDef = {
  kind: 'relation',
  relationMapPath: 'classData.classLevels',
  ...
}

// applyRelationFilter verifica:
// entity.classData.classLevels[primaryValue] === secondaryValue
```

---

# PARTE 4: ELEMENTOS HARDCODEADOS EN UI

## CGEEntitySelectPanel.tsx

| Elemento | Descripcion | Problema |
|----------|-------------|----------|
| `EnrichedSpell` type | Tipo local que asume `classData` | Deberia ser generico por entityType |
| `spellFilterConfig` fallback | Usa config de spells si no hay otro | Deberia dar error o empty config |
| `SpellListItem` component | Nombre especifico para spells | Deberia ser `EntityListItem` |
| `spell` en mensajes | "No hay conjuros disponibles" | Deberia usar labels del config |
| `'spell'` entityType default | `primaryCGE?.entityType ?? 'spell'` | Deberia requerir entityType |

## Traducciones Hardcodeadas

```typescript
// Mensajes que deberian venir de labels/i18n
"Aprendiendo spell de nivel X"
"Preparando para slot de nivel X"
"No se encontraron resultados"
"resultados"
```

## SpellListItem.tsx

Componente generico pero con nombre especifico. Props son genericas:
- `id`, `name`, `description`, `levelLabel`, `image`
- Funcionaria para cualquier entidad

---

# PARTE 5: SCHEMAS DE ENTIDAD

## EnumOption usa `name`, NO `label`

```typescript
// CORRECTO (schema de Zod)
{ value: 'strike', name: 'Strike' }

// INCORRECTO - Error de tipo
{ value: 'strike', label: 'Strike' }
```

## Tipos Extendidos para Campos Extra

```typescript
type ManeuverEntity = StandardEntity & {
  level: number
  discipline: string
  type: string
  initiationAction?: string
}

type EnrichedManeuver = ManeuverEntity & {
  classData: {
    relations: Array<{ targetId: string; metadata: { level: number } }>
    classLevelKeys: string[]
    classLevels: Record<string, number>
  }
}
```

---

# PARTE 6: FLUJO COMPLETO

## Anadir Nueva Entidad CGE

1. **Crear schema** en `compendiums/examples/schemas/`
2. **Crear entidades** en `compendiums/examples/entities/`
3. **Crear relaciones JSON** en `entities/relations/__testdata/`
4. **Crear tipo enriquecido** con loader y enrichment
5. **Crear FilterConfig** en `filtering/configs/`
6. **Registrar** en filterConfigRegistry
7. **Exportar** desde los index correspondientes
8. **Anadir al compendium** en dnd35ExampleContext.ts

---

# PARTE 7: CLASES DE PRUEBA

| Clase | Known | Resource | Preparation |
|-------|-------|----------|-------------|
| Sorcerer | LIMITED_PER_ENTITY_LEVEL | SLOTS | NONE |
| Wizard | UNLIMITED | SLOTS | BOUND |
| Cleric | UNLIMITED | SLOTS | BOUND |
| Warblade | LIMITED_TOTAL | NONE | LIST GLOBAL + consume |
| Psion | LIMITED_TOTAL | POOL | NONE |
| Warlock | LIMITED_TOTAL | NONE | NONE |
| Spirit Shaman | (sin known config) | SLOTS | LIST PER_LEVEL |
| Arcanist | UNLIMITED | SLOTS | LIST PER_LEVEL |
| Wizard5e | UNLIMITED | SLOTS | LIST GLOBAL |

---

# PARTE 8: ARCHIVOS CLAVE

| Archivo | Proposito |
|---------|-----------|
| `cge/types.ts` | Tipos CGEConfig, CalculatedCGE, etc. |
| `cge/calculateCGE.ts` | Calcula CGE desde config |
| `cge/knownOperations.ts` | Add/remove known entities |
| `filtering/filterConfig.ts` | Tipos de filtros y helpers |
| `filtering/filterConfigRegistry.ts` | Registro de filtros por entityType |
| `relations/compiler.ts` | buildRelationIndex, enrichEntitiesWithRelations |
| `CGEEntitySelectPanel.tsx` | UI para seleccionar entidades |
| `CGEKnownPanel.tsx` | UI para gestionar conocidos |
| `CGEManagementPanel.tsx` | Panel principal de gestion |

---

# PARTE 9: ERRORES COMUNES

1. **Filtro no encuentra entidades**: Verificar que las relaciones existen y el FilterConfig usa `relationMapPath` correcto

2. **Level -1 no filtra**: Para LIMITED_TOTAL, no aplicar filtro de nivel cuando `level < 0`

3. **EnumOption error de tipo**: Usar `name` en lugar de `label`

4. **FilterConfig no registrado**: Verificar que esta en filterConfigRegistry.ts

5. **Entidad sin classData**: Las relaciones no se han cargado o el enrichment no se ejecuto

6. **Secondary options vacias**: El primary value no tiene entidades relacionadas

---

# PARTE 10: VALIDACIONES DE CONFIG

CGE valida coherencia de configuracion:

```typescript
validateCGEConfig(config)  // Retorna array de errores

// Reglas:
// - BOUND requiere SLOTS
// - consumeOnUse sin recovery es error
// - LIST GLOBAL requiere maxFormula
// - LIST PER_LEVEL requiere maxPerLevel
```
