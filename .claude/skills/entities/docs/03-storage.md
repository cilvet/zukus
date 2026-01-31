# Almacenamiento de Entidades en el Personaje

## Pool Central: character.entities

**Ubicacion**: `packages/core/core/domain/character/baseData/character.ts`

```typescript
type CharacterBaseData = {
  // ... otros campos ...

  /**
   * Pool central de instancias de entidades.
   * Organizado por entityType.
   * Cada entidad tiene instanceId, applicable, y origin.
   */
  entities?: Record<string, EntityInstance[]>;
}
```

Este es el repositorio central donde se almacenan TODAS las entidades del personaje.

## EntityInstance

**Ubicacion**: `packages/core/core/domain/levels/storage/types.ts`

```typescript
type EntityInstance = {
  /**
   * Identificador unico para esta instancia.
   * Formato: "{entityId}@{origin-path}"
   *
   * Ejemplos:
   * - "sneak-attack-1d6@rogue-1" - otorgado en rogue nivel 1
   * - "combat-trick@rogue-2-rogue-talent" - seleccionado en talent
   * - "magic-missile@cge:sorcerer-spells" - spell de CGE
   * - "longsword-1@inventory" - item de inventario
   */
  instanceId: string;

  /**
   * La entidad completa resuelta del compendium.
   * Contiene id, name, entityType, effects, etc.
   */
  entity: StandardEntity;

  /**
   * Si esta instancia esta activa/aplicable.
   * Se calcula durante la resolucion de niveles.
   * Entidades con applicable: false estan en el pool
   * pero no contribuyen changes.
   */
  applicable: boolean;

  /**
   * De donde vino esta entidad.
   * Formatos:
   * - "classLevel:rogue-2" - de un nivel de clase
   * - "characterLevel:4" - de nivel de personaje (feat)
   * - "cge:sorcerer-spells" - de CGE
   * - "inventory" - del inventario
   * - "custom" - creada por usuario
   */
  origin: string;
};
```

## Patron: Pool Central + Access Indices

El sistema usa un patron donde:
1. El **pool central** (`character.entities`) almacena las entidades completas
2. Los **access indices** permiten busquedas rapidas sin duplicar datos

```
character.entities                    Pool Central
    Record<entityType, EntityInstance[]>

character.cgeState.knownSelections    Access Index (CGE)
    Record<level, entityId[]>

character.inventoryState.items        Access Index (Inventory)
    InventoryItemInstance[]

character.classEntities[].levels[].providers[].selectedInstanceIds
                                      Access Index (Levels)
```

### Ejemplo: CGE

```typescript
// Pool central - entidades completas
character.entities = {
  spell: [
    {
      instanceId: "magic-missile@cge:sorcerer-spells",
      entity: { id: "magic-missile", name: "Magic Missile", level: 1, ... },
      applicable: true,
      origin: "cge:sorcerer-spells"
    }
  ]
}

// Access index - solo IDs para busqueda rapida
character.cgeState["sorcerer-spells"].knownSelections = {
  "0": ["prestidigitation"],
  "1": ["magic-missile", "mage-armor"]
}
```

### Ejemplo: Inventory

```typescript
// Pool central
character.entities = {
  weapon: [
    {
      instanceId: "longsword-1@inventory",
      entity: { id: "longsword-keen", name: "Keen Longsword", critRange: 17, ... },
      applicable: true,
      origin: "inventory"
    }
  ]
}

// Access index - IDs + instanceValues
character.inventoryState.items = [
  {
    instanceId: "longsword-1",
    itemId: "longsword-keen",
    entityType: "weapon",
    quantity: 1,
    instanceValues: { equipped: true, wielded: true }
  }
]
```

## Flujo de Resolucion

**Ubicacion**: `packages/core/core/domain/levels/resolution/resolveLevelEntities.ts`

### Paso 1: Reset applicable

```typescript
function resetApplicability(entities) {
  for (const [entityType, instances] of Object.entries(entities)) {
    result[entityType] = instances.map(instance => {
      // Custom entities siempre applicable
      if (instance.origin === 'custom') {
        return { ...instance, applicable: true };
      }
      return { ...instance, applicable: false };
    });
  }
}
```

### Paso 2: Caminar por niveles

```typescript
for (let i = 0; i < effectiveSlotCount; i++) {
  const slot = levelSlots[i];
  const currentLevel = i + 1;

  // Procesar system-level providers (feats, ability increases)
  if (systemLevels?.levels[currentLevel]) {
    processProviders(systemLevels.levels[currentLevel].providers);
  }

  // Procesar class-level providers
  if (slot.classId) {
    const classEntity = character.classEntities[slot.classId];
    processProviders(classEntity.levels[classLevel].providers);
  }
}
```

### Paso 3: Marcar applicable

Cada entidad que corresponde a un provider activo se marca `applicable: true`.

## Compilacion a Changes

**Ubicacion**: `packages/core/core/domain/character/calculation/entities/compileCharacterEntities.ts`

```typescript
function compileCharacterEntities(baseData) {
  const result = { computedEntities: [], changes: [], ... };

  // Solo compilar entidades con applicable: true
  for (const [entityType, instances] of Object.entries(baseData.entities)) {
    for (const instance of instances) {
      if (!instance.applicable) {
        continue;  // SKIP
      }

      compileEntity(instance.entity, result);
    }
  }

  return result;
}
```

Solo las entidades con `applicable: true` contribuyen al CharacterSheet.

## Anadir Entidades al Pool

### Desde CGE

```typescript
import { addKnownEntity } from '@zukus/core';

const result = addKnownEntity(character, "sorcerer-spells", spellEntity, level);
// Crea EntityInstance y la anade a character.entities
// Tambien actualiza cgeState.knownSelections
```

### Desde Inventory

```typescript
import { addItem } from '@zukus/core';

const result = addItem(inventoryState, {
  itemId: 'longsword-keen',
  entityType: 'weapon',
  entity: resolvedEntity  // Ya resuelto con propiedades
});
// Anade a inventoryState.items
// Debe tambien anadirse a character.entities
```

### Custom (usuario)

```typescript
const customInstance: EntityInstance = {
  instanceId: `${entityId}@custom`,
  entity: customEntity,
  applicable: true,
  origin: 'custom'
};

character.entities[entityType].push(customInstance);
```

## instanceId como Trazabilidad

El formato del instanceId codifica toda la jerarquia:

```
sneak-attack-1d6@rogue-1
    |            |
    entityId     origin (clase rogue, nivel 1)

combat-trick@rogue-2-rogue-talent
    |            |
    entityId     origin (rogue nivel 2, del talent)

power-attack@combat-trick@rogue-2-rogue-talent-combat-feat
    |            |
    entityId     origin anidado (dote dentro de talent)
```

Esto permite:
- Rastrear donde vino cada entidad
- Limpiar entidades cuando se remueve una clase/nivel
- Evitar duplicados

## Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `character/baseData/character.ts` | Define entities pool |
| `levels/storage/types.ts` | EntityInstance |
| `levels/resolution/resolveLevelEntities.ts` | Marca applicable |
| `character/calculation/entities/compileCharacterEntities.ts` | Compila a changes |
| `cge/knownOperations.ts` | Anade desde CGE |
| `inventory/itemOperations.ts` | Anade desde inventory |

## Siguiente

Ver `04-cge.md` para el sistema de Class Granted Entities.
