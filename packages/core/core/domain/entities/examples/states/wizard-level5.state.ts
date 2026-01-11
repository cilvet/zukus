import type { EntityManagementState } from '../../entityManagement/entityManagementState';

/**
 * Estado de ejemplo: Mago Nivel 5
 * 
 * Este estado representa un mago de nivel 5 en un día típico de aventura.
 * 
 * CONTEXTO DEL PERSONAJE:
 * - Nivel: 5 de Mago
 * - INT: 18 (+4 mod) → slots bonus en niveles 1-4
 * - effectiveCasterLevel: 5
 * 
 * CAPACIDADES (tabla + INT bonus):
 * - Nivel 0: 4 cantrips preparados
 * - Nivel 1: 3 base + 2 INT bonus = 5 slots
 * - Nivel 2: 2 base + 1 INT bonus = 3 slots
 * - Nivel 3: 1 base + 1 INT bonus = 2 slots
 * 
 * SITUACIÓN:
 * - Ha preparado sus conjuros esta mañana
 * - Ha lanzado algunos durante la aventura
 * - Quedan slots por gastar
 */

export const wizardLevel5State: EntityManagementState = {
  configId: "wizard_spells",

  /**
   * Libro de conjuros del mago
   * 
   * El mago ha ido recopilando conjuros durante su carrera.
   * Puede preparar cualquiera de estos cada día.
   */
  bookEntities: {
    entityIds: [
      // Nivel 0 (cantrips)
      "detect_magic",
      "light",
      "read_magic",
      "prestidigitation",
      "ray_of_frost",
      
      // Nivel 1
      "magic_missile",
      "shield",
      "mage_armor",
      "color_spray",
      "sleep",
      "charm_person",
      "identify",
      "grease",
      
      // Nivel 2
      "invisibility",
      "mirror_image",
      "scorching_ray",
      "web",
      "see_invisibility",
      
      // Nivel 3
      "fireball",
      "lightning_bolt",
      "dispel_magic",
      "fly",
      "haste"
    ],
    ineligible: []
  },

  /**
   * Estado del modo PREPARED_BY_LEVEL
   */
  modeState: {
    type: "PREPARED_BY_LEVEL",
    
    /**
     * Slots usados por nivel
     * 
     * El mago ha lanzado varios conjuros durante la mañana:
     * - 2 Magic Missiles en combate
     * - 1 Invisibility para explorar
     */
    slotsUsed: {
      0: { used: 2 },  // Ha usado 2 de 4 cantrips
      1: { used: 2 },  // Ha usado 2 de 5 slots de nivel 1
      2: { used: 1 },  // Ha usado 1 de 3 slots de nivel 2
      3: { used: 0 }   // No ha usado nivel 3 todavía
    },
    
    /**
     * Conjuros preparados por nivel
     * 
     * Esta es la selección del mago para hoy.
     */
    prepared: {
      // Nivel 0: 4 cantrips preparados
      0: [
        "detect_magic",
        "light",
        "read_magic",
        "ray_of_frost"
      ],
      
      // Nivel 1: 5 slots preparados
      1: [
        "magic_missile",  // Preparado 2 veces
        "magic_missile",
        "shield",
        "mage_armor",
        "color_spray"
      ],
      
      // Nivel 2: 3 slots preparados
      2: [
        "invisibility",
        "mirror_image",
        "scorching_ray"
      ],
      
      // Nivel 3: 2 slots preparados
      3: [
        "fireball",
        "dispel_magic"
      ],
      
      ineligible: []
    }
  },

  /**
   * Timestamp del último reset (esta mañana)
   */
  lastReset: Date.now() - (8 * 60 * 60 * 1000) // Hace 8 horas
};

// ============================================================================
// Estado alternativo: Mago después de un día duro
// ============================================================================

/**
 * Estado después de varios combates - casi sin recursos
 */
export const wizardLevel5ExhaustedState: EntityManagementState = {
  configId: "wizard_spells",

  bookEntities: {
    entityIds: [
      "detect_magic", "light", "read_magic", "prestidigitation", "ray_of_frost",
      "magic_missile", "shield", "mage_armor", "color_spray", "sleep",
      "charm_person", "identify", "grease",
      "invisibility", "mirror_image", "scorching_ray", "web", "see_invisibility",
      "fireball", "lightning_bolt", "dispel_magic", "fly", "haste"
    ],
    ineligible: []
  },

  modeState: {
    type: "PREPARED_BY_LEVEL",
    
    slotsUsed: {
      0: { used: 4 },  // Todos los cantrips usados
      1: { used: 5 },  // Todos los slots de nivel 1 usados
      2: { used: 3 },  // Todos los slots de nivel 2 usados
      3: { used: 1 }   // Solo queda 1 slot de nivel 3
    },
    
    prepared: {
      0: ["detect_magic", "light", "read_magic", "ray_of_frost"],
      1: ["magic_missile", "magic_missile", "shield", "mage_armor", "color_spray"],
      2: ["invisibility", "mirror_image", "scorching_ray"],
      3: ["fireball", "dispel_magic"],
      ineligible: []
    }
  },

  lastReset: Date.now() - (14 * 60 * 60 * 1000) // Hace 14 horas
};

// ============================================================================
// Exports
// ============================================================================

export default wizardLevel5State;



