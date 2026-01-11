# Nuevos Campos y Addons

> **Estado**: Propuesta  
> **Fecha**: 2026-01-05

---

## Nuevo tipo de campo: `enum`

Campo con opciones predefinidas que incluyen metadatos (nombre legible, descripción).

### Definición

```typescript
type EnumOption = {
  value: string | number
  name: string
  description?: string
}

type EnumFieldDefinition = EntityFieldDefinition & {
  type: 'enum'
  options: EnumOption[]
}
```

### Ejemplo en schema

```json
{
  "name": "babProgression",
  "type": "enum",
  "options": [
    { "value": "full", "name": "Completa", "description": "+1 por nivel" },
    { "value": "medium", "name": "Media", "description": "+3/4 por nivel" },
    { "value": "poor", "name": "Pobre", "description": "+1/2 por nivel" }
  ]
}
```

### Comportamiento en CMS

- Muestra selector con nombres legibles
- Tooltip con descripción al hover
- Guarda el `value` en la entidad

---

## Flag: `isFormula`

Marca un campo `string` como fórmula para activar autocompletado de variables en el CMS.

### Definición

```typescript
type StringFieldDefinition = EntityFieldDefinition & {
  type: 'string'
  isFormula?: boolean
}
```

### Ejemplo en schema

```json
{
  "name": "skillPointsPerLevel",
  "type": "string",
  "isFormula": true
}
```

### Comportamiento en CMS

- Input de texto con autocompletado de variables (`@characterLevel`, `@ability.intelligence.modifier`, etc.)
- Validación de sintaxis de fórmula (opcional)

---

## Addon: `source`

Indica el origen de una entidad (compendio, libro, página).

### Definición

```typescript
type SourceAddon = {
  compendiumId: string   // ID del compendio de origen
  page?: number          // Página del libro (opcional)
  edition?: string       // Edición (opcional)
}
```

### Campos que añade al schema

```json
{
  "name": "source",
  "type": "object",
  "objectFields": [
    { "name": "compendiumId", "type": "string" },
    { "name": "page", "type": "integer", "optional": true },
    { "name": "edition", "type": "string", "optional": true }
  ]
}
```

### Ejemplo en entidad

```json
{
  "id": "power-attack",
  "name": "Power Attack",
  "source": {
    "compendiumId": "srd-3.5",
    "page": 98
  }
}
```

