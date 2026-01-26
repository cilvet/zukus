import { BabType } from "../../../../class/baseAttackBonus";
import { CharacterClass } from "../../../../class/class";
import { SaveType } from "../../../../class/saves";
import { CGEDefinitionChange } from "../../../baseData/specialChanges";
import { buildCharacter } from "../../../../../tests/character/buildCharacter";
import { CGEConfig, LevelTable } from "../../../../cge/types";
import { featureTypes } from "../../../baseData/features/feature";

// ============================================================================
// TABLAS DE WIZARD (Vancian)
// ============================================================================

export const WIZARD_SLOTS_TABLE: LevelTable = {
  1: [3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 2, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
};

// ============================================================================
// CGE CONFIG DE WIZARD (Vancian)
// ============================================================================

export const wizardCGEConfig: CGEConfig = {
  id: 'wizard-spells',
  classId: 'wizard',
  entityType: 'spell',
  levelPath: '@entity.levels.wizard',

  // TODO: accessFilter usando EntityFilter de levels/filtering cuando resolvamos
  // el problema de niveles de conjuro variables en D&D 3.5

  // Wizard tiene libro de conjuros sin limite
  known: {
    type: 'UNLIMITED',
  },

  tracks: [
    {
      id: 'base',
      resource: {
        type: 'SLOTS',
        table: WIZARD_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      // BOUND: prepara conjuros especificos en cada slot
      preparation: { type: 'BOUND' },
    },
  ],

  variables: {
    classPrefix: 'wizard.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.wizard',
  },

  labels: {
    known: 'spellbook',
    prepared: 'prepared_spells',
    action: 'cast',
  },
};

// ============================================================================
// SPECIAL CHANGE CGE_DEFINITION (Wizard)
// ============================================================================

export const wizardCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: wizardCGEConfig,
};

// ============================================================================
// CLASE WIZARD SIMPLIFICADA PARA TESTS
// ============================================================================

export const wizard: CharacterClass = {
  name: "Wizard",
  uniqueId: "wizard",
  hitDie: 4,
  baseAttackBonusProgression: BabType.POOR,
  baseSavesProgression: {
    fortitude: SaveType.POOR,
    reflex: SaveType.POOR,
    will: SaveType.GOOD,
  },
  classFeatures: [],
  levels: [
    {
      level: 1,
      classFeatures: [
        {
          name: 'Wizard Spellcasting',
          description: 'Vancian arcane spellcasting with spellbook',
          featureType: featureTypes.CLASS_FEATURE,
          uniqueId: 'wizard-spellcasting',
          changes: [],
          specialChanges: [wizardCGEDefinition],
        },
      ],
    },
  ],
  spellCasting: true,
  spellCastingAbilityUniqueId: "intelligence",
  allSpellsKnown: false,
};

// ============================================================================
// TABLAS DE SORCERER
// ============================================================================

export const SORCERER_SLOTS_TABLE: LevelTable = {
  1: [5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [6, 4, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [6, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [6, 6, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [6, 6, 4, 0, 0, 0, 0, 0, 0, 0],
};

export const SORCERER_KNOWN_TABLE: LevelTable = {
  1: [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [5, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [6, 3, 1, 0, 0, 0, 0, 0, 0, 0],
  5: [6, 4, 2, 0, 0, 0, 0, 0, 0, 0],
};

// ============================================================================
// CGE CONFIG DE SORCERER
// ============================================================================

export const sorcererCGEConfig: CGEConfig = {
  id: 'sorcerer-spells',
  classId: 'sorcerer',
  entityType: 'spell',
  levelPath: '@entity.levels.sorcerer',

  // TODO: accessFilter usando EntityFilter de levels/filtering

  known: {
    type: 'LIMITED_PER_ENTITY_LEVEL',
    table: SORCERER_KNOWN_TABLE,
  },

  tracks: [
    {
      id: 'base',
      resource: {
        type: 'SLOTS',
        table: SORCERER_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'sorcerer.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.sorcerer',
  },

  labels: {
    known: 'known_spells',
    action: 'cast',
  },
};

// ============================================================================
// SPECIAL CHANGE CGE_DEFINITION
// ============================================================================

export const sorcererCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: sorcererCGEConfig,
};

// ============================================================================
// CLASE SORCERER SIMPLIFICADA PARA TESTS
// ============================================================================

export const sorcerer: CharacterClass = {
  name: "Sorcerer",
  uniqueId: "sorcerer",
  hitDie: 4,
  baseAttackBonusProgression: BabType.POOR,
  baseSavesProgression: {
    fortitude: SaveType.POOR,
    reflex: SaveType.POOR,
    will: SaveType.GOOD,
  },
  classFeatures: [],
  levels: [
    {
      level: 1,
      classFeatures: [
        {
          name: 'Sorcerer Spellcasting',
          description: 'Spontaneous arcane spellcasting',
          featureType: featureTypes.CLASS_FEATURE,
          uniqueId: 'sorcerer-spellcasting',
          changes: [],
          specialChanges: [sorcererCGEDefinition],
        },
      ],
    },
  ],
  spellCasting: true,
  spellCastingAbilityUniqueId: "charisma",
  allSpellsKnown: false,
};

// ============================================================================
// ABILITY SCORES PARA TESTS
// ============================================================================

export const standardAbilityScores = {
  strength: 10,
  dexterity: 14,
  constitution: 12,
  intelligence: 10,
  wisdom: 10,
  charisma: 16, // +3 modifier para bonus spells
};

// ============================================================================
// BUILDER HELPERS
// ============================================================================

export function createBaseSorcerer(level: number = 1) {
  return buildCharacter()
    .withName("Test Sorcerer")
    .withBaseAbilityScores(standardAbilityScores)
    .withClassLevels(sorcerer, level);
}

export function createBaseWizard(level: number = 1) {
  return buildCharacter()
    .withName("Test Wizard")
    .withBaseAbilityScores({
      ...standardAbilityScores,
      intelligence: 16, // +3 modifier para bonus spells
      charisma: 10,
    })
    .withClassLevels(wizard, level);
}

// ============================================================================
// TABLAS DE CLERIC (Vancian sin known)
// ============================================================================

// Slots base del Cleric (sin slots de dominio)
export const CLERIC_BASE_SLOTS_TABLE: LevelTable = {
  1: [3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [5, 3, 2, 0, 0, 0, 0, 0, 0, 0],
  5: [5, 3, 2, 1, 0, 0, 0, 0, 0, 0],
};

// Slots de dominio: 1 slot por nivel de conjuro disponible
export const CLERIC_DOMAIN_SLOTS_TABLE: LevelTable = {
  1: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  5: [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
};

// ============================================================================
// CGE CONFIG DE CLERIC
// ============================================================================

export const clericCGEConfig: CGEConfig = {
  id: 'cleric-spells',
  classId: 'cleric',
  entityType: 'spell',
  levelPath: '@entity.levels.cleric',

  // TODO: accessFilter usando EntityFilter de levels/filtering

  // SIN known config: el Cleric puede preparar cualquier conjuro clerical
  // (no tiene spellbook, accede a toda la lista)

  tracks: [
    {
      id: 'base',
      label: 'base_slots',
      resource: {
        type: 'SLOTS',
        table: CLERIC_BASE_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      preparation: { type: 'BOUND' },
    },
    {
      id: 'domain',
      label: 'domain_slots',
      // TODO: filter para solo conjuros de dominios usando EntityFilter
      resource: {
        type: 'SLOTS',
        table: CLERIC_DOMAIN_SLOTS_TABLE,
        refresh: 'daily',
      },
      preparation: { type: 'BOUND' },
    },
  ],

  variables: {
    classPrefix: 'cleric.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.cleric',
  },

  labels: {
    known: 'divine_spells',
    prepared: 'prepared_spells',
    action: 'cast',
  },
};

// ============================================================================
// SPECIAL CHANGE CGE_DEFINITION (Cleric)
// ============================================================================

export const clericCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: clericCGEConfig,
};

// ============================================================================
// CLASE CLERIC SIMPLIFICADA PARA TESTS
// ============================================================================

export const cleric: CharacterClass = {
  name: "Cleric",
  uniqueId: "cleric",
  hitDie: 8,
  baseAttackBonusProgression: BabType.MEDIUM,
  baseSavesProgression: {
    fortitude: SaveType.GOOD,
    reflex: SaveType.POOR,
    will: SaveType.GOOD,
  },
  classFeatures: [],
  levels: [
    {
      level: 1,
      classFeatures: [
        {
          name: 'Cleric Spellcasting',
          description: 'Divine spellcasting with full spell list access',
          featureType: featureTypes.CLASS_FEATURE,
          uniqueId: 'cleric-spellcasting',
          changes: [],
          specialChanges: [clericCGEDefinition],
        },
      ],
    },
  ],
  spellCasting: true,
  spellCastingAbilityUniqueId: "wisdom",
  allSpellsKnown: true, // Cleric tiene acceso a toda la lista
};

// ============================================================================
// BUILDER HELPERS (Cleric)
// ============================================================================

export function createBaseCleric(level: number = 1) {
  return buildCharacter()
    .withName("Test Cleric")
    .withBaseAbilityScores({
      ...standardAbilityScores,
      wisdom: 16, // +3 modifier para bonus spells
      charisma: 10,
    })
    .withClassLevels(cleric, level);
}

// ============================================================================
// TABLAS DE WARLOCK (At-will)
// ============================================================================

// Invocaciones conocidas por nivel de clase (total, no por nivel de entidad)
// En D&D 3.5, el Warlock tiene un numero total de invocaciones conocidas
export const WARLOCK_KNOWN_TABLE: LevelTable = {
  1: [1],  // 1 invocacion total
  2: [2],
  3: [2],
  4: [3],
  5: [3],
  6: [4],  // Gana acceso a Lesser invocations
};

// ============================================================================
// CGE CONFIG DE WARLOCK
// ============================================================================

export const warlockCGEConfig: CGEConfig = {
  id: 'warlock-invocations',
  classId: 'warlock',
  entityType: 'invocation',
  levelPath: '@entity.level', // Invocaciones tienen nivel fijo (Least, Lesser, etc)

  // TODO: accessFilter para limitar por grado de invocacion
  // (Least a nivel 1-5, Lesser a nivel 6+, Greater a nivel 11+, Dark a nivel 16+)

  known: {
    type: 'LIMITED_TOTAL',
    table: WARLOCK_KNOWN_TABLE,
  },

  tracks: [
    {
      id: 'base',
      // Recurso NONE: las invocaciones son at-will
      resource: { type: 'NONE' },
      // Sin preparacion: usa cualquier invocacion conocida
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'warlock.invocation',
    genericPrefix: 'invocation',
    casterLevelVar: 'castingClassLevel.warlock',
  },

  labels: {
    known: 'known_invocations',
    action: 'invoke',
  },
};

// ============================================================================
// SPECIAL CHANGE CGE_DEFINITION (Warlock)
// ============================================================================

export const warlockCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: warlockCGEConfig,
};

// ============================================================================
// CLASE WARLOCK SIMPLIFICADA PARA TESTS
// ============================================================================

export const warlock: CharacterClass = {
  name: "Warlock",
  uniqueId: "warlock",
  hitDie: 6,
  baseAttackBonusProgression: BabType.MEDIUM,
  baseSavesProgression: {
    fortitude: SaveType.POOR,
    reflex: SaveType.POOR,
    will: SaveType.GOOD,
  },
  classFeatures: [],
  levels: [
    {
      level: 1,
      classFeatures: [
        {
          name: 'Invocations',
          description: 'At-will supernatural abilities',
          featureType: featureTypes.CLASS_FEATURE,
          uniqueId: 'warlock-invocations',
          changes: [],
          specialChanges: [warlockCGEDefinition],
        },
      ],
    },
  ],
  spellCasting: false, // Warlock no es caster tradicional
  spellCastingAbilityUniqueId: "charisma",
  allSpellsKnown: false,
};

// ============================================================================
// BUILDER HELPERS (Warlock)
// ============================================================================

export function createBaseWarlock(level: number = 1) {
  return buildCharacter()
    .withName("Test Warlock")
    .withBaseAbilityScores(standardAbilityScores)
    .withClassLevels(warlock, level);
}
