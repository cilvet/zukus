# Flujos de Entidades

> **Estado**: Propuesta  
> **Fecha**: 2026-01-05

---

## Flujo: Añadir Clase

**Trigger**: CharacterUpdater añade una clase al personaje.

**Requisitos**: Acceso al contexto de compendios.

**Pasos**:

1. Obtener definición de clase del compendio
2. Copiar clase a `character.classes[classId]`
3. Resolver entidades de todos los niveles (1-20):
   - Granted con `specificIds` → copiar al pool
   - Selectores con `entityIds` cerrados → copiar opciones al pool
   - Selectores con filtros → no se resuelven (requieren UI)
4. Añadir entidades al pool `character.entities[entityType][]`
5. Todas se crean con `applicable: false` inicialmente

---

## Flujo: Eliminar Clase

**Trigger**: CharacterUpdater elimina una clase (ya no está en ningún levelSlot).

**Pasos**:

1. Eliminar clase de `character.classes`
2. Eliminar recursivamente todas las entidades con `origin` de esa clase
3. Eliminar entidades hijas (cuyo origin apunte a entidades eliminadas)

---

## Flujo: Compilación de Entidades (levelEntityResolution)

**Trigger**: Inicio del cálculo de personaje.

**Pasos**:

1. Recorrer `levelSlots` desde el slot 1 hasta el nivel actual
2. Para cada slot con `classId`:
   - Incrementar contador de nivel de esa clase
   - Obtener providers del nivel correspondiente de `character.classes[classId].levels[N]`
   - Para cada provider, marcar entidades referenciadas como `applicable: true`
   - Procesar providers anidados en entidades (recursivo)
3. Entidades no visitadas quedan con `applicable: false`
4. Compilar changes de todas las entidades con `applicable: true`

**Nota**: Entidades con `origin: "custom"` son siempre `applicable: true`.

---

## Flujo: Editar Entidad

**Trigger**: Usuario edita una entidad desde la UI.

**Pasos**:

1. CharacterUpdater expone función para editar entidad por `instanceId`
2. Se actualiza `entity` dentro del `EntityInstance`
3. Si la entidad tiene providers con selecciones, estas se mantienen

---

## Flujo: Crear Entidad Custom

**Trigger**: Usuario crea una entidad personalizada.

**Pasos**:

1. Generar `instanceId` con formato `{id}@custom`
2. Crear `EntityInstance` con `origin: "custom"` y `applicable: true`
3. Añadir al pool `character.entities[entityType][]`

---

## Flujo: Seleccionar en Selector Dinámico

**Trigger**: Usuario abre selector con filtro en la UI.

**Requisitos**: Acceso al contexto de compendios.

**Pasos**:

1. Evaluar filtro del selector contra compendio
2. Mostrar opciones elegibles
3. Al seleccionar:
   - Copiar entidad al pool `character.entities`
   - Generar `instanceId` apropiado
   - Actualizar `selectedInstanceIds` del provider

---

## Tipos auxiliares

```typescript
type ProviderLocation = 
  | { type: 'classLevel', classId: string, classLevel: number, selectorId: string }
  | { type: 'entity', parentInstanceId: string, selectorId: string }
```

---

## Funciones del CharacterUpdater (resumen)

```typescript
// Clases
addClass(classId: string, compendiumContext): void
removeClass(classId: string): void

// Entidades
editEntity(instanceId: string, updates: Partial<StandardEntity>): void
createCustomEntity(entityType: string, entity: StandardEntity): void
deleteEntity(instanceId: string): void

// Selecciones (declarativo: pasa el nuevo estado completo)
updateProviderSelection(location: ProviderLocation, selectedInstanceIds: string[]): void

// Level Slots
setLevelSlotClass(slotIndex: number, classId: string | null): void
setLevelSlotHp(slotIndex: number, hpRoll: number): void
```

