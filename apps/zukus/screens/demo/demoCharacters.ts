/**
 * Demo Characters for CGE Demo Screen
 *
 * This file is .ts (not .tsx) to avoid React Compiler processing.
 * Contains static data and pure functions for creating demo characters.
 */

import {
  calculateCharacterSheet,
  type CharacterBaseData,
  type CharacterSheet,
  type CGEConfig,
  type CGEState,
  type LevelTable,
  type SpecialFeature,
  type CGEDefinitionChange,
} from '@zukus/core'

// =============================================================================
// Class Definitions (minimal for calculation)
// =============================================================================

type CharacterClass = {
  uniqueId: string
  name: string
  hitDie: number
  baseSavesProgression: {
    fortitude: 'GOOD' | 'POOR'
    reflex: 'GOOD' | 'POOR'
    will: 'GOOD' | 'POOR'
  }
  baseAttackBonusProgression: 'GOOD' | 'AVERAGE' | 'POOR'
  levels: { level: number; classFeatures: never[] }[]
  classFeatures: never[]
  spellCasting: boolean
}

const DEMO_CLASSES: Record<string, CharacterClass> = {
  wizard: {
    uniqueId: 'wizard',
    name: 'Wizard',
    hitDie: 4,
    baseSavesProgression: { fortitude: 'POOR', reflex: 'POOR', will: 'GOOD' },
    baseAttackBonusProgression: 'POOR',
    levels: Array.from({ length: 20 }, (_, i) => ({ level: i + 1, classFeatures: [] })),
    classFeatures: [],
    spellCasting: true,
  },
  sorcerer: {
    uniqueId: 'sorcerer',
    name: 'Sorcerer',
    hitDie: 4,
    baseSavesProgression: { fortitude: 'POOR', reflex: 'POOR', will: 'GOOD' },
    baseAttackBonusProgression: 'POOR',
    levels: Array.from({ length: 20 }, (_, i) => ({ level: i + 1, classFeatures: [] })),
    classFeatures: [],
    spellCasting: true,
  },
  cleric: {
    uniqueId: 'cleric',
    name: 'Cleric',
    hitDie: 8,
    baseSavesProgression: { fortitude: 'GOOD', reflex: 'POOR', will: 'GOOD' },
    baseAttackBonusProgression: 'AVERAGE',
    levels: Array.from({ length: 20 }, (_, i) => ({ level: i + 1, classFeatures: [] })),
    classFeatures: [],
    spellCasting: true,
  },
  warblade: {
    uniqueId: 'warblade',
    name: 'Warblade',
    hitDie: 12,
    baseSavesProgression: { fortitude: 'GOOD', reflex: 'POOR', will: 'POOR' },
    baseAttackBonusProgression: 'GOOD',
    levels: Array.from({ length: 20 }, (_, i) => ({ level: i + 1, classFeatures: [] })),
    classFeatures: [],
    spellCasting: false,
  },
  psion: {
    uniqueId: 'psion',
    name: 'Psion',
    hitDie: 4,
    baseSavesProgression: { fortitude: 'POOR', reflex: 'POOR', will: 'GOOD' },
    baseAttackBonusProgression: 'POOR',
    levels: Array.from({ length: 20 }, (_, i) => ({ level: i + 1, classFeatures: [] })),
    classFeatures: [],
    spellCasting: false,
  },
  warlock: {
    uniqueId: 'warlock',
    name: 'Warlock',
    hitDie: 6,
    baseSavesProgression: { fortitude: 'POOR', reflex: 'POOR', will: 'GOOD' },
    baseAttackBonusProgression: 'POOR',
    levels: Array.from({ length: 20 }, (_, i) => ({ level: i + 1, classFeatures: [] })),
    classFeatures: [],
    spellCasting: false,
  },
}

// =============================================================================
// CGE Configurations (from srd/testClasses)
// =============================================================================

const WIZARD_SLOTS: LevelTable = {
  5: [4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
}

const SORCERER_SLOTS: LevelTable = {
  5: [6, 6, 4, 0, 0, 0, 0, 0, 0, 0],
}

const SORCERER_KNOWN: LevelTable = {
  5: [6, 4, 2, 0, 0, 0, 0, 0, 0, 0],
}

const CLERIC_SLOTS: LevelTable = {
  5: [5, 3, 2, 1, 0, 0, 0, 0, 0, 0],
}

const WARBLADE_KNOWN: LevelTable = {
  5: [6],
}

const PSION_KNOWN: LevelTable = {
  5: [7],
}

const WARLOCK_KNOWN: LevelTable = {
  5: [3],
}

// =============================================================================
// Demo Character Definitions
// =============================================================================

export type DemoCharacterDef = {
  id: string
  name: string
  subtitle: string
  description: string
  classId: string
  entityType: string
  cgeConfig: CGEConfig
  initialCgeState: CGEState
}

// =============================================================================
// Real Compendium Entity IDs (Spanish - from the actual compendium)
// =============================================================================

// Wizard spells (Spanish IDs from compendium)
const WIZARD_SPELLS_0 = ['amanuense', 'luces-danzantes', 'lanzar-virote', 'mano-del-mago', 'sonido-fantasma', 'perturbar-muertos-vivientes']
const WIZARD_SPELLS_1 = ['ventriloquia', 'muro-de-humo', 'sensibilidad-arcana', 'impacto-verdadero', 'retirada-expeditiva', 'borrar']
const WIZARD_SPELLS_2 = ['objeto-marcado', 'racha-de-suerte', 'huesos-de-piedra', 'fauces-de-la-anguila']
const WIZARD_SPELLS_3 = ['abotargamiento-necrotico', 'escritura-ilusoria', 'intermitencia', 'bola-de-fuego']

// Sorcerer spells (Spanish IDs from compendium)
const SORCERER_SPELLS_1 = ['alas-de-vuelo-rapido', 'cola-fantasmal', 'fuerza-de-la-verdadera-forma', 'alas-de-salto']
const SORCERER_SPELLS_2 = ['magia-del-corazon-draconico', 'cazador-primario', 'golpe-con-la-cola']

// Cleric spells (Spanish IDs from compendium)
const CLERIC_SPELLS_0 = ['amanuense', 'remendar', 'luz', 'leer-magia', 'infligir-heridas-menores', 'resistencia']
const CLERIC_SPELLS_1 = ['santuario', 'esconderse-de-los-muertos-vivientes', 'perdicion', 'punteria-bendita']
const CLERIC_SPELLS_2 = ['explosion-de-sonido', 'encontrar-trampas', 'huesos-de-piedra', 'augurio']

// Warblade maneuvers (English IDs from test entities)
const WARBLADE_MANEUVERS = ['steel-wind', 'moment-of-perfect-mind', 'iron-heart-surge', 'punishing-stance']

// Psion powers (English IDs from new power compendium)
const PSION_POWERS = ['mind-thrust', 'energy-ray', 'vigor', 'precognition', 'astral-construct', 'mind-link', 'charm-psionic']

export const DEMO_CHARACTER_DEFS: DemoCharacterDef[] = [
  // Wizard: UNLIMITED + SLOTS + BOUND
  {
    id: 'demo-wizard',
    name: 'Wizard Demo',
    subtitle: 'UNLIMITED + SLOTS + BOUND',
    description: 'Libro de conjuros ilimitado. Prepara conjuros especificos en cada slot.',
    classId: 'wizard',
    entityType: 'spell',
    cgeConfig: {
      id: 'wizard-spells',
      classId: 'wizard',
      entityType: 'spell',
      levelPath: '@entity.levels.wizard',
      known: { type: 'UNLIMITED' },
      tracks: [{
        id: 'base',
        resource: { type: 'SLOTS', table: WIZARD_SLOTS, refresh: 'daily' },
        preparation: { type: 'BOUND' },
      }],
      variables: { classPrefix: 'wizard.spell', genericPrefix: 'spell', casterLevelVar: 'castingClassLevel.wizard' },
      labels: { known: 'spellbook', prepared: 'prepared_spells', slot: 'spell_slot', action: 'cast', pool: '' },
    },
    initialCgeState: {
      knownSelections: {
        '0': WIZARD_SPELLS_0,
        '1': WIZARD_SPELLS_1,
        '2': WIZARD_SPELLS_2,
        '3': WIZARD_SPELLS_3,
      },
      boundPreparations: {
        'base:0-0': WIZARD_SPELLS_0[0],
        'base:0-1': WIZARD_SPELLS_0[1],
        'base:0-2': WIZARD_SPELLS_0[2],
        'base:0-3': WIZARD_SPELLS_0[3],
        'base:1-0': WIZARD_SPELLS_1[0],
        'base:1-1': WIZARD_SPELLS_1[1],
        'base:1-2': WIZARD_SPELLS_1[2],
        'base:2-0': WIZARD_SPELLS_2[0],
        'base:2-1': WIZARD_SPELLS_2[1],
        'base:3-0': WIZARD_SPELLS_3[0],
      },
    },
  },

  // Sorcerer: LIMITED_PER_LEVEL + SLOTS + NONE
  {
    id: 'demo-sorcerer',
    name: 'Sorcerer Demo',
    subtitle: 'LIMITED_PER_LEVEL + SLOTS + NONE',
    description: 'Conocidos limitados por nivel. Lanza espontaneamente gastando slots.',
    classId: 'sorcerer',
    entityType: 'spell',
    cgeConfig: {
      id: 'sorcerer-spells',
      classId: 'sorcerer',
      entityType: 'spell',
      levelPath: '@entity.levels.sorcerer',
      known: { type: 'LIMITED_PER_ENTITY_LEVEL', table: SORCERER_KNOWN },
      tracks: [{
        id: 'base',
        resource: { type: 'SLOTS', table: SORCERER_SLOTS, refresh: 'daily' },
        preparation: { type: 'NONE' },
      }],
      variables: { classPrefix: 'sorcerer.spell', genericPrefix: 'spell', casterLevelVar: 'castingClassLevel.sorcerer' },
      labels: { known: 'known_spells', prepared: '', slot: 'spell_slot', action: 'cast', pool: '' },
    },
    initialCgeState: {
      knownSelections: {
        '1': SORCERER_SPELLS_1,
        '2': SORCERER_SPELLS_2,
      },
      slotCurrentValues: { '1': -2, '2': -1 },
    },
  },

  // Cleric: UNLIMITED + SLOTS + BOUND
  {
    id: 'demo-cleric',
    name: 'Cleric Demo',
    subtitle: 'UNLIMITED + SLOTS + BOUND',
    description: 'Acceso a toda la lista divina. Prepara como el Mago.',
    classId: 'cleric',
    entityType: 'spell',
    cgeConfig: {
      id: 'cleric-spells',
      classId: 'cleric',
      entityType: 'spell',
      levelPath: '@entity.levels.cleric',
      known: { type: 'UNLIMITED' },
      tracks: [{
        id: 'base',
        resource: { type: 'SLOTS', table: CLERIC_SLOTS, refresh: 'daily' },
        preparation: { type: 'BOUND' },
      }],
      variables: { classPrefix: 'cleric.spell', genericPrefix: 'spell', casterLevelVar: 'castingClassLevel.cleric' },
      labels: { known: 'prayers', prepared: 'prepared_spells', slot: 'spell_slot', action: 'cast', pool: '' },
    },
    initialCgeState: {
      knownSelections: {
        '0': CLERIC_SPELLS_0,
        '1': CLERIC_SPELLS_1,
        '2': CLERIC_SPELLS_2,
      },
      boundPreparations: {
        'base:0-0': CLERIC_SPELLS_0[0],
        'base:0-1': CLERIC_SPELLS_0[1],
        'base:1-0': CLERIC_SPELLS_1[0],
        'base:1-1': CLERIC_SPELLS_1[1],
      },
      usedBoundSlots: { 'base:1-0': true },
    },
  },

  // Warblade: LIMITED_TOTAL + NONE + LIST
  {
    id: 'demo-warblade',
    name: 'Warblade Demo',
    subtitle: 'LIMITED_TOTAL + NONE + LIST',
    description: 'Maniobras totales. Se consumen al usar, recupera con accion.',
    classId: 'warblade',
    entityType: 'maneuver',
    cgeConfig: {
      id: 'warblade-maneuvers',
      classId: 'warblade',
      entityType: 'maneuver',
      levelPath: '@entity.level',
      known: { type: 'LIMITED_TOTAL', table: WARBLADE_KNOWN },
      tracks: [{
        id: 'base',
        resource: { type: 'NONE' },
        preparation: { type: 'LIST', structure: 'GLOBAL', maxFormula: { expression: '4' }, consumeOnUse: true, recovery: 'manual' },
      }],
      variables: { classPrefix: 'warblade.maneuver', genericPrefix: 'maneuver', casterLevelVar: 'initiatorLevel.warblade' },
      labels: { known: 'known_maneuvers', prepared: 'readied_maneuvers', slot: '', action: 'initiate', pool: '' },
    },
    initialCgeState: {
      knownSelections: {
        '-1': WARBLADE_MANEUVERS,
      },
    },
  },

  // Psion: LIMITED_TOTAL + POOL + NONE
  {
    id: 'demo-psion',
    name: 'Psion Demo',
    subtitle: 'LIMITED_TOTAL + POOL + NONE',
    description: 'Poderes totales. Gasta puntos de poder. Sin preparacion.',
    classId: 'psion',
    entityType: 'power',
    cgeConfig: {
      id: 'psion-powers',
      classId: 'psion',
      entityType: 'power',
      levelPath: '@entity.level',
      known: { type: 'LIMITED_TOTAL', table: PSION_KNOWN },
      tracks: [{
        id: 'base',
        resource: { type: 'POOL', maxFormula: { expression: '25' }, refresh: 'daily' },
        preparation: { type: 'NONE' },
      }],
      variables: { classPrefix: 'psion.power', genericPrefix: 'power', casterLevelVar: 'manifesterLevel.psion' },
      labels: { known: 'known_powers', prepared: '', slot: '', action: 'manifest', pool: 'power_points' },
    },
    initialCgeState: {
      knownSelections: { '-1': PSION_POWERS },
      poolCurrentValue: 18,
    },
  },

  // Warlock: LIMITED_TOTAL + NONE + NONE
  {
    id: 'demo-warlock',
    name: 'Warlock Demo',
    subtitle: 'LIMITED_TOTAL + NONE + NONE',
    description: 'Invocaciones limitadas. Uso a voluntad sin coste.',
    classId: 'warlock',
    entityType: 'invocation',
    cgeConfig: {
      id: 'warlock-invocations',
      classId: 'warlock',
      entityType: 'invocation',
      levelPath: '@entity.level',
      known: { type: 'LIMITED_TOTAL', table: WARLOCK_KNOWN },
      tracks: [{
        id: 'base',
        resource: { type: 'NONE' },
        preparation: { type: 'NONE' },
      }],
      variables: { classPrefix: 'warlock.invocation', genericPrefix: 'invocation', casterLevelVar: 'invocationLevel.warlock' },
      labels: { known: 'known_invocations', prepared: '', slot: '', action: 'invoke', pool: '' },
    },
    initialCgeState: {
      knownSelections: { '-1': [] },
    },
  },
]

// =============================================================================
// Character Builder
// =============================================================================

function createDemoCharacterBaseData(def: DemoCharacterDef): CharacterBaseData {
  const cgeDefinition: CGEDefinitionChange = {
    type: 'CGE_DEFINITION',
    config: def.cgeConfig,
  }

  const spellcastingFeature: SpecialFeature = {
    uniqueId: `${def.classId}-spellcasting`,
    title: `${def.name} Spellcasting`,
    description: def.description,
    specialChanges: [cgeDefinition],
  }

  const minimalBaseData = {
    name: def.name,
    temporaryHp: 0,
    currentDamage: 0,
    currentTemporalHp: 0,
    baseAbilityData: {
      strength: { baseScore: 10 },
      dexterity: { baseScore: 14 },
      constitution: { baseScore: 14 },
      intelligence: { baseScore: 16 },
      wisdom: { baseScore: 12 },
      charisma: { baseScore: 16 },
    },
    skills: {},
    skillData: {},
    classes: [DEMO_CLASSES[def.classId]],
    level: {
      level: 5,
      xp: 10000,
      levelsData: Array.from({ length: 5 }, (_, i) => ({
        classUniqueId: def.classId,
        level: i + 1,
        hitDie: 6,
        hitDieRoll: 4,
        levelClassFeatures: [],
        levelFeats: [],
        permanentIntelligenceStatAtLevel: 16,
      })),
    },
    equipment: { items: [], money: 0 },
    feats: [],
    buffs: [],
    sharedBuffs: [],
    specialFeatures: [spellcastingFeature],
    cgeState: {
      [def.cgeConfig.id]: def.initialCgeState,
    },
    updatedAt: new Date().toISOString(),
  }

  return minimalBaseData as unknown as CharacterBaseData
}

export type DemoCharacterData = {
  baseData: CharacterBaseData
  sheet: CharacterSheet
}

export function buildDemoCharacter(def: DemoCharacterDef): DemoCharacterData {
  const baseData = createDemoCharacterBaseData(def)
  const sheet = calculateCharacterSheet(baseData)
  return { baseData, sheet }
}
