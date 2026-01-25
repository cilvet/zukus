# D&D 3.5e Zukus - Foundry VTT System

## Contexto del Proyecto

**Zukus** es una app movil/web para gestionar personajes D&D 3.5. El core (`@zukus/core`) contiene toda la logica de calculo, validaciones, y operaciones de personaje.

**Este modulo de Foundry** existe para que los usuarios puedan:
1. Jugar en Foundry VTT con sus personajes de Zukus
2. Tener los datos sincronizados entre la app y Foundry
3. Usar el mismo motor de calculo en ambos lugares

**La vision final**: Preparas tu personaje en Zukus (mejor UX, movil), juegas en Foundry (VTT, mapas, tokens), todo sincronizado.

---

## Decisiones Arquitectonicas

### Por que un System y no un Module?

Un Module extiende un sistema existente (como D35E). Pero queremos usar nuestro propio motor de calculo, no el de D35E. Un System nos da control total sobre el data model y los calculos.

### Por que Vite?

Foundry usa JavaScript vanilla y Handlebars. Nosotros necesitamos:
- Compilar TypeScript
- Bundlear `@zukus/core` (que es un paquete del monorepo)

Vite hace solo eso. **No hay React**. La UI es Handlebars puro.

### Por que template.json en vez de DataModels?

Foundry v12+ soporta DataModels (clases JS que definen el schema). Pero el usuario tiene Foundry v11, que requiere `template.json`. Mantenemos ambos por compatibilidad.

---

## Arquitectura

### Opcion B (IMPLEMENTADA)

```
CharacterBaseData (en actor.flags.zukus.characterBaseData)
         ↓
    calculateCharacterSheet()
         ↓
    Display en UI
         ↓
    Sync directo con Zukus API (mismo formato)
```

**Ventaja**: El CharacterBaseData es el mismo objeto que usa la app. Sync trivial.

### Por que Opcion B?

1. **El objetivo es sincronizacion** - Zukus app y Foundry comparten el mismo formato de datos.

2. **Reutilizamos ops.*** - El core tiene operaciones como `toggleBuff()`, `modifyHp()`, etc. Las usamos directamente.

3. **Consistencia de logica** - Si hay un bug o cambio en como se calcula algo, se arregla en un lugar (el core) y funciona en ambos sitios.

4. **Mantenibilidad** - Si cambia el schema de CharacterBaseData, solo hay que actualizar el core.

### Como funciona

1. **Al crear Actor**: `_onCreate()` crea un CharacterBaseData por defecto y lo guarda en `flags.zukus.characterBaseData`

2. **Al calcular**: `prepareDerivedData()` lee de flags y llama a `calculateCharacterSheet()`

3. **Al editar formulario**: `_updateObject()` intercepta los cambios y los convierte en operaciones de `@zukus/core` (ej: cambio de ability score -> `updateAbilityScore()`)

4. **Operaciones disponibles**: El ZukusActor expone metodos como `updateAbilityScore()`, `modifyHp()`, `toggleBuff()`, etc. que usan las operaciones del core.

---

## Como funciona Foundry (para contexto)

### Ciclo de vida de datos

1. Usuario edita un input en la character sheet
2. Foundry detecta el cambio y llama `Actor.update({ path: value })`
3. Foundry guarda en su IndexedDB
4. Foundry llama `Actor.prepareData()` que incluye:
   - `prepareBaseData()` - antes de embedded documents
   - `prepareEmbeddedDocuments()` - Items, ActiveEffects
   - `prepareDerivedData()` - **aqui llamamos a calculateCharacterSheet()**
5. La sheet se re-renderiza

### Donde guardamos datos

- `actor.system.*` - Datos "oficiales" del schema (definidos en template.json)
- `actor.flags.moduleName.*` - Datos arbitrarios de modulos (no requieren schema)

Opcion B usa `actor.flags.zukus.characterBaseData` porque:
- No necesita schema en template.json
- Es un objeto complejo que no encaja bien en el formato plano de Foundry
- Podemos guardarlo/leerlo tal cual

### Interceptar cambios

En Opcion A, dejamos que Foundry maneje `Actor.update()` normalmente.

En Opcion B, interceptamos en `ActorSheet._updateObject()`:
- Convertimos el cambio de formulario a una operacion de `@zukus/core`
- Aplicamos la operacion al CharacterBaseData
- Guardamos el CharacterBaseData actualizado en flags
- NO llamamos al `Actor.update()` normal para esos campos

---

## Troubleshooting

### El sistema no aparece en Foundry
- Reiniciar Foundry (no solo refresh)
- Verificar symlink: `ls -la ~/Library/Application\ Support/FoundryVTT/Data/systems/dnd35zukus`
- Debe apuntar a `dist/`, no a la raiz

### Error "template.json does not exist"
- Foundry v11 requiere template.json
- Verificar que vite.config.ts lo copia a dist/

### Ver logs de Foundry
```bash
tail -f ~/Library/Application\ Support/FoundryVTT/Logs/error.log
```

---

## Estado Actual

**Implementado**:
- [x] CharacterBaseData en `actor.flags.zukus.characterBaseData`
- [x] Crear CharacterBaseData por defecto al crear Actor
- [x] `prepareDerivedData()` lee de flags
- [x] `_updateObject()` intercepta cambios y usa ops del core
- [x] Operaciones basicas: `updateAbilityScore()`, `modifyHp()`, `toggleBuff()`
- [x] Sistema de niveles: `addClass()`, `addLevel()` con seleccion de clase
- [x] Compendio de Buffs desde @zukus/core (ver seccion abajo)

**Pendiente**:
- [ ] Implementar sync con API de Zukus
- [ ] Migrar actores existentes de Option A a Option B

---

## Sistema de Compendios

### Filosofia

El compendio de @zukus/core es la fuente de verdad. Foundry solo muestra una "vista" de ese compendio que los usuarios pueden arrastrar a los personajes. Toda la logica se ejecuta en el core.

### Como funciona

1. **Entidades en el core**: Los buffs (y otras entidades) se definen en `packages/core/core/domain/compendiums/examples/entities/buffs.ts`

2. **Poblacion del compendio Foundry**: Al iniciar (`Hooks.once('ready')`), `populateBuffsCompendium()` lee las entidades del core y crea Items de Foundry en el pack `dnd35zukus.buffs`

3. **Drop handler**: Cuando el usuario arrastra un buff del compendio al personaje, `_onDropItem()` en actor-sheet.ts:
   - Detecta que es un item tipo `buff`
   - Lee el `coreEntityId` guardado en el item
   - Llama a `zukusActor.addBuffFromEntity(coreEntityId)`
   - Esto usa `createBuffFromEntity()` y `ops.addBuff()` del core

4. **Resultado**: El buff se anade al CharacterBaseData, no como un Item embebido de Foundry. El motor de calculo del core procesa los cambios.

### Patron de entidades con changes

Las entidades del core usan el addon `effectful` que anade un campo `legacy_changes`:

```typescript
{
  id: 'buff-bulls-strength',
  entityType: 'buff',
  name: "Bull's Strength",
  legacy_changes: [
    {
      type: 'ABILITY_SCORE',
      abilityUniqueId: 'strength',
      formula: { expression: '4' },
      bonusTypeId: 'ENHANCEMENT',
    },
  ],
}
```

El codigo de Foundry lee `entity.legacy_changes || entity.changes` para obtener los cambios.

### Configuracion del pack

En `system.json`:
```json
"packs": [
  {
    "name": "buffs",
    "label": "Buffs",
    "path": "packs/buffs",
    "type": "Item",
    "system": "dnd35zukus"
  }
]
```

La carpeta `packs/buffs/` debe existir (puede estar vacia). Foundry la usara como base de datos LevelDB para los items creados en runtime.

---

## Archivos clave

- `src/documents/actor.ts` - ZukusActor con operaciones del core
- `src/sheets/actor-sheet.ts` - UI, intercepta _updateObject(), drop handler
- `src/compendium/foundry-compendium-context.ts` - Lee entidades del core, crea Buffs
- `src/dnd35zukus.ts` - Init, ready hooks, populateBuffsCompendium()
- `packages/core/core/domain/compendiums/examples/entities/buffs.ts` - Entidades de buff
