// Types
export type {
  Compendium,
  CompendiumReference,
  CompendiumRegistry,
  ResolvedEntityType,
  CompendiumWarning,
  CompendiumWarningType,
  ResolvedCompendiumContext,
  CalculationContext,
  InventoryEntityResolver,
} from './types';

// Ports (arquitectura hexagonal)
export type {
  CompendiumDataPort,
  EntityTypeInfo,
  EntityListResult,
  GetEntitiesOptions,
} from './ports';

// Functions
export { resolveCompendiumContext } from './resolve';
export { validateCustomEntities } from './validateCustomEntities';
export type { ValidationResult } from './validateCustomEntities';

// Example context for testing
export {
  dnd35ExampleCalculationContext,
  dnd35ExampleCompendium,
  spellSchema,
  featSchema,
  buffSchema,
  exampleSpells,
  allFeats,
  allBuffs,
} from './examples/dnd35ExampleContext';

