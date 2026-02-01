/**
 * Ejemplos de configuraciones CGE para diferentes clases.
 */

import type { CGEConfig, LevelTable } from './types'

// ============================================================================
// TABLAS DE REFERENCIA
// ============================================================================

const SORCERER_SLOTS_TABLE: LevelTable = {
  1: [5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [6, 4, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [6, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [6, 6, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [6, 6, 4, 0, 0, 0, 0, 0, 0, 0],
  6: [6, 6, 5, 3, 0, 0, 0, 0, 0, 0],
  7: [6, 6, 6, 4, 0, 0, 0, 0, 0, 0],
  8: [6, 6, 6, 5, 3, 0, 0, 0, 0, 0],
  9: [6, 6, 6, 6, 4, 0, 0, 0, 0, 0],
  10: [6, 6, 6, 6, 5, 3, 0, 0, 0, 0],
  11: [6, 6, 6, 6, 6, 4, 0, 0, 0, 0],
  12: [6, 6, 6, 6, 6, 5, 3, 0, 0, 0],
  13: [6, 6, 6, 6, 6, 6, 4, 0, 0, 0],
  14: [6, 6, 6, 6, 6, 6, 5, 3, 0, 0],
  15: [6, 6, 6, 6, 6, 6, 6, 4, 0, 0],
  16: [6, 6, 6, 6, 6, 6, 6, 5, 3, 0],
  17: [6, 6, 6, 6, 6, 6, 6, 6, 4, 0],
  18: [6, 6, 6, 6, 6, 6, 6, 6, 5, 3],
  19: [6, 6, 6, 6, 6, 6, 6, 6, 6, 4],
  20: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
}

const SORCERER_KNOWN_TABLE: LevelTable = {
  1: [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [5, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [6, 3, 1, 0, 0, 0, 0, 0, 0, 0],
  5: [6, 4, 2, 0, 0, 0, 0, 0, 0, 0],
  6: [7, 4, 2, 1, 0, 0, 0, 0, 0, 0],
  7: [7, 5, 3, 2, 0, 0, 0, 0, 0, 0],
  8: [8, 5, 3, 2, 1, 0, 0, 0, 0, 0],
  9: [8, 5, 4, 3, 2, 0, 0, 0, 0, 0],
  10: [9, 5, 4, 3, 2, 1, 0, 0, 0, 0],
  11: [9, 5, 5, 4, 3, 2, 0, 0, 0, 0],
  12: [9, 5, 5, 4, 3, 2, 1, 0, 0, 0],
  13: [9, 5, 5, 4, 4, 3, 2, 0, 0, 0],
  14: [9, 5, 5, 4, 4, 3, 2, 1, 0, 0],
  15: [9, 5, 5, 4, 4, 4, 3, 2, 0, 0],
  16: [9, 5, 5, 4, 4, 4, 3, 2, 1, 0],
  17: [9, 5, 5, 4, 4, 4, 3, 3, 2, 0],
  18: [9, 5, 5, 4, 4, 4, 3, 3, 2, 1],
  19: [9, 5, 5, 4, 4, 4, 3, 3, 3, 2],
  20: [9, 5, 5, 4, 4, 4, 3, 3, 3, 3],
}

const CLERIC_SLOTS_TABLE: LevelTable = {
  1: [3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [5, 3, 2, 0, 0, 0, 0, 0, 0, 0],
  5: [5, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  6: [5, 3, 3, 2, 0, 0, 0, 0, 0, 0],
  7: [6, 4, 3, 2, 1, 0, 0, 0, 0, 0],
  8: [6, 4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [6, 4, 4, 3, 2, 1, 0, 0, 0, 0],
  10: [6, 4, 4, 3, 3, 2, 0, 0, 0, 0],
  11: [6, 5, 4, 4, 3, 2, 1, 0, 0, 0],
  12: [6, 5, 4, 4, 3, 3, 2, 0, 0, 0],
  13: [6, 5, 5, 4, 4, 3, 2, 1, 0, 0],
  14: [6, 5, 5, 4, 4, 3, 3, 2, 0, 0],
  15: [6, 5, 5, 5, 4, 4, 3, 2, 1, 0],
  16: [6, 5, 5, 5, 4, 4, 3, 3, 2, 0],
  17: [6, 5, 5, 5, 5, 4, 4, 3, 2, 1],
  18: [6, 5, 5, 5, 5, 4, 4, 3, 3, 2],
  19: [6, 5, 5, 5, 5, 5, 4, 4, 3, 3],
  20: [6, 5, 5, 5, 5, 5, 4, 4, 4, 4],
}

// 1 slot de dominio por nivel de conjuro desbloqueado
const DOMAIN_SLOTS_TABLE: LevelTable = {
  1: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  5: [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  6: [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  7: [0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  8: [0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  9: [0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  10: [0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  11: [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  12: [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  13: [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  14: [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  15: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  16: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  17: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  18: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  19: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  20: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
}

const WARBLADE_KNOWN_TABLE: LevelTable = {
  1: [3],
  2: [4],
  3: [5],
  4: [5],
  5: [6],
  6: [6],
  7: [7],
  8: [7],
  9: [8],
  10: [8],
  11: [9],
  12: [9],
  13: [10],
  14: [10],
  15: [11],
  16: [11],
  17: [12],
  18: [12],
  19: [13],
  20: [13],
}

const WARBLADE_READIED_TABLE: LevelTable = {
  1: [3],
  2: [3],
  3: [3],
  4: [4],
  5: [4],
  6: [4],
  7: [5],
  8: [5],
  9: [5],
  10: [6],
  11: [6],
  12: [6],
  13: [7],
  14: [7],
  15: [7],
  16: [8],
  17: [8],
  18: [8],
  19: [9],
  20: [9],
}

// ============================================================================
// EJEMPLO: SORCERER (D&D 3.5)
// ============================================================================
// - Slots por nivel, conocidos limitados, sin preparacion
// ============================================================================

export const sorcererCGE: CGEConfig = {
  id: 'sorcerer-spells',
  classId: 'sorcerer',
  entityType: 'spell',
  levelPath: '@entity.levels.sorcerer',

  accessFilter: {
    field: 'lists',
    operator: 'contains',
    value: 'sorcerer',
  },

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
}

// ============================================================================
// EJEMPLO: CLERIC (D&D 3.5)
// ============================================================================
// - Slots por nivel, acceso a toda la lista, preparacion bound
// - Dos tracks: base + dominios
// ============================================================================

export const clericCGE: CGEConfig = {
  id: 'cleric-spells',
  classId: 'cleric',
  entityType: 'spell',
  levelPath: '@entity.levels.cleric',

  accessFilter: {
    field: 'lists',
    operator: 'contains',
    value: 'cleric',
  },

  // Sin known = accede a toda la lista filtrada

  tracks: [
    {
      id: 'base',
      resource: {
        type: 'SLOTS',
        table: CLERIC_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      preparation: { type: 'BOUND' },
    },
    {
      id: 'domain',
      label: 'domain_slots',
      filter: {
        field: 'domains',
        operator: 'intersects',
        value: { expression: '@character.clericDomains' },
      },
      resource: {
        type: 'SLOTS',
        table: DOMAIN_SLOTS_TABLE,
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
    prepared: 'prepared_spells',
    action: 'cast',
  },
}

// ============================================================================
// EJEMPLO: WARBLADE (Tome of Battle)
// ============================================================================
// - Sin recurso externo, conocidos limitados
// - Preparacion de lista que se consume al usar
// - Recuperacion manual (accion en combate)
// ============================================================================

export const warbladeCGE: CGEConfig = {
  id: 'warblade-maneuvers',
  classId: 'warblade',
  entityType: 'maneuver',
  levelPath: '@entity.level',

  accessFilter: {
    field: 'disciplines',
    operator: 'intersects',
    value: ['Diamond Mind', 'Iron Heart', 'Stone Dragon', 'Tiger Claw', 'White Raven'],
  },

  known: {
    type: 'LIMITED_TOTAL',
    table: WARBLADE_KNOWN_TABLE, // Total de maniobras conocidas (de cualquier nivel)
  },

  tracks: [
    {
      id: 'base',
      resource: { type: 'NONE' },
      preparation: {
        type: 'LIST',
        structure: 'GLOBAL', // Readied de cualquier nivel, no separados
        maxFormula: { expression: '@warblade.readiedManeuvers' }, // Viene de tabla
        consumeOnUse: true,
        recovery: 'manual',
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
}

// ============================================================================
// EJEMPLO: PSION (Expanded Psionics Handbook)
// ============================================================================
// - Pool unico de power points, conocidos limitados, sin preparacion
// ============================================================================

export const psionCGE: CGEConfig = {
  id: 'psion-powers',
  classId: 'psion',
  entityType: 'power',
  levelPath: '@entity.level',

  // TODO: actualizar accessFilter al tipo correcto de EntityFilter
  // accessFilter: {
  //   field: 'lists',
  //   operator: 'contains',
  //   value: 'psion',
  // },

  // Define el recurso de Power Points
  resources: [
    {
      resourceId: 'psion-power-points',
      name: 'Power Points',
      maxValueFormula: { expression: '@customVariable.psion.powerPoints.base' },
      rechargeFormula: { expression: '@resources.psion-power-points.max' },
    },
  ],

  known: {
    type: 'LIMITED_TOTAL', // Total de poderes conocidos (de cualquier nivel)
    table: {
      1: [3],
      2: [5],
      3: [7],
      4: [9],
      5: [11],
      6: [13],
      7: [15],
      8: [17],
      9: [19],
      10: [21],
      11: [23],
      12: [25],
      13: [27],
      14: [29],
      15: [31],
      16: [33],
      17: [35],
      18: [37],
      19: [39],
      20: [41],
    },
  },

  tracks: [
    {
      id: 'base',
      resource: {
        type: 'POOL',
        resourceId: 'psion-power-points',
        costPath: '@entity.level', // Coste = nivel del poder
        refresh: 'daily',
      },
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
}

// ============================================================================
// EJEMPLO: WARLOCK (Complete Arcane)
// ============================================================================
// - At-will, conocidos limitados, sin preparacion
// ============================================================================

export const warlockCGE: CGEConfig = {
  id: 'warlock-invocations',
  classId: 'warlock',
  entityType: 'invocation',
  levelPath: '@entity.gradeLevel', // least=1, lesser=6, greater=11, dark=16

  known: {
    type: 'LIMITED_TOTAL', // Total de invocaciones conocidas
    table: {
      1: [1],
      2: [2],
      3: [2],
      4: [3],
      5: [3],
      6: [4],
      7: [4],
      8: [5],
      9: [5],
      10: [6],
      11: [7],
      12: [7],
      13: [8],
      14: [8],
      15: [9],
      16: [10],
      17: [10],
      18: [11],
      19: [11],
      20: [12],
    },
  },

  tracks: [
    {
      id: 'base',
      resource: { type: 'NONE' },
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'warlock.invocation',
    genericPrefix: 'invocation',
    casterLevelVar: 'invocationLevel.warlock',
  },

  labels: {
    known: 'known_invocations',
    action: 'invoke',
  },
}

// ============================================================================
// EJEMPLO: SPIRIT SHAMAN (D&D 3.5)
// ============================================================================
// - Slots por nivel, acceso a toda la lista
// - Preparacion de lista PER_LEVEL (X de nivel 1, Y de nivel 2...)
// - Lanza espontaneamente DENTRO de cada nivel (no entre niveles)
// ============================================================================

const SPIRIT_SHAMAN_SLOTS_TABLE: LevelTable = {
  1: [5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [6, 4, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [6, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [6, 6, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [6, 6, 4, 0, 0, 0, 0, 0, 0, 0],
  6: [6, 6, 5, 3, 0, 0, 0, 0, 0, 0],
  7: [6, 6, 6, 4, 0, 0, 0, 0, 0, 0],
  8: [6, 6, 6, 5, 3, 0, 0, 0, 0, 0],
  9: [6, 6, 6, 6, 4, 0, 0, 0, 0, 0],
  10: [6, 6, 6, 6, 5, 3, 0, 0, 0, 0],
  // ...continua
}

export const spiritShamanCGE: CGEConfig = {
  id: 'spirit-shaman-spells',
  classId: 'spirit-shaman',
  entityType: 'spell',
  levelPath: '@entity.levels.spiritShaman',

  accessFilter: {
    field: 'lists',
    operator: 'contains',
    value: 'spirit-shaman',
  },

  // Sin known = accede a toda la lista

  tracks: [
    {
      id: 'base',
      resource: {
        type: 'SLOTS',
        table: SPIRIT_SHAMAN_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      preparation: {
        type: 'LIST',
        structure: 'PER_LEVEL', // Prepara por nivel, como Cleric
        maxPerLevel: SPIRIT_SHAMAN_SLOTS_TABLE, // Prepara tantos como slots tiene
        consumeOnUse: false, // Pero lanza espontaneamente de los preparados
      },
    },
  ],

  variables: {
    classPrefix: 'spiritShaman.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.spiritShaman',
  },

  labels: {
    prepared: 'retrieved_spells', // Spirit Shaman "retrieves" spells
    action: 'cast',
  },
}

// ============================================================================
// EJEMPLO: WIZARD 5E
// ============================================================================
// - Slots por nivel, libro ilimitado
// - Preparacion de lista GLOBAL (no por nivel)
// - Puede lanzar cualquier preparado con cualquier slot adecuado
// ============================================================================

export const wizard5eCGE: CGEConfig = {
  id: 'wizard-5e-spells',
  classId: 'wizard',
  entityType: 'spell',
  levelPath: '@entity.level', // En 5e el nivel es unico

  accessFilter: {
    field: 'lists',
    operator: 'contains',
    value: 'wizard',
  },

  known: { type: 'UNLIMITED' },

  tracks: [
    {
      id: 'base',
      resource: {
        type: 'SLOTS',
        table: {
          // Tabla 5e simplificada
          1: [3, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          2: [3, 3, 0, 0, 0, 0, 0, 0, 0, 0],
          3: [3, 4, 2, 0, 0, 0, 0, 0, 0, 0],
          4: [4, 4, 3, 0, 0, 0, 0, 0, 0, 0],
          5: [4, 4, 3, 2, 0, 0, 0, 0, 0, 0],
          // ...continua
        },
        refresh: 'daily',
      },
      preparation: {
        type: 'LIST',
        structure: 'GLOBAL', // Lista unica, no separada por nivel
        maxFormula: { expression: '@class.wizard.level + @ability.intelligence.modifier' },
        consumeOnUse: false,
      },
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
}

// ============================================================================
// EJEMPLO: ARCANIST (Pathfinder 1e)
// ============================================================================
// - Slots por nivel, libro ilimitado
// - Preparacion de lista POR NIVEL (X de nivel 1, Y de nivel 2, etc.)
// - Solo puede lanzar preparados de nivel N con slots de nivel N
// - Flexibilidad DENTRO del nivel, no ENTRE niveles
// ============================================================================

export const arcanistCGE: CGEConfig = {
  id: 'arcanist-spells',
  classId: 'arcanist',
  entityType: 'spell',
  levelPath: '@entity.levels.arcanist',

  accessFilter: {
    field: 'lists',
    operator: 'contains',
    value: 'wizard',
  },

  known: { type: 'UNLIMITED' },

  tracks: [
    {
      id: 'base',
      resource: {
        type: 'SLOTS',
        table: {
          // Slots del Arcanist (menos que Wizard)
          1: [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          2: [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
          3: [0, 4, 0, 0, 0, 0, 0, 0, 0, 0],
          4: [0, 4, 2, 0, 0, 0, 0, 0, 0, 0],
          5: [0, 4, 3, 0, 0, 0, 0, 0, 0, 0],
          6: [0, 4, 4, 2, 0, 0, 0, 0, 0, 0],
          // ...continua
        },
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      preparation: {
        type: 'LIST',
        structure: 'PER_LEVEL', // Preparacion separada por nivel
        maxPerLevel: {
          // Conjuros preparados por nivel (diferente de slots!)
          1: [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          2: [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          3: [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
          4: [0, 3, 1, 0, 0, 0, 0, 0, 0, 0],
          5: [0, 4, 2, 0, 0, 0, 0, 0, 0, 0],
          6: [0, 4, 2, 1, 0, 0, 0, 0, 0, 0],
          // ...continua
        },
        consumeOnUse: false,
      },
    },
  ],

  variables: {
    classPrefix: 'arcanist.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.arcanist',
  },

  labels: {
    known: 'spellbook',
    prepared: 'prepared_spells',
    action: 'cast',
  },
}
