# Almacenamiento de Entidades en el Personaje

> **Estado**: Propuesta  
> **Fecha**: 2026-01-05

---

## Nuevos campos en CharacterBaseData

```typescript
// Pool central de entidades
entities?: Record<string, EntityInstance[]>

// Clases añadidas (copiadas del compendio, con selecciones en sus providers)
classes?: Record<string, ClassEntity>

// Slots de nivel
levelSlots?: LevelSlot[]
```

Campos opcionales para coexistencia con sistema anterior.

---

## Tipos

### EntityInstance

```typescript
type EntityInstance = {
  instanceId: string      // "power-attack@rogue-2-rogue-talent"
  entity: StandardEntity  // Tiene id, name, entityType, etc.
  applicable: boolean
  origin: string          // "classLevel:rogue-2" o "entityInstance.classFeature:..."
}
```

### LevelSlot

```typescript
type LevelSlot = {
  classId: string | null
  hpRoll: number | null
}
```

---

## Formato de instanceId

```
{entityId}@{origen}
```

Ejemplos:
- `sneak-attack-1d6@rogue-1` — granted en nivel 1 de rogue
- `combat-trick@rogue-2-rogue-talent` — selected en selector "rogue-talent" de nivel 2
- `power-attack@combat-trick@rogue-2-rogue-talent-combat-feat` — selected en provider anidado

---

## Formato de origin

```
{tipo}:{id}
```

Tipos:
- `classLevel:rogue-2` — viene de un nivel de clase
- `entityInstance.{entityType}:{instanceId}` — viene de provider anidado en otra entidad

---

## Ejemplo

```json
{
  "name": "Gorwin",
  
  "entities": {
    "classFeature": [
      {
        "instanceId": "sneak-attack-1d6@rogue-1",
        "entity": { "id": "sneak-attack-1d6", "name": "Sneak Attack +1d6" },
        "applicable": true,
        "origin": "classLevel:rogue-1"
      },
      {
        "instanceId": "evasion@rogue-2",
        "entity": { "id": "evasion", "name": "Evasion" },
        "applicable": true,
        "origin": "classLevel:rogue-2"
      },
      {
        "instanceId": "combat-trick@rogue-2-rogue-talent",
        "entity": {
          "id": "combat-trick",
          "name": "Combat Trick",
          "providers": [
            {
              "selector": { "id": "combat-feat", "entityType": "feat", "min": 1, "max": 1 },
              "selectedInstanceIds": ["power-attack@combat-trick@rogue-2-rogue-talent-combat-feat"]
            }
          ]
        },
        "applicable": true,
        "origin": "classLevel:rogue-2"
      }
    ],
    "feat": [
      {
        "instanceId": "power-attack@combat-trick@rogue-2-rogue-talent-combat-feat",
        "entity": { "id": "power-attack", "name": "Power Attack" },
        "applicable": true,
        "origin": "entityInstance.classFeature:combat-trick@rogue-2-rogue-talent"
      }
    ]
  },
  
  "classes": {
    "rogue": {
      "id": "rogue",
      "name": "Rogue",
      "hitDie": 6,
      "babProgression": "medium",
      "saves": { "fortitude": "poor", "reflex": "good", "will": "poor" },
      "skillPointsPerLevel": "8",
      "classSkillIds": ["hide", "move-silently", "open-lock"],
      "classType": "base",
      "levels": {
        "1": {
          "providers": [
            { "granted": { "specificIds": ["sneak-attack-1d6", "trapfinding"] } }
          ]
        },
        "2": {
          "providers": [
            { "granted": { "specificIds": ["evasion"] } },
            {
              "selector": { "id": "rogue-talent", "entityType": "classFeature", "min": 1, "max": 1 },
              "selectedInstanceIds": ["combat-trick@rogue-2-rogue-talent"]
            }
          ]
        }
      }
    }
  },
  
  "levelSlots": [
    { "classId": "rogue", "hpRoll": 6 },
    { "classId": "rogue", "hpRoll": 4 }
  ]
}
```

