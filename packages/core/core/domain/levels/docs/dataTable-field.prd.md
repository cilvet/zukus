# PRD: Tipo de Campo `dataTable`

> **Estado**: Pendiente de implementación  
> **Fecha**: 2026-01-04  
> **Autor**: Diseño colaborativo

---

## Resumen

Nuevo tipo de campo para el sistema de entidades que permite definir tablas de datos con una primera columna numérica (row key) y múltiples columnas de valores.

---

## Motivación

Necesitamos representar estructuras tabulares comunes en TTRPGs:

| Caso de uso | Row Key | Columnas |
|-------------|---------|----------|
| Niveles de clase | Nivel (1-20) | Referencias a `classLevel` |
| Slots de conjuros | Caster Level | Slots por nivel de hechizo (0-9) |
| Conjuros conocidos | Caster Level | Conocidos por nivel (0-9) |
| Progresión de sneak attack | Rogue Level | Dados de daño |
| BAB/Saves por nivel | Level | BAB, Fort, Ref, Will |

---

## Especificación

### Configuración del campo

```typescript
type DataTableFieldConfig = {
  type: 'dataTable';
  
  /**
   * Configuración de la primera columna (siempre numérica).
   * Define el "row key" de cada fila.
   */
  rowKey: DataTableRowKeyConfig;
  
  /**
   * Columnas de datos de la tabla.
   * Cada columna define qué tipo de valor contiene.
   */
  columns: DataTableColumn[];
};

type DataTableRowKeyConfig = {
  /**
   * Nombre para mostrar en UI.
   * Ejemplos: "Level", "Caster Level", "Tier"
   */
  name: string;
  
  /**
   * Número inicial de las filas.
   * Default: 1
   */
  startingNumber?: number;
  
  /**
   * Si true, los números deben ser consecutivos sin saltos.
   * Ejemplo con startingNumber=1: 1, 2, 3, 4... (válido)
   * Ejemplo con startingNumber=1: 1, 3, 5... (inválido si incremental=true)
   * Default: false
   */
  incremental?: boolean;
};

type DataTableColumn = {
  /**
   * Identificador único de la columna.
   * Se usa como key en el objeto de cada fila.
   */
  id: string;
  
  /**
   * Nombre para mostrar en UI.
   */
  name: string;
  
  /**
   * Tipo de valor de la columna.
   */
  type: 'reference' | 'integer' | 'string' | 'boolean';
  
  /**
   * Solo para type='reference'.
   * Tipo de entidad que puede referenciarse.
   */
  referenceType?: string;
  
  /**
   * Solo para type='reference'.
   * Si true, el valor es un array de referencias.
   * Si false (default), es una referencia única.
   */
  allowMultiple?: boolean;
  
  /**
   * Si true, la columna puede no tener valor en una fila.
   * Default: false
   */
  optional?: boolean;
};
```

### Estructura de datos resultante

```typescript
// El valor de un campo dataTable es siempre:
type DataTableValue = Record<number, Record<string, unknown>>;
//                          ↑ rowKey    ↑ column.id → valor

// El tipo del valor depende de column.type:
// - 'integer' → number
// - 'string' → string
// - 'boolean' → boolean
// - 'reference' (allowMultiple=false) → string (ID)
// - 'reference' (allowMultiple=true) → string[] (array de IDs)
```

---

## Ejemplos

### Ejemplo 1: Niveles de clase

**Definición del campo:**

```typescript
{
  name: 'levelsData',
  type: 'dataTable',
  description: 'Class level progression',
  rowKey: {
    name: 'Level',
    startingNumber: 1,
    incremental: true
  },
  columns: [
    {
      id: 'classLevelIds',
      name: 'Class Levels',
      type: 'reference',
      referenceType: 'classLevel',
      allowMultiple: true
    }
  ]
}
```

**Datos de ejemplo (Fighter):**

```json
{
  "levelsData": {
    "1": { "classLevelIds": ["fighter-1"] },
    "2": { "classLevelIds": ["fighter-2"] },
    "3": { "classLevelIds": ["fighter-3"] },
    "4": { "classLevelIds": ["fighter-4"] },
    "5": { "classLevelIds": ["fighter-5"] }
  }
}
```

### Ejemplo 2: Slots de conjuros por día

**Definición del campo:**

```typescript
{
  name: 'slotsPerDay',
  type: 'dataTable',
  description: 'Spell slots per day by caster level',
  rowKey: {
    name: 'Caster Level',
    startingNumber: 1,
    incremental: true
  },
  columns: [
    { id: '0', name: 'Level 0', type: 'integer', optional: true },
    { id: '1', name: 'Level 1', type: 'integer', optional: true },
    { id: '2', name: 'Level 2', type: 'integer', optional: true },
    { id: '3', name: 'Level 3', type: 'integer', optional: true },
    { id: '4', name: 'Level 4', type: 'integer', optional: true },
    { id: '5', name: 'Level 5', type: 'integer', optional: true },
    { id: '6', name: 'Level 6', type: 'integer', optional: true },
    { id: '7', name: 'Level 7', type: 'integer', optional: true },
    { id: '8', name: 'Level 8', type: 'integer', optional: true },
    { id: '9', name: 'Level 9', type: 'integer', optional: true }
  ]
}
```

**Datos de ejemplo (Wizard):**

```json
{
  "slotsPerDay": {
    "1":  { "0": 3, "1": 1 },
    "2":  { "0": 4, "1": 2 },
    "3":  { "0": 4, "1": 2, "2": 1 },
    "4":  { "0": 4, "1": 3, "2": 2 },
    "5":  { "0": 4, "1": 3, "2": 2, "3": 1 }
  }
}
```

### Ejemplo 3: Progresión sparse (no incremental)

**Definición del campo:**

```typescript
{
  name: 'sneakAttackDice',
  type: 'dataTable',
  description: 'Sneak attack progression',
  rowKey: {
    name: 'Rogue Level',
    startingNumber: 1,
    incremental: false  // Solo listamos niveles donde cambia
  },
  columns: [
    { id: 'dice', name: 'Dice', type: 'integer' }
  ]
}
```

**Datos de ejemplo (Rogue):**

```json
{
  "sneakAttackDice": {
    "1":  { "dice": 1 },
    "3":  { "dice": 2 },
    "5":  { "dice": 3 },
    "7":  { "dice": 4 },
    "9":  { "dice": 5 },
    "11": { "dice": 6 },
    "13": { "dice": 7 },
    "15": { "dice": 8 },
    "17": { "dice": 9 },
    "19": { "dice": 10 }
  }
}
```

---

## Validaciones

### Validación del schema

1. `rowKey.name` es requerido y no puede estar vacío
2. `columns` debe tener al menos una columna
3. Cada columna debe tener `id`, `name` y `type`
4. Si `column.type === 'reference'`, debe especificarse `referenceType`
5. `column.id` debe ser único dentro de las columnas

### Validación de datos

1. Todas las keys del objeto deben ser números válidos
2. Si `rowKey.incremental === true`:
   - Las keys deben ser consecutivas empezando en `startingNumber`
   - No pueden haber saltos
3. Para cada fila:
   - Las columnas no opcionales deben tener valor
   - Los valores deben coincidir con el tipo de la columna
4. Para columnas `type: 'reference'`:
   - Si `allowMultiple === true`, el valor debe ser un array de strings
   - Si `allowMultiple === false`, el valor debe ser un string

---

## UI del Editor

### Visualización

La UI debe mostrar una tabla visual con:

1. **Primera columna**: Row key (número)
2. **Columnas siguientes**: Una por cada `column` definida
3. **Header**: Nombres de columnas (`rowKey.name` + `column.name` de cada una)

### Edición

1. **Añadir fila**: 
   - Si `incremental === true`: Añade la siguiente fila automáticamente
   - Si `incremental === false`: Permite especificar el número de fila

2. **Eliminar fila**:
   - Si `incremental === true`: Solo permite eliminar la última fila
   - Si `incremental === false`: Permite eliminar cualquier fila

3. **Editar celda**:
   - `integer`: Input numérico
   - `string`: Input de texto
   - `boolean`: Checkbox/Switch
   - `reference` (single): EntitySelector con filtro por `referenceType`
   - `reference` (multiple): EntitySelector multi-select

### Ejemplo visual

```
┌─────────────┬───────────────────────┐
│    Level    │    Class Levels       │
├─────────────┼───────────────────────┤
│      1      │ [fighter-1]           │
│      2      │ [fighter-2]           │
│      3      │ [fighter-3]           │
│      4      │ [fighter-4]           │
│      5      │ [fighter-5]           │
└─────────────┴───────────────────────┘
                              [+ Add Row]
```

```
┌───────────────┬─────┬─────┬─────┬─────┬─────┐
│ Caster Level  │  0  │  1  │  2  │  3  │  4  │
├───────────────┼─────┼─────┼─────┼─────┼─────┤
│       1       │  3  │  1  │  -  │  -  │  -  │
│       2       │  4  │  2  │  -  │  -  │  -  │
│       3       │  4  │  2  │  1  │  -  │  -  │
│       4       │  4  │  3  │  2  │  -  │  -  │
│       5       │  4  │  3  │  2  │  1  │  -  │
└───────────────┴─────┴─────┴─────┴─────┴─────┘
```

---

## Implementación

### Archivos a modificar

1. **`core/domain/entities/types/base.ts`**
   - Añadir `'dataTable'` a `EntityFieldType`

2. **`core/domain/entities/types/fields.ts`** (crear si no existe)
   - Definir `DataTableFieldConfig`, `DataTableRowKeyConfig`, `DataTableColumn`

3. **`visualPlayground/src/components/entity-editor/EntityTypeEditor.tsx`**
   - Añadir UI para definir campos `dataTable` (rowKey + columns)

4. **`visualPlayground/src/components/entity-editor/EntityInstanceEditor.tsx`**
   - Añadir componente para editar valores `dataTable` (tabla visual)

5. **`visualPlayground/server/storage.ts`** (si aplica validación)
   - Añadir validación de datos `dataTable`

### Orden de implementación

1. Tipos TypeScript (`DataTableFieldConfig`, etc.)
2. Añadir `'dataTable'` a `EntityFieldType`
3. Componente de visualización/edición de datos (EntityInstanceEditor)
4. Componente de definición de schema (EntityTypeEditor)
5. Validaciones
6. Tests

---

## Criterios de aceptación

- [ ] Se puede definir un campo `dataTable` en un schema de entidad
- [ ] El editor muestra una tabla visual para campos `dataTable`
- [ ] Se pueden añadir/eliminar filas respetando `incremental`
- [ ] Se pueden editar celdas según su tipo
- [ ] Las referencias usan EntitySelector con filtro por `referenceType`
- [ ] La validación detecta:
  - Saltos en filas cuando `incremental === true`
  - Valores faltantes en columnas requeridas
  - Tipos incorrectos
- [ ] Los datos se guardan y cargan correctamente en JSON

---

## Dependencias

**Requiere**:
- Sistema de entidades existente
- EntitySelector funcionando

**Proporciona**:
- Tipo de campo reutilizable para tablas de progresión
- Base para schemas de `class`, `classVariant`, CGE

---

## Notas adicionales

- Las keys numéricas en JSON son strings (`"1"`, `"2"`), pero en TypeScript las tratamos como `number`. La serialización/deserialización debe manejar esto.
- Considerar soporte para copiar/pegar tablas desde Excel o formato tabular.

