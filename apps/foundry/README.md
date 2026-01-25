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

## Arquitectura Actual vs Objetivo

### Opcion A (implementada ahora)

```
Foundry Actor.system.* (formato Foundry)
         ↓
    Adapter convierte
         ↓
    CharacterBaseData
         ↓
    calculateCharacterSheet()
         ↓
    Display en UI
```

**Problema**: Los datos viven en formato Foundry. Para sincronizar con Zukus app, hay que convertir en ambas direcciones. Cada conversion es un punto de fallo.

### Opcion B (objetivo)

```
CharacterBaseData (en actor.flags.zukus)
         ↓
    calculateCharacterSheet()
         ↓
    Display en UI
         ↓
    Sync directo con Zukus API (mismo formato)
```

**Ventaja**: El CharacterBaseData es el mismo objeto que usa la app. Sync trivial.

### Por que elegimos Opcion B?

1. **El objetivo es sincronizacion** - Si Foundry es standalone, Opcion A basta. Pero queremos sync con la app.

2. **Reutilizamos CharacterUpdater y ops.*** - El core tiene operaciones como `toggleBuff()`, `addLevelSlot()`, etc. Con Opcion A las reimplementamos. Con Opcion B las reutilizamos.

3. **Consistencia de logica** - Si hay un bug o cambio en como se calcula algo, se arregla en un lugar (el core) y funciona en ambos sitios.

4. **Mantenibilidad** - Con Opcion A, si cambia el schema de CharacterBaseData, hay que actualizar: el adapter, el template.json, y el character-data.ts. Con Opcion B, solo el core.

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

## Proximos Pasos (Opcion B)

1. Guardar CharacterBaseData en `actor.flags.zukus.characterBaseData`
2. Crear CharacterBaseData por defecto al crear Actor (usando `buildCharacter()`)
3. En `prepareDerivedData()`, leer de flags en vez de usar adapter
4. Interceptar `_updateObject()` para mapear cambios a operaciones
5. Probar operaciones complejas (toggleBuff, addLevel)
6. Implementar sync con API de Zukus

---

## Archivos que leer para entender

- `src/documents/actor.ts` - ZukusActor, donde se llama a calculateCharacterSheet()
- `src/sheets/actor-sheet.ts` - UI y manejo de eventos
- `src/adapters/foundry-to-core.ts` - Conversion actual (a eliminar en Opcion B)
- `packages/core/core/domain/character/updater/operations/index.ts` - Operaciones disponibles
