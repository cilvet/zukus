# Fase 4: EntityProvider - Aclaraciones

> Aclaraciones obtenidas durante el refinamiento de requisitos.

---

## Objetivo de la Fase

Implementar `EntityProvider` como abstracción genérica para obtener entidades, ya sea otorgadas automáticamente o mediante selección del usuario.

---

## Aclaraciones Confirmadas

### Concepto de EntityProvider
**Decisión**: EntityProvider es una abstracción que unifica dos formas de obtener entidades:

1. **granted**: Se otorgan automáticamente
2. **selector**: El usuario elige de un conjunto

**Razón**: Alta configurabilidad. Un nivel de clase es simplemente un array de EntityProviders.

---

### Estructura acordada

```typescript
type EntityProvider = {
  type: "granted" | "selector";
  granted?: string[] | Filter;  // IDs explícitos o filtro dinámico
  selector?: Selector;
}
```

**Nota**: Se usa la Opción B (campos opcionales) en lugar de unión discriminada, por preferencia del usuario.

---

### Granted con filtro
**Decisión**: Cuando `granted` es un `Filter`, todas las entidades que hacen match se otorgan automáticamente.

**Caso de uso principal**: Features inyectadas por arquetipos.

**Ejemplo**:
```typescript
// Fighter nivel 3 otorga todas las features con addedAtClassLevel: "fighter.3"
{
  type: "granted",
  granted: {
    type: "AND",
    conditions: [
      { field: "props.addedAtClassLevel", operator: "contains", value: "fighter.3" }
    ]
  }
}
```

---

### Estructura de Selector

```typescript
type Selector = {
  id: string;              // Identificador único
  name: string;            // Nombre para mostrar en UI
  entityType?: string;     // Tipo de entidad (si se usa filtro dinámico)
  entityIds?: string[];    // Lista cerrada de IDs
  filter?: Filter;         // Filtro adicional
  min: number;             // Mínimo de selecciones requeridas
  max: number;             // Máximo de selecciones permitidas
}
```

**Decisión**: `min` y `max` son obligatorios, siempre hay límites.

**Uso**: Los límites también determinan el tipo de UI (dropdown si max=1, multiselect si max>1).

---

### Resolución de EntityProvider
**Decisión**: Una función que dado un EntityProvider y el estado actual, devuelve las entidades disponibles.

**Para granted**:
- Si es `string[]`: Resuelve esos IDs
- Si es `Filter`: Ejecuta el filtro y devuelve todas las entidades que matchean

**Para selector**:
- Devuelve las entidades elegibles con su `FilterResult`
- Aplica displayPolicy del filtro (strict/permissive)

---

## Preguntas Pendientes para Implementación

- [ ] Si granted con filtro puede tener displayPolicy (¿tiene sentido mostrar "oscurecidas" las que no matchean si se otorgan automáticamente?)
- [ ] Nombre del tipo de resultado de resolución
- [ ] Si la resolución incluye también las entidades ya seleccionadas (para el caso selector)
- [ ] Cómo manejar errores (ID no encontrado, filtro inválido)

---

## Casos de Uso a Cubrir

1. **Granted por IDs**: Nivel otorga features específicas por ID
2. **Granted por filtro**: Nivel otorga todas las features inyectadas
3. **Selector con IDs**: Elegir 1 de 3 opciones específicas
4. **Selector con filtro**: Elegir 1 dote de combate (filtro por categoría)
5. **Selector con límites**: Elegir entre 1 y 3 talentos de rogue

---

## Dependencias

### Requiere
- Fase 0 completada (FilterResult)
- Fase 3 completada (estructura de entidad)

### Proporciona
- Tipo `EntityProvider` usado en Fase 5 (ClassLevelDefinition)
- Tipo `Selector` usado en Fase 6 (estado con selecciones)
- Función `resolveProvider` usada en Fase 5 y 7

