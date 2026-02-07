/**
 * EntitySelectionView Types
 *
 * Unified type system for entity selection across all modes:
 * - dropdown: inventory-style with grouped action menu
 * - counter: CGE-style with progress bar
 * - selection: provider-style with checkbox/chip selection
 */

import type { ReactNode } from 'react'
import type {
  StandardEntity,
  EntityInstance,
  FilterResult,
  EntityFilterConfig,
  FilterState,
} from '@zukus/core'
import type {
  ActionGroup,
  ActionDefinition,
  ActionHandlers,
  CounterHandlers,
} from '../entityBrowser/types'

// ============================================================================
// Mode Configurations
// ============================================================================

export type DropdownModeConfig = {
  mode: 'dropdown'
  buttonLabel: string
  buttonIcon?: string
  groups: ActionGroup[]
  handlers: ActionHandlers
}

export type CounterModeConfig = {
  mode: 'counter'
  action: ActionDefinition
  handlers: CounterHandlers
  closeOnComplete?: boolean
}

export type SelectionModeConfig = {
  mode: 'selection'
  selectedEntities: EntityInstance[]
  eligibleEntities: FilterResult<StandardEntity>[]
  onSelect: (entityId: string) => void
  onDeselect: (instanceId: string) => void
  min: number
  max: number
  selectionLabel?: string
}

export type ModeConfig = DropdownModeConfig | CounterModeConfig | SelectionModeConfig

// ============================================================================
// Component Props
// ============================================================================

export type EntitySelectionViewProps<T extends StandardEntity> = {
  /** All entities to display */
  entities: T[]
  /** Mode configuration (dropdown, counter, or selection) */
  modeConfig: ModeConfig
  /** Called when entity row is pressed (navigate to detail) */
  onEntityPress: (entity: T) => void
  /** Filter configuration (enables filter UI) */
  filterConfig?: EntityFilterConfig
  /** Initial filter state overrides */
  initialFilterOverrides?: Partial<FilterState>
  /** Custom filter function (applied after config-based filters) */
  customFilter?: (entities: T[], filterState: FilterState) => T[]
  /** Render metadata line for each entity */
  getMetaLine?: (entity: T) => string | undefined
  /** Render badge for each entity */
  getBadge?: (entity: T) => string | null
  /** Search placeholder text */
  searchPlaceholder?: string
  /** Empty state text (no search active) */
  emptyText?: string
  /** Empty state text (search active but no results) */
  emptySearchText?: string
  /** Results count label (singular) */
  resultLabelSingular?: string
  /** Results count label (plural) */
  resultLabelPlural?: string
  /** Optional context content shown in filter view */
  filterContextContent?: ReactNode
}

// ============================================================================
// Type Guards
// ============================================================================

export function isDropdownMode(config: ModeConfig): config is DropdownModeConfig {
  return config.mode === 'dropdown'
}

export function isCounterMode(config: ModeConfig): config is CounterModeConfig {
  return config.mode === 'counter'
}

export function isSelectionMode(config: ModeConfig): config is SelectionModeConfig {
  return config.mode === 'selection'
}
