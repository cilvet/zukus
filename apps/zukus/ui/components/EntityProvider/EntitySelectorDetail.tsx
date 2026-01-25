/**
 * EntitySelectorDetail - Full screen view for selecting entities from a selector
 *
 * This is a route component that opens when the user clicks on a selector summary.
 * Shows the full list of eligible entities and allows selection/deselection.
 */

import { YStack, XStack, Text, ScrollView } from 'tamagui'
import { useCharacterStore, useCharacterBaseData } from '../../stores'
import { useNavigateToDetail } from '../../../navigation'
import { useProviderSelection } from './useProviderSelection'
import { EntityOptionRow } from './EntityOptionRow'
import { SelectedEntityRow } from './SelectedEntityRow'
import { getProvider } from '@zukus/core'
import type { ProviderLocation, StandardEntity } from '@zukus/core'
import { useCallback } from 'react'

export type EntitySelectorDetailProps = {
  providerLocation: ProviderLocation
  variables?: Record<string, number>
}

const emptyVariables: Record<string, number> = {}

export function EntitySelectorDetail({
  providerLocation,
  variables = emptyVariables,
}: EntitySelectorDetailProps) {
  const baseData = useCharacterBaseData()
  const { updater } = useCharacterStore()

  // Get the provider from character data
  const provider = baseData ? getProvider(baseData, providerLocation) : undefined

  const handleCharacterChange = useCallback(
    (newBaseData: typeof baseData) => {
      if (updater && newBaseData) {
        updater.updateCharacterBaseData(newBaseData)
      }
    },
    [updater]
  )

  if (!baseData) {
    return (
      <YStack padding={16} flex={1} justifyContent="center" alignItems="center">
        <Text fontSize={16} color="$placeholderColor">
          Cargando...
        </Text>
      </YStack>
    )
  }

  if (!provider) {
    return (
      <YStack padding={16} flex={1} justifyContent="center" alignItems="center">
        <Text fontSize={16} color="$placeholderColor">
          Provider no encontrado
        </Text>
      </YStack>
    )
  }

  if (!provider.selector) {
    return (
      <YStack padding={16} flex={1} justifyContent="center" alignItems="center">
        <Text fontSize={16} color="$placeholderColor">
          Este provider no tiene selector
        </Text>
      </YStack>
    )
  }

  return (
    <EntitySelectorContent
      provider={provider}
      providerLocation={providerLocation}
      character={baseData}
      onCharacterChange={handleCharacterChange}
      variables={variables}
    />
  )
}

// Separate component to use hooks after provider validation
type EntitySelectorContentProps = {
  provider: NonNullable<ReturnType<typeof getProvider>>
  providerLocation: ProviderLocation
  character: NonNullable<ReturnType<typeof useCharacterBaseData>>
  onCharacterChange: (character: NonNullable<ReturnType<typeof useCharacterBaseData>>) => void
  variables: Record<string, number>
}

function EntitySelectorContent({
  provider,
  providerLocation,
  character,
  onCharacterChange,
  variables,
}: EntitySelectorContentProps) {
  const navigateToDetail = useNavigateToDetail()

  const {
    selectedEntities,
    eligibleEntities,
    selectEntity,
    deselectEntity,
    selector,
    selectionCount,
    maxSelections,
    canSelectMore,
    validation,
  } = useProviderSelection({
    provider,
    providerLocation,
    character,
    onCharacterChange,
    variables,
  })

  if (!selector) {
    return null
  }

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

  // Only show checkbox when multiple selections are allowed
  const showCheckbox = maxSelections > 1

  const handleInfoPress = (entity: StandardEntity) => {
    navigateToDetail('customEntityDetail', entity.id, entity.name)
  }

  return (
    <ScrollView>
      <YStack padding={16} gap={16}>
        {/* Header */}
        <YStack gap={4}>
          <Text fontSize={22} fontWeight="700" color="$color">
            {selector.name}
          </Text>
          <XStack alignItems="center" gap={8}>
            <Text fontSize={14} color="$placeholderColor">
              Selecciona{' '}
              {selector.min === selector.max
                ? selector.max
                : `${selector.min}-${selector.max}`}{' '}
              opcion(es)
            </Text>
            <XStack
              backgroundColor={
                selectionCount >= selector.min ? '$green9' : '$yellow9'
              }
              paddingHorizontal={8}
              paddingVertical={2}
              borderRadius={12}
            >
              <Text fontSize={12} color="white" fontWeight="600">
                {selectionCount}/{maxSelections}
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Validation errors */}
        {!validation.isValid && validation.errors.length > 0 && (
          <YStack backgroundColor="$red3" padding={12} borderRadius={8}>
            {validation.errors.map((error, index) => (
              <Text key={index} fontSize={13} color="$red11">
                {error}
              </Text>
            ))}
          </YStack>
        )}

        {/* Selected entities section */}
        {selectedEntities.length > 0 && (
          <YStack gap={8}>
            <Text fontSize={14} fontWeight="600" color="$placeholderColor">
              Seleccionados
            </Text>
            <YStack gap={4}>
              {selectedEntities.map((instance) => (
                <SelectedEntityRow
                  key={instance.instanceId}
                  entityInstance={instance}
                  onDeselect={() => deselectEntity(instance.instanceId)}
                  onInfoPress={handleInfoPress}
                />
              ))}
            </YStack>
          </YStack>
        )}

        {/* Available options section */}
        {availableOptions.length > 0 && (
          <YStack gap={8}>
            <Text fontSize={14} fontWeight="600" color="$placeholderColor">
              Opciones disponibles
            </Text>
            <YStack gap={4}>
              {availableOptions.map((filterResult) => (
                <EntityOptionRow
                  key={filterResult.entity.id}
                  entity={filterResult.entity}
                  filterResult={filterResult}
                  isSelected={false}
                  onToggle={(checked) => {
                    if (checked) {
                      selectEntity(filterResult.entity.id)
                    }
                  }}
                  disabled={!canSelectMore || !filterResult.matches}
                  showEligibilityBadge={
                    hasIneligibleOptions && !filterResult.matches
                  }
                  showCheckbox={showCheckbox}
                  onInfoPress={handleInfoPress}
                />
              ))}
            </YStack>
          </YStack>
        )}

        {/* Empty state */}
        {availableOptions.length === 0 && selectedEntities.length === 0 && (
          <YStack padding={24} alignItems="center">
            <Text fontSize={14} color="$placeholderColor" textAlign="center">
              No hay opciones disponibles
            </Text>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
