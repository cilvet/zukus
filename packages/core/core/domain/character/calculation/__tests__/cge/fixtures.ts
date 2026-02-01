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

// ============================================================================
// TABLAS DE PSION (Power Points)
// ============================================================================

// Power Points base por nivel de clase (simplificado para tests)
// En D&D 3.5: 2, 6, 11, 17, 25, 35, 46, 58, 72, 88...
export const PSION_PP_BY_LEVEL: Record<number, number> = {
  1: 2,
  2: 6,
  3: 11,
  4: 17,
  5: 25,
  6: 35,
};

// Poderes conocidos por nivel de poder (similar a Sorcerer)
export const PSION_KNOWN_TABLE: LevelTable = {
  1: [3, 1, 0, 0, 0, 0, 0, 0, 0, 0], // 3 de nivel 0-1, 1 de nivel 1
  2: [5, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [5, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [6, 3, 2, 0, 0, 0, 0, 0, 0, 0],
  5: [6, 3, 2, 1, 0, 0, 0, 0, 0, 0],
};

// ============================================================================
// CGE CONFIG DE PSION
// ============================================================================

export const psionCGEConfig: CGEConfig = {
  id: 'psion-powers',
  classId: 'psion',
  entityType: 'power',
  levelPath: '@entity.level', // Poderes psionicos tienen nivel fijo

  // TODO: accessFilter para disciplinas

  // Define el recurso de Power Points
  resources: [
    {
      resourceId: 'psion-power-points',
      name: 'Power Points',
      // PP base (de custom variable) + bonus INT * nivel
      maxValueFormula: { expression: '@customVariable.psion.powerPoints.base + @ability.intelligence.modifier * @class.psion.level' },
      rechargeFormula: { expression: '@resources.psion-power-points.max' },
    },
  ],

  known: {
    type: 'LIMITED_PER_ENTITY_LEVEL',
    table: PSION_KNOWN_TABLE,
  },

  tracks: [
    {
      id: 'base',
      // Recurso POOL: referencia al recurso definido arriba
      resource: {
        type: 'POOL',
        resourceId: 'psion-power-points',
        costPath: '@entity.level', // Coste = nivel del poder
        refresh: 'daily',
      },
      // Sin preparacion: puede manifestar cualquier poder conocido
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'psion.power',
    genericPrefix: 'power',
    casterLevelVar: 'manifesterLevel.psion',
  },

  labels: {
    known: 'known_powers',
    pool: 'power_points',
    action: 'manifest',
  },
};

// ============================================================================
// SPECIAL CHANGE CGE_DEFINITION (Psion)
// ============================================================================

export const psionCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: psionCGEConfig,
};

// ============================================================================
// CLASE PSION SIMPLIFICADA PARA TESTS
// ============================================================================

export const psion: CharacterClass = {
  name: "Psion",
  uniqueId: "psion",
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
          name: 'Psionics',
          description: 'Psionic power manifestation using power points',
          featureType: featureTypes.CLASS_FEATURE,
          uniqueId: 'psion-psionics',
          changes: [],
          specialChanges: [psionCGEDefinition],
        },
      ],
    },
  ],
  spellCasting: false, // Psion no es caster arcano/divino
  spellCastingAbilityUniqueId: "intelligence",
  allSpellsKnown: false,
};

// ============================================================================
// BUILDER HELPERS (Psion)
// ============================================================================

export function createBasePsion(level: number = 1) {
  return buildCharacter()
    .withName("Test Psion")
    .withBaseAbilityScores({
      ...standardAbilityScores,
      intelligence: 16, // +3 modifier para bonus PP
      charisma: 10,
    })
    .withClassLevels(psion, level);
}

// ============================================================================
// TABLAS DE WARBLADE (Tome of Battle - LIST preparation)
// ============================================================================

// Maniobras conocidas por nivel de clase (total, no por nivel de maniobra)
export const WARBLADE_KNOWN_TABLE: LevelTable = {
  1: [3],  // 3 maniobras conocidas totales
  2: [4],
  3: [5],
  4: [5],
  5: [6],
  6: [6],
};

// Maniobras readied (preparadas) por nivel de clase
export const WARBLADE_READIED_TABLE: LevelTable = {
  1: [3],  // Puede readiar todas sus conocidas a nivel 1
  2: [3],
  3: [3],
  4: [4],
  5: [4],
  6: [4],
};

// ============================================================================
// CGE CONFIG DE WARBLADE
// ============================================================================

export const warbladeCGEConfig: CGEConfig = {
  id: 'warblade-maneuvers',
  classId: 'warblade',
  entityType: 'maneuver',
  levelPath: '@entity.level', // Maniobras tienen nivel fijo

  // TODO: accessFilter para disciplinas del Warblade
  // (Iron Heart, Stone Dragon, Tiger Claw, White Raven, Diamond Mind)

  known: {
    type: 'LIMITED_TOTAL',
    table: WARBLADE_KNOWN_TABLE,
  },

  tracks: [
    {
      id: 'base',
      // Recurso NONE: no hay slots que gastar
      // El sistema de readied/expended es via preparacion LIST
      resource: { type: 'NONE' },

      // Preparacion LIST: readied maneuvers
      preparation: {
        type: 'LIST',
        structure: 'GLOBAL', // Lista unica, no separada por nivel
        maxFormula: { expression: '@warblade.readiedManeuvers' }, // Variable que setea la clase
        consumeOnUse: true, // Cada uso expende la maniobra
        recovery: 'encounter', // Se recuperan al final del encuentro (o con swift action)
      },
    },
  ],

  variables: {
    classPrefix: 'warblade.maneuver',
    genericPrefix: 'maneuver',
    casterLevelVar: 'initiatorLevel.warblade',
  },

  labels: {
    known: 'known_maneuvers',
    prepared: 'readied_maneuvers',
    action: 'initiate',
  },
};

// ============================================================================
// SPECIAL CHANGE CGE_DEFINITION (Warblade)
// ============================================================================

export const warbladeCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: warbladeCGEConfig,
};

// ============================================================================
// CLASE WARBLADE SIMPLIFICADA PARA TESTS
// ============================================================================

export const warblade: CharacterClass = {
  name: "Warblade",
  uniqueId: "warblade",
  hitDie: 12,
  baseAttackBonusProgression: BabType.GOOD,
  baseSavesProgression: {
    fortitude: SaveType.GOOD,
    reflex: SaveType.POOR,
    will: SaveType.POOR,
  },
  classFeatures: [],
  levels: [
    {
      level: 1,
      classFeatures: [
        {
          name: 'Martial Maneuvers',
          description: 'Martial maneuvers from Tome of Battle disciplines',
          featureType: featureTypes.CLASS_FEATURE,
          uniqueId: 'warblade-maneuvers',
          changes: [],
          specialChanges: [warbladeCGEDefinition],
        },
      ],
    },
  ],
  spellCasting: false,
  spellCastingAbilityUniqueId: "intelligence", // Para prerequisitos
  allSpellsKnown: false,
};

// ============================================================================
// BUILDER HELPERS (Warblade)
// ============================================================================

export function createBaseWarblade(level: number = 1) {
  return buildCharacter()
    .withName("Test Warblade")
    .withBaseAbilityScores({
      ...standardAbilityScores,
      strength: 16, // Warblade es martial
      intelligence: 14, // Para recovery y prerequisitos
    })
    .withClassLevels(warblade, level);
}
