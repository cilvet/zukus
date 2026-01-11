# Entity Composition System

A comprehensive TypeScript library for creating dynamic entity schemas with validation, filtering, and form generation capabilities.

## 🎯 Key Features

- **Dynamic Schema Definition**: Define entity types with custom fields and validation rules
- **Enum Support**: Fields can have predefined allowed values for strict data integrity  
- **Automatic Validation**: Zod-based schema validation with detailed error reporting
- **Smart Filtering**: Generate filter facets automatically for UI components
- **Form Generation**: Create form schemas optimized for UI frameworks
- **Backward Compatibility**: Maintains compatibility with existing code

## 📁 Project Structure

```
entities/
├── types/              # Core type definitions
│   ├── base.ts         # SearchableEntity, EntityFieldType
│   ├── fields.ts       # Field definitions with enum support
│   └── schema.ts       # Schema definitions
├── schema/             # Schema creation and validation
│   ├── creation.ts     # createEntitySchema, generateJsonSchema
│   └── validation.ts   # validateEntity
├── filtering/          # Filtering and facet generation
│   ├── facets.ts       # generateFacets for filter UI
│   └── filters.ts      # filterEntities with sorting
├── forms/              # Form generation for UI
│   └── generator.ts    # generateFormSchema, getDefaultValueForField
├── instances/          # Entity instance creation
│   └── creation.ts     # createEntityInstance
└── index.ts           # Main export file
```

## 🚀 Quick Start

### Basic Entity Definition

```typescript
import { EntitySchemaDefinition, createEntitySchema, validateEntity } from './entities';

const spellDefinition: EntitySchemaDefinition = {
  typeName: "spell",
  description: "A magical spell",
  fields: [
    {
      name: "level",
      type: "integer",
      description: "Spell level",
      optional: false,
      allowedValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] // Enum support!
    },
    {
      name: "school",
      type: "string",
      description: "School of magic",
      optional: false,
      allowedValues: ["abjuration", "conjuration", "divination", "enchantment", 
                     "evocation", "illusion", "necromancy", "transmutation"]
    },
    {
      name: "components",
      type: "string_array",
      description: "Spell components",
      optional: false,
      nonEmpty: true,
      allowedValues: ["V", "S", "M", "F", "DF", "XP"]
    }
  ]
};
```

### Schema Validation

```typescript
const schema = createEntitySchema(spellDefinition);

const spell = {
  id: "fireball",
  name: "Fireball",
  type: "spell",
  level: 3,                    // Must be in allowedValues [0-9]
  school: "evocation",         // Must be in allowedValues
  components: ["V", "S", "M"]  // All values must be in allowedValues
};

const result = validateEntity(spell, spellDefinition);
console.log(result.valid); // true
```

### Filter Generation

```typescript
import { generateFacets } from './entities';

const facets = generateFacets(spellDefinition, existingSpells);
// Returns:
// [
//   { fieldName: "level", type: "select", options: [0,1,2,3,4,5,6,7,8,9] },
//   { fieldName: "school", type: "select", options: ["abjuration", ...] },
//   { fieldName: "components", type: "multiselect", options: ["V","S","M",...] }
// ]
```

### Form Generation

```typescript
import { generateFormSchema, getDefaultValueForField } from './entities';

const formSchema = generateFormSchema(spellDefinition);
// Returns form fields optimized for UI:
// - level: select field with numeric options
// - school: select field with string options  
// - components: multiselect field

const levelField = formSchema.fields.find(f => f.name === "level");
const defaultValue = getDefaultValueForField(levelField!); // 0 (first allowed value)
```

## 💡 New Features

### Enum-like Fields

Fields can now have `allowedValues` to create enum-like behavior:

```typescript
{
  name: "rarity",
  type: "string", 
  allowedValues: ["common", "uncommon", "rare", "very_rare", "legendary"]
}
```

### Smart Default Values

When creating entity instances, fields with `allowedValues` automatically use the first allowed value as default:

```typescript
const instance = createEntityInstance(definition);
// instance.rarity = "common" (first allowed value)
```

### Separate Filter vs Form Logic

- **Facets** (filtering): Optimized for search and filter UI components
- **Forms** (editing): Optimized for create/edit form UI components

## 🔧 API Reference

### Core Functions

- `createEntitySchema(definition)` - Create Zod validation schema
- `validateEntity(entity, definition)` - Validate entity data
- `generateFacets(definition, entities?)` - Generate filter facets
- `generateFormSchema(definition)` - Generate form schema
- `createEntityInstance(definition, baseData?)` - Create new entity instance
- `filterEntities(entities, criteria)` - Filter entities with sorting

### Type Guards

- `hasAllowedValues(field)` - Check if field has predefined values
- `isStringFieldWithValues(field)` - Check if string field has enum values
- `isStringArrayFieldWithValues(field)` - Check if string array has enum values

## 🧪 Testing

The test suite is organized into modular files for better maintainability:

```bash
# Run all tests
bun test entities.spec.ts
# or
bun test __tests__

# Run specific test categories
bun test __tests__/schema/          # Schema creation and validation
bun test __tests__/filtering/       # Facets and filtering
bun test __tests__/forms/           # Form generation
bun test __tests__/instances/       # Instance creation
bun test __tests__/fields/          # Enum fields support
bun test __tests__/edgeCases/       # Complex scenarios
```

**75 tests** provide comprehensive coverage of:
- ✅ Schema creation and validation
- ✅ Enum field validation and type guards
- ✅ Form generation with default values
- ✅ Filter facet generation
- ✅ Entity filtering and sorting
- ✅ Instance creation with defaults
- ✅ Edge cases and error handling
- ✅ Performance and unicode support

See [__tests__/README.md](./__tests__/README.md) for detailed test documentation.

## 🔄 Migration Guide

The system maintains backward compatibility. Existing code will continue to work without changes. To use new enum features, simply add `allowedValues` to field definitions:

```typescript
// Before (still works)
{ name: "level", type: "integer" }

// After (with enum support)  
{ name: "level", type: "integer", allowedValues: [1, 2, 3, 4, 5] }
```