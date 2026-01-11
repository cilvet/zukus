/**
 * EntityManagementState - Estado de Gestión de Entidades
 * 
 * Contiene el estado MUTABLE del jugador para un CGE específico.
 * Este es el estado que cambia durante el juego:
 * - Qué entidades ha aprendido/añadido al libro
 * - Qué ha preparado hoy
 * - Cuántos slots/usos ha gastado
 * 
 * Se serializa en el save game.
 * Se resetea parcialmente en cada descanso (slots, preparación).
 * Se reconcilia cuando cambia la configuración o acceso.
 */

// ============================================================================
// Consumo de recursos
// ============================================================================

/**
 * Estado de slots por nivel
 */
export type SlotsByLevelState = {
  [level: number]: {
    /**
     * Slots usados de este nivel
     * (max viene de la variable referenciada en el config)
     */
    used: number;
  };
};

/**
 * Usos consumidos por entidad individual
 */
export type UsesPerEntityState = {
  [entityId: string]: {
    /**
     * Usos consumidos hoy de esta entidad
     * (max viene de la variable referenciada en el config)
     */
    used: number;
  };
};

// ============================================================================
// Entidades conocidas/preparadas
// ============================================================================

/**
 * Entidad marcada como "ya no elegible"
 * Ocurre cuando una entidad que estaba en el libro/conocidos/preparados
 * deja de estar en la lista accesible (por cambio de filtros, nivel, etc.)
 */
export type IneligibleEntity = {
  entityId: string;
  /**
   * Razones por las que ya no es elegible
   */
  reasons: string[];
  /**
   * Dónde estaba (para saber qué hacer)
   */
  wasIn: 'known' | 'prepared';
};

/**
 * Lista de entidades conocidas/en el libro
 * Para modos que requieren "aprender" entidades (hechicero, libro de mago)
 */
export type KnownEntitiesState = {
  /**
   * IDs de entidades conocidas
   */
  entityIds: string[];
  /**
   * Entidades que solían estar aquí pero ya no son elegibles
   */
  ineligible: IneligibleEntity[];
};

/**
 * Entidades preparadas por nivel
 * Para modo PREPARED_BY_LEVEL
 */
export type PreparedByLevelState = {
  [level: number]: string[]; // Array de entityIds preparados en este nivel
  /**
   * Entidades que solían estar preparadas pero ya no son elegibles
   */
  ineligible: IneligibleEntity[];
};

/**
 * Entidades preparadas globalmente
 * Para modo GLOBAL_PREPARED
 */
export type GlobalPreparedState = {
  /**
   * IDs de entidades preparadas hoy globalmente
   */
  entityIds: string[];
  /**
   * Entidades que solían estar preparadas pero ya no son elegibles
   */
  ineligible: IneligibleEntity[];
};

// ============================================================================
// Estado completo por modo de gestión
// ============================================================================

type UsesPerEntityModeState = {
  type: "USES_PER_ENTITY";
  usesConsumed: UsesPerEntityState;
};

type PreparedByLevelModeState = {
  type: "PREPARED_BY_LEVEL";
  slotsUsed: SlotsByLevelState;
  prepared: PreparedByLevelState;
};

type SpontaneousModeState = {
  type: "SPONTANEOUS";
  known: KnownEntitiesState;
  slotsUsed: SlotsByLevelState;
};

type GlobalPreparedModeState = {
  type: "GLOBAL_PREPARED";
  prepared: GlobalPreparedState;
  slotsUsed: SlotsByLevelState;
};

type AllAccessModeState = {
  type: "ALL_ACCESS";
  slotsUsed?: SlotsByLevelState;
  usesConsumed?: UsesPerEntityState;
};

type ManagementModeState =
  | UsesPerEntityModeState
  | PreparedByLevelModeState
  | SpontaneousModeState
  | GlobalPreparedModeState
  | AllAccessModeState;

// ============================================================================
// Estado completo de gestión de entidades
// ============================================================================

/**
 * Estado completo de un CGE
 * Se relaciona 1:1 con un EntityManagementConfig mediante el configId
 */
export type EntityManagementState = {
  /**
   * ID del config al que pertenece este estado
   */
  configId: string;
  
  /**
   * Para modo BOOK: lista de entidades en el libro
   * (En otros modos de acceso esto está vacío o no se usa)
   */
  bookEntities?: KnownEntitiesState;
  
  /**
   * Estado específico del modo de gestión
   */
  modeState: ManagementModeState;
  
  /**
   * Timestamp del último reset diario (para tracking)
   */
  lastReset?: number;
};

// ============================================================================
// Operaciones de reset
// ============================================================================

/**
 * Qué resetear en un descanso diario
 */
export type DailyResetPolicy = {
  /**
   * Reponer todos los slots a max
   */
  resetSlots: boolean;
  
  /**
   * Reponer todos los usos por entidad
   */
  resetUses: boolean;
  
  /**
   * Vaciar la preparación (fuerza re-preparar)
   */
  clearPrepared: boolean;
  
  /**
   * Vaciar los conocidos (poco común, pero posible)
   */
  clearKnown: boolean;
};

/**
 * Helper: política de reset típica por modo
 */
export function getDefaultResetPolicy(modeType: ManagementModeState['type']): DailyResetPolicy {
  switch (modeType) {
    case 'USES_PER_ENTITY':
      return {
        resetSlots: false,
        resetUses: true,
        clearPrepared: false,
        clearKnown: false
      };
    
    case 'PREPARED_BY_LEVEL':
      return {
        resetSlots: true,
        resetUses: false,
        clearPrepared: true, // Debe re-preparar cada día
        clearKnown: false
      };
    
    case 'SPONTANEOUS':
      return {
        resetSlots: true,
        resetUses: false,
        clearPrepared: false,
        clearKnown: false // Los conocidos no se resetean
      };
    
    case 'GLOBAL_PREPARED':
      return {
        resetSlots: true,
        resetUses: false,
        clearPrepared: true, // Debe re-preparar cada día
        clearKnown: false
      };
    
    case 'ALL_ACCESS':
      return {
        resetSlots: true,
        resetUses: true,
        clearPrepared: false,
        clearKnown: false
      };
  }
}

