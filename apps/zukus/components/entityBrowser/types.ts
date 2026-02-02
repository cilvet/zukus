/**
 * Entity Browser Types
 *
 * Sistema de acciones configurables para navegadores de entidades.
 * Permite diferentes comportamientos según el contexto (inventario vs CGE).
 */

// ============================================================================
// Action Definitions
// ============================================================================

export type ActionDefinition = {
  id: string
  label: string
  icon?: string
}

export type ActionGroup = {
  label?: string
  actions: ActionDefinition[]
}

// ============================================================================
// Button Configurations
// ============================================================================

/**
 * Dropdown button: shows a menu with grouped actions.
 * Used for inventory (Add free / Buy options).
 */
export type DropdownButtonConfig = {
  type: 'dropdown'
  label: string
  icon?: string
  groups: ActionGroup[]
}

/**
 * Counter button: executes action directly with progress tracking.
 * Used for CGE (Prepare spells with slot counter).
 */
export type CounterButtonConfig = {
  type: 'counter'
  action: ActionDefinition
  closeOnComplete?: boolean
}

export type ButtonConfig = DropdownButtonConfig | CounterButtonConfig

// ============================================================================
// Action Results and State
// ============================================================================

export type ActionResult = {
  success: boolean
  /** Whether to close the panel after action. Default: false */
  shouldClose?: boolean
  /** Toast message to show (e.g., "Added Longsword") */
  toastMessage?: string
}

export type ActionState = {
  /** Subtext shown under the action (e.g., price) */
  subtext?: string | null
  /** Whether action is disabled */
  disabled?: boolean
  /** Whether action is hidden */
  hidden?: boolean
}

// ============================================================================
// Action Handlers
// ============================================================================

export type ActionHandlers = {
  /** Execute an action for an entity */
  onExecute: (actionId: string, entityId: string) => ActionResult
  /** Get dynamic state for an action (subtext, disabled, etc.) */
  getActionState?: (actionId: string, entityId: string) => ActionState
}

export type CounterHandlers = ActionHandlers & {
  /** Get current progress for counter bar */
  getProgress: () => { current: number; max: number }
  /** Get label for progress bar (e.g., "3 of 5 prepared") */
  getProgressLabel: () => string
  /** Called when user presses OK after completing all slots */
  onComplete?: () => void
}

// ============================================================================
// Type Guards
// ============================================================================

export function isDropdownConfig(config: ButtonConfig): config is DropdownButtonConfig {
  return config.type === 'dropdown'
}

export function isCounterConfig(config: ButtonConfig): config is CounterButtonConfig {
  return config.type === 'counter'
}

export function isCounterHandlers(handlers: ActionHandlers): handlers is CounterHandlers {
  return 'getProgress' in handlers && 'getProgressLabel' in handlers
}
