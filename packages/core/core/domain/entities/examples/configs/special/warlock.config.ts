import type { EntityManagementConfig } from '../../../entityManagement/entityManagementConfig';
import type { EntitySchemaDefinition } from '../../../types/schema';

/**
 * Configuración de Gestión de Invocaciones para WARLOCK (Complete Arcane / 3.5)
 * 
 * El warlock es un ejemplo de sistema SIN SLOTS:
 * 
 * CARACTERÍSTICAS:
 * - Acceso: Filtrado por lista de invocaciones
 * - Libro: NO tiene
 * - Preparación: NO prepara
 * - Conocidos: Limitados (aprende X invocaciones al subir nivel)
 * - Usos: ILIMITADOS para las menores, X/día para las mayores
 * - NO USA SLOTS - cada invocación tiene sus propios usos
 * 
 * TIPOS DE INVOCACIONES:
 * - Least (menores): Disponibles nivel 1+, at-will
 * - Lesser (inferiores): Disponibles nivel 6+, at-will
 * - Greater (mayores): Disponibles nivel 11+, at-will
 * - Dark (oscuras): Disponibles nivel 16+, at-will
 * 
 * NOTAS:
 * - En D&D 3.5, las invocaciones son at-will por defecto
 * - Para demostrar USES_PER_ENTITY, usaremos una variante homebrew
 *   donde las invocaciones mayores tienen usos limitados
 * 
 * ELDRITCH BLAST:
 * - Capacidad especial, no una invocación
 * - Siempre at-will, escala con nivel
 * - Se puede modificar con "Eldritch Essences" y "Blast Shapes"
 */

// ============================================================================
// Schema de Invocaciones
// ============================================================================

export const INVOCATION_GRADES = [
  "least",   // Nivel 1-5
  "lesser",  // Nivel 6-10
  "greater", // Nivel 11-15
  "dark"     // Nivel 16-20
] as const;

/**
 * Schema para Invocaciones de Warlock
 * 
 * Más simple que los conjuros porque no tienen componentes,
 * tiempo de lanzamiento variable, etc.
 */
export const invocationSchema: EntitySchemaDefinition = {
  typeName: "invocation",
  description: "Una invocación de Warlock (Complete Arcane)",
  fields: [
    {
      name: "grade",
      type: "string",
      description: "Grado de la invocación (least, lesser, greater, dark)",
      allowedValues: [...INVOCATION_GRADES]
    },
    {
      name: "invocationType",
      type: "string",
      description: "Tipo de invocación",
      allowedValues: [
        "eldritch_essence", // Modifica el Eldritch Blast
        "blast_shape",      // Cambia la forma del Eldritch Blast
        "other"             // Otras invocaciones
      ]
    },
    {
      name: "usesPerDay",
      type: "integer",
      description: "Usos por día (0 = at-will / ilimitado)",
      optional: true
    },
    {
      name: "effect",
      type: "string",
      description: "Descripción del efecto"
    },
    {
      name: "duration",
      type: "string",
      description: "Duración del efecto"
    },
    {
      name: "savingThrow",
      type: "string",
      description: "Salvación si aplica",
      optional: true
    }
  ]
};

// ============================================================================
// Tipo TypeScript para Invocaciones
// ============================================================================

export type InvocationGrade = typeof INVOCATION_GRADES[number];

export type Invocation = {
  id: string;
  name: string;
  type: "invocation";
  description?: string;
  grade: InvocationGrade;
  invocationType: "eldritch_essence" | "blast_shape" | "other";
  usesPerDay?: number; // 0 o undefined = at-will
  effect: string;
  duration: string;
  savingThrow?: string;
};

// ============================================================================
// Ejemplos de Invocaciones
// ============================================================================

export const eldritchSpear: Invocation = {
  id: "eldritch_spear",
  name: "Eldritch Spear",
  type: "invocation",
  description: "Your eldritch blast has a range of 250 feet with no range increment.",
  grade: "least",
  invocationType: "blast_shape",
  effect: "Eldritch blast range becomes 250 ft.",
  duration: "Instantaneous"
};

export const sickening: Invocation = {
  id: "sickening_blast",
  name: "Sickening Blast",
  type: "invocation",
  description: "Any creature struck by your eldritch blast must make a Fort save or be sickened for 1 minute.",
  grade: "least",
  invocationType: "eldritch_essence",
  effect: "Target sickened on failed Fort save",
  duration: "1 minute",
  savingThrow: "Fortitude negates"
};

export const darkness: Invocation = {
  id: "darkness_invocation",
  name: "Darkness",
  type: "invocation",
  description: "You can use darkness as the spell.",
  grade: "least",
  invocationType: "other",
  effect: "Creates darkness as per the spell",
  duration: "1 minute/level"
};

export const fleeTheScene: Invocation = {
  id: "flee_the_scene",
  name: "Flee the Scene",
  type: "invocation",
  description: "You can use dimension door as the spell, and leave behind a major image of yourself.",
  grade: "greater",
  invocationType: "other",
  // En variante homebrew, las mayores podrían tener usos limitados
  usesPerDay: 3,
  effect: "Dimension door + major image",
  duration: "Instantaneous + 1 round/level (image)"
};

export const eldritchDoom: Invocation = {
  id: "eldritch_doom",
  name: "Eldritch Doom",
  type: "invocation",
  description: "Your eldritch blast affects all enemies within 20 feet.",
  grade: "dark",
  invocationType: "blast_shape",
  usesPerDay: 1, // En variante homebrew
  effect: "Eldritch blast becomes 20-ft. burst",
  duration: "Instantaneous",
  savingThrow: "Reflex half"
};

export const sampleInvocations: Invocation[] = [
  eldritchSpear,
  sickening,
  darkness,
  fleeTheScene,
  eldritchDoom
];

// ============================================================================
// Configuración Principal
// ============================================================================

export const warlockInvocationConfig: EntityManagementConfig = {
  id: "warlock_invocations",
  entityType: "invocation",

  /**
   * Política de visualización: WARN
   */
  visualizationPolicy: "WARN",

  /**
   * Resolución de nivel de la entidad
   * 
   * Para invocaciones, el "nivel" es el grado.
   * Mapeamos: least=1, lesser=2, greater=3, dark=4
   * O usamos un campo computado.
   */
  levelResolution: "grade", // Se resuelve por lógica especial

  /**
   * Variable de nivel de clase efectivo
   * 
   * El nivel de warlock determina qué grados puede usar.
   */
  classLevelVariable: "warlock.level",

  /**
   * Fuente de acceso a entidades
   * 
   * Todas las invocaciones para las que tenga el nivel requerido.
   * En D&D 3.5:
   * - Least: nivel 1+
   * - Lesser: nivel 6+
   * - Greater: nivel 11+
   * - Dark: nivel 16+
   */
  accessSource: {
    entityType: "invocation",
    filter: {
      type: "jmespath",
      // Este filtro debería ser dinámico basado en el nivel
      // Por ahora mostramos todas
      expression: "grade != null"
    }
  },

  /**
   * Modo de gestión: USES_PER_ENTITY
   * 
   * Cada invocación tiene sus propios usos/día.
   * Las que tienen usesPerDay=0 o undefined son at-will.
   */
  managementMode: {
    type: "USES_PER_ENTITY",
    /**
     * Fórmula para calcular usos por día de una entidad
     * 
     * Si la invocación tiene usesPerDay definido, usa ese valor.
     * Si no, es at-will (ilimitado, representado como -1 o similar).
     * 
     * NOTA: Esta fórmula es un placeholder - la implementación real
     * debería leer el campo usesPerDay de la entidad.
     */
    usesPerDayFormula: {
      // Esta fórmula se evaluaría por entidad
      // En la práctica, el sistema leería entity.usesPerDay
      expression: "@entity.usesPerDay"
    }
  }
};

// ============================================================================
// Variante: Warlock con Puntos de Invocación
// ============================================================================

/**
 * Algunos homebrews usan un sistema de "puntos de invocación" en lugar
 * de usos por entidad. Esto sería más parecido a ALL_ACCESS con slots.
 * 
 * Ejemplo:
 * - El warlock tiene X puntos de invocación/día
 * - Least cuesta 1 punto
 * - Lesser cuesta 2 puntos
 * - Greater cuesta 3 puntos
 * - Dark cuesta 4 puntos
 * 
 * Este sería un modo de gestión diferente: RESOURCE_POOL
 * que actualmente no está implementado.
 */

// ============================================================================
// Exports
// ============================================================================

export {
  invocationSchema,
  INVOCATION_GRADES
};



