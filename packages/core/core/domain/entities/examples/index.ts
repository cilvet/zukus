/**
 * Entity Management Examples - Ejemplos de CGE
 * 
 * Este módulo exporta todos los ejemplos de configuraciones, schemas,
 * entidades y estados para el sistema CGE.
 * 
 * Uso:
 * ```typescript
 * import { 
 *   wizardSpellConfig, 
 *   sorcererSpellConfig,
 *   wizardLevel5State,
 *   allSampleSpells 
 * } from './examples';
 * ```
 */

// ============================================================================
// Schemas
// ============================================================================

export {
  spellSchema,
  SPELL_SCHOOLS,
  SPELL_SUBSCHOOLS,
  SPELL_DESCRIPTORS,
  SPELL_COMPONENTS,
  SPELL_RESISTANCE_VALUES,
  SPELL_LEVELS,
  SPELLCASTING_CLASSES,
  type Spell,
  type SpellSchool,
  type SpellSubschool,
  type SpellDescriptor,
  type SpellComponent,
  type SpellResistance,
  type SpellLevel,
  type SpellcastingClass,
  type SpellClassLevel,
} from './schemas/spell.schema';

export {
  invocationSchema,
  INVOCATION_GRADES,
  type Invocation,
  type InvocationGrade,
} from './configs/special/warlock.config';

export {
  featSchema,
  type Feat,
} from './schemas/feat.schema';

export {
  classFeatureSchema,
  type ClassFeature,
} from './schemas/classFeature.schema';

export {
  classSchema,
  HIT_DIE_VALUES,
  BAB_PROGRESSIONS,
  SAVE_PROGRESSIONS,
  CLASS_TYPES,
  HIT_DIE_OPTIONS,
  BAB_PROGRESSION_OPTIONS,
  SAVE_PROGRESSION_OPTIONS,
  CLASS_TYPE_OPTIONS,
  type Class,
  type HitDie,
  type BabProgression,
  type SaveProgression,
  type SaveProgressions,
  type ClassLevelRow,
  type ClassType,
} from './schemas/class.schema';

// ============================================================================
// Entidades de Ejemplo
// ============================================================================

export {
  // Conjuros individuales
  detectMagic,
  light,
  readMagic,
  rayOfFrost,
  prestidigitation,
  magicMissile,
  shield,
  mageArmor,
  colorSpray,
  bless,
  cureLight,
  invisibility,
  mirrorImage,
  holdPerson,
  fireball,
  lightningBolt,
  dispelMagic,
  polymorphSelf,
  wallOfFire,
  
  // Colecciones
  level0Spells,
  level1Spells,
  level2Spells,
  level3Spells,
  level4PlusSpells,
  allSampleSpells,
  arcaneSpells,
  divineSpells,
} from './entities/spells';

export {
  // Invocaciones individuales
  eldritchSpear,
  sickening,
  darkness,
  fleeTheScene,
  eldritchDoom,
  sampleInvocations,
} from './configs/special/warlock.config';

// ============================================================================
// Configuraciones (CGE Configs)
// ============================================================================

// Prepared Casters
export {
  wizardSpellConfig,
  wizardSlotCapacities,
  wizardSpellTableDefinition,
  tableDefinitionToCapacityTable,
  type CapacityTableDefinition,
  type CapacityTableRow,
} from './configs/prepared/wizard.config';

export {
  clericSpellConfig,
  clericSlotCapacities,
  clericSpellTableDefinition,
} from './configs/prepared/cleric.config';

// Spontaneous Casters
export {
  sorcererSpellConfig,
  sorcererSlotCapacities,
  sorcererKnownLimits,
  sorcererSpellTableDefinition,
  sorcererKnownTableDefinition,
} from './configs/spontaneous/sorcerer.config';

// Special Systems
export {
  warlockInvocationConfig,
} from './configs/special/warlock.config';

// ============================================================================
// Estados de Ejemplo
// ============================================================================

export {
  wizardLevel5State,
  wizardLevel5ExhaustedState,
} from './states/wizard-level5.state';

export {
  sorcererLevel7State,
  sorcererWithIneligibleSpell,
  sorcererLevel1State,
} from './states/sorcerer-level7.state';

// ============================================================================
// Helpers para Tests
// ============================================================================

/**
 * Todas las configuraciones de ejemplo disponibles
 */
export const allConfigs = {
  wizard: () => import('./configs/prepared/wizard.config').then(m => m.wizardSpellConfig),
  cleric: () => import('./configs/prepared/cleric.config').then(m => m.clericSpellConfig),
  sorcerer: () => import('./configs/spontaneous/sorcerer.config').then(m => m.sorcererSpellConfig),
  warlock: () => import('./configs/special/warlock.config').then(m => m.warlockInvocationConfig),
};

/**
 * Todos los estados de ejemplo disponibles
 */
export const allStates = {
  wizardLevel5: () => import('./states/wizard-level5.state').then(m => m.wizardLevel5State),
  wizardExhausted: () => import('./states/wizard-level5.state').then(m => m.wizardLevel5ExhaustedState),
  sorcererLevel7: () => import('./states/sorcerer-level7.state').then(m => m.sorcererLevel7State),
  sorcererLevel1: () => import('./states/sorcerer-level7.state').then(m => m.sorcererLevel1State),
  sorcererIneligible: () => import('./states/sorcerer-level7.state').then(m => m.sorcererWithIneligibleSpell),
};

/**
 * Resumen de qué cubre cada ejemplo
 */
export const examplesCoverage = {
  modes: {
    PREPARED_BY_LEVEL: ['wizard', 'cleric'],
    SPONTANEOUS: ['sorcerer'],
    USES_PER_ENTITY: ['warlock'],
    GLOBAL_PREPARED: [], // TODO: Implementar (ej: Mago 5e)
    ALL_ACCESS: [],      // TODO: Implementar (ej: Warmage)
  },
  features: {
    book: ['wizard'],
    knownLimits: ['sorcerer'],
    totalAccess: ['cleric'],
    usesPerDay: ['warlock'],
    domainSlots: [], // TODO: Cleric domains
    spontaneousConversion: [], // TODO: Cleric cure/inflict
  }
} as const;



