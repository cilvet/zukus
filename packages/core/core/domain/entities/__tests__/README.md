# Entity System Tests

This directory contains the modular test suite for the entity composition system. Tests are organized by functionality for better maintainability and clarity.

## 📁 Test Structure

```
__tests__/
├── fixtures/
│   └── testDefinitions.ts     # Shared test data and entity definitions
├── schema/
│   ├── creation.spec.ts       # Schema creation and Zod validation
│   └── validation.spec.ts     # Entity validation against schemas
├── filtering/
│   ├── facets.spec.ts         # Facet generation for filter UI
│   └── filters.spec.ts        # Entity filtering and sorting
├── forms/
│   └── generator.spec.ts      # Form schema generation for UI
├── instances/
│   └── creation.spec.ts       # Entity instance creation with defaults
├── fields/
│   └── enumFields.spec.ts     # Enum-like fields with predefined values
├── edgeCases/
│   └── complex.spec.ts        # Complex scenarios and error handling
└── index.spec.ts              # Main test entry point
```

## 🧪 Test Categories

### Schema Tests (`schema/`)
- **creation.spec.ts**: Tests for schema creation, Zod schema generation, and JSON schema export
- **validation.spec.ts**: Tests for entity validation, error handling, and edge cases

### Filtering Tests (`filtering/`)
- **facets.spec.ts**: Tests for generating filter facets from entity definitions
- **filters.spec.ts**: Tests for entity filtering, sorting, and search functionality

### Form Tests (`forms/`)
- **generator.spec.ts**: Tests for form schema generation and default value handling

### Instance Tests (`instances/`)
- **creation.spec.ts**: Tests for creating entity instances with proper defaults

### Field Tests (`fields/`)
- **enumFields.spec.ts**: Tests for enum-like fields with `allowedValues` support

### Edge Cases (`edgeCases/`)
- **complex.spec.ts**: Tests for complex scenarios, performance, error handling, and edge cases

### Fixtures (`fixtures/`)
- **testDefinitions.ts**: Shared test data including entity definitions and sample entities

## 🚀 Running Tests

### Run All Tests
```bash
# From the entities directory
bun test __tests__

# Or run the legacy file (same result)
bun test entities.spec.ts
```

### Run Specific Test Categories
```bash
# Schema tests only
bun test __tests__/schema/

# Filtering tests only  
bun test __tests__/filtering/

# Form generation tests
bun test __tests__/forms/

# Instance creation tests
bun test __tests__/instances/

# Enum fields tests
bun test __tests__/fields/

# Edge cases and complex scenarios
bun test __tests__/edgeCases/
```

### Run Individual Test Files
```bash
# Specific functionality
bun test __tests__/schema/creation.spec.ts
bun test __tests__/filtering/facets.spec.ts
bun test __tests__/forms/generator.spec.ts
```

## 📊 Test Coverage

The test suite includes **75 tests** covering:

- ✅ **Schema Creation**: Zod schema generation, field types, validation rules
- ✅ **Entity Validation**: Valid/invalid entities, error reporting, optional fields
- ✅ **Facet Generation**: Filter UI generation, enum support, field type handling
- ✅ **Entity Filtering**: Text search, exact matching, array filtering, sorting
- ✅ **Form Generation**: UI form schemas, default values, field conversion
- ✅ **Instance Creation**: Default values, enum defaults, field type handling
- ✅ **Enum Fields**: Predefined values, validation, facet generation, type guards
- ✅ **Edge Cases**: Performance, unicode support, malformed data, schema evolution

## 🔧 Test Data (Fixtures)

Common test entity definitions in `fixtures/testDefinitions.ts`:

- **spellDefinition**: Basic entity with various field types
- **classDefinition**: Entity with enum fields (`allowedValues`)
- **featDefinition**: Entity with reference fields
- **discoveryDefinition**: Entity with optional fields
- **Sample Entities**: Pre-populated entities for filtering and facet tests

## 📝 Adding New Tests

When adding new functionality:

1. **Choose the right category** - Add to existing category or create new one
2. **Use shared fixtures** - Import from `fixtures/testDefinitions.ts` when possible
3. **Follow naming conventions** - Use descriptive test names starting with "should"
4. **Test edge cases** - Include error conditions and boundary cases
5. **Update this README** - Document new test categories or significant additions
