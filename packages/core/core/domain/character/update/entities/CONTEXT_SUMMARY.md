# Contexto Necesario para Implementar Custom Entities en CharacterUpdater

## 📋 Resumen

Este documento resume el contexto necesario para añadir métodos de gestión de entidades custom al `CharacterUpdater`.

---

## 🎯 Objetivo

Añadir métodos al `CharacterUpdater` para gestionar `customEntities` del personaje, siguiendo el mismo patrón que `addFeat`, `removeFeat`, etc.

---

## 📐 Estructura de Datos

### CharacterBaseData.customEntities

```typescript
type CharacterBaseData = {
  // ... otros campos
  customEntities?: Record<string, StandardEntity[]>;
}
```

**Estructura**:
- Key: `entityType` (string) - ej: `'feat'`, `'spell'`, `'item'`
- Value: Array de `StandardEntity[]` del mismo tipo

**Ejemplo**:
```typescript
customEntities: {
  'feat': [
    { id: 'power-attack', entityType: 'feat', name: 'Power Attack', ... },
    { id: 'cleave', entityType: 'feat', name: 'Cleave', ... }
  ],
  'spell': [
    { id: 'fireball', entityType: 'spell', name: 'Fireball', ... }
  ]
}
```

### StandardEntity

```typescript
type StandardEntity = Entity 
  & SearchableFields 
  & TaggableFields 
  & ImageableFields 
  & EffectfulFields 
  & SuppressingFields;

// Campos mínimos requeridos:
{
  id: string;              // Identificador único
  entityType: string;      // Tipo de entidad (debe coincidir con la key en customEntities)
  name: string;            // Nombre para mostrar
  description?: string;    // Descripción opcional
  tags?: string[];         // Tags opcionales
  // ... campos de EffectfulFields si aplica
}
```

---

## 🔍 Patrón de Implementación Existente

### Ejemplo: addFeat

```typescript
addFeat(feat: Feat): UpdateResult {
  if (!this.character) return this.characterNotSet;

  const featExists = this.character.feats.some(
    (f) => f.uniqueId === feat.uniqueId
  );

  if (featExists) {
    return {
      success: false,
      error: `Feat ${feat.uniqueId} already exists in character feats`,
    };
  }

  this.character = {
    ...this.character,
    feats: [...this.character.feats, feat],
  };

  this.notifyUpdate();
  return { success: true };
}
```

**Patrón**:
1. Verificar que `character` existe
2. Verificar que no existe duplicado (mismo ID)
3. Añadir al array correspondiente
4. Llamar a `notifyUpdate()` que recalcula el sheet
5. Retornar `UpdateResult`

---

## 🛠️ Métodos a Implementar

### 1. addCustomEntity

```typescript
addCustomEntity(entity: StandardEntity, entityType: string): UpdateResult
```

**Lógica**:
- Verificar que `entity.entityType === entityType` (consistencia)
- Inicializar `customEntities` si no existe
- Inicializar `customEntities[entityType]` si no existe
- Verificar que no existe entidad con mismo `id` en ese `entityType`
- Añadir al array
- Llamar `notifyUpdate()`

**Validación opcional**:
- Si hay `compendiumContext` disponible, validar contra schema
- Por ahora, no validamos (similar a feats que no se validan al añadir)

### 2. removeCustomEntity

```typescript
removeCustomEntity(entityId: string, entityType: string): UpdateResult
```

**Lógica**:
- Verificar que `customEntities` existe
- Verificar que `customEntities[entityType]` existe
- Verificar que existe entidad con ese `id`
- Filtrar del array
- Si el array queda vacío, opcionalmente eliminar la key
- Llamar `notifyUpdate()`

### 3. updateCustomEntity

```typescript
updateCustomEntity(entityId: string, entityType: string, entity: StandardEntity): UpdateResult
```

**Lógica**:
- Verificar que `customEntities[entityType]` existe
- Verificar que existe entidad con ese `id`
- Verificar que `entity.entityType === entityType`
- Reemplazar en el array
- Llamar `notifyUpdate()`

### 4. getCustomEntities (opcional, para consulta)

```typescript
getCustomEntities(entityType?: string): StandardEntity[] | Record<string, StandardEntity[]>
```

**Lógica**:
- Si `entityType` proporcionado: retornar `customEntities[entityType]` o `[]`
- Si no: retornar todo `customEntities` o `{}`

---

## 🔗 Integración con Cálculo

### notifyUpdate()

El método `notifyUpdate()` actual llama a:
```typescript
this.characterSheet = calculateCharacterSheet(this.character);
```

**Nota**: Actualmente no pasa `CalculationContext`, por lo que:
- La validación de entidades se hace en `calculateCharacterSheet()` si hay contexto
- Si no hay contexto, se generan warnings pero se procesan igual
- Esto es consistente con el comportamiento actual

### Validación en calculateCharacterSheet

```typescript
// En calculateCharacterSheet.ts
if (characterBaseData.customEntities) {
  const validationResult = validateCustomEntities(
    characterBaseData.customEntities,
    context?.compendiumContext
  );
  // Warnings se añaden al sheet
}
```

**Comportamiento**:
- Si hay contexto: valida y genera warnings si hay errores
- Si no hay contexto: genera warning pero continúa
- Las entidades inválidas se procesan igual (modo permisivo)

---

## 📝 Interfaz ICharacterUpdater

Añadir a `core/domain/character/interfaces/characterUpdater.ts`:

```typescript
export interface ICharacterUpdater {
  // ... métodos existentes
  
  // Custom Entities management
  addCustomEntity(entity: StandardEntity, entityType: string): UpdateResult;
  removeCustomEntity(entityId: string, entityType: string): UpdateResult;
  updateCustomEntity(entityId: string, entityType: string, entity: StandardEntity): UpdateResult;
  getCustomEntities(entityType?: string): StandardEntity[] | Record<string, StandardEntity[]>;
}
```

---

## 🧪 Consideraciones de Testing

### Casos a Testear

1. **addCustomEntity**:
   - ✅ Añadir entidad cuando `customEntities` no existe
   - ✅ Añadir entidad cuando `entityType` no existe
   - ✅ Añadir entidad cuando ya existe (debe fallar)
   - ✅ Verificar que `entity.entityType` coincide con parámetro
   - ✅ Verificar que se recalcula el sheet

2. **removeCustomEntity**:
   - ✅ Eliminar entidad existente
   - ✅ Eliminar entidad que no existe (debe fallar)
   - ✅ Eliminar cuando `customEntities` no existe (debe fallar)
   - ✅ Eliminar cuando `entityType` no existe (debe fallar)

3. **updateCustomEntity**:
   - ✅ Actualizar entidad existente
   - ✅ Actualizar entidad que no existe (debe fallar)
   - ✅ Verificar que `entity.entityType` coincide

4. **Integración**:
   - ✅ Verificar que cambios se reflejan en `characterSheet.computedEntities`
   - ✅ Verificar que warnings se generan si hay entidades inválidas

---

## 🔄 Flujo Completo

```
Usuario llama addCustomEntity()
  ↓
CharacterUpdater.addCustomEntity()
  ↓
Validar y añadir a customEntities
  ↓
notifyUpdate()
  ↓
calculateCharacterSheet(character)
  ↓
validateCustomEntities() [si hay contexto]
  ↓
compileCharacterEntities()
  ↓
characterSheet.computedEntities actualizado
  ↓
onCharacterUpdated(sheet, baseData) callback
```

---

## 📚 Archivos Relacionados

| Archivo | Propósito |
|---------|-----------|
| `core/domain/character/interfaces/characterUpdater.ts` | Interfaz a extender |
| `core/domain/character/update/characterUpdater/characterUpdater.ts` | Implementación |
| `core/domain/character/baseData/character.ts` | `CharacterBaseData` con `customEntities` |
| `core/domain/entities/types/base.ts` | `StandardEntity` type |
| `core/domain/character/calculation/entities/compileCharacterEntities.ts` | Compilación de entidades |
| `core/domain/compendiums/validateCustomEntities.ts` | Validación contra schemas |

---

## ✅ Checklist de Implementación

- [ ] Añadir métodos a `ICharacterUpdater` interface
- [ ] Implementar `addCustomEntity()` en `CharacterUpdater`
- [ ] Implementar `removeCustomEntity()` en `CharacterUpdater`
- [ ] Implementar `updateCustomEntity()` en `CharacterUpdater`
- [ ] Implementar `getCustomEntities()` en `CharacterUpdater` (opcional)
- [ ] Añadir tests unitarios para cada método
- [ ] Añadir tests de integración con cálculo
- [ ] Verificar que warnings se generan correctamente
- [ ] Verificar retrocompatibilidad con sistema legacy

---

**Última actualización**: 2025-01-02

