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

// Spell and Maneuver utilities for filtering
export {
  allSpells,
  filterSpells,
  getSpellcastingClasses,
  getSpellLevelsForClass,
  type EnrichedSpell,
} from './examples/entities/spells/index';

export {
  allManeuvers,
  filterManeuvers,
  getManeuverClasses,
  getManeuverLevelsForClass,
  type EnrichedManeuver,
} from './examples/entities/maneuvers';

export {
  allPowers,
  filterPowers,
  getPowerClasses,
  getPowerLevelsForClass,
  type EnrichedPower,
} from './examples/entities/powers';
