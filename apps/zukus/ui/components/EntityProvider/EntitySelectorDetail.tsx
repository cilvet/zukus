/**
 * EntitySelectorDetail - Full screen view for selecting entities from a selector
 *
 * This is a route component that opens when the user clicks on a selector summary.
 * Delegates rendering to the unified EntitySelectionView.
 */

import { YStack, Text } from 'tamagui'
import { useCharacterStore, useCharacterBaseData } from '../../stores'
import { useNavigateToDetail } from '../../../navigation'
import { useProviderSelection } from './useProviderSelection'
import { getProvider, getLocalizedEntity, type LocalizationContext } from '@zukus/core'
import type { ProviderLocation, StandardEntity } from '@zukus/core'
import { useActiveLocale } from '../../stores/translationStore'
import { EntitySelectionView } from '../../../components/entitySelection'

export type EntitySelectorDetailProps = {
  providerLocation: ProviderLocation
  variables?: Record<string, number>
}

const emptyVariables: Record<string, number> = {}

export function EntitySelectorDetail({
  providerLocation,
  variables = emptyVariables,
}: EntitySelectorDetailProps) {
  'use no memo'

  const baseData = useCharacterBaseData()
  const { updater } = useCharacterStore()

  // Get the provider from character data
  const provider = baseData ? getProvider(baseData, providerLocation) : undefined

  const handleCharacterChange = (newBaseData: typeof baseData) => {
    if (updater && newBaseData) {
      updater.updateCharacterBaseData(newBaseData)
    }
  }

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
  const locale = useActiveLocale()

  const {
    selectedEntities,
    eligibleEntities,
    selectEntity,
    deselectEntity,
    selector,
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

  const entities = eligibleEntities.map((fr) => fr.entity)

  const handleEntityPress = (entity: StandardEntity) => {
    const ctx: LocalizationContext = { locale, compendiumLocale: 'en' }
    const localized = getLocalizedEntity(entity, ctx)
    navigateToDetail('customEntityDetail', entity.id, localized.name)
  }

  return (
    <EntitySelectionView
      entities={entities}
      modeConfig={{
        mode: 'selection',
        selectedEntities,
        eligibleEntities,
        onSelect: selectEntity,
        onDeselect: deselectEntity,
        min: selector.min,
        max: selector.max,
        selectionLabel: selector.name,
      }}
      onEntityPress={handleEntityPress}
      emptyText="No hay opciones disponibles"
      resultLabelSingular="opcion"
      resultLabelPlural="opciones"
    />
  )
}
