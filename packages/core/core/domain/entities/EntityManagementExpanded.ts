import { EntitySchemaDefinition } from './types/schema';
import type { EntityManagementConfig } from './entityManagement/entityManagementConfig';
import type { EntityManagementState } from './entityManagement/entityManagementState';

// ============================================================================
// Nota sobre classLevelVariable y clases de prestigio
// ============================================================================
/**
 * El campo `classLevelVariable` es crucial para clases de prestigio.
 * 
 * Ejemplo: Arcane Trickster (clase de prestigio que avanza conjuros)
 * 
 * Un personaje Mago 5 / Arcane Trickster 3 tendría:
 * - wizard.level = 5 (nivel real de mago)
 * - wizard.effectiveCasterLevel = 8 (5 de mago + 3 de arcane trickster)
 * 
 * El CGE usaría wizard.effectiveCasterLevel para consultar la tabla:
 * - Slots de nivel 1: consulta slotCapacities[1][8] = "4"
 * - Slots de nivel 4: consulta slotCapacities[4][8] = "2"
 * 
 * La variable wizard.effectiveCasterLevel se calcularía como:
 * - Base: @wizard.level
 * - + Modificadores de clases de prestigio (Arcane Trickster aporta +1/nivel)
 * - + Modificadores de talentos/ítems si los hay
 * 
 * Este cálculo se hace en el sistema de cambios, igual que AC o HP.
 */

const spellSchema: EntitySchemaDefinition = {
  typeName: "spell",
  description: "Un conjuro de D&D 3.5",
  fields: [
    {
      name: "schools",
      type: "string_array",
      description: "Escuelas de magia",
      nonEmpty: true,
      allowedValues: [
        "abjuration",
        "conjuration",
        "divination",
        "enchantment",
        "evocation",
        "illusion",
        "necromancy",
        "transmutation",
        "universal"
      ]
    },
    {
      name: "subschools",
      type: "string_array",
      description: "Subescuelas específicas",
      optional: true,
      allowedValues: [
        "calling",
        "creation",
        "healing",
        "summoning",
        "teleportation",
        "scrying",
        "charm",
        "compulsion",
        "figment",
        "glamer",
        "pattern",
        "phantasm",
        "shadow"
      ]
    },
    {
      name: "descriptors",
      type: "string_array",
      description: "Descriptores del conjuro",
      optional: true,
      allowedValues: [
        "acid",
        "air",
        "chaotic",
        "cold",
        "darkness",
        "death",
        "earth",
        "electricity",
        "evil",
        "fear",
        "fire",
        "force",
        "good",
        "language-dependent",
        "lawful",
        "light",
        "mind-affecting",
        "sonic",
        "water"
      ]
    },
    {
      name: "components",
      type: "string_array",
      description: "Componentes requeridos",
      nonEmpty: true,
      allowedValues: ["V", "S", "M", "F", "DF", "XP"]
    },
    {
      name: "materialComponent",
      type: "string",
      description: "Descripción del componente material",
      optional: true
    },
    {
      name: "focus",
      type: "string",
      description: "Descripción del foco",
      optional: true
    },
    {
      name: "xpCost",
      type: "string",
      description: "Coste en XP",
      optional: true
    },
    {
      name: "castingTime",
      type: "string",
      description: "Tiempo de casteo",
      optional: false
    },
    {
      name: "range",
      type: "string",
      description: "Rango del conjuro",
      optional: false
    },
    {
      name: "target",
      type: "string",
      description: "Objetivo del conjuro",
      optional: true
    },
    {
      name: "area",
      type: "string",
      description: "Área de efecto",
      optional: true
    },
    {
      name: "effect",
      type: "string",
      description: "Efecto del conjuro",
      optional: true
    },
    {
      name: "duration",
      type: "string",
      description: "Duración del efecto",
      optional: false
    },
    {
      name: "savingThrow",
      type: "string",
      description: "Tipo de salvación y efecto",
      optional: false
    },
    {
      name: "spellResistance",
      type: "string",
      description: "Si aplica resistencia a conjuros",
      optional: false,
      allowedValues: ["Yes", "No", "Yes (harmless)", "Yes (object)", "See text"]
    },
    {
      name: "shortDescription",
      type: "string",
      description: "Descripción corta",
      optional: true
    },
    {
      name: "classLevels",
      type: "object_array",
      description: "Niveles por clase",
      nonEmpty: true,
      objectFields: [
        {
          name: "className",
          type: "string",
          description: "Nombre de la clase",
          optional: false
        },
        {
          name: "level",
          type: "integer",
          description: "Nivel del conjuro para esta clase",
          optional: false,
          allowedValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        }
      ]
    }
  ]
};

const magicMissile = {
  id: "magic_missile",
  name: "Magic Missile",
  type: "spell",
  description: "A missile of magical energy darts forth from your fingertip and strikes its target, dealing 1d4+1 points of force damage.",
  schools: ["evocation"],
  descriptors: ["force"],
  components: ["V", "S"],
  castingTime: "1 standard action",
  range: "Medium (100 ft. + 10 ft./level)",
  target: "Up to five creatures, no two of which can be more than 15 ft. apart",
  duration: "Instantaneous",
  savingThrow: "None",
  spellResistance: "Yes",
  shortDescription: "1d4+1 damage; +1 missile per two levels above 1st (max 5).",
  classLevels: [
    { className: "Sorcerer", level: 1 },
    { className: "Wizard", level: 1 }
  ]
};

const fireball = {
  id: "fireball",
  name: "Fireball",
  type: "spell",
  description: "A fireball spell is an explosion of flame that detonates with a low roar and deals 1d6 points of fire damage per caster level (maximum 10d6) to every creature within the area.",
  schools: ["evocation"],
  descriptors: ["fire"],
  components: ["V", "S", "M"],
  materialComponent: "A tiny ball of bat guano and sulfur.",
  castingTime: "1 standard action",
  range: "Long (400 ft. + 40 ft./level)",
  area: "20-ft.-radius spread",
  duration: "Instantaneous",
  savingThrow: "Reflex half",
  spellResistance: "Yes",
  shortDescription: "1d6/level damage (max 10d6).",
  classLevels: [
    { className: "Sorcerer", level: 3 },
    { className: "Wizard", level: 3 }
  ]
};

// ============================================================================
// CGE (Configuración de Gestión de Entidades) - Sistema de Mago D&D 3.5
// ============================================================================

/**
 * Configuración INMUTABLE de gestión de conjuros para un Mago
 * 
 * Características del sistema de mago:
 * - Lista accesible: todos los conjuros arcanos (filtro)
 * - Libro de conjuros: subconjunto aprendido (sin límite de cantidad)
 * - Preparación diaria: prepara conjuros en slots por nivel
 * - NO tiene límite de conocidos como el hechicero
 * - NO permite overcast (lanzar de nivel inferior con slot superior)
 */
const wizardSpellConfig: EntityManagementConfig = {
  id: "wizard_spells",
  entityType: "spell",

  // Política: avisar pero no bloquear si se intenta añadir algo raro al libro
  visualizationPolicy: "WARN",

  // Resolución de nivel: nombre de propiedad que contiene el nivel de entidad (conjuro)
  levelResolution: "wizardLevel",

  // Variable que contiene el nivel de clase efectivo (para consultar las tablas)
  // Por defecto será el nivel de mago, pero puede incluir bonificaciones de prestigio
  // Ej: Mago 3 / Loremaster 2 → esta variable sería 5
  classLevelVariable: "wizard.effectiveCasterLevel",

  // Fuente de acceso: vista filtrada de conjuros arcanos
  accessSource: {
    entityType: "spell",
    // TODO: Implementar nuevo sistema de filtros en Fase 0 del sistema de niveles
    // El filtro debe permitir seleccionar conjuros arcanos (Wizard/Sorcerer)
    filter: undefined
  },

  // Modo de gestión: preparación por nivel
  managementMode: {
    type: "PREPARED_BY_LEVEL",

    // Tabla de capacidades de slots: [nivel de conjuro][nivel de clase] -> fórmula
    // TODO: Basado en la tabla de progresión de mago de D&D 3.5
    slotCapacities: {
      // Nivel 0 (cantrips/trucos): ilimitados desde nivel 1
      0: {
        type: "switch",
        switchExpression: "@customVariable.sorcercer.effectiveCasterLevel",
        defaultValue: "3",
        cases: [
          { operator: "==", caseValue: "1",  resultExpression: "3" },
          { operator: "==", caseValue: "2", resultExpression: "4" },
          { operator: "==", caseValue: "3", resultExpression: "4" },
        ],
      },
      1: {
        type: "switch",
        switchExpression: "@customVariable.effectiveCasterLevel",
        defaultValue: "4",
        cases: [
          { operator: "==", caseValue: "1", resultExpression: "4" },
          { operator: "==", caseValue: "2", resultExpression: "5" },
          { operator: "==", caseValue: "3", resultExpression: "6" },
        ],
      },
    },

    // Los magos NO pueden hacer overcast en D&D 3.5
    allowOvercast: false
  }
};


// ============================================================================
// Ejemplo de Hechicero para comparar
// ============================================================================

/**
 * Configuración para un Hechicero
 * 
 * Diferencias con el mago:
 * - NO tiene libro (conoce un conjunto limitado)
 * - Lanzamiento espontáneo (no prepara)
 * - Límite de conocidos por nivel
 * - SÍ permite overcast en algunas variantes
 */
const sorcererSpellConfig: EntityManagementConfig = {
  id: "sorcerer_spells",
  entityType: "spell",

  visualizationPolicy: "WARN",

  // Resolución de nivel de entidad (conjuro)
  levelResolution: "sorcererLevel",

  // Variable que contiene el nivel de clase efectivo
  classLevelVariable: "sorcerer.effectiveCasterLevel",

  // Acceso: toda la lista arcana (no hay libro)
  accessSource: {
    entityType: "spell",
    // TODO: Implementar nuevo sistema de filtros en Fase 0 del sistema de niveles
    filter: undefined
  },

  managementMode: {
    type: "SPONTANEOUS",

    // Tabla de slots para hechicero (similar a mago pero con algunas diferencias)
    slotCapacities: {
      0: {
        1: "5",
        2: "6",
        3: "6",
        4: "6",
        5: "6",
        6: "6",
        7: "6",
        8: "6",
        9: "6",
        10: "6",
        11: "6",
        12: "6",
        13: "6",
        14: "6",
        15: "6",
        16: "6",
        17: "6",
        18: "6",
        19: "6",
        20: "6"
      },
      1: {
        1: "3",
        2: "4",
        3: "5",
        4: "6",
        5: "6",
        6: "6",
        7: "6",
        8: "6",
        9: "6",
        10: "6",
        11: "6",
        12: "6",
        13: "6",
        14: "6",
        15: "6",
        16: "6",
        17: "6",
        18: "6",
        19: "6",
        20: "6"
      },
      2: {
        4: "3",
        5: "4",
        6: "5",
        7: "6",
        8: "6",
        9: "6",
        10: "6",
        11: "6",
        12: "6",
        13: "6",
        14: "6",
        15: "6",
        16: "6",
        17: "6",
        18: "6",
        19: "6",
        20: "6"
      },
      3: {
        6: "3",
        7: "4",
        8: "5",
        9: "6",
        10: "6",
        11: "6",
        12: "6",
        13: "6",
        14: "6",
        15: "6",
        16: "6",
        17: "6",
        18: "6",
        19: "6",
        20: "6"
      }
    },

    // Tabla de límites de conocidos por nivel (característica del hechicero)
    knownLimitPerLevel: {
      0: {
        1: "4",
        2: "5",
        3: "6",
        4: "6",
        5: "7",
        6: "7",
        7: "8",
        8: "8",
        9: "9",
        10: "9",
        11: "9",
        12: "9",
        13: "9",
        14: "9",
        15: "9",
        16: "9",
        17: "9",
        18: "9",
        19: "9",
        20: "9"
      },
      1: {
        1: "2",
        2: "2",
        3: "3",
        4: "3",
        5: "4",
        6: "4",
        7: "5",
        8: "5",
        9: "5",
        10: "5",
        11: "5",
        12: "5",
        13: "5",
        14: "5",
        15: "5",
        16: "5",
        17: "5",
        18: "5",
        19: "5",
        20: "5"
      },
      2: {
        4: "1",
        5: "2",
        6: "2",
        7: "3",
        8: "3",
        9: "4",
        10: "4",
        11: "5",
        12: "5",
        13: "5",
        14: "5",
        15: "5",
        16: "5",
        17: "5",
        18: "5",
        19: "5",
        20: "5"
      },
      3: {
        6: "1",
        7: "2",
        8: "2",
        9: "3",
        10: "3",
        11: "4",
        12: "4",
        13: "5",
        14: "5",
        15: "5",
        16: "5",
        17: "5",
        18: "5",
        19: "5",
        20: "5"
      }
    },

    // Hechiceros NO hacen overcast en 3.5 estándar
    allowOvercast: false
  }
};

const sorcererSpellState: EntityManagementState = {
  configId: "sorcerer_spells",

  // Los hechiceros no tienen libro (su acceso es directo a la lista filtrada)

  modeState: {
    type: "SPONTANEOUS",

    // Conjuros conocidos (limitados por knownLimitPerLevel)
    known: {
      entityIds: [
        // Nivel 0 (unlimited en 3.5, pero limitados en cantidad conocida)
        "detect_magic",
        "read_magic",
        "light",
        "prestidigitation",
        "ray_of_frost",

        // Nivel 1 (ej: solo conoce 4)
        "magic_missile",
        "shield",
        "mage_armor",
        "color_spray",

        // Nivel 2
        "mirror_image",
        "invisibility",

        // Nivel 3
        "fireball"
      ],
      ineligible: []
    },

    // Slots usados
    slotsUsed: {
      0: { used: 0 },
      1: { used: 3 },
      2: { used: 1 },
      3: { used: 0 }
    }
  },

  lastReset: Date.now()
};
