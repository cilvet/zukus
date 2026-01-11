/**
 * Main test entry point that imports and runs all entity system tests
 * 
 * This file serves as the main test suite entry point, organizing all tests
 * by functional area for better maintainability and understanding.
 */

// Import all test suites to ensure they run
import "./schema/creation.spec";
import "./schema/validation.spec";
import "./filtering/facets.spec";
import "./filtering/filters.spec";
import "./forms/generator.spec";
import "./instances/creation.spec";
import "./fields/enumFields.spec";
import "./edgeCases/complex.spec";

// This file automatically runs all tests when executed
// Tests are organized by functionality:
//
// Schema Tests:
//   - creation.spec.ts: Schema creation and Zod validation
//   - validation.spec.ts: Entity validation against schemas
//
// Filtering Tests:
//   - facets.spec.ts: Facet generation for filter UI
//   - filters.spec.ts: Entity filtering and sorting
//
// Form Tests:
//   - generator.spec.ts: Form schema generation for UI
//
// Instance Tests:
//   - creation.spec.ts: Entity instance creation with defaults
//
// Field Tests:
//   - enumFields.spec.ts: Enum-like fields with predefined values
//
// Edge Cases:
//   - complex.spec.ts: Complex scenarios and error handling