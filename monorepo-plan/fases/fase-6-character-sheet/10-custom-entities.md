# 10: Custom Entities

**Prioridad:** Media  
**Complejidad:** Media  
**Dependencias:** `EntitySearchModal`

---

## ⚠️ DISCLAIMER IMPORTANTE PARA EL AGENTE

**ANTES de implementar CUALQUIER componente:**

1. **PREGUNTA AL USUARIO sobre el diseño visual del componente**
2. **NO asumas** que el diseño debe ser igual a zukusnextmicon
3. **La referencia de zukusnextmicon es VIEJA** - solo úsala para entender la funcionalidad, NO para el diseño
4. **Muestra propuestas** o mockups de cómo podría verse
5. **Espera confirmación** del usuario antes de escribir código

**NUNCA implementes sin preguntar primero sobre el diseño.**

---

## Contexto

Entidades del compendio añadidas al personaje (hechizos, dotes, habilidades especiales, etc.). Se agrupan por tipo.

### Estructura
```typescript
type CustomEntity = {
  uniqueId: string;           // UUID generado al añadir
  entityId: string;           // ID en el compendio
  entityType: string;         // 'spell', 'feat', 'specialAbility'
  name: string;
  description: string;
  data: ComputedEntity;       // Datos completos de la entidad
}
```

---

## Componentes

### `EntityTypeSection.tsx`
Muestra entidades agrupadas por tipo:

```
┌─────────────────────────────┐
│ Spells                      │
│ ─────────────────────────── │
│ Fireball                    │
│ Haste                       │
│                             │
│ Feats                       │
│ ─────────────────────────── │
│ Power Attack                │
│ Weapon Focus (Longsword)    │
└─────────────────────────────┘
```

Botón "+" por cada tipo para añadir desde el compendio.

### `EntityCard.tsx`
Tarjeta de una entidad individual.
- Click navega a detalle
- Modo edición muestra botón de eliminar

---

## Búsqueda

### `EntitySearchModal.tsx`
Reutiliza `EntitySearchModal` genérico.

Flujo:
1. User click en "+" en sección "Spells"
2. Modal abre filtrado por `entityType: 'spell'`
3. User busca y filtra
4. User selecciona "Fireball"
5. Se añade a customEntities con UUID único

---

## Detalle

### `CustomEntityDetailPage.tsx`
Ruta: `/character/[id]/entity/[uniqueId]`

Muestra:
- Nombre
- Tipo de entidad
- Descripción completa
- Datos específicos según el tipo
  - Spell: nivel, escuela, componentes, etc.
  - Feat: prerequisitos, beneficio, etc.

---

## Gestión

```typescript
export function useCustomEntities() {
  const addEntity = (entity: ComputedEntity) => {
    // Genera uniqueId
    // Añade a customEntities
  }
  
  const removeEntity = (uniqueId: string) => {
    // Elimina de customEntities
  }
  
  return { addEntity, removeEntity }
}
```

---

## Integración

**Desktop:** Columna 3  
**Mobile:** Tab "Features"

---

## Verificación

- [ ] Las entidades se agrupan por tipo
- [ ] Botón "+" abre búsqueda del tipo correcto
- [ ] Se pueden añadir entidades del compendio
- [ ] Click en entidad navega a detalle
- [ ] Se pueden eliminar entidades
- [ ] No hay duplicados (mismo entityId puede añadirse varias veces con diferentes UUID)

---

## Archivos

```
packages/ui/src/components/character/
├── custom-entities/
│   ├── EntityCard.tsx                   [ ]
│   ├── EntityTypeSection.tsx            [ ]
│   ├── CustomEntitiesSection.tsx        [ ]
│   └── index.ts                         [ ]
└── detail/
    └── CustomEntityDetailPage.tsx       [ ]

apps/zukus/app/character/[id]/
└── entity/
    └── [uniqueId].tsx                   [ ]
```

---

**Referencia:** `zukusnextmicon/src/components/Character/CustomEntities/`
