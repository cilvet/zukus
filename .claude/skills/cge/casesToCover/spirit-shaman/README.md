# Spirit Shaman - Spellcasting

## CGE Pattern: Full List Access + SLOTS + LIST PER_LEVEL

## Estado: Parcialmente implementado

La configuracion CGE esta definida, pero las operaciones de preparacion LIST estan pendientes de implementacion.

---

## Resumen Mecanico

El Spirit Shaman es un hibrido unico:
- Accede a toda la lista de spirit shaman (via `accessFilter`)
- Sin `known` definido = acceso completo a la lista filtrada
- Cada dia, "recupera" (retrieves) una lista de conjuros accesibles por nivel
- Lanza espontaneamente de esa lista diaria (no consume la preparacion)

---

## Configuracion CGE Real

Ubicacion: `packages/core/testClasses/spiritShaman/spiritShamanClassFeatures.ts`

```typescript
const spiritShamanCGEConfig: CGEConfig = {
  id: 'spirit-shaman-spells',
  classId: 'spirit-shaman',
  entityType: 'spell',
  levelPath: '@entity.levels.spiritShaman',

  // No known config: full access to spirit shaman spell list
  // (similar a Cleric/Druid)

  tracks: [
    {
      id: 'base',
      label: 'spell_slots',
      resource: {
        type: 'SLOTS',
        table: SPIRIT_SHAMAN_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      preparation: {
        type: 'LIST',
        structure: 'PER_LEVEL',
        maxPerLevel: SPIRIT_SHAMAN_SLOTS_TABLE, // Same as slots
        consumeOnUse: false, // Cast any retrieved spell with any slot of that level
      },
    },
  ],

  variables: {
    classPrefix: 'spiritShaman.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.spiritShaman',
  },

  labels: {
    prepared: 'retrieved_spells',
    slot: 'spell_slot',
    action: 'cast',
  },
}
```

---

## Distincion Critica: Dos Recursos Separados

El Spirit Shaman tiene DOS limites independientes que usan la MISMA tabla:

### 1. Limite de Preparacion (`preparation.maxPerLevel`)
- Cuantos conjuros puede PREPARAR (recuperar) por nivel cada dia
- Definido en `preparation.maxPerLevel: SPIRIT_SHAMAN_SLOTS_TABLE`
- Ejemplo: nivel 1 de clase puede preparar 3 conjuros de nivel 1

### 2. Slots de Lanzamiento (`resource.table`)
- Cuantas veces puede LANZAR por nivel de conjuro
- Definido en `resource.table: SPIRIT_SHAMAN_SLOTS_TABLE`
- Ejemplo: nivel 1 de clase tiene 3 slots de nivel 1

En el Spirit Shaman, ambas tablas son identicas, pero conceptualmente son recursos diferentes:
- Preparacion: "Que conjuros tengo disponibles hoy"
- Slots: "Cuantas veces puedo lanzar conjuros de este nivel"

---

## Comparacion con Otras Clases

| Aspecto | Spirit Shaman | Cleric | Sorcerer |
|---------|---------------|--------|----------|
| known | undefined (lista completa) | undefined (lista completa) | LIMITED_PER_ENTITY_LEVEL |
| resource.type | SLOTS | SLOTS | SLOTS |
| preparation.type | LIST | BOUND | NONE |
| preparation.structure | PER_LEVEL | - | - |
| consumeOnUse | false | - | - |

Spirit Shaman es similar a Cleric en acceso, pero difiere en preparacion:
- Cleric: BOUND (cada slot = 1 conjuro fijo)
- Spirit Shaman: LIST PER_LEVEL con consumeOnUse=false (lista de opciones por nivel)

---

## Flujo de Uso

### Al Inicio del Dia (Preparacion)
1. El Spirit Shaman medita 1 hora
2. Para cada nivel de conjuro, selecciona X conjuros de la lista (X = maxPerLevel)
3. Estos conjuros se guardan en `CGEState.listPreparations`

### Durante el Dia (Lanzamiento)
1. El Spirit Shaman puede lanzar CUALQUIER conjuro de su lista preparada de ese nivel
2. Al lanzar, consume 1 slot del nivel apropiado
3. El conjuro NO se consume de la lista (consumeOnUse: false)
4. Puede lanzar el mismo conjuro multiples veces si tiene slots

### Ejemplo Concreto
- Spirit Shaman nivel 1: 3 slots de nivel 1, puede preparar 3 conjuros de nivel 1
- Prepara: Cure Light Wounds, Entangle, Faerie Fire
- Durante el dia puede lanzar:
  - Cure Light Wounds (usa 1 slot) -> quedan 2 slots
  - Cure Light Wounds (usa 1 slot) -> queda 1 slot
  - Entangle (usa 1 slot) -> 0 slots
- Siempre podia elegir cualquiera de los 3 preparados

---

## Estado de Implementacion

### Implementado
- [x] CGEConfig definido en `spiritShamanClassFeatures.ts`
- [x] Tabla de slots definida
- [x] Clase Spirit Shaman con spellcasting feature
- [x] Calculo de slots (resourceType: SLOTS funciona)

### Pendiente (LIST operations)
- [ ] UI para seleccionar conjuros a preparar (listPreparations)
- [ ] Logica para guardar/cargar listPreparations en CGEState
- [ ] Validacion de maxPerLevel al preparar
- [ ] UI que muestre lista preparada vs slots disponibles
- [ ] Logica de lanzamiento que verifique el conjuro esta en listPreparations

---

## Archivos Relevantes

| Archivo | Contenido |
|---------|-----------|
| `packages/core/testClasses/spiritShaman/spiritShamanClass.ts` | Entidad de clase |
| `packages/core/testClasses/spiritShaman/spiritShamanClassFeatures.ts` | CGEConfig + class features |
| `packages/core/core/domain/cge/types.ts` | Tipos CGE (PreparationConfigList) |
| `packages/core/core/domain/cge/examples.ts` | Ejemplo alternativo de spiritShamanCGE |

---

## Texto Original (Complete Divine)

> **Spells**: A spirit shaman casts divine spells drawn from the druid spell list. She can cast any spell she has retrieved for that day without preparing it ahead of time.
>
> **Retrieving Spells**: Each day, a spirit shaman can retrieve a number of spells from the spirit world. She meditates for 1 hour, during which time she communes with spirits and retrieves her daily complement of spells.
