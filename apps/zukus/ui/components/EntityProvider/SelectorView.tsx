/**
 * SelectorView - Displays a selector where users can pick entities
 *
 * Shows:
 * - Header with selector name and selection count
 * - Already selected entities (with deselect option)
 * - Eligible entities to select (with eligibility status)
 */

import { YStack, XStack, Text } from 'tamagui'
import type { Selector, FilterResult, StandardEntity, EntityInstance } from '@zukus/core'
import type { ValidationResult } from './types'
import { EntityOptionRow } from './EntityOptionRow'
import { SelectedEntityRow } from './SelectedEntityRow'

export type SelectorViewProps = {
  selector: Selector
  eligibleEntities: FilterResult<StandardEntity>[]
  selectedEntities: EntityInstance[]
  onSelect: (entityId: string) => void
  onDeselect: (instanceId: string) => void
  canSelectMore: boolean
  selectionCount: number
  minSelections: number
  maxSelections: number
  validation: ValidationResult
  showCheckbox?: boolean
  onInfoPress?: (entity: StandardEntity) => void
}

export function SelectorView({
  selector,
  eligibleEntities,
  selectedEntities,
  onSelect,
  onDeselect,
  canSelectMore,
  selectionCount,
  maxSelections,
  validation,
  showCheckbox = true,
  onInfoPress,
}: SelectorViewProps) {
  // Get IDs of already selected entities to filter them from options
  const selectedEntityIds = new Set(
    selectedEntities.map((instance) => instance.entity.id)
  )

  // Filter out already selected entities from eligible list
  const availableOptions = eligibleEntities.filter(
    (result) => !selectedEntityIds.has(result.entity.id)
  )

  // Determine if we should show eligibility badges (permissive filter policy)
  const hasIneligibleOptions = availableOptions.some((result) => !result.matches)

  return (
    <YStack width="100%" gap={8}>
      {/* Header */}
      <XStack
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal={8}
      >
        <Text fontSize={14} fontWeight="600" color="$color">
          {selector.name}
        </Text>
        <Text fontSize={12} color="$placeholderColor">
          ({selectionCount}/{maxSelections})
        </Text>
      </XStack>

      {/* Validation errors */}
      {!validation.isValid && validation.errors.length > 0 && (
        <YStack paddingHorizontal={8}>
          {validation.errors.map((error, index) => (
            <Text key={index} fontSize={12} color="$red10">
              {error}
            </Text>
          ))}
        </YStack>
      )}

      {/* Selected entities */}
      {selectedEntities.length > 0 && (
        <YStack width="100%" gap={4}>
          {selectedEntities.map((instance) => (
            <SelectedEntityRow
              key={instance.instanceId}
              entityInstance={instance}
              onDeselect={() => onDeselect(instance.instanceId)}
              onInfoPress={onInfoPress}
            />
          ))}
        </YStack>
      )}

      {/* Available options */}
      {availableOptions.length > 0 && (
        <YStack width="100%" gap={4}>
          {availableOptions.map((filterResult) => (
            <EntityOptionRow
              key={filterResult.entity.id}
              entity={filterResult.entity}
              filterResult={filterResult}
              isSelected={false}
              onToggle={(checked) => {
                if (checked) {
                  onSelect(filterResult.entity.id)
                }
              }}
              disabled={!canSelectMore || !filterResult.matches}
              showEligibilityBadge={hasIneligibleOptions && !filterResult.matches}
              showCheckbox={showCheckbox}
              onInfoPress={onInfoPress}
            />
          ))}
        </YStack>
      )}

      {/* Empty state */}
      {availableOptions.length === 0 && selectedEntities.length === 0 && (
        <YStack paddingHorizontal={8} paddingVertical={12}>
          <Text fontSize={12} color="$placeholderColor" textAlign="center">
            No hay opciones disponibles
          </Text>
        </YStack>
      )}
    </YStack>
  )
}
