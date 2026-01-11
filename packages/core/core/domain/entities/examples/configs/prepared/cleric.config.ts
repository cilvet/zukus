import type { EntityManagementConfig, CapacityTable } from '../../../entityManagement/entityManagementConfig';
import { 
  tableDefinitionToCapacityTable, 
  type CapacityTableDefinition 
} from './wizard.config';

/**
 * Configuración de Gestión de Conjuros para CLÉRIGO (D&D 3.5)
 * 
 * El clérigo tiene un sistema de lanzamiento único:
 * 
 * CARACTERÍSTICAS:
 * - Acceso: TOTAL a la lista de clérigo (no necesita libro ni aprender)
 * - Libro: NO tiene libro
 * - Preparación: PREPARED_BY_LEVEL - prepara conjuros específicos en cada slot
 * - Conocidos: TODOS los de la lista del clérigo del nivel que pueda lanzar
 * - Overcast: No permitido en D&D 3.5 estándar
 * - Dominios: Obtiene slots extra de dominio (1/nivel) con conjuros específicos
 * 
 * DIFERENCIAS CON EL MAGO:
 * - Acceso total: no necesita encontrar pergaminos ni copiar conjuros
 * - Slots de dominio: además de los normales, tiene 1 slot de dominio/nivel
 * - Conversión espontánea: puede convertir cualquier slot en Cura/Infligir
 * 
 * FLUJO DIARIO:
 * 1. Al descansar, el clérigo medita y elige qué conjuros preparar
 * 2. Puede elegir de TODA la lista de clérigo (no tiene libro)
 * 3. Asigna conjuros a slots de cada nivel
 * 4. Puede convertir slots en curar heridas (o infligir si es malvado)
 * 
 * NOTA SOBRE DOMINIOS:
 * Los dominios se implementarían como un CGE separado o como extensión.
 * Cada dominio da acceso a conjuros específicos y un slot extra por nivel.
 */

// ============================================================================
// TABLA DE SLOTS DEL CLÉRIGO (PHB D&D 3.5)
// ============================================================================

/**
 * Tabla de Conjuros por Día del Clérigo (PHB página 32)
 * 
 * Los clérigos tienen una progresión similar a los magos,
 * pero obtienen slots bonus por Sabiduría en lugar de Inteligencia.
 * 
 * Esta tabla NO incluye los slots de dominio (1 extra por nivel).
 */
const clericSpellTableDefinition: CapacityTableDefinition = {
  rowVariable: "@customVariable.cleric.effectiveCasterLevel",
  columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  rows: [
    // Lvl   0  1  2  3  4  5  6  7  8  9
    [1,     3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [2,     4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    [3,     4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
    [4,     5, 3, 2, 0, 0, 0, 0, 0, 0, 0],
    [5,     5, 3, 2, 1, 0, 0, 0, 0, 0, 0],
    [6,     5, 3, 3, 2, 0, 0, 0, 0, 0, 0],
    [7,     6, 4, 3, 2, 1, 0, 0, 0, 0, 0],
    [8,     6, 4, 3, 3, 2, 0, 0, 0, 0, 0],
    [9,     6, 4, 4, 3, 2, 1, 0, 0, 0, 0],
    [10,    6, 4, 4, 3, 3, 2, 0, 0, 0, 0],
    [11,    6, 5, 4, 4, 3, 2, 1, 0, 0, 0],
    [12,    6, 5, 4, 4, 3, 3, 2, 0, 0, 0],
    [13,    6, 5, 5, 4, 4, 3, 2, 1, 0, 0],
    [14,    6, 5, 5, 4, 4, 3, 3, 2, 0, 0],
    [15,    6, 5, 5, 5, 4, 4, 3, 2, 1, 0],
    [16,    6, 5, 5, 5, 4, 4, 3, 3, 2, 0],
    [17,    6, 5, 5, 5, 5, 4, 4, 3, 2, 1],
    [18,    6, 5, 5, 5, 5, 4, 4, 3, 3, 2],
    [19,    6, 5, 5, 5, 5, 5, 4, 4, 3, 3],
    [20,    6, 5, 5, 5, 5, 5, 4, 4, 4, 4],
  ]
};

/**
 * CapacityTable generada a partir de la definición tabular.
 */
const clericSlotCapacities: CapacityTable = tableDefinitionToCapacityTable(
  clericSpellTableDefinition
);

// ============================================================================
// Configuración Principal
// ============================================================================

export const clericSpellConfig: EntityManagementConfig = {
  id: "cleric_spells",
  entityType: "spell",

  /**
   * Política de visualización: WARN
   * 
   * Permite ver conjuros de otras listas con aviso.
   */
  visualizationPolicy: "WARN",

  /**
   * Resolución de nivel de la entidad
   * 
   * Busca el nivel del conjuro para Cleric en classLevels.
   */
  levelResolution: "classLevels[?className=='Cleric'].level | [0]",

  /**
   * Variable de nivel de clase efectivo
   * 
   * El nivel de lanzador del clérigo.
   */
  classLevelVariable: "cleric.effectiveCasterLevel",

  /**
   * Fuente de acceso a entidades: ACCESO TOTAL
   * 
   * A diferencia del mago, el clérigo tiene acceso a TODA la lista.
   * Solo necesita filtrar por "tiene entrada de Cleric en classLevels".
   * 
   * El clérigo no necesita "aprender" conjuros - puede preparar
   * cualquiera de su lista cada día.
   */
  accessSource: {
    entityType: "spell",
    filter: {
      type: "jmespath",
      expression: "classLevels[?className=='Cleric'] | length(@) > `0`"
    }
  },

  /**
   * Modo de gestión: PREPARED_BY_LEVEL
   * 
   * Aunque tiene acceso total, el clérigo PREPARA conjuros.
   * La diferencia con el mago es que no tiene "libro" - elige de toda la lista.
   */
  managementMode: {
    type: "PREPARED_BY_LEVEL",
    slotCapacities: clericSlotCapacities,
    allowOvercast: false
  }
};

// ============================================================================
// Notas sobre Implementación de Dominios
// ============================================================================

/**
 * Los dominios del clérigo requerirían:
 * 
 * 1. SLOTS DE DOMINIO:
 *    - 1 slot adicional por nivel de conjuro accesible
 *    - Solo puede llenarse con conjuros de dominio
 * 
 * 2. CONJUROS DE DOMINIO:
 *    - Cada dominio da acceso a 9 conjuros específicos (1 por nivel)
 *    - El clérigo elige 2 dominios al crearse
 *    - Estos conjuros se añaden a su lista "conocida"
 * 
 * 3. POSIBLE IMPLEMENTACIÓN:
 *    - Un CGE separado para slots de dominio: "cleric_domain_spells"
 *    - O extender el sistema con "slots restringidos"
 *    - O usar el campo "givesRequirements" de las entidades
 * 
 * Ejemplo de dominio Fuego:
 * {
 *   id: "domain_fire",
 *   name: "Fire Domain",
 *   grantedSpells: {
 *     1: "burning_hands",
 *     2: "produce_flame", 
 *     3: "resist_energy_fire",
 *     4: "wall_of_fire",
 *     5: "fire_shield",
 *     6: "fire_seeds",
 *     7: "fire_storm",
 *     8: "incendiary_cloud",
 *     9: "elemental_swarm_fire"
 *   },
 *   grantedPower: "Turn or destroy water creatures as a good cleric turns undead..."
 * }
 */

// ============================================================================
// Notas sobre Conversión Espontánea
// ============================================================================

/**
 * Los clérigos pueden convertir cualquier slot preparado en:
 * - Conjuro de Curar (si es bueno/neutral)
 * - Conjuro de Infligir (si es malvado)
 * 
 * Esto requeriría:
 * - Una acción especial "convertir slot" en el sistema de uso
 * - Marcar qué conjuros son "de curación" o "de infligir"
 * - El nivel del conjuro de cura = nivel del slot gastado
 * 
 * POSIBLE IMPLEMENTACIÓN:
 * - Añadir campo "spontaneousConversion" al config
 * - Definir qué entidades pueden usarse para conversión
 * - El sistema de uso permitiría "gastar slot X para lanzar conjuro Y"
 */

// ============================================================================
// Exports
// ============================================================================

export {
  clericSlotCapacities,
  clericSpellTableDefinition
};



