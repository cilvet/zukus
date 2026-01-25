// Types
export type {
  Compendium,
  CompendiumReference,
  CompendiumRegistry,
  ResolvedEntityType,
  CompendiumWarning,
  CompendiumWarningType,
  ResolvedCompendiumContext,
  CalculationContext
} from './types';

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

