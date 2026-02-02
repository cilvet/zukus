/**
 * Types for EntityProvider UI components
 */

import type { Selector, FilterResult, Compendium } from '@zukus/core'
import type { StandardEntity, EntityInstance } from '@zukus/core'

export type EntitySelectorProps = {
  selector: Selector
  eligibleEntities: FilterResult<StandardEntity>[]
  selectedEntities: EntityInstance[]
  onSelect: (entityId: string) => void
  onDeselect: (instanceId: string) => void
  canSelectMore: boolean
  selectionCount: number
  minSelections: number
  maxSelections: number
  showCheckbox?: boolean
  onInfoPress?: (entity: StandardEntity) => void
}

export type EntityOptionRowProps = {
  entity: StandardEntity
  filterResult: FilterResult<StandardEntity>
  isSelected: boolean
  onToggle: (checked: boolean) => void
  disabled: boolean
  showEligibilityBadge: boolean
  showCheckbox?: boolean
  onInfoPress?: (entity: StandardEntity) => void
}

export type SelectedEntityRowProps = {
  entityInstance: EntityInstance
  onDeselect: () => void
  onInfoPress?: (entity: StandardEntity) => void
}

export type ValidationResult = {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export type CompendiumContextValue = {
  compendium: Compendium
  getEntity: (entityType: string, entityId: string) => StandardEntity | undefined
  getEntityById: (entityId: string) => StandardEntity | undefined
  getAllEntities: (entityType: string) => StandardEntity[]
  getAllEntitiesFromAllTypes: () => StandardEntity[]
}
