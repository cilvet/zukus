import type { EntityManagementConfig, CapacityTable } from '../../../entityManagement/entityManagementConfig';
import { 
  tableDefinitionToCapacityTable, 
  type CapacityTableDefinition 
} from '../prepared/wizard.config';

/**
 * Configuración de Gestión de Conjuros para HECHICERO (D&D 3.5)
 * 
 * El hechicero es el arquetipo del lanzador espontáneo arcano:
 * 
 * CARACTERÍSTICAS:
 * - Acceso: Filtrado por lista arcana (Wizard/Sorcerer en classLevels)
 * - Libro: NO tiene libro
 * - Preparación: NO prepara, lanza espontáneamente
 * - Conocidos: LIMITADOS por nivel (ver tabla)
 * - Overcast: No permitido en D&D 3.5 estándar
 * 
 * DIFERENCIAS CON EL MAGO:
 * - No prepara: puede lanzar cualquier conjuro conocido gastando un slot
 * - Menos conocidos: pero más flexibilidad al lanzar
 * - Más slots por nivel que el mago
 * - No necesita libro (los conjuros son innatos)
 * 
 * FLUJO DIARIO:
 * 1. Al descansar, recupera todos los slots
 * 2. Durante el día, elige qué conjuro conocido lanzar
 * 3. Gasta un slot del nivel correspondiente
 * 4. Los cantrips son ilimitados (no gastan slot)
 */

// ============================================================================
// TABLA DE SLOTS DEL HECHICERO (PHB D&D 3.5)
// ============================================================================

/**
 * Tabla de Conjuros por Día del Hechicero (PHB página 54)
 * 
 * Los hechiceros tienen MÁS slots que los magos por nivel,
 * compensando su menor versatilidad.
 */
const sorcererSpellTableDefinition: CapacityTableDefinition = {
  rowVariable: "@customVariable.sorcerer.effectiveCasterLevel",
  columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  rows: [
    // Lvl   0  1  2  3  4  5  6  7  8  9
    [1,     5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
    [2,     6, 4, 0, 0, 0, 0, 0, 0, 0, 0],
    [3,     6, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    [4,     6, 6, 3, 0, 0, 0, 0, 0, 0, 0],
    [5,     6, 6, 4, 0, 0, 0, 0, 0, 0, 0],
    [6,     6, 6, 5, 3, 0, 0, 0, 0, 0, 0],
    [7,     6, 6, 6, 4, 0, 0, 0, 0, 0, 0],
    [8,     6, 6, 6, 5, 3, 0, 0, 0, 0, 0],
    [9,     6, 6, 6, 6, 4, 0, 0, 0, 0, 0],
    [10,    6, 6, 6, 6, 5, 3, 0, 0, 0, 0],
    [11,    6, 6, 6, 6, 6, 4, 0, 0, 0, 0],
    [12,    6, 6, 6, 6, 6, 5, 3, 0, 0, 0],
    [13,    6, 6, 6, 6, 6, 6, 4, 0, 0, 0],
    [14,    6, 6, 6, 6, 6, 6, 5, 3, 0, 0],
    [15,    6, 6, 6, 6, 6, 6, 6, 4, 0, 0],
    [16,    6, 6, 6, 6, 6, 6, 6, 5, 3, 0],
    [17,    6, 6, 6, 6, 6, 6, 6, 6, 4, 0],
    [18,    6, 6, 6, 6, 6, 6, 6, 6, 5, 3],
    [19,    6, 6, 6, 6, 6, 6, 6, 6, 6, 4],
    [20,    6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  ]
};

// ============================================================================
// TABLA DE CONJUROS CONOCIDOS DEL HECHICERO
// ============================================================================

/**
 * Tabla de Conjuros Conocidos del Hechicero (PHB página 54)
 * 
 * Los hechiceros tienen un número LIMITADO de conjuros conocidos por nivel.
 * Esta es la característica principal que los diferencia de los magos.
 * 
 * Cuando sube de nivel, puede aprender nuevos conjuros según esta tabla.
 * También puede cambiar uno al subir ciertos niveles.
 */
const sorcererKnownTableDefinition: CapacityTableDefinition = {
  rowVariable: "@customVariable.sorcerer.effectiveCasterLevel",
  columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  rows: [
    // Lvl   0  1  2  3  4  5  6  7  8  9
    [1,     4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    [2,     5, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    [3,     5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
    [4,     6, 3, 1, 0, 0, 0, 0, 0, 0, 0],
    [5,     6, 4, 2, 0, 0, 0, 0, 0, 0, 0],
    [6,     7, 4, 2, 1, 0, 0, 0, 0, 0, 0],
    [7,     7, 5, 3, 2, 0, 0, 0, 0, 0, 0],
    [8,     8, 5, 3, 2, 1, 0, 0, 0, 0, 0],
    [9,     8, 5, 4, 3, 2, 0, 0, 0, 0, 0],
    [10,    9, 5, 4, 3, 2, 1, 0, 0, 0, 0],
    [11,    9, 5, 5, 4, 3, 2, 0, 0, 0, 0],
    [12,    9, 5, 5, 4, 3, 2, 1, 0, 0, 0],
    [13,    9, 5, 5, 4, 4, 3, 2, 0, 0, 0],
    [14,    9, 5, 5, 4, 4, 3, 2, 1, 0, 0],
    [15,    9, 5, 5, 4, 4, 4, 3, 2, 0, 0],
    [16,    9, 5, 5, 4, 4, 4, 3, 2, 1, 0],
    [17,    9, 5, 5, 4, 4, 4, 3, 3, 2, 0],
    [18,    9, 5, 5, 4, 4, 4, 3, 3, 2, 1],
    [19,    9, 5, 5, 4, 4, 4, 3, 3, 3, 2],
    [20,    9, 5, 5, 4, 4, 4, 3, 3, 3, 3],
  ]
};

/**
 * CapacityTables generadas a partir de las definiciones tabulares.
 */
const sorcererSlotCapacities: CapacityTable = tableDefinitionToCapacityTable(
  sorcererSpellTableDefinition
);

const sorcererKnownLimits: CapacityTable = tableDefinitionToCapacityTable(
  sorcererKnownTableDefinition
);

// ============================================================================
// Configuración Principal
// ============================================================================

export const sorcererSpellConfig: EntityManagementConfig = {
  id: "sorcerer_spells",
  entityType: "spell",

  /**
   * Política de visualización: WARN
   * 
   * Igual que el mago, permite ver conjuros fuera de lista con aviso.
   */
  visualizationPolicy: "WARN",

  /**
   * Resolución de nivel de la entidad
   * 
   * Para el hechicero, buscamos el nivel en classLevels con "Sorcerer".
   * Si no existe, usamos "Wizard" (comparten lista).
   */
  levelResolution: "classLevels[?className=='Sorcerer' || className=='Wizard'].level | [0]",

  /**
   * Variable de nivel de clase efectivo
   * 
   * El nivel de lanzador del hechicero, incluyendo modificadores de
   * clases de prestigio, ítems, etc.
   */
  classLevelVariable: "sorcerer.effectiveCasterLevel",

  /**
   * Fuente de acceso a entidades
   * 
   * Misma lista que el mago (arcana).
   */
  accessSource: {
    entityType: "spell",
    filter: {
      type: "jmespath",
      expression: "classLevels[?className=='Sorcerer' || className=='Wizard'] | length(@) > `0`"
    }
  },

  /**
   * Modo de gestión: SPONTANEOUS
   * 
   * El hechicero NO prepara. Puede lanzar cualquier conjuro conocido
   * gastando un slot del nivel correspondiente.
   */
  managementMode: {
    type: "SPONTANEOUS",
    slotCapacities: sorcererSlotCapacities,
    knownLimitPerLevel: sorcererKnownLimits,
    allowOvercast: false
  }
};

// ============================================================================
// Exports
// ============================================================================

export {
  sorcererSlotCapacities,
  sorcererKnownLimits,
  sorcererSpellTableDefinition,
  sorcererKnownTableDefinition
};



