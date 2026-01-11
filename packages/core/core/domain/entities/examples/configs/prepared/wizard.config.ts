import type { EntityManagementConfig, CapacityTable } from '../../../entityManagement/entityManagementConfig';
import type { SwitchFormula } from '../../../../formulae/formula';

/**
 * Configuración de Gestión de Conjuros para MAGO (D&D 3.5)
 * 
 * El mago es el arquetipo del lanzador con preparación:
 * 
 * CARACTERÍSTICAS:
 * - Acceso: Filtrado por lista arcana (Wizard/Sorcerer en classLevels)
 * - Libro: Sí, el mago tiene un libro de conjuros donde registra los que conoce
 * - Preparación: PREPARED_BY_LEVEL - prepara conjuros específicos en cada slot
 * - Conocidos: Sin límite (puede tener todos los del libro)
 * - Overcast: No permitido en D&D 3.5 estándar
 * 
 * FLUJO DIARIO:
 * 1. Al descansar, el mago elige qué conjuros preparar de su libro
 * 2. Asigna cada conjuro a un slot de su nivel correspondiente
 * 3. Durante el día, puede lanzar cada conjuro preparado una vez
 * 4. Los cantrips (nivel 0) no gastan slot pero deben prepararse
 * 
 * SLOTS BONUS:
 * Los magos obtienen slots adicionales por alto INT.
 * Fórmula D&D 3.5: Si INT mod >= nivel_conjuro, obtiene slots bonus.
 */

// ============================================================================
// SISTEMA DE DEFINICIÓN TABULAR
// ============================================================================

/**
 * Definición tabular de capacidades.
 * 
 * Esta estructura permite definir tablas de capacidad de forma similar a como
 * aparecen en los manuales de RPG, con filas (niveles de clase) y columnas
 * (niveles de entidad/conjuro).
 * 
 * Es genérica y puede usarse para:
 * - Slots de conjuros por nivel de clase
 * - Conjuros conocidos por nivel
 * - Usos de habilidad por día
 * - Cualquier tabla nivel → capacidad por categoría
 * 
 * @example
 * // Tabla de slots del Mago D&D 3.5
 * const wizardTable: CapacityTableDefinition = {
 *   rowVariable: "@customVariable.wizard.effectiveCasterLevel",
 *   columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
 *   rows: [
 *     //Lvl  0  1  2  3  4  5  6  7  8  9
 *     [1,   3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
 *     [2,   4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
 *     [3,   4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
 *     // ...
 *   ]
 * };
 */
export type CapacityTableDefinition = {
  /**
   * Variable que determina qué fila usar.
   * Típicamente el nivel de clase efectivo.
   * @example "@customVariable.wizard.effectiveCasterLevel"
   */
  rowVariable: string;
  
  /**
   * Identificadores de cada columna.
   * Para conjuros: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] (niveles de conjuro)
   * Para otros sistemas: lo que corresponda
   */
  columns: number[];
  
  /**
   * Filas de la tabla.
   * Cada fila es: [valor_fila, ...valores_columnas]
   * 
   * - valor_fila: el nivel de clase (o lo que represente rowVariable)
   * - valores_columnas: capacidad para cada columna (0 = no disponible)
   */
  rows: CapacityTableRow[];
};

/**
 * Una fila de la tabla de capacidad.
 * El primer elemento es el valor de la fila (nivel de clase),
 * el resto son los valores de cada columna.
 */
export type CapacityTableRow = [number, ...number[]];

/**
 * Convierte una definición tabular en un CapacityTable con SwitchFormulas.
 * 
 * Esta función transforma la representación legible de tabla
 * en el formato interno que usa el sistema.
 * 
 * @param definition - La definición tabular
 * @returns CapacityTable con una SwitchFormula por columna
 */
export function tableDefinitionToCapacityTable(
  definition: CapacityTableDefinition
): CapacityTable {
  const { rowVariable, columns, rows } = definition;
  
  const result: CapacityTable = {};
  
  // Para cada columna, creamos una SwitchFormula
  for (let colIndex = 0; colIndex < columns.length; colIndex++) {
    const columnId = columns[colIndex];
    
    // Generamos los casos para cada fila
    const cases = rows.map(row => {
      const rowValue = row[0];
      const columnValue = row[colIndex + 1]; // +1 porque el índice 0 es el valor de fila
      
      return {
        operator: "==" as const,
        caseValue: rowValue.toString(),
        resultExpression: (columnValue ?? 0).toString()
      };
    });
    
    result[columnId] = {
      type: "switch",
      switchExpression: rowVariable,
      cases,
      defaultValue: "0"
    };
  }
  
  return result;
}

// ============================================================================
// TABLA DE SLOTS DEL MAGO (PHB D&D 3.5)
// ============================================================================

/**
 * Tabla de Conjuros por Día del Mago (PHB página 55)
 * 
 * Esta es la tabla tal como aparece en el manual, lo que facilita:
 * - Verificación contra el libro original
 * - Legibilidad y mantenimiento
 * - Comprensión inmediata de la progresión
 * 
 * Nota: Esta tabla NO incluye slots bonus por INT.
 * Los slots bonus se calculan aparte con la fórmula:
 * Si INT_mod >= spell_level: floor((INT_mod - spell_level) / 4) + 1
 */
const wizardSpellTableDefinition: CapacityTableDefinition = {
  rowVariable: "@customVariable.wizard.effectiveCasterLevel",
  columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  rows: [
    // Lvl   0  1  2  3  4  5  6  7  8  9
    [1,     3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [2,     4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    [3,     4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
    [4,     4, 3, 2, 0, 0, 0, 0, 0, 0, 0],
    [5,     4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
    [6,     4, 3, 3, 2, 0, 0, 0, 0, 0, 0],
    [7,     4, 4, 3, 2, 1, 0, 0, 0, 0, 0],
    [8,     4, 4, 3, 3, 2, 0, 0, 0, 0, 0],
    [9,     4, 4, 4, 3, 2, 1, 0, 0, 0, 0],
    [10,    4, 4, 4, 3, 3, 2, 0, 0, 0, 0],
    [11,    4, 4, 4, 4, 3, 2, 1, 0, 0, 0],
    [12,    4, 4, 4, 4, 3, 3, 2, 0, 0, 0],
    [13,    4, 4, 4, 4, 4, 3, 2, 1, 0, 0],
    [14,    4, 4, 4, 4, 4, 3, 3, 2, 0, 0],
    [15,    4, 4, 4, 4, 4, 4, 3, 2, 1, 0],
    [16,    4, 4, 4, 4, 4, 4, 3, 3, 2, 0],
    [17,    4, 4, 4, 4, 4, 4, 4, 3, 2, 1],
    [18,    4, 4, 4, 4, 4, 4, 4, 3, 3, 2],
    [19,    4, 4, 4, 4, 4, 4, 4, 4, 3, 3],
    [20,    4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  ]
};

/**
 * CapacityTable generada a partir de la definición tabular.
 * Este es el formato que consume el sistema de gestión de entidades.
 */
const wizardSlotCapacities: CapacityTable = tableDefinitionToCapacityTable(
  wizardSpellTableDefinition
);

// ============================================================================
// Configuración Principal
// ============================================================================

export const wizardSpellConfig: EntityManagementConfig = {
  id: "wizard_spells",
  entityType: "spell",

  /**
   * Política de visualización: WARN
   * 
   * El sistema mostrará conjuros que no cumplan los filtros (ej: conjuros divinos)
   * pero los marcará con un aviso. Esto permite flexibilidad si el DM lo permite.
   */
  visualizationPolicy: "WARN",

  /**
   * Resolución de nivel de la entidad
   * 
   * Para determinar el nivel de un conjuro para este mago, buscamos en
   * classLevels el entry con className "Wizard" y tomamos su level.
   * 
   * Ejemplo: Magic Missile tiene classLevels: [{className: "Wizard", level: 1}]
   * Por tanto, su nivel para el mago es 1.
   * 
   * NOTA: Este string indica el campo jmespath o la lógica para extraer el nivel.
   * La implementación exacta depende del sistema de resolución.
   */
  levelResolution: "classLevels[?className=='Wizard'].level | [0]",

  /**
   * Variable de nivel de clase efectivo
   * 
   * Esta variable del personaje indica el nivel de lanzador efectivo.
   * Incluye:
   * - Niveles de mago
   * - Bonificaciones de clases de prestigio (Arcane Trickster, Loremaster, etc.)
   * - Modificadores de ítems o dotes
   * 
   * Se calcula en el sistema de cambios del personaje.
   */
  classLevelVariable: "wizard.effectiveCasterLevel",

  /**
   * Fuente de acceso a entidades
   * 
   * Para el mago, la fuente es una vista filtrada de todos los conjuros
   * que incluyan "Wizard" en su campo classLevels.
   */
  accessSource: {
    entityType: "spell",
    filter: {
      type: "jmespath",
      expression: "classLevels[?className=='Wizard'] | length(@) > `0`"
    }
  },

  /**
   * Modo de gestión: PREPARED_BY_LEVEL
   * 
   * El mago prepara conjuros específicos en slots de cada nivel.
   * Cada slot preparado = un uso de ese conjuro específico.
   */
  managementMode: {
    type: "PREPARED_BY_LEVEL",
    slotCapacities: wizardSlotCapacities,
    allowOvercast: false
  }
};

// ============================================================================
// Variante: Mago Especialista
// ============================================================================

/**
 * Un mago especialista tiene +1 slot por nivel en su escuela,
 * pero pierde acceso a 1-2 escuelas opuestas.
 * 
 * Ejemplo: Mago de Evocación
 * - +1 slot de evocación por nivel
 * - No puede lanzar conjuros de Conjuración ni Abjuración
 * 
 * Para implementar esto, se crearía un config derivado con:
 * - Filtro adicional que excluya escuelas prohibidas
 * - CapacityTable modificada que añada +1 para la escuela
 * 
 * NOTA: La implementación exacta de "slot extra para escuela específica"
 * requeriría extensiones al sistema actual (slots por escuela).
 */

// ============================================================================
// Exports
// ============================================================================

export {
  wizardSlotCapacities,
  wizardSpellTableDefinition
};
