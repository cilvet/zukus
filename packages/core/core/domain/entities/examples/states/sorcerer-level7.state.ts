import type { EntityManagementState } from '../../entityManagement/entityManagementState';

/**
 * Estado de ejemplo: Hechicero Nivel 7
 * 
 * Este estado representa un hechicero de nivel 7 en juego.
 * 
 * CONTEXTO DEL PERSONAJE:
 * - Nivel: 7 de Hechicero
 * - CHA: 18 (+4 mod) → slots bonus en niveles 1-4
 * - effectiveCasterLevel: 7
 * 
 * CONOCIDOS (según tabla de hechicero):
 * - Nivel 0: 8 cantrips conocidos
 * - Nivel 1: 5 conjuros conocidos
 * - Nivel 2: 3 conjuros conocidos
 * - Nivel 3: 2 conjuros conocidos (acaba de desbloquear nivel 3)
 * 
 * SLOTS (según tabla + CHA bonus):
 * - Nivel 0: 6 (at-will en práctica)
 * - Nivel 1: 6 base + 2 CHA = 8 slots
 * - Nivel 2: 6 base + 1 CHA = 7 slots  
 * - Nivel 3: 4 base + 1 CHA = 5 slots
 * 
 * DIFERENCIA CON EL MAGO:
 * - NO prepara: puede lanzar cualquier conocido
 * - Menos conocidos pero más slots
 * - Mayor flexibilidad táctica
 */

export const sorcererLevel7State: EntityManagementState = {
  configId: "sorcerer_spells",

  /**
   * Los hechiceros NO tienen libro
   * Su "bookEntities" está vacío o no se usa
   */

  /**
   * Estado del modo SPONTANEOUS
   */
  modeState: {
    type: "SPONTANEOUS",
    
    /**
     * Conjuros conocidos
     * 
     * El hechicero eligió estos conjuros al subir de nivel.
     * No puede cambiarlos fácilmente (solo 1 por nivel a partir de nivel 4).
     */
    known: {
      entityIds: [
        // Nivel 0: 8 cantrips conocidos
        "detect_magic",
        "light",
        "prestidigitation",
        "ray_of_frost",
        "read_magic",
        "mage_hand",
        "ghost_sound",
        "daze",
        
        // Nivel 1: 5 conocidos
        "magic_missile",
        "shield",
        "mage_armor",
        "color_spray",
        "grease",
        
        // Nivel 2: 3 conocidos
        "invisibility",
        "mirror_image",
        "scorching_ray",
        
        // Nivel 3: 2 conocidos (recién desbloqueado)
        "fireball",
        "haste"
      ],
      ineligible: []
    },
    
    /**
     * Slots usados por nivel
     * 
     * El hechicero ha lanzado varios conjuros durante el día:
     * - Varios Magic Missiles y Scorching Rays en combate
     * - Un Haste al inicio de un combate importante
     */
    slotsUsed: {
      0: { used: 0 },  // Cantrips son at-will en la práctica
      1: { used: 4 },  // Ha usado 4 de 8 slots de nivel 1
      2: { used: 2 },  // Ha usado 2 de 7 slots de nivel 2
      3: { used: 1 }   // Ha usado 1 de 5 slots de nivel 3
    }
  },

  lastReset: Date.now() - (6 * 60 * 60 * 1000) // Hace 6 horas
};

// ============================================================================
// Estado: Hechicero con conjuro no elegible
// ============================================================================

/**
 * Este estado demuestra qué pasa cuando un conjuro conocido
 * deja de ser elegible (por ejemplo, si cambian las reglas
 * o el personaje pierde algún requisito).
 */
export const sorcererWithIneligibleSpell: EntityManagementState = {
  configId: "sorcerer_spells",

  modeState: {
    type: "SPONTANEOUS",
    
    known: {
      entityIds: [
        "detect_magic", "light", "prestidigitation", "ray_of_frost",
        "read_magic", "mage_hand", "ghost_sound", "daze",
        "magic_missile", "shield", "mage_armor", "color_spray", "grease",
        "invisibility", "mirror_image", "scorching_ray",
        "fireball", "haste"
      ],
      /**
       * Un conjuro que el hechicero conocía pero ya no puede usar
       * 
       * Ejemplo: tenía un conjuro de una subclase que perdió,
       * o un conjuro homebrew que el DM decidió eliminar.
       */
      ineligible: [
        {
          entityId: "arcane_fusion", // Conjuro que ya no existe/es válido
          reasons: [
            "El conjuro 'Arcane Fusion' fue removido de la campaña",
            "El DM determinó que no es compatible con las reglas actuales"
          ],
          wasIn: "known"
        }
      ]
    },
    
    slotsUsed: {
      0: { used: 0 },
      1: { used: 0 },
      2: { used: 0 },
      3: { used: 0 }
    }
  },

  lastReset: Date.now()
};

// ============================================================================
// Estado: Hechicero recién creado (nivel 1)
// ============================================================================

export const sorcererLevel1State: EntityManagementState = {
  configId: "sorcerer_spells",

  modeState: {
    type: "SPONTANEOUS",
    
    known: {
      entityIds: [
        // Nivel 0: 4 cantrips iniciales
        "detect_magic",
        "light",
        "prestidigitation",
        "ray_of_frost",
        
        // Nivel 1: 2 conocidos iniciales
        "magic_missile",
        "mage_armor"
      ],
      ineligible: []
    },
    
    slotsUsed: {
      0: { used: 0 },
      1: { used: 0 }  // 3 slots de nivel 1 disponibles
    }
  },

  lastReset: Date.now()
};

// ============================================================================
// Exports
// ============================================================================

export default sorcererLevel7State;



