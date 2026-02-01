/**
 * CGE - Configuracion de Gestion de Entidades
 *
 * Sistema que configura como los personajes interactuan con entidades
 * accionables (conjuros, maniobras, poderes, invocaciones, etc.)
 */

// Usar el sistema de filtros real de levels/filtering
import type { EntityFilter as EntityFilterType } from '../levels/filtering/types';
export type { EntityFilter } from '../levels/filtering/types';

// Reutilizar tipos del sistema existente
import type { Formula } from '../formulae/formula';
import type { ResourceDefinitionChange } from '../character/baseData/specialChanges';
export type { Formula } from '../formulae/formula';

// Alias for internal use
type EntityFilter = EntityFilterType;

/**
 * Tabla de progresion por nivel de clase.
 * Cada entrada mapea nivel de clase a un array de valores por nivel de entidad.
 *
 * @example
 * // Sorcerer slots: nivel clase 1 tiene 5 cantrips y 3 slots nivel 1
 * { 1: [5, 3, 0, 0, 0, 0, 0, 0, 0, 0] }
 */
export type LevelTable = {
  [classLevel: number]: number[] // indice = nivel de entidad
}

export type RefreshType = 'daily' | 'encounter' | 'manual' | 'never'

// ============================================================================
// KNOWN CONFIG
// ============================================================================

/**
 * Configuracion del pool de entidades conocidas.
 * Si no se especifica en el CGE, la clase accede directamente a la lista filtrada.
 */
export type KnownConfig =
  | {
      type: 'UNLIMITED' // Libro sin limite (Wizard)
    }
  | {
      type: 'LIMITED_PER_ENTITY_LEVEL' // Conocidos por nivel de entidad (Sorcerer)
      table: LevelTable // array[10]: [cantrips, nivel1, nivel2, ...]
    }
  | {
      type: 'LIMITED_TOTAL' // Total conocidos de cualquier nivel (Warblade, Warlock)
      table?: LevelTable // array[1]: [total] por nivel de clase
      formula?: Formula // O formula directa
    }

// ============================================================================
// RESOURCE CONFIG
// ============================================================================

export type ResourceConfigNone = {
  type: 'NONE' // At-will (Warlock)
}

export type ResourceConfigSlots = {
  type: 'SLOTS'
  table: LevelTable
  bonusVariable?: string // "@bonusSpells" -> se expande a .level.{n}
  refresh: RefreshType
}

export type ResourceConfigPool = {
  type: 'POOL'
  resourceId: string // ID del recurso definido en CGEConfig.resources
  costPath?: string // "@entity.level" (default) - como calcular coste
  refresh: RefreshType
}

export type ResourceConfig =
  | ResourceConfigNone
  | ResourceConfigSlots
  | ResourceConfigPool

// ============================================================================
// PREPARATION CONFIG
// ============================================================================

export type PreparationConfigNone = {
  type: 'NONE' // Sin preparacion (Sorcerer, Warlock, Psion)
}

export type PreparationConfigBound = {
  type: 'BOUND' // Prepara en slots (Wizard 3.5, Cleric)
  // maxPrepared implicito = slots disponibles
}

export type PreparationConfigList = {
  type: 'LIST' // Prepara lista independiente

  /**
   * Como se estructura la preparacion:
   * - GLOBAL: lista unica sin separar por nivel (Wizard 5e)
   * - PER_LEVEL: preparados separados por nivel de entidad (Arcanist)
   */
  structure: 'GLOBAL' | 'PER_LEVEL'

  /**
   * Si structure = GLOBAL: formula para total de preparados
   * @example { expression: "@class.wizard.level + @ability.intelligence.modifier" }
   */
  maxFormula?: Formula

  /**
   * Si structure = PER_LEVEL: tabla de preparados por nivel
   * @example { 1: [0, 2, 0, ...], 2: [0, 3, 1, ...] }
   */
  maxPerLevel?: LevelTable

  consumeOnUse: boolean // true=ToB (cada uso gasta), false=Arcanist (lista persiste)
  recovery?: RefreshType // Solo si consumeOnUse=true
}

export type PreparationConfig =
  | PreparationConfigNone
  | PreparationConfigBound
  | PreparationConfigList

// ============================================================================
// TRACK
// ============================================================================

/**
 * Un track representa una "pista" independiente de preparacion/uso.
 * La mayoria de clases tienen 1 track, pero Cleric tiene 2 (base + dominios).
 */
export type Track = {
  id: string
  label?: string // Clave de traduccion: "domain_slots"
  filter?: EntityFilter // Filtro adicional (ej: solo conjuros de dominios)

  resource: ResourceConfig
  preparation: PreparationConfig
}

// ============================================================================
// VARIABLES CONFIG
// ============================================================================

export type VariablesConfig = {
  /**
   * Prefijo para variables especificas de clase.
   * Genera: @{classPrefix}.slot.{level}.max, etc.
   * @example "wizard.spell" -> @wizard.spell.slot.1.max
   */
  classPrefix: string

  /**
   * Prefijo para variables genericas (compartidas entre clases).
   * Permite que efectos como "+1 slot nivel 3" afecten a cualquier caster.
   * @example "spell" -> @spell.slot.1.max
   */
  genericPrefix: string

  /**
   * Variable de nivel de lanzador para esta clase.
   * Permite que PrCs modifiquen el nivel de lanzador.
   * @example "castingClassLevel.wizard"
   */
  casterLevelVar: string
}

// ============================================================================
// LABELS
// ============================================================================

/**
 * Labels traducibles para la UI.
 * Se proporcionan defaults basados en entityType si no se especifican.
 */
export type CGELabels = {
  known: string // "spellbook", "known_powers", "known_maneuvers"
  prepared: string // "prepared_spells", "readied_maneuvers"
  slot: string // "spell_slot" (se anade nivel en UI)
  pool: string // "power_points"
  action: string // "cast", "manifest", "initiate"
}

// ============================================================================
// CGE CONFIG
// ============================================================================

export type CGEConfig = {
  // --- Identificacion ---
  id: string
  classId: string
  entityType: string // "spell" | "power" | "maneuver" | "invocation"

  // --- Resolucion de nivel ---
  /**
   * Path para obtener el nivel de una entidad para esta clase.
   * @example "@entity.level" (5e donde el nivel es unico)
   * @example "@entity.levels.wizard" (3.5 donde varia por clase)
   */
  levelPath: string

  // --- Acceso ---
  /**
   * Filtro sobre lista de entidades.
   * Es no estricto y editable por el usuario (filosofia de la app).
   */
  accessFilter?: EntityFilter

  // --- Recursos ---
  /**
   * Recursos definidos por este CGE.
   * Usa el mismo sistema de RESOURCE_DEFINITION existente.
   * Los tracks con resource.type === 'POOL' referencian estos recursos por resourceId.
   */
  resources?: Omit<ResourceDefinitionChange, 'type'>[]

  // --- Conocidos ---
  /**
   * Configuracion del pool de conocidos.
   * Si no existe, la clase accede directamente a la lista filtrada (Cleric, Druid).
   */
  known?: KnownConfig

  // --- Tracks ---
  /**
   * Tracks de uso. Normalmente 1, pero puede haber varios (Cleric: base + dominios).
   */
  tracks: Track[]

  // --- Variables expuestas ---
  variables: VariablesConfig

  // --- Labels ---
  labels?: Partial<CGELabels>
}

// ============================================================================
// CGE STATE (datos persistidos en CharacterBaseData)
// ============================================================================

/**
 * Estado persistido de un CGE en el personaje.
 * Similar a selectedInstanceIds del sistema de niveles.
 */
export type CGEState = {
  /**
   * Entidades conocidas seleccionadas, indexadas por nivel de entidad.
   * Para Sorcerer: { "0": ["prestidigitation", "detect-magic"], "1": ["magic-missile"] }
   */
  knownSelections?: Record<string, string[]>

  /**
   * Valores actuales de slots por nivel (para recursos tipo SLOTS).
   * { "0": 5, "1": 2 } significa 5 cantrips disponibles, 2 slots nivel 1
   */
  slotCurrentValues?: Record<string, number>

  /**
   * Valor actual del pool (para recursos tipo POOL).
   */
  poolCurrentValue?: number

  /**
   * Para preparacion BOUND: mapeo slot -> entityId.
   * { "slot-1-0": "fireball", "slot-1-1": "magic-missile" }
   */
  boundPreparations?: Record<string, string>

  /**
   * Para preparacion LIST: entidades preparadas por nivel.
   * Similar a knownSelections pero para preparados.
   */
  listPreparations?: Record<string, string[]>

  /**
   * Para preparacion BOUND: slots que ya han sido usados (lanzados).
   * { "base:1-0": true } significa que el slot 0 de nivel 1 del track base ya se uso.
   * Se limpia con refreshSlots (descanso).
   */
  usedBoundSlots?: Record<string, boolean>
}

// ============================================================================
// CALCULATED CGE (resultado en CharacterSheet)
// ============================================================================

/**
 * Slot individual calculado para preparacion BOUND.
 * Representa un slot especifico en el que se puede preparar una entidad.
 */
export type CalculatedBoundSlot = {
  slotId: string // "base:1-0", "base:1-1", "domain:2-0", etc.
  level: number
  index: number
  preparedEntityId?: string // ID de la entidad preparada, si hay
  used?: boolean // true si el slot ya fue usado (lanzado)
}

/**
 * Slot calculado para un nivel de entidad.
 */
export type CalculatedSlot = {
  level: number
  max: number
  current: number
  bonus: number // Bonus de atributo u otros efectos
  /**
   * Para preparacion BOUND: slots individuales con sus preparaciones.
   * Solo presente cuando el track tiene preparation.type === 'BOUND'
   */
  boundSlots?: CalculatedBoundSlot[]
}

/**
 * Limite de conocidos calculado para un nivel de entidad.
 */
export type CalculatedKnownLimit = {
  level: number
  max: number
  current: number // Cuantos tiene seleccionados actualmente
}

/**
 * Pool calculado (para recursos tipo POOL).
 */
export type CalculatedPool = {
  max: number
  current: number
}

/**
 * Track calculado con sus recursos resueltos.
 */
export type CalculatedTrack = {
  id: string
  label?: string
  resourceType: 'NONE' | 'SLOTS' | 'POOL'
  slots?: CalculatedSlot[] // Si resourceType === 'SLOTS'
  pool?: CalculatedPool // Si resourceType === 'POOL'
  preparationType: 'NONE' | 'BOUND' | 'LIST'
}

/**
 * CGE completamente calculado para el character sheet.
 */
export type CalculatedCGE = {
  id: string
  classId: string
  entityType: string
  classLevel: number // Nivel actual en la clase

  /** Limites de conocidos por nivel (si aplica) */
  knownLimits?: CalculatedKnownLimit[]

  /** Tracks calculados */
  tracks: CalculatedTrack[]

  /** Config original (para referencia) */
  config: CGEConfig
}

// ============================================================================
// VALIDACIONES
// ============================================================================

/**
 * Valida que un CGEConfig sea coherente.
 * - BOUND requiere SLOTS
 * - NONE + BOUND es invalido
 * - consumeOnUse sin recovery es warning
 * - LIST requiere maxFormula (GLOBAL) o maxPerLevel (PER_LEVEL)
 */
export function validateCGEConfig(config: CGEConfig): string[] {
  const errors: string[] = []

  for (const track of config.tracks) {
    // BOUND requiere SLOTS
    if (
      track.preparation.type === 'BOUND' &&
      track.resource.type !== 'SLOTS'
    ) {
      errors.push(
        `Track "${track.id}": preparation BOUND requiere resource SLOTS`
      )
    }

    // Validaciones para LIST
    if (track.preparation.type === 'LIST') {
      // consumeOnUse deberia tener recovery
      if (track.preparation.consumeOnUse && !track.preparation.recovery) {
        errors.push(
          `Track "${track.id}": consumeOnUse=true sin recovery definido`
        )
      }

      // GLOBAL requiere maxFormula
      if (
        track.preparation.structure === 'GLOBAL' &&
        !track.preparation.maxFormula
      ) {
        errors.push(
          `Track "${track.id}": structure GLOBAL requiere maxFormula`
        )
      }

      // PER_LEVEL requiere maxPerLevel
      if (
        track.preparation.structure === 'PER_LEVEL' &&
        !track.preparation.maxPerLevel
      ) {
        errors.push(
          `Track "${track.id}": structure PER_LEVEL requiere maxPerLevel`
        )
      }
    }
  }

  return errors
}
