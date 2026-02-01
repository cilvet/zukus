# Arcanist - Spellcasting (Pathfinder 1e)

## Configuracion CGE

| Eje | Tipo | Detalle |
|-----|------|---------|
| known | `UNLIMITED` | Libro de conjuros sin limite |
| resource | `SLOTS` | Slots por nivel (menos que Wizard) |
| preparation | `LIST` | `structure: PER_LEVEL`, `consumeOnUse: false` |

## Estado: PARCIALMENTE IMPLEMENTADO

- La configuracion CGE esta definida en `packages/core/testClasses/arcanist/`
- Las operaciones de preparacion LIST estan **pendientes de implementar**

---

## Resumen Mecanico

El Arcanist combina elementos de Wizard y Sorcerer:
- Tiene spellbook como Wizard (conocidos ilimitados)
- Prepara lista diaria por nivel (no slots individuales)
- Lanza espontaneamente de la lista preparada como Sorcerer

---

## Diferencia Clave

| Aspecto | Wizard | Sorcerer | Arcanist |
|---------|--------|----------|----------|
| Conocidos | Libro (UNLIMITED) | Tabla (LIMITED_PER_ENTITY_LEVEL) | Libro (UNLIMITED) |
| Preparacion | BOUND (slot especifico) | NONE | LIST PER_LEVEL |
| Casting | Consume slot preparado | Consume slot flexible | Consume slot de nivel |

El Arcanist prepara "que conjuros tendre disponibles hoy por nivel" pero no "cuantas veces cada uno".

---

## Similitud con Spirit Shaman

Ambos usan `preparation: LIST` con `structure: PER_LEVEL` y `consumeOnUse: false`.

| Aspecto | Spirit Shaman | Arcanist |
|---------|--------------|----------|
| known | Sin config (acceso a lista completa) | `UNLIMITED` (libro) |
| Fuente | Lista de clase directa | Spellbook personal |
| Tabla prepared | Igual a slots | Separada de slots |

---

## Configuracion en Codigo

```typescript
const arcanistCGEConfig: CGEConfig = {
  id: 'arcanist-spells',
  classId: 'arcanist',
  entityType: 'spell',
  levelPath: '@entity.levels.arcanist',

  // Libro sin limite
  known: { type: 'UNLIMITED' },

  tracks: [
    {
      id: 'base',
      label: 'spell_slots',
      resource: {
        type: 'SLOTS',
        table: ARCANIST_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      preparation: {
        type: 'LIST',
        structure: 'PER_LEVEL',
        maxPerLevel: ARCANIST_PREPARED_TABLE, // Diferente de slots!
        consumeOnUse: false,
      },
    },
  ],

  labels: {
    known: 'spellbook',
    prepared: 'prepared_spells',
    slot: 'spell_slot',
    action: 'cast',
  },
};
```

---

## Tablas Diferenciadas

El Arcanist tiene **dos tablas separadas**:

1. **SLOTS**: Cuantos conjuros puede lanzar por dia
2. **PREPARED**: Cuantos conjuros puede tener disponibles por nivel

Ejemplo nivel 6:
- Slots: `[0, 4, 4, 2, 0, ...]` - 4 de nivel 1, 4 de nivel 2, 2 de nivel 3
- Prepared: `[0, 4, 2, 1, 0, ...]` - 4 preparados nivel 1, 2 preparados nivel 2, 1 preparado nivel 3

Puede lanzar cualquier combinacion de los preparados mientras tenga slots del nivel correspondiente.

---

## Operaciones Pendientes

Para implementacion completa de LIST preparation:

1. **UI de Seleccion por Nivel**: Permitir elegir X conjuros de nivel N del libro
2. **Validacion de Limites**: Respetar `maxPerLevel` por nivel de conjuro
3. **Casting desde Lista**: Mostrar solo conjuros preparados del nivel al usar slot
4. **Persistencia**: Guardar en `CGEState.listPreparations` por nivel

---

## Arcane Reservoir (caso especial)

Ademas de slots, tiene un pool de puntos separado:
- Se usa para activar exploits
- Algunas exploits mejoran conjuros
- Pool separado de los spell slots

Esto podria modelarse como un segundo track o como un recurso independiente fuera de CGE.

---

## Texto Original (Pathfinder ACG)

> **Spellcasting**: An arcanist casts arcane spells drawn from the sorcerer/wizard spell list. An arcanist must prepare her spells ahead of time, but unlike a wizard, her spells are not expended when they're cast. Instead, she can cast any spell that she has prepared by consuming a spell slot of the appropriate level.
>
> **Arcanist Spellbook**: An arcanist must study her spellbook each day to prepare her spells. She can't prepare any spell not recorded in her spellbook.

---

## Archivos Relevantes

- **Clase**: `packages/core/testClasses/arcanist/arcanistClass.ts`
- **Features + CGE Config**: `packages/core/testClasses/arcanist/arcanistClassFeatures.ts`
- **Ejemplos CGE**: `packages/core/core/domain/cge/examples.ts`
- **Tipos CGE**: `packages/core/core/domain/cge/types.ts`
